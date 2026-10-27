# Adobe After Effects MCP Server

A high-performance, modular Model Context Protocol (MCP) Server for Adobe After Effects built with TypeScript. Enables AI assistants (Claude, Cursor, Antigravity) to automate After Effects directly via a suite of **167 tools** with background ExtendScript CLI execution.

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
| **14. System & ExtendScript Engine** | 6 | Chạy ExtendScript tùy ý (`execute-script`), kiểm tra cầu nối, chẩn đoán IPC |
| **15. Compatibility Aliases** | 19 | Hệ thống alias snake_case tương thích 100% các client `ae-mcp` |

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
