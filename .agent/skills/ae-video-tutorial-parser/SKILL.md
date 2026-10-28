---
name: ae-video-tutorial-parser
description: "Deconstruct After Effects video tutorials and YouTube links into actionable task blueprints. Extract keyframes from local video (ffmpeg), parse YouTube transcripts, timestamp actions, and map video steps to AE MCP tools."
---

# Video Tutorial & YouTube Parser Specification

Quy chuẩn kỹ thuật bóc tách và chuyển đổi các video hướng dẫn (Video Tutorials) cục bộ và liên kết YouTube thành bản kế hoạch kỹ thuật (Execution Blueprint) chính xác cho **Leader AE** và **Worker AE**.

---

## 1. Nguyên Tắc Điều Phối Bắt Buộc (Mandatory Recognition Rule)

> **QUY TẮC BẤT BIẾN CHO GEMINI & LEADER AE**:
> Khi người dùng cung cấp đường dẫn video cục bộ (`.mp4`, `.mov`, `.mkv`) hoặc liên kết **YouTube** (`youtube.com/watch?v=...`, `youtu.be/...`), **TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ Ý ĐOÁN MÒ** thông số kỹ thuật.
> AI bắt buộc phải kích hoạt quy trình phân tích theo kỹ năng này để trích xuất mốc thời gian (Timestamps), phụ đề (Transcript) và khung hình mẫu (Keyframes) trước khi lập Blueprint.

---

## 2. Quy Trình Xử Lý Video Cục Bộ (Local Video Deconstruction)

Áp dụng khi người dùng cung cấp đường dẫn tệp video hướng dẫn trên máy tính.

### 2.1. Trích Xuất Khung Hình Trọng Tâm Bằng FFmpeg CLI
Sử dụng script Node.js hoặc lệnh `ffmpeg` qua terminal để chụp ảnh các phân đoạn chuyển đổi giao diện trong tutorial:

```bash
# 1. Trích xuất đều đặn 1 frame mỗi 10 giây để nắm tổng thể tiến trình
ffmpeg -i "tutorial.mp4" -vf "fps=1/10" -q:v 2 "frames/thumb_%03d.jpg"

# 2. Trích xuất chính xác tại mốc thời gian xuất hiện bảng Effect Controls hoặc Graph Editor
ffmpeg -ss 00:02:15 -i "tutorial.mp4" -vframes 1 -q:v 2 "frames/graph_editor.jpg"

# 3. Tự động phát hiện điểm chuyển cảnh (Scene Change Detection)
ffmpeg -i "tutorial.mp4" -filter_complex "select='gt(scene,0.3)',metadata=print:file=scene_cuts.txt" -vsync vfr "frames/scene_%03d.jpg"
```

### 2.2. Trích Xuất Bằng Script Node.js Đóng Gói Sẵn
Tạo script tạm thời chạy trong nền để xuất các khung hình quan trọng:
```javascript
import { execSync } from "child_process";
import fs from "fs";

function extractTutorialFrames(videoPath, outDir, intervalSec = 15) {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    // Trích xuất ảnh chất lượng cao định dạng PNG/JPG
    var cmd = `ffmpeg -y -i "${videoPath}" -vf "fps=1/${intervalSec}" -q:v 2 "${outDir}/step_%03d.png"`;
    execSync(cmd, { stdio: "ignore" });
}
```

### 2.3. Các Vùng Thị Giác Cần Đối Soát Trên Khung Hình Tutorial
1. **Bảng Timeline (Dưới cùng)**: Đọc tên layer, loại layer (Shape, Solid, Text, Null, Adjustment), màu nhãn, thứ tự phân cấp parenting.
2. **Bảng Effect Controls (Bên trái)**: Ghi nhận chính xác tên hiệu ứng (MatchName) và các thông số Slider, Checkbox, Color.
3. **Graph Editor (Đồ thị vận tốc)**: Đối soát hình dạng đường cong để quy đổi sang 12 Ease Presets trong `mcp-ease-presets.md` (Snappy $80\%$, Decelerate $80\%/0\%$, Smooth, v.v.).
4. **Cửa sổ Composition Settings (Ctrl+K)**: Đọc Width, Height, FPS, Duration.

---

## 3. Quy Trình Xử Lý Liên Kết YouTube (YouTube Link Parsing)

Áp dụng khi người dùng gửi đường link video YouTube.

