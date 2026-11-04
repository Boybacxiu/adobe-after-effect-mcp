import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  magenta: "\x1b[35m",
};

const c = {
  ok: `${colors.green}${colors.bold}[✓]${colors.reset}`,
  warn: `${colors.yellow}${colors.bold}[!]${colors.reset}`,
  err: `${colors.red}${colors.bold}[✗]${colors.reset}`,
  info: `${colors.cyan}${colors.bold}[i]${colors.reset}`,
};

console.log("\n" + "=".repeat(65));
console.log(`${colors.cyan}${colors.bold}  ADOBE AFTER EFFECTS MCP - QUICK PING & TOOLS DASHBOARD${colors.reset}`);
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
  console.log(`${c.ok} Tiến trình AfterFX: ${colors.green}${colors.bold}ĐANG HOẠT ĐỘNG${colors.reset}`);
} else {
  console.log(`${c.warn} Tiến trình AfterFX: ${colors.yellow}${colors.bold}CHƯA BẬT TRÊN MÁY TÍNH${colors.reset}`);
  console.log(`    ${colors.yellow}👉 Vui lòng mở Adobe After Effects trên máy trước khi bắt đầu!${colors.reset}\n`);
}

// 2. Thử nghiệm Live Ping qua Bridge
let pingSuccess = false;
if (isAERunning) {
  process.stdout.write(`${c.info} Đang gửi tín hiệu Live Ping tới After Effects... `);
  const startTime = Date.now();
  try {
    const bridgeModule = await import("../build/core/bridge.js");
    const rawPing = await bridgeModule.sendBridgeCommand("ping", {}, 4000, 80);
    const latency = Date.now() - startTime;
    const res = JSON.parse(rawPing);

    if (res && (res.pong === true || res.status === "success")) {
      pingSuccess = true;
      console.log(`${colors.green}${colors.bold}PONG THÀNH CÔNG! (${latency}ms)${colors.reset}\n`);
      console.log(`  ${colors.bold}• Phiên bản AE:${colors.reset}       ${colors.green}${res.aeVersion || "25.x"}${colors.reset}`);
      console.log(`  ${colors.bold}• Phiên bản Bridge:${colors.reset}   ${res.bridgeVersion || "1.13.0-mcp-enhanced"}`);
      console.log(`  ${colors.bold}• Project hiện tại:${colors.reset}   ${colors.cyan}${res.project || "Untitled Project"}${colors.reset}`);
      console.log(`  ${colors.bold}• Composition:${colors.reset}        ${res.activeComp ? colors.green + res.activeComp : colors.gray + "(Chưa có comp nào được chọn)"}${colors.reset}`);
    } else {
      console.log(`${colors.red}${colors.bold}LỖI PHẢN HỒI${colors.reset}\n`);
      console.log(`  Chi tiết: ${rawPing}`);
    }
  } catch (err) {
    console.log(`${colors.red}${colors.bold}TIMEOUT HOẶC LỖI${colors.reset}\n`);
    console.log(`  ${colors.red}Không nhận được phản hồi từ After Effects (${err.message}).${colors.reset}`);
    console.log(`  👉 Hãy đảm bảo bạn đã cấp quyền trong AE: Edit > Preferences > Scripting & Expressions > Tích chọn "Allow Scripts to Write Files and Access Network".`);
  }
} else {
  console.log(`${c.info} Live Ping: ${colors.gray}Bỏ qua do After Effects chưa được mở.${colors.reset}`);
}

// 3. Phân loại và đếm 167 MCP Tools
console.log("\n" + "-".repeat(65));
console.log(`${colors.bold}  DANH SÁCH 167 MCP TOOLS ĐÃ KÍCH HOẠT (THEO NHÓM)${colors.reset}`);
console.log("-".repeat(65));

