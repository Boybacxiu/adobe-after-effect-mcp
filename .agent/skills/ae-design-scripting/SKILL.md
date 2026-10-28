---
name: ae-design-scripting
description: "Motion design planning, script breakdown, visual hierarchy, aesthetic direction, and composition architecture in After Effects. Used by Leader AE to plan execution blueprints before assigning to Worker AE."
---

# Motion Design & Scripting Architecture

Tài liệu chuẩn mực kiến trúc tư duy thiết kế, phân tích kịch bản và lập kế hoạch kỹ thuật dành riêng cho **Leader AE (Kiến trúc sư Motion Design & Giám đốc Nghệ thuật)**.

---

## 1. Hệ Thống Tài Liệu Thiết Kế & Rà Soát Chuyên Sâu

Leader AE vận dụng 4 bộ tiêu chuẩn rà soát và phương pháp luận chuyên sâu trong thư mục này để đảm bảo chất lượng đồ họa chuyển động:

1. [**`node-procedural-breakdown.md`**](node-procedural-breakdown.md): Phương pháp luận phân rã kịch bản phức tạp thành mạng lưới **Node-Graph thủ tục (Precomp DAG)**, loại bỏ Composition nguyên khối và hỗ trợ chỉnh sửa phi phá hủy.
2. [**`anti-generic-motion-check.md`**](anti-generic-motion-check.md): Tiêu chuẩn loại bỏ các thói quen xấu, đồ thị chuyển động tuyến tính thô kệch (linear) và các khuôn mẫu AI sáo rỗng (AI Slop).
3. [**`motion-aesthetic-direction.md`**](motion-aesthetic-direction.md): Quy trình cam kết phong cách thị giác (3 tính từ cốt lõi, bảng màu, cặp đôi font, chế độ chuyển động) trước khi dựng cảnh.
4. [**`timeline-rhythm-review.md`**](timeline-rhythm-review.md): Quy chuẩn rà soát phân cấp thị giác (Bậc 1, Bậc 2, Bậc 3) và nhịp điệu timeline (Stagger so le 3-6 frames, thời gian dừng đọc $1.5s - 2.5s$).
5. Đối soát quy chuẩn kích thước, bảng màu và khoảng cách tại [`.agent/rules/design-system-spec.md`](../../rules/design-system-spec.md).

---

## 2. Quy Trình Phân Tích Kịch Bản & Phân Rã Node-Graph

Mọi đề bài từ Gemini (Trưởng phòng) phải được mổ xẻ qua 4 bước bắt buộc trước khi lập bản kế hoạch:

### 2.1. Phân Rã Mạng Lưới Node Thủ Tục (Node-Graph Network)
- Áp dụng phương pháp luận từ [`node-procedural-breakdown.md`](node-procedural-breakdown.md):
  - **Source Nodes**: Tách các phần tử text, shape container hoặc logo thành các Precomps độc lập.
  - **Composite Nodes**: Ghép các Source Nodes vào cảnh quay, liên kết bằng Track Matte hoặc Null Controllers.
  - **Terminal Node**: Master Comp quản lý camera, chuyển cảnh và xuất render.

### 2.2. Phân Tách Nhịp Thị Giác (Visual Beats & Timeline)
- **Giai đoạn Mở màn (Hook: 0s - 1.5s)**: Chuyển động bùng nổ, bắt mắt (Snappy entrance, scale-up pop, typography lôi cuốn).
- **Giai đoạn Truyền tải (Core Delivery: 1.5s - Ns)**: Chuyển động nhịp nhàng, thông tin chính rõ ràng, đảm bảo khoảng dừng đọc tối thiểu 1.5 giây.
- **Giai đoạn Kết thúc / Chuyển cảnh (Outro / Transition: Ns - End)**: Thoát cảnh dứt khoát, CTA rõ ràng hoặc chuyển cảnh máy quay mượt mà.

### 2.3. Quy Hoạch Phân Tầng Thị Giác (Z-Depth & Visual Hierarchy)
- **Background (Hậu cảnh)**: Màu nền trung tính, dải màu phẳng hoặc gradient 2 điểm tinh tế, chuyển động vi mô.
- **Midground (Chủ thể chính - Focal Point)**: Nhân vật, tiêu đề typography, biểu tượng trọng tâm.
- **Foreground (Tiền cảnh)**: Hiệu ứng che chắn, particle, light sweep tạo chiều sâu không gian.

### 2.4. Quy Chuẩn Điểm Neo Cơ Học (Anchor Point Logic)
- **Phần tử nảy mầm (Grow up)**: Đặt Anchor Point tại chân đối tượng `[w/2, h]`.
- **Chữ gõ máy (Typewriter) / Lower Thirds**: Đặt tại mép trái `[0, h/2]`.
- **Vòng xoay / Zoom trung tâm**: Đặt tại tâm hình học `[w/2, h/2]`.
- **Khớp nối nhân vật**: Đặt chính xác tại trục khớp xoay giải phẫu học (vai, khuỷu, cổ tay...).

---

## 3. Điều Hướng Kỹ Năng Thực Thi Xuống Worker AE

Leader AE chỉ định đích danh thư mục skill và bộ thông số Easing tương ứng cho **Worker AE**:

