# Node-Procedural Breakdown: Phân Rã Kịch Bản Dựa Trên Mạng Lưới Node-Graph

Tài liệu quy chuẩn tư duy thiết kế đồ họa chuyển động theo mô hình **Động cơ Quy trình Thủ tục (Procedural Node-Graph Network)** dành cho **Leader AE**. 

Phương pháp này xóa bỏ hoàn toàn thói quen tạo một Composition "nguyên khối" (Monolithic Comp) chứa 30-50 layers hỗn loạn. Thay vào đó, toàn bộ dự án After Effects được quy hoạch như một **Đồ thị Hướng không Chu trình (DAG - Directed Acyclic Graph)**, trong đó mỗi Pre-composition đóng vai trò là một Node chức năng độc lập, có thể tái sử dụng và chỉnh sửa phi phá hủy (Non-Destructive).

---

## 1. Kiến Trúc 4 Cấp Độ Node (Node Taxonomy)

```
┌────────────────────────────────────────────────────────────────────────┐
│ [CẤP 1: SOURCE NODES]                                                  │
│   ├── Node_BG_Procedural (Canvas, grid, hạt particle, dải màu)        │
│   ├── Node_Text_Source   (Chữ tiêu đề, typography, icon vector)        │
│   └── Node_Asset_Footage (Ảnh, video raw, logo vector)                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Dữ liệu hình ảnh / Wires)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ [CẤP 2: OPERATOR / MODIFIER NODES]                                     │
│   ├── Node_Mask_Matte    (Alpha/Luma Track Matte, shape che mặt nạ)    │
│   └── Node_Stylize_FX    (Displacement map, blur, viền glow)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Hình ảnh đã xử lý biến đổi)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ [CẤP 3: COMPOSITE NODES]                                               │
│   └── Node_Scene_Assembly (Ghép BG + Chủ thể + Đổ bóng + Parenting)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Cảnh quay hoàn chỉnh)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ [CẤP 4: TERMINAL / MASTER OUTPUT NODE]                                 │
│   └── Comp_Master_Render  (Camera chuyển động, Audio, Render Queue)     │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1. Source Nodes (Node Khởi Tạo / Dữ Liệu Gốc)
- **Đặc điểm**: Chỉ chứa các phần tử hình học, văn bản thuần túy hoặc solid nền. Không chứa hoạt cảnh camera hay hiệu ứng phức tạp.
- **Quy tắc**: Kích thước comp bằng đúng kích thước phần tử (hoặc chuẩn 1920x1080), Anchor Point đặt ngay tại tâm hình học `[w/2, h/2]`.
- **Lợi ích**: Khi cần đổi nội dung chữ hoặc màu sắc thương hiệu, chỉ cần sửa tại Source Node này, toàn bộ các cảnh sau sẽ tự động cập nhật mà không làm lệch keyframe.

### 1.2. Operator Nodes (Node Xử Lý / Hiệu Ứng)
- **Đặc điểm**: Đóng vai trò là bộ lọc toán học (Matte, Distortion, Color Grading).
- **Quy tắc**: Thường chứa các Shape Layer chuyển động dùng làm Track Matte (Alpha Inverted / Luma Matte) để tạo hiệu ứng chữ chui ra từ vạch kẻ, hoặc Adjustment Layer chứa hiệu ứng ánh sáng.

### 1.3. Composite Nodes (Node Lắp Ráp Phân Cảnh)
- **Đặc điểm**: Nơi kết hợp các Source Nodes và Operator Nodes thành một phân cảnh hoàn chỉnh (Shot/Scene).
- **Quy tắc**: Tại đây mới thực hiện hoạt cảnh ra/vào (Entrance / Exit) và đặt các mốc Easing Presets từ `mcp-ease-presets.md`.

### 1.4. Terminal / Master Node (Node Xuất Bản Cuối Cùng)
- **Đặc điểm**: Composition tổng (`Main_Comp` hoặc `Render_Master`), chứa toàn bộ các Composite Nodes được xếp theo thứ tự timeline.
- **Quy tắc**: Điều khiển âm thanh (Audio waveform), chuyển cảnh giữa các Scene (Transitions) và xuất lệnh render ra Render Queue hoặc `render-aerender`.

---

## 2. Cơ Chế Kết Nối Giữa Các Node (Procedural Wiring)

Thay vì liên kết thủ công rời rạc, các Node giao tiếp với nhau thông qua 3 loại liên kết (Wires):

1. **Wire Lồng Ghép (Nesting Wire)**:
   - Đưa Node con vào làm một Layer bên trong Node cha thông qua `precompose-layers` hoặc thêm AV Layer vào Comp.
2. **Wire Biểu Thức Điều Khiển Toàn Cục (Expression Control Wire)**:
   - Tạo một Null Layer hoặc Comp riêng đặt tên là `Control_Node`.
   - Trên `Control_Node`, thêm các Expression Controls (Slider Control, Color Control, Checkbox Control).
   - Các layer trong các Node khác tham chiếu về tham số này bằng biểu thức:
     ```javascript
     comp("Control_Node").layer("Global_Theme").effect("Primary_Color")("Color")
     ```
3. **Wire Dẫn Hướng Thứ Bậc (Hierarchy Parenting Wire)**:
   - Sử dụng quan hệ cha-con (Parenting) liên kết từ các phần tử chi tiết về một Null Controller trung tâm để thực hiện chuyển động tổng thể.

---

## 3. Quy Tắc Bóc Tách Kịch Bản Cho Leader AE (Decomposition Heuristics)

Khi tiếp nhận một kịch bản từ Gemini, Leader AE áp dụng 3 quy tắc phân rã bắt buộc:

1. **Quy tắc $\ge 3$ Layers**: Bất kỳ cụm đồ họa nào (ví dụ: Logo reveal gồm biểu tượng + chữ + slogan) có từ 3 layer trở lên **bắt buộc phải gom thành một Source Node Precomp** độc lập (`Node_Logo_Unit`).
2. **Quy tắc Chuyển Động Nền (Background Isolation)**: Mọi hiệu ứng nền (gradient lượn sóng, lưới tọa độ, hạt particle) phải được cô lập trong `Node_Background` để Worker AE tối ưu bộ nhớ đệm (Cache) của After Effects.
3. **Quy tắc Độc Lập Biến Đổi (Transform Independence)**: Không bao giờ đặt keyframe Scale/Rotation cho Layer Text ngay trong comp chính nếu chữ đó còn cần hiệu ứng Text Animator bên trong. Tách biệt: Biến đổi nội dung bên trong Source Node, biến đổi không gian bên ngoài Composite Node.

---

## 4. Mẫu Bản Vẽ Kế Hoạch Node-Graph (Node Blueprint Sample)

Leader AE mô tả mạng lưới Node trong Blueprint như sau:

```markdown
### [PROCEDURAL NODE GRAPH] Cấu Trúc Dự Án: <Project_Name>

1. **Mạng Lưới Node (DAG Flow)**:
   - `Node_BG` (Solid + Gradient Ramp) ──┐
   - `Node_Text_Title` (Source Title)   ──┼──► `Node_Scene_01` ──► `Master_Render`
   - `Node_Matte_Box` (Shape Box Matte) ┘

2. **Quy Định Tham Số Node**:
   - `Node_Text_Title`: Width: 1920, Height: 300, Duration: 5.0s
     - Layer 1: Text "NEXT-GEN AUTOMATION" (Font: Space Grotesk, Size: 72px)
   - `Node_Matte_Box`:
     - Layer 1: Shape Rect (Alpha Matte che cho Text) | Ease: `Expo Decelerate`
   - `Node_Scene_01`:
     - Layer 1: `Node_Text_Title` (Track Matte: Alpha Matte từ `Node_Matte_Box`)
     - Layer 2: `Node_Matte_Box`
     - Layer 3: `Node_BG`
```
