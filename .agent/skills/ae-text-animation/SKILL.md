---
name: ae-text-animation
description: "Automate text layer creation, kinetic typography, RTL/Arabic text rendering, and text animators in After Effects. Use when creating text, title cards, lower thirds, or kinetic text effects."
---

# After Effects Text & Typography Automation

## 1. Step-by-Step Procedure

1. **Verify Comp**: Call `inspect-comp` or `get-composition-info` to get frame dimensions and FPS.
2. **Create Layer**:
   - Standard/RTL Text: Call `create-text-layer` (auto-detects Arabic/Hebrew RTL direction and justification).
   - Advanced Styling: Call `add-text-layer-advanced` for font family, tracking, stroke, and justification.
3. **Apply Kinetic Animation**:
   - Dynamic Range Animators: Call `create-text-animator` (`typewriter`, `fadeInChars`, `scaleInChars`, `slideInChars`, `randomize`, `wave`).
   - Standard Broadcast Template: Call `create-lower-third` or `create-title-card`.
4. **Visual Verification**: Call `see-frame` to verify readability and layout.

## 2. Core Logic & Constraints

- **RTL Detection**: Auto-applied for unicode `[\u0600-\u06FF\u0750-\u077F]`. Defaults alignment to `RIGHT_JUSTIFY`.
- **Anchor Point Placement**: Set text layer anchor point to bottom-center `[w/2, h]` for scale-up bounce, or left-center `[0, h/2]` for typewriters.
- **Duration**: Text display time rule of thumb: minimum 1.5s + 0.3s per word.

## 3. Gold Standard Workflows

### Typewriter Effect
```json
{
  "tool": "create-text-layer",
  "arguments": {
    "compName": "Main Comp",
    "text": "Antigravity AI Automation",
    "fontSize": 64,
    "position": [960, 540],
    "alignment": "center"
  }
}
```
Followed by:
```json
{
  "tool": "create-text-animator",
  "arguments": {
    "compName": "Main Comp",
    "layerName": "Antigravity AI Automation",
    "animatorType": "typewriter",
    "duration": 1.2
  }
}
```

### Broadcast Lower Third
```json
{
  "tool": "create-lower-third",
  "arguments": {
    "title": "ALEX RIVERA",
    "subtitle": "Motion Graphics Director",
    "style": "modern",
    "position": "bottom-left"
  }
}
```

## 4. Kinetic Sliced Typography & Wave Motion (Chữ Cắt Lát & Gợn Sóng)

Khi thực hiện hiệu ứng chữ cắt lát chuyển động lượn sóng (Sliced Typography Animation):
1. **Tạo Text Layer gốc**: Tạo text với font đậm (Bold/Black), font sans-serif hình khối (Impact, Montserrat, Bebas Neue, Arial Black) để vết cắt sắc nét.
2. **Nhân bản & Cắt lát (Slices)**:
   - Nhân bản layer Text thành $N$ bản sao (ví dụ 5 - 10 slices).
   - Áp dụng Mask chữ nhật (`add-mask`) cho từng layer để chia chữ thành các dải ngang đều nhau:
     * Lát 1: `[0, 0]` đến `[w, h/N]`
     * Lát 2: `[0, h/N]` đến `[w, 2h/N]`...
3. **CẤM gán Keyframe Position thủ công**: Không đặt keyframe cho từng layer slice để tránh lệch trục và mất kiểm soát khi thay đổi nhịp điệu.
4. **BẮT BUỘC điều khiển bằng Expressions**:
   - Tạo Master Controller Null `Wave_Controller` với các Slider Controls: `Amplitude`, `Frequency`, `Phase_Offset`, `Decay`.
   - Áp dụng template biểu thức `slicedWave` qua tool `apply-expression-template` lên thuộc tính `position` của từng layer slice:
     ```json
     {
       "tool": "apply-expression-template",
       "layerName": "Text_Slice_01",
       "property": "position",
       "template": "slicedWave",
       "params": {
         "controllerName": "Wave_Controller",
         "amplitude": 30,
         "frequency": 2.0,
         "phaseOffset": 0.35,
         "axis": 1
       }
     }
     ```
   - Chuyển động lượn sóng tự động tính toán theo `index` của từng layer, đảm bảo tính liên tục của sóng, biên độ đồng nhất và có thể điều chỉnh toàn bộ bằng Slider Controls trên `Wave_Controller`.

---

## 5. Quy Chuẩn Bắt Buộc: Shape Morphing Cho Chữ Cái (Typography Shape Morphing Protocol)

> **QUY TẮC BẤT BIẾN**:
> Khi tạo Shape Morphing cho chữ cái, **BẮT BUỘC** phải định nghĩa rõ mảng **Vertices**, **inTangents**, và **outTangents** của thuộc tính `Path` (`ADBE Vector Shape - Group`) cho từng mốc trạng thái, thay vì chỉ dùng lệnh scale/position thông thường.

### 5.1. Các Tiêu Chuẩn Thực Thi
1. **Bảo toàn số lượng điểm neo (Vertex Count Consistency)**: Số đỉnh ($N$ vertices) giữa Keyframe bắt đầu (khối hình học nguyên bản) và Keyframe kết thúc (đường viền ký tự hoàn chỉnh) phải bằng nhau để thuật toán nội suy Bezier của After Effects diễn ra mượt mà, không bị giật hay xoắn topo.
2. **Trạng thái khởi đầu (Primitive Polygon State)**: Các đỉnh phụ của ký tự phức tạp (ví dụ nét ngang của F, vòm của n, nét chéo của t) được thu gọn hoặc xếp thẳng hàng trên cạnh của khối đa giác nguyên bản (Rectangle/Square/Diamond).
3. **Trạng thái biến hình (Morphing Transition State)**: Từng đỉnh di chuyển theo vector vận tốc xác định, đồng thời tiếp tuyến `inTangents` và `outTangents` mở rộng độ cong Bezier để tạo độ mượt mà tự nhiên.
4. **Trạng thái hoàn thiện (Final Glyph State)**: Khớp 100% với đường bao của font chữ tham chiếu (Guide Text).

### 5.2. Mẫu Mã ExtendScript Chuẩn (Vector Path Vertices Morphing)
```javascript
// Ví dụ: Morphing ký tự 'F' bằng 10 điểm đỉnh đồng nhất (Identical Vertex Count)
var shape1 = new Shape(); // Khối chữ nhật nguyên bản
shape1.vertices = [[-80, 116], [-80, -116], [-24, -116], [-24, -116], [-24, -64], [-24, -64], [-24, -20], [-24, -20], [-24, 26], [-24, 116]];
shape1.inTangents = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
shape1.outTangents = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
shape1.closed = true;

var shape2 = new Shape(); // Chữ F hoàn chỉnh sau khi vươn các tay ngang
shape2.vertices = [[-80, 116], [-80, -116], [68, -116], [68, -64], [-24, -64], [-24, -20], [40, -20], [40, 26], [-24, 26], [-24, 116]];
shape2.inTangents = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
shape2.outTangents = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
shape2.closed = true;

var pathProp = group.property("Contents").property("Path_F").property("Path");
pathProp.setValueAtTime(0.0, shape1);
pathProp.setValueAtTime(0.75, shape2);
```
