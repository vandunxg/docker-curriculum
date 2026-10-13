---
title: Docker Compose
---

Cho đến nay, chúng ta đã dành toàn bộ thời gian tìm hiểu Docker client cho một container. Tuy nhiên, trong hệ sinh thái Docker có những công cụ orchestration mạnh mẽ và phối hợp rất tốt với Docker:

1. [Docker Compose](https://docs.docker.com/compose/) — Công cụ dùng để định nghĩa và chạy các ứng dụng Docker nhiều container.
2. [Kubernetes](https://kubernetes.io) — Hệ thống mã nguồn mở dùng để tự động hóa việc triển khai, mở rộng và quản lý các ứng dụng được container hóa.
3. [Docker Swarm](https://docs.docker.com/engine/swarm/) — Tính năng clustering gốc cho Docker.

Trong phần này, chúng ta sẽ tìm hiểu Docker Compose và xem cách nó giúp việc xử lý các app nhiều container trở nên dễ dàng hơn.

### Docker Compose là gì?

Compose là công cụ dùng để định nghĩa và chạy các app Docker nhiều container. Công cụ này sử dụng một file cấu hình YAML có tên `docker-compose.yml` để cấu hình các service của ứng dụng. Sau đó, chỉ bằng một lệnh, bạn có thể tạo và khởi động tất cả service từ cấu hình đó. Compose hoạt động trong mọi môi trường: production, staging, development, testing cũng như các workflow CI.

Hãy xem cách tạo file `docker-compose.yml` cho app SF-Foodtrucks và đánh giá xem Docker Compose có thực hiện đúng lời hứa của mình hay không.

### Cài đặt

Nếu bạn đang sử dụng Docker Desktop (Mac, Windows hoặc Linux), **Docker Compose V2** đã được tích hợp sẵn dưới dạng subcommand plugin (`docker compose`).

Bạn có thể xác minh việc cài đặt bằng cách kiểm tra version:

```bash
$ docker compose version
Docker Compose version v2.27.0
```

> **Lưu ý về V1 và V2:** Các phiên bản Docker Compose trước đây sử dụng một command riêng có dấu gạch nối (`docker-compose`). Docker đã chính thức ngừng V1 vào năm 2023. Hiện nay, Compose được gọi trực tiếp bằng `docker compose` với một dấu cách.

### File `docker-compose.yml`

Giờ Docker Compose đã sẵn sàng, hãy xem file `docker-compose.yml`:

```yaml
services:
  es:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.18
    container_name: es
    environment:
      - discovery.type=single-node
    ports:
      - 9200:9200
    volumes:
      - esdata1:/usr/share/elasticsearch/data
  web:
    image: prakhar1989/foodtrucks-web
    command: python3 app.py
    depends_on:
      - es
    ports:
      - 5000:5000
    volumes:
      - ./flask-app:/opt/flask-app
volumes:
  esdata1:
    driver: local
```

Hãy phân tích ý nghĩa của file này:
- Ở cấp cao nhất, bên dưới `services:`, chúng ta định nghĩa tên các service: `es` và `web`.
- Với mỗi service, `image` chỉ định Docker image sẽ sử dụng. Với `es`, chúng ta sử dụng image Elasticsearch chính thức. Với `web`, chúng ta sử dụng image của Flask app.
- `ports` ánh xạ port của container với port của host.
- `depends_on` yêu cầu Docker khởi động container `es` trước khi khởi động `web`.
- `volumes` định nghĩa các mount dữ liệu persistent để dữ liệu vẫn tồn tại sau khi container restart.

> **Lưu ý:** Thuộc tính schema cấp cao nhất `version: "3"` được dùng trong các tutorial cũ hiện đã deprecated trong [Compose Specification](https://docs.docker.com/compose/compose-file/) hiện đại và có thể được bỏ qua an toàn.

### Chạy Docker Compose

Đảm bảo mọi container standalone hiện có đã được dừng trước khi khởi chạy:

```bash
$ docker stop es foodtrucks-web
$ docker rm es foodtrucks-web
```

Tiếp theo, di chuyển đến thư mục chứa file `docker-compose.yml` và chạy:

```bash
$ docker compose up
[+] Running 3/3
 ✔ Network foodtrucks_default  Created
 ✔ Container es                Created
 ✔ Container foodtrucks-web-1  Created
Attaching to es, foodtrucks-web-1
```

Mở `http://localhost:5000` để xem app đang chạy! Chỉ với một lệnh, Docker Compose đã tạo một mạng riêng (`foodtrucks_default`), khởi tạo cả hai container, kết nối output log của chúng và thiết lập cơ chế service discovery qua DNS giữa hai container.

Để chạy các service ở chế độ nền (detached mode):

```bash
$ docker compose up -d
[+] Running 2/2
 ✔ Container es                Started
 ✔ Container foodtrucks-web-1  Started
```

Bạn có thể kiểm tra các service đang chạy bằng:

```bash
$ docker compose ps
NAME                IMAGE                                                   COMMAND                  SERVICE             CREATED             STATUS              PORTS
es                  docker.elastic.co/elasticsearch/elasticsearch:7.17.18   "/bin/tini -- /usr/l…"   es                  2 minutes ago       Up 2 minutes        0.0.0.0:9200->9200/tcp
foodtrucks-web-1    prakhar1989/foodtrucks-web                              "python3 app.py"         web                 2 minutes ago       Up 2 minutes        0.0.0.0:5000->5000/tcp
```

Để dừng và xóa tất cả container, network và volume được Compose tạo ra:

```bash
$ docker compose down -v
[+] Running 3/3
 ✔ Container foodtrucks-web-1  Removed
 ✔ Container es                Removed
 ✔ Network foodtrucks_default  Removed
 ✔ Volume foodtrucks_esdata1   Removed
```

Chúc mừng! Bạn đã cấu hình và quản lý thành công một môi trường nhiều container bằng Docker Compose.
