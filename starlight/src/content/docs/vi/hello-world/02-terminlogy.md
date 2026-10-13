---
title: Thuật ngữ
---

Ở phần trước, chúng ta đã sử dụng khá nhiều jargon riêng của Docker, có thể gây khó hiểu cho một số người. Vì vậy, trước khi đi tiếp, hãy cùng làm rõ một số thuật ngữ thường xuyên được sử dụng trong hệ sinh thái Docker.

- _Images_ - Bản thiết kế của ứng dụng, làm nền tảng để tạo container. Trong phần demo ở trên, chúng ta đã dùng lệnh `docker pull` để tải image **busybox**.
- _Containers_ - Được tạo từ Docker image và chạy ứng dụng thực tế. Chúng ta tạo container bằng `docker run`, như đã làm với image busybox vừa tải xuống. Có thể xem danh sách container đang chạy bằng lệnh `docker ps`.
- _Docker Daemon_ - Dịch vụ chạy nền trên host, quản lý việc build, chạy và phân phối Docker container. Daemon là process chạy trong hệ điều hành mà các client kết nối tới.
- _Docker Client_ - Công cụ dòng lệnh cho phép người dùng tương tác với daemon. Nói rộng hơn, client cũng có thể tồn tại dưới các dạng khác, chẳng hạn như [Kitematic](https://kitematic.com/), cung cấp GUI cho người dùng.
- _Docker Hub_ - Một [registry](https://hub.docker.com/explore/) của Docker image. Bạn có thể hình dung registry như một thư mục chứa tất cả Docker image hiện có. Nếu cần, bạn có thể tự host Docker registry và dùng chúng để pull image.
