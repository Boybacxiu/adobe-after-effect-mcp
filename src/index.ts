#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getAETempDir, getScriptsDir, PROJECT_ROOT, sendBridgeCommand } from "./core/bridge.js";
import {
  registerAllTools,
  registerAliasTools,
  registerAnimationTools,
  registerAudioTools,
  registerCompositionTools,
  registerEffectTools,
  registerFootageTools,
  registerLayerTools,
  registerMaskTools,
  registerProjectTools,
  registerRenderTools,
  registerShapeTools,
  registerSystemTools,
  registerTemplateTools,
  registerThreeDTools,
  registerVisualTools,
} from "./tools/index.js";

// ─────────────────────────────────────────────────────────────────────────────
// SERVER_VERSION: 2.4.5
// PLATFORM: vendor-neutral (Antigravity / Cursor / Claude Code / VS Code / any)
// RULE_ORDER: baked into binary — no external file dependency
//
// PROJECT RULES — embedded as constants so they travel with build/index.js.
// Any MCP client (any agent) receives these rules automatically via MCP protocol.
// External .md files (AGENTS.md, project-standards.md) are human-readable docs only.
// ─────────────────────────────────────────────────────────────────────────────

/** Full project-standards content — baked into binary, no fs.readFile needed */
const PROJECT_STANDARDS = `
# Adobe After Effects MCP — Project Standards
# PLATFORM: vendor-neutral

## A. Platform Isolation Rules
- Strictly No Cloud / Data Agent Kit: Never suggest or reference Google Cloud, BigQuery, Dataproc, Spanner, AlloyDB, Cloud SQL, Dataform, or datacloud_*.
- MCP Tool Scope: Only use adobe-after-effects MCP tools for AE automation, ExtendScript CLI, and Local Bridge.
- Self-Contained: MCP config lives only inside this project. Never write to global agent config (~/.gemini/config/, ~/.cursor/, etc.).
- Platform-independent instructions: Use AGENTS.md and the rules in this project. Do not reference or depend on legacy platform-specific instructions files.

## B. Repo Maintenance Discipline
- Never create residual log files (CHANGELOG.md, live_error_log.md, etc.).
- Report results directly in chat after npm run build and npm test pass. Do not write a separate report file.
- Never auto-launch After Effects (launchAfterEffects is forbidden). Always ask user to open it first.
- Keep README.md accurate: correct tool count, skill count, version — no links to log files.

## C. Dual-Audit V2 Workflow (required before reporting done)
Audit 1 — Technical Build Check:
  1. npm run build  → tsc must pass 0 errors, 0 warnings.
  2. node test/verify-build.js → all 4 checks must PASS.
  3. Tool count >= 169, skill count = 16 active.

Audit 2 — Semantic Consistency Check:
  1. SERVER_INSTRUCTIONS must reflect correct tool count and skill count.
  2. AGENTS.md must match project-standards.
  3. No references to legacy platform-specific instructions files in .ts, .md, or .json files.
  4. Verify ae://rules/project-standards and ae://rules/all serve the project rules.

## D. Skill Matrix (16 Active + 1 Disabled = 17 Skills)
  1  ae-text-animation          ✅ text, typography, lower thirds, kinetic
  2  ae-keyframe-easing         ✅ easing, spring, bounce, timing, curves
  3  ae-shape-operators         ✅ shapes, repeater, trim paths, procedural
  4  ae-expression-math         ✅ expression, HUD, toComp, sourceRectAtTime
  5  ae-audio-reactive          ✅ audio, beat sync, amplitude, spectrum
  6  ae-color-management        ✅ color, LUT, 32-bpc, OCIO, grading
  7  ae-asset-interchange       ✅ SVG, PSD, AI, Lottie, import, alpha
  8  ae-mogrt-essential-graphics✅ MOGRT, essential graphics, template
  9  ae-render-pipeline         ✅ render, aerender, export, queue
  10 ae-video-tutorial-parser   ✅ tutorial, YouTube, breakdown, parse
  11 ae-visual-feedback         ✅ preview, see-frame, contact sheet, QA
  12 ae-design-scripting        ✅ plan, blueprint, multi-scene, script
  13 ae-magic-fire-burn         ✅ fire, burn, ember, smoke, flame, VFX
  14 ae-3d-cinematic-camera     ✅ 3d camera, depth of field, orbit null, parallax
  15 ae-kinetic-caption-reels   ✅ 9:16 vertical, reels captions, word karaoke pop
  16 ae-logo-reveal-pro         ✅ logo reveal, stroke write-on, saber glow, light sweep
  —  ae-character-rigging       ⛔ DISABLED (Duik not installed)

## E. Security, Undo-Group & Session Cleanup Rules
- All destructive operations must be wrapped in ExtendScript undo-groups:
    app.beginUndoGroup("...") / app.endUndoGroup()
- Never delete user footage or compositions without explicit confirmation.
- Never store credentials (API keys, tokens) in any repository file.
- Ask the user to approve the QA result before calling cleanup-session. Preserve .aep projects, rendered videos, tutorials, and .jsx scripts.
`.trim();

