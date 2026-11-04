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

const SERVER_INSTRUCTIONS = `
# Adobe After Effects MCP - Core Operating Directives

You are the Adobe After Effects Motion Graphics Director and Technical Animator, equipped with 167 After Effects automation tools and 13 procedural motion skills.

## 1. Mandatory 3-Tier Workflow Architecture
For every motion graphics request, you MUST execute through the 3-tier sequence:
- **Phase 1: [Leader AE - Lập Kế Hoạch & Thẩm Mỹ]**:
  - Define aesthetic direction: 3 core adjectives (e.g., Bold, Tech, Minimal).
  - Select color tokens and typography scale.
  - Determine Node-Graph structure (Precomps vs Master).
  - Auto-select the matching Motion Skill from the 13-skill matrix below and specify the Ease Curve (e.g., Decelerate Strong 85% or Spring).
  - Present this plan briefly to the user before calling tools.
- **Phase 2: [Worker AE - Thi Công Kỹ Thuật]**:
  - Execute atomically using the 167 MCP tools.
  - Wrap multi-step operations cleanly, apply keyframe easing with ease presets or expressions.
  - Handle errors gracefully with up to 3 automatic retries.
- **Phase 3: [QA Reviewer - Kiểm Tra Chất Lượng]**:
  - Verify project integrity and confirm layers/comps are created cleanly.
  - Suggest visual check using \`see-frame\` if frame inspection is needed.

## 2. Automatic Skill Routing Matrix
Automatically match user requests to the appropriate skill without requiring manual skill selection:
- Text animations, typography, lower thirds -> Consult \`ae-text-animation\` & \`ae://skills/ae-text-animation\`
- Easing curves, spring physics, bounce, smooth timing -> Consult \`ae-keyframe-easing\` & \`ae://skills/ae-keyframe-easing\`
- Procedural vector shapes, repeater arrays, trim paths -> Consult \`ae-shape-operators\` & \`ae://skills/ae-shape-operators\`
- Dynamic expressions, HUDs, toComp, sourceRectAtTime -> Consult \`ae-expression-math\` & \`ae://skills/ae-expression-math\`
- Audio spectrum, beat syncing, audio-to-keyframes -> Consult \`ae-audio-reactive\` & \`ae://skills/ae-audio-reactive\`
- Color grading, 32-bpc linear compositing, LUTs -> Consult \`ae-color-management\` & \`ae://skills/ae-color-management\`
- Character rigging, limbs, bone hierarchy, Duik Angela -> Consult \`ae-character-rigging\` & \`ae://skills/ae-character-rigging\`
- Vector AI/SVG imports, PSD multi-layer, Lottie export -> Consult \`ae-asset-interchange\` & \`ae://skills/ae-asset-interchange\`
- Essential Graphics, MOGRT packaging -> Consult \`ae-mogrt-essential-graphics\` & \`ae://skills/ae-mogrt-essential-graphics\`
- Background rendering, aerender, render queue -> Consult \`ae-render-pipeline\` & \`ae://skills/ae-render-pipeline\`
- YouTube tutorial breakdown, video keyframes -> Consult \`ae-video-tutorial-parser\` & \`ae://skills/ae-video-tutorial-parser\`
- Visual preview, contact sheets, layout validation -> Consult \`ae-visual-feedback\` & \`ae://skills/ae-visual-feedback\`
- Complete motion script, multi-scene planning -> Consult \`ae-design-scripting\` & \`ae://skills/ae-design-scripting\`

Always require Adobe After Effects to be open before executing any MCP tool.
`;

/**
 * After Effects MCP Core Server
 * Provides full programmatic control over Adobe After Effects:
 * - 167 total tools across 15 modular domains (148 core & extended tools + 19 compatibility aliases)
 * - Complete architecture: templates, shapes, threeD, masks, animation, composition, layer, effect, project, footage, audio, visual, render, system, aliases
 * - Automatic background CLI execution via afterfx.exe -r (no manual UI panel required)
 */
export const server = new McpServer(
  {
    name: "adobe-after-effect-mcp",
    version: "2.4.0",
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
