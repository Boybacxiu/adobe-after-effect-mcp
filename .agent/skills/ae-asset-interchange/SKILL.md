---
name: ae-asset-interchange
description: "Multi-format asset ingestion, vector SVG/AI parsing, Photoshop PSD multi-layer workflows, alpha channel interpretation, and Lottie export compatibility in After Effects. Use when importing assets, handling alpha fringes, or preparing comps for Lottie/Web export."
---

# Multi-Format Asset Ingestion & Lottie Interchange

Quy chuẩn kỹ thuật nhập khẩu tư liệu đa định dạng (Vector SVG/AI, Photoshop PSD, EXR sequence), xử lý kênh Alpha và kiểm soát tương thích xuất bản Lottie Web/Mobile trong After Effects.

---

## 1. Cơ Chế Nhập Khẩu Đa Định Dạng (Asset Ingestion Workflows)

### 1.1. Vector SVG & Adobe Illustrator (`.ai` / `.eps`)
- **Nguyên tắc**: Luôn kích hoạt **Continuously Rasterize** (Công tắc hình mặt trời `collapseTransformation = true`) để phóng to thu nhỏ vector vô hạn mà không bị vỡ hạt pixel.
- **Chuyển thành Shape Layer**: Cho phép can thiệp trực tiếp vào từng đỉnh Bezier và gắn toán tử Trim Paths / Repeater:
  ```javascript
  // Lệnh tạo Shape từ Vector Layer trong ExtendScript
  app.executeCommand(3973); // "Create Shapes from Vector Layer"
  ```

### 1.2. Photoshop PSD / PSB (Nhiều Layer)
- Luôn chỉ định phương thức nhập khẩu bảo toàn kích thước từng layer:
  ```javascript
  var io = new ImportOptions(new File("/path/to/design.psd"));
  io.importAs = ImportAsType.COMP_CROPPED_LAYERS; // Giữ nguyên vị trí và kích thước cắt gọn
  app.project.importFile(io);
  ```

### 1.3. Chuỗi Khung Hình Tĩnh (Image Sequences - PNG, EXR, TIFF)
- Kiểm tra thiết lập `sequence = true` và đồng bộ tốc độ khung hình (Frame Rate Conform) khớp với Composition (VD: `30 fps`).

---

## 2. Quy Chuẩn Xử Lý Kênh Alpha (Straight vs Premultiplied)

Hiện tượng viền đen/trắng xung quanh hình ảnh (Fringing/Halos) xuất phát từ việc nhận diện sai kênh Alpha:

| Chế độ Alpha | Cơ chế lưu trữ | Cách khắc phục khi bị viền đen |
| :--- | :--- | :--- |
| **Straight (Unmatted)** | Màu RGB nguyên bản, Alpha lưu ở kênh riêng biệt | Khuyến nghị dùng chế độ này; không bị ám viền. |
| **Premultiplied** | Giá trị RGB đã bị nhân với màu nền (thường là Đen/Trắng) | Trong AE, chuột phải Footage $\to$ Interpret Footage $\to$ **Guess** hoặc chọn màu nền tương ứng để khử viền. |

```javascript
// Gán qua ExtendScript
var footageItem = app.project.item(1).mainSource;
footageItem.alphaMode = AlphaMode.STRAIGHT; // hoặc AlphaMode.PREMULTIPLIED
```

---

## 3. Danh Mục Tương Thích Xuất Bản Lottie (Bodymovin Web/Mobile Readiness)

Khi đề bài yêu cầu tạo animation cho Web hoặc Ứng dụng Di động (Lottie JSON), Worker AE **bắt buộc phải tuân thủ bảng kiểm định an toàn**:

### ✅ TÍNH NĂNG ĐƯỢC HỖ TRỢ ĐẦY ĐỦ (SAFE):
- Shape Layers (Path, Rect, Ellipse, Polystar).
- Solid Layers, Text Layers cơ bản (với phông chữ hỗ trợ).
- Transform Animations: Position, Scale, Rotation, Opacity (hỗ trợ Easing Bezier).
- Toán tử Shape: **Trim Paths**, **Repeater** (chế độ cơ bản).
- Track Matte (Alpha Matte, Alpha Inverted Matte).

### ❌ TÍNH NĂNG CẤM SỬ DỤNG CHO LOTTIE (UNSUPPORTED / CRASH WEB):
- **CẤM toàn bộ Effects**: Không dùng Gaussian Blur, Drop Shadow, Glow, Displacement Map (Lottie không render được hiệu ứng AE native).
- **CẤM Layer 3D & Camera**: Không bật switch 3D, không dùng Depth of Field.
- **CẤM Layer Styles**: Không dùng Bevel, Satin, Inner Glow.
- **CẤM Biểu thức phức tạp**: Tránh `toComp`, `sampleImage`, `lookAt` (trình phát Lottie trên di động không có JavaScript engine đầy đủ).
