---
name: ae-audio-reactive
description: "Audio analysis, beat detection, amplitude-to-keyframe extraction, and audio-reactive animations in After Effects. Use when syncing visuals to music beats, creating sound visualizers, or mapping audio amplitude to motion."
---

# Audio Reactive Animation & Beat Detection

Quy chuẩn kỹ thuật phân tích dạng sóng âm thanh (Audio Waveform), trích xuất biên độ thành Keyframes và điều khiển chuyển động đồng bộ theo nhịp nhạc trong After Effects.

---

## 1. Quy Trình Trích Xuất Biên Độ Âm Thanh (Audio to Keyframes)

1. **Nhập Tệp Âm Thanh**: Import file âm thanh WAV/MP3 vào dự án (`import-footage`).
2. **Tạo Layer Âm Thanh Trong Comp**: Đặt layer audio vào timeline.
3. **Trích Xuất Keyframe Biên Độ**:
   - Trong AE: Chuột phải Layer Audio $\to$ **Keyframe Assistant $\to$ Convert Audio to Keyframes**.
   - Tự động tạo Layer Null có tên `Audio Amplitude` chứa 3 hiệu ứng Slider:
     - `Both Channels`: Biên độ trung bình cả 2 kênh.
     - `Left Channel`: Kênh trái.
     - `Right Channel`: Kênh phải.

---

## 2. Công Thức Biểu Thức Điều Khiển Thị Giác (Audio Reactive Expressions)

### 2.1. Ánh Xạ Tuyến Tính Cơ Bản (Linear Mapping)
Chuyển đổi cường độ âm thanh (thường từ $0$ đến $40$) sang kích thước phóng to (Scale) hoặc độ sáng:

```javascript
// Gán vào thuộc tính Scale của Layer Logo hoặc Vòng tròn sóng
var audioLayer = thisComp.layer("Audio Amplitude");
var amp = audioLayer.effect("Both Channels")("Slider");

// Ánh xạ: Khi amp từ 5 đến 35 -> Scale từ 100% đến 150%
var minAmp = 5;
var maxAmp = 35;
var minScale = 100;
var maxScale = 150;

var s = linear(amp, minAmp, maxAmp, minScale, maxScale);
[s, s];
```

### 2.2. Bộ Lọc Hãm Mượt Tránh Rung Giật (Decay Smoothing Filter)
Âm thanh thô thường thay đổi quá nhanh làm chuyển động bị rung lắc (jitter). Sử dụng thuật toán hãm quán tính để hình ảnh nảy mạnh khi có tiếng đập (Kick Drum) và xẹp xuống từ từ:

```javascript
// Gán vào Scale với bộ đệm hãm quán tính
var audioLayer = thisComp.layer("Audio Amplitude");
var curAmp = audioLayer.effect("Both Channels")("Slider");

// Lấy giá trị frame trước với hệ số tiêu tán 0.85
var prevAmp = audioLayer.effect("Both Channels")("Slider").valueAtTime(time - thisComp.frameDuration);
var smoothedAmp = Math.max(curAmp, prevAmp * 0.85);

var s = linear(smoothedAmp, 0, 40, 100, 140);
[s, s];
```

### 2.3. Bắt Nhịp Trực Tiếp (Beat Trigger Pulse)
Kích hoạt chuyển động lóe sáng (Flash Glow) chỉ khi âm thanh vượt qua một ngưỡng cường độ nhất định:
```javascript
// Gán vào Opacity
var amp = thisComp.layer("Audio Amplitude").effect("Both Channels")("Slider");
var threshold = 28;
if (amp > threshold) {
    100;
} else {
    0;
}
```

---

## 3. Mẫu Lệnh MCP Phân Tích & Điều Chỉnh Âm Thanh (Gold Standards)

### Phân tích dạng sóng âm thanh
```json
{
  "tool": "analyze-audio-waveform",
  "arguments": {
    "footageName": "beat_track.wav",
    "samplesPerSecond": 100
  }
}
```

### Cân bằng âm lượng chuẩn phát sóng (-6 dB)
```json
{
  "tool": "set-audio-levels",
  "arguments": {
    "compName": "Main Comp",
    "layerIndex": 1,
    "level": -6.0
  }
}
```
