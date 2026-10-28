---
name: ae-shape-operators
description: "Procedural vector shape operators, repeaters, trim paths, path booleans, and shape generators in After Effects. Use when creating complex procedural shapes, radial bursts, grid arrays, stroke animations, or path morphing."
---

# Vector Shape Operators & Procedural Generators

Quy chuẩn kỹ thuật áp dụng các toán tử hình học vector (Shape Operators) và thuật toán tạo hình thủ tục trong After Effects.

---

## 1. Danh Mục Toán Tử Hình Học (Shape Operator MatchNames)

| Toán tử | MatchName trong AE | Tham số điều khiển cốt lõi |
| :--- | :--- | :--- |
| **Repeater** | `ADBE Vector Filter - Repeater` | `Copies`, `Offset`, `Transform` (Position, Scale, Rotation, Opacity) |
| **Trim Paths** | `ADBE Vector Filter - Trim` | `Start` (0-100%), `End` (0-100%), `Offset` (độ xoay), `Trim Multiple Shapes` |
| **Merge Paths** | `ADBE Vector Filter - Merge` | `Mode` (1: Add, 2: Subtract, 3: Intersect, 4: Exclude) |
| **Round Corners** | `ADBE Vector Filter - Round` | `Radius` (px bo góc đỉnh Bezier) |
| **Wiggle Paths** | `ADBE Vector Filter - Roughen` | `Size`, `Detail`, `Points` (Corner/Smooth), `Wiggles/Second` |
| **ZigZag** | `ADBE Vector Filter - Zigzag` | `Size`, `Ridges per segment`, `Points` (Corner/Smooth) |
| **Pucker & Bloat** | `ADBE Vector Filter - PB` | `Amount` (-100% Pucker nhọn / +100% Bloat phồng) |

---

## 2. Công Thức Toán Học Thủ Tục (Procedural Math)

### 2.1. Phân Bổ Mảng Tròn (Radial Array / Burst Repeater)
Để tạo vòng tròn $N$ đối tượng tỏa đều quanh tâm:
- Thêm Shape (VD: tia sáng hoặc chấm tròn) tại tọa độ `[0, -R]` (với $R$ là bán kính).
- Thêm **Repeater**:
  $$\text{Copies} = N, \quad \text{Repeater Transform Position} = [0, 0], \quad \text{Repeater Transform Rotation} = \frac{360^\circ}{N}$$

### 2.2. Mảng Lưới Ma Trận 2D (Grid Array)
Xếp 2 bộ Repeater lồng nhau:
- **Repeater 1 (Trục X)**: $\text{Copies} = C_x$, $\text{Position} = [D_x, 0]$, $\text{Rotation} = 0$.
- **Repeater 2 (Trục Y)**: $\text{Copies} = C_y$, $\text{Position} = [0, D_y]$, $\text{Rotation} = 0$.

### 2.3. Quy Tắc Đảo Chiều & Vùng Đóng Đường Cong (Winding Rules)
- **Non-Zero (Mặc định)**: Hướng tiếp tuyến quyết định phần rỗng hay đặc (cùng chiều kim đồng hồ = cộng dồn fill).
- **Even-Odd**: Giao nhau tự động khoét rỗng (thích hợp cho chữ có lỗ như "O", "B", "P" hoặc đồ họa lồng ghép).

---

## 3. Quy Trình Thực Thi Từng Bước (Step-by-Step)

1. **Khởi tạo Shape Layer**: Dùng `add-shape-layer` hoặc `create-composition`.
2. **Thêm Đường Cong Gốc**: Dùng `create-path` tạo đường Bezier chuẩn (`vertices`, `inTangents`, `outTangents`, `closed`).
3. **Chèn Toán Tử**: Gọi `add-shape-operator` truyền `operatorType` ("Repeater", "Trim Paths", v.v.).
4. **Gán Keyframe Hoạt Cảnh**:
   - Trim Paths: Start $0\% \to 100\%$ hoặc End $0\% \to 100\%$ với Easing `Expo Decelerate`.
   - Repeater Offset: Tạo hiệu ứng sóng gợn hoặc pháo hoa bung tỏa.

---

## 4. Mẫu Lệnh MCP Chuẩn Xác (Gold Standards)

### Thêm Trim Paths cho Viền Nét Stroke
```json
{
  "tool": "add-shape-operator",
  "arguments": {
    "compName": "Main Comp",
    "layerIndex": 1,
    "operatorType": "Trim Paths",
    "properties": {
      "Start": 0,
      "End": 100,
      "Offset": 45
    }
  }
}
```

