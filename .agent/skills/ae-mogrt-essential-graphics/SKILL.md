---
name: ae-mogrt-essential-graphics
description: "Essential Graphics panel automation, Motion Graphics Templates (.mogrt), and dynamic property exposure in After Effects. Use when creating reusable templates, exposing user controls (text, color, slider, media replacement), or scripting MOGRT export."
---

# Essential Graphics & MOGRT Automation

Quy chuẩn kỹ thuật tự động hóa bảng Essential Graphics, phơi lộ các tham số động (Dynamic Controls) và đóng gói Motion Graphics Template (`.mogrt`) trong After Effects qua ExtendScript.

---

## 1. Kiến Trúc Tham Số Động Trong Essential Graphics

Bảng Essential Graphics cho phép người dùng hoặc biên tập viên Premiere Pro tùy biến video mà không cần chạm vào Timeline After Effects:

| Loại thuộc tính | Hỗ trợ trong MOGRT | Ví dụ ứng dụng |
| :--- | :--- | :--- |
| **Source Text** | Có | Thay đổi nội dung tiêu đề, phụ đề trực tiếp |
| **Color Control** | Có | Đổi màu nhận diện thương hiệu (Primary, Accent) |
| **Slider Control** | Có | Điều chỉnh độ dày viền, kích thước padding, vị trí X/Y |
| **Checkbox Control**| Có | Bật/tắt các layer phụ (Toggle Dark/Light Mode, bật icon) |
| **Media Replacement**| Có (AE 2021+) | Kéo thả ảnh/video đại diện hoặc logo vào khung |
| **Keyframes thuần** | Không trực tiếp | Phải liên kết qua Slider/Expression để điều khiển |

---

## 2. Quy Trình Lập Trình ExtendScript Essential Graphics

1. **Chỉ định Comp Làm Mẫu Essential Graphics**:
   ```javascript
   var comp = app.project.activeItem;
   comp.motionGraphicsTemplateName = "Lower_Third_Pro_Template";
   ```
2. **Kiểm Tra Khả Năng Thêm Thuộc Tính (`canAddToMotionGraphicsTemplate`)**:
   Luôn kiểm tra thuộc tính có được hỗ trợ hay không trước khi gọi lệnh thêm để tránh ngoại lệ runtime:
   ```javascript
   var prop = comp.layer("Text_Title").property("Source Text");
   if (comp.canAddToMotionGraphicsTemplate(prop)) {
       comp.addToMotionGraphicsTemplate(prop);
   }
   ```
3. **Thêm Thuộc Tính Điều Khiển Từ Null Control**:
   Gom toàn bộ các tham số đổi màu, kích thước vào một Null Layer mang tên `Controls`:
   ```javascript
   var ctrlLayer = comp.layer("Controls");
   var colorProp = ctrlLayer.effect("Accent Color")("Color");
   if (comp.canAddToMotionGraphicsTemplate(colorProp)) {
       comp.addToMotionGraphicsTemplate(colorProp);
   }
   ```

---

## 3. Mẫu Script Hoàn Chỉnh Tạo MOGRT Tự Động (Gold Standard)

```javascript
app.beginUndoGroup("Setup_Essential_Graphics_MOGRT");
try {
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) throw new Error("Vui lòng mở một Composition");
    
    // Đặt tên Template
    comp.motionGraphicsTemplateName = "Corporate_Title_Card";
    
    // 1. Phơi lộ Text Tiêu Đề
    var titleLayer = comp.layer("Title_Text");
    if (titleLayer && comp.canAddToMotionGraphicsTemplate(titleLayer.property("Source Text"))) {
        comp.addToMotionGraphicsTemplate(titleLayer.property("Source Text"));
    }
    
    // 2. Phơi lộ Màu Sắc từ Master Control
    var ctrlLayer = comp.layer("Master_Control");
    if (ctrlLayer) {
        var primaryColor = ctrlLayer.effect("Primary Color")("Color");
        if (comp.canAddToMotionGraphicsTemplate(primaryColor)) {
            comp.addToMotionGraphicsTemplate(primaryColor);
        }
        
        var showSubtitle = ctrlLayer.effect("Show Subtitle")("Checkbox");
        if (comp.canAddToMotionGraphicsTemplate(showSubtitle)) {
            comp.addToMotionGraphicsTemplate(showSubtitle);
        }
    }
} finally {
    app.endUndoGroup();
}
```

---

## 4. Quy Chuẩn Xuất Bản File `.mogrt` An Toàn
- **Phông chữ tương thích**: Chỉ sử dụng Adobe Fonts hoặc hệ thống font mở (Google Fonts: Montserrat, Inter, Roboto), không dùng font cục bộ lạ không có bản quyền.
- **Khóa tỷ lệ khung hình**: Đảm bảo các khung shape co giãn tự động theo biểu thức `sourceRectAtTime()` (`ae-expression-math`) để người dùng gõ chữ dài bao nhiêu thì khung nền vẫn tự ôm khít bấy nhiêu.
