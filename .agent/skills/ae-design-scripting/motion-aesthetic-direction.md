# Motion Aesthetic Direction: Định Hình Phong Cách Thẩm Mỹ Chuyển Động

Quy trình cam kết phong cách thị giác (Aesthetic Direction) trước khi bước vào giai đoạn thiết kế chi tiết (Hi-Fi) trong After Effects. Việc xác lập rõ ngôn ngữ thiết kế từ đầu ngăn chặn sản phẩm rơi vào cái bẫy giao diện mẫu nhạt nhòa của AI.

---

## Giai Đoạn 1: Kiểm Tra Ngữ Cảnh Thương Hiệu

Trước khi đề xuất hướng sáng tạo mới, kiểm tra:
1. Đề tài của Gemini / Người dùng có đính kèm Brand Kit, mã màu Hex hoặc video tham chiếu không?
2. Nếu CÓ: Bám sát $100\%$ các thông số đó, không tự ý sáng tạo phong cách mâu thuẫn.
3. Nếu KHÔNG (Greenfield Context): Chuyển sang Giai đoạn 2.

---

## Giai Đoạn 2: Cam Kết 3 Tính Từ Cốt Lõi (Core Adjectives)

Leader AE phải chọn ra **3 tính từ** đại diện cho cảm xúc thị giác của cảnh quay. Ví dụ:
- **Hướng 1 - Tech & Precision (Công nghệ & Chính xác)**: *Sắc sảo, Tốc độ, Cơ học* (Snappy, Sharp, High-Tech).
- **Hướng 2 - Editorial & Prestige (Biên tập & Sang trọng)**: *Trang nhã, Khoáng đạt, Tĩnh lặng* (Spacious, Elegant, Subtle).
- **Hướng 3 - Dynamic & Playful (Năng động & Trẻ trung)**: *Bùng nổ, Đàn hồi, Tươi sáng* (Pop, Bouncy, Vibrant).
- **Hướng 4 - Cinematic & Narrative (Điện ảnh & Chiều sâu)**: *Kịch tính, Tương phản, Chiều sâu* (Dramatic, Moody, Atmospheric).

---

## Giai Đoạn 3: Cụ Thể Hóa Hệ Thống Thông Số (Concrete Specification)

Mỗi phong cách phải được chuyển hóa thành các giá trị vật lý và toán học rõ ràng:

### 1. Ngôn Ngữ Chuyển Động (Motion Mode)
- **Snappy Mode**: Entrance cực nhanh (10-12 frames), Easing Influence 80%-85%, dứt khoát không có đuôi rung.
- **Organic Spring Mode**: Chuyển động nảy vật lý, sử dụng biểu thức Remotion (`stiffness: 120`, `damping: 14`).
- **Cinematic Drift Mode**: Chuyển động êm dịu, tốc độ lướt chậm dài, Influence 60%-65%, zoom máy quay 1.05x.

### 2. Tông Màu & Nền (Color Mood & Canvas)
- **Cool Dark (Hitech/SaaS)**: Nền `#101216`, Accent `#00E5FF` hoặc `#3B82F6`, Text `#F1F5F9`.
- **Warm Editorial (Prestige/Finance)**: Nền `#F7F5F2`, Primary `#1E2022`, Accent `#C2410C`.
- **Deep Minimalist**: Nền `#18181B`, Text `#FFFFFF`, Viền mờ `rgba(255,255,255,0.1)`.

### 3. Cặp Đôi Typography (Type Pairing)
- **Tiêu đề**: Chọn một Display/Headline Font có cá tính (VD: Montserrat Black, Space Grotesk Bold, Bebas Neue).
- **Nội dung / Phụ đề**: Sans-serif hình học rõ ràng (VD: Inter Medium, Roboto Regular).
- Chỉ dùng tối đa **2 họ font** trong toàn bộ một Composition.

### 4. Mật Độ & Bo Góc Hình Khối (Density & Shapes)
- **Sắc cạnh (Sharp)**: Corner Radius `0px` - `4px` cho phong cách Brutalist hoặc Technical.
- **Mềm mại (Modern Soft)**: Corner Radius `12px` - `16px` cho ứng dụng sản phẩm, app, SaaS.
- **Viên thuốc (Capsule/Pill)**: Corner Radius `999px` cho tags, indicators hiện đại.

---

## Giai Đoạn 4: Ghi Nhận Phong Cách Trong Blueprint

Leader AE phải đính kèm khối mô tả hướng thẩm mỹ ở đầu mỗi bản kế hoạch chuyển giao cho Worker AE:

```markdown
<!-- AESTHETIC DIRECTION -->
- Cảm xúc: [Tech / Sharp / Minimalist]
- Đồ thị Easing chủ đạo: Snappy (Influence: 80% In / 80% Out)
- Bảng màu: Nền #121316 | Primary #FFFFFF | Accent #38BDF8
- Phông chữ: Space Grotesk (Tiêu đề) + Inter (Phụ đề)
- Bo góc: 8px | Vùng an toàn: Title Safe 80%
```

---

## Giai Đoạn 5: Thử Nghiệm Nhỏ & Xác Thực Trực Quan

Trước khi Worker render toàn bộ video hoàn chỉnh:
1. Tạo một khung hình thử nghiệm (Hero Frame).
2. Gọi tool `see-frame` trích xuất ảnh PNG để Leader kiểm tra.
3. Đối chiếu khung hình thực tế với 3 tính từ ban đầu: Có đạt được chất lượng thị giác như cam kết không? Nếu chưa đạt, điều chỉnh ngay trước khi hoàn tất toàn bộ Timeline.
