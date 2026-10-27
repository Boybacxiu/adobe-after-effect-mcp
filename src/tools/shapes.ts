import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { executeExtendScript } from "../core/bridge.js";
import { bridgeToolResult } from "../lib/bridge-core.js";
import {
  generateCreatePath,
  generateGetPath,
  generateSetPathKeyframes,
  generateAddShapeOperator,
} from "../lib/generators/shapeGenerators.js";

const createPoint2DSchema = () => z.array(z.number()).length(2).describe("[x, y] coordinates");

export function registerShapeTools(server: McpServer): void {
  // Create vector path
  server.tool(
    "create-path",
    "Create a vector bezier path on a shape layer with vertices and in/out tangents.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target shape layer index"),
      layerName: z.string().optional().describe("Target shape layer name"),
      shapeGroup: z.string().optional().describe("Shape group name (default: 'Shape 1')"),
      pathName: z.string().optional().describe("Path property name (default: 'Path 1')"),
      vertices: z.array(createPoint2DSchema()).min(2).describe("Array of [x, y] vertex coordinate tuples"),
      inTangents: z.array(createPoint2DSchema()).optional().describe("Array of [x, y] incoming bezier tangent vectors"),
      outTangents: z.array(createPoint2DSchema()).optional().describe("Array of [x, y] outgoing bezier tangent vectors"),
      closed: z.boolean().optional().describe("Whether the path should be closed (default: true)"),
    },
    async (params) => {
      try {
        const script = generateCreatePath(params as any);
        const result = await executeExtendScript(script, 15000, "Create Path");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error creating vector path: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Get vector path
  server.tool(
    "get-path",
    "Retrieve the vertices, tangents, and closed state of a vector shape path.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target shape layer index"),
      layerName: z.string().optional().describe("Target shape layer name"),
      shapeGroup: z.string().optional().describe("Shape group name (default: 'Shape 1')"),
      pathName: z.string().optional().describe("Path property name (default: 'Path 1')"),
      time: z.number().optional().describe("Time in seconds to sample path (or current time if omitted)"),
    },
    async (params) => {
      try {
        const script = generateGetPath(params as any);
        const result = await executeExtendScript(script, 10000, "Get Path");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error retrieving vector path: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Set path keyframes
  server.tool(
    "set-path-keyframes",
    "Animate a vector bezier path across multiple keyframe timepoints.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target shape layer index"),
      layerName: z.string().optional().describe("Target shape layer name"),
      shapeGroup: z.string().optional().describe("Shape group name (default: 'Shape 1')"),
      pathName: z.string().optional().describe("Path property name (default: 'Path 1')"),
      keyframes: z
        .array(
          z.object({
            time: z.number().describe("Keyframe time in seconds"),
            vertices: z.array(createPoint2DSchema()).min(2).describe("Vertices array"),
            inTangents: z.array(createPoint2DSchema()).optional().describe("In-tangents array"),
            outTangents: z.array(createPoint2DSchema()).optional().describe("Out-tangents array"),
            closed: z.boolean().optional().describe("Closed path flag"),
          }),
        )
        .min(1)
        .describe("Array of path keyframe specifications"),
    },
    async (params) => {
      try {
        const script = generateSetPathKeyframes(params as any);
        const result = await executeExtendScript(script, 15000, "Set Path Keyframes");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting path keyframes: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Add shape operator
  server.tool(
    "add-shape-operator",
    "Add a shape operator to a shape layer (trimPaths, repeater, zigzag, roundCorners, twist, wigglePaths, offsetPaths, puckerBloat).",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target shape layer index"),
      layerName: z.string().optional().describe("Target shape layer name"),
      operatorType: z
        .enum([
          "trimPaths",
          "repeater",
          "zigzag",
          "roundCorners",
          "twist",
          "wigglePaths",
          "offsetPaths",
          "puckerBloat",
        ])
        .describe("Operator type to attach"),
      properties: z.record(z.any()).optional().describe("Initial operator properties (e.g. copies, start, end, offset, radius)"),
    },
    async (params) => {
      try {
        const script = generateAddShapeOperator(params as any);
        const result = await executeExtendScript(script, 15000, "Add Shape Operator");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error adding shape operator: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );
}
