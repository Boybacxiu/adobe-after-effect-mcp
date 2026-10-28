import { exec, execSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { fileURLToPath } from "url";
import {
  atomicWriteSync,
  makeCommandIdFactory,
  nextPollDelay,
  POLL_START_MS,
  resolveBridgeDir,
} from "../lib/bridge-core.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SCRIPTS_DIR = path.resolve(__dirname, "..", "scripts");
export const TEMP_DIR = path.resolve(__dirname, "..", "temp");
export const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
export const PLUGINS_DIR = path.resolve(PROJECT_ROOT, "plugins");
export const DUIK_DIR = path.resolve(PLUGINS_DIR, "Duik-Angela");

export const nextCommandId = makeCommandIdFactory();
let lastCommandId = "";

/**
 * Get the project root directory.
 */
export function getProjectRootDir(): string {
  return PROJECT_ROOT;
}

/**
 * Get the Duik Angela plugin root directory.
 */
export function getDuikDir(): string {
  return DUIK_DIR;
}

/**
 * Resolve a relative path inside the Duik-Angela plugin folder to an absolute path for ExtendScript.
 * Example: resolveDuikScriptPath("Scripts/Duik_addNull.jsx")
 */
export function resolveDuikScriptPath(relativePath: string): string {
  const clean = relativePath.replace(/^[\\/]?plugins[\\/]Duik-Angela[\\/]/i, "").replace(/^[\\/]/, "");
  return path.resolve(DUIK_DIR, clean);
}

/**
 * Get the shared directory for AE bridge communication.
 * Deterministic default on Windows is LOCALAPPDATA/ae-mcp-bridge (not affected by OneDrive).
 */
export function getAETempDir(): string {
  const bridgeDir = resolveBridgeDir(process.platform, process.env, os.homedir());
  if (!fs.existsSync(bridgeDir)) {
    fs.mkdirSync(bridgeDir, { recursive: true });
  }
  return bridgeDir;
}

/**
 * Automatically sweep stale temporary files (PNG frames, aerender logs, .tmp files)
 * older than maxAgeMs (default: 15 minutes) from the bridge temp directory.
 */
export function sweepStaleTempFiles(maxAgeMs: number = 15 * 60 * 1000): void {
  try {
    const dir = getAETempDir();
    if (!fs.existsSync(dir)) return;
    const now = Date.now();
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (
        file.startsWith("__mcp_") ||
        file.startsWith("aerender-") ||
        file.endsWith(".tmp") ||
        file.endsWith("_test_out.txt") ||
        file === "verify_out.txt"
      ) {
        const filePath = path.join(dir, file);
        try {
          const stat = fs.statSync(filePath);
          if (now - stat.mtimeMs > maxAgeMs) {
            fs.unlinkSync(filePath);
          }
        } catch {
          /* ignore file in use */
        }
      }
    }
  } catch {
    /* ignore sweep error */
  }
}

/**
 * Get the scripts directory where ExtendScript (.jsx) files reside.
 */
export function getScriptsDir(): string {
  return SCRIPTS_DIR;
}

/**
 * Locate AfterFX.exe automatically across common installation paths or PATH.
 * Comprehensive multi-version discovery covering Adobe After Effects 2020 through 2025+.
 */
export function findAfterFxPath(): string | null {
  if (process.env.AFTERFX_PATH && fs.existsSync(process.env.AFTERFX_PATH)) {
    return process.env.AFTERFX_PATH;
  }
  const years = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];
  const commonPaths: string[] = [];

  if (process.platform === "win32") {
    const pf = process.env.ProgramFiles || "C:\\Program Files";
    for (const y of years) {
      commonPaths.push(path.join(pf, "Adobe", `Adobe After Effects ${y}`, "Support Files", "AfterFX.exe"));
      if (pf !== "C:\\Program Files") {
        commonPaths.push(`C:\\Program Files\\Adobe\\Adobe After Effects ${y}\\Support Files\\AfterFX.exe`);
      }
    }
  } else if (process.platform === "darwin") {
    for (const y of years) {
      commonPaths.push(`/Applications/Adobe After Effects ${y}/Adobe After Effects ${y}.app/Contents/MacOS/After Effects`);
      commonPaths.push(`/Applications/Adobe After Effects ${y}/After Effects`);
    }
  }

  for (const p of commonPaths) {
    if (fs.existsSync(p)) return p;
  }
  try {
    const cmd = process.platform === "win32" ? "where.exe afterfx.exe 2>nul" : "which afterfx 2>/dev/null";
    const whereOutput = execSync(cmd, { encoding: "utf-8" }).trim();
    if (whereOutput && fs.existsSync(whereOutput)) return whereOutput;
  } catch {
    /* ignore */
  }
  return null;
}