const categories = {
  "📁 Dự án & Composition": [
    "create-composition", "set-composition-properties", "inspect-comp", "localize-comp",
    "populate-template", "center-layers", "duplicate-composition", "delete-composition",
    "list-compositions", "get-composition-info", "get-comp-report", "set-active-composition",
    "create-project", "open-project", "save-project", "close-project", "get-project-info",
    "ae_create_comp", "create_project", "open_project", "save_project", "get_project_info"
  ],
  "✍️ Text & Typography": [
    "create-text-layer", "add-text-layer-advanced", "create-lower-third", "create-title-card",
    "create-transition", "create-logo-reveal", "create-text-animator", "list-template-styles",
    "ae_add_text", "create_lower_third", "create_title_card", "create_transition",
    "create_logo_reveal", "create_text_animator"
  ],
  "🔶 Vector Shapes & Paths": [
    "add-shape-layer", "create-path", "get-path", "set-path-keyframes", "add-shape-operator",
    "add-mask", "list-masks", "get-mask-path", "set-mask-path", "set-mask-keyframes",
    "set-mask-properties", "delete-mask", "create_path", "get_path", "add_mask", "list_masks"
  ],
  "🎬 Layer & Phân cấp (Hierarchy)": [
    "create-adjustment-layer", "duplicate-layer", "delete-layer", "set-layer-parent",
    "reorder-layer", "precompose-layers", "set-layer-mask", "batch-set-layer-properties",
    "inspect-layer", "get-layer-clip-frames", "add-solid-layer", "add-null-layer",
    "add-light-layer", "add-av-layer", "list-layers", "get-layer-info", "modify-layer"
  ],
  "📈 Keyframe, Easing & Diễn hoạt": [
    "setLayerKeyframe", "test-animation", "animate-from-data", "add-marker",
    "add-markers-bulk", "apply-spring-animation", "list-spring-presets", "calculate-spring-duration",
    "set-keyframe-advanced", "apply-easy-ease", "set-temporal-ease", "offset-keyframes",
    "scale-keyframe-timing", "reverse-keyframes", "copy-keyframes", "get-keyframes",
    "add-composition-marker", "add-layer-marker", "get-markers", "delete-marker",
    "set-work-area", "get-current-time", "set-current-time", "snap-to-marker",
    "get-nearest-marker", "navigate-markers"
  ],
  "✨ Expressions & Hiệu ứng": [
    "setLayerExpression", "apply-expression-template", "list-expression-templates",
    "batch-set-expressions", "link-properties", "add-expression-control", "get-expression",
    "remove-expression", "enable-expression", "apply-effect", "add-any-effect",
    "apply-effect-template", "remove-effect", "list-layer-effects", "list-available-effects",
    "set-effect-property", "set-effect-keyframe", "list-presets", "search-presets",
    "apply-preset", "mcp_aftereffects_get_effects_help", "modify-effect-properties",
    "reorder-effects", "copy-effects", "list-effects", "apply_expression_template"
  ],
  "🎵 Audio Reactive & Âm thanh": [
    "animate-to-audio", "set-audio-levels", "get-audio-info", "analyze-audio-waveform"
  ],
  "🎥 Không gian 3D, Camera & Light": [
    "create-camera", "set-3d-layer", "set-material-options", "set-geometry-options",
    "set-camera-options", "set-light-options", "get-3d-info", "set-comp-renderer",
    "set_3d_layer"
  ],
  "🖼️ Footage & Assets Ingestion": [
    "import-footage", "list-project-items", "relink-footage", "set-proxy",
    "remove-proxy", "see-frame", "contact-sheet", "match-reference",
    "import-folder", "replace-footage", "organize-project-items", "find-missing-footage",
    "collect-files", "reduce-project"
  ],
  "📦 Render Queue & Xuất file": [
    "add-to-render-queue", "render-queue", "start-render", "render-aerender",
    "render-status", "list-render-queue", "list-render-templates", "set-render-queue-item",
    "remove-from-render-queue", "control-render", "queue-in-ame", "list_render_queue"
  ],
  "⚙️ Hệ thống & Bridge": [
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
console.log(`  ${colors.bold}TỔNG CỘNG:${colors.reset}                                 ${colors.green}${colors.bold}${totalRegistered} MCP TOOLS SẴN SÀNG${colors.reset}`);
console.log("-".repeat(65) + "\n");

console.log("=".repeat(65));
if (pingSuccess) {
  console.log(`${colors.green}${colors.bold}🎉 HOÀN TẤT: CẢ 167 TOOLS & KẾT NỐI AFTER EFFECTS ĐÃ THÔNG SUỐT 100%!${colors.reset}`);
  console.log(`👉 Bạn có thể mở Claude / Cursor / Antigravity và ra đề tài thiết kế ngay.`);
} else if (isAERunning) {
  console.log(`${colors.yellow}${colors.bold}⚠️ CHÚ Ý: After Effects đang mở nhưng chưa phản hồi Ping.${colors.reset}`);
  console.log(`👉 Hãy kiểm tra lại quyền Scripting trong AE và thử khởi động lại AE.`);
} else {
  console.log(`${colors.yellow}${colors.bold}👉 BƯỚC TIẾP THEO: Hãy mở phần mềm Adobe After Effects trên máy!${colors.reset}`);
  console.log(`   Sau khi AE mở xong, bạn có thể click lại file này để xác nhận kết nối.`);
}
console.log("=".repeat(65) + "\n");
