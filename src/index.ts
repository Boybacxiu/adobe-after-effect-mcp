#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getAETempDir, getScriptsDir, sendBridgeCommand } from "./core/bridge.js";
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

/**
 * After Effects MCP Core Server
 * Provides full programmatic control over Adobe After Effects:
 * - 167 total tools across 15 modular domains (148 core & extended tools + 19 compatibility aliases)
 * - Complete architecture: templates, shapes, threeD, masks, animation, composition, layer, effect, project, footage, audio, visual, render, system, aliases
 * - Automatic background CLI execution via afterfx.exe -r (no manual UI panel required)
 */
export const server = new McpServer({
  name: "adobe-after-effect-mcp",
  version: "2.0.0",
});

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

main().catch((error) => {
  console.error("Fatal error in AE MCP Core server:", error);
  process.exit(1);
});
