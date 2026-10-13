---
title: AWS ECS & Copilot CLI
---

Ở phần trước, chúng ta đã dùng `docker compose` để chạy ứng dụng cục bộ bằng một lệnh duy nhất: `docker compose up`. Bây giờ khi đã có một ứng dụng multi-container hoạt động, hãy tìm hiểu cách triển khai các ứng dụng được container hóa lên môi trường production trên AWS.

AWS cung cấp nhiều lựa chọn hiện đại để chạy container:

1. **[AWS App Runner](https://aws.amazon.com/apprunner/)** — Dịch vụ được quản lý hoàn toàn để build và chạy các web application được container hóa trực tiếp từ source hoặc image repository.
2. **[AWS Elastic Container Service (ECS) with Fargate](https://aws.amazon.com/ecs/)** — Tài nguyên compute serverless cho container, tự động provision và scale các Amazon ECS task mà không cần instance EC2.
3. **[AWS Elastic Kubernetes Service (EKS)](https://aws.amazon.com/eks/)** — Kubernetes được quản lý trên AWS.

Trong phần này, chúng ta sẽ tìm hiểu **AWS Elastic Container Service (ECS)** chạy trên **AWS Fargate**, sử dụng developer tool chính thức của AWS: **AWS Copilot CLI**.

### AWS Copilot là gì?

[AWS Copilot CLI](https://aws.amazon.com/containers/copilot/) là CLI hiện đại, chính thức để build, release và vận hành các app được container hóa, sẵn sàng cho production trên AWS App Runner và AWS ECS Fargate. CLI này tự động thiết lập infrastructure như VPC, load balancer, security group và ECS service theo kiến trúc best practice.

> **Lưu ý về `ecs-cli`:** Các phiên bản tutorial AWS trước đây khuyến nghị dùng `ecs-cli`. AWS đã chính thức deprecated `ecs-cli` để thay thế bằng AWS Copilot.

### Cài đặt AWS Copilot

Cài đặt AWS Copilot CLI theo [hướng dẫn chính thức](https://aws.amazon.com/containers/copilot/):

* **Mac (Homebrew):** `brew install aws/tap/copilot-cli`
* **Linux:** Download binary từ AWS GitHub releases:
  ```bash
  curl -Lo copilot https://github.com/aws/copilot-cli/releases/latest/download/copilot-linux
  chmod +x copilot
  sudo mv copilot /usr/local/bin/copilot
  ```

Kiểm tra cài đặt:

```bash
$ copilot --version
copilot version: v1.34.0
```

### Triển khai bằng Copilot

Đảm bảo bạn đã cấu hình AWS CLI với credential đang hoạt động (`aws configure`).

#### 1. Khởi tạo ứng dụng

Bên trong thư mục project chứa Dockerfile, khởi tạo Copilot:

```bash
$ copilot init
```

Copilot sẽ hướng dẫn bạn qua một prompt tương tác:
- **Tên application:** `foodtrucks`
- **Loại workload:** `Load Balanced Web Service`
- **Tên service:** `web`
- **Dockerfile:** `./Dockerfile` hoặc `./flask-app/Dockerfile`

Copilot tạo một infrastructure blueprint trong thư mục `copilot/` và thiết lập build pipeline cho bạn.

#### 2. Triển khai lên environment

Để khởi chạy service trên AWS Fargate:

```bash
$ copilot deploy
```

AWS Copilot sẽ:
1. Build Docker container image cục bộ.
2. Push image lên Amazon ECR (Elastic Container Registry).
3. Provision AWS Fargate cluster, VPC, subnet và Application Load Balancer.
4. Deploy container và trả về một URL HTTPS công khai.

```bash
✔ Deployed service web
Recommended follow-up actions:
  - View service status: copilot svc status
  - Access your service at: http://foodtrucks-publi-123456789.us-east-1.elb.amazonaws.com
```

### Giám sát và trạng thái

Kiểm tra các container đang chạy và xem log CloudWatch trực tiếp từ terminal:

```bash
# View service status and health
$ copilot svc status

# Stream container logs live
$ copilot svc logs --follow
```

### Dọn dẹp

Khi hoàn tất việc test ứng dụng, hãy xóa toàn bộ AWS resource và infrastructure để tránh phát sinh chi phí liên tục:

```bash
$ copilot app delete --yes
✔ Deleted service web from environment test
✔ Deleted environment test from application foodtrucks
✔ Deleted application foodtrucks
```

AWS Copilot giúp việc chạy các ứng dụng được container hóa trên AWS trở nên đơn giản, an toàn và hoàn toàn tự động!
