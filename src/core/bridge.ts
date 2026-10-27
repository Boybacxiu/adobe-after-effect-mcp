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

export const nextCommandId = makeCommandIdFactory();
let lastCommandId = "";

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
 * Get the scripts directory where ExtendScript (.jsx) files reside.
 */
export function getScriptsDir(): string {
  return SCRIPTS_DIR;
}

/**
 * Locate AfterFX.exe automatically across common installation paths or PATH.
 */
export function findAfterFxPath(): string | null {
  if (process.env.AFTERFX_PATH && fs.existsSync(process.env.AFTERFX_PATH)) {
    return process.env.AFTERFX_PATH;
  }
  const commonPaths = [
    "C:\\Program Files\\Adobe\\Adobe After Effects 2026\\Support Files\\AfterFX.exe",
    "C:\\Program Files\\Adobe\\Adobe After Effects 2025\\Support Files\\AfterFX.exe",
    "C:\\Program Files\\Adobe\\Adobe After Effects 2024\\Support Files\\AfterFX.exe",
    "C:\\Program Files\\Adobe\\Adobe After Effects 2023\\Support Files\\AfterFX.exe",
    "C:\\Program Files\\Adobe\\Adobe After Effects 2022\\Support Files\\AfterFX.exe",
  ];
  for (const p of commonPaths) {
    if (fs.existsSync(p)) return p;
  }
  try {
    const whereOutput = execSync("where.exe afterfx.exe 2>nul", { encoding: "utf-8" }).trim();
    if (whereOutput && fs.existsSync(whereOutput)) return whereOutput;
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Check if the Adobe After Effects process is currently running.
 */
export function isAfterFxRunning(): boolean {
  try {
    if (process.platform === "win32") {
      const out = execSync('tasklist /FI "IMAGENAME eq AfterFX.exe" /NH', {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      return out.toLowerCase().includes("afterfx.exe");
    } else if (process.platform === "darwin") {
      const out = execSync('pgrep -i "After Effects"', {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      return out.trim().length > 0;
    }
    return true;
  } catch {
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

export function writeCommandFile(command: string, args: Record<string, any> = {}): string {
  try {
    const commandFile = path.join(getAETempDir(), "ae_command.json");
    const commandId = nextCommandId();
    lastCommandId = commandId;
    const commandData = {
      command,
      args,
      commandId,
      timestamp: new Date().toISOString(),
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
  pollMs: number = 250,
  expectedId?: string,
): Promise<string> {
  const start = Date.now();
  const resultPath = path.join(getAETempDir(), "ae_mcp_result.json");
  let lastSize = -1;
  let delay = Math.min(POLL_START_MS, pollMs);
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

  const aeAlive = isAfterFxRunning();
  return JSON.stringify({
    status: "error",
    error: `Quá thời gian chờ phản hồi (Timeout) cho lệnh '${expectedCommand || "unknown"}'`,
    detail: aeAlive
      ? "Tiến trình After Effects đang chạy nhưng Background Listener không phản hồi kết quả trong khoảng thời gian quy định."
      : "Tiến trình After Effects (AfterFX.exe) đã bị đóng hoặc không còn chạy.",
    troubleshooting: aeAlive
      ? [
          "Kiểm tra xem After Effects có đang mở hộp thoại modal cảnh báo nào chặn script không.",
          "Đảm bảo tùy chọn 'Allow Scripts to Write Files and Access Network' đã được bật trong Edit > Preferences > Scripting & Expressions.",
          "Xác nhận file 'mcp-bridge-auto.jsx' đã được đặt trong thư mục Startup và After Effects đã được khởi động lại."
        ]
      : [
          "Khởi động lại phần mềm Adobe After Effects.",
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
  pollMs: number = 250,
): Promise<string> {
  return bridgeMutex(async () => {
    // 1. Pre-flight check: Is After Effects currently running?
    if (!isAfterFxRunning()) {
      return JSON.stringify({
        status: "error",
        error: "After Effects chưa được khởi chạy",
        detail: "Không tìm thấy tiến trình AfterFX.exe đang hoạt động trên hệ thống.",
        troubleshooting: [
          "Hãy mở Adobe After Effects trước khi thực thi các tool điều khiển.",
          "Background Listener ('mcp-bridge-auto.jsx' trong thư mục Startup) sẽ tự động nạp khi After Effects khởi động."
        ],
        _commandExecuted: command,
      });
    }

    clearResultsFile();
    const id = writeCommandFile(command, args);
    if (!id) {
      return JSON.stringify({
        status: "error",
        error: `Không thể ghi tệp lệnh '${command}' vào thư mục bridge.`,
        detail: "Lỗi ghi tệp ae_command.json tại thư mục tạm của hệ thống.",
      });
    }

    return waitForBridgeResult(command, timeoutMs, pollMs, id);
  });
}

/**
 * Execute ExtendScript code in After Effects via the bridge file mechanism.
 */
export async function executeExtendScript(
  script: string,
  timeoutMs: number = 30000,
  undoName?: string,
): Promise<string> {
  return sendBridgeCommand("executeScript", { script, undoName }, timeoutMs, 250);
}

