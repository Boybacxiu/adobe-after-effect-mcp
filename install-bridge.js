import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isMac = process.platform === "darwin";
const isWindows = process.platform === "win32";

const years = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];
const pf = process.env.ProgramFiles || "C:\\Program Files";

const possibleAppPaths = isMac
  ? years.map((y) => `/Applications/Adobe After Effects ${y}`)
  : [
      ...years.map((y) => path.join(pf, "Adobe", `Adobe After Effects ${y}`)),
      ...(pf !== "C:\\Program Files" ? years.map((y) => `C:\\Program Files\\Adobe\\Adobe After Effects ${y}`) : []),
    ];

const sourceScript = path.join(__dirname, "build", "scripts", "mcp-bridge-auto.jsx");
const runnerSource = path.join(__dirname, "build", "scripts", "cli-runner.jsx");

function collectStartupDestinations() {
  const destinations = [];
  const cleanupPanels = [];

  // 1. Per-User AppData Destinations (Windows)
  if (isWindows && process.env.APPDATA) {
    const aeRoot = path.join(process.env.APPDATA, "Adobe", "After Effects");
    if (fs.existsSync(aeRoot)) {
      for (const versionDir of fs.readdirSync(aeRoot)) {
        if (versionDir === "Logs") continue;
        const versionRoot = path.join(aeRoot, versionDir);
        if (fs.statSync(versionRoot).isDirectory()) {
          const startupDir = path.join(versionRoot, "Scripts", "Startup");
          destinations.push(path.join(startupDir, "mcp-bridge-auto.jsx"));

          // Old ScriptUI panel to clean up
          const oldPanel = path.join(versionRoot, "Scripts", "ScriptUI Panels", "mcp-bridge-auto.jsx");
          if (fs.existsSync(oldPanel)) {
            cleanupPanels.push(oldPanel);
          }
        }
      }
    }
  }

  // 2. Program Files / System Application Destinations (Startup)
  for (const appPath of possibleAppPaths) {
    if (fs.existsSync(appPath)) {
      if (isMac) {
        destinations.push(path.join(appPath, "Scripts", "Startup", "mcp-bridge-auto.jsx"));
        const oldPanel = path.join(appPath, "Scripts", "ScriptUI Panels", "mcp-bridge-auto.jsx");
        if (fs.existsSync(oldPanel)) cleanupPanels.push(oldPanel);
      } else {
        const supportStartup = path.join(appPath, "Support Files", "Scripts", "Startup");
        destinations.push(path.join(supportStartup, "mcp-bridge-auto.jsx"));

        const oldPanel = path.join(appPath, "Support Files", "Scripts", "ScriptUI Panels", "mcp-bridge-auto.jsx");
        if (fs.existsSync(oldPanel)) cleanupPanels.push(oldPanel);
      }
    }
  }

  const unique = [];
  const seen = new Set();
  for (const d of destinations) {
    if (!seen.has(d)) {
      unique.push(d);
      seen.add(d);
    }
  }
  return { destinations: unique, cleanupPanels };
}

function copyDirect(destinationScript) {
  const destinationFolder = path.dirname(destinationScript);
  if (!fs.existsSync(destinationFolder)) {
    fs.mkdirSync(destinationFolder, { recursive: true });
  }
  fs.copyFileSync(sourceScript, destinationScript);
  if (fs.existsSync(runnerSource)) {
    const runnerDest = path.join(destinationFolder, "cli-runner.jsx");
    fs.copyFileSync(runnerSource, runnerDest);
  }
}

