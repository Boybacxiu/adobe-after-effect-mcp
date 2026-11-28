# Adobe After Effects MCP Server

[![Version](https://img.shields.io/badge/version-v2.4.5-blue.svg)](#)
[![Tools](https://img.shields.io/badge/tools-169-green.svg)](#-danh-mục-169-mcp-tools-15-nhóm-chức-năng)

A high-performance, modular Model Context Protocol (MCP) Server for Adobe After Effects built with TypeScript. Enables AI assistants (Claude, Cursor, Antigravity, VS Code Copilot) to automate After Effects directly via a suite of **169 tools** with background ExtendScript CLI execution.

---

## ⚡ Hướng Dẫn Cài Đặt & Kết Nối (Setup & Connection Guide)

### Bước 1: Yêu Cầu Chuẩn Bị (Prerequisites)
1. **Node.js**: Phiên bản **>= 18.0.0** (Tải tại [nodejs.org](https://nodejs.org/)).
2. **Adobe After Effects**: Phiên bản bất kỳ từ **2020 đến 2025+** (v17.x – v25.x) trên Windows hoặc macOS.
3. **Cấp quyền Scripting (Bắt buộc duy nhất)**:
   * Trong After Effects, vào **Edit > Preferences > Scripting & Expressions...** (macOS: **After Effects > Settings > Scripting & Expressions...**).
   * Tích chọn: ☑️ **"Allow Scripts to Write Files and Access Network"** *(Cho phép script ghi tệp và truy cập mạng)*.
   * Khởi động lại After Effects một lần.

> **Quy tắc sử dụng hàng ngày**: Trước khi yêu cầu AI thực thi lệnh thiết kế, vui lòng **tự mở After Effects trên máy**. Background Bridge sẽ tự động kích hoạt ngầm, không cần mở panel hay thao tác thủ công.

Trên Windows với After Effects 25.1, đặt `src/scripts/mcp-bridge-auto.jsx` trong `%APPDATA%\Adobe\After Effects\25.1\Scripts\Startup`, rồi mở lại After Effects. Tool `set-ai-overlay` bật hoặc ẩn HUD **AI IS WORKING** trong khi MCP thực thi lệnh.

---

### Bước 2: Biên Dịch Dự Án (Build)
```bash
npm install             # 1. Cài đặt thư viện dependencies
npm run build           # 2. Biên dịch TypeScript sang JavaScript
npm test                # 3. Chạy Dual-Audit kiểm thử hệ thống
```

---

### Bước 3: Cấu Hình MCP Client (Đa Nền Tảng)

Dự án đã tích hợp sẵn các file cấu hình tương thích cho từng nền tảng AI:

* **Antigravity**: Tự động nhận diện Workspace Plugin tại `.agent/plugins/adobe-after-effects/mcp_config.json`.
* **Cursor**: Tự động nhận diện cấu hình tại `.cursor/mcp.json`.
* **Claude Code**: Tự động nhận diện cấu hình tại `.mcp.json`.
* **VS Code Copilot**: Tự động nhận diện cấu hình tại `.vscode/mcp.json`.
* **Claude Desktop / Khác**:
```json
{
  "mcpServers": {
    "adobe-after-effects": {
      "command": "node",
      "args": ["<ĐƯỜNG_DẪN_TUYỆT_ĐỐI_TỚI_REPO>/build/index.js"]
    }
  }
}
```

---

## 🧠 Hệ Thống 16 Procedural Motion Skills (.agent/skills/)

Tích hợp sẵn **16 kỹ năng chuyên sâu** (16 active + 1 disabled) hỗ trợ quy trình thiết kế và tự động hóa trong After Effects:

- **Motion Design & Scripting** ([`ae-design-scripting`](.agent/skills/ae-design-scripting/SKILL.md)): Phân tích kịch bản, mạng lưới Node-Procedural, thẩm mỹ & blueprint.
- **Keyframe & Easing** ([`ae-keyframe-easing`](.agent/skills/ae-keyframe-easing/SKILL.md)): 12 Ease Presets chuẩn hóa, Remotion spring physics, graph retiming.
- **Shape Operators** ([`ae-shape-operators`](.agent/skills/ae-shape-operators/SKILL.md)): Repeater mảng tròn/lưới, Trim Paths, Merge Paths, Polystar.
- **Text Animation** ([`ae-text-animation`](.agent/skills/ae-text-animation/SKILL.md)): Kinetic typography, auto RTL/Arabic, range text animators.
- **Expression Math** ([`ae-expression-math`](.agent/skills/ae-expression-math/SKILL.md)): ToComp, lookAt, responsive text, slider controls & wave math.
- **Video Tutorial Parser** ([`ae-video-tutorial-parser`](.agent/skills/ae-video-tutorial-parser/SKILL.md)): Bóc tách video tutorial (ffmpeg) & YouTube transcript thành blueprint.
- **Color Management** ([`ae-color-management`](.agent/skills/ae-color-management/SKILL.md)): Quản lý màu 32-bpc linear, 3D LUT .cube, grading stack.
- **Asset Interchange** ([`ae-asset-interchange`](.agent/skills/ae-asset-interchange/SKILL.md)): Nhập SVG/AI vector, PSD cropped layers, alpha channel & Lottie.
- **Audio Reactive** ([`ae-audio-reactive`](.agent/skills/ae-audio-reactive/SKILL.md)): Bắt nhịp beat, audio to keyframes, lọc decay biên độ âm thanh.
- **MOGRT / Essential Graphics** ([`ae-mogrt-essential-graphics`](.agent/skills/ae-mogrt-essential-graphics/SKILL.md)): Tự động hóa Essential Graphics, tham số động Text, Color, Slider.
- **Visual Feedback** ([`ae-visual-feedback`](.agent/skills/ae-visual-feedback/SKILL.md)): Xuất preview frame (see-frame), contact sheet, tự sửa lỗi hình ảnh.
- **Render Pipeline** ([`ae-render-pipeline`](.agent/skills/ae-render-pipeline/SKILL.md)): Xuất video nền bằng aerender không đơ máy, render queue.
- **Magic Fire & Burn VFX** ([`ae-magic-fire-burn`](.agent/skills/ae-magic-fire-burn/SKILL.md)): Procedural fire, burn, ember, and smoke VFX bằng native effects.
- **3D Cinematic Camera** ([`ae-3d-cinematic-camera`](.agent/skills/ae-3d-cinematic-camera/SKILL.md)): Máy quay 3D 2-node, orbit null, Depth of Field, rack focus, 2.5D parallax.
- **Kinetic Caption Reels** ([`ae-kinetic-caption-reels`](.agent/skills/ae-kinetic-caption-reels/SKILL.md)): Phụ đề 9:16 dọc (TikTok/Reels), karaoke pop, responsive badge, safe zones.
- **Logo Reveal Pro** ([`ae-logo-reveal-pro`](.agent/skills/ae-logo-reveal-pro/SKILL.md)): Hoạt cảnh logo chuyên nghiệp, trim path stroke, Saber energy trace, light sweep.
- *(Tạm ẩn)* **Character Rigging** (`ae-character-rigging`): Tạm thời khóa tại `.agent/skills-disabled/` do đã xóa Duik.

---

## 🛠️ Danh Mục 169 MCP Tools (15 Nhóm Chức Năng)

<details open>
<summary><b>👉 Danh sách toàn bộ 169 MCP Tools (Bấm để thu gọn / mở rộng)</b></summary>

- **1. Motion Graphics Templates (6 tools)**: `create-lower-third`, `create-title-card`, `create-transition`, `create-logo-reveal`, `create-text-animator`, `list-template-styles`
- **2. Vector Shapes & Paths (4 tools)**: `create-path`, `get-path`, `set-path-keyframes`, `add-shape-operator`
- **3. 3D Space, Camera & Lights (7 tools)**: `set-3d-layer`, `set-material-options`, `set-geometry-options`, `set-camera-options`, `set-light-options`, `get-3d-info`, `set-comp-renderer`
- **4. Masks & Rotoscoping (7 tools)**: `add-mask`, `list-masks`, `get-mask-path`, `set-mask-path`, `set-mask-keyframes`, `set-mask-properties`, `delete-mask`
- **5. Animation, Springs & Expressions (36 tools)**: `setLayerKeyframe`, `setLayerExpression`, `test-animation`, `animate-to-audio`, `animate-from-data`, `add-marker`, `add-markers-bulk`, `apply-spring-animation`, `list-spring-presets`, `calculate-spring-duration`, `apply-expression-template`, `list-expression-templates`, `batch-set-expressions`, `link-properties`, `add-expression-control`, `get-expression`, `remove-expression`, `enable-expression`, `set-keyframe-advanced`, `apply-easy-ease`, `set-temporal-ease`, `offset-keyframes`, `scale-keyframe-timing`, `reverse-keyframes`, `copy-keyframes`, `get-keyframes`, `add-composition-marker`, `add-layer-marker`, `get-markers`, `delete-marker`, `set-work-area`, `get-current-time`, `set-current-time`, `snap-to-marker`, `get-nearest-marker`, `navigate-markers`
- **6. Composition Control (12 tools)**: `create-composition`, `set-composition-properties`, `inspect-comp`, `localize-comp`, `populate-template`, `center-layers`, `duplicate-composition`, `delete-composition`, `list-compositions`, `get-composition-info`, `get-comp-report`, `set-active-composition`
- **7. Layer Operations (21 tools)**: `create-text-layer`, `create-adjustment-layer`, `create-camera`, `duplicate-layer`, `delete-layer`, `set-layer-parent`, `reorder-layer`, `precompose-layers`, `set-layer-mask`, `batch-set-layer-properties`, `inspect-layer`, `get-layer-clip-frames`, `add-solid-layer`, `add-shape-layer`, `add-null-layer`, `add-light-layer`, `add-av-layer`, `add-text-layer-advanced`, `list-layers`, `get-layer-info`, `modify-layer`
- **8. Effects & Presets (16 tools)**: `apply-effect`, `add-any-effect`, `apply-effect-template`, `remove-effect`, `list-layer-effects`, `list-available-effects`, `set-effect-property`, `set-effect-keyframe`, `list-presets`, `search-presets`, `apply-preset`, `mcp_aftereffects_get_effects_help`, `modify-effect-properties`, `reorder-effects`, `copy-effects`, `list-effects`
- **9. Project & Asset Management (11 tools)**: `create-project`, `open-project`, `save-project`, `close-project`, `get-project-info`, `import-folder`, `replace-footage`, `organize-project-items`, `find-missing-footage`, `collect-files`, `reduce-project`
- **10. Footage & Media (5 tools)**: `import-footage`, `list-project-items`, `relink-footage`, `set-proxy`, `remove-proxy`
- **11. Audio Analysis & Control (3 tools)**: `set-audio-levels`, `get-audio-info`, `analyze-audio-waveform`
- **12. Visual Feedback & Verification (3 tools)**: `see-frame`, `contact-sheet`, `match-reference`
- **13. Render Queue & Export (11 tools)**: `add-to-render-queue`, `render-queue`, `start-render`, `render-aerender`, `render-status`, `list-render-queue`, `list-render-templates`, `set-render-queue-item`, `remove-from-render-queue`, `control-render`, `queue-in-ame`
- **14. System & ExtendScript Engine (8 tools)**: `run-script`, `get-results`, `get-help`, `check-bridge`, `run-bridge-test`, `execute-script`, `set-ai-overlay`, `cleanup-session`
- **15. Compatibility Aliases (19 tools)**: `ae_ping`, `ae_create_comp`, `ae_add_text`, `create_project`, `open_project`, `save_project`, `get_project_info`, `create_lower_third`, `create_title_card`, `create_transition`, `create_logo_reveal`, `create_text_animator`, `apply_expression_template`, `create_path`, `get_path`, `set_3d_layer`, `add_mask`, `list_masks`, `list_render_queue`

</details>
