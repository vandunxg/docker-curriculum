# Translation Instructions

Mỗi agent chỉ cần đọc:

1. `starlight/translation/RULE.md` nếu chạy từ repository root, hoặc `translation/RULE.md` nếu chạy trong `starlight/`.
2. File Markdown/MDX nguồn được giao.

Sau đó dịch **nguyên file** sang target mirror dưới `starlight/src/content/docs/vi/` tương ứng, đọc lại nhanh một lượt rồi kết thúc.

Không cần đọc thêm glossary, report, state, audit hoặc review prompt trừ khi task cụ thể yêu cầu.

Không chạy formatter/check script cho từng file mặc định. Validation được thực hiện theo batch sau khi các worker hoàn thành.
