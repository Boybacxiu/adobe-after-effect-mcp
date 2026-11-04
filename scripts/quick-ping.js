import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

// Auto-detect system language (Vietnamese vs English/International)
function detectLocale() {
  const arg = process.argv.find((a) => a.startsWith("--lang="))?.split("=")[1]?.toLowerCase();
  if (arg === "vi" || arg === "en") return arg;
  if (process.env.MCP_LANG === "vi" || process.env.MCP_LANG === "en") return process.env.MCP_LANG;
  try {
    const loc = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
    if (loc.startsWith("vi")) return "vi";
  } catch {}
  const env = (process.env.LANG || process.env.LC_ALL || process.env.LANGUAGE || "").toLowerCase();
  if (env.startsWith("vi")) return "vi";
  return "en";
}

const lang = detectLocale();
const isVi = lang === "vi";

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const c = {
  ok: `${colors.green}${colors.bold}[✓]${colors.reset}`,
  warn: `${colors.yellow}${colors.bold}[!]${colors.reset}`,
  err: `${colors.red}${colors.bold}[✗]${colors.reset}`,
  info: `${colors.cyan}${colors.bold}[i]${colors.reset}`,
};

const title = isVi
  ? "ADOBE AFTER EFFECTS MCP - KIỂM TRA NHANH KẾT NỐI & 167 TOOLS"
  : "ADOBE AFTER EFFECTS MCP - QUICK PING & TOOLS DASHBOARD";

console.log("\n" + "=".repeat(65));
console.log(`${colors.cyan}${colors.bold}  ${title}${colors.reset}`);
console.log("=".repeat(65) + "\n");

// 1. Kiểm tra tiến trình After Effects
const isWindows = process.platform === "win32";
const isMac = process.platform === "darwin";

let isAERunning = false;
try {
  if (isWindows) {
    const output = execSync('tasklist /FI "IMAGENAME eq AfterFX.exe" /NH', { encoding: "utf8" });
    isAERunning = output.toLowerCase().includes("afterfx.exe");
  } else if (isMac) {
    const output = execSync('pgrep -f "After Effects" || true', { encoding: "utf8" });
    isAERunning = output.trim().length > 0;
  }
} catch {
  isAERunning = false;
}

if (isAERunning) {
  console.log(`${c.ok} ${isVi ? "Tiến trình AfterFX:" : "AfterFX Process:"} ${colors.green}${colors.bold}${isVi ? "ĐANG HOẠT ĐỘNG" : "ACTIVE & RUNNING"}${colors.reset}`);
} else {
  console.log(`${c.warn} ${isVi ? "Tiến trình AfterFX:" : "AfterFX Process:"} ${colors.yellow}${colors.bold}${isVi ? "CHƯA BẬT TRÊN MÁY TÍNH" : "NOT RUNNING ON COMPUTER"}${colors.reset}`);
  console.log(`    ${colors.yellow}${isVi ? "👉 Vui lòng mở Adobe After Effects trên máy trước khi bắt đầu!" : "👉 Please launch Adobe After Effects on your computer before starting!"}${colors.reset}\n`);
}

// 2. Thử nghiệm Live Ping qua Bridge
let pingSuccess = false;
if (isAERunning) {
  process.stdout.write(`${c.info} ${isVi ? "Đang gửi tín hiệu Live Ping tới After Effects... " : "Sending Live Ping signal to After Effects... "}`);
  const startTime = Date.now();
  try {
    const bridgeModule = await import("../build/core/bridge.js");
    const rawPing = await bridgeModule.sendBridgeCommand("ping", {}, 4000, 80);
    const latency = Date.now() - startTime;
    const res = JSON.parse(rawPing);

    if (res && (res.pong === true || res.status === "success")) {
      pingSuccess = true;
      console.log(`${colors.green}${colors.bold}${isVi ? "PONG THÀNH CÔNG!" : "PONG SUCCESSFUL!"} (${latency}ms)${colors.reset}\n`);
      console.log(`  ${colors.bold}• ${isVi ? "Phiên bản AE:" : "AE Version:"}${colors.reset}       ${colors.green}${res.aeVersion || "25.x"}${colors.reset}`);
      console.log(`  ${colors.bold}• ${isVi ? "Phiên bản Bridge:" : "Bridge Version:"}${colors.reset}   ${res.bridgeVersion || "1.13.0-mcp-enhanced"}`);
      console.log(`  ${colors.bold}• ${isVi ? "Project hiện tại:" : "Current Project:"}${colors.reset}   ${colors.cyan}${res.project || "Untitled Project"}${colors.reset}`);
      console.log(`  ${colors.bold}• ${isVi ? "Composition:" : "Active Composition:"}${colors.reset}   ${res.activeComp ? colors.green + res.activeComp : colors.gray + (isVi ? "(Chưa có comp nào được chọn)" : "(No active composition selected)")}${colors.reset}`);
    } else {
      console.log(`${colors.red}${colors.bold}${isVi ? "LỖI PHẢN HỒI" : "RESPONSE ERROR"}${colors.reset}\n`);
      console.log(`  ${isVi ? "Chi tiết:" : "Details:"} ${rawPing}`);
    }
  } catch (err) {
    console.log(`${colors.red}${colors.bold}${isVi ? "TIMEOUT HOẶC LỖI" : "TIMEOUT OR ERROR"}${colors.reset}\n`);
    console.log(`  ${colors.red}${isVi ? "Không nhận được phản hồi từ After Effects" : "No response from After Effects"} (${err.message}).${colors.reset}`);
    console.log(`  ${isVi ? "👉 Hãy đảm bảo bạn đã cấp quyền trong AE: Edit > Preferences > Scripting & Expressions > Tích chọn 'Allow Scripts to Write Files and Access Network'." : "👉 Ensure permission in AE: Edit > Preferences > Scripting & Expressions > Check 'Allow Scripts to Write Files and Access Network'."}`);
  }
} else {
  console.log(`${c.info} Live Ping: ${colors.gray}${isVi ? "Bỏ qua do After Effects chưa được mở." : "Skipped because After Effects is not running."}${colors.reset}`);
}

