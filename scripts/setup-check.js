import { execSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
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

const isWindows = process.platform === "win32";
const isMac = process.platform === "darwin";

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

const mainTitle = isVi
  ? "ADOBE AFTER EFFECTS MCP - KIỂM TRA HỆ THỐNG & KẾT NỐI"
  : "ADOBE AFTER EFFECTS MCP - SYSTEM & CONNECTION DIAGNOSTICS";

console.log("\n" + "=".repeat(65));
console.log(`${colors.cyan}${colors.bold}  ${mainTitle}${colors.reset}`);
console.log("=".repeat(65) + "\n");

let allPassed = true;
const summary = [];

// 1. Kiểm tra Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0], 10);
if (majorVersion >= 18) {
  console.log(`${c.ok} Node.js: ${colors.bold}${nodeVersion}${colors.reset} (${isVi ? "Hợp lệ >= 18.0.0" : "Valid >= 18.0.0"})`);
  summary.push({ item: "Node.js (>= 18.0.0)", status: "OK" });
} else {
  console.log(`${c.err} Node.js: ${colors.bold}${nodeVersion}${colors.reset} (${isVi ? "Yêu cầu phiên bản >= 18.0.0" : "Requires version >= 18.0.0"})`);
  allPassed = false;
  summary.push({ item: "Node.js (>= 18.0.0)", status: "FAILED" });
}

// 2. Kiểm tra bản build dự án
const buildIndexPath = path.join(PROJECT_ROOT, "build", "index.js");
const buildScriptPath = path.join(PROJECT_ROOT, "build", "scripts", "mcp-bridge-auto.jsx");
const normalizedIndexPath = buildIndexPath.replace(/\\/g, "/");

if (fs.existsSync(buildIndexPath) && fs.existsSync(buildScriptPath)) {
  console.log(`${c.ok} ${isVi ? "Bản build MCP Server:" : "MCP Server Build:"} ${colors.green}${isVi ? "Đã sẵn sàng" : "Ready"} (build/index.js)${colors.reset}`);
  summary.push({ item: isVi ? "Bản build MCP Server" : "MCP Server Build", status: "OK" });
} else {
  console.log(`${c.warn} ${isVi ? "Bản build MCP Server:" : "MCP Server Build:"} ${colors.yellow}${isVi ? "Chưa build hoặc thiếu file. Đang tự động build..." : "Missing build files. Building now..."}${colors.reset}`);
  try {
    execSync("npm run build", { cwd: PROJECT_ROOT, stdio: "inherit" });
    console.log(`${c.ok} ${isVi ? "Bản build MCP Server: Đã build thành công." : "MCP Server Build: Built successfully."}`);
    summary.push({ item: isVi ? "Bản build MCP Server" : "MCP Server Build", status: "OK" });
  } catch (err) {
    console.log(`${c.err} ${isVi ? "Build thất bại:" : "Build failed:"} ${err.message}`);
    allPassed = false;
    summary.push({ item: isVi ? "Bản build MCP Server" : "MCP Server Build", status: "FAILED" });
  }
}

// 3. Phát hiện After Effects đã cài đặt trên máy
const years = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];
const detectedAE = [];

if (isWindows) {
  const pf = process.env.ProgramFiles || "C:\\Program Files";
  for (const y of years) {
    const aeDir = path.join(pf, "Adobe", `Adobe After Effects ${y}`);
    if (fs.existsSync(aeDir)) {
      detectedAE.push(`After Effects ${y} (${aeDir})`);
    }
  }
} else if (isMac) {
  for (const y of years) {
    const aeApp = `/Applications/Adobe After Effects ${y}`;
    if (fs.existsSync(aeApp)) {
      detectedAE.push(`After Effects ${y} (${aeApp})`);
    }
  }
}

