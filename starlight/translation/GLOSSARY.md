# Glossary — Practical Docker Vietnamese

Glossary là guideline để chọn từ nhanh và tự nhiên, không phải rule replace tuyệt đối.

- ưu tiên cách developer Việt Nam thực tế sử dụng;
- giữ English nếu bản dịch tiếng Việt gượng hoặc mất precision;
- dùng tiếng Việt nếu ngắn, rõ và quen thuộc;
- consistency theo concept và context;
- không đổi identifier, code, URL, image name hoặc proper noun.

| Term | Cách dùng thường ưu tiên | Ghi chú |
| --- | --- | --- |
| image | image / ảnh image | Trong Docker context ưu tiên `image` |
| container | container | Không bắt buộc “vùng chứa” |
| registry | registry / kho image | |
| repository | repository / kho | Phân biệt với source repository theo context |
| Dockerfile | Dockerfile | Giữ nguyên |
| build | build / xây dựng image | Giữ `build` khi nói về command |
| run | chạy / run | Giữ command `docker run` |
| runtime | runtime / môi trường chạy | |
| deployment | deployment / triển khai | |
| container runtime | container runtime | |
| daemon | daemon / tiến trình nền | |
| volume | volume / vùng lưu trữ | |
| bind mount | bind mount | |
| network | network / mạng | Giữ `network` trong Docker object hoặc command |
| port | port / cổng | |
| expose / publish | expose / publish port | Phân biệt với nhau theo Docker semantics |
| image tag | image tag / tag image | |
| layer | layer / lớp image | |
| cache | cache | |
| multi-stage build | multi-stage build / build nhiều stage | |
| Compose | Compose | Không đổi thành “sáng tác” |
| service | service / dịch vụ | |
| orchestration | orchestration / điều phối | |
| swarm | Swarm | Tên sản phẩm giữ nguyên |
| cluster | cluster / cụm | |
| host | host / máy host | |
| process | process / tiến trình | |
| shell | shell | |
| environment variable | biến môi trường | |
| request | request / yêu cầu | Giữ `request` khi nói về object hoặc flow |
| response | response / phản hồi | |
| storage | storage / lưu trữ | |
| deployment pipeline | deployment pipeline / pipeline triển khai | |

Nếu term không có trong bảng, tự chọn cách diễn đạt tốt nhất theo `RULE.md`; không cần proposal hay report.
