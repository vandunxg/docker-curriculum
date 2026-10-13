---
title: Thiết lập máy tính của bạn
---

Việc cài đặt đầy đủ các công cụ trên máy tính có thể khá khó khăn, nhưng may mắn là việc cài đặt và chạy Docker trên hệ điều hành yêu thích của bạn rất đơn giản với [Docker Desktop](https://www.docker.com/products/docker-desktop/).

_Hướng dẫn bắt đầu_ của Docker có hướng dẫn chi tiết để thiết lập Docker trên [Mac](https://docs.docker.com/desktop/install/mac-install/), [Linux](https://docs.docker.com/desktop/install/linux-install/) và [Windows](https://docs.docker.com/desktop/install/windows-install/).

> **Lưu ý cho Windows:** Docker Desktop trên Windows sử dụng **WSL 2** (Windows Subsystem for Linux 2) làm backend mặc định, cung cấp khả năng tương thích đầy đủ với Linux kernel và tốc độ gần như native. Hãy đảm bảo WSL 2 được bật trong quá trình cài đặt.
>
> **Lưu ý cho Mac:** Ngoài [Docker Desktop](https://docs.docker.com/desktop/install/mac-install/), người dùng macOS cũng có thể sử dụng **[OrbStack](https://orbstack.dev/)** — một giải pháp thay thế nhanh, nhẹ cho Docker Desktop, khởi động trong vài giây và sử dụng rất ít CPU và pin. Bạn có thể cài đặt bằng Homebrew:
> ```bash
> brew install --cask orbstack
> ```
> Cả Docker Desktop và OrbStack đều cung cấp sẵn CLI `docker` tiêu chuẩn và `docker compose`.

Sau khi cài đặt xong Docker, hãy kiểm tra cài đặt Docker bằng cách chạy lệnh sau trong terminal:

```bash
$ docker run hello-world

Hello from Docker!
This message shows that your installation appears to be working correctly.
...
```

---

## Thiết lập tức thì với Devcontainers & GitHub Codespaces

Nếu không muốn tự cấu hình các công cụ phát triển cục bộ, bạn có thể khởi chạy môi trường phát triển trên cloud ngay lập tức thông qua **GitHub Codespaces**, sử dụng cấu hình `.devcontainer` của repository.

> **Không cần thiết lập cục bộ:** **Không** yêu cầu Docker, Node.js, Python hoặc bất kỳ công cụ phát triển nào được cài đặt trên máy tính.

1. Mở [repository docker-curriculum trên GitHub](https://github.com/prakhar1989/docker-curriculum).
2. Nhấp vào nút **Code** màu xanh lá, chọn tab **Codespaces**, rồi nhấp vào **Create codespace on main**.
3. Một IDE đầy đủ chạy trên trình duyệt sẽ mở trực tiếp trong trình duyệt của bạn với Docker và Node được cấu hình sẵn.

> **Lưu ý:** Khi tạo lần đầu, GitHub Codespaces có thể mất vài phút để build môi trường container, khởi động Docker daemon và hoàn tất cài đặt dependencies.

![Thiết lập GitHub Codespaces](/codespaces.png)

Sau khi Codespace khởi chạy, hãy kiểm tra Docker trực tiếp trong terminal trên trình duyệt:

```bash
$ docker run hello-world
```

![Chạy Docker bên trong GitHub Codespaces](/codespaces-docker.png)

> **Mẹo xử lý sự cố:** Nếu `docker ps` hoặc `docker run` báo `Cannot connect to the Docker daemon`, hãy khởi động thủ công dịch vụ Docker trong terminal Codespace:
> ```bash
> sudo service docker start
> ```
