---
name: ae-expression-math
description: "Advanced After Effects expressions, layer space transformations, vector kinematics, responsive text-box math, and temporal looping. Use when linking 2D HUD to 3D spaces, auto-aiming layers, dynamic responsive layouts, or writing mathematical expressions."
---

# Advanced Expressions & Spatial Transformations

Quy chuẩn kỹ thuật viết biểu thức (Expressions) toán học, biến đổi không gian tọa độ và tự động hóa bố cục linh hoạt trong After Effects.

---

## 1. Biến Đổi Không Gian Tọa Độ (Layer Space Transforms)

Dùng để gắn các phần tử 2D (khung HUD, mũi tên chỉ dẫn, callout text) bám theo một Layer 3D hoặc Null Controller:

| Hàm biến đổi | Hướng chuyển đổi | Ứng dụng thực tế |
| :--- | :--- | :--- |
| `targetLayer.toComp([0,0,0])` | Layer 3D/2D $\to$ Tọa độ 2D của Composition | Gắn nhãn 2D bám theo đầu gối, bàn tay hoặc điểm 3D |
| `targetLayer.toWorld([0,0,0])` | Tọa độ nội bộ Layer $\to$ Tọa độ không gian World 3D | Tính khoảng cách thực tế giữa 2 layer 3D |
| `thisComp.layer("Camera").fromComp([x,y])` | Tọa độ Comp $\to$ Không gian tương đối của Camera | Căn chỉnh đối tượng nhìn từ mắt máy quay |

### Biểu thức Callout 2D bám đối tượng 3D
```javascript
// Gán vào Position của Layer 2D Text Callout
var target = thisComp.layer("3D_Target_Null");
target.toComp(target.anchorPoint);
```

---

## 2. Động Học Vector & Tự Hướng (Vector Kinematics & Orientation)

### 2.1. Tự Động Hướng Về Mục Tiêu (`lookAt`)
Tự động xoay mũi tên, camera hoặc nòng súng về phía layer mục tiêu mà không cần đặt keyframe Rotation:
```javascript
// Gán vào Orientation hoặc Rotation 3D
var targetPos = thisComp.layer("Target_Layer").transform.position;
lookAt(targetPos, transform.position);
```
Với 2D Rotation:
```javascript
var target = thisComp.layer("Target_Layer").transform.position;
var delta = target - transform.position;
radiansToDegrees(Math.atan2(delta[1], delta[0]));
```

### 2.2. Chuẩn Hóa & Đo Khoảng Cách
- Khoảng cách: `length(point1, point2)`
- Vector đơn vị: `normalize(vec)`
- Tích vô hướng (Góc chiếu): `dot(u, v)`

---

## 3. Khung Nền Chữ Co Giãn Tự Động (Responsive Text Box Math)

Tự động co giãn kích thước và căn giữa hình hộp bao quanh đoạn văn bản theo thời gian thực dựa trên `sourceRectAtTime()`:

```javascript
// 1. Gán vào Size của Shape Rectangle Path:
var padX = 32;
var padY = 16;
var textLayer = thisComp.layer("Dynamic_Text");
var r = textLayer.sourceRectAtTime(time, false);
[r.width + padX * 2, r.height + padY * 2];

// 2. Gán vào Position của Shape Rectangle Path:
var textLayer = thisComp.layer("Dynamic_Text");
var r = textLayer.sourceRectAtTime(time, false);
[r.left + r.width / 2, r.top + r.height / 2];
```

---

## 4. Xử Lý Dòng Thời Gian & Lặp Hoạt Cảnh (Temporal Expressions)

### 4.1. Lặp Chu Kỳ & Lắc Lư (`loopOut`)
- `loopOut("cycle")`: Lặp lại chu kỳ từ keyframe đầu đến cuối.
- `loopOut("pingpong")`: Chạy xuôi rồi chạy ngược (nảy qua nảy lại).
- `loopOut("continue")`: Duy trì vận tốc quán tính tiếp tục đi thẳng.

### 4.2. Hiệu Ứng Bám Đuôi Độ Trễ (Follower / Trailing Delay)
Tạo hiệu ứng đàn kiến hoặc chuỗi mắt xích lượn sóng:
```javascript
// Layer sau bám theo Layer trước trễ 5 frames
var delay = 5 * thisComp.frameDuration;
var leader = thisComp.layer(index - 1);
leader.transform.position.valueAtTime(time - delay);
```

### 4.3. Quán Tính Nảy Lò Xo Sau Keyframe (Inertial Bounce Expression)
```javascript
// Gán vào Position hoặc Scale sau khi đặt 2 keyframes
var amp = 0.05;
var freq = 4.0;
var decay = 8.0;
var n = 0;
if (numKeys > 0) {
    n = nearestKey(time).index;
    if (key(n).time > time) n--;
}
if (n == 0) {
    value;
} else {
    var t = time - key(n).time;
    if (t > 0 && t < 2) {
        var v = velocityAtTime(key(n).time - thisComp.frameDuration / 10);
        value + v * amp * Math.sin(freq * t * 2 * Math.PI) / Math.exp(decay * t);
    } else {
        value;
    }
}
```

