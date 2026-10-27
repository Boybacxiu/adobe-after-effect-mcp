import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { executeExtendScript } from "../core/bridge.js";
import { bridgeToolResult } from "../lib/bridge-core.js";
import {
  generateCreateLowerThird,
  generateCreateTitleCard,
  generateCreateTransition,
  generateCreateLogoReveal,
  generateCreateTextAnimator,
} from "../lib/generators/templateGenerators.js";
import {
  LOWER_THIRD_STYLES,
  TITLE_STYLES,
  TRANSITION_STYLES,
  LOGO_REVEAL_STYLES,
  TEXT_ANIMATOR_TYPES,
} from "../lib/presets/motionGraphics.js";

const ColorSchema = z.object({
  r: z.number().min(0).max(1).describe("Red channel (0.0 to 1.0)"),
  g: z.number().min(0).max(1).describe("Green channel (0.0 to 1.0)"),
  b: z.number().min(0).max(1).describe("Blue channel (0.0 to 1.0)"),
});

export function registerTemplateTools(server: McpServer): void {
  // Create lower third
  server.tool(
    "create-lower-third",
    "Create a professional animated lower third in a composition (styles: modern, corporate, news, minimal, social).",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      style: z
        .enum(["modern", "corporate", "news", "minimal", "social"])
        .describe("Style preset for the lower third"),
      name: z.string().describe("Layer name for the lower third group"),
      title: z.string().describe("Main title or person name"),
      subtitle: z.string().optional().describe("Subtitle, occupation, or role"),
      duration: z.number().positive().optional().describe("Duration in seconds (default: 5.0)"),
      animateIn: z.boolean().optional().describe("Enable entrance animation (default: true)"),
      animateOut: z.boolean().optional().describe("Enable exit animation (default: true)"),
      primaryColor: ColorSchema.optional().describe("Primary brand color (normalized 0-1)"),
      secondaryColor: ColorSchema.optional().describe("Secondary accent color (normalized 0-1)"),
      textColor: ColorSchema.optional().describe("Text color (normalized 0-1)"),
      position: z
        .enum(["left", "center", "right"])
        .optional()
        .describe("Horizontal alignment (default: 'left')"),
    },
    async (params) => {
      try {
        const script = generateCreateLowerThird(params as any);
        const result = await executeExtendScript(script, 15000, "Create Lower Third");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error creating lower third: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Create title card
  server.tool(
    "create-title-card",
    "Create a styled title card with animated text and optional background (styles: cinematic, documentary, social, minimal).",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      style: z
        .enum(["cinematic", "documentary", "social", "minimal"])
        .describe("Visual style preset for the title card"),
      title: z.string().describe("Main title text"),
      subtitle: z.string().optional().describe("Subtitle text"),
      duration: z.number().positive().optional().describe("Duration in seconds (default: 3.0)"),
      fontFamily: z.string().optional().describe("Custom font family name"),
      fontSize: z.number().positive().optional().describe("Font size in pixels"),
      color: ColorSchema.optional().describe("Text color (normalized 0-1)"),
      backgroundColor: ColorSchema.optional().describe("Background card color (normalized 0-1)"),
    },
    async (params) => {
      try {
        const script = generateCreateTitleCard(params as any);
        const result = await executeExtendScript(script, 15000, "Create Title Card");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error creating title card: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Create transition
  server.tool(
    "create-transition",
    "Create a motion graphics transition between clips (wipe_left, wipe_right, wipe_up, wipe_down, dissolve, push, slide, zoom).",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      type: z
        .enum(["wipe_left", "wipe_right", "wipe_up", "wipe_down", "dissolve", "push", "slide", "zoom"])
        .describe("Type of transition effect"),
      duration: z.number().positive().optional().describe("Transition duration in seconds (default: 1.0)"),
      color: ColorSchema.optional().describe("Transition shape color (normalized 0-1)"),
      direction: z
        .enum(["in", "out"])
        .optional()
        .describe("Transition direction (in or out, default: 'in')"),
    },
    async (params) => {
      try {
        const script = generateCreateTransition(params as any);
        const result = await executeExtendScript(script, 15000, "Create Transition");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error creating transition: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Create logo reveal
  server.tool(
    "create-logo-reveal",
    "Create an automated logo reveal animation on a layer (styles: fade, scale, slide, spin, glitch, particle).",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target logo layer index"),
      layerName: z.string().optional().describe("Target logo layer name"),
      style: z
        .enum(["fade", "scale", "slide", "spin", "glitch", "particle"])
        .describe("Animation style preset for the reveal"),
      duration: z.number().positive().optional().describe("Animation duration in seconds (default: 2.0)"),
      addGlow: z.boolean().optional().describe("Add a subtle glow accent during reveal (default: false)"),
    },
    async (params) => {
      try {
        const script = generateCreateLogoReveal(params as any);
        const result = await executeExtendScript(script, 15000, "Create Logo Reveal");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error creating logo reveal: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Create text animator
  server.tool(
    "create-text-animator",
    "Add an advanced text animator to a text layer (typewriter, fadeInChars, scaleInChars, slideInChars, randomize, wave).",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target text layer index"),
      layerName: z.string().optional().describe("Target text layer name"),
      type: z
        .enum(["typewriter", "fadeInChars", "scaleInChars", "slideInChars", "randomize", "wave"])
        .describe("Text animation preset type"),
      duration: z.number().positive().optional().describe("Duration in seconds"),
      delay: z.number().min(0).optional().describe("Per-character delay in seconds"),
      startDelay: z.number().min(0).optional().describe("Start time offset in seconds"),
    },
    async (params) => {
      try {
        const script = generateCreateTextAnimator(params as any);
        const result = await executeExtendScript(script, 15000, "Create Text Animator");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error creating text animator: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // List template styles
  server.tool(
    "list-template-styles",
    "List all available motion graphics styles, options, and parameters for lower thirds, titles, transitions, reveals, and text animators.",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                lowerThirdStyles: LOWER_THIRD_STYLES,
                titleStyles: TITLE_STYLES,
                transitionStyles: TRANSITION_STYLES,
                logoRevealStyles: LOGO_REVEAL_STYLES,
                textAnimatorTypes: TEXT_ANIMATOR_TYPES,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
