---
title: Dockerfile
---

[Dockerfile](https://docs.docker.com/engine/reference/builder/) là một file văn bản đơn giản chứa danh sách các lệnh mà Docker client gọi trong quá trình tạo image. Đây là một cách đơn giản để tự động hóa quy trình tạo image. Điểm hay nhất là các [lệnh](https://docs.docker.com/engine/reference/builder/#from) bạn viết trong Dockerfile _gần như_ giống hệt các lệnh Linux tương đương. Điều này có nghĩa là bạn không thực sự phải học cú pháp mới để tự tạo Dockerfile.

Thư mục ứng dụng có một Dockerfile, nhưng vì đây là lần đầu thực hiện nên chúng ta sẽ tạo một file từ đầu. Trước tiên, hãy tạo một file trống mới trong trình soạn thảo văn bản quen dùng và lưu nó trong **cùng** thư mục với Flask app, đặt tên là `Dockerfile`.

Chúng ta bắt đầu bằng việc chỉ định base image. Dùng từ khóa `FROM` để thực hiện việc đó — chúng ta sẽ dùng `python:3.12-slim`, một image Linux nhẹ đã được cài sẵn Python:

```dockerfile
FROM python:3.12-slim
```

Tiếp theo, chúng ta thiết lập thư mục làm việc cho app bên trong container:

```dockerfile
# set a directory for the app
WORKDIR /usr/src/app
```

Bây giờ là một khái niệm quan trọng: **Docker Layer Caching**. Mỗi instruction trong Dockerfile tạo ra một layer được cache. Để tối ưu tốc độ build khi code thay đổi, chúng ta copy `requirements.txt` và cài dependency **trước** khi copy phần source code còn lại của ứng dụng. Nhờ vậy, Docker có thể sử dụng lại layer `pip install` đã được cache trừ khi `requirements.txt` thay đổi!

```dockerfile
# copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy all remaining files to the container
COPY . .
```

Việc tiếp theo cần chỉ định là số port cần được expose. Vì Flask app của chúng ta đang chạy trên port `5000`, đó là port chúng ta sẽ chỉ định.

```dockerfile
EXPOSE 5000
```

Bước cuối cùng là viết command để chạy ứng dụng, cụ thể là `python ./app.py`. Chúng ta dùng command [CMD](https://docs.docker.com/engine/reference/builder/#cmd) để thực hiện việc đó —

```dockerfile
CMD ["python", "./app.py"]
```

Mục đích chính của `CMD` là cho container biết command nào cần chạy khi container được start. Vậy là `Dockerfile` của chúng ta đã sẵn sàng. Đây là nội dung của nó —

```dockerfile
FROM python:3.12-slim

# set a directory for the app
WORKDIR /usr/src/app

# copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy all remaining files to the container
COPY . .

# define the port number the container should expose
EXPOSE 5000

# run the command
CMD ["python", "./app.py"]
```

Giờ chúng ta đã có `Dockerfile`, có thể build image. Command `docker build` đảm nhiệm phần việc chính là tạo một Docker image từ `Dockerfile`.

Phần bên dưới hiển thị output khi chạy command. Trước khi tự chạy command (đừng quên dấu chấm ở cuối), hãy nhớ thay `yourusername` bằng username Docker Hub của bạn. Command `docker build` nhận một tên tag tùy chọn với `-t` và vị trí của thư mục chứa `Dockerfile`.

```bash
$ docker build -t yourusername/catnip .
[+] Building 2.4s (10/10) FINISHED
 => [internal] load build definition from Dockerfile
 => => transferring dockerfile: 312B
 => [internal] load .dockerignore
 => [1/5] FROM docker.io/library/python:3.12-slim
 => [2/5] WORKDIR /usr/src/app
 => [3/5] COPY requirements.txt .
 => [4/5] RUN pip install --no-cache-dir -r requirements.txt
 => [5/5] COPY . .
 => exporting to image
 => => naming to docker.io/yourusername/catnip
```

Nếu image `python:3.12-slim` chưa có trên máy local, Docker trước tiên sẽ pull image rồi build app image của bạn. Nếu mọi việc diễn ra suôn sẻ, image của bạn đã sẵn sàng! Chạy `docker image ls` để liệt kê các image.

Bước cuối cùng trong phần này là chạy image và kiểm tra xem nó có thực sự hoạt động hay không (thay `yourusername` bằng username của bạn).

```bash
$ docker run -p 8888:5000 yourusername/catnip
 * Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)
```

Command vừa chạy dùng port 5000 cho server bên trong container và expose port này ra ngoài trên host port 8888. Mở `http://localhost:8888` trong browser, tại đó app của bạn sẽ hoạt động.

> **Lưu ý macOS (Xung đột port 5000):** Trên macOS Monterey (12.0) và các phiên bản mới hơn, tính năng AirPlay Receiver của Apple mặc định lắng nghe trên host port `5000`. Nếu bạn thử bind port 5000 trực tiếp vào host (`-p 5000:5000`) và gặp lỗi `port is already allocated`, bạn có thể map sang một host port khác (như `-p 8888:5000` ở trên) hoặc tắt AirPlay Receiver trong **System Settings > General > AirDrop & Handoff**.

![gif website mèo](../../../../assets/catgif.webp)

Chúc mừng! Bạn đã tạo và build thành công Docker image đầu tiên của mình.
