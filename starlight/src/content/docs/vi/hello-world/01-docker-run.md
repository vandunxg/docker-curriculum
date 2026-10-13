---
title: Docker Run
---

Tuyệt! Bây giờ hãy chạy một **container** Docker dựa trên image này. Để làm việc đó, chúng ta sẽ dùng lệnh quyền năng `docker run`.

```bash
$ docker run busybox
$
```

Chờ đã, không có gì xảy ra cả! Đây là bug à? Không. Phía sau, rất nhiều việc đã diễn ra. Khi gọi `run`, Docker client tìm image (trong trường hợp này là busybox), tải container và chạy một command trong container đó. Khi chạy `docker run busybox`, chúng ta không cung cấp command, nên container khởi động, chạy một command rỗng rồi thoát. Ừ thì... hơi cụt hứng. Hãy thử thứ gì đó thú vị hơn.

```bash
$ docker run busybox echo "hello from busybox"
hello from busybox
```

Tuyệt, cuối cùng cũng có output. Trong trường hợp này, Docker client đã thực thi command `echo` trong container busybox rồi thoát container đó. Nếu để ý, bạn sẽ thấy mọi việc diễn ra rất nhanh. Hãy thử hình dung việc khởi động một máy ảo, chạy một command rồi tắt nó. Giờ bạn đã hiểu vì sao người ta nói container rất nhanh! Được rồi, bây giờ hãy xem lệnh `docker ps`. Lệnh `docker ps` hiển thị tất cả container hiện đang chạy.

```bash
$ docker ps
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
```

Vì không có container nào đang chạy nên chúng ta thấy một dòng trống. Hãy thử một biến thể hữu ích hơn: `docker ps -a`

```bash
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                      PORTS               NAMES
305297d7a235        busybox             "uptime"            11 minutes ago      Exited (0) 11 minutes ago                       distracted_goldstine
ff0a5c3750b9        busybox             "sh"                12 minutes ago      Exited (0) 12 minutes ago                       elated_ramanujan
14e5bd11d164        hello-world         "/hello"            2 minutes ago       Exited (0) 2 minutes ago                        thirsty_euclid
```

Vậy danh sách ở trên là tất cả container mà chúng ta đã chạy. Hãy chú ý rằng cột `STATUS` cho biết các container này đã thoát vài phút trước.

Có lẽ bạn đang thắc mắc liệu có cách nào chạy nhiều hơn một command trong container hay không. Hãy thử ngay bây giờ:

```bash
$ docker run -it busybox sh
/ # ls
bin   dev   etc   home  proc  root  sys   tmp   usr   var
/ # uptime
 05:45:21 up  5:58,  0 users,  load average: 0.00, 0.01, 0.04
```

Chạy lệnh `run` với các cờ `-it` sẽ kết nối chúng ta với một interactive tty trong container. Giờ đây, chúng ta có thể chạy bao nhiêu command tùy thích trong container. Hãy dành chút thời gian để chạy các command yêu thích của bạn.

> **Cô lập container và trạng thái tạm thời**: Hãy thử tạo một file bên trong shell của container:
> ```bash
> / # touch my_test_file.txt
> / # ls
> ```
> Bây giờ hãy thoát khỏi container bằng cách gõ `exit` rồi khởi động một container mới với `docker run -it busybox sh`:
> ```bash
> $ docker run -it busybox sh
> / # ls
> ```
> Hãy chú ý rằng không thể tìm thấy `my_test_file.txt` ở đâu cả! Đó là vì Docker tạo một instance container mới, tách biệt mỗi lần chạy. Mọi thay đổi bên trong một instance container không ảnh hưởng đến máy host hoặc các lần chạy container tiếp theo.

Vậy là kết thúc chuyến tham quan nhanh về lệnh `docker run` quyền năng, nhiều khả năng đây sẽ là lệnh bạn dùng thường xuyên nhất. Bạn nên dành thời gian làm quen với lệnh này. Để tìm hiểu thêm về `run`, hãy dùng `docker run --help` để xem danh sách tất cả cờ mà lệnh hỗ trợ. Khi tiếp tục, chúng ta sẽ thấy thêm một vài biến thể của `docker run`.

Tuy nhiên, trước khi tiếp tục, hãy nói nhanh về việc xóa container. Như đã thấy ở trên, ngay cả sau khi thoát, chúng ta vẫn có thể xem phần còn lại của container bằng cách chạy `docker ps -a`. Trong suốt tutorial này, bạn sẽ chạy `docker run` nhiều lần và những container không còn dùng đến sẽ chiếm dung lượng đĩa. Vì vậy, theo nguyên tắc chung, tôi dọn dẹp container sau khi dùng xong. Để làm việc đó, bạn có thể chạy lệnh `docker rm`. Chỉ cần sao chép các container ID ở trên rồi dán chúng sau lệnh.

```bash
$ docker rm 305297d7a235 ff0a5c3750b9
305297d7a235
ff0a5c3750b9
```

Sau khi xóa, bạn sẽ thấy các ID được in lại. Nếu có nhiều container cần xóa cùng lúc, việc sao chép và dán các ID có thể khá mất thời gian. Trên Linux hoặc macOS, bạn có thể lọc và xóa các container đã thoát:

```bash
$ docker rm $(docker ps -a -q -f status=exited)
```

Tuy nhiên, command substitution như `$(...)` khác nhau giữa các hệ điều hành (chẳng hạn Windows PowerShell). Trên các phiên bản Docker hiện đại ở mọi nền tảng, lệnh được khuyến nghị để dọn dẹp các container đã dừng là `docker container prune`:

```bash
$ docker container prune
WARNING! This will remove all stopped containers.
Are you sure you want to continue? [y/N] y
Deleted Containers:
4a7f7eebae0f63178aff7eb0aa39f0627a203ab2df258c1a00b456cf20063
f98f9c2aa1eaf727e4ec9c0283bcaa4762fbdba7f26191f26c97f64090360

Total reclaimed space: 212 B
```

Một điều cuối cùng cũng rất hữu ích là cờ `--rm` có thể truyền cho `docker run`; cờ này sẽ tự động xóa container sau khi container thoát. Với các lần chạy container một lần, cờ `--rm` rất tiện dụng.

Cuối cùng, bạn cũng có thể xóa những image không còn cần nữa bằng cách chạy `docker rmi`.
