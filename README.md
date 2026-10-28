# Adobe After Effects MCP Server

[![Version](https://img.shields.io/badge/version-v2.4-blue.svg)](#)
[![Tools](https://img.shields.io/badge/tools-167-green.svg)](#-danh-mục-167-tools-15-nhóm-chức-năng)

A high-performance, modular Model Context Protocol (MCP) Server for Adobe After Effects built with TypeScript. Enables AI assistants (Claude, Cursor, Antigravity) to automate After Effects directly via a suite of **167 tools** with background ExtendScript CLI execution.

---

## 💻 System Requirements & Compatibility

- **Adobe After Effects**: Tương thích mượt mà 100% với **Adobe After Effects từ 2020 đến 2025+** (v17.x – v25.x) trên cả **Windows** và **macOS**.
- **Cấp quyền Scripting bắt buộc**: Trong After Effects, vào **Edit > Preferences > Scripting & Expressions** (hoặc **After Effects > Settings > Scripting & Expressions** trên macOS), tích chọn:
  - ☑️ **"Allow Scripts to Write Files and Access Network"** *(Bắt buộc để Background Listener IPC giao tiếp tự động với AI)*.
- **Node.js**: Phiên bản `>= 18.0.0`.
- **Đa nền tảng**: Tự động dò tìm đường dẫn ứng dụng `AfterFX.exe` và `aerender` trên toàn bộ các phiên bản cài đặt trong hệ điều hành.

---

## ⚡ Quick Start & Setup

### 1. Build & Install
```bash
npm install
npm run build
npm run install-bridge   # Tự động copy mcp-bridge-auto.jsx vào Scripts/Startup/
```

### 2. After Effects Setting
Mở After Effects > **Edit > Preferences > Scripting & Expressions** > Tích chọn **"Allow Scripts to Write Files and Access Network"**. Khởi động lại After Effects (Bridge chạy ngầm tự động 100%, không cần mở UI panel).

### 3. MCP Client Configuration

#### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "adobe-after-effects": {
      "command": "node",
      "args": ["/path/to/adobe-after-effect-mcp/build/index.js"]
    }
  }
}
```

#### Cursor / Antigravity / Windsurf (`.mcp.json`)
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

---

## 🚀 Key Highlights

- **167 Tools Across 15 Modules**: Quản lý toàn diện comp, layer, keyframe, mask, 3D camera/lights, effects, render và visual AI.
- **Background Headless Execution**: Thực thi qua `AfterFX.exe -r` và IPC file polling (`ae_command.json` / `ae_mcp_result.json`), không nghẽn UI.
- **Remotion Spring Physics**: Mô phỏng dao động lò xo chuẩn xác (damping, stiffness, mass, settling time).
- **Multilingual & RTL**: Hỗ trợ văn bản RTL (tiếng Ả Rập, Do Thái) và ánh xạ `matchName` độc lập ngôn ngữ.
- **Full Client Compatibility**: Hỗ trợ cả hai chuẩn định dạng kebab-case (`create-composition`) và snake_case (`create_project`).

---

## 🧠 Hệ Thống Agent Skills Tối Ưu Hóa (.agent/skills/)

Dự án tích hợp sẵn **13 Skills chuyên sâu** theo chuẩn **Progressive Disclosure**, cô đọng 100% nội dung kỹ thuật (quy trình từng bước, công thức toán học, code mẫu chuẩn) và tối ưu hóa tối đa mức tiêu thụ token (~930 tokens khi ở trạng thái chờ):

| Skill | Tệp hướng dẫn | Phạm vi chuyên biệt | Token (Idle / Active) |
| :--- | :--- | :--- | :---: |
| **Video Tutorial & YouTube** (`ae-video-tutorial-parser`) | [.agent/skills/ae-video-tutorial-parser/SKILL.md](.agent/skills/ae-video-tutorial-parser/SKILL.md) | Bóc tách video tutorial cục bộ (ffmpeg), phân tích phụ đề YouTube transcript & chuyển đổi sang Blueprint | ~71 / ~1688 |
| **Motion Design & Scripting** (`ae-design-scripting`) | [.agent/skills/ae-design-scripting/SKILL.md](.agent/skills/ae-design-scripting/SKILL.md) | Phân tích kịch bản, mạng lưới Node-Graph (DAG), cam kết thẩm mỹ, chống AI slop & execution blueprint | ~66 / ~1989 |
| **Keyframe & Easing** (`ae-keyframe-easing`) | [.agent/skills/ae-keyframe-easing/SKILL.md](.agent/skills/ae-keyframe-easing/SKILL.md) | 12 Ease Presets vận tốc chuẩn hóa, Remotion spring physics, graph retiming | ~68 / ~979 |
| **Shape Operators** (`ae-shape-operators`) | [.agent/skills/ae-shape-operators/SKILL.md](.agent/skills/ae-shape-operators/SKILL.md) | Toán tử vector thủ tục: Repeater mảng tròn/lưới, Trim Paths, Merge Paths, Polystar | ~70 / ~1166 |
| **Expression Math** (`ae-expression-math`) | [.agent/skills/ae-expression-math/SKILL.md](.agent/skills/ae-expression-math/SKILL.md) | Biến đổi không gian `toComp`, `lookAt`, responsive `sourceRectAtTime()`, Sliced Wave math, Slider Controls & bounce | ~82 / ~1280 |
| **Color Management** (`ae-color-management`) | [.agent/skills/ae-color-management/SKILL.md](.agent/skills/ae-color-management/SKILL.md) | Quản lý màu 32-bpc linear compositing, Rec.709/601 luminance, 3D LUT `.cube`, grading stack | ~80 / ~914 |
| **Asset Interchange** (`ae-asset-interchange`) | [.agent/skills/ae-asset-interchange/SKILL.md](.agent/skills/ae-asset-interchange/SKILL.md) | Nhập khẩu SVG/AI vector, PSD cropped layers, xử lý Straight Alpha & tương thích Lottie | ~81 / ~905 |
| **Audio Reactive** (`ae-audio-reactive`) | [.agent/skills/ae-audio-reactive/SKILL.md](.agent/skills/ae-audio-reactive/SKILL.md) | Phân tích dạng sóng âm thanh, Audio to Keyframes, bộ lọc decay mượt, bắt nhịp beat | ~69 / ~820 |
| **MOGRT & Essential Graphics** (`ae-mogrt-essential-graphics`) | [.agent/skills/ae-mogrt-essential-graphics/SKILL.md](.agent/skills/ae-mogrt-essential-graphics/SKILL.md) | Tự động hóa Essential Graphics, phơi lộ tham số động (Text, Color, Slider, Checkbox) | ~80 / ~1040 |
| **Text Animation** (`ae-text-animation`) | [.agent/skills/ae-text-animation/SKILL.md](.agent/skills/ae-text-animation/SKILL.md) | Kinetic typography, auto RTL/Arabic, range text animators | ~61 / ~545 |
| **Character Rigging** (`ae-character-rigging`) | [.agent/skills/ae-character-rigging/SKILL.md](.agent/skills/ae-character-rigging/SKILL.md) | Controller-first rigging, limb parenting, joint anchor pivots, plugin Duik Angela nội bộ | ~75 / ~1315 |
| **Visual Feedback** (`ae-visual-feedback`) | [.agent/skills/ae-visual-feedback/SKILL.md](.agent/skills/ae-visual-feedback/SKILL.md) | Frame preview (`see-frame`), contact sheets, layout & safe area validation, sai số RMSE | ~69 / ~636 |
| **Render Pipeline** (`ae-render-pipeline`) | [.agent/skills/ae-render-pipeline/SKILL.md](.agent/skills/ae-render-pipeline/SKILL.md) | Background aerender không đơ máy, non-blocking export, render queue | ~66 / ~446 |

> **Tài liệu chuyên sâu mở rộng**:
> - [`node-procedural-breakdown.md`](.agent/skills/ae-design-scripting/node-procedural-breakdown.md): Phân rã kịch bản Motion phức tạp thành 4 tầng Node thủ tục (Source $\to$ Operator $\to$ Composite $\to$ Master Render).
> - [`mcp-ease-presets.md`](.agent/skills/ae-keyframe-easing/mcp-ease-presets.md): Bảng tra cứu 12 đường cong vận tốc Easing chuẩn (Linear, Smooth, Decelerate Strong, Expo Decelerate...).
> - [`anti-generic-motion-check.md`](.agent/skills/ae-design-scripting/anti-generic-motion-check.md): Tiêu chuẩn loại bỏ chuyển động tuyến tính thô kệch và dải gradient AI tím-hồng sáo rỗng.
> - [`motion-aesthetic-direction.md`](.agent/skills/ae-design-scripting/motion-aesthetic-direction.md): Quy trình cam kết phong cách thẩm mỹ qua 3 tính từ cốt lõi, bảng màu và cặp font.
> - [`timeline-rhythm-review.md`](.agent/skills/ae-design-scripting/timeline-rhythm-review.md): Quy chuẩn phân cấp thị giác 3 bậc và nhịp điệu timeline xuất hiện so le 3-6 frames.

---

## 🛡️ Hệ Thống Multi-Agent 3 Tầng & Quy Chuẩn Thiết Kế (.agent/rules/)

Hệ thống phân quyền và điều phối chặt chẽ giữa 3 tầng tác nhân:

| File Quy Chuẩn | Tầng tác nhân | Phạm vi trách nhiệm |
| :--- | :--- | :--- |
| [`.agent/rules/leader-ae.md`](.agent/rules/leader-ae.md) | **Leader AE** | Giám đốc Nghệ thuật & Kiến trúc sư: Áp dụng tư duy Node-Procedural phân rã Precomps, bóc tách Video Tutorial/YouTube, chỉ định Ease Presets |
| [`.agent/rules/worker-ae.md`](.agent/rules/worker-ae.md) | **Worker AE** | Kỹ thuật viên Thực thi: Áp dụng Never-Crash (try-finally Undo Group, clamp biên), mapping Ease Presets qua MCP Tool, tự sửa lỗi tối đa 3 lần |
| [`.agent/rules/design-system-spec.md`](.agent/rules/design-system-spec.md) | **Toàn hệ thống** | Thông số thiết kế chuẩn DESIGN.md: Color tokens (RGB 0-1), 32-bpc linear, Typography scale, Lưới 1/3, Safe zones, Easing 60-85% |
| [`.agent/rules/agent-collaboration-loop.md`](.agent/rules/agent-collaboration-loop.md) | **Toàn hệ thống** | Phân rã Atomic Tasks (Setup $\to$ Assembly $\to$ Motion $\to$ QA), ma trận xử lý lỗi song song (Triage L1/L2/L3), quy tắc bóc tách Tutorial & YouTube |

---

## 📊 Danh Mục 167 Tools (15 Nhóm Chức Năng)

| Nhóm chức năng | Số lượng | Phạm vi tính năng chính |
| :--- | :---: | :--- |
| **1. Motion Graphics Templates** | 6 | Lower thirds, title cards, transitions, logo reveals, text animators |
| **2. Vector Shapes & Paths** | 4 | Vẽ Bezier vector, keyframe path morphing, shape operators |
| **3. 3D Space, Camera & Lights** | 7 | 3D layers, material options, extrusion depth, camera, lights, renderers |
| **4. Masks & Rotoscoping** | 7 | Tạo, lấy dữ liệu, keyframe biến đổi, điều chỉnh và xóa mặt nạ |
| **5. Animation, Springs & Expressions** | 36 | Keyframes nâng cao, Remotion springs, thư viện expressions, timeline markers |
| **6. Composition Control** | 12 | Tạo, nhân bản, sửa, xóa, inspect comp, report thống kê |
| **7. Layer Operations** | 21 | Quản lý solid, shape, null, light, AV layer, text RTL, parenting |
| **8. Effects & Presets** | 16 | Áp dụng effect theo matchName/tên, preset .ffx, effect templates |
| **9. Project & Asset Management** | 11 | Quản lý dự án .aep, gom bin tự động, tìm missing footage, collect files |
| **10. Footage & Media** | 5 | Nhập footage đa định dạng, relink asset, proxy workflow |
| **11. Audio Analysis & Control** | 3 | Chỉnh âm lượng dB, audio info, phân tích dạng sóng WAV bắt beat |
| **12. Visual Feedback & Verification** | 3 | Xuất preview frame, contact sheet, so sánh ảnh tham chiếu |
| **13. Render Queue & Export** | 11 | Render Queue nội bộ, xuất nền không đơ máy qua `aerender`, gửi sang AME |
| **14. System & ExtendScript Engine** | 6 | Chạy ExtendScript tùy ý (`execute-script`), kiểm tra bridge health, chẩn đoán IPC |
| **15. Compatibility Aliases** | 19 | Hệ thống alias snake_case tương thích 100% các client `ae-mcp` |
| **Tổng cộng** | **167** | **Bộ công cụ tự động hóa toàn diện cho Adobe After Effects** |

---

## 🔍 Chi Tiết Từng Nhóm Tool (Bấm để mở rộng)

<details>
<summary><b>1. Motion Graphics Templates (6 tools)</b></summary>

| Tên Tool | Tác dụng & Chức năng chi tiết |
| :--- | :--- |
| `create-lower-third` | Tạo thanh tiêu đề động chuẩn TV (5 styles: modern, corporate, news, minimal, social). |
| `create-title-card` | Tạo thẻ tiêu đề nghệ thuật (cinematic, documentary, social, minimal) với background card. |
| `create-transition` | Sinh hiệu ứng chuyển cảnh đồ họa (wipe, dissolve, push, slide, zoom). |
| `create-logo-reveal` | Hoạt cảnh xuất hiện logo chuyên nghiệp (fade, scale, slide, spin, glitch, particle). |
| `create-text-animator` | Bộ chọn chữ động (typewriter, fadeIn, scaleIn, slideIn, wave, randomize). |
| `list-template-styles` | Liệt kê danh mục phong cách và thông số mặc định của các template đồ họa. |

</details>

<details>
<summary><b>2. Vector Shapes & Paths (4 tools)</b></summary>

| Tên Tool | Tác dụng & Chức năng chi tiết |
| :--- | :--- |
| `create-path` | Tạo đường cong Bezier vector với tọa độ đỉnh (vertices) và tiếp tuyến (tangents). |
| `get-path` | Truy xuất dữ liệu hình học shape path (đỉnh, tiếp tuyến và trạng thái đóng/mở). |
| `set-path-keyframes` | Đặt keyframe biến dạng (morphing) đường cong Bezier theo thời gian. |
| `add-shape-operator` | Thêm toán tử vector (trimPaths, repeater, zigzag, roundCorners, twist, wigglePaths, offsetPaths, puckerBloat). |

</details>

<details>
<summary><b>3. 3D Space, Camera & Lights (7 tools)</b></summary>

| Tên Tool | Tác dụng & Chức năng chi tiết |
| :--- | :--- |
| `set-3d-layer` | Bật hoặc tắt công tắc 3D Layer cho layer trong composition. |
| `set-material-options` | Cấu hình tùy chọn vật liệu 3D (đổ bóng, độ truyền sáng, ambient, diffuse, specular, metal, shininess). |
| `set-geometry-options` | Cấu hình độ sâu đùn khối 3D (Extrusion depth), kiểu vát viền cho Cinema 4D và Ray-traced 3D. |
| `set-camera-options` | Tinh chỉnh thông số quang học của Camera (Zoom, Depth of Field, Focus Distance, Aperture, Blur Level). |
| `set-light-options` | Điều khiển nguồn sáng (Cường độ, Màu sắc, Góc chóp cone angle, Feather, Đổ bóng và tán xạ). |
| `get-3d-info` | Kiểm tra không gian 3D của composition (camera, light và renderer đang kích hoạt). |
| `set-comp-renderer` | Chuyển đổi bộ renderer 3D của comp (`Classic 3D`, `Cinema 4D`, `Ray-traced 3D`). |

</details>

<details>
<summary><b>4. Masks & Rotoscoping (7 tools)</b></summary>

| Tên Tool | Tác dụng & Chức năng chi tiết |
| :--- | :--- |
| `add-mask` | Thêm mặt nạ vector vào layer với chế độ hòa trộn (`ADD`, `SUBTRACT`, `INTERSECT`...), feather và opacity. |
| `list-masks` | Liệt kê tất cả mặt nạ trên layer kèm mode, inverted và độ mờ đục. |
| `get-mask-path` | Lấy tọa độ các đỉnh và tiếp tuyến của mask path tại thời điểm cụ thể. |
| `set-mask-path` | Cập nhật hình dạng đường viền mặt nạ tại thời điểm chỉ định. |
| `set-mask-keyframes` | Đặt chuỗi keyframe cho viền mặt nạ phục vụ animation morphing / rotoscoping. |
| `set-mask-properties` | Điều chỉnh độ mờ đục (opacity), lông vũ (feather), độ giãn nở (expansion) hoặc đảo ngược mask. |
| `delete-mask` | Xóa bỏ một mặt nạ khỏi layer theo chỉ số hoặc tên. |

</details>

<details>
<summary><b>5. Animation, Spring Physics & Expressions (36 tools)</b></summary>

| Tên Tool | Tác dụng & Chức năng chi tiết |
| :--- | :--- |
| `setLayerKeyframe` | Đặt keyframe cơ bản cho thuộc tính layer (Position, Scale, Rotation, Opacity...). |
| `setLayerExpression` | Gán hoặc gỡ biểu thức ExtendScript trực tiếp cho thuộc tính layer. |
| `test-animation` | Chạy kịch bản kiểm thử nhanh các tính năng animation trong After Effects. |
| `animate-to-audio` | Điều khiển thuộc tính layer theo nhịp độ file âm thanh WAV (peak, envelope biên độ). |
| `animate-from-data` | Tự động tạo keyframe từ mảng dữ liệu số hoặc chuỗi thời gian/giá trị. |
| `add-marker` | Thêm timeline marker vào composition hoặc layer cụ thể. |
| `add-markers-bulk` | Thêm hàng loạt marker cùng lúc trong một bước Undo duy nhất. |
| `apply-spring-animation` | Gán biểu thức vật lý lò xo Remotion chuẩn xác (`gentle`, `default`, `wobbly`, `stiff`, `slow`, `bouncy`, `snappy`). |
| `list-spring-presets` | Xem thông số chi tiết (mass, stiffness, damping, overshoot) của các preset lò xo vật lý. |
| `calculate-spring-duration` | Tính toán chính xác thời gian dao động đến khi dừng ổn định (settling time) của cấu hình lò xo. |
| `apply-expression-template` | Gán biểu thức mẫu (`overshoot`, `bounce`, `inertia`, `springy`, `speedControl`, `wiggleSmooth`, `loopWithDelay`, `clock`...). |
| `list-expression-templates` | Liệt kê toàn bộ các template biểu thức tích hợp kèm tham số mặc định. |
| `batch-set-expressions` | Thiết lập cùng lúc nhiều biểu thức cho các thuộc tính trên layer trong một thao tác. |
| `link-properties` | Liên kết thông minh thuộc tính layer này với layer khác kèm hệ số nhân và offset. |
| `add-expression-control` | Thêm các effect điều khiển biểu thức (Slider, Angle, Color, Checkbox, Point, Layer Control). |
| `get-expression` | Đọc biểu thức hiện tại, trạng thái kích hoạt và thông báo lỗi (nếu có) trên thuộc tính. |
| `remove-expression` | Xóa bỏ biểu thức khỏi thuộc tính layer. |
| `enable-expression` | Bật hoặc tắt biểu thức trên thuộc tính mà không cần xóa nội dung mã code. |
| `set-keyframe-advanced` | Đặt keyframe với các thông số nội suy không gian và thời gian nâng cao. |
| `apply-easy-ease` | Áp dụng Easy Ease, Easy Ease In, hoặc Easy Ease Out cho các keyframe. |
| `set-temporal-ease` | Tinh chỉnh đồ thị gia tốc chính xác (tốc độ Speed và tầm ảnh hưởng Influence) cho keyframe. |
| `offset-keyframes` | Tịnh tiến dời mốc thời gian của keyframe theo số giây chỉ định (delay hoặc advance). |
| `scale-keyframe-timing` | Co giãn độ dài hoạt ảnh keyframe theo tỷ lệ nhân so với mốc thời gian neo. |
| `reverse-keyframes` | Đảo ngược toàn bộ thứ tự keyframe để hoạt cảnh phát theo chiều ngược lại. |
| `copy-keyframes` | Sao chép toàn bộ keyframe từ thuộc tính nguồn sang thuộc tính đích. |
| `get-keyframes` | Kiểm tra danh sách tất cả keyframe trên thuộc tính (thời gian, giá trị, kiểu nội suy). |
| `add-composition-marker` | Thêm marker vào timeline của composition kèm nhãn, thời lượng, chapter hoặc web URL. |
| `add-layer-marker` | Thêm marker vào timeline của layer cụ thể. |
| `get-markers` | Truy xuất toàn bộ danh sách marker từ timeline composition hoặc layer. |
| `delete-marker` | Xóa marker theo chỉ số thứ tự trên timeline. |
| `set-work-area` | Thiết lập phạm vi vùng làm việc (Work Area Start & Duration) trên timeline. |
| `get-current-time` | Lấy vị trí thời gian hiện tại và số thứ tự frame của đầu đọc playhead. |
| `set-current-time` | Di chuyển đầu đọc playhead tới mốc thời gian chỉ định. |
| `snap-to-marker` | Nhảy đầu đọc playhead khớp chính xác vào vị trí marker gần nhất. |
| `get-nearest-marker` | Tìm marker gần nhất với mốc thời gian chỉ định hoặc playhead hiện tại. |
| `navigate-markers` | Nhảy đầu đọc playhead tới marker kế tiếp (next) hoặc marker trước đó (previous). |

</details>

<details>
<summary><b>6. Composition Control (12 tools)</b></summary>

| Tên Tool | Tác dụng & Chức năng chi tiết |
| :--- | :--- |
| `create-composition` | Tạo mới composition với độ phân giải, fps, thời lượng và màu nền tùy chỉnh. |
| `set-composition-properties` | Thay đổi kích thước, tên, tỷ lệ khung hình, thời lượng, màu nền comp đang có. |
| `inspect-comp` | Kiểm tra toàn diện cây cấu trúc, thông số kỹ thuật và các layer trong composition. |
| `localize-comp` | Sao chép và tách biệt các precomp con nhằm tránh xung đột khi nhân bản template. |
| `populate-template` | Tự động thay thế văn bản, hình ảnh trong các template composition có sẵn. |
| `center-layers` | Tự động căn giữa các layer được chỉ định hoặc toàn bộ layer vào giữa khung hình comp. |
| `duplicate-composition` | Nhân bản composition trong bảng dự án Project panel. |
| `delete-composition` | Xóa composition khỏi bảng dự án. |
| `list-compositions` | Liệt kê tất cả composition với ID, tên, kích thước, fps, thời lượng và số layer. |
| `get-composition-info` | Lấy thông tin siêu dữ liệu chi tiết của composition. |
| `get-comp-report` | Tạo báo cáo thống kê chuyên sâu về comp (loại layer, layer 3D, effect, keyframe). |
| `set-active-composition` | Mở và kích hoạt composition hiển thị trên cửa sổ Composition Viewer. |

</details>

<details>
<summary><b>7. Layer Operations (21 tools)</b></summary>

| Tên Tool | Tác dụng & Chức năng chi tiết |
| :--- | :--- |
| `create-text-layer` | Tạo text layer tự động nhận diện chữ RTL / tiếng Ả Rập / đa ngôn ngữ. |
| `create-adjustment-layer` | Tạo adjustment layer để áp dụng hiệu ứng cho toàn bộ các layer bên dưới. |
| `create-camera` | Tạo camera layer (1-node hoặc 2-node) điều khiển góc nhìn không gian 3D. |
| `duplicate-layer` | Nhân bản layer hiện có trong composition. |
| `delete-layer` | Xóa layer khỏi composition theo index hoặc tên. |
| `set-layer-parent` | Thiết lập liên kết cha-con (Parenting) giữa các layer. |
| `reorder-layer` | Thay đổi thứ tự sắp xếp lớp của layer trên trục thời gian (lên trên, xuống dưới). |
| `precompose-layers` | Gom nhóm nhiều layer thành một pre-composition mới. |
| `set-layer-mask` | Tạo mặt nạ hình chữ nhật hoặc elip cơ bản cho layer. |
| `batch-set-layer-properties` | Thay đổi hàng loạt thuộc tính layer (Position, Scale, Rotation, Opacity...). |
| `inspect-layer` | Kiểm tra chi tiết thuộc tính, effect, mask và trạng thái của một layer cụ thể. |
| `get-layer-clip-frames` | Lấy thông tin frame clip của layer (In Point, Out Point, Start Time, Duration). |
| `add-solid-layer` | Thêm solid layer mới với màu sắc, kích thước và thời lượng tùy chỉnh. |
| `add-shape-layer` | Thêm shape layer trống sẵn sàng vẽ đường vector. |
| `add-null-layer` | Thêm null object layer phục vụ rigging và liên kết cha-con. |
| `add-light-layer` | Thêm nguồn sáng 3D (Point, Spot, Parallel, Ambient). |
| `add-av-layer` | Thêm footage media từ bảng Project panel vào composition dưới dạng AV layer. |
| `add-text-layer-advanced` | Thêm text layer nâng cao với phông chữ, cỡ chữ, căn lề, khoảng cách ký tự, viền stroke. |
| `list-layers` | Liệt kê toàn bộ layer trong composition kèm index, tên, phân loại và trạng thái. |
| `get-layer-info` | Truy xuất siêu dữ liệu toàn diện về thuộc tính transform và thời gian của layer. |
| `modify-layer` | Thay đổi thời điểm In/Out point, Start time, độ giãn thời gian Stretch, chế độ Blend mode. |

</details>

<details>
<summary><b>8. Effects & Presets (16 tools)</b></summary>

| Tên Tool | Tác dụng & Chức năng chi tiết |
| :--- | :--- |
| `apply-effect` | Áp dụng hiệu ứng theo tên hiển thị kèm thiết lập thuộc tính ban đầu. |
| `add-any-effect` | Thêm hiệu ứng bằng matchName hoặc display name hỗ trợ mọi plugin bên thứ 3. |
| `apply-effect-template` | Áp dụng chuỗi hiệu ứng mẫu tạo sẵn (glow, cinematicLook, vhsRetro, duotone...). |
| `remove-effect` | Xóa một hiệu ứng khỏi layer theo tên hoặc index. |
| `list-layer-effects` | Liệt kê các hiệu ứng đang có trên một layer kèm thuộc tính. |
| `list-available-effects` | Tìm kiếm và duyệt danh mục toàn bộ hiệu ứng After Effects hỗ trợ. |
| `set-effect-property` | Thay đổi giá trị của một tham số hiệu ứng cụ thể. |
| `set-effect-keyframe` | Tạo keyframe cho tham số hiệu ứng tại mốc thời gian chỉ định. |
| `list-presets` | Quét và liệt kê các tệp preset chuyển động `.ffx` có sẵn trong cài đặt After Effects. |
| `search-presets` | Tìm kiếm preset `.ffx` theo từ khóa tên hoặc danh mục. |
| `apply-preset` | Áp dụng file preset `.ffx` trực tiếp vào layer. |
| `mcp_aftereffects_get_effects_help` | Cung cấp tài liệu hướng dẫn và mẹo sử dụng hệ thống hiệu ứng AE. |
| `modify-effect-properties` | Thay đổi cùng lúc nhiều tham số của một hiệu ứng trong một lần gọi. |
| `reorder-effects` | Thay đổi vị trí thứ tự ưu tiên của hiệu ứng trong ngăn xếp effect stack. |
| `copy-effects` | Sao chép toàn bộ hoặc một số hiệu ứng chọn lọc từ layer này sang layer khác. |
| `list-effects` | Truy xuất danh sách hiệu ứng trên layer kèm tên hệ thống matchName. |

</details>

<details>
<summary><b>9. Project & Asset Management (11 tools)</b></summary>

| Tên Tool | Tác dụng & Chức năng chi tiết |
| :--- | :--- |
| `create-project` | Khởi tạo một dự án After Effects mới (.aep). |
| `open-project` | Mở tệp dự án After Effects có sẵn từ đường dẫn đĩa cứng. |
| `save-project` | Lưu dự án hiện tại (hỗ trợ Save As sang đường dẫn mới). |
| `close-project` | Đóng dự án hiện tại kèm tùy chọn lưu thay đổi. |
| `get-project-info` | Lấy thông tin tổng quan dự án (tên, đường dẫn, số lượng item, hệ màu bit depth). |
| `import-folder` | Nhập hàng loạt file media từ một thư mục máy tính vào một bin trong AE. |
| `replace-footage` | Thay thế nguồn tệp tin của một footage item bằng file mới. |
| `organize-project-items` | Tự động phân loại tài nguyên thành các thư mục Compositions, Footage, Audio, Solids. |
| `find-missing-footage` | Quét và liệt kê các tệp tin media bị mất đường dẫn (missing footage). |
| `collect-files` | Thu thập và lập danh sách tất cả các asset phụ thuộc để đóng gói lưu trữ. |
| `reduce-project` | Cắt giảm dự án, chỉ giữ lại các composition và asset đang được sử dụng. |

</details>

<details>
<summary><b>10. Footage & Media (5 tools)</b></summary>

| Tên Tool | Tác dụng & Chức năng chi tiết |
| :--- | :--- |
| `import-footage` | Nhập tệp footage đơn lẻ (video, âm thanh, ảnh, PSD, Illustrator, image sequence). |
| `list-project-items` | Liệt kê các item trong bảng Project (comp, footage, solid, folder). |
| `relink-footage` | Liên kết lại đường dẫn tệp footage khi file bị di chuyển. |
| `set-proxy` | Gán tệp proxy nhẹ cho footage giúp tăng tốc độ dựng hình xem trước. |
| `remove-proxy` | Gỡ bỏ tệp proxy khỏi footage để quay lại dùng file gốc chất lượng cao. |

</details>

<details>
<summary><b>11. Audio Analysis & Control (3 tools)</b></summary>

| Tên Tool | Tác dụng & Chức năng chi tiết |
| :--- | :--- |
| `set-audio-levels` | Điều chỉnh âm lượng (dB) của layer âm thanh tại thời điểm cụ thể hoặc toàn bộ clip. |
| `get-audio-info` | Kiểm tra thông tin kênh âm thanh, tần số mẫu và mức âm lượng của layer. |
| `analyze-audio-waveform` | Phân tích dạng sóng âm thanh WAV, phát hiện cao trào (peak) và nhịp beat để làm animation giật theo nhạc. |

</details>

<details>
<summary><b>12. Visual Feedback & Verification (3 tools)</b></summary>

| Tên Tool | Tác dụng & Chức năng chi tiết |
| :--- | :--- |
| `see-frame` | Render và xuất ảnh tĩnh xem trước tại một frame để AI tự kiểm tra và sửa lỗi trực quan. |
| `contact-sheet` | Tạo bảng lưới tổng hợp nhiều khung hình xem trước dọc theo tiến trình comp. |
| `match-reference` | So sánh khung hình render thực tế với ảnh mẫu tham chiếu để đánh giá độ chính xác. |

</details>

<details>
<summary><b>13. Render Queue & Export (11 tools)</b></summary>

| Tên Tool | Tác dụng & Chức năng chi tiết |
| :--- | :--- |
| `add-to-render-queue` | Đưa composition vào danh sách hàng đợi kết xuất nội bộ của AE. |
| `render-queue` | Kiểm tra hoặc quản lý hàng đợi render: duyệt danh sách, xóa toàn bộ hoặc xóa từng item. |
| `start-render` | Bắt đầu quá trình xuất render cho tất cả item đang queued trong Render Queue. |
| `render-aerender` | Chạy render ngầm nền bằng tiến trình độc lập `aerender.exe` không làm treo giao diện After Effects. |
| `render-status` | Theo dõi tiến độ xuất tệp và kiểm tra log render nền của `aerender`. |
| `list-render-queue` | Liệt kê các item trong Render Queue kèm trạng thái và đường dẫn file xuất. |
| `list-render-templates` | Liệt kê các template Render Settings và Output Module có sẵn trong AE. |
| `set-render-queue-item` | Cấu hình đường dẫn xuất và mẫu template cho một item trong hàng đợi. |
| `remove-from-render-queue` | Xóa một item khỏi hàng đợi theo chỉ số index. |
| `control-render` | Điều khiển quá trình render nội bộ (`start`, `pause`, `resume`, `stop`). |
| `queue-in-ame` | Gửi composition sang Adobe Media Encoder để thực hiện render nền. |

</details>

<details>
<summary><b>14. System & ExtendScript Engine (6 tools)</b></summary>

| Tên Tool | Tác dụng & Chức năng chi tiết |
| :--- | :--- |
| `run-script` | Thực thi lệnh script định sẵn trong After Effects kèm tham số. |
| `get-results` | Đọc kết quả trả về từ lệnh script vừa thực thi gần nhất. |
| `get-help` | Hiển thị trợ giúp và tổng quan về khả năng của After Effects MCP Server. |
| `check-bridge` | Kiểm tra sức khỏe kết nối IPC tới After Effects và trạng thái background listener. |
| `run-bridge-test` | Chạy bài kiểm tra chẩn đoán toàn diện cầu nối giao tiếp After Effects. |
| `execute-script` | Chạy trực tiếp mã nguồn ExtendScript tùy ý bên trong After Effects và nhận kết quả JSON. |

</details>

<details>
<summary><b>15. Compatibility Aliases (19 tools)</b></summary>

| Tên Alias | Tool gốc tương ứng | Mục đích |
| :--- | :--- | :--- |
| `ae_ping` | `check-bridge` | Kiểm tra kết nối nhanh |
| `ae_create_comp` | `create-composition` | Tạo comp theo cú pháp rút gọn |
| `ae_add_text` | `create-text-layer` | Thêm text nhanh |
| `create_project` | `create-project` | Tương thích client `ae-mcp` snake_case |
| `open_project` | `open-project` | Tương thích client `ae-mcp` snake_case |
| `save_project` | `save-project` | Tương thích client `ae-mcp` snake_case |
| `get_project_info` | `get-project-info` | Tương thích client `ae-mcp` snake_case |
| `create_lower_third` | `create-lower-third` | Tương thích client `ae-mcp` snake_case |
| `create_title_card` | `create-title-card` | Tương thích client `ae-mcp` snake_case |
| `create_transition` | `create-transition` | Tương thích client `ae-mcp` snake_case |
| `create_logo_reveal` | `create-logo-reveal` | Tương thích client `ae-mcp` snake_case |
| `create_text_animator` | `create-text-animator` | Tương thích client `ae-mcp` snake_case |
| `apply_expression_template` | `apply-expression-template` | Tương thích client `ae-mcp` snake_case |
| `create_path` | `create-path` | Tương thích client `ae-mcp` snake_case |
| `get_path` | `get-path` | Tương thích client `ae-mcp` snake_case |
| `set_3d_layer` | `set-3d-layer` | Tương thích client `ae-mcp` snake_case |
| `add_mask` | `add-mask` | Tương thích client `ae-mcp` snake_case |
| `list_masks` | `list-masks` | Tương thích client `ae-mcp` snake_case |
| `list_render_queue` | `list-render-queue` | Tương thích client `ae-mcp` snake_case |

</details>
