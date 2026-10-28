---
name: ae-keyframe-easing
description: "Apply keyframe animations, temporal easing curves, Remotion spring physics, and motion expressions in After Effects. Use when animating transforms, tuning graph editor curves, or configuring spring/bounce physics."
---

# After Effects Keyframe Easing & Spring Physics

Quy chuẩn kỹ thuật điều khiển hoạt cảnh keyframe, đường cong gia tốc vận tốc và vật lý dao động Remotion trong After Effects.

---

## 1. Thư Viện Đường Cong Vận Tốc Chuẩn (Standard Ease Presets)

Worker AE tra cứu và áp dụng chính xác 12 đồ thị vận tốc chuẩn tại:
👉 [**`mcp-ease-presets.md`**](mcp-ease-presets.md)

| Nhóm Easing | Presets tiêu biểu | Cấu hình Out / In Influence | Ứng dụng trọng tâm |
| :--- | :--- | :--- | :--- |
| **Cân bằng (Symmetric)** | `Ease In-Out`, `Ease In-Out Strong` | Out 50-75%, In 50-75% (Speed = 0) | Chuyển động card, lật trang, UI elements |
| **Vào cảnh (Entrance)** | `Decelerate Strong`, `Expo Decelerate` | In 75-80% (In Speed = 0, Out Speed cao) | Tiêu đề lao vào và hãm phanh êm ái (Pop-in) |
| **Thoát cảnh (Exit)** | `Accelerate Strong`, `Expo Accelerate` | Out 75-80% (Out Speed = 0, In Speed cao) | Phóng vọt biến mất khỏi khung hình (Wipe-out) |
| **Điện ảnh & Lướt** | `Smooth`, `Linear` | Out/In 40% (Speed 0.25) hoặc 33.3% | Camera drift, background ambient, ticker cuộn |

---

## 2. Quy Trình Thực Thi Hoạt Cảnh Từng Bước (Step-by-Step)

1. **Khởi tạo Keyframes**: Gọi `setLayerKeyframe` hoặc `set-keyframe-advanced` xác định `propertyName`, `time`, và `value`.
2. **Ép xung đồ thị Easing qua `set-temporal-ease`**:
   - Truyền tham số `easeIn` và `easeOut` theo đúng các giá trị từ [`mcp-ease-presets.md`](mcp-ease-presets.md).
   - Với chuyển động Snappy: `influence` từ **75% đến 85%**, `speed = 0`.
3. **Áp dụng Dao động Vật lý Lò xo (Remotion Spring)**:
   - Gọi `apply-spring-animation` với các preset (`snappy`, `bouncy`, `wobbly`, `stiff`, `gentle`).
   - Gọi `calculate-spring-duration` để tính toán thời gian ổn định (settling time) nhằm căn chỉnh timeline.
4. **Xếp tầng & Dời nhịp (Keyframe Retiming)**:
   - Dùng `offset-keyframes`, `scale-keyframe-timing`, hoặc `reverse-keyframes` để tạo nhịp so le (Stagger lệch 3 - 6 frames).

---

## 3. Công Thức Toán Học & Mô Phỏng Vật Lý

- **Spring Harmonic Oscillation**:
  $$\omega_0 = \sqrt{\frac{k}{m}}, \quad \zeta = \frac{c}{2\sqrt{km}}$$
  - Underdamped ($\zeta < 1$): $x(t) = 1 - e^{-\zeta \omega_0 t} \left(\cos(\omega_d t) + \frac{\zeta}{\sqrt{1-\zeta^2}} \sin(\omega_d t)\right)$
  - Settling Time: $T_s \approx \frac{4}{\zeta \omega_0}$ (sai số $< 2\%$ so với vị trí cân bằng).
- **Temporal Easing Curves**:
  - Linear: `influence: 33.3%`, `speed: 1.0`
  - Standard Ease: `speed: 0`, `influence: 50.0%`
  - Fast Punch / Snappy Pop: `speed: 0`, `influence: 75.0%` đến `85.0%`
  - Expo Pop: `influence: 88.0%`

---

## 4. Mẫu Lệnh MCP Chuẩn Xác (Gold Standards)

### Hoạt cảnh Snappy Pop-In (Keyframe + Decelerate Strong)
```json
{
  "tool": "set-keyframe-advanced",
  "arguments": {
    "compName": "Main Comp",
    "layerName": "Icon",
    "propertyName": "Scale",
    "keyframes": [
      { "time": 0.0, "value": [0, 0] },
      { "time": 0.4, "value": [100, 100] }
    ]
  }
}
```
Tiếp theo áp dụng đồ thị `Decelerate Strong`:
```json
{
  "tool": "set-temporal-ease",
  "arguments": {
    "compName": "Main Comp",
    "layerName": "Icon",
    "propertyName": "Scale",
    "keyIndex": 2,
    "easeIn": { "speed": 0, "influence": 80 }
  }
}
```

### Hoạt cảnh Dao động Lò xo Remotion (Remotion Spring)
```json
{
  "tool": "apply-spring-animation",
  "arguments": {
    "compName": "Main Comp",
    "layerName": "Badge",
    "propertyName": "Position",
    "preset": "bouncy"
  }
}
```
