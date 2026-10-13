---
title: Best practices về bảo mật container
---

Khi chạy container trong môi trường production, bảo mật phải luôn được ưu tiên. Theo mặc định, các process chạy bên trong Docker container sẽ thực thi dưới user **`root`** nếu không được cấu hình khác đi.

Nếu attacker khai thác được lỗ hổng trong ứng dụng đang chạy dưới user `root`, họ có thể thoát khỏi ranh giới của container hoặc truy cập tài nguyên hệ thống của host bên dưới.

Hãy cùng xem ba practice bảo mật thiết yếu để harden Docker container của bạn.

---

### 1. Chạy Container với User Không phải Root

Cách dễ nhất và hiệu quả nhất để bảo mật một container là yêu cầu Docker chạy process dưới một user account không có đặc quyền.

#### Trong Dockerfile:

```dockerfile
FROM python:3.12-slim

# Create a dedicated non-root user and group
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /usr/src/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Change ownership of working directory to non-root user
RUN chown -R appuser:appuser /usr/src/app

# Switch to non-root user
USER appuser

EXPOSE 5000
CMD ["python", "./app.py"]
```

#### Trong Docker Compose:

Bạn cũng có thể bắt buộc process chạy dưới user không phải root trong `docker-compose.yml`:

```yaml
services:
  web:
    image: yourusername/catnip
    user: "10001:10001"
```

---

### 2. Loại Bỏ File Không Cần Thiết với `.dockerignore`

Tương tự như `.gitignore` ngăn secret key, build artifact và log được commit vào Git, file **`.dockerignore`** ngăn các file nhạy cảm hoặc không cần thiết bị copy vào Docker image.

Tạo file `.dockerignore` ở root của project:

```text
# .dockerignore
.git
.gitignore
__pycache__/
*.pyc
*.pyo
.env
.env.local
node_modules/
Dockerfile
docker-compose*.yml
README.md
```

Lợi ích của `.dockerignore`:
* Ngăn việc vô tình làm lộ các biến môi trường chứa secret (`.env`).
* Giữ Docker build context nhỏ, giúp `docker build` nhanh hơn.
* Tránh ghi đè các package đã cài trong container bằng `node_modules` hoặc `__pycache__` trên host local.

---

### 3. Quét Lỗ Hổng với `docker scout`

Ngay cả khi code của bạn sạch, các thư viện bên thứ ba hoặc base image của hệ điều hành vẫn có thể chứa các lỗ hổng bảo mật đã biết (CVE). Docker CLI hiện đại tích hợp **Docker Scout** để quét image trực tiếp từ terminal.

#### Tổng Quan Nhanh về Lỗ Hổng

Quét image đã build để tìm lỗ hổng:

```bash
$ docker scout quickview yourusername/catnip:latest
```

Output:

```text
 Target             │ yourusername/catnip:latest  │ 0 critical, 0 high, 2 medium, 4 low
 Base image         │ python:3.12-slim            │ 0 critical, 0 high
 Updated base image │ python:3.12-slim            │ No update needed
```

#### Kiểm Tra Lỗ Hổng Cụ Thể

Để nhận đề xuất chi tiết về việc nâng cấp package hoặc base image có lỗ hổng:

```bash
$ docker scout cves yourusername/catnip:latest
```

Docker Scout sẽ liệt kê các package bị ảnh hưởng và đề xuất phiên bản patch để bảo mật image của bạn.

---

### Checklist Tóm Tắt cho Container Production

* [x] **Dùng base image tối thiểu** (`python:3.12-slim`, `alpine`).
* [x] **Copy requirements trước** để tối ưu layer caching.
* [x] **Chạy dưới user không phải root** (`USER appuser`).
* [x] **Dùng `.dockerignore`** để loại bỏ secret và build clutter.
* [x] **Quét image** thường xuyên bằng `docker scout`.
