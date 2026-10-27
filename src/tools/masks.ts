import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { executeExtendScript } from "../core/bridge.js";
import { bridgeToolResult } from "../lib/bridge-core.js";
import {
  generateAddMask,
  generateListMasks,
  generateGetMaskPath,
  generateSetMaskPath,
  generateSetMaskKeyframes,
  generateSetMaskProperties,
  generateDeleteMask,
} from "../lib/generators/maskGenerators.js";

const createPoint2DSchema = () => z.array(z.number()).length(2).describe("[x, y] coordinates");

export function registerMaskTools(server: McpServer): void {
  // Add mask
  server.tool(
    "add-mask",
    "Add a vector mask to a layer with custom shape, mode, opacity, and feather.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target layer index"),
      layerName: z.string().optional().describe("Target layer name"),
      name: z.string().optional().describe("Optional custom mask name"),
      mode: z
        .enum(["NONE", "ADD", "SUBTRACT", "INTERSECT", "LIGHTEN", "DARKEN", "DIFFERENCE"])
        .optional()
        .describe("Mask blend mode (default: 'ADD')"),
      inverted: z.boolean().optional().describe("Invert the mask calculation (default: false)"),
      opacity: z.number().min(0).max(100).optional().describe("Mask opacity percentage (default: 100)"),
      feather: z.union([z.number(), z.array(z.number()).length(2)]).optional().describe("Mask feather in pixels"),
      expansion: z.number().optional().describe("Mask expansion in pixels (default: 0)"),
      shape: z
        .object({
          vertices: z.array(createPoint2DSchema()).min(2).describe("Mask vertices array"),
          inTangents: z.array(createPoint2DSchema()).optional().describe("In-tangents array"),
          outTangents: z.array(createPoint2DSchema()).optional().describe("Out-tangents array"),
          closed: z.boolean().optional().describe("Whether mask is closed (default: true)"),
        })
        .optional()
        .describe("Initial mask shape geometry"),
    },
    async (params) => {
      try {
        const script = generateAddMask(params as any);
        const result = await executeExtendScript(script, 15000, "Add Mask");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error adding mask: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // List masks
  server.tool(
    "list-masks",
    "List all masks on a layer with their index, name, mode, inverted flag, opacity, and locked state.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target layer index"),
      layerName: z.string().optional().describe("Target layer name"),
    },
    async (params) => {
      try {
        const script = generateListMasks(params as any);
        const result = await executeExtendScript(script, 10000, "List Masks");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error listing masks: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Get mask path
  server.tool(
    "get-mask-path",
    "Retrieve the vertices and tangents of a mask path.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target layer index"),
      layerName: z.string().optional().describe("Target layer name"),
      maskIndex: z.number().int().positive().optional().describe("Mask index (1-based)"),
      maskName: z.string().optional().describe("Mask name"),
      time: z.number().optional().describe("Time in seconds to sample mask (or current time if omitted)"),
    },
    async (params) => {
      try {
        const script = generateGetMaskPath(params as any);
        const result = await executeExtendScript(script, 10000, "Get Mask Path");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error retrieving mask path: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Set mask path
  server.tool(
    "set-mask-path",
    "Update the vertices and tangents of an existing mask path.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target layer index"),
      layerName: z.string().optional().describe("Target layer name"),
      maskIndex: z.number().int().positive().optional().describe("Mask index (1-based)"),
      maskName: z.string().optional().describe("Mask name"),
      vertices: z.array(createPoint2DSchema()).min(2).describe("Array of [x, y] vertex coordinates"),
      inTangents: z.array(createPoint2DSchema()).optional().describe("Array of [x, y] in-tangent vectors"),
      outTangents: z.array(createPoint2DSchema()).optional().describe("Array of [x, y] out-tangent vectors"),
      closed: z.boolean().optional().describe("Whether the mask is closed (default: true)"),
      time: z.number().optional().describe("Specific time in seconds to set mask shape (or current time)"),
    },
    async (params) => {
      try {
        const script = generateSetMaskPath(params as any);
        const result = await executeExtendScript(script, 15000, "Set Mask Path");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting mask path: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Set mask keyframes
  server.tool(
    "set-mask-keyframes",
    "Animate an existing mask path across multiple keyframe timepoints.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target layer index"),
      layerName: z.string().optional().describe("Target layer name"),
      maskIndex: z.number().int().positive().optional().describe("Mask index (1-based)"),
      maskName: z.string().optional().describe("Mask name"),
      keyframes: z
        .array(
          z.object({
            time: z.number().describe("Keyframe time in seconds"),
            vertices: z.array(createPoint2DSchema()).min(2).describe("Vertices array"),
            inTangents: z.array(createPoint2DSchema()).optional().describe("In-tangents array"),
            outTangents: z.array(createPoint2DSchema()).optional().describe("Out-tangents array"),
            closed: z.boolean().optional().describe("Closed flag"),
          }),
        )
        .min(1)
        .describe("Array of mask shape keyframe objects"),
    },
    async (params) => {
      try {
        const script = generateSetMaskKeyframes(params as any);
        const result = await executeExtendScript(script, 15000, "Set Mask Keyframes");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting mask keyframes: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Set mask properties
  server.tool(
    "set-mask-properties",
    "Modify mask properties such as mode, feather, opacity, expansion, or inverted.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target layer index"),
      layerName: z.string().optional().describe("Target layer name"),
      maskIndex: z.number().int().positive().optional().describe("Mask index (1-based)"),
      maskName: z.string().optional().describe("Mask name"),
      mode: z
        .enum(["NONE", "ADD", "SUBTRACT", "INTERSECT", "LIGHTEN", "DARKEN", "DIFFERENCE"])
        .optional()
        .describe("Mask blend mode"),
      inverted: z.boolean().optional().describe("Invert flag"),
      opacity: z.number().min(0).max(100).optional().describe("Mask opacity percentage"),
      feather: z.union([z.number(), z.array(z.number()).length(2)]).optional().describe("Mask feather in pixels"),
      expansion: z.number().optional().describe("Mask expansion in pixels"),
      locked: z.boolean().optional().describe("Lock mask"),
    },
    async (params) => {
      try {
        const script = generateSetMaskProperties(params as any);
        const result = await executeExtendScript(script, 15000, "Set Mask Properties");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting mask properties: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Delete mask
  server.tool(
    "delete-mask",
    "Remove a mask from a layer by index or name.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target layer index"),
      layerName: z.string().optional().describe("Target layer name"),
      maskIndex: z.number().int().positive().optional().describe("Mask index (1-based)"),
      maskName: z.string().optional().describe("Mask name"),
    },
    async (params) => {
      try {
        const script = generateDeleteMask(params as any);
        const result = await executeExtendScript(script, 10000, "Delete Mask");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error deleting mask: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );
}