if (detectedAE.length > 0) {
  console.log(`${c.ok} ${isVi ? "After Effects phát hiện:" : "Detected After Effects:"} ${colors.bold}${detectedAE.length} ${isVi ? "phiên bản" : "version(s)"}${colors.reset}`);
  for (const ae of detectedAE) {
    console.log(`    - ${ae}`);
  }
  summary.push({ item: isVi ? "Adobe After Effects cài đặt" : "Adobe After Effects Installed", status: "OK" });
} else {
  console.log(`${c.warn} ${isVi ? "Không tìm thấy thư mục cài đặt After Effects tiêu chuẩn (2020-2026)." : "Standard After Effects install folder not found (2020-2026)."}`);
  console.log(`    ${isVi ? "Nếu bạn cài đặt ở đường dẫn tùy chỉnh, MCP vẫn có thể hoạt động nếu AfterFX.exe đã được bật." : "If installed in a custom location, MCP can still work as long as AfterFX is open."}`);
  summary.push({ item: isVi ? "Adobe After Effects cài đặt" : "Adobe After Effects Installed", status: "CUSTOM/NOT FOUND" });
}

// 4. Kiểm tra tiến trình After Effects có đang mở không
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
  console.log(`${c.ok} ${isVi ? "Trạng thái After Effects:" : "After Effects Process:"} ${colors.green}${colors.bold}${isVi ? "ĐANG CHẠY" : "RUNNING & ACTIVE"}${colors.reset}`);
  summary.push({ item: isVi ? "Tiến trình After Effects" : "After Effects Process", status: isVi ? "ĐANG MỞ" : "RUNNING" });
} else {
  console.log(`${c.warn} ${isVi ? "Trạng thái After Effects:" : "After Effects Process:"} ${colors.yellow}${colors.bold}${isVi ? "CHƯA MỞ" : "NOT RUNNING"}${colors.reset}`);
  console.log(`    ${colors.yellow}${isVi ? "👉 LƯU Ý: Vui lòng tự mở phần mềm Adobe After Effects trên máy trước khi yêu cầu AI kết nối/thực thi tool!" : "👉 NOTE: Please launch Adobe After Effects manually before executing AI tools!"}${colors.reset}`);
  summary.push({ item: isVi ? "Tiến trình After Effects" : "After Effects Process", status: isVi ? "CHƯA BẬT (Cần mở AE)" : "NOT OPEN (Open AE)" });
}

// 5. Kiểm tra quyền Scripting ("Allow Scripts to Write Files and Access Network")
let scriptingPermStatus = "UNKNOWN";
const checkedPrefs = [];

try {
  if (isWindows && process.env.APPDATA) {
    const aeRoot = path.join(process.env.APPDATA, "Adobe", "After Effects");
    if (fs.existsSync(aeRoot)) {
      const versions = fs.readdirSync(aeRoot).filter((v) => {
        try {
          return fs.statSync(path.join(aeRoot, v)).isDirectory() && v !== "Logs";
        } catch {
          return false;
        }
      });

      for (const v of versions) {
        const prefsFile = path.join(aeRoot, v, `Adobe After Effects ${v} Prefs.txt`);
        if (fs.existsSync(prefsFile)) {
          const content = fs.readFileSync(prefsFile, "utf8");
          const match = content.match(/"Pref_SCRIPTING_FILE_NETWORK_SECURITY"\s*=\s*"([01])"/);
          if (match) {
            const isAllowed = match[1] === "1";
            checkedPrefs.push({ version: v, isAllowed });
            if (isAllowed) scriptingPermStatus = "ENABLED";
            else if (scriptingPermStatus !== "ENABLED") scriptingPermStatus = "DISABLED";
          }
        }
      }
    }
  }
} catch {
  // Ignore pref parsing issues
}

