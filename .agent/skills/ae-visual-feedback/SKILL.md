---
name: ae-visual-feedback
description: "Render preview frames, extract contact sheets, and perform visual self-correction and layout verification in After Effects. Use when verifying visual quality, reviewing animations, or comparing against reference images."
---

# After Effects Visual Feedback & Verification

Quy chuẩn kỹ thuật kiểm tra trực quan (Visual QA), trích xuất khung hình xem trước, đối chiếu ảnh tham chiếu và tự động sửa lỗi bố cục trong After Effects.

---

## 1. Quy Trình Kiểm Thử Trực Quan Từng Bước (Step-by-Step)

1. **Trích Xuất Khung Hình Đơn (`see-frame`)**:
   - Gọi `see-frame` tại các mốc quan trọng: Mở màn (0.2s - 0.4s), Giữ đọc (2.0s), Thoát cảnh (cuối comp).
   - Thiết lập `zoom = 1.0` (toàn độ phân giải) hoặc `0.5` (kiểm tra nhanh tiết kiệm băng thông).
2. **Kiểm Tra Nhịp Điệu Chuyển Động (`contact-sheet`)**:
   - Gọi `contact-sheet` với lưới 4x2 hoặc 3x3 khung hình để đánh giá tiến trình chuyển động liên tục của toàn bộ cảnh.
3. **Đối Chiếu Ảnh Mẫu (`match-reference`)**:
   - Gọi `match-reference` truyền đường dẫn ảnh mẫu để so khớp độ sai lệch màu sắc và vị trí.
4. **Vòng Lặp Tự Sửa Lỗi Cục Bộ (Autonomous Correction Pass)**:
   - Phát hiện chữ bị tràn lề $\to$ Thu nhỏ font hoặc dời tọa độ Position.
   - Phát hiện tương phản kém $\to$ Tăng tương phản màu theo `design-system-spec.md`.
   - Chạy lại `see-frame` xác nhận lỗi đã được khắc phục hoàn toàn trước khi bàn giao.

---

## 2. Tiêu Chuẩn Đánh Giá Độ Chính Xác Thị Giác (Fidelity Metrics)

| Chỉ số đánh giá | Ngưỡng cho phép | Hành động khi vượt ngưỡng |
| :--- | :---: | :--- |
| **Title Safe Margin** | Nằm trong **$80\%$** khung hình | Dời Anchor Point và Position vào trong vùng an toàn |
| **Contrast Ratio** | Tối thiểu **$4.5:1$** (WCAG AA) | Đổi màu text hoặc làm tối/sáng màu nền |
| **Pixel Diff Tolerance** | $\le 5/255$ sai lệch màu | Chấp nhận độ lệch nội suy renderer bình thường |
| **RMSE (So với Reference)** | $< 0.08$ | Điều chỉnh lại vị trí Transform và độ mờ Opacity |

---

## 3. Mẫu Lệnh MCP Chuẩn Xác (Gold Standards)

### Trích xuất ảnh tĩnh xem trước (Hero Frame Preview)
```json
{
  "tool": "see-frame",
  "arguments": {
    "compName": "Main Comp",
    "time": 1.5,
    "zoom": 1.0
  }
}
```

### Đánh giá tiến trình chuyển động toàn cảnh (Contact Sheet)
```json
{
  "tool": "contact-sheet",
  "arguments": {
    "compName": "Main Comp",
    "columns": 4,
    "rows": 2
  }
}
```
