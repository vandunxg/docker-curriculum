---
title: Website tĩnh
---

Tuyệt! Vậy là chúng ta đã tìm hiểu `docker run`, thử nghiệm với một Docker container và làm quen với một số thuật ngữ. Với toàn bộ kiến thức này, giờ chúng ta đã sẵn sàng đi vào phần chính: triển khai web application bằng Docker!

### Website tĩnh

Hãy bắt đầu từng bước đơn giản. Điều đầu tiên chúng ta sẽ tìm hiểu là cách chạy một website tĩnh cực kỳ đơn giản. Chúng ta sẽ pull một Docker image từ Docker Hub, chạy container và thấy việc chạy một webserver dễ dàng đến mức nào.

Bắt đầu thôi. Image chúng ta sẽ dùng là một [website](http://github.com/prakhar1989/docker-curriculum) một trang mà tôi đã tạo sẵn cho mục đích demo này và host trên [registry](https://hub.docker.com/r/prakhar1989/static-site/) - `prakhar1989/static-site`. Chúng ta có thể download và chạy image trực tiếp trong một lần bằng `docker run`. Như đã đề cập ở trên, flag `--rm` sẽ tự động xóa container khi container thoát, còn flag `-it` chỉ định một interactive terminal, giúp việc dừng container bằng Ctrl+C dễ dàng hơn (trên Windows).

```bash
$ docker run --rm -it prakhar1989/static-site
```

> **Lưu ý về Apple Silicon (M1/M2/M3/M4) và ARM:** Nếu thấy cảnh báo như `WARNING: The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64)`, Docker Desktop sẽ tự động giả lập image x86_64 thông qua Rosetta 2 / QEMU. Nếu cần, bạn có thể truyền rõ `--platform linux/amd64` cho `docker run`:
> ```bash
> $ docker run --platform linux/amd64 --rm -it prakhar1989/static-site
> ```

Vì image chưa tồn tại cục bộ, client trước tiên sẽ fetch image từ registry rồi chạy image. Nếu mọi việc diễn ra suôn sẻ, bạn sẽ thấy thông báo `Nginx is running...` trong terminal. Được rồi, server đang chạy, vậy làm thế nào để xem website? Nó đang chạy trên port nào? Và quan trọng hơn, làm thế nào để truy cập trực tiếp vào container từ host machine? Nhấn Ctrl+C để dừng container.

Trong trường hợp này, client không expose port nào, nên chúng ta cần chạy lại lệnh `docker run` để publish port. Đồng thời, chúng ta cũng cần tìm cách để terminal không còn attach vào container đang chạy. Nhờ vậy, bạn có thể thoải mái đóng terminal mà container vẫn tiếp tục chạy. Đây được gọi là chế độ **detached**.

```bash
$ docker run -d -P --name static-site prakhar1989/static-site
e61d12292d69556eabe2a44c16cbd54486b2527e2ce4f95438e504afb7b02810
```

Trong lệnh trên, `-d` sẽ detach terminal của chúng ta, `-P` sẽ publish tất cả port đã expose tới các port ngẫu nhiên và cuối cùng `--name` tương ứng với tên mà chúng ta muốn đặt. Giờ chúng ta có thể xem các port bằng cách chạy lệnh `docker port [CONTAINER]`

```bash
$ docker port static-site
80/tcp -> 0.0.0.0:32769
443/tcp -> 0.0.0.0:32768
```

Bạn có thể mở [http://localhost:32769](http://localhost:32769) trong browser.

> Lưu ý: Nếu bạn đang dùng docker-toolbox, có thể bạn cần dùng `docker-machine ip default` để lấy IP.

Bạn cũng có thể chỉ định một port tùy chỉnh mà client sẽ forward connection tới container.

```bash
$ docker run -p 8888:80 prakhar1989/static-site
Nginx is running...
```

![website tĩnh](../../../../assets/static.webp)

Để dừng một container detached, hãy chạy `docker stop` và cung cấp container ID. Trong trường hợp này, chúng ta có thể dùng tên `static-site` đã sử dụng khi khởi động container.

```bash
$ docker stop static-site
static-site
```

Tôi chắc bạn sẽ đồng ý rằng việc này rất đơn giản. Để triển khai trên một server thực tế, bạn chỉ cần cài đặt Docker và chạy lệnh Docker ở trên. Sau khi đã thấy cách chạy một webserver bên trong Docker image, hẳn bạn đang thắc mắc: làm thế nào để tạo Docker image của riêng mình? Đây là câu hỏi chúng ta sẽ tìm hiểu trong phần tiếp theo.