if (scriptingPermStatus === "ENABLED") {
  console.log(`${c.ok} ${isVi ? "Cấp quyền Scripting:" : "Scripting Permission:"} ${colors.green}${colors.bold}${isVi ? "ĐÃ BẬT" : "ENABLED"}${colors.reset} ("Allow Scripts to Write Files and Access Network")`);
  for (const cp of checkedPrefs) {
    console.log(`    - AE ${cp.version}: ${cp.isAllowed ? colors.green + (isVi ? "Đã bật (= 1)" : "Enabled (= 1)") : colors.yellow + (isVi ? "Chưa bật (= 0)" : "Disabled (= 0)")}${colors.reset}`);
  }
  summary.push({ item: isVi ? "Quyền Scripting & Network" : "Scripting Permission", status: isVi ? "OK (ĐÃ BẬT)" : "OK (ENABLED)" });
} else if (scriptingPermStatus === "DISABLED") {
  console.log(`${c.err} ${isVi ? "Cấp quyền Scripting:" : "Scripting Permission:"} ${colors.red}${colors.bold}${isVi ? "CHƯA ĐƯỢC BẬT!" : "NOT ENABLED!"}${colors.reset}`);
  console.log(`    ${colors.red}${isVi ? "👉 BẮT BUỘC: Vào After Effects > Edit > Preferences > Scripting & Expressions" : "👉 REQUIRED: Go to AE > Edit > Preferences > Scripting & Expressions"}${colors.reset}`);
  console.log(`    ${colors.red}${isVi ? "👉 Tích chọn: 'Allow Scripts to Write Files and Access Network' rồi khởi động lại AE." : "👉 Check: 'Allow Scripts to Write Files and Access Network' and restart AE."}${colors.reset}`);
  allPassed = false;
  summary.push({ item: isVi ? "Quyền Scripting & Network" : "Scripting Permission", status: isVi ? "CHƯA BẬT (CẦN TÍCH CHỌN)" : "DISABLED (ACTION REQ)" });
} else {
  console.log(`${c.warn} ${isVi ? "Cấp quyền Scripting:" : "Scripting Permission:"} ${colors.yellow}${isVi ? "Chưa kiểm tra được file Prefs tự động." : "Could not automatically inspect Prefs file."}${colors.reset}`);
  console.log(`    ${isVi ? "Vui lòng kiểm tra thủ công trong AE: Preferences > Scripting & Expressions > Tích chọn 'Allow Scripts to Write Files and Access Network'." : "Please verify in AE: Preferences > Scripting & Expressions > Check 'Allow Scripts to Write Files and Access Network'."}`);
  summary.push({ item: isVi ? "Quyền Scripting & Network" : "Scripting Permission", status: isVi ? "CẦN XÁC NHẬN THỦ CÔNG" : "MANUAL CHECK NEEDED" });
}

// 6. Kiểm tra Bridge Listener trong thư mục Startup của After Effects
let bridgeInstalled = false;
if (isWindows && process.env.APPDATA) {
  const aeRoot = path.join(process.env.APPDATA, "Adobe", "After Effects");
  if (fs.existsSync(aeRoot)) {
    const versions = fs.readdirSync(aeRoot).filter((v) => v !== "Logs");
    for (const v of versions) {
      const startupScript = path.join(aeRoot, v, "Scripts", "Startup", "mcp-bridge-auto.jsx");
      if (fs.existsSync(startupScript)) {
        bridgeInstalled = true;
        break;
      }
    }
  }
}

if (!bridgeInstalled) {
  const pf = process.env.ProgramFiles || "C:\\Program Files";
  for (const y of years) {
    const startupScript = path.join(pf, "Adobe", `Adobe After Effects ${y}`, "Support Files", "Scripts", "Startup", "mcp-bridge-auto.jsx");
    if (fs.existsSync(startupScript)) {
      bridgeInstalled = true;
      break;
    }
  }
}

