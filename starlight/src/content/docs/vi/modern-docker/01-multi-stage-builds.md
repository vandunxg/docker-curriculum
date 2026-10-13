---
title: Build đa giai đoạn
---

Khi bắt đầu xây dựng ứng dụng bằng các ngôn ngữ như Go, Rust, Java hoặc các framework JavaScript hiện đại (React, Vue, Next.js), bạn sẽ nhanh chóng nhận ra một điều khá bất tiện: những công cụ cần để **build** code (compiler, build kit, SDK, `node_modules` devDependencies) hiếm khi cần thiết để **chạy** ứng dụng.

Nếu đưa toàn bộ công cụ build đó vào Docker image cuối cùng, container image của bạn sẽ trở nên cồng kềnh, chậm khi push/pull và chứa thêm nhiều bề mặt tấn công bảo mật không cần thiết.

Đây chính là lúc **Multi-Stage Builds** phát huy tác dụng!

### Multi-Stage Builds là gì?

Với multi-stage builds, bạn có thể sử dụng nhiều câu lệnh `FROM` trong cùng một `Dockerfile`. Mỗi instruction `FROM` bắt đầu một stage mới của quá trình build bằng một base image khác. Quan trọng hơn, bạn có thể chọn lọc copy các artifact (chẳng hạn binary đã compile hoặc frontend bundle đã minify) từ stage này sang stage khác, đồng thời bỏ lại mọi thứ không cần thiết!

```text
┌─────────────────────────────────────────┐
│ Stage 1: Builder (Full SDK / Compilers) │
│ - Installs dependencies & compiles app  │
└────────────────────┬────────────────────┘
                     │ Copy ONLY built binary
                     ▼
┌─────────────────────────────────────────┐
│ Stage 2: Runtime (Minimal Base Image)   │
│ - Ultra-small, secure runtime image     │
└─────────────────────────────────────────┘
```

---

### Ví dụ thực tế: Ứng dụng Go

Hãy xem một ví dụ kinh điển về ứng dụng Go đã compile. Nếu không dùng multi-stage builds, một Dockerfile chỉ có một stage có thể trông như sau:

```dockerfile
# Single-Stage Dockerfile (Heavy ~800MB Image)
FROM golang:1.22

WORKDIR /app
COPY . .
RUN go build -o server .

CMD ["./server"]
```

Vì image `golang` chứa đầy đủ Go compiler và toolchain, image kết quả có kích thước gần **800 MB** dù ứng dụng chỉ có 10MB!

Bây giờ hãy viết lại bằng **Multi-Stage Build**:

```dockerfile
# Stage 1: Build Stage
FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

# Stage 2: Production Stage
FROM alpine:3.19

WORKDIR /app
# Copy only the compiled binary from the builder stage
COPY --from=builder /app/server .

EXPOSE 8080
CMD ["./server"]
```

Hãy phân tích xem điều gì đang xảy ra:
1. `FROM golang:1.22-alpine AS builder`: Đặt tên cho stage đầu tiên là `builder`. Image này có đầy đủ Go compiler cần thiết để build binary.
2. `COPY --from=builder /app/server .`: Trong stage thứ hai (`alpine:3.19`), chỉ copy binary `server` đã compile từ stage `builder`.

Kết quả là gì? Image container cuối cùng giảm từ **~800 MB xuống còn dưới 15 MB**!

---

### Tự thực hành: Hướng dẫn từng bước

Hãy build một HTTP web server nhỏ trên máy của bạn để thấy multi-stage builds hoạt động như thế nào!

#### Bước 1: Tạo thư mục dự án

Mở terminal và tạo một thư mục cho phần thực hành này:

```bash
$ mkdir multistage-demo && cd multistage-demo
```

#### Bước 2: Viết một web server đơn giản (`main.go`)

Tạo file có tên `main.go` và dán đoạn code sau vào:

```go
package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Hello from a multi-stage Docker container!")
	})
	fmt.Println("Server running on port 8080...")
	http.ListenAndServe(":8080", nil)
}
```

#### Bước 3: Tạo `Dockerfile` multi-stage

Tạo một `Dockerfile` trong cùng thư mục:

```dockerfile
# Stage 1: Build the Go binary
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY main.go .
RUN CGO_ENABLED=0 GOOS=linux go build -o server main.go

# Stage 2: Create lightweight production image
FROM alpine:3.19
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
```

#### Bước 4: Build image

Chạy `docker build` để compile ứng dụng và tạo multi-stage image:

```bash
$ docker build -t multistage-demo .
[+] Building 3.2s (10/10) FINISHED
 => [1/4] FROM docker.io/library/golang:1.22-alpine AS builder
 => [2/4] COPY main.go .
 => [3/4] RUN CGO_ENABLED=0 GOOS=linux go build -o server main.go
 => [4/4] COPY --from=builder /app/server .
 => naming to docker.io/library/multistage-demo
```

#### Bước 5: Kiểm tra kích thước image!

Bây giờ hãy liệt kê các Docker image cục bộ để kiểm tra kích thước image:

```bash
$ docker image ls multistage-demo
REPOSITORY         TAG       IMAGE ID       CREATED         SIZE
multistage-demo   latest    a1b2c3d4e5f6   15 seconds ago  14.2MB
```

Hãy chú ý đến kích thước: **chỉ 14.2 MB**! Bạn vừa build một container web server đầy đủ chức năng, chiếm ít dung lượng ổ đĩa hơn một bức ảnh độ phân giải cao.

#### Bước 6: Chạy container

Kiểm tra container gọn nhẹ của bạn:

```bash
$ docker run -d -p 8080:8080 multistage-demo
```

Mở `http://localhost:8080` trong trình duyệt, hoặc kiểm tra bằng `curl`:

```bash
$ curl http://localhost:8080
Hello from a multi-stage Docker container!
```

Dọn dẹp sau khi kiểm tra xong:

```bash
$ docker stop $(docker ps -q --filter ancestor=multistage-demo)
```

---

### Multi-Stage Builds cho ứng dụng frontend Node.js / React

Multi-stage builds cũng rất hiệu quả với các ứng dụng web frontend. Hãy xem xét một ứng dụng React hoặc Next.js, trong đó `npm run build` compile JSX thành các file HTML/JS/CSS tĩnh:

```dockerfile
# Stage 1: Build static assets
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve static assets with Nginx
FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Hãy chú ý rằng Node.js và `node_modules` hoàn toàn được để lại ở Stage 1! Production container chỉ chứa Nginx hiệu năng cao và các asset tĩnh.

---

### Những điểm chính cần nhớ

* **Image nhỏ hơn đáng kể**: Triển khai nhanh hơn, chu kỳ `docker push`/`docker pull` nhanh hơn và giảm chi phí lưu trữ.
* **Bảo mật tốt hơn**: Ít build tool được cài đặt hơn đồng nghĩa với ít lỗ hổng tiềm ẩn (CVE) hơn trong production container.
* **Một Dockerfile duy nhất**: Không cần duy trì các script build riêng biệt hoặc các tác vụ dọn dẹp container trung gian.
