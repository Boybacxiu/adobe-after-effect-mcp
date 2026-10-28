# MCP Ease Presets: Thư Viện Đồ Thị Vận Tốc Easing Chuẩn Hóa

Tài liệu quy chuẩn thư viện 12 đường cong gia tốc (Easing Velocity Curves) sẵn sàng sử dụng cho **Leader AE** (chỉ định trong Blueprint) và **Worker AE** (áp dụng trực tiếp qua MCP Tool). 

Mọi thông số được tính toán chuẩn xác dựa trên mô hình **Keyframe Velocity** của After Effects: `Influence` (%) đại diện cho độ cong đồ thị và `Speed` đại diện cho tỷ lệ vận tốc so với vận tốc trung bình (1.0 = vận tốc đường thẳng, 0.0 = đứng yên hoàn toàn).

---

## 1. Bảng 12 Preset Gia Tốc Chuẩn Hóa (Standard Ease Library)

| Tên Preset | Out Influence (%) | Out Speed | In Influence (%) | In Speed | Đặc tính cảm xúc & Ứng dụng thực tế |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`Linear`** | `33.33%` | `1.0` | `33.33%` | `1.0` | Vận tốc đều tuyệt đối; dùng cho vòng xoay vô tận, ticker cuộn tin. |
| **`Smooth`** | `40.0%` | `0.25` | `40.0%` | `0.25` | Lướt êm ái, nhẹ nhàng; dùng cho camera drift hoặc visual hold. |
| **`Ease In-Out Soft`** | `25.0%` | `0.0` | `25.0%` | `0.0` | Giảm tốc mềm mại hai đầu; dùng cho chuyển cảnh slide tài liệu. |
| **`Ease In-Out`** | `50.0%` | `0.0` | `50.0%` | `0.0` | Đồ thị Easy Ease tiêu chuẩn (tương đương phím tắt F9 trong AE). |
| **`Ease In-Out Strong`** | `75.0%` | `0.0` | `75.0%` | `0.0` | Tăng tốc mạnh ở giữa, hãm phanh êm; thích hợp cho UI card pop-in. |
| **`Accelerate`** | `50.0%` | `0.0` | `20.0%` | `1.5` | Bắt đầu từ tốn, phóng nhanh về đích; phù hợp đối tượng rời màn hình. |
| **`Accelerate Strong`** | `80.0%` | `0.0` | `15.0%` | `2.5` | Đè nén lực xuất phát cực lâu rồi bắn vọt ra ngoài với lực đẩy lớn. |
| **`Decelerate`** | `20.0%` | `1.5` | `50.0%` | `0.0` | Lao vào nhanh, hãm phanh từ từ về trạng thái nghỉ; thích hợp cho tiêu đề. |
| **`Decelerate Strong`** | `15.0%` | `2.5` | `80.0%` | `0.0` | Bay vào với tốc độ cực cao và dừng lại cực êm (Snappy Entrance). |
| **`Expo In-Out`** | `88.0%` | `0.0` | `88.0%` | `0.0` | Đồ thị hàm mũ; đứng yên $\to$ chuyển dịch chớp nhoáng $\to$ dừng dứt khoát. |
| **`Expo Accelerate`** | `75.0%` | `0.0` | `12.0%` | `7.0` | Phóng vút khỏi màn hình chớp nhoáng (Vanish / Wipe Outro). |
| **`Expo Decelerate`** | `12.0%` | `7.0` | `75.0%` | `0.0` | Lao thẳng từ ngoài biên vào và neo lại dứt khoát (Pop-In Hero). |

---

## 2. Công Thức Toán Học & Quy Đổi Vận Tốc (Velocity & Slope Calculation)

Khi áp dụng Easing vào một đoạn Keyframe từ mốc thời gian $A \to B$ với giá trị $V_0 \to V_1$ và thời lượng $Duration$:

### 2.1. Tính Vận Tốc Trung Bình (Average Segment Slope)
$$\text{Average Speed } S = \frac{\Delta V}{\Delta T} = \frac{|V_1 - V_0|}{Duration}$$

- **Với thuộc tính Scalar (1D)** (Opacity, Rotation, Slider):
  $$S = \frac{|V_1 - V_0|}{t_1 - t_0}$$
- **Với thuộc tính 2D / 3D Spatial** (Position):
  $$S = \frac{\text{Độ dài cung Bezier qua các tiếp tuyến (Path Length)}}{t_1 - t_0}$$

### 2.2. Khởi Tạo Đối Tượng KeyframeEase trong ExtendScript
Mỗi tiếp tuyến đồ thị được biểu diễn bằng một đối tượng `KeyframeEase`:
```javascript
// keyOutTemporalEase (Phía đi ra của Key 1)
var outEase = new KeyframeEase(preset.outSpeed * slope, preset.outInfluence);

// keyInTemporalEase (Phía đi vào của Key 2)
var inEase = new KeyframeEase(preset.inSpeed * slope, preset.inInfluence);
```

---

## 3. Cách Áp Dụng Qua Hệ Thống MCP Tools

### 3.1. Gọi Tool `set-temporal-ease`
Khi sử dụng công cụ MCP tích hợp sẵn, Worker AE truyền tham số tương ứng từ bảng preset:

```json
{
  "layerIndex": 1,
  "propertyName": "Position",
  "keyIndex": 2,
  "easeIn": {
    "speed": 0,
    "influence": 80
  },
  "easeOut": {
    "speed": 0,
    "influence": 80
  }
}
```

### 3.2. Thực Thi Qua `execute-script` Với Nhiều Chiều Thuộc Tính (2D/3D Multi-Dimension)
Với các thuộc tính nhiều chiều như Position (X, Y) hoặc Scale (X, Y, Z), After Effects yêu cầu mảng các đối tượng `KeyframeEase` tương ứng cho từng chiều:

```javascript
app.beginUndoGroup("Apply_Ease_Preset_Decelerate_Strong");
try {
    var comp = app.project.activeItem;
    var layer = comp.layer(1);
    var prop = layer.property("Transform").property("Position");
    
    // Giả sử Key 1 tại 0.0s và Key 2 tại 0.5s
    var easeOutKey1 = [new KeyframeEase(0, 80), new KeyframeEase(0, 80)];
    var easeInKey2  = [new KeyframeEase(0, 80), new KeyframeEase(0, 80)];
    
    // Gán Ease cho Key 1 (Out) và Key 2 (In)
    prop.setTemporalEaseAtKey(1, prop.keyInTemporalEase(1), easeOutKey1);
    prop.setTemporalEaseAtKey(2, easeInKey2, prop.keyOutTemporalEase(2));
} finally {
    app.endUndoGroup();
}
```

---

## 4. Quy Chuẩn Khử Độc & Giới Hạn An Toàn (Sanitization & Clamping)

Để tuân thủ nguyên lý **Never-Crash**:
1. **Influence Boundary**: Luôn được ép trong khoảng $0.1\% \le \text{Influence} \le 100.0\%$:
   ```javascript
   var safeInfluence = Math.min(100.0, Math.max(0.1, inputInfluence));
   ```
2. **Speed Boundary**: Luôn giới hạn vận tốc không vượt quá biên:
   ```javascript
   var safeSpeed = Math.min(100.0, Math.max(-100.0, inputSpeed));
   ```
3. **Zero Duration Guard**: Nếu hai keyframe nằm cùng một thời điểm ($t_1 = t_0$), tuyệt đối không tính slope để tránh lỗi chia cho $0$.
