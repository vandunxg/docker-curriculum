---
title: Docker Images
---

Trước đây chúng ta đã xem qua image, nhưng trong phần này, chúng ta sẽ tìm hiểu sâu hơn về Docker image và tự xây dựng một image! Cuối cùng, chúng ta cũng sẽ dùng image đó để chạy ứng dụng trên máy local, rồi triển khai lên [AWS](http://aws.amazon.com) để chia sẻ với bạn bè! Hào hứng chưa? Tuyệt, hãy bắt đầu.

Docker image là nền tảng của container. Trong ví dụ trước, chúng ta đã **pull** image _Busybox_ từ registry và yêu cầu Docker client chạy một container **dựa trên** image đó. Để xem danh sách các image hiện có trên máy local, hãy sử dụng lệnh `docker images`.

```bash
$ docker images
REPOSITORY                      TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
prakhar1989/catnip              latest              c7ffb5626a50        2 hours ago         697.9 MB
prakhar1989/static-site         latest              b270625a1631        21 hours ago        133.9 MB
python                          3-onbuild           cf4002b2c383        5 days ago          688.8 MB
martin/docker-cleanup-volumes   latest              b42990daaca2        7 weeks ago         22.14 MB
ubuntu                          latest              e9ae3c220b23        7 weeks ago         187.9 MB
busybox                         latest              c51f86c28340        9 weeks ago         1.109 MB
hello-world                     latest              0a6ba66e537a        11 weeks ago        960 B
```

Danh sách trên hiển thị các image mà tôi đã pull từ registry, cùng với những image tôi tự tạo (chúng ta sẽ sớm xem cách thực hiện). `TAG` tham chiếu đến một snapshot cụ thể của image, còn `IMAGE ID` là mã định danh duy nhất tương ứng với image đó.

Để đơn giản, bạn có thể hình dung image tương tự một Git repository: image có thể được [commit](https://docs.docker.com/engine/reference/commandline/commit/) với các thay đổi và có nhiều phiên bản. Nếu không cung cấp số phiên bản cụ thể, client sẽ mặc định dùng `latest`. Ví dụ, bạn có thể pull một phiên bản cụ thể của image `ubuntu`:

```bash
$ docker pull ubuntu:18.04
```

Để có một Docker image mới, bạn có thể lấy image đó từ một registry (chẳng hạn Docker Hub) hoặc tự tạo image. Có hàng chục nghìn image có sẵn trên [Docker Hub](https://hub.docker.com/explore/). Bạn cũng có thể tìm kiếm image trực tiếp từ command line bằng `docker search`.

Một điểm khác biệt quan trọng cần lưu ý khi nói về image là sự khác nhau giữa base image và child image.

- **Base image** là những image không có parent image, thường là các image chứa một OS như ubuntu, busybox hoặc debian.

- **Child image** là những image được xây dựng dựa trên base image và bổ sung chức năng.

Ngoài ra còn có official image và user image; cả hai loại đều có thể là base image hoặc child image.

- **Official image** là những image được Docker chính thức duy trì và hỗ trợ. Tên của chúng thường chỉ gồm một từ. Trong danh sách image ở trên, các image `python`, `ubuntu`, `busybox` và `hello-world` là official image.

- **User image** là những image do những người dùng như bạn và tôi tạo ra và chia sẻ. Chúng được xây dựng dựa trên base image và bổ sung chức năng. Thông thường, chúng có định dạng `user/image-name`.