/** Aggregated ae://rules/all content — baked into binary */
const RULES_ALL = [
  "# ae://rules/all — Aggregated Project Rules (baked into build/index.js)",
  "# Any agent connecting to this MCP server receives these rules automatically.",
  "",
  PROJECT_STANDARDS,
].join("\n");

const SERVER_INSTRUCTIONS = `
# Adobe After Effects MCP - Core Operating Directives

You are the Adobe After Effects Motion Graphics Director and Technical Animator, equipped with 169 After Effects automation tools and 16 active procedural motion skills.

## 0. Project Rules
This server operates under independent project rules defined in AGENTS.md (and baked into this binary).
- Rules are served as MCP resource: ae://rules/project-standards (use prompt /ae-rules to load all rules)
- All rules are aggregated in: ae://rules/all
- Use the project rules in AGENTS.md and the MCP rule resources.
- NEVER auto-launch After Effects. Always ask the user to open it first.
- NEVER create residual log files (CHANGELOG.md, live_error_log.md, etc.).
- MCP config lives only inside this project (.agent/plugins/), not in global ~/.gemini/config/.

## 1. Mandatory 3-Tier Dual-Audit Workflow Architecture
For every motion graphics request, you MUST execute through the 3-tier sequence:
- **Phase 1: [Leader AE - Lập Kế Hoạch & Thẩm Mỹ]**:
  - Define aesthetic direction: 3 core adjectives (e.g., Bold, Tech, Minimal).
  - Select color tokens and typography scale.
  - Determine Node-Graph structure (Precomps vs Master).
  - Auto-select the matching Motion Skill from the 16-skill matrix below and specify the Ease Curve (e.g., Decelerate Strong 85% or Spring).
  - Present this plan briefly to the user before calling tools.
- **Phase 2: [Worker AE - Thi Công Kỹ Thuật]**:
  - Execute atomically using the 169 MCP tools.
  - Before multi-step edits in AE, optionally call \`set-ai-overlay\` (\`active: true\`, \`message: "..."\`) so the non-blocking "AI IS WORKING" HUD alerts the user not to touch AE (it also auto-activates and auto-hides after 12s idle).
  - Wrap multi-step operations cleanly, apply keyframe easing with ease presets or expressions.
  - Wrap destructive operations in ExtendScript undo-groups (beginUndoGroup/endUndoGroup).
  - Handle errors gracefully with up to 3 automatic retries.
- **Phase 3: [QA Reviewer / Dual-Audit V2 - Kiểm Tra Chất Lượng]**:
  - **Audit 1 (Technical)**: Verify layer/comp structure, tool call success, no duplicate names.
  - **Audit 2 (Semantic)**: Confirm the result matches the user's intent and the chosen skills fit the task.
  - Suggest visual check using \`see-frame\` if frame inspection is needed.
  - After QA finishes, call \`set-ai-overlay\` (\`active: false\`) to clear the "AI IS WORKING" HUD cleanly.
  - **MANDATORY after QA**: Always end the QA message with this exact line:
    > ✅ Nghiệm thu xong chưa? Bấm **OK** để dọn dẹp các tệp tạm (see-frame, logs, scratch) — bảo lưu an toàn file .aep, video render, tutorial và script .jsx.

## 2. Automatic Skill Routing Matrix (16 Active Skills)
Automatically match user requests to the appropriate skill without requiring manual skill selection:
- Text animations, typography, lower thirds -> \`ae-text-animation\` / \`ae://skills/ae-text-animation\`
- Easing curves, spring physics, bounce, smooth timing -> \`ae-keyframe-easing\` / \`ae://skills/ae-keyframe-easing\`
- Procedural vector shapes, repeater arrays, trim paths -> \`ae-shape-operators\` / \`ae://skills/ae-shape-operators\`
- Dynamic expressions, HUDs, toComp, sourceRectAtTime -> \`ae-expression-math\` / \`ae://skills/ae-expression-math\`
- Audio spectrum, beat syncing, audio-to-keyframes -> \`ae-audio-reactive\` / \`ae://skills/ae-audio-reactive\`
- Color grading, 32-bpc linear compositing, LUTs -> \`ae-color-management\` / \`ae://skills/ae-color-management\`
- Vector AI/SVG imports, PSD multi-layer, Lottie export -> \`ae-asset-interchange\` / \`ae://skills/ae-asset-interchange\`
- Essential Graphics, MOGRT packaging -> \`ae-mogrt-essential-graphics\` / \`ae://skills/ae-mogrt-essential-graphics\`
- Background rendering, aerender, render queue -> \`ae-render-pipeline\` / \`ae://skills/ae-render-pipeline\`
- YouTube tutorial breakdown, video keyframes -> \`ae-video-tutorial-parser\` / \`ae://skills/ae-video-tutorial-parser\`
- Visual preview, contact sheets, layout validation -> \`ae-visual-feedback\` / \`ae://skills/ae-visual-feedback\`
- Complete motion script, multi-scene planning -> \`ae-design-scripting\` / \`ae://skills/ae-design-scripting\`
- Fire, burn, ember, smoke, flame, VFX particle -> \`ae-magic-fire-burn\` / \`ae://skills/ae-magic-fire-burn\`
- 3D camera, depth of field, orbit null, parallax, dolly zoom -> \`ae-3d-cinematic-camera\` / \`ae://skills/ae-3d-cinematic-camera\`
- Vertical 9:16, Reels/Shorts captions, karaoke pop, word highlight -> \`ae-kinetic-caption-reels\` / \`ae://skills/ae-kinetic-caption-reels\`
- Logo reveal, vector stroke write-on, Saber energy, light sweep -> \`ae-logo-reveal-pro\` / \`ae://skills/ae-logo-reveal-pro\`
- ae-character-rigging: DISABLED (Duik not installed — skill hidden at .agent/skills-disabled/)

Always require Adobe After Effects to be open before executing any MCP tool.
`;

