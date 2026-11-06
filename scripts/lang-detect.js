import { execSync } from "child_process";

/**
 * Detect the operating system's UI display language.
 * Strict rule:
 * - Returns "vi" ONLY when the machine's display language is Vietnamese.
 * - If the machine's display language is English (even if the region is Vietnam)
 *   or any foreign language, it returns "en".
 */
export function detectSystemLanguage() {
  // 1. Explicit CLI argument override (--lang=vi or --lang=en)
  const arg = process.argv.find((a) => a.startsWith("--lang="))?.split("=")[1]?.toLowerCase();
  if (arg === "vi" || arg === "en") return arg;

  // 2. Explicit environment variable override
  if (process.env.MCP_LANG === "vi" || process.env.MCP_LANG === "en") {
    return process.env.MCP_LANG;
  }

  // 3. Windows: Query Windows UI Display Language (not Regional Date/Time format)
  if (process.platform === "win32") {
    try {
      const regOut = execSync('reg query "HKCU\\Control Panel\\Desktop" /v PreferredUILanguages', {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      const match = regOut.match(/PreferredUILanguages\s+REG_\w+\s+([^\r\n]+)/i);
      if (match) {
        const primaryUiLang = match[1].trim().split("\0")[0].trim().toLowerCase();
        if (primaryUiLang.startsWith("vi")) {
          return "vi";
        }
        return "en";
      }
    } catch {}

    // Fallback: PowerShell Get-UICulture (checks UI language, not regional format)
    try {
      const psOut = execSync('powershell -NoProfile -Command "(Get-UICulture).Name"', {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
        timeout: 1500,
      }).trim().toLowerCase();
      if (psOut.startsWith("vi")) {
        return "vi";
      }
      return "en";
    } catch {}
  }

  // 4. macOS: Check AppleLanguages preference
  if (process.platform === "darwin") {
    try {
      const macLang = execSync("defaults read -g AppleLanguages", {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
        timeout: 1500,
      }).toLowerCase();
      const match = macLang.match(/"([a-z]{2}(?:-[a-z]{2,4})?)"/i);
      if (match) {
        if (match[1].toLowerCase().startsWith("vi")) {
          return "vi";
        }
        return "en";
      }
    } catch {}
  }

  // 5. Unix / Terminal fallback: Check UI display language environment variables
  const envLang = (process.env.LANGUAGE || process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || "").toLowerCase();
  if (envLang.startsWith("vi")) {
    return "vi";
  }

  // Default to English
  return "en";
}
