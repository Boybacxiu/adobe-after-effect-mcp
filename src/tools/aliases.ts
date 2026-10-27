import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { executeExtendScript, sendBridgeCommand } from "../core/bridge.js";
import { bridgeToolResult } from "../lib/bridge-core.js";
import {
  generateCreateLowerThird,
  generateCreateTitleCard,
  generateCreateTransition,
  generateCreateLogoReveal,
  generateCreateTextAnimator,
} from "../lib/generators/templateGenerators.js";
import {
  generateCreateProject,
  generateOpenProject,
  generateSaveProject,
  generateGetProjectInfo,
} from "../lib/generators/projectGenerators.js";
import {
  generateApplyExpressionTemplate,
} from "../lib/generators/expressionGenerators.js";
import {
  generateCreatePath,
  generateGetPath,
} from "../lib/generators/shapeGenerators.js";
import {
  generateSet3DLayer,
} from "../lib/generators/threeDGenerators.js";
import {
  generateAddMask,
  generateListMasks,
} from "../lib/generators/maskGenerators.js";
import {
  generateListRenderQueue,
} from "../lib/generators/renderQueueGenerators.js";

export function registerAliasTools(server: McpServer): void {
  server.tool(
    "ae_ping",
    "Check connection to Adobe After Effects (alias for check-bridge)",
    {},
    async () => {
      try {
        const raw = await sendBridgeCommand("ping", {}, 5000, 200);
        return bridgeToolResult(raw);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error checking AE connection: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "ae_create_comp",
    "Create a new composition in Adobe After Effects (alias for create-composition)",
    {
      name: z.string().describe("Name of the composition"),
      width: z.number().int().positive().describe("Width of the composition in pixels"),
      height: z.number().int().positive().describe("Height of the composition in pixels"),
      fps: z.number().positive().optional().describe("Frame rate in frames per second (default: 30.0)"),
      durationSec: z.number().positive().optional().describe("Duration in seconds (default: 10.0)"),
    },
    async (params) => {
      try {
        const result = await sendBridgeCommand(
          "createComposition",
          {
            name: params.name,
            width: params.width,
            height: params.height,
            frameRate: params.fps,
            duration: params.durationSec,
          },
          8000,
          250,
        );
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error creating composition: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "ae_add_text",
    "Add a text layer to a composition (alias for create-text-layer)",
    {
      compName: z.string().optional().describe("Composition name"),
      text: z.string().describe("Text content"),
      fontSize: z.number().positive().optional().describe("Font size (default: 72)"),
    },
    async (params) => {
      try {
        const result = await sendBridgeCommand(
          "createTextLayer",
          {
            compName: params.compName,
            text: params.text,
            fontSize: params.fontSize,
          },
          8000,
          250,
        );
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error adding text layer: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Snake_case aliases for ishu86/ae-mcp client compatibility
  server.tool(
    "create_project",
    "Create a new After Effects project (alias for create-project)",
    { name: z.string().optional() },
    async (params) => {
      try {
        const script = generateCreateProject(params as any);
        const result = await executeExtendScript(script, 10000, "Create Project");
        return bridgeToolResult(result);
      } catch (error) {
        return { content: [{ type: "text", text: String(error) }], isError: true };
      }
    },
  );

  server.tool(
    "open_project",
    "Open an existing After Effects project (alias for open-project)",
    { path: z.string() },
    async (params) => {
      try {
        const script = generateOpenProject(params as any);
        const result = await executeExtendScript(script, 30000, "Open Project");
        return bridgeToolResult(result);
      } catch (error) {
        return { content: [{ type: "text", text: String(error) }], isError: true };
      }
    },
  );

  server.tool(
    "save_project",
    "Save the current After Effects project (alias for save-project)",
    { path: z.string().optional() },
    async (params) => {
      try {
        const script = generateSaveProject(params as any);
        const result = await executeExtendScript(script, 20000, "Save Project");
        return bridgeToolResult(result);
      } catch (error) {
        return { content: [{ type: "text", text: String(error) }], isError: true };
      }
    },
  );

  server.tool(
    "get_project_info",
    "Get information about the current project (alias for get-project-info)",
    {},
    async () => {
      try {
        const script = generateGetProjectInfo();
        const result = await executeExtendScript(script, 10000, "Get Project Info");
        return bridgeToolResult(result);
      } catch (error) {
        return { content: [{ type: "text", text: String(error) }], isError: true };
      }
    },
  );

  server.tool(
    "create_lower_third",
    "Create animated lower third (alias for create-lower-third)",
    {
      style: z.enum(["modern", "corporate", "news", "minimal", "social"]),
      name: z.string(),
      title: z.string(),
      subtitle: z.string().optional(),
      duration: z.number().optional(),
    },
    async (params) => {
      try {
        const script = generateCreateLowerThird(params as any);
        const result = await executeExtendScript(script, 15000, "Create Lower Third");
        return bridgeToolResult(result);
      } catch (error) {
        return { content: [{ type: "text", text: String(error) }], isError: true };
      }
    },
  );

  server.tool(
    "create_title_card",
    "Create animated title card (alias for create-title-card)",
    {
      style: z.enum(["cinematic", "documentary", "social", "minimal"]),
      title: z.string(),
      subtitle: z.string().optional(),
      duration: z.number().optional(),
    },
    async (params) => {
      try {
        const script = generateCreateTitleCard(params as any);
        const result = await executeExtendScript(script, 15000, "Create Title Card");
        return bridgeToolResult(result);
      } catch (error) {
        return { content: [{ type: "text", text: String(error) }], isError: true };
      }
    },
  );

  server.tool(
    "create_transition",
    "Create motion transition (alias for create-transition)",
    {
      type: z.enum(["wipe_left", "wipe_right", "wipe_up", "wipe_down", "dissolve", "push", "slide", "zoom"]),
      duration: z.number().optional(),
    },
    async (params) => {
      try {
        const script = generateCreateTransition(params as any);
        const result = await executeExtendScript(script, 15000, "Create Transition");
        return bridgeToolResult(result);
      } catch (error) {
        return { content: [{ type: "text", text: String(error) }], isError: true };
      }
    },
  );

  server.tool(
    "create_logo_reveal",
    "Create animated logo reveal (alias for create-logo-reveal)",
    {
      style: z.enum(["fade", "scale", "slide", "spin", "glitch", "particle"]),
      duration: z.number().optional(),
      layerIndex: z.number().optional(),
      layerName: z.string().optional(),
    },
    async (params) => {
      try {
        const script = generateCreateLogoReveal(params as any);
        const result = await executeExtendScript(script, 15000, "Create Logo Reveal");
        return bridgeToolResult(result);
      } catch (error) {
        return { content: [{ type: "text", text: String(error) }], isError: true };
      }
    },
  );

  server.tool(
    "create_text_animator",
    "Add animated text range selector (alias for create-text-animator)",
    {
      type: z.enum(["typewriter", "fadeInChars", "scaleInChars", "slideInChars", "randomize", "wave"]),
      layerIndex: z.number().optional(),
      layerName: z.string().optional(),
      duration: z.number().optional(),
    },
    async (params) => {
      try {
        const script = generateCreateTextAnimator(params as any);
        const result = await executeExtendScript(script, 15000, "Create Text Animator");
        return bridgeToolResult(result);
      } catch (error) {
        return { content: [{ type: "text", text: String(error) }], isError: true };
      }
    },
  );

  server.tool(
    "apply_expression_template",
    "Apply expression template (alias for apply-expression-template)",
    {
      property: z.string(),
      template: z.string(),
      layerIndex: z.number().optional(),
      layerName: z.string().optional(),
      params: z.record(z.any()).optional(),
    },
    async (params) => {
      try {
        const script = generateApplyExpressionTemplate(params as any);
        const result = await executeExtendScript(script, 15000, "Apply Expression Template");
        return bridgeToolResult(result);
      } catch (error) {
        return { content: [{ type: "text", text: String(error) }], isError: true };
      }
    },
  );

  server.tool(
    "create_path",
    "Create bezier shape path (alias for create-path)",
    {
      vertices: z.array(z.array(z.number()).length(2)).describe("Array of [x, y] coordinates"),
      layerIndex: z.number().optional(),
      layerName: z.string().optional(),
    },
    async (params) => {
      try {
        const script = generateCreatePath(params as any);
        const result = await executeExtendScript(script, 15000, "Create Path");
        return bridgeToolResult(result);
      } catch (error) {
        return { content: [{ type: "text", text: String(error) }], isError: true };
      }
    },
  );

  server.tool(
    "get_path",
    "Retrieve shape path (alias for get-path)",
    {
      layerIndex: z.number().optional(),
      layerName: z.string().optional(),
    },
    async (params) => {
      try {
        const script = generateGetPath(params as any);
        const result = await executeExtendScript(script, 10000, "Get Path");
        return bridgeToolResult(result);
      } catch (error) {
        return { content: [{ type: "text", text: String(error) }], isError: true };
      }
    },
  );

  server.tool(
    "set_3d_layer",
    "Toggle 3D layer (alias for set-3d-layer)",
    {
      is3D: z.boolean(),
      layerIndex: z.number().optional(),
      layerName: z.string().optional(),
    },
    async (params) => {
      try {
        const script = generateSet3DLayer(params as any);
        const result = await executeExtendScript(script, 10000, "Set 3D Layer");
        return bridgeToolResult(result);
      } catch (error) {
        return { content: [{ type: "text", text: String(error) }], isError: true };
      }
    },
  );

  server.tool(
    "add_mask",
    "Add mask to layer (alias for add-mask)",
    {
      layerIndex: z.number().optional(),
      layerName: z.string().optional(),
      mode: z.string().optional(),
    },
    async (params) => {
      try {
        const script = generateAddMask(params as any);
        const result = await executeExtendScript(script, 15000, "Add Mask");
        return bridgeToolResult(result);
      } catch (error) {
        return { content: [{ type: "text", text: String(error) }], isError: true };
      }
    },
  );

  server.tool(
    "list_masks",
    "List masks on layer (alias for list-masks)",
    {
      layerIndex: z.number().optional(),
      layerName: z.string().optional(),
    },
    async (params) => {
      try {
        const script = generateListMasks(params as any);
        const result = await executeExtendScript(script, 10000, "List Masks");
        return bridgeToolResult(result);
      } catch (error) {
        return { content: [{ type: "text", text: String(error) }], isError: true };
      }
    },
  );

  server.tool(
    "list_render_queue",
    "List render queue items (alias for list-render-queue)",
    {},
    async () => {
      try {
        const script = generateListRenderQueue();
        const result = await executeExtendScript(script, 10000, "List Render Queue");
        return bridgeToolResult(result);
      } catch (error) {
        return { content: [{ type: "text", text: String(error) }], isError: true };
      }
    },
  );
}

