---
name: ae-color-management
description: "Color management, 32-bpc floating-point linear compositing, luminance math, OCIO/ACES, LUT application, and color grading stack in After Effects. Use when configuring color bit depths, working color spaces, tone mapping, or applying color correction effects."
---

# Color Management, 32-bpc Floating Point & Grading

Quy chuẩn kỹ thuật quản lý không gian màu (Color Management), kết hợp ánh sáng tuyến tính (Linear Light Compositing) và xếp tầng hiệu ứng chỉnh màu trong After Effects.

---

## 1. Phân Tầng Độ Sâu Bit Màu (Color Depth Modes)

| Chế độ | Giới hạn giá trị | Trộn ánh sáng (Blending) | Ứng dụng phù hợp |
| :--- | :--- | :--- | :--- |
| **8-bpc** (Integer) | `0` đến `255` (Bị kẹp ngưỡng) | Gamma-encoded (Phi tuyến tính) | Bản nháp nhanh, xuất web GIF, graphic cơ bản |
| **16-bpc** (Integer) | `0` đến `32,768` | Độ chuyển dải mượt mà | Video phát sóng TV, chống dải sọc gradient |
| **32-bpc Float** | Không giới hạn ($> 1.0$) | **Linear Light (Vật lý chính xác)** | VFX, phát sáng quang học (Optical Glow), 3D render EXR |

### Kích hoạt 32-bpc & Linear Blending qua ExtendScript
```javascript
app.beginUndoGroup("Set_32bpc_Linear_Color");
try {
    app.project.bitsPerChannel = ChannelDepth.FLOAT_PER_CHANNEL; // 32 bpc
    app.project.linearBlending = true; // Trộn ánh sáng tuyến tính
} finally {
    app.endUndoGroup();
}
```

---

## 2. Công Thức Đo Lường Độ Sáng (Luminance Formulas)

Khi sử dụng các hiệu ứng tách nền độ sáng (Luma Key, Extract, Color to Alpha):

- **Chuẩn SD / Rec. 601 (After Effects Default Engine)**:
  $$Y_{601} = 0.299 \times R + 0.587 \times G + 0.114 \times B$$
- **Chuẩn HD / Rec. 709**:
  $$Y_{709} = 0.2126 \times R + 0.7152 \times G + 0.0722 \times B$$
- **Chuẩn UHD / Rec. 2020**:
  $$Y_{2020} = 0.2627 \times R + 0.6780 \times G + 0.0593 \times B$$

---

## 3. Danh Mục Hiệu Ứng Chỉnh Màu Cốt Lõi (Color Grading Stack)

Thứ tự xếp tầng hiệu ứng (Top-to-Bottom) chuẩn mực trên Adjustment Layer:

```
[1. Primary Correction: Levels / Exposure]
                   │
                   ▼
[2. Contrast & Curve: Curves (Natural Cubic Spline)]
                   │
                   ▼
[3. Stylization & Tone: Tint / TriTone / Lumetri / LUT]
                   │
                   ▼
[4. Grain / Film Texture (Chống dải sọc - Debanding)]
```

| Tên hiệu ứng | MatchName trong AE | Tham số điều khiển trọng tâm |
| :--- | :--- | :--- |
| **Exposure** | `ADBE Exposure2` | `Master Exposure`, `Offset`, `Gamma Correction` |
| **Levels (Individual)** | `ADBE Levels2` | `Input Black/White`, `Gamma`, `Output Black/White` |
| **Curves** | `ADBE CurvesCustom` | Đồ thị cong nội suy Cubic Spline tự nhiên |
| **Tint** | `ADBE Tint` | `Map Black To` (Màu tối), `Map White To` (Màu sáng), `Amount` |
| **TriTone** | `ADBE TriTone` | `Highlights`, `Midtones`, `Shadows` (Cực tốt cho phong cách 3 tông màu) |
| **Apply Color LUT** | `ADBE Apply Color LUT` | Áp dụng file `.cube` hoặc `.3dl` (3D LUT grading) |

---

## 4. Mẫu Lệnh MCP Áp Dụng Hiệu Ứng Màu (Gold Standards)

### Áp dụng TriTone tạo dải màu ấm cổ điển
```json
{
  "tool": "apply-effect",
  "arguments": {
    "compName": "Main Comp",
    "layerIndex": 1,
    "effectName": "ADBE TriTone"
  }
}
```
Tiếp theo gán tham số màu:
```json
{
  "tool": "set-effect-property",
  "arguments": {
    "compName": "Main Comp",
    "layerIndex": 1,
    "effectIndex": 1,
    "propertyIndex": 1,
    "value": [0.95, 0.85, 0.70]
  }
}
```
