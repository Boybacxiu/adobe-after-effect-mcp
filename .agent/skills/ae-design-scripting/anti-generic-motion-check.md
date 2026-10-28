# Anti-Generic Motion Check: Loại Bỏ Tạp Chất Thiết Kế & Chuyển Động AI Mẫu (AI Slop)

Tài liệu rà soát và loại bỏ các thói quen xấu, khuôn mẫu chuyển động AI sáo rỗng (AI tropes) nhằm đảm bảo sản phẩm Motion Graphics có chiều sâu, tính thẩm mỹ cao và sự độc bản.

Quy tắc áp dụng: **Positive-First** (Định rõ tiêu chuẩn chuẩn mực trước, sau đó phát hiện và thay thế thói quen lỗi).

---

## 1. Đồ Thị Chuyển Động (Motion Curves & Interpolation)

- **Tiêu chuẩn chuẩn mực**: Mọi chuyển động biến đổi Transform (Position, Scale, Rotation) phải có đồ thị gia tốc với Influence từ **60% đến 85%** hoặc tính toán dao động vật lý Remotion Spring (`mass=1, stiffness=100, damping=14`).
- **Phát hiện & Thay thế (Tropes)**:
  - ❌ **Keyframe Linear mặc định**: Chuyển động cơ học đều đặn như robot, không có gia tốc, không có cảm giác quán tính vật lý.
  - ❌ **Gia tốc quá nhẹ (Influence < 40%)**: Trông yếu ớt, thiếu điểm nhấn, trôi lững lờ.
  - 🛠️ **Hành động khắc phục**: Dùng tool `set-temporal-ease` ép xung Ease In/Out tối thiểu 70% hoặc áp dụng preset lò xo qua `apply-spring-animation`.

---

## 2. Rung Lắc & Dao Động Biểu Cảm (Wiggle & Noise Expressions)

- **Tiêu chuẩn chuẩn mực**: Biểu thức dao động phải có mục đích cụ thể (máy quay cầm tay cinematic nhẹ nhàng `wiggle(1, 4)` hoặc va đập rung chấn ngắn hạn).
- **Phát hiện & Thay thế (Tropes)**:
  - ❌ **Wiggle vô tội vạ**: Gắn `wiggle(5, 10)` bừa bãi lên toàn bộ các layer khiến khung hình hỗn loạn, thiếu tính chuyên nghiệp.
  - ❌ **Lắc không tắt (Uncontrolled Wiggle)**: Rung lắc liên tục khi đối tượng đang cần người xem đọc chữ.
  - 🛠️ **Hành động khắc phục**: Bọc biên độ wiggle bằng Slider Control để chỉ rung lắc trong 0.2s - 0.5s rồi triệt tiêu về 0, hoặc xóa bỏ hoàn toàn.

---

## 3. Màu Sắc & Dải Chuyển Sắc (Gradients & Palette Discipline)

- **Tiêu chuẩn chuẩn mực**: Dùng màu phẳng (Flat Color) từ Design Token hoặc dải Gradient 2 điểm tinh tế cùng tông (On-tone subtle gradient).
- **Phát hiện & Thay thế (Tropes)**:
  - ❌ **Dải màu cầu vồng / Neon tím-hồng (Purple-to-Pink cliché)**: Thói quen AI điển hình lạm dụng dải gradient bão hòa cao tím sang hồng/cam gây rẻ tiền và lỗi thời.
  - ❌ **Tương phản cực đoan**: Dùng nền `#FFFFFF` tinh khiết đi kèm chữ `#000000` thuần túy gây chói và gắt mắt.
  - 🛠️ **Hành động khắc phục**: Chuyển sang nền trung tính dịu mắt (`#F7F5F2` hoặc `#1A1C1E`) và áp dụng màu thương hiệu rõ ràng theo `design-system-spec.md`.

---

## 4. Typography & Phông Chữ (Type Selection & Formatting)

- **Tiêu chuẩn chuẩn mực**: Phông chữ được chọn có ý đồ nghệ thuật, phân cấp rõ rệt giữa Display và Body, căn chỉnh Tracking (giãn chữ) hợp lý.
- **Phát hiện & Thay thế (Tropes)**:
  - ❌ **Phông mặc định im lặng**: Để font mặc định Arial, Courier hoặc Inter không chỉnh Tracking khi đề bài đòi hỏi tính cao cấp, điện ảnh hoặc công nghệ.
  - ❌ **Tracking bằng 0 cho chữ hoa**: Dòng chữ All-Caps nhưng không giãn khoảng cách khiến các ký tự dính chặt vào nhau.
  - 🛠️ **Hành động khắc phục**: Chỉ định rõ font chữ cá tính (VD: Space Grotesk, Montserrat, Bebas Neue cho tiêu đề; Roboto/Inter có tinh chỉnh cho body); đặt Tracking từ `50` đến `100` cho nhãn viết hoa.

---

## 5. Thời Gian Duy Trì Màn Hình (Visual Hold Time)

- **Tiêu chuẩn chuẩn mực**: Sau khi hoàn thành hoạt cảnh xuất hiện (Entrance), nội dung chữ phải được giữ tĩnh hoặc chuyển động vi mô (Drift chậm) trong tối thiểu **1.5s - 2.5s** để mắt người kịp đọc và tiếp nhận thông tin.
- **Phát hiện & Thay thế (Tropes)**:
  - ❌ **Vội vã biến mất (Flash Read)**: Text xuất hiện xong trong 0.5s rồi biến mất ngay ở giây 0.8s, người xem không kịp đọc.
  - ❌ **Chuyển động liên tục không ngừng**: Chữ vừa chạy vừa xoay vừa đổi màu không có khoảnh khắc tĩnh lặng.
  - 🛠️ **Hành động khắc phục**: Căn chỉnh lại timeline, kéo dãn keyframe biến mất (Exit) hoặc Outro đảm bảo khoảng cách tối thiểu 1.5 giây tĩnh.

---

## 6. Căn Chỉnh Không Gian & Điểm Neo (Alignment & Pivot Engineering)

- **Tiêu chuẩn chuẩn mực**: Điểm neo (Anchor Point) nằm đúng tâm cơ học của chuyển động (chân đối tượng nếu mọc lên, tâm hình học nếu xoay/phóng, mép trái nếu chạy chữ).
- **Phát hiện & Thay thế (Tropes)**:
  - ❌ **Scale từ góc màn hình ngẫu nhiên**: Quên dời Anchor Point khiến layer phóng to từ điểm `[0, 0]` góc trên bên trái thay vì từ tâm đối tượng.
  - ❌ **Lấn chiếm lề màn hình**: Đặt chữ sát mép ngoài, vượt qua Title Safe Zone.
  - 🛠️ **Hành động khắc phục**: Thiết lập vị trí Anchor Point chuẩn xác qua biểu thức hoặc script tính toán `sourceRectAtTime()` trước khi đặt keyframe.
