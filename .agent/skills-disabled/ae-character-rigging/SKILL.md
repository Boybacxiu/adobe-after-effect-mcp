---
name: ae-character-rigging
description: "Character rigging, limb hierarchy, parenting, null controller rigging, and puppet structures in After Effects (compatible with Duik Angela workflows). Use when creating character rigs, parent-child hierarchies, or puppet controller nulls."
---

# After Effects Character Rigging & Duik Angela Integration

Dành riêng cho **Gemini Agent** tự động hóa quy trình rigging nhân vật trong After Effects bằng công cụ nội bộ và plugin **Duik Angela** tích hợp sẵn tại `plugins/Duik-Angela/`.

---

## 1. Quy Chuẩn Đặt Tên Layer (Anatomical Hierarchy Standards)

Tuân thủ nghiêm ngặt quy ước đặt tên để tính năng Auto-Parent của Duik và ExtendScript nhận diện chính xác $100\%$:

| Bộ phận | Tên Layer (Artwork/Bones) | Tên Controller Null | Điểm Pivot (Anchor Point) |
| :--- | :--- | :--- | :--- |
| **Gốc / Tổng thể** | — | `CTRL_Root` | Giữa 2 chân tiếp đất |
| **Hông / Chậu** | `Hips` (hoặc `Pelvis`) | `CTRL_Hips` | Trọng tâm xương chậu |
| **Cột sống / Ngực** | `Spine` $\to$ `Chest` | `CTRL_Chest` | Đốt sống lưng dưới |
| **Cổ / Đầu** | `Neck` $\to$ `Head` | `CTRL_Head` | Khớp cổ / chân đầu |
| **Tay Phải (R)** | `Arm_R` $\to$ `Forearm_R` $\to$ `Hand_R` | `CTRL_Hand_R` | Khớp vai / Khuỷu / Cổ tay |
| **Tay Trái (L)** | `Arm_L` $\to$ `Forearm_L` $\to$ `Hand_L` | `CTRL_Hand_L` | Khớp vai / Khuỷu / Cổ tay |
| **Chân Phải (R)** | `Thigh_R` $\to$ `Calf_R` $\to$ `Foot_R` $\to$ `Toes_R` | `CTRL_Foot_R` | Khớp háng / Đầu gối / Mắt cá |
| **Chân Trái (L)** | `Thigh_L` $\to$ `Calf_L` $\to$ `Foot_L` $\to$ `Toes_L` | `CTRL_Foot_L` | Khớp háng / Đầu gối / Mắt cá |

> **Quy tắc bất biến**: Căn Anchor Point của từng layer vào chính xác khớp xoay (Joint Pivot) trước khi tạo xương hoặc liên kết cha-con.

---

## 2. Gọi Script Duik Angela Bằng Đường Dẫn Tương Đối

Plugin Duik Angela được tích hợp trực tiếp tại `plugins/Duik-Angela/`. MCP Bridge đã nạp sẵn 2 hàm tiện ích toàn cục trong ExtendScript:
- `duikFile(relPath)`: Trả về đối tượng `File` của Duik từ đường dẫn tương đối.
- `evalDuik(relPath)`: Thực thi trực tiếp tệp script `.jsx` của Duik.

### Các script cốt lõi có sẵn:
1. `evalDuik("Scripts/Duik_addNull.jsx")`: Tạo Null Controller tại vị trí các layer đang chọn.
2. `evalDuik("Scripts/Duik_autoParent.jsx")`: Tự động phân cấp liên kết cha-con theo chuẩn tên giải phẫu học.
3. `evalDuik("Scripts/ScriptUI Panels/Duik Bones.jsx")`: Nạp mô-đun tạo Bone / Pin xương.
4. `evalDuik("Scripts/ScriptUI Panels/Duik Rigging.jsx")`: Nạp toàn bộ thư viện Rigging chuyên sâu.
5. `evalDuik("Scripts/ScriptUI Panels/Duik Constraints.jsx")`: Nạp thuật toán IK (Inverse Kinematics) & FK.

---

## 3. Gold Standard Workflows (Mẫu ExtendScript Chuẩn Xác)

### Workflow 1: Tạo Null Controller Bằng Duik Script (Tương đối)
Gemini Agent gọi qua tool `execute-script`:
```json
{
  "tool": "execute-script",
  "arguments": {
    "script": "var comp = app.project.activeItem; if (!comp) return 'No active comp'; evalDuik('Scripts/Duik_addNull.jsx'); return 'Duik Null Created Successfully';"
  }
}
```

### Workflow 2: Tự Động Phân Cấp Cha-Con Với Duik Auto-Parent
```json
{
  "tool": "execute-script",
  "arguments": {
    "script": "var comp = app.project.activeItem; if (!comp) return 'No active comp'; for (var i = 1; i <= comp.numLayers; i++) { comp.layer(i).selected = true; } evalDuik('Scripts/Duik_autoParent.jsx'); return 'Auto-Parent completed';"
  }
}
```

### Workflow 3: Thiết Lập Hệ Thống 2-Bone IK Thuần (Không Cần Mở UI Duik)
Áp dụng giải thuật 2D Inverse Kinematics cho cánh tay (`Arm` $\to$ `Forearm` $\to$ `Hand` được điều khiển bởi `CTRL_Hand`):
```json
{
  "tool": "execute-script",
  "arguments": {
    "script": "var comp = app.project.activeItem; if (!comp) return 'No comp'; var arm = comp.layer('Arm_R'); var forearm = comp.layer('Forearm_R'); var ctrl = comp.layer('CTRL_Hand_R'); if (!arm || !forearm || !ctrl) return 'Missing layers'; forearm.parent = arm; var ikExpr = 'var p1 = thisLayer.hasParent ? thisLayer.parent.toWorld(thisLayer.parent.anchorPoint) : position; var p3 = thisComp.layer(\"CTRL_Hand_R\").toWorld(thisComp.layer(\"CTRL_Hand_R\").anchorPoint); var a = length(p1, toWorld(anchorPoint)); var b = length(toWorld(anchorPoint), p3); var c = length(p1, p3); var cosB = (a*a + b*b - c*c) / (2*a*b); var rad = Math.acos(Math.max(-1, Math.min(1, cosB))); radiansToDegrees(rad) - 180;'; forearm.transform.rotation.expression = ikExpr; return 'IK Applied Successfully';"
  }
}
```

### Workflow 4: Tạo Khung Xương Toàn Thân (Full Rig Step-by-Step)
1. **Kiểm tra composition**: Gọi `inspect-comp` xác nhận danh sách các layer chi tiết.
2. **Căn chỉnh Anchor Point**: Dùng `batch-set-layer-properties` đặt pivot vào khớp xoay.
3. **Sinh Null Controllers**: Gọi `add-null-layer` hoặc `evalDuik("Scripts/Duik_addNull.jsx")`.
4. **Liên kết phân cấp**: Dùng `set-layer-parent` hoặc `evalDuik("Scripts/Duik_autoParent.jsx")`.
5. **Kiểm tra trực quan**: Gọi `see-frame` để kiểm tra dáng đứng (pose) và độ chuẩn xác của khung xương.
