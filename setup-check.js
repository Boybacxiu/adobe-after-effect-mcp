import { execSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

console.log("\n" + "=".repeat(65));
console.log(`${colors.cyan}${colors.bold}  ADOBE AFTER EFFECTS MCP - KIỂM TRA HỆ THỐNG & KẾT NỐI${colors.reset}`);
console.log("=".repeat(65) + "\n");

let allPassed = true;
const summary = [];

// 1. Kiểm tra Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0], 10);
if (majorVersion >= 18) {
  console.log(`${c.ok} Node.js: ${colors.bold}${nodeVersion}${colors.reset} (Hợp lệ >= 18.0.0)`);
  summary.push({ item: "Node.js (>= 18.0.0)", status: "OK" });
} else {
  console.log(`${c.err} Node.js: ${colors.bold}${nodeVersion}${colors.reset} (Yêu cầu phiên bản >= 18.0.0)`);
  allPassed = false;
  summary.push({ item: "Node.js (>= 18.0.0)", status: "FAILED" });
}

// 2. Kiểm tra bản build dự án
const buildIndexPath = path.join(__dirname, "build", "index.js");
const buildScriptPath = path.join(__dirname, "build", "scripts", "mcp-bridge-auto.jsx");
const normalizedIndexPath = buildIndexPath.replace(/\\/g, "/");

if (fs.existsSync(buildIndexPath) && fs.existsSync(buildScriptPath)) {
  console.log(`${c.ok} Bản build MCP Server: ${colors.green}Đã sẵn sàng (build/index.js)${colors.reset}`);
  summary.push({ item: "Bản build MCP Server", status: "OK" });
} else {
  console.log(`${c.warn} Bản build MCP Server: ${colors.yellow}Chưa build hoặc thiếu file. Đang tự động build...${colors.reset}`);
  try {
    execSync("npm run build", { cwd: __dirname, stdio: "inherit" });
    console.log(`${c.ok} Bản build MCP Server: Đã build thành công.`);
    summary.push({ item: "Bản build MCP Server", status: "OK" });
  } catch (err) {
    console.log(`${c.err} Build thất bại: ${err.message}`);
    allPassed = false;
    summary.push({ item: "Bản build MCP Server", status: "FAILED" });
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
  console.log(`${c.ok} After Effects phát hiện: ${colors.bold}${detectedAE.length} phiên bản${colors.reset}`);
  for (const ae of detectedAE) {
    console.log(`    - ${ae}`);
  }
  summary.push({ item: "Adobe After Effects cài đặt", status: "OK" });
} else {
  console.log(`${c.warn} Không tìm thấy thư mục cài đặt After Effects tiêu chuẩn (2020-2026).`);
  console.log(`    Nếu bạn cài đặt ở đường dẫn tùy chỉnh, MCP vẫn có thể hoạt động nếu AfterFX.exe đã được bật.`);
  summary.push({ item: "Adobe After Effects cài đặt", status: "CUSTOM/NOT FOUND" });
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
  console.log(`${c.ok} Trạng thái After Effects: ${colors.green}${colors.bold}ĐANG CHẠY${colors.reset}`);
  summary.push({ item: "Tiến trình After Effects", status: "ĐANG MỞ" });
} else {
  console.log(`${c.warn} Trạng thái After Effects: ${colors.yellow}${colors.bold}CHƯA MỞ${colors.reset}`);
  console.log(`    ${colors.yellow}👉 LƯU Ý: Vui lòng tự mở phần mềm Adobe After Effects trên máy trước khi yêu cầu AI kết nối/thực thi tool!${colors.reset}`);
  summary.push({ item: "Tiến trình After Effects", status: "CHƯA BẬT (Cần mở AE)" });
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
  console.log(`${c.ok} Cấp quyền Scripting: ${colors.green}${colors.bold}ĐÃ BẬT${colors.reset} ("Allow Scripts to Write Files and Access Network")`);
  for (const cp of checkedPrefs) {
    console.log(`    - AE ${cp.version}: ${cp.isAllowed ? colors.green + "Đã bật (= 1)" : colors.yellow + "Chưa bật (= 0)"}${colors.reset}`);
  }
  summary.push({ item: "Quyền Scripting & Network", status: "OK (ĐÃ BẬT)" });
} else if (scriptingPermStatus === "DISABLED") {
  console.log(`${c.err} Cấp quyền Scripting: ${colors.red}${colors.bold}CHƯA ĐƯỢC BẬT!${colors.reset}`);
  console.log(`    ${colors.red}👉 BẮT BUỘC: Vào After Effects > Edit > Preferences > Scripting & Expressions${colors.reset}`);
  console.log(`    ${colors.red}👉 Tích chọn: "Allow Scripts to Write Files and Access Network" rồi khởi động lại AE.${colors.reset}`);
  allPassed = false;
  summary.push({ item: "Quyền Scripting & Network", status: "CHƯA BẬT (CẦN TÍCH CHỌN)" });
} else {
  console.log(`${c.warn} Cấp quyền Scripting: ${colors.yellow}Chưa kiểm tra được file Prefs tự động.${colors.reset}`);
  console.log(`    Vui lòng kiểm tra thủ công trong AE: Edit > Preferences > Scripting & Expressions > Tích chọn "Allow Scripts to Write Files and Access Network".`);
  summary.push({ item: "Quyền Scripting & Network", status: "CẦN XÁC NHẬN THỦ CÔNG" });
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
  // Check Program Files
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
  console.log(`${c.ok} Background Bridge: ${colors.green}Đã cài đặt vào thư mục Startup của After Effects${colors.reset}`);
  summary.push({ item: "MCP Bridge Startup Script", status: "OK" });
} else {
  console.log(`${c.warn} Background Bridge: Chưa được copy vào thư mục Startup. Đang tiến hành cài đặt...`);
  try {
    execSync("node install-bridge.js", { cwd: __dirname, stdio: "inherit" });
    bridgeInstalled = true;
    summary.push({ item: "MCP Bridge Startup Script", status: "OK (Vừa cài đặt)" });
  } catch (err) {
    console.log(`${c.err} Cài đặt bridge thất bại: ${err.message}`);
    summary.push({ item: "MCP Bridge Startup Script", status: "FAILED" });
  }
}

// 7. Cấu hình MCP Client cho Cursor / Antigravity / Windsurf (.mcp.json)
const localMcpPath = path.join(__dirname, ".mcp.json");
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
  console.log(`${c.ok} Cấu hình Cursor / Antigravity / Windsurf: ${colors.green}File .mcp.json đã sẵn sàng${colors.reset}`);
  summary.push({ item: "Cursor / Antigravity (.mcp.json)", status: "OK" });
} catch (err) {
  console.log(`${c.warn} Không thể ghi .mcp.json: ${err.message}`);
  summary.push({ item: "Cursor / Antigravity (.mcp.json)", status: "WARN" });
}

// 8. Tự động cấu hình cho Claude Desktop
const claudeConfigDir = isWindows
  ? path.join(process.env.APPDATA || "", "Claude")
  : isMac
  ? path.join(os.homedir(), "Library", "Application Support", "Claude")
  : null;

let claudeStatus = "NOT INSTALLED";
if (claudeConfigDir) {
  const claudeConfigFile = path.join(claudeConfigDir, "claude_desktop_config.json");
  try {
    let existingConfig = { mcpServers: {} };
    if (fs.existsSync(claudeConfigFile)) {
      try {
        existingConfig = JSON.parse(fs.readFileSync(claudeConfigFile, "utf8"));
        if (!existingConfig.mcpServers) existingConfig.mcpServers = {};
      } catch {
        existingConfig = { mcpServers: {} };
      }
    } else if (!fs.existsSync(claudeConfigDir)) {
      fs.mkdirSync(claudeConfigDir, { recursive: true });
    }

    existingConfig.mcpServers["adobe-after-effects"] = {
      command: "node",
      args: [normalizedIndexPath],
    };

    fs.writeFileSync(claudeConfigFile, JSON.stringify(existingConfig, null, 2), "utf8");
    console.log(`${c.ok} Cấu hình Claude Desktop: ${colors.green}Đã tự động kết nối vào ${claudeConfigFile}${colors.reset}`);
    claudeStatus = "OK (ĐÃ CẤU HÌNH)";
  } catch (err) {
    console.log(`${c.warn} Claude Desktop: Không thể tự động ghi file cấu hình (${err.message}).`);
    claudeStatus = "CẦN CẤU HÌNH THỦ CÔNG";
  }
}
summary.push({ item: "Claude Desktop", status: claudeStatus });

// 9. Hiển thị bảng tổng kết
console.log("\n" + "-".repeat(65));
console.log(`${colors.bold}  TỔNG KẾT TRẠNG THÁI HỆ THỐNG${colors.reset}`);
console.log("-".repeat(65));
for (const s of summary) {
  const dotCount = Math.max(2, 45 - s.item.length);
  const dots = colors.gray + ".".repeat(dotCount) + colors.reset;
  const statusColor = s.status.startsWith("OK") || s.status.includes("ĐANG MỞ")
    ? colors.green
    : s.status.includes("CẦN") || s.status.includes("CHƯA")
    ? colors.yellow
    : colors.cyan;
  console.log(`  ${s.item} ${dots} ${statusColor}${colors.bold}${s.status}${colors.reset}`);
}
console.log("-".repeat(65));

// 10. Hướng dẫn cấu hình thủ công nếu cần
console.log(`\n${colors.cyan}${colors.bold}📋 Đoạn mã cấu hình MCP Server cho Client:${colors.reset}`);
console.log(colors.gray + JSON.stringify(mcpConfig, null, 2) + colors.reset);

console.log("\n" + "=".repeat(65));
if (isAERunning && scriptingPermStatus === "ENABLED" && allPassed) {
  console.log(`${colors.green}${colors.bold}🎉 MỌI THỨ ĐÃ SẴN SÀNG! Bạn có thể bắt đầu sử dụng MCP với After Effects ngay bây giờ.${colors.reset}`);
} else {
  console.log(`${colors.yellow}${colors.bold}👉 HƯỚNG DẪN BỔ SUNG & LÀM LẠI:${colors.reset}`);
  let step = 1;
  if (detectedAE.length === 0) {
    console.log(`  ${step++}. Cài đặt phần mềm Adobe After Effects (2020 đến 2025+) nếu máy chưa có.`);
  }
  if (!isAERunning) {
    console.log(`  ${step++}. Mở phần mềm Adobe After Effects trên máy.`);
  }
  if (scriptingPermStatus !== "ENABLED") {
    console.log(`  ${step++}. Trong After Effects: Vào Edit > Preferences > Scripting & Expressions`);
    console.log(`     -> Tích chọn: "Allow Scripts to Write Files and Access Network" rồi khởi động lại AE.`);
  }
  console.log(`  ${step++}. Khởi động lại ứng dụng Claude Desktop hoặc Cursor để nạp cấu hình MCP.`);
  console.log(`\n${colors.cyan}${colors.bold}  🔄 SAU ĐÓ: Hãy chạy lại file setup.cmd để hệ thống kiểm tra xác nhận lại 100%!${colors.reset}`);
}
console.log("=".repeat(65) + "\n");
