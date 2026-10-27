import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { executeExtendScript, sendBridgeCommand } from "../core/bridge.js";
import { bridgeToolResult } from "../lib/bridge-core.js";
import {
  generateDuplicateComposition,
  generateDeleteComposition,
  generateListCompositions,
  generateGetCompositionInfo,
  generateGetCompReport,
  generateSetActiveComposition,
} from "../lib/generators/compositionGenerators.js";

export function registerCompositionTools(server: McpServer): void {
  server.tool(
    "create-composition",
    "Create a new composition in After Effects with specified parameters",
    {
      name: z.string().describe("Name of the composition"),
      width: z.number().int().positive().describe("Width of the composition in pixels"),
      height: z.number().int().positive().describe("Height of the composition in pixels"),
      pixelAspect: z.number().positive().optional().describe("Pixel aspect ratio (default: 1.0)"),
      duration: z.number().positive().optional().describe("Duration in seconds (default: 10.0)"),
      frameRate: z
        .number()
        .positive()
        .optional()
        .describe("Frame rate in frames per second (default: 30.0)"),
      backgroundColor: z
        .object({
          r: z.number().int().min(0).max(255),
          g: z.number().int().min(0).max(255),
          b: z.number().int().min(0).max(255),
        })
        .optional()
        .describe("Background color of the composition (RGB values 0-255)"),
    },
    async (params) => {
      try {
        const result = await sendBridgeCommand("createComposition", params, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error queuing composition creation: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "set-composition-properties",
    "Modify properties of an existing composition (name, size, frame rate, duration, background color).",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      newName: z.string().optional().describe("New name for the composition."),
      width: z.number().int().positive().optional().describe("New width in pixels."),
      height: z.number().int().positive().optional().describe("New height in pixels."),
      frameRate: z.number().positive().optional().describe("New frame rate."),
      duration: z.number().positive().optional().describe("New duration in seconds."),
      backgroundColor: z
        .array(z.number())
        .optional()
        .describe("New background color [r, g, b] with channels 0-1."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("setCompositionProperties", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting composition properties: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "inspect-comp",
    "Inspect a composition in detail: name, dimensions, duration, fps, display start frame/time, work area, background color, and a full summary of all its layers (index, name, type, in/out, 3D, enabled, parent, track matte, blend mode).",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("getCompFull", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error inspecting composition: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "localize-comp",
    "Create a localized duplicate of a composition: swap in translated text for one or more text layers, auto-detecting Arabic and applying right-to-left direction/alignment (same logic as create-text-layer). Every other layer, effect, and animation is preserved unchanged because the whole composition is duplicated first. Supports both `translations` (with optional nested precomp `path`) and `replacements`.",
    {
      compName: z.string().optional().describe("Source composition name (or active comp if omitted)."),
      compIndex: z.number().int().positive().optional().describe("1-based index among compositions, if compName is omitted."),
      newCompName: z.string().optional().describe("Name for the new localized composition (default: '<source name> (localized)')."),
      translations: z
        .array(
          z.object({
            layerIndex: z.number().int().positive().optional().describe("1-based index of the text layer to replace, in the source comp top level."),
            layerName: z.string().optional().describe("Name of the text layer to replace, in the source comp top level."),
            path: z
              .array(
                z.object({
                  layerIndex: z.number().int().positive().optional().describe("1-based layer index at this nesting level."),
                  layerName: z.string().optional().describe("Layer name at this nesting level."),
                }),
              )
              .min(1)
              .optional()
              .describe("Full path to a text layer nested inside one or more precompositions."),
            text: z.string().describe("The translated text for this layer."),
            direction: z.enum(["auto", "rtl", "ltr"]).optional().describe("Text direction for this layer ('auto' = RTL when Arabic is detected)."),
            alignment: z.enum(["left", "center", "right"]).optional().describe("Paragraph alignment for this layer."),
          }),
        )
        .optional()
        .describe("One entry per text layer to localize (top-level or nested via path)."),
      replacements: z
        .array(
          z.object({
            matchType: z
              .enum(["layerName", "layerIndex", "sourceText"])
              .describe("How to find the target layer."),
            matchValue: z
              .union([z.string(), z.number()])
              .describe("Layer name, 1-based layer index, or exact source text to match."),
            type: z
              .enum(["text", "footage"])
              .describe("'text' to replace text content; 'footage' to replace footage source."),
            value: z
              .string()
              .describe("New text content (Arabic supported) or absolute path to replacement footage file."),
            alignment: z
              .enum(["left", "center", "right"])
              .optional()
              .describe("Paragraph alignment for text replacements."),
            direction: z
              .enum(["auto", "rtl", "ltr"])
              .optional()
              .describe("Text direction for text replacements (default 'auto')."),
          }),
        )
        .optional()
        .describe("List of replacement operations to apply."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("localizeComp", parameters, 15000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error localizing composition: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "populate-template",
    "Populate a template composition using named data bindings. Layers tagged with {{fieldName}} or specified in the bindings map will be populated with values from the data object.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      data: z
        .record(z.any())
        .describe("Key-value data payload to fill into the template."),
      bindings: z
        .record(
          z.object({
            layer: z.union([z.string(), z.number()]).describe("Layer name or 1-based index."),
            kind: z.enum(["text", "footage", "color", "visible"]).describe("Type of property to bind."),
            direction: z.enum(["auto", "rtl", "ltr"]).optional().describe("Text direction for text bindings."),
            alignment: z.enum(["left", "center", "right"]).optional().describe("Alignment for text bindings."),
          }),
        )
        .optional()
        .describe("Explicit map of field names to layer targets."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("populateTemplate", parameters, 15000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error populating template: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "center-layers",
    "Center one layer, selected layers, or all layers in a composition.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      compIndex: z.number().int().positive().optional().describe("1-based composition index."),
      layerIndex: z.number().int().positive().optional().describe("Target layer index when centering a single layer."),
      layerName: z.string().optional().describe("Target layer name when centering a single layer."),
      selectedOnly: z.boolean().optional().describe("Center only selected layers in the composition."),
      allLayers: z.boolean().optional().describe("Center all layers in the composition."),
      layers: z
        .array(z.union([z.string(), z.number()]))
        .optional()
        .describe("Layer names or 1-based indices to center. Centers all layers if omitted."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("centerLayers", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error centering layers: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Duplicate composition
  server.tool(
    "duplicate-composition",
    "Duplicate an existing composition in the project panel.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      newName: z.string().optional().describe("Name for the duplicated composition"),
    },
    async (params) => {
      try {
        const script = generateDuplicateComposition(params as any);
        const result = await executeExtendScript(script, 15000, "Duplicate Composition");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error duplicating composition: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Delete composition
  server.tool(
    "delete-composition",
    "Delete a composition from the project panel.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
    },
    async (params) => {
      try {
        const script = generateDeleteComposition(params as any);
        const result = await executeExtendScript(script, 15000, "Delete Composition");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error deleting composition: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // List compositions
  server.tool(
    "list-compositions",
    "List all compositions in the project with ID, name, dimensions, frame rate, duration, and layer count.",
    {},
    async () => {
      try {
        const script = generateListCompositions();
        const result = await executeExtendScript(script, 10000, "List Compositions");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error listing compositions: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Get composition info
  server.tool(
    "get-composition-info",
    "Get detailed metadata about a composition.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
    },
    async (params) => {
      try {
        const script = generateGetCompositionInfo(params as any);
        const result = await executeExtendScript(script, 10000, "Get Composition Info");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error getting composition info: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Get composition report
  server.tool(
    "get-comp-report",
    "Generate a comprehensive statistical report for a composition (layer count by type, 3D layer count, effects used, total keyframe count).",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
    },
    async (params) => {
      try {
        const script = generateGetCompReport(params as any);
        const result = await executeExtendScript(script, 15000, "Get Composition Report");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error generating composition report: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Set active composition
  server.tool(
    "set-active-composition",
    "Open and set a composition as the active composition in the viewer.",
    {
      compId: z.number().int().optional().describe("Composition ID"),
      compName: z.string().optional().describe("Composition name"),
    },
    async (params) => {
      try {
        const script = generateSetActiveComposition(params as any);
        const result = await executeExtendScript(script, 10000, "Set Active Composition");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting active composition: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );
}

