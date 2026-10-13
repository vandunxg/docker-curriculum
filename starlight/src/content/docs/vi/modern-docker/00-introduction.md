---
title: Giới thiệu
---

Nếu bạn đã đi đến đây, xin chúc mừng! Giờ bạn đã nắm được những nền tảng cốt lõi của Docker: kéo image, viết Dockerfile, quản lý mạng và orchestration các ứng dụng multi-container bằng Docker Compose.

Trong những ngày đầu của Docker, việc build và chạy một ứng dụng bên trong container có cảm giác như một phép màu. Nhưng khi Docker phát triển thành tiêu chuẩn của ngành cho việc chạy phần mềm ở mọi nơi, các developer và đội ngũ DevOps bắt đầu gặp những thách thức mới:

1. **Image có kích thước hàng gigabyte**: Các ứng dụng đơn giản được đóng gói cùng compiler, header và build tool, tạo ra những container image khổng lồ có dung lượng từ 1GB trở lên.
2. **Vướng mắc về kiến trúc**: Apple Silicon (các máy Mac M1/M2/M3/M4) sử dụng chip ARM64 đã trở thành tiêu chuẩn cho việc phát triển local, trong khi các server cloud chạy x86/AMD64 lại cần các bản build đa nền tảng.
3. **Đồng bộ code khi phát triển local**: Việc mount volume chứa code local thường gặp độ trễ khi đồng bộ file hoặc những rắc rối về quyền file của hệ điều hành.
4. **Bảo mật container**: Việc mặc định chạy container dưới quyền `root` gây ra rủi ro bảo mật trong môi trường production.

Trong chương này, chúng ta sẽ nâng cao kỹ năng Docker bằng cách tìm hiểu các tính năng hiện đại của Docker và best practices trong ngành. Bạn sẽ học cách giữ cho container image gọn nhẹ và an toàn, cross-compile cho mọi kiến trúc, đồng thời tăng tốc mạnh mẽ quy trình làm việc local của developer.

Bắt đầu thôi!