if (bridgeInstalled) {
  console.log(`${c.ok} Background Bridge: ${colors.green}${isVi ? "Đã cài đặt vào thư mục Startup của After Effects" : "Installed in After Effects Startup folder"}${colors.reset}`);
  summary.push({ item: "MCP Bridge Startup Script", status: "OK" });
} else {
  console.log(`${c.warn} Background Bridge: ${isVi ? "Chưa được copy vào thư mục Startup. Đang tiến hành cài đặt..." : "Not found in Startup folder. Installing now..."}`);
  try {
    execSync("node scripts/install-bridge.js", { cwd: PROJECT_ROOT, stdio: "inherit" });
    bridgeInstalled = true;
    summary.push({ item: "MCP Bridge Startup Script", status: isVi ? "OK (Vừa cài đặt)" : "OK (Just installed)" });
  } catch (err) {
    console.log(`${c.err} ${isVi ? "Cài đặt bridge thất bại:" : "Bridge installation failed:"} ${err.message}`);
    summary.push({ item: "MCP Bridge Startup Script", status: "FAILED" });
  }
}

// 7. Cấu hình MCP Client cho Cursor / Antigravity / Windsurf (.mcp.json & .cursor/mcp.json)
const localMcpPath = path.join(PROJECT_ROOT, ".mcp.json");
const cursorMcpDir = path.join(PROJECT_ROOT, ".cursor");
const cursorMcpPath = path.join(cursorMcpDir, "mcp.json");

const mcpConfig = {
  mcpServers: {
    "adobe-after-effects": {
      "command": "node",
      "args": ["./build/index.js"]
    }
  }
};

try {
  fs.writeFileSync(localMcpPath, JSON.stringify(mcpConfig, null, 2) + "\n", "utf8");
  if (!fs.existsSync(cursorMcpDir)) {
    fs.mkdirSync(cursorMcpDir, { recursive: true });
  }
  fs.writeFileSync(cursorMcpPath, JSON.stringify(mcpConfig, null, 2) + "\n", "utf8");
  console.log(`${c.ok} ${isVi ? "Cấu hình Cursor / Antigravity / Windsurf:" : "Cursor / Antigravity / Windsurf Config:"} ${colors.green}${isVi ? "File .mcp.json & .cursor/mcp.json đã sẵn sàng" : "Files .mcp.json & .cursor/mcp.json are ready"}${colors.reset}`);
  summary.push({ item: "Cursor / Antigravity (.mcp.json)", status: "OK" });
} catch (err) {
  console.log(`${c.warn} ${isVi ? "Không thể ghi file cấu hình MCP local:" : "Could not write local MCP config:"} ${err.message}`);
  summary.push({ item: "Cursor / Antigravity (.mcp.json)", status: "WARN" });
}

// 8. Tự động cấu hình cho Claude Desktop
const claudeConfigFiles = [];
if (isWindows) {
  if (process.env.APPDATA) {
    claudeConfigFiles.push(path.join(process.env.APPDATA, "Claude", "claude_desktop_config.json"));
  }
  if (process.env.LOCALAPPDATA) {
    const packagesDir = path.join(process.env.LOCALAPPDATA, "Packages");
    if (fs.existsSync(packagesDir)) {
      try {
        const pkgs = fs.readdirSync(packagesDir).filter((p) => p.toLowerCase().startsWith("claude_"));
        for (const pkg of pkgs) {
          claudeConfigFiles.push(path.join(packagesDir, pkg, "LocalCache", "Roaming", "Claude", "claude_desktop_config.json"));
        }
      } catch {}
    }
  }
} else if (isMac) {
  claudeConfigFiles.push(path.join(os.homedir(), "Library", "Application Support", "Claude", "claude_desktop_config.json"));
}

