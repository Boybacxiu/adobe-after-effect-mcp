# Adobe After Effects MCP Project Guidelines

## Project Scope
This workspace is exclusively dedicated to the Adobe After Effects Model Context Protocol (MCP) server.

## Workspace Isolation Rules
- **Strictly No Cloud / Data Agent Kit**: Do NOT invoke, suggest, or reference any tools or skills related to Google Cloud, BigQuery, Dataproc, Spanner, AlloyDB, Cloud SQL, Dataform, or `datacloud_*`.
- **MCP Tool Scope**: Only use the `adobe-after-effects` MCP server tools for After Effects automation, ExtendScript CLI execution, and local bridge communication.
- **Self-Contained & Clean**: Keep this repository 100% portable, free of cloud credentials, and completely isolated from global machine customizations.

## Version Management & Notification Rules
- **Không tạo file log tồn dư**: Tuyệt đối KHÔNG ghi ra file `CHANGELOG.md`, `live_error_log.md` hay bất kỳ tệp log tạm nào làm tồn dư file trong repository.
- **Báo cáo trực tiếp trong hội thoại**: Khi hoàn tất một đợt cập nhật tính năng mới đã kiểm thử thành công (`npm run build` thành công 100%, không lỗi), CHỈ hiển thị phiên bản update và nội dung cập nhật trực tiếp cho người dùng trong câu trả lời (chat), không lưu ra file rác.
- **Yêu cầu người dùng mở After Effects**: Tuyệt đối KHÔNG tự động khởi chạy After Effects ngầm (`launchAfterEffects`). Trước mỗi lần sử dụng hoặc khi After Effects chưa được mở, AI BẮT BUỘC phải yêu cầu người dùng tự mở After Effects trên máy trước khi thực thi các công cụ MCP.
- **Đồng bộ README.md**: Duy trì tài liệu `README.md` chính xác, sạch sẽ, cập nhật đúng số lượng MCP tools và phiên bản hệ thống, không chứa liên kết tới file log tồn dư.
