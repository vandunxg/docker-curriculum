---
title: Mạng Docker
---

Trước khi nói về những tính năng Docker cung cấp, đặc biệt để xử lý những kịch bản như vậy, hãy xem liệu chúng ta có thể tìm ra cách giải quyết vấn đề này không. Hy vọng việc này sẽ giúp bạn hiểu rõ hơn về tính năng cụ thể mà chúng ta sắp tìm hiểu.

Được rồi, hãy chạy `docker container ls` (giống với `docker ps`) để xem chúng ta có gì.

```bash
$ docker container ls
CONTAINER ID        IMAGE                                                 COMMAND                  CREATED             STATUS              PORTS                                            NAMES
277451c15ec1        docker.elastic.co/elasticsearch/elasticsearch:6.3.2   "/usr/local/bin/dock…"   17 minutes ago      Up 17 minutes       0.0.0.0:9200->9200/tcp, 0.0.0.0:9300->9300/tcp   es
```

Chúng ta có một container ES đang chạy trên port `0.0.0.0:9200`, nơi chúng ta có thể truy cập trực tiếp. Nếu có thể bảo Flask app kết nối đến URL này, nó sẽ có thể kết nối và giao tiếp với ES, đúng không? Hãy xem [code Python](https://github.com/prakhar1989/FoodTrucks/blob/master/flask-app/app.py#L7) của chúng ta để biết thông tin kết nối được định nghĩa như thế nào.

```python
es = Elasticsearch(host='es')
```

Để cách này hoạt động, chúng ta cần cho Flask container biết rằng ES container đang chạy trên host `0.0.0.0` (port mặc định là `9200`), và như vậy thì nó sẽ hoạt động, đúng không? Đáng tiếc là không phải vậy, vì IP `0.0.0.0` là IP dùng để truy cập ES container từ **host machine**, tức là từ máy Mac của tôi. Một container khác sẽ không thể truy cập nó bằng cùng địa chỉ IP đó. Nếu không phải IP đó, vậy ES container có thể được truy cập bằng địa chỉ IP nào? Rất vui vì bạn đã hỏi câu này.

Bây giờ là lúc thích hợp để bắt đầu tìm hiểu về networking trong Docker. Khi docker được cài đặt, nó tự động tạo ba network.

```bash
$ docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
c2c695315b3a        bridge              bridge              local
a875bec5d6fd        host                host                local
ead0e804a67b        none                null                local
```

Network **bridge** là network mà các container được chạy trong đó theo mặc định. Điều đó có nghĩa là khi tôi chạy ES container, nó đang chạy trong network bridge này. Để xác nhận điều đó, hãy inspect network.

```bash
$ docker network inspect bridge
[
    {
        "Name": "bridge",
        "Id": "c2c695315b3aaf8fc30530bb3c6b8f6692cedd5cc7579663f0550dfdd21c9a26",
        "Created": "2018-07-28T20:32:39.405687265Z",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": null,
            "Config": [
                {
                    "Subnet": "172.17.0.0/16",
                    "Gateway": "172.17.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "277451c15ec183dd939e80298ea4bcf55050328a39b04124b387d668e3ed3943": {
                "Name": "es",
                "EndpointID": "5c417a2fc6b13d8ec97b76bbd54aaf3ee2d48f328c3f7279ee335174fbb4d6bb",
                "MacAddress": "02:42:ac:11:00:02",
                "IPv4Address": "172.17.0.2/16",
                "IPv6Address": ""
            }
        },
        "Options": {
            "com.docker.network.bridge.default_bridge": "true",
            "com.docker.network.bridge.enable_icc": "true",
            "com.docker.network.bridge.enable_ip_masquerade": "true",
            "com.docker.network.bridge.host_binding_ipv4": "0.0.0.0",
            "com.docker.network.bridge.name": "docker0",
            "com.docker.network.driver.mtu": "1500"
        },
        "Labels": {}
    }
]
```

Bạn có thể thấy container `277451c15ec1` của chúng ta được liệt kê trong phần `Containers` của output. Chúng ta cũng thấy địa chỉ IP được cấp cho container này là `172.17.0.2`. Đây có phải địa chỉ IP chúng ta đang tìm không? Hãy thử bằng cách chạy flask container và truy cập IP này.

```bash
$ docker run -it --rm prakhar1989/foodtrucks-web bash
root@35180ccc206a:/opt/flask-app# curl 172.17.0.2:9200
{
  "name" : "Jane Foster",
  "cluster_name" : "elasticsearch",
  "version" : {
    "number" : "2.1.1",
    "build_hash" : "40e2c53a6b6c2972b3d13846e450e66f4375bd71",
    "build_timestamp" : "2015-12-15T13:05:55Z",
    "build_snapshot" : false,
    "lucene_version" : "5.3.1"
  },
  "tagline" : "You Know, for Search"
}
root@35180ccc206a:/opt/flask-app# exit
```

Đến đây, mọi thứ hẳn đã khá rõ ràng. Chúng ta khởi động container ở chế độ interactive với process `bash`. `--rm` là một flag tiện lợi khi chạy các lệnh one-off, vì container sẽ được dọn dẹp sau khi hoàn tất công việc. Chúng ta thử dùng `curl`, nhưng trước tiên cần cài đặt nó. Sau khi làm vậy, chúng ta thấy mình thực sự có thể giao tiếp với ES tại `172.17.0.2:9200`. Tuyệt!

Mặc dù đã tìm ra cách để các container giao tiếp với nhau, cách tiếp cận này vẫn còn hai vấn đề:

1. Làm thế nào để cho Flask container biết hostname `es` tương ứng với `172.17.0.2` hoặc một IP nào đó khác, vì IP có thể thay đổi?

2. Vì network _bridge_ được chia sẻ theo mặc định bởi mọi container, phương pháp này **không an toàn**. Làm thế nào để cô lập network của chúng ta?

Tin tốt là Docker có câu trả lời tuyệt vời cho các câu hỏi này. Docker cho phép chúng ta định nghĩa network riêng và giữ chúng isolated bằng command `docker network`.

Trước hết, hãy tạo network riêng của chúng ta.

```bash
$ docker network create foodtrucks-net
0815b2a3bb7a6608e850d05553cc0bda98187c4528d94621438f31d97a6fea3c

$ docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
c2c695315b3a        bridge              bridge              local
0815b2a3bb7a        foodtrucks-net      bridge              local
a875bec5d6fd        host                host                local
ead0e804a67b        none                null                local
```

Command `network create` tạo một network _bridge_ mới, đúng với thứ chúng ta cần lúc này. Theo cách gọi của Docker, network bridge sử dụng một software bridge cho phép các container được kết nối vào cùng network bridge giao tiếp với nhau, đồng thời cô lập chúng khỏi các container không kết nối vào network bridge đó. Docker bridge driver tự động cài đặt các rule trên host machine để các container thuộc những network bridge khác nhau không thể giao tiếp trực tiếp với nhau. Bạn có thể tạo thêm những loại network khác, và nên đọc về chúng trong [docs chính thức](https://docs.docker.com/engine/userguide/networking/dockernetworks/).

Bây giờ chúng ta đã có network, có thể khởi chạy các container bên trong network này bằng flag `--net`. Hãy làm vậy, nhưng trước tiên, để khởi chạy một container mới với cùng tên, chúng ta sẽ stop và remove ES container đang chạy trong network bridge (mặc định).

```bash
$ docker container stop es
es

$ docker container rm es
es

$ docker run -d --name es --net foodtrucks-net -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:6.3.2
13d6415f73c8d88bddb1f236f584b63dbaf2c3051f09863a3f1ba219edba3673

$ docker network inspect foodtrucks-net
[
    {
        "Name": "foodtrucks-net",
        "Id": "0815b2a3bb7a6608e850d05553cc0bda98187c4528d94621438f31d97a6fea3c",
        "Created": "2018-07-30T00:01:29.1500984Z",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "172.18.0.0/16",
                    "Gateway": "172.18.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "13d6415f73c8d88bddb1f236f584b63dbaf2c3051f09863a3f1ba219edba3673": {
                "Name": "es",
                "EndpointID": "29ba2d33f9713e57eb6b38db41d656e4ee2c53e4a2f7cf636bdca0ec59cd3aa7",
                "MacAddress": "02:42:ac:12:00:02",
                "IPv4Address": "172.18.0.2/16",
                "IPv6Address": ""
            }
        },
        "Options": {},
        "Labels": {}
    }
]
```

Như bạn thấy, `es` container hiện đang chạy bên trong network bridge `foodtrucks-net`. Bây giờ hãy inspect điều gì xảy ra khi chúng ta khởi chạy trong network `foodtrucks-net`.

```bash
$ docker run -it --rm --net foodtrucks-net prakhar1989/foodtrucks-web bash
root@9d2722cf282c:/opt/flask-app# curl es:9200
{
  "name" : "wWALl9M",
  "cluster_name" : "docker-cluster",
  "cluster_uuid" : "BA36XuOiRPaghPNBLBHleQ",
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
root@53af252b771a:/opt/flask-app# ls
app.py  node_modules  package.json  requirements.txt  static  templates  webpack.config.js
root@53af252b771a:/opt/flask-app# python3 app.py
Index not found...
Loading data in elasticsearch ...
Total trucks loaded:  733
 * Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)
root@53af252b771a:/opt/flask-app# exit
```

Tuyệt! Cách này hoạt động. Trên các network do người dùng định nghĩa như `foodtrucks-net`, các container không chỉ có thể giao tiếp bằng địa chỉ IP mà còn có thể phân giải tên container thành địa chỉ IP. Khả năng này được gọi là _automatic service discovery_. Tuyệt vời! Bây giờ hãy khởi chạy Flask container thực sự:

```bash
$ docker run -d --net foodtrucks-net -p 5000:5000 --name foodtrucks-web prakhar1989/foodtrucks-web
852fc74de2954bb72471b858dce64d764181dca0cf7693fed201d76da33df794

$ docker container ls
CONTAINER ID        IMAGE                                                 COMMAND                  CREATED              STATUS              PORTS                                            NAMES
852fc74de295        prakhar1989/foodtrucks-web                            "python3 ./app.py"       About a minute ago   Up About a minute   0.0.0.0:5000->5000/tcp                           foodtrucks-web
13d6415f73c8        docker.elastic.co/elasticsearch/elasticsearch:6.3.2   "/usr/local/bin/dock…"   17 minutes ago       Up 17 minutes       0.0.0.0:9200->9200/tcp, 0.0.0.0:9300->9300/tcp   es

$ curl -I 0.0.0.0:5000
HTTP/1.0 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 3697
Server: Werkzeug/0.11.2 Python/2.7.6
Date: Sun, 10 Jan 2016 23:58:53 GMT
```

Hãy truy cập [http://0.0.0.0:5000](http://0.0.0.0:5000) và chiêm ngưỡng app tuyệt vời của bạn đang hoạt động! Dù có vẻ như đây là khá nhiều việc, thực ra chúng ta chỉ cần gõ 4 command để đi từ con số 0 đến lúc app chạy. Tôi đã tập hợp các command này trong một [bash script](https://github.com/prakhar1989/FoodTrucks/blob/master/setup-docker.sh).

```bash
#!/bin/bash

# build the flask container
docker build -t prakhar1989/foodtrucks-web .

# create the network
docker network create foodtrucks-net

# start the ES container
docker run -d --name es --net foodtrucks-net -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:6.3.2

# start the flask app container
docker run -d --net foodtrucks-net -p 5000:5000 --name foodtrucks-web prakhar1989/foodtrucks-web
```

Bây giờ hãy tưởng tượng bạn đang phân phối app cho một người bạn, hoặc chạy app trên một server đã cài docker. Bạn có thể khởi chạy toàn bộ app chỉ bằng một command!

```bash
$ git clone https://github.com/prakhar1989/FoodTrucks
$ cd FoodTrucks
$ ./setup-docker.sh
```

Vậy là xong! Nếu hỏi tôi, tôi thấy đây là một cách cực kỳ tuyệt vời và mạnh mẽ để chia sẻ cũng như chạy các app của bạn!