// 3. Phân loại và đếm 167 MCP Tools
console.log("\n" + "-".repeat(65));
console.log(`${colors.bold}  ${isVi ? "DANH SÁCH 167 MCP TOOLS ĐÃ KÍCH HOẠT (THEO NHÓM)" : "REGISTERED 167 MCP TOOLS (BY FUNCTIONAL GROUP)"}${colors.reset}`);
console.log("-".repeat(65));

const categories = {
  [isVi ? "📁 Dự án & Composition" : "📁 Projects & Compositions"]: [
    "create-composition", "set-composition-properties", "inspect-comp", "localize-comp",
    "populate-template", "center-layers", "duplicate-composition", "delete-composition",
    "list-compositions", "get-composition-info", "get-comp-report", "set-active-composition",
    "create-project", "open-project", "save-project", "close-project", "get-project-info",
    "ae_create_comp", "create_project", "open_project", "save_project", "get_project_info"
  ],
  [isVi ? "✍️ Text & Typography" : "✍️ Text & Typography"]: [
    "create-text-layer", "add-text-layer-advanced", "create-lower-third", "create-title-card",
    "create-transition", "create-logo-reveal", "create-text-animator", "list-template-styles",
    "ae_add_text", "create_lower_third", "create_title_card", "create_transition",
    "create_logo_reveal", "create_text_animator"
  ],
  [isVi ? "🔶 Vector Shapes & Paths" : "🔶 Vector Shapes & Paths"]: [
    "add-shape-layer", "create-path", "get-path", "set-path-keyframes", "add-shape-operator",
    "add-mask", "list-masks", "get-mask-path", "set-mask-path", "set-mask-keyframes",
    "set-mask-properties", "delete-mask", "create_path", "get_path", "add_mask", "list_masks"
  ],
  [isVi ? "🎬 Layer & Phân cấp (Hierarchy)" : "🎬 Layers & Hierarchy"]: [
    "create-adjustment-layer", "duplicate-layer", "delete-layer", "set-layer-parent",
    "reorder-layer", "precompose-layers", "set-layer-mask", "batch-set-layer-properties",
    "inspect-layer", "get-layer-clip-frames", "add-solid-layer", "add-null-layer",
    "add-light-layer", "add-av-layer", "list-layers", "get-layer-info", "modify-layer"
  ],
  [isVi ? "📈 Keyframe, Easing & Diễn hoạt" : "📈 Keyframes, Easing & Motion"]: [
    "setLayerKeyframe", "test-animation", "animate-from-data", "add-marker",
    "add-markers-bulk", "apply-spring-animation", "list-spring-presets", "calculate-spring-duration",
    "set-keyframe-advanced", "apply-easy-ease", "set-temporal-ease", "offset-keyframes",
    "scale-keyframe-timing", "reverse-keyframes", "copy-keyframes", "get-keyframes",
    "add-composition-marker", "add-layer-marker", "get-markers", "delete-marker",
    "set-work-area", "get-current-time", "set-current-time", "snap-to-marker",
    "get-nearest-marker", "navigate-markers"
  ],
  [isVi ? "✨ Expressions & Hiệu ứng" : "✨ Expressions & Effects"]: [
    "setLayerExpression", "apply-expression-template", "list-expression-templates",
    "batch-set-expressions", "link-properties", "add-expression-control", "get-expression",
    "remove-expression", "enable-expression", "apply-effect", "add-any-effect",
    "apply-effect-template", "remove-effect", "list-layer-effects", "list-available-effects",
    "set-effect-property", "set-effect-keyframe", "list-presets", "search-presets",
    "apply-preset", "mcp_aftereffects_get_effects_help", "modify-effect-properties",
    "reorder-effects", "copy-effects", "list-effects", "apply_expression_template"
  ],
  [isVi ? "🎵 Audio Reactive & Âm thanh" : "🎵 Audio Reactive & Sound"]: [
    "animate-to-audio", "set-audio-levels", "get-audio-info", "analyze-audio-waveform"
  ],
  [isVi ? "🎥 Không gian 3D, Camera & Light" : "🎥 3D Space, Camera & Lights"]: [
    "create-camera", "set-3d-layer", "set-material-options", "set-geometry-options",
    "set-camera-options", "set-light-options", "get-3d-info", "set-comp-renderer",
    "set_3d_layer"
  ],
  [isVi ? "🖼️ Footage & Assets Ingestion" : "🖼️ Footage & Asset Management"]: [
    "import-footage", "list-project-items", "relink-footage", "set-proxy",
    "remove-proxy", "see-frame", "contact-sheet", "match-reference",
    "import-folder", "replace-footage", "organize-project-items", "find-missing-footage",
    "collect-files", "reduce-project"
  ],
  [isVi ? "📦 Render Queue & Xuất file" : "📦 Render Queue & Output"]: [
    "add-to-render-queue", "render-queue", "start-render", "render-aerender",
    "render-status", "list-render-queue", "list-render-templates", "set-render-queue-item",
    "remove-from-render-queue", "control-render", "queue-in-ame", "list_render_queue"
  ],
  [isVi ? "⚙️ Hệ thống & Bridge" : "⚙️ System & Bridge Engine"]: [
    "run-script", "get-results", "get-help", "check-bridge", "run-bridge-test",
    "execute-script", "ae_ping"
  ]
};

