---
title: Phát triển với Compose Watch
---

Trong phần Docker Compose trước, chúng ta đã sử dụng volume mount (`volumes: - ./app:/usr/src/app`) để ánh xạ source code từ máy tính của bạn vào các container đang chạy nhằm phục vụ việc phát triển trực tiếp.

Mặc dù volume mount hoạt động tốt với các script đơn giản, chúng vẫn có một số hạn chế đã biết:
* Hiệu năng đồng bộ file trên macOS và Windows có thể bị trễ với các project lớn (ví dụ: thư mục `node_modules` hoặc vendor lớn).
* Các file được thêm hoặc xóa ở local không tự động kích hoạt việc cài dependency hoặc build lại container.
* Quyền file giữa host OS và user trong container thường xung đột.

Để giải quyết vấn đề này, Docker Compose V2 đã giới thiệu **Compose Watch**.

### `docker compose watch` là gì?

Compose Watch tự động theo dõi thư mục project local để phát hiện thay đổi và đồng bộ chúng một cách thông minh vào các service container đang chạy. Tùy thuộc vào loại file thay đổi, Compose Watch có thể:

1. **`sync`**: Lập tức sao chép các file source đã cập nhật vào container (phù hợp với Python, JavaScript, CSS, HTML).
2. **`rebuild`**: Tự động build lại và khởi động lại service container khi các file cấu hình thay đổi (ví dụ: `requirements.txt` hoặc `package.json`).
3. **`sync+restart`**: Sao chép file vào container và khởi động lại process của ứng dụng.

### Cấu hình Compose Watch

Để bật Compose Watch, hãy thêm block `develop` vào định nghĩa service trong `docker-compose.yml`:

```yaml
services:
  web:
    build: .
    ports:
      - "5000:5000"
    develop:
      watch:
        # Sync Python source code edits instantly
        - path: .
          target: /usr/src/app
          action: sync
          ignore:
            - __pycache__/
            - .git/

        # Automatically rebuild service if requirements.txt changes
        - path: ./requirements.txt
          action: rebuild
```

### Chạy Compose Watch

Khởi chạy ứng dụng với flag `--watch`:

```bash
$ docker compose up --watch
```

Output:

```text
[+] Running 2/2
 ✔ Container es   Running
 ✔ Container web  Running
Watch enabled for service "web"
```

Giờ đây, mỗi khi bạn chỉnh sửa một file Python trong trình soạn thảo văn bản, Docker Compose sẽ đồng bộ file đã cập nhật vào container ngay lập tức, chỉ trong vài mili giây. Nếu bạn thêm package mới vào `requirements.txt`, Compose sẽ tự động build lại image của service cho bạn!

Compose Watch giúp việc phát triển local bên trong các Docker container có tốc độ tương đương với khi chạy phần mềm trực tiếp trên máy host.
