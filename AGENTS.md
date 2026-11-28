# Adobe After Effects MCP — Project Standards & Guidelines

> **Platform-independent project.** Works with any AI agent (Antigravity, Cursor, Claude Code, VS Code Copilot, etc.).
> Automation engine for Adobe After Effects with **169 MCP tools** and **16 active procedural motion skills** (v2.4.5).

---

## A. Platform Isolation Rules
- **Strictly No Cloud / Data Agent Kit**: Không gợi ý, gọi hoặc tham chiếu các công cụ/skill thuộc Google Cloud, BigQuery, Dataproc, Spanner, AlloyDB, Cloud SQL, Dataform, hay `datacloud_*`.
- **MCP Tool Scope**: Chỉ sử dụng hệ thống công cụ `adobe-after-effects` MCP cho tự động hóa After Effects, ExtendScript CLI và Local Bridge.
- **Self-Contained & Isolated**: Giữ mọi cấu hình MCP, skills và rules nằm gọn trong thư mục dự án này, không phụ thuộc cấu hình Global (`~/.gemini/config/`).
- **Hướng dẫn độc lập nền tảng**: Dùng `AGENTS.md` và các quy tắc trong dự án. Không tham chiếu hoặc phụ thuộc vào tệp hướng dẫn cũ của nền tảng khác.

## B. Repo Maintenance Discipline
- **Không tạo file log tồn dư**: Tuyệt đối KHÔNG tạo `CHANGELOG.md`, `live_error_log.md` hay tệp log tạm trong repository.
- **Báo cáo trực tiếp trong chat**: Sau khi `npm run build` và `npm test` pass 100%, chỉ hiển thị kết quả trực tiếp trong hội thoại — không lưu ra file rác.
- **Yêu cầu người dùng tự mở After Effects**: Tuyệt đối KHÔNG tự động khởi chạy After Effects ngầm (`launchAfterEffects`). Luôn yêu cầu người dùng tự mở After Effects trước khi chạy MCP tool.
- **Đồng bộ README.md**: Duy trì tài liệu `README.md` chính xác — cập nhật đúng số lượng tools, skill, phiên bản; không chứa liên kết tới file log.

## C. Dual-Audit V2 Workflow
Mọi thay đổi code phải trải qua quy trình Dual-Audit trước khi báo cáo hoàn tất:

**Audit 1 — Technical Build Check:**
1. `npm run build` → tsc phải pass 0 errors, 0 warnings.
2. `node test/verify-build.js` → tất cả 4 mục phải PASS.
3. Kiểm tra tool count ≥ 169, skill count khớp với số active `SKILL.md` (16 active).

**Audit 2 — Semantic Consistency Check:**
1. `src/index.ts` `SERVER_INSTRUCTIONS` phải phản ánh đúng tool count và skill count.
2. `AGENTS.md` phải đồng bộ với hằng số `PROJECT_STANDARDS` trong `src/index.ts`.
3. Không có tham chiếu tệp hướng dẫn cũ của nền tảng khác trong các file `.ts`, `.md`, `.json`.
4. MCP resource `ae://rules/project-standards` và `ae://rules/all` hoạt động chuẩn xác.

## D. Skill Matrix (16 Active + 1 Disabled = 17 Skills)

| # | Skill | Trạng thái | Trigger Keywords |
|---|-------|-----------|-----------------|
| 1 | ae-text-animation | ✅ Active | text, typography, lower thirds, kinetic |
| 2 | ae-keyframe-easing | ✅ Active | easing, spring, bounce, timing, curves |
| 3 | ae-shape-operators | ✅ Active | shapes, repeater, trim paths, procedural |
| 4 | ae-expression-math | ✅ Active | expression, HUD, toComp, sourceRectAtTime |
| 5 | ae-audio-reactive | ✅ Active | audio, beat sync, amplitude, spectrum |
| 6 | ae-color-management | ✅ Active | color, LUT, 32-bpc, OCIO, grading |
| 7 | ae-asset-interchange | ✅ Active | SVG, PSD, AI, Lottie, import, alpha |
| 8 | ae-mogrt-essential-graphics | ✅ Active | MOGRT, essential graphics, template |
| 9 | ae-render-pipeline | ✅ Active | render, aerender, export, queue |
| 10 | ae-video-tutorial-parser | ✅ Active | tutorial, YouTube, breakdown, parse |
| 11 | ae-visual-feedback | ✅ Active | preview, see-frame, contact sheet, QA |
| 12 | ae-design-scripting | ✅ Active | plan, blueprint, multi-scene, script |
| 13 | ae-magic-fire-burn | ✅ Active | fire, burn, ember, smoke, flame, VFX |
| 14 | ae-3d-cinematic-camera | ✅ Active | 3d camera, depth of field, orbit null, parallax |
| 15 | ae-kinetic-caption-reels | ✅ Active | 9:16 vertical, reels captions, word karaoke pop |
| 16 | ae-logo-reveal-pro | ✅ Active | logo reveal, stroke write-on, saber glow, light sweep |
| — | ae-character-rigging | ⛔ Disabled | (Duik not installed — hidden at `.agent/skills-disabled/`) |

## E. Security, Undo-Group & Session Cleanup Rules
- Mọi destructive operation (delete layer, remove effect, overwrite project) phải được thực hiện bên trong một undo-group rõ ràng qua ExtendScript `app.beginUndoGroup("...")` / `app.endUndoGroup()`.
- Không được xóa footage, composition gốc của người dùng mà không có xác nhận tường minh.
- Credential (API keys, tokens) không được lưu vào bất kỳ file trong repository.
- **Session Cleanup**: Sau khi hoàn thành QA, luôn hỏi người dùng nghiệm thu trước khi gọi `cleanup-session` để xóa file tạm (see-frame, logs, scratch), luôn bảo lưu `.aep`, video render, tutorial và `.jsx`.