---

## 5. Sóng Dao Động Cắt Lát & Điều Khiển Bằng Sliders (Sliced Wave Oscillation & Slider Controls)

Quy chuẩn toán học hóa chuyển động dập dềnh cho hiệu ứng Typography cắt lát (Sliced Typography), hoạt cảnh gợn sóng (Sliced Wave) và đồ họa kinetic. Thay thế hoàn toàn việc gán hàng chục keyframe Position thủ công bằng biểu thức hàm sin và bộ điều khiển trung tâm (Master Controller).

### 5.1. Thiết Lập Bộ Điều Khiển Trung Tâm (Wave_Controller Null)
1. Tạo 1 Null Layer đặt tên là `Wave_Controller`.
2. Gắn 4 hiệu ứng Slider Control thông qua tool `add-expression-control`:
   - `Amplitude`: Biên độ dao động (pixels, ví dụ: 30 - 60).
   - `Frequency`: Tần số dao động (Hz, ví dụ: 1.5 - 3.0 chu kỳ/giây).
   - `Phase_Offset`: Độ lệch pha giữa các lát cắt (radians, ví dụ: 0.25 - 0.45 rad).
   - `Decay`: Hệ số tắt dần (damping, ví dụ: 0 = sóng liên tục, 2 - 5 = tắt dần định vị).

### 5.2. Biểu Thức Sóng Cắt Lát Tự Động (`slicedWave`)
Gán trực tiếp vào thuộc tính `Position` của từng lát cắt (Slice Layer). Biểu thức tự động nhận diện chỉ số `index` của layer để tính góc lệch pha, tạo nên chuyển động lượn sóng nhịp nhàng mà không sợ bị lệch trục:

```javascript
// Gán vào Position của từng Layer Slice
var ctrl = null;
try { ctrl = thisComp.layer("Wave_Controller"); } catch (e) {}

var amp = 30;
var freq = 2.0;
var phase = 0.35;
var decay = 0;

if (ctrl) {
  try { if (ctrl.effect("Amplitude")) amp = ctrl.effect("Amplitude")(1).value; } catch (e) {}
  try { if (ctrl.effect("Frequency")) freq = ctrl.effect("Frequency")(1).value; } catch (e) {}
  try { if (ctrl.effect("Phase_Offset")) phase = ctrl.effect("Phase_Offset")(1).value; } catch (e) {}
  try { if (ctrl.effect("Decay")) decay = ctrl.effect("Decay")(1).value; } catch (e) {}
}

var order = index;
var t = Math.max(0, time);
var envelope = decay > 0 ? Math.exp(-decay * t) : 1;
var wave = Math.sin((t * freq * Math.PI * 2) + (order * phase)) * amp * envelope;

// Giữ nguyên trục X, áp dụng sóng dao động vào trục Y
[value[0], value[1] + wave];
```

### 5.3. Biểu Thức Wiggle Điều Khiển Bằng Sliders (`sliderWiggle`)
Gán vào Position hoặc Rotation khi muốn tạo chuyển động rung ngẫu nhiên nhưng có thể tăng giảm cường độ linh hoạt:
```javascript
var ctrl = null;
try { ctrl = thisComp.layer("Wave_Controller"); } catch (e) {}
var freq = 3;
var amp = 20;
if (ctrl) {
  try { if (ctrl.effect("Wiggle_Freq")) freq = ctrl.effect("Wiggle_Freq")(1).value; } catch (e) {}
  try { if (ctrl.effect("Wiggle_Amp")) amp = ctrl.effect("Wiggle_Amp")(1).value; } catch (e) {}
}
wiggle(freq, amp);
```

### 5.4. Thực Thi Qua MCP Tools
Worker AE có thể áp dụng ngay lập tức mà không cần viết mã thủ công:
- **Tạo thanh trượt**:
  ```json
  {
    "tool": "add-expression-control",
    "layerName": "Wave_Controller",
    "controlType": "slider",
    "name": "Amplitude",
    "value": 35
  }
  ```
- **Áp dụng biểu thức sóng template**:
  ```json
  {
    "tool": "apply-expression-template",
    "layerName": "Slice_01",
    "property": "position",
    "template": "slicedWave",
    "params": {
      "controllerName": "Wave_Controller",
      "amplitude": 35,
      "frequency": 2.5,
      "phaseOffset": 0.35,
      "axis": 1
    }
  }
  ```

---

## 6. Quy Chuẩn Biểu Thức An Toàn (Never-Crash Expressions)
- **Luôn kiểm tra Layer tồn tại**: Sử dụng `try { thisComp.layer("Name") } catch(e) { value }` để tránh báo lỗi thanh đỏ (Red Error Banner) làm dừng render.
- **Tránh chia cho 0**: Trước khi chia cho độ dài hoặc thời lượng: `var d = (len != 0) ? len : 0.001;`.