### 3.1. Trích Xuất Video ID & Phụ Đề (Transcript / Subtitles)
1. **Lấy Video ID**: Phân tích URL để lấy chuỗi 11 ký tự (VD: `v=dQw4w9WgXcQ` $\to$ `dQw4w9WgXcQ`).
2. **Trích Xuất Transcript Có Mốc Thời Gian**: Sử dụng công cụ cào phụ đề tự động (timed text `.vtt`/`.json`) để lấy danh sách các câu nói kèm giây bắt đầu:
   ```json
   [
     { "start": 45.2, "duration": 3.1, "text": "First, create a new composition 1920 by 1080 at 30 fps" },
     { "start": 78.5, "duration": 4.5, "text": "Now add a shape layer and apply a trim paths operator" },
     { "start": 135.0, "duration": 5.2, "text": "Press F9 for Easy Ease, then open graph editor and pull influence to 80%" }
   ]
   ```

### 3.2. Bộ Từ Khóa Hành Động After Effects (Action Verb Dictionary)
Lọc transcript theo các từ khóa nghiệp vụ để xác định mốc thao tác:

| Từ khóa trong Transcript | Thao tác After Effects tương ứng | MCP Tool / ExtendScript ánh xạ |
| :--- | :--- | :--- |
| `New Comp`, `Composition Settings` | Khởi tạo Composition | `create-composition` |
| `Solid Layer`, `Background` | Tạo nền Solid | `add-solid-layer` |
| `Type tool`, `Text layer` | Tạo chữ | `create-text-layer` |
| `Trim Paths`, `Start/End` | Hoạt cảnh đường viền nét | `add-shape-operator` (Trim Paths) |
| `Repeater`, `Copies` | Tạo mảng lặp vector | `add-shape-operator` (Repeater) |
| `Easy Ease`, `Graph Editor`, `Influence` | Ép xung đồ thị gia tốc | `set-temporal-ease` (`mcp-ease-presets.md`) |
| `Track Matte`, `Alpha Matte` | Mặt nạ cắt lớp | `set-layer-mask`, `set-layer-properties` |
| `Null Object`, `Pick whip`, `Parent` | Liên kết cha-con | `add-null-layer`, `set-layer-parent` |
| `Motion Blur`, `Adjustment Layer` | Bật mờ chuyển động, chỉnh màu | `create-adjustment-layer`, switch `motionBlur` |

---

## 4. Quy Chế Chuyển Đổi Kịch Bản Video Thành Task Blueprint (Video-to-Blueprint Protocol)

Sau khi trích xuất thông tin từ video hoặc YouTube transcript, Leader AE tổng hợp thành bản **Execution Blueprint** tiêu chuẩn bàn giao cho Worker AE:

```markdown
### [TUTORIAL BLUEPRINT] Nguồn: <Tên Video / YouTube Link>
- **Thời lượng video gốc**: [Thời lượng gốc] ──► **Thời lượng AE Comp**: [Thời lượng tối ưu hóa]
- **Phong cách thẩm mỹ nhận diện**: [3 tính từ cốt lõi, VD: Snappy, High-Tech, Minimalist]

1. **Bảng Mốc Thời Gian Thao Tác (Tutorial Action Timeline)**:
   - `00:00 - 00:45` (Setup): Comp 1920x1080 @ 30fps, 5.0s. Nền Solid màu #141416.
   - `00:46 - 01:30` (Vector Base): Vẽ hình tròn bán kính 200px, thêm Trim Paths (Start 0% -> 100%).
   - `01:31 - 02:15` (Typography): Gõ chữ "CYBER MOTION", căn giữa comp.
   - `02:16 - 03:00` (Easing Tuning): Ép đồ thị `Decelerate Strong` (Influence 80%, Speed 0).
   - `03:01 - 03:45` (Composite): Lồng vào Node_Scene_01, thêm Glow và hạt Particle.

2. **Ánh Xạ Tác Vụ Nguyên Tử Cho Worker AE (Atomic Tasks)**:
   - **Task 1 (Setup)**: `create-composition` (Tên: "Tutorial_Recreation", 1920x1080, 30fps, 5s).
   - **Task 2 (Shape & Path)**: `add-shape-layer` + `add-shape-operator` (Trim Paths).
   - **Task 3 (Motion & Easing)**: Đặt keyframe `End` 0s -> 0.6s, gọi `set-temporal-ease` với preset `Decelerate Strong`.
   - **Task 4 (Verification)**: Chạy `see-frame` tại giây 2.0s để đối chiếu với frame gốc trích xuất từ tutorial.
```
