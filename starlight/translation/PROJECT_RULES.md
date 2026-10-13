# Project Rules — Docker Curriculum Vietnamese Mirror

## Scope and mapping

Source:

- `starlight/src/content/docs/**/*.md`
- `starlight/src/content/docs/**/*.mdx`

Target:

- `starlight/src/content/docs/vi/**/*.md`
- `starlight/src/content/docs/vi/**/*.mdx`

Giữ nguyên cấu trúc đường dẫn tương đối giữa source và target. Không sửa source English, `src/assets/`, component, config hoặc file ngoài target được giao.

## Frontmatter and structure

- Giữ đúng cấp heading, thứ tự section, danh sách, bảng, code block và cấu trúc MDX.
- Dịch `title`, `description` và prose hiển thị trong frontmatter khi phù hợp; giữ nguyên frontmatter key và giá trị cấu hình.
- Giữ nguyên tên component, import, prop name, expression, index và cú pháp MDX.
- Tên sản phẩm/protocol như Docker, Docker Hub, Docker Compose, Linux, AWS, Kubernetes, HTTP và DNS giữ nguyên.

## Protected content

Giữ nguyên:

- code, command, output mẫu và inline code;
- Dockerfile, image/tag, environment variable, YAML, JSON và shell syntax;
- LaTeX, số liệu, đơn vị và identifier;
- URL, domain, email và destination của external reference link;
- tên file hình, asset path và HTML/MDX structure;
- MDX component structure và các giá trị điều khiển như `correctIndex`.

Alt text, caption, title, quiz question, option và explanation là prose và được dịch; asset path chỉ đổi prefix tương đối nếu target mirror cần để render đúng.

## Link policy

- External URL giữ nguyên tuyệt đối.
- Link đến tài liệu trong repo phải trỏ đến tài liệu tương ứng trong `vi/` khi target đã tồn tại hoặc khi batch được giao xử lý đồng bộ.
- Không tự đổi destination hoặc tạo link đến file chưa tồn tại.
- Link trong file index/sidebar phải được kiểm tra lại sau batch để bảo đảm trỏ đúng bản dịch.

## Ownership and Git

- Một agent sở hữu một source file và một target file tương ứng.
- Nhiều agent được chạy song song khi ownership không chồng lấn.
- Worker chỉ ghi target được giao.
- Coordinator chịu trách nhiệm batch validation và các thay đổi index liên file.
- Không commit, push hoặc deploy nếu user chưa yêu cầu rõ ràng.