/**
 * After Effects MCP Core Server v2.4.5
 * Provides full programmatic control over Adobe After Effects:
 * - 169 total tools across 15 modular domains (150 core & extended tools + 19 compatibility aliases)
 * - 16 active procedural motion skills (ae-character-rigging disabled — Duik not installed)
 * - Rules embedded in the PROJECT_STANDARDS and RULES_ALL constants
 * - Any agent connecting via MCP receives rules automatically through SERVER_INSTRUCTIONS + ae://rules/*
 * - Platform-neutral: Antigravity / Cursor / Claude Code / VS Code / any MCP client
 * - Automatic background CLI execution via afterfx.exe -r (no manual UI panel required)
 */
export const server = new McpServer(
  {
    name: "adobe-after-effect-mcp",
    version: "2.4.5",
  },
  {
    instructions: SERVER_INSTRUCTIONS.trim(),
  }
);

// Expose compositions resource
server.resource("compositions", "aftereffects://compositions", async (uri) => {
  const result = await sendBridgeCommand("listCompositions", {}, 8000, 250);
  return {
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: result,
      },
    ],
  };
});

// Expose current project resource
server.resource("project", "ae://project/current", async (uri) => {
  const result = await sendBridgeCommand("getProjectInfo", {}, 8000, 250);
  return {
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: result,
      },
    ],
  };
});

// ── RULE_ORDER: project-standards (baked into binary — no fs.readFile) ───────
// ae://rules/project-standards — returns constant embedded at build time
server.resource(
  "rules-project-standards",
  "ae://rules/project-standards",
  async (uri) => ({
    contents: [{ uri: uri.href, mimeType: "text/markdown", text: PROJECT_STANDARDS }],
  })
);

// ae://rules/agents — returns AGENTS.md content if present, else embedded summary
server.resource(
  "rules-agents",
  "ae://rules/agents",
  async (uri) => {
    const agentsFile = path.resolve(PROJECT_ROOT, "AGENTS.md");
    const text = fs.existsSync(agentsFile)
      ? fs.readFileSync(agentsFile, "utf8")
      : PROJECT_STANDARDS; // fallback to baked constant
    return { contents: [{ uri: uri.href, mimeType: "text/markdown", text }] };
  }
);

// ae://rules/all — fully baked, no external file dependency
server.resource(
  "rules-all",
  "ae://rules/all",
  async (uri) => ({
    contents: [{ uri: uri.href, mimeType: "text/markdown", text: RULES_ALL }],
  })
);

// Prompts
server.prompt("create-composition", "Create a new composition with specified settings", () => {
  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "Please create a new composition with standard HD settings (1920x1080, 30fps, 10s)",
        },
      },
    ],
  };
});