| Nhu cầu kỹ thuật của cảnh | Thư mục Skill Worker AE phải tra cứu | Công cụ MCP & Presets trọng tâm |
| :--- | :--- | :--- |
| **Bóc tách Video Tutorial & YouTube** | [`.agent/skills/ae-video-tutorial-parser/SKILL.md`](../ae-video-tutorial-parser/SKILL.md) | Trích xuất frames (ffmpeg), phụ đề transcript, timeline mốc |
| **Gia tốc đồ thị, Easing Presets** | [`.agent/skills/ae-keyframe-easing/SKILL.md`](../ae-keyframe-easing/SKILL.md) | Tra cứu [`mcp-ease-presets.md`](../ae-keyframe-easing/mcp-ease-presets.md), `set-temporal-ease` |
| **Toán tử Vector / Trim / Repeater**| [`.agent/skills/ae-shape-operators/SKILL.md`](../ae-shape-operators/SKILL.md) | `add-shape-operator`, radial burst, grid array |
| **Biểu thức nâng cao / toComp / Box**| [`.agent/skills/ae-expression-math/SKILL.md`](../ae-expression-math/SKILL.md) | `toComp`, `lookAt`, responsive `sourceRectAtTime()`, loops |
| **Quản lý màu / 32-bpc Float / LUT**| [`.agent/skills/ae-color-management/SKILL.md`](../ae-color-management/SKILL.md) | 32-bpc linear blending, Rec.709/601, TriTone, LUT `.cube` |
| **Nhập liệu / SVG / PSD / Lottie** | [`.agent/skills/ae-asset-interchange/SKILL.md`](../ae-asset-interchange/SKILL.md) | `COMP_CROPPED_LAYERS`, straight alpha, chuẩn Lottie |
| **Hoạt cảnh âm thanh / Bắt Beat** | [`.agent/skills/ae-audio-reactive/SKILL.md`](../ae-audio-reactive/SKILL.md) | Convert Audio to Keyframes, decay filter, beat triggers |
| **Essential Graphics / Đóng gói MOGRT**| [`.agent/skills/ae-mogrt-essential-graphics/SKILL.md`](../ae-mogrt-essential-graphics/SKILL.md) | `addToMotionGraphicsTemplate()`, dynamic controls |
| **Typography, Chữ nghệ thuật, RTL** | [`.agent/skills/ae-text-animation/SKILL.md`](../ae-text-animation/SKILL.md) | `create-text-layer`, text animators |
| **Rigging nhân vật, Khớp xương Duik** | [`.agent/skills/ae-character-rigging/SKILL.md`](../ae-character-rigging/SKILL.md) | `evalDuik()` tương đối, Null bones, IK/FK |
| **Kiểm tra trực quan, Chụp ảnh khung hình** | [`.agent/skills/ae-visual-feedback/SKILL.md`](../ae-visual-feedback/SKILL.md) | `see-frame`, contact sheet |
| **Xuất video, Render Queue, aerender** | [`.agent/skills/ae-render-pipeline/SKILL.md`](../ae-render-pipeline/SKILL.md) | `render-aerender`, `add-to-render-queue` |

---

## 4. Bản Mẫu Kế Hoạch Chuyển Giao Tiêu Chuẩn (Execution Blueprint Template)

Leader AE xuất kế hoạch chuyển giao cho Worker AE theo khung chuẩn sau:

```markdown
### [BLUEPRINT] Phân Cảnh: <Tên_Scene>

<!-- THẨM MỸ & THÔNG SỐ CHỦ ĐẠO -->
- Cảm xúc thị giác: [3 tính từ cốt lõi, VD: Snappy, Modern, Tech]
- Preset Easing chỉ định: [Tên preset từ mcp-ease-presets.md, VD: Decelerate Strong / Expo Decelerate]
- Bảng màu: Nền #141416 | Primary #FFFFFF | Accent #38BDF8
- Typography: Display 64px (Bold) + Subtitle 32px (Medium)

1. **Kiến Trúc Procedural Node (DAG)**:
   - Source Node 1: `Node_Text_Title` (Comp 1920x300, 5s)
   - Composite Node: `Node_Scene_01` (Comp 1920x1080, 5s) chứa `Node_Text_Title` + `Node_BG`

2. **Cấu trúc Layer & Điểm Pivot**:
   - Layer 1: [Tên] | Loại: [Text/Shape/Null/Precomp] | Anchor Point: [x, y] | Parent: [Tên Layer Cha hoặc None]
   - Layer 2: ...

3. **Chỉ định Hoạt cảnh & Gia Tốc Easing**:
   - Layer 1 (Entrance 0.0s -> 0.4s):
     - Position: Key 0.0s [x1, y1] -> Key 0.4s [x2, y2]
     - Easing Preset: `Decelerate Strong` (Out Inf: 15%, Speed: 2.5 | In Inf: 80%, Speed: 0)
   - Layer 2 (Stagger lệch 4 frames):
     - Scale: Key 0.13s [0, 0] -> Key 0.5s [100, 100] | Easing: `Decelerate Strong`
   - Reading Hold Time: 0.5s đến 4.2s (giữ nguyên).
   - Outro: 4.2s đến 5.0s | Easing: `Expo Accelerate`.

4. **Phân Quyền Kỹ Năng & Plugin (BẮT BUỘC)**:
   - Thư viện kỹ năng tra cứu: `.agent/skills/<tên-skill>/SKILL.md`
   - Thư viện Easing tra cứu: `.agent/skills/ae-keyframe-easing/mcp-ease-presets.md`
   - Quyền dùng Duik Angela: **[CẤM - Không liên quan xương khớp]** HOẶC **[CHO PHÉP & BẮT BUỘC DÙNG DUIK]**
```
