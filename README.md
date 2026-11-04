# Adobe After Effects MCP Server

[![Version](https://img.shields.io/badge/version-v2.4-blue.svg)](#)
[![Tools](https://img.shields.io/badge/tools-167-green.svg)](#-danh-mục-167-tools-15-nhóm-chức-năng)

A high-performance, modular Model Context Protocol (MCP) Server for Adobe After Effects built with TypeScript. Enables AI assistants (Claude, Cursor, Antigravity) to automate After Effects directly via a suite of **167 tools** with background ExtendScript CLI execution.

---

## ⚡ Hướng Dẫn Cài Đặt & Kết Nối (Setup & Connection Guide)

Thực hiện theo các bước đơn giản dưới đây để thiết lập và kết nối MCP Server với After Effects:

### Bước 1: Yêu Cầu Chuẩn Bị (Prerequisites)
1. **Node.js**: Phiên bản **>= 18.0.0** (Tải tại [nodejs.org](https://nodejs.org/)).
2. **Adobe After Effects**: Phiên bản bất kỳ từ **2020 đến 2025+** (v17.x – v25.x) trên Windows hoặc macOS.
3. **Cấp quyền Scripting (Bắt buộc duy nhất)**:
   * Trong After Effects, vào **Edit > Preferences > Scripting & Expressions...** (macOS: **After Effects > Settings > Scripting & Expressions...**).
   * Tích chọn: ☑️ **"Allow Scripts to Write Files and Access Network"** *(Cho phép script ghi tệp và truy cập mạng)*.
   * Khởi động lại After Effects một lần.

> **Quy tắc sử dụng hàng ngày**: Trước khi yêu cầu AI thực thi lệnh thiết kế, vui lòng **tự mở After Effects trên máy**. Background Bridge sẽ tự động kích hoạt ngầm, không cần mở panel hay thao tác thủ công.

---

### Bước 2: Cài Đặt & Kết Nối (Setup & Connect)

#### Cách 1: Chạy 1-Click Script (Khuyên dùng cho Windows)
* **Thiết lập lần đầu**: Nhấp đúp vào [`setup.cmd`](setup.cmd) (hoặc gõ `setup.cmd` trong terminal). Hệ thống sẽ tự động kiểm tra môi trường, cài đặt dependencies, biên dịch mã nguồn, cài Bridge vào thư mục Startup của After Effects và tự động cấu hình cho Claude Desktop & Cursor.
* **Kiểm tra nhanh hàng ngày**: Nhấp đúp vào [`test-ping.cmd`](test-ping.cmd) (hoặc gõ `npm run ping` trong terminal) để gửi Live Ping tới After Effects trong < 1 giây và xem dashboard toàn bộ 167 tools.

> 🌐 **Tự động nhận diện ngôn ngữ (Auto Language Detection)**: Cả hai tệp `setup.cmd` và `test-ping.cmd` tự động thích ứng theo **ngôn ngữ hiển thị (Display Language)** của hệ điều hành: Máy cài Windows/macOS Tiếng Việt sẽ hiển thị Tiếng Việt; máy cài Windows/macOS Tiếng Anh (dù vùng đặt tại Việt Nam) hoặc máy quốc tế sẽ mặc định hiển thị Tiếng Anh. Bạn cũng có thể truyền cờ `--lang=vi` hoặc `--lang=en` nếu muốn chỉ định ngôn ngữ.

#### Cách 2: Thiết Lập Thủ Công (Windows & macOS)
```bash
npm install             # 1. Cài đặt thư viện dependencies
npm run build           # 2. Biên dịch TypeScript sang JavaScript
npm run install-bridge  # 3. Copy Bridge Listener vào Startup của After Effects
npm run doctor          # 4. Kiểm tra sức khỏe hệ thống & tự động cấu hình Client
```

#### Cấu Hình MCP Client (Tự động hoặc Thủ công)
* **Cursor / Antigravity / Windsurf**: Đã tích hợp sẵn cấu hình trong [`.mcp.json`](.mcp.json) ở thư mục gốc (tự động nhận diện khi mở dự án):
```json
{
  "mcpServers": {
    "adobe-after-effects": {
      "command": "node",
      "args": ["./build/index.js"]
    }
  }
}
```
* **Claude Desktop**: Đã được `setup.cmd` hoặc `npm run doctor` tự động cấu hình vào `claude_desktop_config.json`. Nếu cấu hình thủ công:
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
*(Khởi động lại Claude Desktop hoặc Cursor để nạp cấu hình mới).*

---

## 🧠 Hệ Thống 13 Agent Skills (.agent/skills/)

Tích hợp sẵn **13 kỹ năng chuyên sâu** hỗ trợ quy trình thiết kế và tự động hóa trong After Effects:

| Kỹ năng | Tệp hướng dẫn | Trọng tâm chuyên môn |
| :--- | :--- | :--- |
| **Motion Design & Scripting** | [`ae-design-scripting`](.agent/skills/ae-design-scripting/SKILL.md) | Phân tích kịch bản, mạng lưới Node-Procedural, thẩm mỹ & blueprint |
| **Keyframe & Easing** | [`ae-keyframe-easing`](.agent/skills/ae-keyframe-easing/SKILL.md) | 12 Ease Presets chuẩn hóa, Remotion spring physics, graph retiming |
| **Shape Operators** | [`ae-shape-operators`](.agent/skills/ae-shape-operators/SKILL.md) | Repeater mảng tròn/lưới, Trim Paths, Merge Paths, Polystar |
| **Text Animation** | [`ae-text-animation`](.agent/skills/ae-text-animation/SKILL.md) | Kinetic typography, auto RTL/Arabic, range text animators |
| **Expression Math** | [`ae-expression-math`](.agent/skills/ae-expression-math/SKILL.md) | ToComp, lookAt, responsive text, slider controls & wave math |
| **Video Tutorial Parser** | [`ae-video-tutorial-parser`](.agent/skills/ae-video-tutorial-parser/SKILL.md) | Bóc tách video tutorial (ffmpeg) & YouTube transcript thành blueprint |
| **Color Management** | [`ae-color-management`](.agent/skills/ae-color-management/SKILL.md) | Quản lý màu 32-bpc linear, 3D LUT .cube, grading stack |
| **Asset Interchange** | [`ae-asset-interchange`](.agent/skills/ae-asset-interchange/SKILL.md) | Nhập SVG/AI vector, PSD cropped layers, alpha channel & Lottie |
| **Audio Reactive** | [`ae-audio-reactive`](.agent/skills/ae-audio-reactive/SKILL.md) | Bắt nhịp beat, audio to keyframes, lọc decay biên độ âm thanh |
| **MOGRT / Essential Graphics** | [`ae-mogrt-essential-graphics`](.agent/skills/ae-mogrt-essential-graphics/SKILL.md) | Tự động hóa Essential Graphics, tham số động Text, Color, Slider |
| **Character Rigging** | [`ae-character-rigging`](.agent/skills/ae-character-rigging/SKILL.md) | Rigging nhân vật, parenting, null controller & Duik Angela |
| **Visual Feedback** | [`ae-visual-feedback`](.agent/skills/ae-visual-feedback/SKILL.md) | Xuất preview frame (see-frame), contact sheet, tự sửa lỗi hình ảnh |
| **Render Pipeline** | [`ae-render-pipeline`](.agent/skills/ae-render-pipeline/SKILL.md) | Xuất video nền bằng aerender không đơ máy, render queue |

---

## 🛡️ Hệ Thống Multi-Agent 3 Tầng (.agent/rules/)

Phân quyền và phối hợp thực thi kịch bản chuyển động:

| Quy chuẩn | Tệp quy chuẩn | Trách nhiệm chính |
| :--- | :--- | :--- |
| **Leader AE** | [`.agent/rules/leader-ae.md`](.agent/rules/leader-ae.md) | Art Director: Phân tích đề bài, lập kịch bản & phân rã tasks |
| **Worker AE** | [`.agent/rules/worker-ae.md`](.agent/rules/worker-ae.md) | Execution Tech: Thực thi công cụ MCP, try-finally Undo Group, tự sửa lỗi |
| **Design System** | [`.agent/rules/design-system-spec.md`](.agent/rules/design-system-spec.md) | Tiêu chuẩn thiết kế: Hệ màu RGB 0-1, 32-bpc linear, typography, safe zones |
| **Collaboration Loop** | [`.agent/rules/agent-collaboration-loop.md`](.agent/rules/agent-collaboration-loop.md) | Vòng lặp phối hợp: Atomic Tasks (Setup $\to$ Assembly $\to$ Motion $\to$ QA) |

---

## 📊 Danh Mục 167 Tools (15 Nhóm Chức Năng)

| Nhóm chức năng | Số lượng | Công cụ tiêu biểu & Phạm vi |
| :--- | :---: | :--- |
| **1. Motion Graphics Templates** | 6 | `create-lower-third`, `create-title-card`, `create-transition`, `create-logo-reveal`... |
| **2. Vector Shapes & Paths** | 4 | `create-path`, `get-path`, `set-path-keyframes`, `add-shape-operator`... |
| **3. 3D Space, Camera & Lights** | 7 | `set-3d-layer`, `set-material-options`, `set-camera-options`, `set-light-options`... |
| **4. Masks & Rotoscoping** | 7 | `add-mask`, `list-masks`, `get-mask-path`, `set-mask-keyframes`, `delete-mask`... |
| **5. Animation, Springs & Expressions** | 36 | `setLayerKeyframe`, `setLayerExpression`, `apply-spring-animation`, `markers`... |
| **6. Composition Control** | 12 | `create-composition`, `inspect-comp`, `localize-comp`, `center-layers`... |
| **7. Layer Operations** | 21 | `create-text-layer`, `add-solid-layer`, `precompose-layers`, `set-layer-parent`... |
| **8. Effects & Presets** | 16 | `apply-effect`, `add-any-effect`, `apply-preset`, `set-effect-property`... |
| **9. Project & Asset Management** | 11 | `create-project`, `open-project`, `save-project`, `collect-files`, `reduce-project`... |
| **10. Footage & Media** | 5 | `import-footage`, `list-project-items`, `relink-footage`, `set-proxy`... |
| **11. Audio Analysis & Control** | 3 | `analyze-audio-waveform`, `set-audio-levels`, `get-audio-info`... |
| **12. Visual Feedback & Verification** | 3 | `see-frame`, `contact-sheet`, `match-reference` (AI tự sửa lỗi layout)... |
| **13. Render Queue & Export** | 11 | `render-aerender` (xuất ngầm không đơ máy), `render-queue`, `queue-in-ame`... |
| **14. System & ExtendScript Engine** | 6 | `execute-script` (chạy script tùy ý), `check-bridge`, `ae_ping`, `run-script`... |
| **15. Compatibility Aliases** | 19 | Snake_case aliases (`create_project`, `open_project`, `ae_create_comp`...)... |
| **Tổng cộng** | **167** | **Bộ công cụ tự động hóa toàn diện cho Adobe After Effects** |

---

## 🔍 Chi Tiết Từng Nhóm Tool (Bấm để mở rộng)

<details>
<summary><b>👉 Bấm vào đây để xem toàn bộ danh sách 167 MCP Tools</b></summary>

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
- **14. System & ExtendScript Engine (6 tools)**: `run-script`, `get-results`, `get-help`, `check-bridge`, `run-bridge-test`, `execute-script`
- **15. Compatibility Aliases (19 tools)**: `ae_ping`, `ae_create_comp`, `ae_add_text`, `create_project`, `open_project`, `save_project`, `get_project_info`, `create_lower_third`, `create_title_card`, `create_transition`, `create_logo_reveal`, `create_text_animator`, `apply_expression_template`, `create_path`, `get_path`, `set_3d_layer`, `add_mask`, `list_masks`, `list_render_queue`

</details>