server.prompt("create-animation", "Create an animated composition with common motion graphics elements", () => {
  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "Help me create an animated composition. I want to add text with entrance animations, shapes, and smooth transitions.",
        },
      },
    ],
  };
});

server.prompt("setup-project", "Set up a new project with standard folder structure", () => {
  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: "Set up a new After Effects project with organized folders for footage, compositions, and precomps.",
        },
      },
    ],
  };
});

// /ae-rules prompt — fully baked, no fs.readFile, works on any machine/agent
server.prompt("ae-rules", "Load all project rules: isolation policy, Dual-Audit V2, 13-skill matrix, security", () => ({
  messages: [
    {
      role: "user",
      content: {
        type: "text",
        text: [
          "# Project Rules — Adobe After Effects MCP",
          "# These rules are baked into the MCP server binary (build/index.js).",
          "# They apply to any AI agent (Antigravity, Cursor, Claude Code, VS Code, etc.).",
          "",
          "Please apply and enforce all of the following rules for this session:",
          "",
          RULES_ALL,
        ].join("\n"),
      },
    },
  ],
}));

// Register all 13 Agent Skills as native MCP Prompts and Resources
const skillsDir = path.resolve(PROJECT_ROOT, ".agent", "skills");
if (fs.existsSync(skillsDir)) {
  try {
    const skillFolders = fs.readdirSync(skillsDir).filter((f) => {
      try {
        return fs.statSync(path.join(skillsDir, f)).isDirectory();
      } catch {
        return false;
      }
    });

    for (const skillName of skillFolders) {
      const skillMdPath = path.join(skillsDir, skillName, "SKILL.md");
      if (fs.existsSync(skillMdPath)) {
        const rawContent = fs.readFileSync(skillMdPath, "utf8");
        const descMatch = rawContent.match(/description:\s*"([^"]+)"/);
        const skillDesc = descMatch ? descMatch[1] : `After Effects skill guidelines for ${skillName}`;

        // 1. Expose as MCP Resource: ae://skills/<skill-name>
        server.resource(
          `skill-${skillName}`,
          `ae://skills/${skillName}`,
          async (uri) => ({
            contents: [
              {
                uri: uri.href,
                mimeType: "text/markdown",
                text: fs.readFileSync(skillMdPath, "utf8"),
              },
            ],
          })
        );

        // 2. Expose as native MCP Prompt: /<skill-name>
        server.prompt(
          skillName,
          skillDesc,
          () => ({
            messages: [
              {
                role: "user",
                content: {
                  type: "text",
                  text: `[Quy chuẩn thiết kế Motion từ Skill ${skillName}]\n\nHãy tuân thủ và áp dụng các quy tắc kỹ thuật, công thức toán học và hướng dẫn sau đây khi thực thi tác vụ After Effects:\n\n${fs.readFileSync(skillMdPath, "utf8")}`,
                },
              },
            ],
          })
        );
      }
    }
  } catch (err) {
    console.error("Warning: could not register agent skills as MCP prompts/resources:", err);
  }
}

// Register all tools across all domain modules
registerAllTools(server);

export {
  registerAllTools,
  registerAliasTools,
  registerAnimationTools,
  registerAudioTools,
  registerCompositionTools,
  registerEffectTools,
  registerFootageTools,
  registerLayerTools,
  registerMaskTools,
  registerProjectTools,
  registerRenderTools,
  registerShapeTools,
  registerSystemTools,
  registerTemplateTools,
  registerThreeDTools,
  registerVisualTools,
};

// Connect and start server on stdio transport
async function main() {
  console.error("After Effects MCP Core Server starting...");
  console.error(`Scripts directory: ${getScriptsDir()}`);
  console.error(`Bridge temp directory: ${getAETempDir()}`);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("After Effects MCP Core Server running via Stdio.");
}

function isMainModule(): boolean {
  if (!process.argv[1]) return false;
  try {
    const scriptPath = fileURLToPath(import.meta.url);
    const invokedPath = path.resolve(process.argv[1]);
    return (
      scriptPath.toLowerCase() === invokedPath.toLowerCase() ||
      invokedPath.toLowerCase().endsWith("adobe-after-effect-mcp") ||
      invokedPath.toLowerCase().endsWith("index.js")
    );
  } catch {
    return false;
  }
}

if (isMainModule()) {
  main().catch((error) => {
    console.error("Fatal error in AE MCP Core server:", error);
    process.exit(1);
  });
} else {
  // Pure module import validation (smoke test)
  console.error("After Effects MCP Core Server module imported successfully.");
}
