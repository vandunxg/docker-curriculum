---
title: Image đầu tiên của chúng ta
---

Giờ chúng ta đã hiểu rõ hơn về image, đã đến lúc tự tạo image của mình. Mục tiêu của phần này là tạo một image để sandbox một ứng dụng [Flask](http://flask.pocoo.org) đơn giản. Trong workshop này, tôi đã tạo sẵn một [Flask app](https://github.com/prakhar1989/docker-curriculum/tree/master/flask-app) nhỏ thú vị, hiển thị một file `.gif` mèo ngẫu nhiên mỗi khi được tải - vì bạn biết đấy, ai lại không thích mèo? Nếu bạn chưa làm vậy, hãy clone repository về máy local như sau -

```bash
$ git clone https://github.com/prakhar1989/docker-curriculum.git
$ cd docker-curriculum/flask-app
```

> Bạn nên clone repository này trên máy đang chạy các Docker command, _không phải_ bên trong một Docker container.

Bước tiếp theo là tạo một image với web app này. Như đã đề cập ở trên, mọi user image đều dựa trên một base image. Vì application của chúng ta được viết bằng Python, base image chúng ta sẽ dùng là [Python 3](https://hub.docker.com/_/python/).
