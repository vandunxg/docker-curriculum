---
title: Thực hành với Busybox
---

Giờ mọi thứ đã được thiết lập, đã đến lúc bắt tay vào thực hành. Trong phần này, chúng ta sẽ chạy một container [Busybox](https://en.wikipedia.org/wiki/BusyBox) trên hệ thống và làm quen với lệnh `docker run`.

Để bắt đầu, hãy chạy lệnh sau trong terminal:

```bash
$ docker pull busybox
```

> Lưu ý: Tùy thuộc vào cách bạn cài đặt Docker trên hệ thống, bạn có thể gặp lỗi `permission denied` sau khi chạy lệnh trên. Nếu đang dùng Mac, hãy đảm bảo Docker engine đang chạy. Nếu đang dùng Linux, hãy thêm `sudo` trước các lệnh `docker`. Ngoài ra, bạn có thể [tạo một docker group](https://docs.docker.com/engine/installation/linux/linux-postinstall/) để loại bỏ vấn đề này.

Lệnh `pull` lấy [**image**](https://hub.docker.com/_/busybox/) busybox từ [**Docker registry**](https://hub.docker.com/explore/) và lưu image đó vào hệ thống. Bạn có thể dùng lệnh `docker images` để xem danh sách tất cả image trên hệ thống.

```bash
$ docker images
REPOSITORY              TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
busybox                 latest              c51f86c28340        4 weeks ago         1.109 MB
```
