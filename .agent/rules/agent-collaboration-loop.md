---
description: "Quy chuẩn vòng lặp phối hợp đa tác nhân (Multi-Agent Collaboration Loop), phân rã nhiệm vụ và xử lý lỗi đa tầng"
globs: "*"
alwaysApply: true
---

# Multi-Agent Collaboration & Adaptive Routing Specification

Tài liệu định nghĩa cơ chế cộng tác đa tác nhân, phân luồng tác vụ thích ứng (Fast-Track vs Creative Project), quy tắc yêu cầu người dùng mở After Effects, và nguyên tắc thực thi tối ưu giữa 3 tầng: **Gemini (Trưởng phòng)** $\to$ **Leader AE (Kiến trúc sư Motion)** $\to$ **Worker AE (Kỹ thuật viên Thực thi)**.

---

## 0. Quy Tắc Bắt Buộc: Yêu Cầu Người Dùng Mở After Effects (No Auto-Launch)

- **TUYỆT ĐỐI KHÔNG TỰ ĐỘNG KHỞI CHẠY AE**: Đã loại bỏ hoàn toàn tính năng tự động mở phần mềm ngầm (`launchAfterEffects`).
- **YÊU CẦU NGƯỜI DÙNG MỞ AE**: Khi bắt đầu một phiên làm việc hoặc khi phát hiện After Effects chưa chạy (`isAfterFxRunning() === false`), AI **BẮT BUỘC PHẢI DỪNG LẠI VÀ YÊU CẦU NGƯỜI DÙNG**:
  > *"Adobe After Effects chưa được mở. Vui lòng mở phần mềm Adobe After Effects trên máy của bạn trước khi thực hiện các tác vụ tiếp theo."*
- Sau khi người dùng mở After Effects, Background Listener (`mcp-bridge-auto.jsx` trong thư mục Startup) sẽ tự động nạp trong 50ms - 100ms mà không cần thao tác thêm.

---

## 1. Phân Luồng Tác Vụ Thích Ứng (Adaptive Task Routing)

Để triệt tiêu độ trễ và trả lời tức thì cho người dùng, hệ thống phân định rõ 2 làn xử lý:

```
                      [YÊU CẦU TỪ NGƯỜI DÙNG]
                                │
                 Phân loại độ phức tạp của tác vụ?
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼ (Tác vụ nguyên tử / đơn lẻ)                   ▼ (Dự án Motion đa tầng / Tutorial)
┌───────────────────────────────┐               ┌───────────────────────────────┐
│  LÀN CAO TỐC (FAST-TRACK)     │               │  LÀN DỰ ÁN (CREATIVE PROJECT) │
│  - Tạo comp / solid / text    │               │  - Kịch bản chuyển động nhiều │
│  - Sửa property, gán ease     │               │    scenes, video clip / MOGRT │
│  - Kiểm tra status, ping, time│               │  - Phân tích Video YouTube    │
│  - Chạy script đơn lẻ         │               │  - Rigging nhân vật với Duik  │
├───────────────────────────────┤               ├───────────────────────────────┤
│  ⚡ GEMINI THỰC THI TRỰC TIẾP │               │  👥 3-LEVEL MULTI-AGENT LOOP  │
│  - Gọi ngay 1 MCP Tool        │               │  1. Gemini: Brief & chiến lược│
│  - Bỏ qua DAG, tokens rườm rà │               │  2. Leader: Node DAG & tokens │
│  - Phản hồi trong < 1 giây    │               │  3. Worker: Thi công & QA     │
└───────────────────────────────┘               └───────────────────────────────┘
```

### 1.1. Làn Cao Tốc (Fast-Track Mode)
- **Khi nào áp dụng**: Bất kỳ khi nào người dùng yêu cầu thao tác cụ thể, đơn lẻ (ví dụ: *"tạo 1 comp 1920x1080"*, *"thêm chữ Hello"*, *"đổi màu nền thành đen"*, *"áp preset Decelerate Strong cho keyframe"*, *"kiểm tra kết nối"*).
- **Hành động**: Gemini gọi trực tiếp công cụ MCP phù hợp (`create-composition`, `create-text-layer`, `apply-preset`, `run-script`...) và phản hồi ngay cho người dùng.
- **Cấm tuyệt đối**: Không triệu hồi subagent, không lập DAG rườm rà, không phân rã nhiều bước gây chờ đợi lâu.

