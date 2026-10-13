---
title: Docker trên AWS
---

Một ứng dụng không thể chia sẻ với bạn bè thì có ích gì, đúng không? Vì vậy trong phần này, chúng ta sẽ xem cách triển khai ứng dụng tuyệt vời của mình lên cloud để có thể chia sẻ với bạn bè! Chúng ta sẽ dùng AWS [Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/) để đưa ứng dụng vào hoạt động chỉ với vài cú nhấp chuột. Chúng ta cũng sẽ thấy việc làm cho ứng dụng có khả năng scale và dễ quản lý với Beanstalk đơn giản đến mức nào!

#### Docker push

Việc đầu tiên cần làm trước khi triển khai ứng dụng lên AWS là publish image lên một registry mà AWS có thể truy cập. Có nhiều [Docker registry](https://aws.amazon.com/ecr/) khác nhau mà bạn có thể sử dụng (thậm chí bạn có thể host [registry của riêng mình](https://docs.docker.com/registry/deploying/)). Hiện tại, hãy dùng [Docker Hub](https://hub.docker.com) để publish image.

Nếu đây là lần đầu bạn push một image, client sẽ yêu cầu bạn đăng nhập. Hãy cung cấp thông tin đăng nhập giống với thông tin bạn đã dùng để đăng nhập Docker Hub.

```bash
$ docker login
Login in with your Docker ID to push and pull images from Docker Hub. If you do not have a Docker ID, head over to https://hub.docker.com to create one.
Username: yourusername
Password:
WARNING! Your password will be stored unencrypted in /Users/yourusername/.docker/config.json
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credential-helpers

Login Succeeded
```

Để publish, chỉ cần nhập lệnh dưới đây và nhớ thay tên image tag ở trên bằng tên của bạn. Điều quan trọng là phải dùng định dạng `yourusername/image_name` để client biết nơi cần publish.

```bash
$ docker push yourusername/catnip
```

Sau khi hoàn tất, bạn có thể xem image của mình trên Docker Hub. Ví dụ, đây là [trang web](https://hub.docker.com/r/prakhar1989/catnip/) của image của tôi.

> Lưu ý: Trước khi tiếp tục, tôi muốn làm rõ một điều: bạn **không bắt buộc** phải host image trên một public registry (hoặc bất kỳ registry nào) để triển khai lên AWS. Nếu đang viết code cho startup kỳ lân trị giá hàng triệu đô tiếp theo, bạn hoàn toàn có thể bỏ qua bước này. Lý do chúng ta publish image công khai là vì cách này giúp việc triển khai đơn giản hơn nhiều nhờ bỏ qua một vài bước cấu hình trung gian.

Giờ image của bạn đã online, bất kỳ ai cài docker đều có thể chạy thử ứng dụng chỉ bằng một lệnh.

```bash
$ docker run -p 8888:5000 yourusername/catnip
```

Nếu trước đây bạn từng vò đầu bứt tóc vì việc thiết lập môi trường dev local hoặc chia sẻ cấu hình ứng dụng, hẳn bạn hiểu điều này tuyệt vời đến mức nào. Đó là lý do Docker thật tuyệt!

#### Beanstalk

AWS Elastic Beanstalk (EB) là một PaaS (Platform as a Service) do AWS cung cấp. Nếu đã từng dùng Heroku, Google App Engine, v.v., bạn sẽ cảm thấy rất quen thuộc. Với tư cách developer, bạn chỉ cần cho EB biết cách chạy ứng dụng và nó sẽ lo phần còn lại, bao gồm scale, monitoring và thậm chí cả update. Vào tháng 4 năm 2014, EB bổ sung hỗ trợ chạy các deployment Docker một container, và đó là cách chúng ta sẽ dùng để triển khai ứng dụng. Mặc dù EB có [CLI](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html) rất trực quan, CLI vẫn cần một số bước setup, nên để mọi thứ đơn giản, chúng ta sẽ dùng web UI để khởi chạy ứng dụng.

Để làm theo hướng dẫn, bạn cần một tài khoản [AWS](http://aws.amazon.com) đang hoạt động. Nếu chưa có, hãy đăng ký ngay bây giờ, bạn sẽ cần nhập thông tin thẻ tín dụng. Nhưng đừng lo, tài khoản này miễn phí và mọi thứ chúng ta làm trong tutorial này cũng sẽ miễn phí! Hãy bắt đầu.

Các bước như sau:

- Đăng nhập vào [console](http://console.aws.amazon.com) AWS.
- Nhấp vào Elastic Beanstalk. Nó nằm trong phần compute ở góc trên bên trái. Ngoài ra, bạn có thể truy cập [Elastic Beanstalk console](https://console.aws.amazon.com/elasticbeanstalk).

![EB Start](../../../../assets/eb-start.webp)

- Nhấp vào "Create New Application" ở góc trên bên phải.
- Đặt một tên dễ nhớ (nhưng duy nhất) cho app và cung cấp phần mô tả (không bắt buộc).
- Trong màn hình **New Environment**, tạo một environment mới và chọn **Web Server Environment**.
- Điền thông tin environment bằng cách chọn một domain. URL này sẽ được chia sẻ với bạn bè, vì vậy hãy đảm bảo nó dễ nhớ.
- Trong phần base configuration, chọn _Docker_ ở _predefined platform_.

![EB Start](../../../../assets/eb-docker.webp)

- Bây giờ chúng ta cần upload code của ứng dụng. Nhưng vì ứng dụng đã được đóng gói trong một Docker container, chúng ta chỉ cần cho EB biết về container đó. Mở [file](https://github.com/prakhar1989/docker-curriculum/blob/master/flask-app/Dockerrun.aws.json) `Dockerrun.aws.json` nằm trong thư mục `flask-app` và sửa `Name` của image thành tên image của bạn. Đừng lo, tôi sẽ giải thích nội dung file này ngay sau đây. Khi hoàn tất, chọn radio button "Upload your Code", chọn file này rồi nhấp vào "Upload".
- Bây giờ nhấp vào "Create environment". Màn hình cuối cùng bạn nhìn thấy sẽ có một vài spinner cho biết environment đang được thiết lập. Lần setup đầu tiên thường mất khoảng 5 phút.

Trong lúc chờ, hãy cùng xem nhanh file `Dockerrun.aws.json` chứa gì. Đây về cơ bản là một file dành riêng cho AWS, dùng để cung cấp cho EB thông tin chi tiết về ứng dụng và cấu hình Docker.

```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "prakhar1989/catnip",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": 5000,
      "HostPort": 8000
    }
  ],
  "Logging": "/var/log/nginx"
}
```

Nội dung file khá dễ hiểu, nhưng bạn luôn có thể xem [tài liệu tham khảo](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_docker_image.html#create_deploy_docker_image_dockerrun) chính thức để biết thêm thông tin. Chúng ta cung cấp tên image mà EB nên sử dụng cùng với một port mà container cần mở.

Hy vọng đến lúc này instance của chúng ta đã sẵn sàng. Hãy mở trang EB, bạn sẽ thấy một dấu tick màu xanh cho biết app đang hoạt động.

![EB Deploy](../../../../assets/eb-deploy.webp)

Hãy mở URL trong trình duyệt, bạn sẽ thấy ứng dụng đang hoạt động đầy đủ. Bạn có thể gửi link này qua email, IM hoặc Snapchat cho bạn bè và gia đình để họ cũng thưởng thức một vài GIF mèo.

#### Dọn dẹp

Sau khi tận hưởng thành quả từ app, hãy nhớ terminate environment để không bị tính phí cho các resource bổ sung.

![EB terminate](../../../../assets/eb-terminate.webp)

Chúc mừng! Bạn đã triển khai ứng dụng Docker đầu tiên của mình! Có thể các bước trên trông khá nhiều, nhưng với [command-line tool cho EB](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html), bạn gần như có thể mô phỏng chức năng của Heroku chỉ với vài lần gõ phím! Hy vọng bạn đồng ý rằng Docker giúp loại bỏ rất nhiều nỗi khó khăn khi xây dựng và triển khai ứng dụng lên cloud. Tôi khuyến khích bạn đọc [tài liệu](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/docker-singlecontainer-deploy.html) AWS về môi trường Docker một container để biết những tính năng hiện có.

Trong phần tiếp theo (và cũng là phần cuối) của tutorial, chúng ta sẽ nâng mức độ lên một chút và triển khai một ứng dụng gần với thực tế hơn: một app có tầng lưu trữ back-end persistent. Hãy bắt đầu ngay.
