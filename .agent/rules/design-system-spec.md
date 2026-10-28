---
description: "Quy chuẩn thông số thiết kế hệ thống (Design Tokens & Visual Specifications) cho After Effects"
globs: "*"
alwaysApply: true
---

# After Effects Motion Design System Specification

Tài liệu quy chuẩn các thông số thiết kế (Design Tokens), tỉ lệ thị giác và quy tắc bố cục chuyển động trong After Effects. Được trích xuất và chuẩn hóa từ chuẩn **DESIGN.md** để **Leader AE** áp đặt và **Worker AE** thực thi chính xác.

---

## 1. Hệ Thống Màu Sắc & Không Gian Bit (Color & Depth Tokens)

Mọi màu sắc sử dụng trong After Effects phải tuân theo hệ thống phân cấp Palette và được quy đổi chính xác giữa mã Hex và mảng RGB chuẩn hóa `[r, g, b]` (giá trị từ `0.0` đến `1.0` dùng trong ExtendScript).

### 1.1. Bảng Vai Trò Màu Sắc (Semantic Palette Roles)

| Token Key | Vai trò thị giác trong AE | Ví dụ Hex | AE Scripting RGB `[r, g, b]` |
| :--- | :--- | :--- | :--- |
| `colors.primary` | Màu nhận diện chủ đạo, tiêu đề chính, icon trọng tâm | `#1A1C1E` | `[0.102, 0.110, 0.118]` |
| `colors.secondary` | Phần tử bổ trợ, subtitle, viền shape, thanh bar | `#6C7278` | `[0.424, 0.447, 0.471]` |
| `colors.accent` | Điểm nhấn thị giác (Focal Point), CTA, highlight kinetic | `#B8422E` | `[0.722, 0.259, 0.180]` |
| `colors.surface` | Khối nền thẻ (Card container), Lower Third box | `#FFFFFF` | `[1.000, 1.000, 1.000]` |
| `colors.background` | Màu nền Solid của Composition | `#F7F5F2` | `[0.969, 0.961, 0.949]` |
| `colors.text-muted` | Chú thích phụ, metadata, timestamp | `#8E959E` | `[0.557, 0.584, 0.620]` |

### 1.2. Quy Tắc Tông Màu Sắc & Độ Sâu Bit (Depth & Guardrails)
- **Không dùng màu thô tuyệt đối**: Tránh sử dụng nền `#000000` hoặc `#FFFFFF` tinh khiết gắt mắt. Luôn dùng tông đen mềm (`#141416`, `#1A1A1A`) và tông trắng ấm/dịu (`#F7F5F2`, `#FAFAFA`).
- **Tương phản WCAG AA**: Đảm bảo độ tương phản giữa chữ và nền luôn đạt tối thiểu $4.5:1$.
- **Độ sâu Bit Depth**: Mặc định chạy ở chế độ **16-bpc** hoặc **32-bpc Float** (`linearBlending = true`) khi có hiệu ứng phát sáng quang học (Optical Glow) hoặc chuyển sắc mượt mà (chống dải sọc Color Banding).

---

## 2. Hệ Thống Typography (Typography Tokens)

Áp dụng cho các Layer Text tạo bằng `create-text-layer` hoặc `add-text-layer-advanced`.

### 2.1. Phân Tầng Kích Thước Chữ (Typography Scale) - Chuẩn Comp 1920x1080

| Token Level | Áp dụng cho | Font Size (px) | Leading / Line Height | Tracking (1/1000 em) | Font Weight |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `type.display-hero` | Tiêu đề mở màn bùng nổ (0-1.5s) | `72px - 96px` | `1.1` ($79 - 105px$) | `-20` đến `0` | Bold / Black (700-900) |
| `type.headline-title` | Tiêu đề cảnh, Title card | `48px - 60px` | `1.15` ($55 - 69px$) | `-10` đến `10` | SemiBold (600) |
| `type.subheading` | Phụ đề Lower Third, đề mục | `32px - 36px` | `1.25` ($40 - 45px$) | `0` đến `20` | Medium (500) |
| `type.body-main` | Nội dung thuyết minh, diễn giải | `22px - 26px` | `1.4` ($31 - 36px$) | `10` đến `30` | Regular (400) |
| `type.caption-label` | Tag, nhãn kỹ thuật, bản quyền | `14px - 18px` | `1.0` ($14 - 18px$) | `50` đến `100` | Medium / Mono (500) |

### 2.2. Quy Chuẩn Điểm Neo Cho Text
- **Căn giữa (Center-aligned)**: Anchor Point tại `[sourceRectAtTime().width / 2, sourceRectAtTime().top + sourceRectAtTime().height / 2]`.
- **Căn trái (Left-aligned - Lower Thirds / Body)**: Anchor Point tại `[0, sourceRectAtTime().top + sourceRectAtTime().height / 2]`.

---

## 3. Không Gian, Lưới Tọa Độ & Vùng An Toàn (Spatial Grid & Safe Zones)

Mọi bố cục phải tuân thủ chuẩn an toàn truyền hình và tỷ lệ lưới (Grid System).