### 1.2. Làn Dự Án Sáng Tạo (Full Creative Project Pipeline)
- **Khi nào áp dụng**: Khi người dùng yêu cầu thiết kế một video quảng cáo, motion graphics hoàn chỉnh nhiều cảnh, bóc tách tutorial YouTube, hoặc rigging nhân vật.
- **Hành động**: Triển khai đầy đủ quy trình 3 cấp: Gemini duyệt kịch bản $\to$ Leader AE quy hoạch Node-DAG $\to$ Worker AE thi công từng chặng nguyên tử và kiểm tra qua `see-frame`.

### 1.1. Quy Tắc Nhận Diện Đặc Biệt: Video Tutorial & YouTube Links
Khi người dùng cung cấp đường dẫn video cục bộ (`.mp4`, `.mov`, `.mkv`) hoặc liên kết **YouTube**:
- **CẤM ĐOÁN MÒ**: Gemini và Leader AE **tuyệt đối không được đoán mò** thông số kỹ thuật, cấu trúc layer hay gia tốc easing.
- **KÍCH HOẠT PARSER NGAY LẬP TỨC**: Gemini lập tức điều phối qua kỹ năng [`.agent/skills/ae-video-tutorial-parser/SKILL.md`](../skills/ae-video-tutorial-parser/SKILL.md) để:
  1. Trích xuất phụ đề (Transcript) kèm mốc thời gian thao tác (Timestamps).
  2. Trích xuất các khung hình trọng tâm (Keyframes) bằng FFmpeg CLI hoặc Node script.
  3. Lập bảng tiến trình hành động (Action Timeline) trước khi chuyển giao cho Leader AE lên kế hoạch thi công.

---

## 2. Cơ Chế Phân Rã Bản Kế Hoạch Nguyên Tử (Atomic Task Breakdown)

Để tránh tình trạng Worker nhận một bản thiết kế quá đồ sộ dẫn đến quá tải bộ nhớ ngữ cảnh và lỗi dây chuyền, Leader AE bắt buộc phải bóc tách Blueprint thành chuỗi **Tác vụ Nguyên tử (Atomic Tasks)** có thứ tự phụ thuộc chặt chẽ:

```
[Task 1: Setup Comp & Canvas] ──► [Task 2: Build Elements & Anchors] ──► [Task 3: Apply Motion & Ease Presets] ──► [Task 4: QA Frame]
```

1. **Task 1: Khởi tạo Comp & Hệ Màu Canvas (Setup)**:
   - Tạo Composition với thông số chuẩn (Width, Height, FPS, Duration).
   - Tạo Solid nền hoặc Background container tuân thủ `design-system-spec.md`.
2. **Task 2: Dựng Phần Tử Tĩnh & Cân Chỉnh Điểm Neo (Static Assembly)**:
   - Tạo các Layer chữ (`create-text-layer`), Shape containers hoặc null controllers.
   - Cân chỉnh Anchor Point chính xác về mặt cơ học (`[w/2, h]`, `[0, h/2]`, `[w/2, h/2]`) và liên kết quan hệ cha-con (Parenting).
3. **Task 3: Hoạt Cảnh & Áp Đặt Đồ Thị Gia Tốc (Motion Application)**:
   - Đặt keyframes cho thuộc tính Transform.
   - Tra cứu và gán chính xác thông số từ thư viện [`.agent/skills/ae-keyframe-easing/mcp-ease-presets.md`](../skills/ae-keyframe-easing/mcp-ease-presets.md).
   - Xếp tầng thời gian (Stagger) lệch nhau từ 3 - 6 frames.
4. **Task 4: Nghiệm Thu Trực Quan (Visual Verification)**:
   - Gọi tool `see-frame` trích xuất ảnh chụp khung hình thực tế trong After Effects để đối chiếu với tiêu chuẩn thiết kế.

---

## 3. Quy Trình Xử Lý Lỗi Song Song & Ma Trận Phân Loại (Parallel Error Triage)

Khi phát sinh lỗi trong quá trình thực thi, hệ thống kích hoạt ma trận phân loại lỗi 3 cấp để xử lý song song, ngăn chặn tắc nghẽn toàn bộ quy trình:

| Cấp độ sự cố | Phân loại lỗi | Tác nhân phụ trách | Hành động khắc phục chuẩn mực |
| :--- | :--- | :--- | :--- |
| **Triage L1 (Cục bộ)** | Cú pháp script, sai MatchName, sai tọa độ Anchor, số liệu vượt biên | **Worker AE** | Tự động bắt lỗi, clamp giá trị an toàn, rollback Undo Group và thử lại (tối đa 3 lần). |
| **Triage L2 (Kiến trúc)** | Lỗi sau 3 lần thử, tràn Title Safe không khắc phục được, xung đột Precomp DAG | **Leader AE** | Kích hoạt phương án thiết kế dự phòng: Tách sub-comp, giảm mật độ text, hoặc đổi hiệu ứng tương đương. |
| **Triage L3 (Chiến lược)** | Thiếu file footage/assets, thời lượng brief mâu thuẫn, phá hủy comp cũ | **Gemini** | Dừng tự động, phát hành câu hỏi kèm 2-3 phương án tối ưu để người dùng chọn. |

