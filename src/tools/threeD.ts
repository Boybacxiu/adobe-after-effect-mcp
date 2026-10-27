import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { executeExtendScript } from "../core/bridge.js";
import { bridgeToolResult } from "../lib/bridge-core.js";
import {
  generateSet3DLayer,
  generateSetMaterialOptions,
  generateSetGeometryOptions,
  generateSetCameraOptions,
  generateSetLightOptions,
  generateGet3DInfo,
  generateSetCompRenderer,
} from "../lib/generators/threeDGenerators.js";

const ColorSchema = z.object({
  r: z.number().min(0).max(1).describe("Red channel (0-1)"),
  g: z.number().min(0).max(1).describe("Green channel (0-1)"),
  b: z.number().min(0).max(1).describe("Blue channel (0-1)"),
});

export function registerThreeDTools(server: McpServer): void {
  // Toggle 3D layer switch
  server.tool(
    "set-3d-layer",
    "Toggle the 3D layer switch on a composition layer.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target layer index"),
      layerName: z.string().optional().describe("Target layer name"),
      is3D: z.boolean().describe("Whether the layer should be 3D"),
    },
    async (params) => {
      try {
        const script = generateSet3DLayer(params as any);
        const result = await executeExtendScript(script, 10000, "Set 3D Layer");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error toggling 3D layer: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Set material options
  server.tool(
    "set-material-options",
    "Configure material rendering options on a 3D layer (shadows, light transmission, ambient, diffuse, specular, metal, roughness).",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target 3D layer index"),
      layerName: z.string().optional().describe("Target 3D layer name"),
      castsShadows: z.enum(["off", "on", "only"]).optional().describe("Shadow casting behavior"),
      lightTransmission: z.number().min(0).max(100).optional().describe("Light transmission percentage"),
      acceptsShadows: z.boolean().optional().describe("Whether layer receives shadows"),
      acceptsLights: z.boolean().optional().describe("Whether layer is affected by scene lights"),
      ambient: z.number().min(0).max(100).optional().describe("Ambient reflectance percentage"),
      diffuse: z.number().min(0).max(100).optional().describe("Diffuse reflectance percentage"),
      specular: z.number().min(0).max(100).optional().describe("Specular intensity percentage"),
      shininess: z.number().min(0).max(100).optional().describe("Specular shininess percentage"),
      metal: z.number().min(0).max(100).optional().describe("Metallic coefficient percentage"),
    },
    async (params) => {
      try {
        const script = generateSetMaterialOptions(params as any);
        const result = await executeExtendScript(script, 15000, "Set Material Options");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting material options: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Set geometry options
  server.tool(
    "set-geometry-options",
    "Configure 3D geometry extrusion and bevel properties (Cinema 4D or Ray-traced 3D).",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target layer index"),
      layerName: z.string().optional().describe("Target layer name"),
      extrusionDepth: z.number().min(0).optional().describe("Extrusion depth in pixels"),
      bevelDepth: z.number().min(0).optional().describe("Bevel depth in pixels"),
      bevelStyle: z.enum(["none", "angular", "concave", "convex"]).optional().describe("Bevel style"),
      holeBevelDepth: z.number().min(0).optional().describe("Hole bevel depth in pixels"),
    },
    async (params) => {
      try {
        const script = generateSetGeometryOptions(params as any);
        const result = await executeExtendScript(script, 15000, "Set Geometry Options");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting geometry options: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Set camera options
  server.tool(
    "set-camera-options",
    "Configure camera optical properties (zoom, depth of field, focus distance, aperture, blur level).",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target camera layer index"),
      layerName: z.string().optional().describe("Target camera layer name"),
      zoom: z.number().positive().optional().describe("Camera zoom in pixels"),
      depthOfField: z.boolean().optional().describe("Enable/disable depth of field"),
      focusDistance: z.number().positive().optional().describe("Focus distance in pixels"),
      aperture: z.number().min(0).optional().describe("Aperture size in pixels"),
      blurLevel: z.number().min(0).max(500).optional().describe("Blur level percentage"),
    },
    async (params) => {
      try {
        const script = generateSetCameraOptions(params as any);
        const result = await executeExtendScript(script, 15000, "Set Camera Options");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting camera options: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Set light options
  server.tool(
    "set-light-options",
    "Configure scene light options (intensity, color, cone angle, feather, shadows, darkness, diffusion).",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target light layer index"),
      layerName: z.string().optional().describe("Target light layer name"),
      intensity: z.number().min(0).optional().describe("Light intensity percentage (default 100)"),
      color: ColorSchema.optional().describe("Light color (normalized 0-1)"),
      coneAngle: z.number().min(0).max(180).optional().describe("Cone angle in degrees (spotlights)"),
      coneFeather: z.number().min(0).max(100).optional().describe("Cone feather percentage (spotlights)"),
      castsShadows: z.boolean().optional().describe("Whether light casts shadows"),
      shadowDarkness: z.number().min(0).max(100).optional().describe("Shadow darkness percentage"),
      shadowDiffusion: z.number().min(0).optional().describe("Shadow diffusion blur in pixels"),
    },
    async (params) => {
      try {
        const script = generateSetLightOptions(params as any);
        const result = await executeExtendScript(script, 15000, "Set Light Options");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting light options: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Get 3D info
  server.tool(
    "get-3d-info",
    "Inspect 3D scene properties, active renderer, cameras, and lights in a composition.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
    },
    async (params) => {
      try {
        const script = generateGet3DInfo(params as any);
        const result = await executeExtendScript(script, 10000, "Get 3D Info");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error retrieving 3D scene info: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Set composition renderer
  server.tool(
    "set-comp-renderer",
    "Change the composition 3D renderer (Classic 3D, Cinema 4D, Ray-traced 3D).",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      renderer: z
        .enum(["ADBE Advanced 3d", "ADBE C4D", "ADBE Picasso"])
        .describe("Renderer match name: 'ADBE Advanced 3d' (Classic 3D), 'ADBE C4D' (Cinema 4D), 'ADBE Picasso' (Ray-traced 3D)"),
    },
    async (params) => {
      try {
        const script = generateSetCompRenderer(params as any);
        const result = await executeExtendScript(script, 15000, "Set Composition Renderer");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error changing composition renderer: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );
}
