---
title: Quy trình phát triển
---

Trước khi chuyển sang phần tiếp theo, còn một điều cuối cùng tôi muốn đề cập về docker-compose. Như đã nói trước đó, docker-compose thực sự rất hữu ích cho việc phát triển và testing. Vì vậy, hãy xem chúng ta có thể cấu hình Compose như thế nào để công việc phát triển trở nên dễ dàng hơn.

Trong suốt tutorial này, chúng ta đã làm việc với các Docker image có sẵn. Mặc dù đã tự build image từ đầu, chúng ta vẫn chưa đụng đến code của bất kỳ application nào mà chủ yếu chỉ chỉnh sửa Dockerfile và cấu hình YAML. Có một điều chắc hẳn bạn đang thắc mắc: workflow trong quá trình phát triển sẽ như thế nào? Có phải mỗi khi thay đổi là chúng ta phải tạo Docker image mới, publish image rồi chạy nó để xem thay đổi có hoạt động như mong đợi không? Tôi chắc rằng cách đó nghe thật sự rất tốn công. Hẳn phải có cách tốt hơn. Trong phần này, chúng ta sẽ khám phá chính điều đó.

Hãy xem chúng ta có thể thực hiện thay đổi như thế nào trên app Foodtrucks vừa chạy. Hãy đảm bảo app đang chạy,

```bash
$ docker container ls
CONTAINER ID        IMAGE                                                 COMMAND                  CREATED             STATUS              PORTS                              NAMES
5450ebedd03c        prakhar1989/foodtrucks-web                            "python3 app.py"         9 seconds ago       Up 6 seconds        0.0.0.0:5000->5000/tcp             foodtrucks_web_1
05d408b25dfe        docker.elastic.co/elasticsearch/elasticsearch:6.3.2   "/usr/local/bin/dock…"   10 hours ago        Up 10 hours         0.0.0.0:9200->9200/tcp, 9300/tcp   es
```

Bây giờ hãy xem liệu chúng ta có thể thay đổi app này để hiển thị thông báo `Hello world!` khi có request đến route `/hello` hay không. Hiện tại, app trả về 404.

```bash
$ curl -I 0.0.0.0:5000/hello
HTTP/1.0 404 NOT FOUND
Content-Type: text/html
Content-Length: 233
Server: Werkzeug/0.11.2 Python/2.7.15rc1
Date: Mon, 30 Jul 2018 15:34:38 GMT
```

