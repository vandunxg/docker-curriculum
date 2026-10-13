---
title: BuildKit và Build đa nền tảng
---

Docker Desktop và Docker Engine hiện đại sử dụng **[BuildKit](https://docs.docker.com/build/buildkit/)** làm build engine mặc định. BuildKit là một cuộc đại tu hoàn chỉnh cho hệ thống build của Docker, được thiết kế để nhanh hơn, hiệu quả hơn và có nhiều tính năng hơn.

### Tại sao là BuildKit?

So với cách build Docker legacy, BuildKit cung cấp sẵn các tính năng mạnh mẽ:

* **Thực thi song song**: Các build stage độc lập được thực thi đồng thời.
* **Caching layer thông minh**: Các build step không được sử dụng sẽ tự động bị bỏ qua.
* **Các kiểu mount nâng cao**: Mount các thư mục cache (`--mount=type=cache`) hoặc secret key (`--mount=type=secret`) mà không ghi chúng vào các image layer.

### Cache package nhanh với `--mount=type=cache`

Khi build Docker image cho Python, Node.js hoặc Rust, `pip install` hoặc `npm install` thường tải lại package nếu dependencies thay đổi. Với cache mount của BuildKit, bạn có thể duy trì package cache giữa các lần build:

```dockerfile
# Syntax directive enabling BuildKit features
# syntax=docker/dockerfile:1

FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .

# Mount the pip cache directory across container builds
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

COPY . .
```

Ngay cả khi `requirements.txt` thay đổi một chút, `pip` cũng không cần tải lại các package không thay đổi từ PyPI vì thư mục cache vẫn được duy trì qua các lần build trên máy của bạn!

---

### Vấn đề: Mac (ARM64) và cloud server (AMD64)

Nếu bạn viết code trên Mac dùng Apple Silicon (M1/M2/M3/M4), máy tính của bạn chạy trên kiến trúc CPU **ARM64**. Tuy nhiên, các cloud server tiêu chuẩn (như instance AWS EC2 tiêu chuẩn, DigitalOcean Droplet hoặc VM GCP Compute Engine) chạy trên CPU **AMD64 / x86_64**.

Nếu bạn build image cục bộ trên Mac dùng Apple Silicon rồi push trực tiếp lên Docker Hub mà không chỉ định kiến trúc đích, một Linux x86 EC2 server tiêu chuẩn khi pull image sẽ crash với lỗi không rõ ràng do không khớp kiến trúc CPU:

```text
exec /usr/local/bin/python: exec format error
```

Điều này xảy ra vì Linux OS trên EC2 server không thể thực thi các instruction binary được biên dịch cho bộ xử lý ARM.

---

### Giải pháp 1: Cross-build từ Mac cho AWS EC2

Với developer làm việc độc lập hoặc các bài test staging nhanh, **`docker buildx`** giải quyết vấn đề này bằng cách cho phép build đa nền tảng ngay trên Mac.

#### Bước 1: Tạo Multi-Platform Builder

`buildx` được tích hợp sẵn trong Docker Desktop. Hãy tạo một builder instance hỗ trợ cross-compilation thông qua QEMU:

```bash
$ docker buildx create --name mybuilder --use
$ docker buildx inspect --bootstrap
```

#### Bước 2: Build cho kiến trúc cloud đích (`linux/amd64`)

Khi build image trên Mac để triển khai lên một AWS EC2 instance tiêu chuẩn, hãy yêu cầu `buildx` nhắm đến `linux/amd64` và push image lên **Container Registry** (như Docker Hub hoặc AWS Elastic Container Registry):

```bash
$ docker buildx build --platform linux/amd64 -t yourusername/catnip:v1 --push .
```

#### Bước 3: Pull và chạy trên EC2

Bây giờ, hãy SSH vào AWS EC2 instance và pull image:

```bash
$ docker run -d -p 80:5000 yourusername/catnip:v1
```

Vì bạn đã chỉ định rõ `linux/amd64`, container sẽ chạy trơn tru trên EC2 instance!

---

### Manifest list đa nền tảng

Nếu muốn một image tag duy nhất (như `yourusername/catnip:v2`) chạy được trên cả Mac dùng Apple Silicon và Linux x86 EC2 server mà không cần các tag riêng thì sao?

Bạn có thể build đồng thời cho nhiều kiến trúc:

```bash
$ docker buildx build --platform linux/amd64,linux/arm64 -t yourusername/catnip:v2 --push .
```

Khi bạn push một image đa nền tảng lên Container Registry, Docker sẽ upload một **manifest list**. Khi một máy pull `yourusername/catnip:v2`, Docker tự động kiểm tra kiến trúc CPU của máy rồi tải xuống binary slice tương ứng:

```text
               ┌──> linux/amd64 (Cloud EC2 / Intel)
yourusername/catnip:v2 (Manifest List)
               └──> linux/arm64 (Apple Silicon)
```

---

### Các tổ chức engineering thực hiện việc này trong production như thế nào

Mặc dù build image đa nền tảng cục bộ phù hợp với các project cá nhân, **các tổ chức engineering không bao giờ build production image trên laptop của developer**.

Đây là cách các workflow production hiện đại vận hành:

```text
┌─────────────────┐       git push       ┌──────────────────────┐
│ Developer Laptop│ ───────────────────> │ GitHub / GitLab Repo │
└─────────────────┘                      └──────────┬───────────┘
                                                    │ Triggers
                                                    ▼
┌─────────────────┐    Pushes Image      ┌──────────────────────┐
│  Container Reg. │ <─────────────────── │ CI/CD Cloud Runner   │
│ (AWS ECR/GHCR)  │                      │(GitHub Actions/Build)│
└────────┬────────┘                      └──────────────────────┘
         │ Pulls Image
         ▼
┌─────────────────┐
│ Target Cloud Host│
│ (AWS ECS / EC2) │
└─────────────────┘
```

1. **Trigger từ source control**: Developer viết code cục bộ rồi push các git commit lên repository dùng chung (GitHub, GitLab, Bitbucket).
2. **Pipeline CI/CD tự động**: Cloud build runner (như **GitHub Actions**, **AWS CodeBuild** hoặc **Google Cloud Build**) tự động được kích hoạt khi code được push.
3. **Cross-build trên cloud**: CI/CD runner chạy test và thực thi `docker buildx build --platform linux/amd64,linux/arm64 --push` trong một cloud environment sạch, có thể tái lập.
4. **Container Registry riêng tư**: Các image đã build được push lên một **Container Registry** riêng tư, bảo mật (như **AWS ECR**, **GitHub Container Registry (GHCR)** hoặc **Google Artifact Registry**).
---

### Những điểm chính cần nhớ

* **Kiểm tra kiến trúc**: Mac dùng Apple Silicon sử dụng `linux/arm64`; cloud VM tiêu chuẩn sử dụng `linux/amd64`.
* **Dùng `buildx` để cross-build**: Dùng `docker buildx build --platform linux/amd64 --push` khi build trên Mac cho cloud server x86.
* **CI/CD thuộc về cloud**: Build production image thông qua cloud runner CI/CD tự động (GitHub Actions / AWS CodeBuild) thay vì laptop cục bộ.
* **Dùng Container Registry**: Lưu trữ và quản lý version của image trong registry (AWS ECR, Docker Hub, GHCR).
