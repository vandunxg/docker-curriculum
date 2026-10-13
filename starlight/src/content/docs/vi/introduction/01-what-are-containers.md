---
title: Container là gì?
---

Tiêu chuẩn phổ biến hiện nay trong việc chạy các ứng dụng phần mềm là sử dụng Máy ảo (VM). VM chạy ứng dụng bên trong một Hệ điều hành khách, hệ điều hành này chạy trên phần cứng ảo do hệ điều hành host của máy chủ cung cấp.

VM rất hiệu quả trong việc cung cấp khả năng cô lập process hoàn toàn cho ứng dụng: có rất ít cách để một sự cố trong hệ điều hành host ảnh hưởng đến phần mềm đang chạy trong hệ điều hành khách và ngược lại. Tuy nhiên, khả năng cô lập này đi kèm với chi phí rất lớn — overhead tính toán dành cho việc ảo hóa phần cứng để hệ điều hành khách sử dụng là đáng kể.

Container tiếp cận theo cách khác: bằng cách tận dụng các cơ chế cấp thấp của hệ điều hành host, container cung cấp phần lớn khả năng cô lập của máy ảo với chỉ một phần nhỏ năng lực tính toán.