Tại sao lại xảy ra điều này? Vì đây là một Flask app, chúng ta có thể xem `app.py` ([liên kết](https://github.com/prakhar1989/FoodTrucks/blob/master/flask-app/app.py#L48-L64)) để tìm câu trả lời. Trong Flask, các route được định nghĩa bằng cú pháp @app.route. Trong file này, bạn sẽ thấy chúng ta chỉ định nghĩa ba route là `/`, `/debug` và `/search`. Route `/` render app chính, route `debug` được dùng để trả về một số thông tin debug, và cuối cùng `search` được app sử dụng để query elasticsearch.

```bash
$ curl 0.0.0.0:5000/debug
{
  "msg": "yellow open sfdata Ibkx7WYjSt-g8NZXOEtTMg 5 1 618 0 1.3mb 1.3mb\n",
  "status": "success"
}
```

Với bối cảnh đó, làm thế nào để thêm một route mới cho `hello`? Bạn đoán đúng rồi! Hãy mở `flask-app/app.py` bằng editor yêu thích của bạn và thực hiện thay đổi sau

```python
@app.route('/')
def index():
  return render_template("index.html")

# add a new hello route
@app.route('/hello')
def hello():
  return "hello world!"
```

Bây giờ hãy thử gửi request lần nữa

```bash
$ curl -I 0.0.0.0:5000/hello
HTTP/1.0 404 NOT FOUND
Content-Type: text/html
Content-Length: 233
Server: Werkzeug/0.11.2 Python/2.7.15rc1
Date: Mon, 30 Jul 2018 15:34:38 GMT
```

Ôi không! Cách đó không hoạt động! Chúng ta đã làm sai điều gì? Mặc dù đã thay đổi `app.py`, file này nằm trên máy của chúng ta (hay máy host), nhưng Docker đang chạy các container dựa trên image `prakhar1989/foodtrucks-web`, nên nó không biết về thay đổi này. Để kiểm chứng, hãy thử lệnh sau -

```
$ docker-compose run web bash
Starting es ... done
root@581e351c82b0:/opt/flask-app# ls
app.py        package-lock.json  requirements.txt  templates
node_modules  package.json       static            webpack.config.js
root@581e351c82b0:/opt/flask-app# grep hello app.py
root@581e351c82b0:/opt/flask-app# exit
```

Điều chúng ta đang cố gắng làm ở đây là kiểm chứng rằng các thay đổi của mình không nằm trong `app.py` đang chạy bên trong container. Chúng ta thực hiện việc này bằng cách chạy lệnh `docker-compose run`, tương tự như người họ hàng `docker run` của nó nhưng nhận thêm các argument cho service (trong [trường hợp](https://github.com/prakhar1989/FoodTrucks/blob/master/docker-compose.yml#L12) này là `web`). Ngay khi chạy `bash`, shell sẽ mở tại `/opt/flask-app` như được chỉ định trong [Dockerfile](https://github.com/prakhar1989/FoodTrucks/blob/master/Dockerfile#L13). Từ lệnh grep, chúng ta có thể thấy các thay đổi chưa có trong file.

Hãy xem chúng ta có thể khắc phục việc này như thế nào. Trước hết, chúng ta cần nói cho docker compose không sử dụng image mà thay vào đó sử dụng các file ở local. Chúng ta cũng sẽ đặt debug mode thành `true` để Flask biết cần reload server khi `app.py` thay đổi. Hãy thay phần `web` trong file `docker-compose.yml` như sau:

```yaml
version: "3"
services:
  es:
    image: docker.elastic.co/elasticsearch/elasticsearch:6.3.2
    container_name: es
    environment:
      - discovery.type=single-node
    ports:
      - 9200:9200
    volumes:
      - esdata1:/usr/share/elasticsearch/data
  web:
    build: . # replaced image with build
    command: python3 app.py
    environment:
      - DEBUG=True # set an env var for flask
    depends_on:
      - es
    ports:
      - "5000:5000"
    volumes:
      - ./flask-app:/opt/flask-app
volumes:
  esdata1:
    driver: local
```

Với thay đổi đó ([diff](https://github.com/prakhar1989/FoodTrucks/commit/31368936de5959efaf4457a94c678d21e3eefbce)), hãy stop rồi start lại các container.

```bash
$ docker-compose down -v
Stopping foodtrucks_web_1 ... done
Stopping es               ... done
Removing foodtrucks_web_1 ... done
Removing es               ... done
Removing network foodtrucks_default
Removing volume foodtrucks_esdata1

$ docker-compose up -d
Creating network "foodtrucks_default" with the default driver
Creating volume "foodtrucks_esdata1" with local driver
Creating es ... done
Creating foodtrucks_web_1 ... done
```

Bước cuối cùng, hãy thực hiện thay đổi trong `app.py` bằng cách thêm một route mới. Sau đó thử curl

```bash
$ curl 0.0.0.0:5000/hello
hello world
```

Woohoo! Chúng ta đã nhận được response hợp lệ! Hãy thử thực hiện thêm các thay đổi khác trong app.

Vậy là kết thúc phần tìm hiểu về Docker Compose. Với Docker Compose, bạn cũng có thể pause các service, chạy một one-off command trên container và thậm chí scale số lượng container. Tôi cũng khuyên bạn nên xem thêm một vài [use-case khác](https://docs.docker.com/compose/overview/#common-use-cases) của Docker Compose. Hy vọng tôi đã cho bạn thấy việc quản lý môi trường multi-container bằng Compose dễ dàng đến mức nào. Trong phần cuối, chúng ta sẽ deploy app lên AWS!
