# Docker Curriculum Vietnamese Translation Rule

Mục tiêu: **dịch nhanh, đúng meaning, tự nhiên như tài liệu Docker do developer Việt viết**, đồng thời giữ nguyên source English và cấu trúc Markdown/MDX.

## 1. Một agent = một file tài liệu

Mỗi agent nhận đúng một file Markdown hoặc MDX nguồn và chịu trách nhiệm toàn bộ file target tương ứng dưới `src/content/docs/vi/`.

Không chia một tài liệu thành task riêng cho heading, paragraph, image, quiz, example, code block hoặc reference.

Một file được xem là hoàn thành end-to-end khi toàn bộ prose, heading, danh sách, bảng, chú thích hình, quiz text và reference trong file đó đã được xử lý.

## 2. Cách dịch

- Dịch meaning, không dịch word-by-word.
- Không thêm ý, không tóm tắt, không tự sửa Docker command, kiến trúc, số liệu, hành vi runtime hoặc kết luận kỹ thuật.
- Câu tiếng Việt ngắn gọn, tự nhiên, phù hợp văn phong technical documentation và tutorial thực hành.
- Giữ English technical/domain term nếu developer dùng tự nhiên hoặc term đó cần độ chính xác: `image`, `container`, `registry`, `Dockerfile`, `Compose`, `volume`, `network`, `build`, `runtime`, `deployment`, `port`, `shell`, `process`, `daemon`, `orchestration`, v.v.
- Không cố Việt hóa term chỉ để câu “thuần Việt”.
- Với từ phổ thông có bản Việt tự nhiên thì dùng tiếng Việt: `user -> người dùng`, `storage -> lưu trữ`, `network -> mạng`, `deployment -> triển khai` tùy ngữ cảnh.
- Giữ nhất quán một term trong cùng tài liệu, nhưng ưu tiên meaning và độ tự nhiên hơn bảng thay thế cứng.

Style tham chiếu:

> Docker image là blueprint chỉ đọc dùng để tạo container. Khi chạy `docker run`, Docker tạo một container mới từ image đó và kết nối process trong container với runtime của Docker.

## 3. Phần giữ nguyên

Không sửa nội dung, cú pháp hoặc ý nghĩa của:

- code fence, code block, command và output mẫu;
- Dockerfile instruction, Docker image name/tag, environment variable, YAML, JSON và shell syntax;
- identifier, tên class, method, field, component, prop, import path và inline code;
- MDX expression, array/object structure, numeric index và component syntax;
- LaTeX/math và numeric literal;
- URL, domain, email và reference link destination;
- tên sản phẩm, công ty, giao thức và proper noun chính thức;
- tên file hình, asset filename và phần đuôi của asset;
- HTML/MDX tag, attribute, frontmatter key và cấu trúc bảng/list;
- heading level và thứ tự section.

Frontmatter `title`, `description` và các giá trị prose hiển thị được phép dịch; frontmatter key và giá trị cấu hình phải giữ nguyên. Với MDX component, giữ nguyên tên component, prop name, cấu trúc và giá trị điều khiển; chỉ dịch string hiển thị cho người đọc như title, question, option và explanation.

H1 và heading prose được phép dịch sang tiếng Việt, nhưng phải giữ tên riêng, tên sản phẩm và technical term cần thiết.

Chú thích hình và alt text được dịch nếu là prose; path hình vẫn giữ nguyên asset và chỉ điều chỉnh prefix tương đối khi cần để target `vi/` render đúng.

## 4. Nhãn cấu trúc

Dịch meaning của nhãn nhưng giữ nguyên cấp heading:

- `Introduction -> Giới thiệu`
- `Getting Started -> Bắt đầu`
- `Prerequisites -> Điều kiện cần`
- `Hello World -> Hello World`
- `Webapps with Docker -> Webapp với Docker`
- `Multi-Container Environments -> Môi trường multi-container`
- `Modern Docker & Best Practices -> Docker hiện đại và best practices`
- `Conclusion -> Kết luận`
- `What is Docker? -> Docker là gì?`
- `Requirements -> Yêu cầu`
- `How it works -> Cách hoạt động`
- `Summary -> Tóm tắt`

Nếu source dùng heading khác, dịch theo meaning và giữ cấu trúc, không ép về một mẫu máy móc.

## 5. Workflow

Mỗi agent chỉ làm 3 việc:

1. Đọc toàn bộ file Markdown hoặc MDX nguồn được giao.
2. Dịch toàn bộ file sang target mirror `src/content/docs/vi/...` tương ứng.
3. Đọc lại target một lượt để bắt lỗi rõ ràng rồi kết thúc.

Không chạy formatter/check script cho từng worker trừ khi task cụ thể yêu cầu hoặc có lỗi nghi ngờ. Validation tự động và review liên file chạy theo batch/CI, không phải trách nhiệm mặc định của từng agent.

## 6. Dịch song song

- Có thể khởi chạy nhiều agent cùng lúc cho các file độc lập.
- Mỗi agent chỉ được ghi đúng một target file; không có hai agent cùng ghi một file.
- Coordinator phải lập danh sách source-target trước khi dispatch và bảo đảm ownership không chồng lấn.
- Không chia một file cho nhiều agent. Một agent phải hoàn thành file đó end-to-end.
- Index/sidebar hoặc file dùng chung là một file độc lập khi được giao; không tự sửa chúng trong lúc dịch chapter khác.
- Sau khi tất cả worker kết thúc, coordinator chạy batch validation và xử lý các lỗi liên file nếu có.

Nếu dùng 20 agents thì mặc định là **20 file tài liệu khác nhau chạy song song**.

## 7. Không làm

Không tạo mặc định:

- report riêng cho từng file;
- hash, state hoặc coverage metadata;
- reviewer ceremony cho từng worker;
- glossary proposal cho một term đơn lẻ;
- subtask chỉ để dịch một đoạn, hình, quiz item hoặc comment trong file.

Không sửa source English, ảnh, component, config hoặc tài liệu ngoài ownership được giao.
