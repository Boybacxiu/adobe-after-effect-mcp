# Timeline Rhythm & Visual Hierarchy Review

Tài liệu hướng dẫn rà soát và tinh chỉnh hai yếu tố phân định đẳng cấp của một video Motion Graphics chuyên nghiệp: **Visual Hierarchy (Phân cấp thị giác)** và **Timeline Rhythm (Nhịp điệu dòng thời gian)**.

---

## Giai Đoạn 1: Phân Tích Phương Tiện & Khung Hình

- **Tỷ lệ hiển thị (Aspect Ratio)**:
  - 16:9 ngang (`1920x1080`): Bố cục ngang truyền thống, chú trọng nguyên tắc một phần ba (Rule of Thirds).
  - 9:16 dọc (`1080x1920`): Shorts / Reels / TikTok, vùng an toàn thu hẹp do bị che bởi UI của nền tảng (nút like, caption dưới đáy).
- **Tốc độ khung hình (FPS)**: Chuẩn `30 fps` (hoặc `60 fps` cho giao diện mượt mà). Mọi mốc keyframe phải nằm đúng vạch Frame (Snap to frame), không rơi vào số lẻ sub-frame.

---

## Giai Đoạn 2: Quy Trình Kiểm Tra Kép (Dual Review)

Leader AE rà soát bản kế hoạch hoặc sản phẩm thực thi qua 2 lăng kính độc lập:

### 1. Rà Soát Phân Cấp Thị Giác (Visual Hierarchy)

Mỗi khung hình phải trả lời được câu hỏi: **Người xem sẽ nhìn vào đâu đầu tiên?**

- **Phần tử Bậc 1 (Primary - Focal Point)**: Là yếu tố quan trọng nhất (Tiêu đề bùng nổ, nhân vật chính, nút CTA). Phải có kích thước lớn nhất, độ tương phản cao nhất hoặc màu Accent nổi bật nhất.
- **Phần tử Bậc 2 (Secondary)**: Thông tin bổ trợ (Subtitle, thanh phân cách, icon giải thích). Kích thước nhỏ hơn 50-60% so với Bậc 1, dùng màu trung tính (Neutral).
- **Phần tử Bậc 3 (Tertiary - Ambient)**: Chi tiết nền, hạt particle lướt nhẹ, lưới tọa độ mờ. Phải luôn chìm xuống dưới, độ trong suốt (Opacity) dưới $30\%$, không tranh chấp sự chú ý của Bậc 1.
- **Quy tắc 3 giây (The 3-Second Test)**: Người xem chưa từng thấy video này có nắm bắt được thông điệp cốt lõi trong vòng 3 giây đầu tiên không? Nếu không, hệ thống phân cấp đang bị phẳng (Flat) hoặc bị đảo lộn (Reversed).

### 2. Rà Soát Nhịp Điệu Dòng Thời Gian (Timeline Rhythm)

Nhịp điệu là sự lặp lại có chủ đích và có biến tấu nhịp nhàng:

- **Xuất hiện so le (Staggered Animation)**:
  - ❌ **Lỗi đồng loạt**: Tuyệt đối không cho 5 layers cùng xuất hiện tại vạch $0.0s$. Khung hình sẽ bị giật và gây bối rối cho mắt.
  - ✅ **Chuẩn mực so le**: Xếp tầng keyframe cách nhau từ **3 đến 6 frames** (0.1s - 0.2s). Khối nền vào trước $\to$ Tiêu đề chính vào sau $\to$ Subtitle xuất hiện $\to$ Icon phụ nảy ra.
- **Đồng nhất đường cong gia tốc (Easing Discipline)**:
  - Trong cùng một cảnh, các phần tử xuất hiện cùng nhóm chuyển động phải chia sẻ cùng một họ Easing (ví dụ toàn bộ dùng Snappy Influence 80%). Không trộn lẫn một layer Linear và một layer Lò xo một cách tùy tiện.
- **Nhịp thở của Timeline (Breath & Pacing)**:
  - Phải có nhịp nhanh (In), nhịp nghỉ để đọc (Hold: 1.5s - 2.5s), và nhịp chuyển cảnh mượt mà (Out: 0.4s - 0.6s).
  - Không để các sự kiện thị giác diễn ra dồn dập liên tục mà không có khoảng lặng thị giác (Visual breathing room).

---

## Giai Đoạn 3: Tổng Hợp & Sửa Lỗi Trực Tiếp

Khi phát hiện các sai lệch:
1. **Phân cấp bị phẳng (Flat Hierarchy)**: Tăng kích thước font tiêu đề lên gấp đôi, giảm Opacity của nền và phụ đề.
2. **Xuất hiện bị gián đoạn / Rối loạn**: Áp dụng script dời mốc `startTime` của các layer kế tiếp nhau từ 3-5 frames.
3. **Rời rạc bố cục**: Căn chỉnh lại Anchor Point và Position theo trục lưới (`design-system-spec.md`).
4. **Hết giờ quá nhanh**: Kéo giãn Out-point của Composition thêm 1-2 giây để người xem kịp thẩm thấu nội dung.