```
┌────────────────────────────────────────────────────────┐
│ Outer Border (1920 x 1080)                            │
│   ┌────────────────────────────────────────────────┐   │
│   │ Action Safe Zone (90% - Margin 96px, 54px)     │   │
│   │   ┌────────────────────────────────────────┐   │   │
│   │   │ Title Safe Zone (80% - Margin 192px)   │   │   │
│   │   │     Tọa độ lưới 1/3:                   │   │   │
│   │   │     - Trục dọc: x = 640px, 1280px      │   │   │
│   │   │     - Trục ngang: y = 360px, 720px     │   │   │
│   │   └────────────────────────────────────────┘   │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

- **Title Safe (80%)**: Toàn bộ Text, Logo, Icon và nội dung truyền tải bắt buộc phải nằm gọn bên trong vùng Title Safe (`x: 192px` đến `1728px`, `y: 108px` đến `972px` trên comp 1080p).
- **Tọa Độ Điểm Vàng 1/3 (Rule of Thirds)**: Điểm giao nhau của các đường 1/3 nằm tại `(640, 360)`, `(1280, 360)`, `(640, 720)`, `(1280, 720)`. Đặt Focal Point tại các điểm này để tạo bố cục điện ảnh cân đối.
- **Thang Bước Nhảy Khoảng Cách (Spacing Increments)**:
  - `space.xs`: `4px` | `space.sm`: `8px` | `space.md`: `16px` | `space.lg`: `24px` | `space.xl`: `32px` | `space.2xl`: `48px` | `space.3xl`: `64px`.

---

## 4. Thời Lượng & Đồ Thị Gia Tốc (Motion Tokens & Easing)

### 4.1. Phân Tầng Thời Lượng (Duration Tokens)

| Token Key | Thời lượng (s / frames @ 30fps) | Ứng dụng |
| :--- | :--- | :--- |
| `motion.duration-micro` | `0.15s - 0.25s` (5 - 8 frames) | Micro-interactions, hover, button pop, dấu tích |
| `motion.duration-snap` | `0.35s - 0.5s` (10 - 15 frames) | Xuất hiện tiêu đề, Lower Third pop-in, icon entrance |
| `motion.duration-transition` | `0.6s - 0.9s` (18 - 27 frames) | Chuyển cảnh camera, trượt toàn khung, wipe màn hình |
| `motion.duration-hold` | `1.5s - 2.5s` (45 - 75 frames) | Thời gian dừng màn hình để mắt người kịp đọc nội dung |

### 4.2. Ánh Xạ Đường Cong Easing Presets Chuẩn Hóa
Áp dụng trực tiếp 12 đồ thị vận tốc từ [`.agent/skills/ae-keyframe-easing/mcp-ease-presets.md`](../skills/ae-keyframe-easing/mcp-ease-presets.md):
- **Vào cảnh bùng nổ (Pop-in Entrance)**: `Decelerate Strong` (In Inf: 80%, In Speed: 0 | Out Inf: 15%, Out Speed: 2.5) hoặc `Expo Decelerate`.
- **Thoát cảnh (Exit Transition)**: `Accelerate Strong` (Out Inf: 80%, Out Speed: 0 | In Inf: 15%, In Speed: 2.5) hoặc `Expo Accelerate`.
- **UI & Chuyển động thẻ**: `Ease In-Out Strong` (In Inf: 75%, Out Inf: 75%).

---

## 5. Quy Chuẩn Hình Học Vector (Shape Tokens & Winding)

| Token Key | Thông số | Mô tả sử dụng |
| :--- | :--- | :--- |
| `shape.radius-none` | `0px` | Hình khối góc vuông, phong cách kỹ thuật / brutalism |
| `shape.radius-sm` | `4px - 6px` | Thẻ dữ liệu nhỏ, nhãn tag |
| `shape.radius-md` | `10px - 14px` | Khung Lower Third chuẩn, hộp thoại chính |
| `shape.radius-lg` | `20px - 28px` | Nút bấm lớn, banner bo góc hiện đại |
| `shape.radius-pill` | `999px` | Nút viên thuốc (Capsule button), badge tròn |
| `shape.winding-rule`| **Even-Odd** hoặc **Non-Zero** | Quy tắc xác định vùng đục rỗng khi kết hợp nhiều đường cong Bezier |

---

## 6. Do's & Don'ts (Quy Tắc Sống Còn)

### DO:
- Luôn đặt Anchor Point trước khi tạo keyframe Scale hoặc Rotation.
- Luôn kiểm tra Text nằm trọn vẹn trong **Title Safe Zone (80%)**.
- Luôn giữ tỷ lệ tương phản cao giữa Text và Background ($\ge 4.5:1$).
- Luôn sử dụng Easing Presets chuẩn hóa (Influence $\ge 60\%$).

### DON'T:
- Không bao giờ đặt keyframe Linear thô kệch cho chuyển động chính.
- Không lạm dụng hiệu ứng rung lắc ngẫu nhiên (`wiggle`) nếu không có lý do kịch bản.
- Không sử dụng màu tím-hồng chuyển sắc sặc sỡ kiểu template AI lỗi thời.
- Không để thời gian đọc chữ (Hold time) dưới $1.5$ giây.