let claudeStatus = isVi ? "CHƯA CÀI ĐẶT" : "NOT INSTALLED";
for (const claudeConfigFile of claudeConfigFiles) {
  const claudeConfigDir = path.dirname(claudeConfigFile);
  try {
    let existingConfig = { mcpServers: {} };
    if (fs.existsSync(claudeConfigFile)) {
      try {
        existingConfig = JSON.parse(fs.readFileSync(claudeConfigFile, "utf8"));
        if (!existingConfig.mcpServers) existingConfig.mcpServers = {};
      } catch {
        existingConfig = { mcpServers: {} };
      }
    } else if (fs.existsSync(path.dirname(claudeConfigDir))) {
      fs.mkdirSync(claudeConfigDir, { recursive: true });
    } else {
      continue;
    }

    existingConfig.mcpServers["adobe-after-effects"] = {
      command: "node",
      args: [normalizedIndexPath],
    };

    fs.writeFileSync(claudeConfigFile, JSON.stringify(existingConfig, null, 2), "utf8");
    console.log(`${c.ok} ${isVi ? "Cấu hình Claude Desktop:" : "Claude Desktop Config:"} ${colors.green}${isVi ? "Đã tự động kết nối vào" : "Auto-configured at"} ${claudeConfigFile}${colors.reset}`);
    claudeStatus = isVi ? "OK (ĐÃ CẤU HÌNH)" : "OK (CONFIGURED)";
  } catch (err) {
    console.log(`${c.warn} Claude Desktop: ${err.message}`);
  }
}
summary.push({ item: "Claude Desktop", status: claudeStatus });

// 9. Kiểm tra và đếm danh sách MCP Tools đã biên dịch
let toolsCount = 0;
try {
  const toolsModule = await import("../build/tools/index.js");
  if (typeof toolsModule.registerAllTools === "function") {
    const list = [];
    toolsModule.registerAllTools({ tool: (n) => list.push(n) });
    toolsCount = list.length;
  }
} catch (err) {
  // Ignore if not built yet
}

if (toolsCount > 0) {
  console.log(`${c.ok} ${isVi ? "Danh sách MCP Tools:" : "MCP Tools Library:"} ${colors.green}${colors.bold}${toolsCount} tools${colors.reset} ${isVi ? "sẵn sàng." : "ready."}`);
  summary.push({ item: `MCP Tools (${toolsCount} tools)`, status: "OK" });
} else {
  console.log(`${c.warn} ${isVi ? "Danh sách MCP Tools: Chưa nạp được tools." : "MCP Tools Library: Tools not loaded."}`);
  summary.push({ item: "MCP Tools", status: "WARN" });
}

// 10. Thử nghiệm Live Ping After Effects (nếu tiến trình đang mở)
if (isAERunning) {
  console.log(`${c.info} ${isVi ? "Đang gửi thử lệnh Live Ping tới After Effects..." : "Testing Live Ping to After Effects..."}`);
  try {
    const bridgeModule = await import("../build/core/bridge.js");
    const rawPing = await bridgeModule.sendBridgeCommand("ping", {}, 4000, 100);
    const parsedPing = JSON.parse(rawPing);
    if (parsedPing && (parsedPing.pong === true || parsedPing.status === "success")) {
      const aeVer = parsedPing.aeVersion ? ` (AE: ${parsedPing.aeVersion})` : "";
      console.log(`${c.ok} Live Ping After Effects: ${colors.green}${colors.bold}${isVi ? "PONG THÀNH CÔNG!" : "PONG SUCCESSFUL!"}${aeVer}${colors.reset}`);
      summary.push({ item: "Live Ping After Effects", status: isVi ? "PONG (KẾT NỐI TỐT)" : "PONG (CONNECTED)" });
    } else {
      console.log(`${c.warn} Live Ping After Effects: ${rawPing}`);
      summary.push({ item: "Live Ping After Effects", status: isVi ? "CHƯA PHẢN HỒI" : "NO RESPONSE" });
    }
  } catch (err) {
    console.log(`${c.warn} Live Ping After Effects: ${err.message}`);
    summary.push({ item: "Live Ping After Effects", status: "TIMEOUT / ERROR" });
  }
} else {
  console.log(`${c.info} Live Ping After Effects: ${colors.gray}${isVi ? "Bỏ qua (Do After Effects chưa mở trên máy)" : "Skipped (After Effects is not open)"}${colors.reset}`);
  summary.push({ item: "Live Ping After Effects", status: isVi ? "BỎ QUA (Cần mở AE)" : "SKIPPED (Open AE)" });
}