### Script Tạo Radial Burst Hoàn Chỉnh Qua `execute-script`
```javascript
app.beginUndoGroup("Create_Radial_Burst");
try {
    var comp = app.project.activeItem;
    var shapeLayer = comp.layers.addShape();
    shapeLayer.name = "Radial_Burst";
    var contents = shapeLayer.property("Contents");
    
    // Group 1: Đường tia
    var group = contents.addProperty("ADBE Vector Group");
    var grpContents = group.property("Contents");
    var pathProp = grpContents.addProperty("ADBE Vector Shape - Group");
    var shape = new Shape();
    shape.vertices = [[0, -80], [0, -140]];
    shape.closed = false;
    pathProp.property("Path").setValue(shape);
    
    var stroke = grpContents.addProperty("ADBE Vector Graphic - Stroke");
    stroke.property("Color").setValue([0.22, 0.74, 0.97, 1]);
    stroke.property("Stroke Width").setValue(4);
    
    // Toán tử Repeater
    var repeater = contents.addProperty("ADBE Vector Filter - Repeater");
    repeater.property("Copies").setValue(8);
    var repXform = repeater.property("Transform");
    repXform.property("Position").setValue([0, 0]);
    repXform.property("Rotation").setValue(360 / 8);
} finally {
    app.endUndoGroup();
}
```

---

## 5. Quy Chuẩn Bắt Buộc: Shape Morphing Cho Chữ Cái (Typography Shape Morphing Protocol)

> **QUY TẮC BẤT BIẾN**:
> Khi tạo Shape Morphing cho chữ cái, **BẮT BUỘC** phải định nghĩa rõ mảng **Vertices**, **inTangents**, và **outTangents** của thuộc tính `Path` (`ADBE Vector Shape - Group`) cho từng mốc trạng thái, thay vì chỉ dùng lệnh scale/position thông thường.

### 5.1. Các Tiêu Chuẩn Thực Thi
1. **Bảo toàn số lượng điểm neo (Vertex Count Consistency)**: Số đỉnh ($N$ vertices) giữa Keyframe bắt đầu (khối hình học nguyên bản) và Keyframe kết thúc (đường viền ký tự hoàn chỉnh) phải bằng nhau để thuật toán nội suy Bezier của After Effects diễn ra mượt mà, không bị giật hay xoắn topo.
2. **Trạng thái khởi đầu (Primitive Polygon State)**: Các đỉnh phụ của ký tự phức tạp (ví dụ nét ngang của F, vòm của n, nét chéo của t) được thu gọn hoặc xếp thẳng hàng trên cạnh của khối đa giác nguyên bản (Rectangle/Square/Diamond).
3. **Trạng thái biến hình (Morphing Transition State)**: Từng đỉnh di chuyển theo vector vận tốc xác định, đồng thời tiếp tuyến `inTangents` và `outTangents` mở rộng độ cong Bezier để tạo độ mượt mà tự nhiên.
4. **Trạng thái hoàn thiện (Final Glyph State)**: Khớp 100% với đường bao của font chữ tham chiếu (Guide Text).

### 5.2. Mẫu Mã ExtendScript Chuẩn (Vector Path Vertices Morphing)
```javascript
// Ví dụ: Morphing ký tự 'F' bằng 10 điểm đỉnh đồng nhất (Identical Vertex Count)
var shape1 = new Shape(); // Khối chữ nhật nguyên bản
shape1.vertices = [[-80, 116], [-80, -116], [-24, -116], [-24, -116], [-24, -64], [-24, -64], [-24, -20], [-24, -20], [-24, 26], [-24, 116]];
shape1.inTangents = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
shape1.outTangents = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
shape1.closed = true;

var shape2 = new Shape(); // Chữ F hoàn chỉnh sau khi vươn các tay ngang
shape2.vertices = [[-80, 116], [-80, -116], [68, -116], [68, -64], [-24, -64], [-24, -20], [40, -20], [40, 26], [-24, 26], [-24, 116]];
shape2.inTangents = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
shape2.outTangents = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
shape2.closed = true;

var pathProp = group.property("Contents").property("Path_F").property("Path");
pathProp.setValueAtTime(0.0, shape1);
pathProp.setValueAtTime(0.75, shape2);
```

