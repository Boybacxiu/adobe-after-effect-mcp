import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { registerAllTools } from "../build/tools/index.js";

async function verifyAll() {
  console.log("=== [1/4] Verifying 169 MCP Tools in build/tools/index.js ===");
  const registered = [];
  const mockServer = {
    tool: (name, description, schema, handler) => {
      registered.push({ name, description });
    },
  };
  registerAllTools(mockServer);
  console.log(`Registered tools count: ${registered.length}`);
  const uniqueNames = new Set(registered.map((t) => t.name));
  if (registered.length !== 169 || uniqueNames.size !== 169) {
    throw new Error(
      `Tool count mismatch: registered ${registered.length}, unique ${uniqueNames.size}, expected 169.`
    );
  }
  console.log("✓ Exact 169 unique tools verified without duplicates.");

  console.log("\n=== [2/4] Verifying setLayerExpression & AI Overlay Bindings ===");
  const bridgeJsx = fs.readFileSync("src/scripts/mcp-bridge-auto.jsx", "utf8");
  if (!bridgeJsx.includes("function setLayerExpression(")) {
    throw new Error("setLayerExpression function definition missing in mcp-bridge-auto.jsx");
  }
  if (!bridgeJsx.includes("globalScope.setLayerExpression = setLayerExpression")) {
    throw new Error("globalScope.setLayerExpression export missing in mcp-bridge-auto.jsx");
  }
  if (!bridgeJsx.includes("function setAiOverlay(") || !bridgeJsx.includes("globalScope.setAiOverlay = setAiOverlay")) {
    throw new Error("setAiOverlay AI HUD overlay definition/export missing in mcp-bridge-auto.jsx");
  }
  const exprGen = fs.readFileSync("src/lib/generators/expressionGenerators.ts", "utf8");
  if (!exprGen.includes("generateSetLayerExpression")) {
    throw new Error("generateSetLayerExpression alias missing in expressionGenerators.ts");
  }
  console.log("✓ setLayerExpression and setAiOverlay bindings verified in .jsx and .ts.");

  console.log("\n=== [3/4] Verifying 16 Active SKILL.md Files and Independent Rules ===");
  const expectedSkills = [
    "ae-3d-cinematic-camera",
    "ae-asset-interchange",
    "ae-audio-reactive",
    "ae-color-management",
    "ae-design-scripting",
    "ae-expression-math",
    "ae-keyframe-easing",
    "ae-kinetic-caption-reels",
    "ae-logo-reveal-pro",
    "ae-magic-fire-burn",
    "ae-mogrt-essential-graphics",
    "ae-render-pipeline",
    "ae-shape-operators",
    "ae-text-animation",
    "ae-video-tutorial-parser",
    "ae-visual-feedback",
  ];
  for (const skill of expectedSkills) {
    const p = path.join(".agent/skills", skill, "SKILL.md");
    if (!fs.existsSync(p)) {
      throw new Error(`Missing skill file: ${p}`);
    }
  }
  if (!fs.existsSync("AGENTS.md")) {
    throw new Error("Missing unified rule file: AGENTS.md");
  }
  if (fs.existsSync("GEMINI.md")) {
    throw new Error("GEMINI.md must be removed in favor of AGENTS.md");
  }
  if (!fs.existsSync(".agent/skills-disabled/ae-character-rigging/SKILL.md")) {
    throw new Error("Hidden Duik skill missing at .agent/skills-disabled/ae-character-rigging/SKILL.md");
  }
  // Verify MCP resource registrations in built index
  const builtIndex = fs.readFileSync("build/index.js", "utf8");
  if (!builtIndex.includes("ae://rules/project-standards")) {
    throw new Error("MCP resource ae://rules/project-standards missing from build/index.js");
  }
  if (!builtIndex.includes("ae://rules/all")) {
    throw new Error("MCP resource ae://rules/all missing from build/index.js");
  }
  if (builtIndex.includes("GEMINI.md")) {
    throw new Error("build/index.js still references a legacy platform-specific instructions file");
  }
  console.log("✓ All 16 active SKILL.md files, hidden Duik skill, independent rules, ae://rules/* resources verified.");

  console.log("\n=== [4/4] Verifying build/index.js Clean Execution ===");
  await new Promise((resolve, reject) => {
    const child = spawn("node", ["./build/index.js"], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    setTimeout(() => {
      child.kill("SIGTERM");
      if (stderr.includes("Error") || stderr.includes("Cannot find module")) {
        reject(new Error(`build/index.js logged errors: ${stderr}`));
      } else {
        console.log("✓ build/index.js started and imported cleanly without errors.");
        resolve();
      }
    }, 1500);
  });

  console.log("\n==========================================");
  console.log("🎉 ALL SYSTEM VERIFICATIONS PASSED (EXIT CODE 0)");
  console.log("==========================================");
}

verifyAll().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