function copyElevatedWindows(destinationScript) {
  const psSingleQuote = (s) => `'${String(s).replace(/'/g, "''")}'`;
  const destinationFolder = path.dirname(destinationScript);
  const runnerDest = path.join(destinationFolder, "cli-runner.jsx");
  let inner =
    `New-Item -ItemType Directory -Path ${psSingleQuote(destinationFolder)} -Force | Out-Null; ` +
    `Copy-Item -LiteralPath ${psSingleQuote(sourceScript)} -Destination ${psSingleQuote(destinationScript)} -Force; `;
  if (fs.existsSync(runnerSource)) {
    inner += `Copy-Item -LiteralPath ${psSingleQuote(runnerSource)} -Destination ${psSingleQuote(runnerDest)} -Force; `;
  }
  const innerEncoded = Buffer.from(inner, "utf16le").toString("base64");
  const launcher = `Start-Process -FilePath powershell -Verb RunAs -Wait -ArgumentList @('-NoProfile','-EncodedCommand','${innerEncoded}')`;
  const launcherEncoded = Buffer.from(launcher, "utf16le").toString("base64");
  execSync(`powershell -NoProfile -EncodedCommand ${launcherEncoded}`, { stdio: "inherit" });
}

if (!fs.existsSync(sourceScript)) {
  console.error(`Error: Source script not found at ${sourceScript}`);
  console.error('Please run "npm run build" first to generate the script.');
  process.exit(1);
}

try {
  const { destinations, cleanupPanels } = collectStartupDestinations();
  if (destinations.length === 0) {
    throw new Error("No destination Startup paths found for After Effects.");
  }

  // 1. Clean up obsolete UI panel scripts
  for (const oldPanel of cleanupPanels) {
    try {
      fs.unlinkSync(oldPanel);
      console.log(`Cleaned up obsolete UI Panel script: ${oldPanel}`);
    } catch {
      // Ignore if permission denied
    }
  }

  // 2. Install to Startup folders
  const installed = [];
  const failed = [];

  for (const destinationScript of destinations) {
    try {
      console.log(`Installing background listener to: ${destinationScript}`);
      try {
        copyDirect(destinationScript);
      } catch (directError) {
        if (isMac) {
          execSync(`sudo cp "${sourceScript}" "${destinationScript}"`, { stdio: "inherit" });
        } else if (destinationScript.toLowerCase().indexOf("program files") !== -1) {
          // Attempt elevated copy for Program Files
          try {
            copyElevatedWindows(destinationScript);
          } catch {
            throw directError;
          }
        } else {
          throw directError;
        }
      }
      installed.push(destinationScript);
    } catch (copyError) {
      failed.push({ destinationScript, error: copyError.message });
    }
  }

  if (installed.length === 0) {
    throw new Error(`Failed to install to any destination. Error: ${failed[0]?.error}`);
  }

  console.log("\n========================================================");
  console.log("  MCP Background Listener installed successfully!");
  console.log("========================================================");
  console.log("Installed to Startup location(s):");
  for (const target of installed) {
    console.log(`  - ${target}`);
  }

  if (failed.length > 0) {
    console.log("\nNotes for administrator paths:");
    for (const f of failed) {
      console.log(`  - ${f.destinationScript} (${f.error})`);
    }
    console.log("  (As long as at least one user Startup folder succeeded, background listening works automatically!)");
  }

  console.log("\nNext Steps:");
  console.log("1. Mở After Effects.");
  console.log("2. Vào menu Edit > Preferences > Scripting & Expressions (hoặc After Effects > Settings trên macOS).");
  console.log('3. Đảm bảo đã tích chọn: "Allow Scripts to Write Files and Access Network".');
  console.log("4. Khởi động lại After Effects (nếu đang mở).");
  console.log("\n-> After Effects sẽ tự động kích hoạt Background Listener khi khởi động.");
  console.log("-> KHÔNG CẦN mở bất kỳ cửa sổ Window hay Panel thủ công nào!");
} catch (error) {
  console.error(`\nError installing script: ${error.message}`);
  console.error("\nHướng dẫn cài đặt thủ công vào thư mục Startup:");
  console.error(`1. Sao chép tệp: ${sourceScript}`);
  console.error(
    "2. Dán vào thư mục Startup của After Effects:",
  );
  if (isWindows) {
    console.error("   %APPDATA%\\Adobe\\After Effects\\<Version>\\Scripts\\Startup\\");
    console.error("   hoặc C:\\Program Files\\Adobe\\Adobe After Effects <Version>\\Support Files\\Scripts\\Startup\\");
  } else {
    console.error("   /Applications/Adobe After Effects <Version>/Scripts/Startup/");
  }
  process.exit(1);
}
