import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { executeExtendScript, sendBridgeCommand } from "../core/bridge.js";
import { bridgeToolResult } from "../lib/bridge-core.js";
import {
  generateAddSolidLayer,
  generateAddShapeLayer,
  generateAddNullLayer,
  generateAddLightLayer,
  generateAddAVLayer,
  generateAddTextLayerAdvanced,
  generateListLayers,
  generateGetLayerInfo,
  generateModifyLayer,
} from "../lib/generators/layerGenerators.js";

export function registerLayerTools(server: McpServer): void {
  server.tool(
    "create-text-layer",
    "Create a text layer with full Arabic / RTL support. Direction is auto-detected from the text by default (Arabic -> right-to-left, right-aligned), or force it with `direction`. Works on After Effects in any language.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      text: z.string().describe("The text content. Arabic is fully supported."),
      position: z
        .array(z.number())
        .optional()
        .describe("Layer position [x,y] (default centered ~[960,540])."),
      fontSize: z.number().positive().optional().describe("Font size in pixels (default 72)."),
      color: z
        .array(z.number())
        .optional()
        .describe("Fill color [r,g,b] with each channel 0-1 (default white)."),
      fontFamily: z
        .string()
        .optional()
        .describe(
          "Font family (default 'Arial'). For Arabic use a font that supports Arabic, e.g. 'Arial', 'Tahoma', 'Cairo'.",
        ),
      alignment: z
        .enum(["left", "center", "right"])
        .optional()
        .describe("Paragraph alignment. If omitted and the text is RTL, defaults to 'right'."),
      direction: z
        .enum(["auto", "rtl", "ltr"])
        .optional()
        .describe(
          "Text direction. 'auto' (default) = RTL when the text contains Arabic; 'rtl' / 'ltr' to force.",
        ),
      startTime: z.number().optional().describe("Layer start time in seconds."),
      duration: z.number().positive().optional().describe("Layer duration in seconds (default 5)."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("createTextLayer", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error creating text layer: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "create-adjustment-layer",
    "Create an adjustment layer in the specified composition (or active comp).",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      compIndex: z.number().int().positive().optional().describe("1-based comp index if compName is omitted."),
      name: z.string().optional().describe("Adjustment layer name (default 'Adjustment Layer')."),
      position: z.array(z.number()).optional().describe("Layer position [x,y] or [x,y,z]."),
      size: z.array(z.number()).optional().describe("Layer size [width,height]. Defaults to comp dimensions."),
      duration: z.number().positive().optional().describe("Duration in seconds (default comp duration)."),
      startTime: z.number().optional().describe("Layer start time in seconds (default 0)."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("createAdjustmentLayer", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error creating adjustment layer: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "create-camera",
    "Create a new Camera layer in a composition. Select the comp by compName/compIndex (or active comp).",
    {
      compName: z.string().optional().describe("Composition name (recommended)."),
      compIndex: z.number().int().positive().optional().describe("1-based comp index if compName is omitted."),
      name: z.string().optional().describe("Camera layer name (default 'Camera 1')."),
      zoom: z.number().optional().describe("Zoom in pixels (default ~1777.78, roughly a 50mm lens for 1080p)."),
      position: z.array(z.number()).optional().describe("Camera position [x,y,z]."),
      pointOfInterest: z.array(z.number()).optional().describe("Point of interest [x,y,z] (ignored for one-node cameras)."),
      oneNode: z.boolean().optional().describe("If true, create a one-node camera (no point of interest)."),
      centerPoint: z
        .array(z.number())
        .optional()
        .describe("Initial camera center point [x, y]. Defaults to comp center [width/2, height/2]."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("createCamera", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error creating camera: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "duplicate-layer",
    "Duplicate an existing layer in a composition, optionally renaming the duplicate.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      layerIndex: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("1-based index of the layer to duplicate (or use layerName)."),
      layerName: z.string().optional().describe("Name of the layer to duplicate."),
      newName: z.string().optional().describe("Optional new name for the duplicate layer."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("duplicateLayer", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error duplicating layer: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "delete-layer",
    "Delete a layer from a composition. Target the layer by layerIndex or layerName.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      compIndex: z.number().int().positive().optional().describe("1-based comp index if compName is omitted."),
      layerIndex: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("1-based index of the layer to delete (or use layerName)."),
      layerName: z.string().optional().describe("Name of the layer to delete."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("deleteLayer", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error deleting layer: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "set-layer-parent",
    "Set or remove a layer's parent layer.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      layerIndex: z.number().int().positive().optional().describe("Target layer 1-based index."),
      layerName: z.string().optional().describe("Target layer name."),
      parentLayerIndex: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Parent layer 1-based index (set null/omit to unparent)."),
      parentLayerName: z.string().optional().describe("Parent layer name (or 'none' to unparent)."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("setLayerParent", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting layer parent: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "reorder-layer",
    "Change a layer's stacking order (z-order) within its composition. Provide action (moveToBeginning, moveToEnd, moveBefore, moveAfter) OR toPosition/before/after.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      compIndex: z.number().int().positive().optional().describe("1-based comp index if compName is omitted."),
      layerIndex: z.number().int().positive().optional().describe("Target layer 1-based index to move."),
      layerName: z.string().optional().describe("Target layer name."),
      action: z
        .enum(["moveToBeginning", "moveToEnd", "moveBefore", "moveAfter"])
        .optional()
        .describe("How to reorder the layer."),
      relativeToIndex: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Reference layer index for moveBefore / moveAfter."),
      relativeToName: z
        .string()
        .optional()
        .describe("Reference layer name for moveBefore / moveAfter."),
      toPosition: z
        .enum(["top", "bottom"])
        .optional()
        .describe("Move to the very top (front) or bottom (back) of the stacking order."),
      beforeLayerIndex: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Move directly above (in front of) this layer index."),
      beforeLayerName: z.string().optional().describe("Same as beforeLayerIndex, by name."),
      afterLayerIndex: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Move directly below (behind) this layer index."),
      afterLayerName: z.string().optional().describe("Same as afterLayerIndex, by name."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("reorderLayer", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error reordering layer: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "precompose-layers",
    "Pre-compose one or more layers into a new composition.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      layerIndices: z
        .array(z.number().int().positive())
        .describe("1-based indices of layers to pre-compose."),
      name: z.string().describe("Name for the new pre-composition."),
      moveAllAttributes: z
        .boolean()
        .optional()
        .describe("Whether to move all attributes into the new comp (default true)."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("precomposeLayers", parameters, 10000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error precomposing layers: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "set-layer-mask",
    "Create or modify a mask on a layer. Provide the shape as maskRect (rectangle shorthand), maskPath, or shape geometry.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      compIndex: z.number().int().positive().optional().describe("1-based comp index if compName is omitted."),
      layerIndex: z.number().int().positive().optional().describe("Target layer 1-based index."),
      layerName: z.string().optional().describe("Target layer name."),
      maskIndex: z.number().int().positive().optional().describe("Mask index to modify (default: add new mask)."),
      maskRect: z
        .object({
          top: z.number().optional(),
          left: z.number().optional(),
          width: z.number().optional(),
          height: z.number().optional(),
        })
        .optional()
        .describe("Rectangle shorthand {top,left,width,height} in layer pixels."),
      maskPath: z
        .array(z.array(z.number()))
        .optional()
        .describe("Array of [x,y] vertices defining the mask shape (>= 3 points)."),
      maskMode: z
        .enum(["none", "add", "subtract", "intersect", "lighten", "darken", "difference"])
        .optional()
        .describe("Mask blend mode (default 'add')."),
      inverted: z.boolean().optional().describe("Whether the mask is inverted."),
      feather: z.array(z.number()).optional().describe("Mask feather [x, y] in pixels."),
      maskFeather: z.array(z.number()).optional().describe("Alias for feather [x,y] in pixels."),
      opacity: z.number().min(0).max(100).optional().describe("Mask opacity (0-100)."),
      maskOpacity: z.number().min(0).max(100).optional().describe("Alias for mask opacity (0-100)."),
      expansion: z.number().optional().describe("Mask expansion in pixels."),
      maskExpansion: z.number().optional().describe("Alias for mask expansion in pixels."),
      maskName: z.string().optional().describe("Optional mask name."),
      shape: z
        .object({
          vertices: z.array(z.array(z.number())).describe("Array of [x,y] vertex coordinates."),
          inTangents: z.array(z.array(z.number())).optional().describe("Array of [x,y] in-tangent vectors."),
          outTangents: z.array(z.array(z.number())).optional().describe("Array of [x,y] out-tangent vectors."),
          closed: z.boolean().optional().describe("Whether the mask path is closed (default true)."),
        })
        .optional()
        .describe("Mask shape geometry."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("setLayerMask", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting layer mask: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "batch-set-layer-properties",
    "Set multiple properties across one or more layers in a single undo transaction. Supports both `operations` and `updates` array formats.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      compIndex: z.number().int().positive().optional().describe("1-based comp index if compName is omitted."),
      operations: z
        .array(
          z.object({
            layerIndex: z.number().int().positive().optional().describe("1-based layer index."),
            layerName: z.string().optional().describe("Layer name (alternative to layerIndex)."),
            threeDLayer: z.boolean().optional().describe("Enable/disable 3D for the layer."),
            position: z.array(z.number()).optional().describe("Position [x,y] or [x,y,z]."),
            scale: z.array(z.number()).optional().describe("Scale [w,h] or [w,h,d] in percent."),
            rotation: z.number().optional().describe("Rotation in degrees (Z rotation if 3D)."),
            opacity: z.number().optional().describe("Opacity 0-100."),
            blendMode: z
              .enum([
                "normal",
                "add",
                "multiply",
                "screen",
                "overlay",
                "softLight",
                "hardLight",
                "darken",
                "lighten",
                "difference",
              ])
              .optional()
              .describe("Blending mode."),
            startTime: z.number().optional().describe("Layer start time in seconds."),
            outPoint: z.number().optional().describe("Layer out point in seconds."),
          }),
        )
        .optional()
        .describe("Array of per-layer property operations."),
      updates: z
        .array(
          z.object({
            layerIndex: z.number().int().positive().optional(),
            layerName: z.string().optional(),
            properties: z.record(z.any()),
          }),
        )
        .optional()
        .describe("List of layer updates to apply."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("batchSetLayerProperties", parameters, 12000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error batch updating layer properties: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "inspect-layer",
    "Deeply inspect a specific layer: transforms, materials, layer switches, effects, masks, and properties.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      layerIndex: z.number().int().positive().optional().describe("1-based layer index."),
      layerName: z.string().optional().describe("Target layer name."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("getLayerFull", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error inspecting layer: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get-layer-clip-frames",
    "Get frame information for a layer (inPoint, outPoint, startTime, duration, startFrame, endFrame).",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      compIndex: z.number().int().positive().optional().describe("1-based composition index if compName is omitted."),
      layerIndex: z.number().int().positive().optional().describe("1-based layer index."),
      layerName: z.string().optional().describe("Target layer name."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("getLayerClipFrames", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error getting layer clip frames: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  const createNormalizedColorSchema = () =>
    z.object({
      r: z.number().min(0).max(1).describe("Red (0-1)"),
      g: z.number().min(0).max(1).describe("Green (0-1)"),
      b: z.number().min(0).max(1).describe("Blue (0-1)"),
      a: z.number().min(0).max(1).optional().describe("Alpha (0-1)"),
    });

  // Add solid layer
  server.tool(
    "add-solid-layer",
    "Add a new solid layer with custom color, size, and duration.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      name: z.string().describe("Solid layer name"),
      color: createNormalizedColorSchema().describe("Solid RGB color (values 0-1)"),
      width: z.number().int().positive().optional().describe("Width in pixels (defaults to comp width)"),
      height: z.number().int().positive().optional().describe("Height in pixels (defaults to comp height)"),
      pixelAspect: z.number().positive().optional().describe("Pixel aspect ratio (default: 1.0)"),
      duration: z.number().positive().optional().describe("Duration in seconds (defaults to comp duration)"),
    },
    async (params) => {
      try {
        const script = generateAddSolidLayer(params as any);
        const result = await executeExtendScript(script, 15000, "Add Solid Layer");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error adding solid layer: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Add shape layer
  server.tool(
    "add-shape-layer",
    "Add a new shape layer to a composition.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      name: z.string().optional().describe("Shape layer name"),
    },
    async (params) => {
      try {
        const script = generateAddShapeLayer(params as any);
        const result = await executeExtendScript(script, 15000, "Add Shape Layer");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error adding shape layer: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Add null layer
  server.tool(
    "add-null-layer",
    "Add a null object layer to a composition for parenting and rigging.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      name: z.string().optional().describe("Null layer name (default: 'Null')"),
      duration: z.number().positive().optional().describe("Duration in seconds (defaults to comp duration)"),
    },
    async (params) => {
      try {
        const script = generateAddNullLayer(params as any);
        const result = await executeExtendScript(script, 15000, "Add Null Layer");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error adding null layer: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Add light layer
  server.tool(
    "add-light-layer",
    "Add a 3D light layer (point, spot, parallel, ambient) to a composition.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      name: z.string().describe("Light layer name"),
      lightType: z.enum(["POINT", "SPOT", "PARALLEL", "AMBIENT"]).optional().describe("Light type (default: 'POINT')"),
      centerPoint: z.array(z.number()).length(2).optional().describe("Initial [x, y] light position"),
    },
    async (params) => {
      try {
        const script = generateAddLightLayer(params as any);
        const result = await executeExtendScript(script, 15000, "Add Light Layer");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error adding light layer: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Add AV layer
  server.tool(
    "add-av-layer",
    "Add a footage item from the project panel as an AV layer in a composition.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      footageId: z.number().int().optional().describe("Project item ID of the footage"),
      footageName: z.string().optional().describe("Name of the footage item"),
      startTime: z.number().optional().describe("Start time in seconds on the timeline (default: 0)"),
    },
    async (params) => {
      try {
        const script = generateAddAVLayer(params as any);
        const result = await executeExtendScript(script, 15000, "Add AV Layer");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error adding AV layer: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Add text layer advanced
  server.tool(
    "add-text-layer-advanced",
    "Add a text layer with comprehensive typography controls (font, size, justification, tracking, stroke, fill color).",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      text: z.string().describe("Text content"),
      fontSize: z.number().positive().optional().describe("Font size in pixels"),
      font: z.string().optional().describe("Font PostScript name (e.g. 'HelveticaNeue-Bold')"),
      fillColor: createNormalizedColorSchema().optional().describe("Fill color (normalized 0-1)"),
      strokeColor: createNormalizedColorSchema().optional().describe("Stroke color (normalized 0-1)"),
      strokeWidth: z.number().min(0).optional().describe("Stroke width in pixels"),
      justification: z
        .enum([
          "LEFT",
          "CENTER",
          "RIGHT",
          "FULL_JUSTIFY_LASTLINE_LEFT",
          "FULL_JUSTIFY_LASTLINE_CENTER",
          "FULL_JUSTIFY_LASTLINE_RIGHT",
          "FULL_JUSTIFY_LASTLINE_FULL",
        ])
        .optional()
        .describe("Paragraph justification (default: 'LEFT')"),
      tracking: z.number().optional().describe("Letter tracking / spacing"),
      position: z.array(z.number()).length(2).optional().describe("Layer position [x, y]"),
    },
    async (params) => {
      try {
        const script = generateAddTextLayerAdvanced(params as any);
        const result = await executeExtendScript(script, 15000, "Add Advanced Text Layer");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error adding advanced text layer: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // List layers
  server.tool(
    "list-layers",
    "List all layers in a composition with index, name, type, and timeline states.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
    },
    async (params) => {
      try {
        const script = generateListLayers(params as any);
        const result = await executeExtendScript(script, 10000, "List Layers");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error listing layers: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Get layer info
  server.tool(
    "get-layer-info",
    "Get detailed metadata about a layer (type, in/out points, duration, 3D state, transform properties).",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target layer index"),
      layerName: z.string().optional().describe("Target layer name"),
    },
    async (params) => {
      try {
        const script = generateGetLayerInfo(params as any);
        const result = await executeExtendScript(script, 10000, "Get Layer Info");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error getting layer info: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Modify layer
  server.tool(
    "modify-layer",
    "Modify layer timing and attributes (inPoint, outPoint, startTime, stretch, blendMode, trackMatteType).",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target layer index"),
      layerName: z.string().optional().describe("Target layer name"),
      inPoint: z.number().optional().describe("In point in seconds"),
      outPoint: z.number().optional().describe("Out point in seconds"),
      startTime: z.number().optional().describe("Start time on timeline in seconds"),
      stretch: z.number().optional().describe("Stretch percentage (default: 100)"),
      enabled: z.boolean().optional().describe("Layer visibility enabled flag"),
      solo: z.boolean().optional().describe("Solo layer flag"),
      shy: z.boolean().optional().describe("Shy layer flag"),
      locked: z.boolean().optional().describe("Lock layer flag"),
      blendMode: z.string().optional().describe("Layer blend mode (e.g. 'NORMAL', 'MULTIPLY', 'SCREEN', 'OVERLAY')"),
    },
    async (params) => {
      try {
        const script = generateModifyLayer(params as any);
        const result = await executeExtendScript(script, 15000, "Modify Layer");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error modifying layer: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );
}