let _lastAfterFxCheckTime = 0;
let _lastAfterFxRunning = false;
const PROCESS_CHECK_CACHE_MS = 2000;

/**
 * Check if the Adobe After Effects process is currently running.
 * Results are cached for 2 seconds to avoid running tasklist.exe repeatedly.
 */
export function isAfterFxRunning(forceRefresh = false): boolean {
  const now = Date.now();
  if (!forceRefresh && now - _lastAfterFxCheckTime < PROCESS_CHECK_CACHE_MS) {
    return _lastAfterFxRunning;
  }
  _lastAfterFxCheckTime = now;
  try {
    if (process.platform === "win32") {
      const out = execSync('tasklist /FI "IMAGENAME eq AfterFX.exe" /NH', {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      _lastAfterFxRunning = out.toLowerCase().includes("afterfx.exe");
    } else if (process.platform === "darwin") {
      const out = execSync('pgrep -i "After Effects"', {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      _lastAfterFxRunning = out.trim().length > 0;
    } else {
      _lastAfterFxRunning = true;
    }
    return _lastAfterFxRunning;
  } catch {
    _lastAfterFxRunning = true;
    return true;
  }
}

/**
 * Trigger headless CLI execution via afterfx.exe -r as a fallback runner.
 */
export function triggerCliExecution(): void {
  const afterFxPath = findAfterFxPath();
  if (!afterFxPath) return;

  const runnerPath = path.join(SCRIPTS_DIR, "cli-runner.jsx");
  if (!fs.existsSync(runnerPath)) return;

  try {
    exec(`"${afterFxPath}" -r "${runnerPath}"`, { windowsHide: true }, (err) => {
      if (err) {
        console.error("CLI trigger note:", err.message);
      }
    });
  } catch (e) {
    console.error("Failed to trigger CLI execution:", e);
  }
}

export function writeCommandFile(
  command: string,
  args: Record<string, any> = {},
  timeoutMs: number = 7000,
): string {
  try {
    const commandFile = path.join(getAETempDir(), "ae_command.json");
    const commandId = nextCommandId();
    lastCommandId = commandId;
    const commandData = {
      command,
      args,
      commandId,
      timestamp: new Date().toISOString(),
      expiresAt: Date.now() + timeoutMs + 1000,
      status: "pending",
    };
    atomicWriteSync(commandFile, JSON.stringify(commandData, null, 2));
    console.error(`Command "${command}" (${commandId}) written to ${commandFile}`);
    return commandId;
  } catch (error) {
    console.error("Error writing command file:", error);
    return "";
  }
}

export function clearResultsFile(): void {
  try {
    const resultFile = path.join(getAETempDir(), "ae_mcp_result.json");
    const resetData = {
      status: "waiting",
      message: "Waiting for new result from After Effects...",
      timestamp: new Date().toISOString(),
    };
    atomicWriteSync(resultFile, JSON.stringify(resetData, null, 2));
    console.error(`Results file cleared at ${resultFile}`);
  } catch (error) {
    console.error("Error clearing results file:", error);
  }
}

export async function waitForBridgeResult(
  expectedCommand?: string,
  timeoutMs: number = 7000,
  pollMs: number = 80,
  expectedId?: string,
): Promise<string> {
  const start = Date.now();
  const resultPath = path.join(getAETempDir(), "ae_mcp_result.json");
  let lastSize = -1;
  let delay = Math.min(20, pollMs);
  const idToMatch = expectedId || lastCommandId || "";

  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(resultPath)) {
      try {
        const content = fs.readFileSync(resultPath, "utf8");
        if (content && content.length > 0) {
          try {
            const parsed = JSON.parse(content);
            if (idToMatch && parsed._commandId !== undefined) {
              if (parsed._commandId === idToMatch) {
                return content;
              }
            } else if (content.length !== lastSize) {
              lastSize = content.length;
              if (
                parsed.status !== "waiting" &&
                (!expectedCommand || parsed._commandExecuted === expectedCommand)
              ) {
                return content;
              }
            }
          } catch {
            /* partial JSON: keep polling */
          }
        }
      } catch {
        /* unreadable: keep polling */
      }
    }
    await new Promise((r) => setTimeout(r, delay));
    delay = nextPollDelay(delay, pollMs);
  }

  const aeAlive = isAfterFxRunning(true);
  return JSON.stringify({
    status: "error",
    error: `Quá thời gian chờ phản hồi (Timeout) cho lệnh '${expectedCommand || "unknown"}'`,
    detail: aeAlive
      ? "Tiến trình After Effects đang chạy nhưng Background Listener không phản hồi kết quả trong khoảng thời gian quy định."
      : "Tiến trình After Effects (AfterFX.exe) chưa được mở hoặc đã bị đóng.",
    troubleshooting: aeAlive
      ? [
          "Kiểm tra xem After Effects có đang mở hộp thoại modal cảnh báo nào chặn script không.",
          "Đảm bảo tùy chọn 'Allow Scripts to Write Files and Access Network' đã được bật trong Edit > Preferences > Scripting & Expressions.",
          "Xác nhận file 'mcp-bridge-auto.jsx' đã được đặt trong thư mục Startup và After Effects đã được khởi động lại."
        ]
      : [
          "Vui lòng khởi động phần mềm Adobe After Effects trên máy của bạn.",
          "Chờ After Effects khởi động xong để Background Listener tự động kích hoạt."
        ],
    _commandExecuted: expectedCommand,
    _commandId: idToMatch,
  });
}

let _bridgeTail: Promise<unknown> = Promise.resolve();
function bridgeMutex<T>(fn: () => Promise<T>): Promise<T> {
  const run = _bridgeTail.then(fn, fn);
  _bridgeTail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

/**
 * Execute command against After Effects via the background bridge file mechanism.
 */
export async function sendBridgeCommand(
  command: string,
  args: Record<string, any> = {},
  timeoutMs: number = 7000,
  pollMs: number = 80,
): Promise<string> {
  return bridgeMutex(async () => {
    // 1. Pre-flight check: Is After Effects currently running?
    if (!isAfterFxRunning()) {
      return JSON.stringify({
        status: "error",
        error: "Adobe After Effects chưa được mở",
        detail: "Không tìm thấy tiến trình AfterFX.exe đang hoạt động trên hệ thống.",
        troubleshooting: [
          "Vui lòng mở phần mềm Adobe After Effects trên máy của bạn trước khi thực hiện các tác vụ điều khiển.",
          "Sau khi After Effects mở xong, Background Listener ('mcp-bridge-auto.jsx' trong thư mục Startup) sẽ tự động nạp và sẵn sàng nhận lệnh."
        ],
        _commandExecuted: command,
      });
    }

    const id = writeCommandFile(command, args, timeoutMs);
    if (!id) {
      return JSON.stringify({
        status: "error",
        error: `Không thể ghi tệp lệnh '${command}' vào thư mục bridge.`,
        detail: "Lỗi ghi tệp ae_command.json tại thư mục tạm của hệ thống.",
      });
    }

    const res = await waitForBridgeResult(command, timeoutMs, pollMs, id);
    return res;
  });
}

/**
 * Execute ExtendScript code in After Effects via the bridge file mechanism.
 * Automatically injects Duik Angela and Project Root environment variables.
 */
export async function executeExtendScript(
  script: string,
  timeoutMs: number = 30000,
  undoName?: string,
): Promise<string> {
  const duikNormalized = DUIK_DIR.replace(/\\/g, "/");
  const projectRootNormalized = PROJECT_ROOT.replace(/\\/g, "/");

  // Auto-resolve relative Duik paths written as "plugins/Duik-Angela/..."
  const resolvedScript = script.replace(/plugins\/Duik-Angela\//g, `${duikNormalized}/`);

  const preamble = `
var PROJECT_ROOT = "${projectRootNormalized}";
var DUIK_DIR = "${duikNormalized}";
if (typeof $.global !== "undefined") {
    $.global.PROJECT_ROOT = PROJECT_ROOT;
    $.global.DUIK_DIR = DUIK_DIR;
    if (!$.global.duikFile) {
        $.global.duikFile = function(rel) {
            var clean = (rel || "").replace(/^plugins[\\\\\\/]Duik-Angela[\\\\\\/]/i, "").replace(/^[\\\\\\/]/, "");
            return new File($.global.DUIK_DIR + "/" + clean);
        };
    }
    if (!$.global.evalDuik) {
        $.global.evalDuik = function(rel) {
            var f = $.global.duikFile(rel);
            if (f.exists) { return $.evalFile(f); }
            else { throw new Error("Duik script not found: " + f.fsName); }
        };
    }
}
`;

  return sendBridgeCommand(
    "executeScript",
    {
      script: preamble + resolvedScript,
      undoName,
      duikDir: duikNormalized,
      projectRoot: projectRootNormalized,
    },
    timeoutMs,
    250,
  );
}