### Cơ Chế Phối Hợp Song Song (Parallel Mitigation):
- Trong khi Worker đang thực thi Task $N$, Leader đã chuẩn bị sẵn phương án dự phòng (Fallback Plan) cho Task $N$ nếu thấy khả năng phát sinh lỗi biên (Edge Cases).
- Nếu Worker gặp lỗi ở lần thử thứ 2, Leader chuẩn bị sẵn thông số Easing hoặc cấu trúc Layer thay thế để Worker áp dụng ngay ở lần 3 mà không cần viết lại từ đầu.

---

## 4. Nguyên Lý Bất Biến "Never-Crash" Cho After Effects ExtendScript

Thừa hưởng từ triết lý phát triển phần mềm chuẩn mực: **Không bao giờ làm sập phần mềm máy chủ, không làm mất dữ liệu người dùng**. Mọi mã lệnh do Worker viết và thực thi qua MCP Tool bắt buộc phải tuân thủ 5 điều luật:

1. **Bọc Undo Group & Try-Finally Tuyệt Đối**:
   Mọi thao tác thay đổi trạng thái After Effects phải nằm trọn trong `app.beginUndoGroup()` và `app.endUndoGroup()`:
   ```javascript
   app.beginUndoGroup("Task_Name_Execution");
   try {
       // Thao tác ExtendScript an toàn
   } catch (err) {
       // Ghi nhận lỗi có cấu trúc, không quăng ngoại lệ ra ngoài làm treo AE
       $.writeln("ERROR: " + err.toString());
   } finally {
       app.endUndoGroup();
   }
   ```
2. **Khử Độc Giá Trị Đầu Vào (Sanitize & Clamp Everything)**:
   - Mọi giá trị Influence phải được ép trong đoạn `[0.1, 100.0]`: `Math.min(100, Math.max(0.1, v))`.
   - Mọi giá trị Speed phải được giới hạn an toàn: `Math.min(100, Math.max(-100, v))`.
   - Tránh chia cho 0 khi tính toán vận tốc trung bình (Slopes): Nếu `duration <= 0`, gán giá trị mặc định.
3. **Giới Hạn Độ Sâu Đệ Quy (Bound Recursion)**:
   Khi duyệt cây Layer, Pre-composition hoặc Property Group, phải đặt giới hạn độ sâu tối đa (Max Depth = 10) để tránh vòng lặp tham chiếu xoay vòng (Cyclic References).
4. **Không Để Lại Rác Dữ Liệu**:
   Nếu một tác vụ thất bại, Worker phải dọn sạch các layer tạm, null trung gian hoặc comp rác đã tạo ra trước khi báo cáo lỗi.
5. **Cú Pháp Tương Thích Ngược Tuyệt Đối (ES3/ES5)**:
   Chỉ sử dụng `var`, hàm truyền thống, không dùng cú pháp ES6 (`let`, `const`, `=>`, template string) để đảm bảo chạy mượt trên mọi đời AE 2020 - 2025+.

---

## 5. Quy Trình Báo Cáo Leo Thang Tiêu Chuẩn (Escalation Gate)

Khi sự cố chạm mốc Triage L2 hoặc L3, Leader AE lập báo cáo theo mẫu sau gửi cho Gemini:

```markdown
### [ESCALATION REPORT] Báo Cáo Sự Cố Kiến Trúc
- **Phân cảnh / Node gặp sự cố**: <Tên_Node_Comp>
- **Cấp độ Triage**: [L2 - Kiến trúc] HOẶC [L3 - Chiến lược]
- **Nguyên nhân kỹ thuật**: <Mô tả chi tiết nguyên nhân gốc rễ>
- **Nhật ký 3 lần thử của Worker**:
  - Attempt 1: <Lỗi phát sinh>
  - Attempt 2: <Phương án điều chỉnh đã thử>
  - Attempt 3: <Kết quả lần cuối>
- **Phương án giải quyết đề xuất**:
  - Phương án 1 (Khuyến nghị): <Giải pháp tối ưu>
  - Phương án 2: <Giải pháp thay thế>
```
