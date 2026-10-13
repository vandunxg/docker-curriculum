---
title: Giới thiệu
---

Trong phần trước, chúng ta đã thấy việc chạy ứng dụng với Docker dễ dàng và thú vị đến mức nào. Chúng ta bắt đầu với một website tĩnh đơn giản rồi thử một ứng dụng Flask. Cả hai đều có thể chạy local và trên cloud chỉ bằng vài lệnh. Điểm chung của hai ứng dụng này là chúng đều chạy trong **một container duy nhất**.

Những ai có kinh nghiệm chạy các service trong production đều biết rằng các ứng dụng ngày nay thường không đơn giản như vậy. Gần như luôn có một database (hoặc bất kỳ dạng persistent storage nào khác) tham gia. Các hệ thống như [Redis](http://redis.io/) và [Memcached](http://memcached.org/) đã trở thành thành phần không thể thiếu trong hầu hết kiến trúc web application. Vì vậy, trong phần này chúng ta sẽ dành thời gian tìm hiểu cách Dockerize các ứng dụng phụ thuộc vào nhiều service khác nhau để chạy.

Cụ thể, chúng ta sẽ xem cách chạy và quản lý các môi trường Docker **multi-container**. Có thể bạn sẽ hỏi tại sao lại multi-container? Một trong những điểm cốt lõi của Docker là cách nó cung cấp isolation. Ý tưởng đóng gói một process cùng các dependency của nó trong một sandbox (gọi là container) chính là điều khiến Docker mạnh mẽ đến vậy.

Cũng như decouple các tier của application là một chiến lược tốt, việc tách container cho từng **service** cũng là điều nên làm. Mỗi tier có khả năng có nhu cầu tài nguyên khác nhau, và các nhu cầu đó có thể tăng với tốc độ khác nhau. Bằng cách tách các tier vào những container khác nhau, chúng ta có thể compose từng tier bằng instance type phù hợp nhất dựa trên các nhu cầu tài nguyên khác nhau. Điều này cũng rất phù hợp với phong trào [microservices](http://martinfowler.com/articles/microservices.html), một trong những lý do chính khiến Docker (hoặc bất kỳ công nghệ container nào khác) đang ở [forefront](https://medium.com/aws-activate-startup-blog/using-containers-to-build-a-microservices-architecture-6e1b8bacb7d1#.xl3wryr5z) của các kiến trúc microservices hiện đại.
