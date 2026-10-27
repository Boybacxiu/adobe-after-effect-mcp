import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { executeExtendScript, sendBridgeCommand } from "../core/bridge.js";
import { bridgeToolResult, getDefaultPresetRoots } from "../lib/bridge-core.js";
import { collectPresetFiles } from "../lib/preset-scan.js";
import {
  generateModifyEffectProperties,
  generateReorderEffects,
  generateCopyEffects,
  generateListEffects,
} from "../lib/generators/effectsGenerators.js";

export function registerEffectTools(server: McpServer): void {
  server.tool(
    "apply-effect",
    "Apply an effect to a layer in After Effects by display name or internal matchName.",
    {
      compIndex: z.number().int().positive().describe("1-based index of the target composition in the project panel."),
      layerIndex: z.number().int().positive().describe("1-based index of the target layer within the composition."),
      effect: z.string().optional().describe("Generic effect identifier (display name or matchName)."),
      effectIdentifier: z.string().optional().describe("Alias for effect identifier."),
      effectName: z.string().optional().describe("Display name of the effect to apply (e.g., 'Gaussian Blur', 'Drop Shadow')."),
      effectMatchName: z.string().optional().describe("After Effects internal matchName (e.g., 'ADBE Gaussian Blur 2')."),
      effectCategory: z.string().optional().describe("Optional category for filtering effects."),
      presetPath: z.string().optional().describe("Optional path to an effect preset file (.ffx)."),
      properties: z.record(z.any()).optional().describe("Optional properties to set on the effect after applying."),
      effectSettings: z.record(z.any()).optional().describe("Optional parameter map for the effect (alias for properties)."),
    },
    async (params) => {
      try {
        const result = await sendBridgeCommand("applyEffect", params, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error applying effect: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "add-any-effect",
    "Add any After Effects effect to a layer by display name or internal matchName.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      layerIndex: z.number().int().positive().optional().describe("1-based layer index."),
      layerName: z.string().optional().describe("Target layer name."),
      matchNameOrDisplayName: z.string().describe("Effect matchName (e.g. 'ADBE Gaussian Blur 2') or display name."),
      effectName: z.string().optional().describe("Custom name for the added effect instance."),
      properties: z.record(z.any()).optional().describe("Optional map of property values to configure."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("addAnyEffect", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error adding effect: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "apply-effect-template",
    "Apply a predefined effect template to a layer in After Effects",
    {
      compIndex: z.number().int().positive().describe("1-based index of the target composition in the project panel."),
      layerIndex: z.number().int().positive().describe("1-based index of the target layer within the composition."),
      templateName: z.string().describe("Name of the template (e.g., 'cinematicGlow', 'vibrantPop', 'subtleShadow')."),
    },
    async (params) => {
      try {
        const result = await sendBridgeCommand("applyEffectTemplate", params, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error applying effect template: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "remove-effect",
    "Remove one specific effect (or all effects) from a layer.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      compIndex: z.number().int().positive().optional().describe("1-based composition index."),
      layerIndex: z.number().int().positive().describe("1-based layer index."),
      layerName: z.string().optional().describe("Target layer name."),
      effectIndex: z.number().int().positive().optional().describe("1-based index of the effect in the layer effects stack."),
      effectName: z.string().optional().describe("Display name of the effect instance to remove."),
      effectMatchName: z.string().optional().describe("Internal matchName of the effect to remove."),
      removeAll: z.boolean().optional().describe("If true, remove all effects from the layer."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("removeEffect", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error removing effect: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "list-layer-effects",
    "List all effects currently applied to a layer, including index, name, matchName, enabled state, and properties.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      layerIndex: z.number().int().positive().optional().describe("1-based layer index."),
      layerName: z.string().optional().describe("Target layer name."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("listLayerEffects", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error listing layer effects: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "list-available-effects",
    "List all available effect matchNames and categories installed in After Effects.",
    {
      category: z.string().optional().describe("Filter by category name (e.g. 'Blur & Sharpen', 'Color Correction')."),
      query: z.string().optional().describe("Search term matching against effect name or matchName."),
      includeObsolete: z.boolean().optional().describe("Include obsolete effects (default: false)."),
      maxResults: z.number().int().positive().max(20000).optional().describe("Maximum results to return (default: 5000)."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("listAvailableEffects", parameters, 10000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error listing available effects: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "set-effect-property",
    "Set the value, expression, or keyframe options on an effect property using name, index, or propertyPath.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      compIndex: z.number().int().positive().optional().describe("1-based index of the target composition in project panel."),
      layerIndex: z.number().int().positive().optional().describe("1-based layer index."),
      layerName: z.string().optional().describe("Target layer name."),
      effectIndex: z.number().int().positive().optional().describe("1-based effect index."),
      effectName: z.string().optional().describe("Name of the effect instance."),
      effectMatchName: z.string().optional().describe("Internal matchName of the effect to target."),
      propertyPath: z
        .array(z.union([z.string(), z.number().int().positive()]))
        .optional()
        .describe("Path from effect root to target property, e.g. ['Compositing Options', 'Effect Opacity'] or [3, 1]."),
      propertyName: z.string().optional().describe("Property display name or matchName."),
      propertyIndex: z.number().int().positive().optional().describe("1-based property index within effect."),
      keyframeIndex: z.number().int().positive().optional().describe("Optional keyframe index to edit graph/value directly."),
      value: z.any().optional().describe("New value to set."),
      timeInSeconds: z.number().optional().describe("If provided, sets a keyframe at this time using value."),
      expressionString: z.string().optional().describe("Expression to apply to the property."),
      keyframeOptions: z
        .object({
          easyEase: z.boolean().optional().describe("Apply Easy Ease to the keyframe."),
          easyEaseInfluence: z.number().min(0.1).max(100).optional().describe("Influence used when easyEase is true (default: 33.333)."),
          interpolationIn: z.enum(["linear", "bezier", "hold"]).optional().describe("Incoming interpolation type."),
          interpolationOut: z.enum(["linear", "bezier", "hold"]).optional().describe("Outgoing interpolation type."),
          temporalContinuous: z.boolean().optional().describe("Enable or disable temporal continuity."),
          temporalAutoBezier: z.boolean().optional().describe("Enable or disable temporal auto-bezier."),
          roving: z.boolean().optional().describe("Set roving keyframe when supported by the property."),
          easeIn: z.any().optional(),
          easeOut: z.any().optional(),
          spatialTangentsIn: z.array(z.number()).optional(),
          spatialTangentsOut: z.array(z.number()).optional(),
        })
        .optional()
        .describe("Optional graph/easing controls for the keyframe."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("setEffectProperty", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting effect property: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "set-effect-keyframe",
    "Set a keyframe on an effect property at a specific time with optional easing graph options.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      compIndex: z.number().int().positive().optional().describe("1-based index of target comp."),
      layerIndex: z.number().int().positive().optional().describe("1-based layer index."),
      layerName: z.string().optional().describe("Target layer name."),
      effectIndex: z.number().int().positive().optional().describe("1-based effect index."),
      effectName: z.string().optional().describe("Name of the effect instance."),
      effectMatchName: z.string().optional().describe("Internal matchName of target effect."),
      propertyName: z.string().optional().describe("Property display name or matchName."),
      propertyPath: z.array(z.union([z.string(), z.number().int().positive()])).optional(),
      timeInSeconds: z.number().describe("Time at which to set the keyframe in seconds."),
      value: z.any().describe("Value of the keyframe."),
      easeType: z.enum(["linear", "easeIn", "easeOut", "easeInOut"]).optional().describe("Keyframe ease type shorthand."),
      keyframeOptions: z
        .object({
          easyEase: z.boolean().optional().describe("Apply Easy Ease to the keyframe."),
          easyEaseInfluence: z.number().min(0.1).max(100).optional().describe("Influence used when easyEase is true."),
          interpolationIn: z.enum(["linear", "bezier", "hold"]).optional(),
          interpolationOut: z.enum(["linear", "bezier", "hold"]).optional(),
          temporalContinuous: z.boolean().optional(),
          temporalAutoBezier: z.boolean().optional(),
          roving: z.boolean().optional(),
          easeIn: z.any().optional(),
          easeOut: z.any().optional(),
          spatialTangentsIn: z.array(z.number()).optional(),
          spatialTangentsOut: z.array(z.number()).optional(),
        })
        .optional()
        .describe("Optional graph/easing controls for the created keyframe."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("setEffectKeyframe", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting effect keyframe: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "list-presets",
    "List installed Adobe After Effects animation presets (.ffx) from standard application directories.",
    {
      category: z.string().optional().describe("Filter by subfolder / category (e.g. 'Backgrounds', 'Transitions')."),
      limit: z.number().int().positive().optional().describe("Maximum number of presets to return (default 100)."),
    },
    async (parameters) => {
      try {
        const roots = getDefaultPresetRoots();
        const files = collectPresetFiles(roots, true, parameters.category, parameters.limit ?? 100);
        return {
          content: [{ type: "text", text: JSON.stringify({ status: "success", count: files.length, presets: files }, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error listing presets: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "search-presets",
    "Search installed After Effects animation presets (.ffx) by name or keyword.",
    {
      query: z.string().describe("Search term to match against preset file names."),
      limit: z.number().int().positive().optional().describe("Maximum number of results to return (default 50)."),
    },
    async (parameters) => {
      try {
        const roots = getDefaultPresetRoots();
        const files = collectPresetFiles(roots, true, parameters.query, parameters.limit ?? 50);
        return {
          content: [{ type: "text", text: JSON.stringify({ status: "success", count: files.length, query: parameters.query, presets: files }, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error searching presets: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "apply-preset",
    "Apply an animation preset (.ffx file) to a layer.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      layerIndex: z.number().int().positive().optional().describe("1-based layer index."),
      layerName: z.string().optional().describe("Target layer name."),
      presetPath: z.string().describe("Absolute file path to the .ffx preset file."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("applyPreset", parameters, 10000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error applying preset: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "mcp_aftereffects_get_effects_help",
    "Get help on using After Effects effects, templates, and parameters",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: `After Effects MCP Effects System:
1. apply-effect: Apply effect by display name with optional properties.
2. add-any-effect: Add effect by matchName or display name with deep property configurations.
3. apply-effect-template: Apply preconfigured style bundles (e.g. cinematicGlow, vibrantPop).
4. set-effect-property / set-effect-keyframe: Animate and tune any effect parameter over time.
5. list-presets / search-presets / apply-preset: Leverage Adobe's built-in .ffx animation preset library.`,
          },
        ],
      };
    },
  );

  // Modify effect properties
  server.tool(
    "modify-effect-properties",
    "Set multiple parameters on an applied effect in a single call.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target layer index"),
      layerName: z.string().optional().describe("Target layer name"),
      effectIndex: z.number().int().positive().optional().describe("1-based effect index"),
      effectName: z.string().optional().describe("Target effect name"),
      properties: z.record(z.any()).describe("Key-value map of effect property names to values"),
    },
    async (params) => {
      try {
        const script = generateModifyEffectProperties(params as any);
        const result = await executeExtendScript(script, 15000, "Modify Effect Properties");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error modifying effect properties: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Reorder effects
  server.tool(
    "reorder-effects",
    "Change the stack order of an effect on a layer.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target layer index"),
      layerName: z.string().optional().describe("Target layer name"),
      effectIndex: z.number().int().positive().optional().describe("Current 1-based effect index"),
      effectName: z.string().optional().describe("Effect name"),
      newIndex: z.number().int().positive().describe("New 1-based target index in the effect stack"),
    },
    async (params) => {
      try {
        const script = generateReorderEffects(params as any);
        const result = await executeExtendScript(script, 10000, "Reorder Effects");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error reordering effects: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Copy effects
  server.tool(
    "copy-effects",
    "Copy all or specific effects from a source layer to a target layer.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      sourceLayerIndex: z.number().int().positive().optional().describe("Source layer index"),
      sourceLayerName: z.string().optional().describe("Source layer name"),
      targetLayerIndex: z.number().int().positive().optional().describe("Target layer index"),
      targetLayerName: z.string().optional().describe("Target layer name"),
      effectIndices: z.array(z.number().int().positive()).optional().describe("Specific effect indices to copy (copies all if omitted)"),
    },
    async (params) => {
      try {
        const script = generateCopyEffects(params as any);
        const result = await executeExtendScript(script, 15000, "Copy Effects");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error copying effects: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // List effects
  server.tool(
    "list-effects",
    "List all effects on a layer with index, display name, matchName, and enabled status.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target layer index"),
      layerName: z.string().optional().describe("Target layer name"),
    },
    async (params) => {
      try {
        const script = generateListEffects(params as any);
        const result = await executeExtendScript(script, 10000, "List Effects");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error listing effects: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );
}

