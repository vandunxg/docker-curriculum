---
title: SF Food Trucks
---

Ứng dụng chúng ta sẽ Dockerize có tên là SF Food Trucks. Mục tiêu khi xây dựng ứng dụng này là tạo ra một thứ hữu ích (mang dáng dấp của một ứng dụng thực tế), phụ thuộc vào ít nhất một service nhưng không quá phức tạp cho mục đích của tutorial này. Và đây là kết quả.

![SF Food trucks](../../../../assets/foodtrucks.webp)

Backend của ứng dụng được viết bằng Python (Flask) và sử dụng [Elasticsearch](https://www.elastic.co/products/elasticsearch) để tìm kiếm. Cũng như mọi thứ khác trong tutorial này, toàn bộ source có trên [Github](http://github.com/prakhar1989/FoodTrucks). Chúng ta sẽ dùng ứng dụng này làm ứng viên để tìm hiểu cách build, chạy và triển khai một môi trường multi-container.

Trước tiên, hãy clone repository về máy local.

```bash
$ git clone https://github.com/prakhar1989/FoodTrucks
$ cd FoodTrucks
$ tree -L 2
.
├── Dockerfile
├── README.md
├── aws-compose.yml
├── docker-compose.yml
├── flask-app
│   ├── app.py
│   ├── package-lock.json
│   ├── package.json
│   ├── requirements.txt
│   ├── static
│   ├── templates
│   └── webpack.config.js
├── setup-aws-ecs.sh
├── setup-docker.sh
├── shot.png
└── utils
    ├── generate_geojson.py
    └── trucks.geojson
```

Thư mục `flask-app` chứa ứng dụng Python, còn thư mục `utils` chứa một số utility để load dữ liệu vào Elasticsearch. Thư mục này cũng có một số file YAML và một Dockerfile, chúng ta sẽ tìm hiểu chi tiết hơn về tất cả những thứ đó trong quá trình thực hiện tutorial. Nếu tò mò, bạn có thể xem qua các file này.

Giờ chắc bạn đã thấy hào hứng (hy vọng vậy), hãy cùng nghĩ xem chúng ta có thể Dockerize ứng dụng này như thế nào. Có thể thấy ứng dụng gồm một server backend Flask và một service Elasticsearch. Một cách tự nhiên để tách ứng dụng này là dùng hai container: một container chạy process Flask và một container khác chạy process Elasticsearch (ES). Nhờ vậy, nếu ứng dụng trở nên phổ biến, chúng ta có thể scale bằng cách thêm container tùy vào bottleneck nằm ở đâu.

Tốt, vậy là chúng ta cần hai container. Việc đó chắc không khó, đúng không? Ở phần trước, chúng ta đã tự build một Flask container. Còn với Elasticsearch, hãy thử xem có thể tìm thấy image nào trên hub không.

```bash
$ docker search elasticsearch
NAME                              DESCRIPTION                                     STARS     OFFICIAL   AUTOMATED
elasticsearch                     Elasticsearch is a powerful open source se...   697       [OK]
itzg/elasticsearch                Provides an easily configurable Elasticsea...   17                   [OK]
tutum/elasticsearch               Elasticsearch image - listens in port 9200.     15                   [OK]
barnybug/elasticsearch            Latest Elasticsearch 1.7.2 and previous re...   15                   [OK]
digitalwonderland/elasticsearch   Latest Elasticsearch with Marvel & Kibana       12                   [OK]
monsantoco/elasticsearch          ElasticSearch Docker image                      9                    [OK]
```

Không có gì bất ngờ, Elasticsearch có một [image](https://store.docker.com/images/elasticsearch) được hỗ trợ chính thức. Để chạy ES, chúng ta chỉ cần dùng `docker run` và nhanh chóng có một ES container single-node chạy local.

> Lưu ý: Elastic, công ty đứng sau Elasticsearch, duy trì [registry riêng](https://www.docker.elastic.co/) cho các sản phẩm Elastic. Bạn nên dùng image từ registry đó nếu dự định sử dụng Elasticsearch.

Trước tiên hãy pull image:

```bash
$ docker pull docker.elastic.co/elasticsearch/elasticsearch:6.3.2
```

sau đó chạy image ở development mode bằng cách chỉ định port và thiết lập một environment variable để cấu hình cluster Elasticsearch chạy dưới dạng single-node.

```bash
$ docker run -d --name es -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:6.3.2
277451c15ec183dd939e80298ea4bcf55050328a39b04124b387d668e3ed3943
```

> Lưu ý: Nếu container gặp vấn đề về memory, bạn có thể cần [điều chỉnh một số JVM flag](https://github.com/elastic/elasticsearch-docker/issues/43#issuecomment-289377878) để giới hạn mức tiêu thụ memory.

Như trên, chúng ta dùng `--name es` để đặt tên cho container, nhờ đó dễ sử dụng trong các command tiếp theo. Sau khi container khởi động, chúng ta có thể xem log bằng cách chạy `docker container logs` với tên (hoặc ID) của container để kiểm tra log. Nếu Elasticsearch khởi động thành công, bạn sẽ thấy log tương tự như dưới đây.

> Lưu ý: Elasticsearch mất vài giây để khởi động, vì vậy bạn có thể phải chờ trước khi thấy `initialized` trong log.

```bash
$ docker container ls
CONTAINER ID        IMAGE                                                 COMMAND                  CREATED             STATUS              PORTS                                            NAMES
277451c15ec1        docker.elastic.co/elasticsearch/elasticsearch:6.3.2   "/usr/local/bin/dock…"   2 minutes ago       Up 2 minutes        0.0.0.0:9200->9200/tcp, 0.0.0.0:9300->9300/tcp   es

$ docker container logs es
[2018-07-29T05:49:09,304][INFO ][o.e.n.Node               ] [] initializing ...
[2018-07-29T05:49:09,385][INFO ][o.e.e.NodeEnvironment    ] [L1VMyzt] using [1] data paths, mounts [[/ (overlay)]], net usable_space [54.1gb], net total_space [62.7gb], types [overlay]
[2018-07-29T05:49:09,385][INFO ][o.e.e.NodeEnvironment    ] [L1VMyzt] heap size [990.7mb], compressed ordinary object pointers [true]
[2018-07-29T05:49:11,979][INFO ][o.e.p.PluginsService     ] [L1VMyzt] loaded module [x-pack-security]
[2018-07-29T05:49:11,980][INFO ][o.e.p.PluginsService     ] [L1VMyzt] loaded module [x-pack-sql]
[2018-07-29T05:49:11,980][INFO ][o.e.p.PluginsService     ] [L1VMyzt] loaded module [x-pack-upgrade]
[2018-07-29T05:49:11,980][INFO ][o.e.p.PluginsService     ] [L1VMyzt] loaded module [x-pack-watcher]
[2018-07-29T05:49:11,981][INFO ][o.e.p.PluginsService     ] [L1VMyzt] loaded plugin [ingest-geoip]
[2018-07-29T05:49:11,981][INFO ][o.e.p.PluginsService     ] [L1VMyzt] loaded plugin [ingest-user-agent]
[2018-07-29T05:49:17,659][INFO ][o.e.d.DiscoveryModule    ] [L1VMyzt] using discovery type [single-node]
[2018-07-29T05:49:18,962][INFO ][o.e.n.Node               ] [L1VMyzt] initialized
[2018-07-29T05:49:18,963][INFO ][o.e.n.Node               ] [L1VMyzt] starting ...
[2018-07-29T05:49:19,218][INFO ][o.e.t.TransportService   ] [L1VMyzt] publish_address {172.17.0.2:9300}, bound_addresses {0.0.0.0:9300}
[2018-07-29T05:49:19,302][INFO ][o.e.x.s.t.n.SecurityNetty4HttpServerTransport] publish_address {172.17.0.2:9200}, bound_addresses {0.0.0.0:9200}
[2018-07-29T05:49:19,303][INFO ][o.e.n.Node               ] [L1VMyzt] started
[2018-07-29T05:49:19,439][WARN ][o.e.x.s.a.s.m.NativeRoleMappingStore] [L1VMyzt] Failed to clear cache for realms [[]]
[2018-07-29T05:49:19,542][INFO ][o.e.g.GatewayService     ] [L1VMyzt] recovered [0] indices into cluster_state
```

Giờ hãy thử gửi một request đến Elasticsearch container. Chúng ta dùng port `9200` để gửi request `cURL` đến container.

```bash
$ curl 0.0.0.0:9200
{
  "name" : "ijJDAOm",
  "cluster_name" : "docker-cluster",
  "cluster_uuid" : "a_nSV3XmTCqpzYYzb-LhNw",
  "version" : {
    "number" : "6.3.2",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "053779d",
    "build_date" : "2018-07-20T05:20:23.451332Z",
    "build_snapshot" : false,
    "lucene_version" : "7.3.1",
    "minimum_wire_compatibility_version" : "5.6.0",
    "minimum_index_compatibility_version" : "5.0.0"
  },
  "tagline" : "You Know, for Search"
}
```

Tuyệt! Mọi thứ có vẻ đang chạy tốt! Nhân tiện, hãy chạy luôn Flask container. Nhưng trước khi làm vậy, chúng ta cần một `Dockerfile`. Ở phần trước, chúng ta dùng image `python:3.8` làm base image. Tuy nhiên lần này, ngoài việc cài các dependency của Python bằng `pip`, chúng ta còn muốn ứng dụng generate file Javascript đã minify cho production. Vì cần một custom build step, chúng ta sẽ bắt đầu từ base image `ubuntu` để tự build `Dockerfile` từ đầu.

> Lưu ý: nếu một image có sẵn không đáp ứng nhu cầu của bạn, hãy bắt đầu từ một base image khác và tự điều chỉnh nó. Với hầu hết image trên Docker Hub, bạn có thể tìm Dockerfile tương ứng trên Github. Đọc các Dockerfile có sẵn là một trong những cách tốt nhất để học cách tự viết Dockerfile.

[Dockerfile](https://github.com/prakhar1989/FoodTrucks/blob/master/Dockerfile) cho Flask app của chúng ta như sau -

```dockerfile
# start from base
FROM ubuntu:18.04

MAINTAINER Prakhar Srivastav <prakhar@prakhar.me>

# install system-wide deps for python and node
RUN apt-get -yqq update
RUN apt-get -yqq install python3-pip python3-dev curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash
RUN apt-get install -yq nodejs

# copy our application code
ADD flask-app /opt/flask-app
WORKDIR /opt/flask-app

# fetch app specific deps
RUN npm install
RUN npm run build
RUN pip3 install -r requirements.txt

# expose port
EXPOSE 5000

# start app
CMD [ "python3", "./app.py" ]
```

Có khá nhiều điều mới trong file này, vì vậy hãy cùng xem nhanh qua. Chúng ta bắt đầu với [Ubuntu LTS](https://wiki.ubuntu.com/LTS) base image và dùng package manager `apt-get` để cài các dependency, cụ thể là Python và Node. Flag `yqq` được dùng để ẩn output và tự động trả lời "Yes" cho mọi prompt.

Tiếp đó, chúng ta dùng command `ADD` để copy ứng dụng vào một volume mới trong container - `/opt/flask-app`. Đây là nơi code của chúng ta sẽ nằm. Chúng ta cũng đặt đây làm working directory, để các command tiếp theo chạy trong ngữ cảnh của vị trí này. Sau khi đã cài các dependency system-wide, chúng ta chuyển sang cài các dependency riêng cho app. Đầu tiên là Node: cài các package từ npm và chạy build command được định nghĩa trong `package.json` [file](https://github.com/prakhar1989/FoodTrucks/blob/master/flask-app/package.json#L7-L9). Cuối cùng, chúng ta cài các package Python, expose port và định nghĩa `CMD` cần chạy giống như ở phần trước.

Cuối cùng, chúng ta có thể build image và chạy container (hãy thay `prakhar1989` bằng username của bạn bên dưới).

```bash
$ docker build -t prakhar1989/foodtrucks-web .
```

Lần chạy đầu tiên sẽ mất một chút thời gian vì Docker client phải download image ubuntu, chạy tất cả command và chuẩn bị image cho bạn. Sau mỗi lần bạn thay đổi code của ứng dụng, chạy lại `docker build` sẽ gần như ngay lập tức. Giờ hãy thử chạy ứng dụng.

```bash
$ docker run -P --rm prakhar1989/foodtrucks-web
Unable to connect to ES. Retying in 5 secs...
Unable to connect to ES. Retying in 5 secs...
Unable to connect to ES. Retying in 5 secs...
Out of retries. Bailing out...
```

Ối! Flask app không thể chạy vì không kết nối được tới Elasticsearch. Làm thế nào để một container biết về container kia và để chúng giao tiếp với nhau? Câu trả lời nằm ở phần tiếp theo.