// 11. Hiển thị bảng tổng kết
console.log("\n" + "-".repeat(65));
console.log(`${colors.bold}  ${isVi ? "TỔNG KẾT TRẠNG THÁI HỆ THỐNG" : "SYSTEM STATUS SUMMARY"}${colors.reset}`);
console.log("-".repeat(65));
for (const s of summary) {
  const dotCount = Math.max(2, 45 - s.item.length);
  const dots = colors.gray + ".".repeat(dotCount) + colors.reset;
  const statusColor = s.status.startsWith("OK") || s.status.includes("ĐANG MỞ") || s.status.includes("CONNECTED") || s.status.includes("RUNNING")
    ? colors.green
    : s.status.includes("CẦN") || s.status.includes("CHƯA") || s.status.includes("ACTION") || s.status.includes("DISABLED") || s.status.includes("NOT")
    ? colors.yellow
    : colors.cyan;
  console.log(`  ${s.item} ${dots} ${statusColor}${colors.bold}${s.status}${colors.reset}`);
}
console.log("-".repeat(65));

// 12. Hướng dẫn cấu hình thủ công nếu cần
console.log(`\n${colors.cyan}${colors.bold}📋 ${isVi ? "Đoạn mã cấu hình MCP Server cho Client:" : "Client MCP Server Configuration snippet:"}${colors.reset}`);
console.log(colors.gray + JSON.stringify(mcpConfig, null, 2) + colors.reset);

console.log("\n" + "=".repeat(65));
if (isAERunning && scriptingPermStatus === "ENABLED" && allPassed) {
  console.log(`${colors.green}${colors.bold}${isVi ? "🎉 MỌI THỨ ĐÃ SẴN SÀNG! Bạn có thể bắt đầu sử dụng MCP với After Effects ngay bây giờ." : "🎉 ALL SYSTEMS READY! You can now use After Effects MCP directly."}${colors.reset}`);
} else {
  console.log(`${colors.yellow}${colors.bold}${isVi ? "👉 HƯỚNG DẪN BỔ SUNG & LÀM LẠI:" : "👉 ACTION ITEMS & TROUBLESHOOTING:"}${colors.reset}`);
  let step = 1;
  if (detectedAE.length === 0) {
    console.log(`  ${step++}. ${isVi ? "Cài đặt phần mềm Adobe After Effects (2020 đến 2025+) nếu máy chưa có." : "Install Adobe After Effects (2020 to 2025+) if not yet installed."}`);
  }
  if (!isAERunning) {
    console.log(`  ${step++}. ${isVi ? "Mở phần mềm Adobe After Effects trên máy." : "Launch Adobe After Effects on your computer."}`);
  }
  if (scriptingPermStatus !== "ENABLED") {
    console.log(`  ${step++}. ${isVi ? "Trong After Effects: Vào Edit > Preferences > Scripting & Expressions" : "In After Effects: Go to Edit > Preferences > Scripting & Expressions"}`);
    console.log(`     -> ${isVi ? "Tích chọn: 'Allow Scripts to Write Files and Access Network' rồi khởi động lại AE." : "Check: 'Allow Scripts to Write Files and Access Network' and restart AE."}`);
  }
  console.log(`  ${step++}. ${isVi ? "Khởi động lại ứng dụng Claude Desktop hoặc Cursor để nạp cấu hình MCP." : "Restart Claude Desktop or Cursor to reload MCP server configuration."}`);
  console.log(`\n${colors.cyan}${colors.bold}  🔄 ${isVi ? "SAU ĐÓ: Hãy chạy lại file setup.cmd để hệ thống kiểm tra xác nhận lại 100%!" : "THEN: Run setup.cmd again to verify everything 100%!"}${colors.reset}`);
}
console.log("=".repeat(65) + "\n");