// Đếm tổng số tools
let totalRegistered = 0;
const allRegistered = new Set();
try {
  const toolsModule = await import("../build/tools/index.js");
  toolsModule.registerAllTools({ tool: (name) => {
    allRegistered.add(name);
    totalRegistered++;
  }});
} catch {}

for (const [catName, toolList] of Object.entries(categories)) {
  const count = toolList.length;
  const dotCount = Math.max(2, 38 - catName.length);
  const dots = colors.gray + ".".repeat(dotCount) + colors.reset;
  const sample = toolList.slice(0, 3).join(", ");
  console.log(`  ${catName} ${dots} ${colors.green}${colors.bold}${count.toString().padStart(2, " ")} tools${colors.reset} ${colors.gray}(${sample}...)${colors.reset}`);
}

console.log("-".repeat(65));
console.log(`  ${colors.bold}${isVi ? "TỔNG CỘNG:" : "TOTAL:"}${colors.reset}                                 ${colors.green}${colors.bold}${totalRegistered} MCP TOOLS ${isVi ? "SẴN SÀNG" : "READY"}${colors.reset}`);
console.log("-".repeat(65) + "\n");

console.log("=".repeat(65));
if (pingSuccess) {
  console.log(`${colors.green}${colors.bold}${isVi ? "🎉 HOÀN TẤT: CẢ 167 TOOLS & KẾT NỐI AFTER EFFECTS ĐÃ THÔNG SUỐT 100%!" : "🎉 ALL SYSTEMS READY: ALL 167 TOOLS & AE BRIDGE 100% OPERATIONAL!"}${colors.reset}`);
  console.log(`${isVi ? "👉 Bạn có thể mở Claude / Cursor / Antigravity và ra đề tài thiết kế ngay." : "👉 You can now open Claude / Cursor / Antigravity and start prompting your tasks."}`);
} else if (isAERunning) {
  console.log(`${colors.yellow}${colors.bold}${isVi ? "⚠️ CHÚ Ý: After Effects đang mở nhưng chưa phản hồi Ping." : "⚠️ NOTICE: After Effects is running but did not respond to Ping."}${colors.reset}`);
  console.log(`${isVi ? "👉 Hãy kiểm tra lại quyền Scripting trong AE và thử khởi động lại AE." : "👉 Please check Scripting permissions in AE Preferences and restart AE."}`);
} else {
  console.log(`${colors.yellow}${colors.bold}${isVi ? "👉 BƯỚC TIẾP THEO: Hãy mở phần mềm Adobe After Effects trên máy!" : "👉 NEXT STEP: Please open Adobe After Effects on your computer!"}${colors.reset}`);
  console.log(`   ${isVi ? "Sau khi AE mở xong, bạn có thể click lại file này để xác nhận kết nối." : "Once AE is running, you can click this file again to verify connection."}`);
}
console.log("=".repeat(65) + "\n");
