import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as fs from "fs";
import { z } from "zod";
import { executeExtendScript, sendBridgeCommand } from "../core/bridge.js";
import { LayerIdentifierSchema } from "../core/types.js";
import {
  amplitudeAtTime,
  buildPeakKeyframes,
  buildWaveformKeyframes,
} from "../lib/audio-reactive.js";
import { bridgeToolResult } from "../lib/bridge-core.js";
import {
  buildDataSeriesKeyframes,
  evenlySpacedPoints,
} from "../lib/data-keyframes.js";
import { analyzeWavBuffer } from "../lib/wav.js";
import {
  generateApplyExpressionTemplate,
  generateLinkProperties,
  generateBatchSetExpressions,
  generateAddExpressionControl,
  generateGetExpression,
  generateRemoveExpression,
  generateEnableExpression,
  getExpressionTemplates,
  generateSetKeyframeAdvanced,
  generateApplyEasyEase,
  generateSetTemporalEase,
  generateOffsetKeyframes,
  generateScaleKeyframeTiming,
  generateReverseKeyframes,
  generateCopyKeyframes,
  generateGetKeyframes,
  generateAddCompositionMarker,
  generateAddLayerMarker,
  generateGetMarkers,
  generateDeleteMarker,
  generateSetWorkArea,
  generateGetCurrentTime,
  generateSetCurrentTime,
  generateSnapToMarker,
  generateGetNearestMarker,
  generateNavigateMarkers,
} from "../lib/generators/index.js";
import {
  SPRING_PRESETS,
  generateSpringExpression,
  calculateSpringDuration,
  EXPRESSION_LIBRARY,
} from "../lib/presets/index.js";

export function registerAnimationTools(server: McpServer): void {
  server.tool(
    "setLayerKeyframe",
    "Set a keyframe for a specific layer property at a given time.",
    {
      ...LayerIdentifierSchema,
      propertyName: z
        .string()
        .describe("Name of the property to keyframe (e.g., 'Position', 'Scale', 'Rotation', 'Opacity')."),
      timeInSeconds: z.number().describe("Time at which to set the keyframe in seconds."),
      propertyValue: z
        .any()
        .describe("Value of the keyframe. Can be a single number (for Opacity/Rotation) or an array (for Position/Scale)."),
      easeType: z
        .enum(["linear", "easeIn", "easeOut", "easeInOut"])
        .optional()
        .describe("Type of keyframe easing to apply (default: 'linear')."),
    },
    async (params) => {
      try {
        const result = await sendBridgeCommand("setLayerKeyframe", params, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error queuing keyframe setting: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "setLayerExpression",
    "Set or remove an expression for a specific layer property.",
    {
      ...LayerIdentifierSchema,
      propertyName: z
        .string()
        .describe("Name of the property to apply the expression to (e.g., 'Position', 'Scale', 'Rotation', 'Opacity')."),
      expressionString: z
        .string()
        .describe("The ExtendScript expression string to apply. Pass an empty string to remove expression."),
      enabled: z
        .boolean()
        .optional()
        .describe("Whether the expression should be enabled (default: true)."),
    },
    async (params) => {
      try {
        const result = await sendBridgeCommand("setLayerExpression", params, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error queuing expression setting: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "test-animation",
    "Test animation functionality in After Effects",
    {
      operation: z.enum(["keyframe", "expression"]).describe("The animation operation to test"),
      compIndex: z.number().int().positive().describe("Composition index (usually 1)"),
      layerIndex: z.number().int().positive().describe("Layer index (usually 1)"),
      propertyName: z.string().describe("Property name to animate (Position, Scale, Rotation, Opacity)"),
      keyframes: z
        .array(
          z.object({
            time: z.number().describe("Time in seconds"),
            value: z.any().describe("Value for the keyframe"),
          }),
        )
        .optional()
        .describe("Keyframes to set (required for 'keyframe' operation)"),
      expression: z.string().optional().describe("Expression string (required for 'expression' operation)"),
    },
    async (params) => {
      try {
        const operation = params.operation;
        if (operation === "keyframe") {
          if (!params.keyframes || params.keyframes.length === 0) {
            return {
              content: [{ type: "text", text: "Error: Keyframes are required for keyframe operation" }],
              isError: true,
            };
          }
          const results = [];
          for (const kf of params.keyframes) {
            const result = await sendBridgeCommand(
              "setLayerKeyframe",
              {
                compIndex: params.compIndex,
                layerIndex: params.layerIndex,
                propertyName: params.propertyName,
                timeInSeconds: kf.time,
                propertyValue: kf.value,
              },
              8000,
              250,
            );
            results.push(result);
          }
          return {
            content: [{ type: "text", text: `Applied ${results.length} keyframes successfully.` }],
          };
        } else if (operation === "expression") {
          if (!params.expression) {
            return {
              content: [{ type: "text", text: "Error: Expression string is required for expression operation" }],
              isError: true,
            };
          }
          const result = await sendBridgeCommand(
            "setLayerExpression",
            {
              compIndex: params.compIndex,
              layerIndex: params.layerIndex,
              propertyName: params.propertyName,
              expressionString: params.expression,
              enabled: true,
            },
            8000,
            250,
          );
          return bridgeToolResult(result);
        } else {
          return {
            content: [{ type: "text", text: `Unknown operation: ${operation}` }],
            isError: true,
          };
        }
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error testing animation: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "animate-to-audio",
    "Drive a layer property from a WAV audio file.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      layerIndex: z.number().int().positive().optional().describe("1-based layer index."),
      layerName: z.string().optional().describe("Target layer name."),
      propertyName: z.string().describe("Property to animate (e.g. 'Scale', 'Opacity', 'Position')."),
      wavPath: z.string().describe("Absolute path to an uncompressed 16-bit or 24-bit PCM WAV file."),
      mode: z
        .enum(["peaks", "envelope", "threshold"])
        .optional()
        .describe("Audio extraction mode (default: 'envelope')."),
      minOutput: z.any().optional().describe("Output value at silence (default 0)."),
      maxOutput: z.any().optional().describe("Output value at peak (default 100)."),
      threshold: z.number().min(0).max(1).optional().describe("Threshold level for 'threshold' mode (0-1)."),
      fps: z.number().positive().optional().describe("Keyframe sampling rate in fps (default 30)."),
      timeOffset: z.number().optional().describe("Start time offset in seconds in the comp."),
    },
    async (parameters) => {
      try {
        if (!fs.existsSync(parameters.wavPath)) {
          return {
            content: [{ type: "text", text: `WAV file not found at path: ${parameters.wavPath}` }],
            isError: true,
          };
        }
        const buf = fs.readFileSync(parameters.wavPath);
        const analysis = analyzeWavBuffer(buf);
        if (!analysis) {
          return {
            content: [{ type: "text", text: "Failed to decode WAV file: invalid format or unsupported bit depth." }],
            isError: true,
          };
        }

        let keyframes: Array<{ time: number; value: any }> = [];

        if (parameters.mode === "peaks") {
          const amplitudes = analysis.peakTimes.map((t) =>
            amplitudeAtTime(analysis.waveformPoints, t),
          );
          keyframes = buildPeakKeyframes(
            analysis.peakTimes,
            {
              baselineValue: Number(parameters.minOutput ?? 0),
              peakValue: Number(parameters.maxOutput ?? 100),
              startTime: parameters.timeOffset ?? 0,
            },
            amplitudes,
          );
        } else {
          keyframes = buildWaveformKeyframes(
            analysis.waveformPoints,
            {
              outputMin: Number(parameters.minOutput ?? 0),
              outputMax: Number(parameters.maxOutput ?? 100),
              startTime: parameters.timeOffset ?? 0,
            },
          );
        }

        const result = await sendBridgeCommand(
          "batchSetLayerKeyframes",
          {
            compName: parameters.compName,
            layerIndex: parameters.layerIndex,
            layerName: parameters.layerName,
            propertyName: parameters.propertyName,
            keyframes,
          },
          25000,
          250,
        );
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error animating to audio: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "animate-from-data",
    "Drive a layer property from an array of numbers or time/value data points.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      layerIndex: z.number().int().positive().optional().describe("Target layer index."),
      layerName: z.string().optional().describe("Target layer name."),
      propertyName: z.string().describe("Property to animate (e.g. 'Position', 'Scale', 'Opacity')."),
      data: z
        .array(z.union([z.number(), z.object({ time: z.number(), value: z.any() })]))
        .describe("Array of numeric values or {time, value} objects."),
      duration: z
        .number()
        .positive()
        .optional()
        .describe("Total animation duration (seconds) if providing raw numbers."),
      startTime: z.number().optional().describe("Start time offset in seconds (default 0)."),
      minOutput: z.any().optional().describe("Optional minimum output value scaling."),
      maxOutput: z.any().optional().describe("Optional maximum output value scaling."),
    },
    async (parameters) => {
      try {
        let points: Array<{ time: number; value: any }> = [];
        if (typeof parameters.data[0] === "number") {
          const vals = parameters.data as number[];
          const duration = parameters.duration ?? 5;
          const interval = vals.length > 1 ? duration / (vals.length - 1) : duration;
          points = evenlySpacedPoints(vals, interval, parameters.startTime ?? 0);
        } else {
          points = parameters.data as Array<{ time: number; value: any }>;
        }

        const keyframes = buildDataSeriesKeyframes(points, {
          outputMin: Number(parameters.minOutput ?? 0),
          outputMax: Number(parameters.maxOutput ?? 100),
          startTime: parameters.startTime ?? 0,
        });

        const result = await sendBridgeCommand(
          "batchSetLayerKeyframes",
          {
            compName: parameters.compName,
            layerIndex: parameters.layerIndex,
            layerName: parameters.layerName,
            propertyName: parameters.propertyName,
            keyframes,
          },
          15000,
          250,
        );
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error animating from data: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "add-marker",
    "Add a timeline marker to a composition or to a specific layer.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      compIndex: z.number().int().positive().optional().describe("1-based composition index if compName is omitted."),
      layerIndex: z.number().int().positive().optional().describe("Layer index (omit for comp marker)."),
      layerName: z.string().optional().describe("Layer name (omit for comp marker)."),
      timeInSeconds: z.number().describe("Time at which to place the marker in seconds."),
      comment: z.string().optional().describe("Marker comment or label text."),
      duration: z.number().min(0).optional().describe("Marker duration in seconds (default 0)."),
      chapter: z.string().optional().describe("Chapter name (if applicable)."),
      url: z.string().optional().describe("Web link URL (if applicable)."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("addMarker", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error adding marker: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "add-markers-bulk",
    "Add multiple markers to a composition or layer in a single undo step. Use this after analyze-audio-waveform to place markers at detected peaks, or to add any set of markers.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      compIndex: z.number().int().positive().optional().describe("1-based composition index if compName is omitted."),
      markerType: z.enum(["layer", "comp"]).optional().describe("'layer' (default) or 'comp' for composition-level markers."),
      layerIndex: z.number().int().positive().optional().describe("Layer index (omit for comp marker)."),
      layerName: z.string().optional().describe("Layer name (omit for comp marker)."),
      markers: z
        .array(
          z.object({
            time: z.number().optional().describe("Time in seconds."),
            timeInSeconds: z.number().optional().describe("Alias for time in seconds."),
            comment: z.string().optional().describe("Label or comment text."),
            duration: z.number().min(0).optional().describe("Duration in seconds (0 = point marker)."),
            label: z.number().int().min(0).max(16).optional().describe("Label color index (0-16)."),
            chapter: z.string().optional().describe("Chapter name."),
            url: z.string().optional().describe("URL link."),
          }),
        )
        .describe("Array of marker descriptors."),
    },
    async (parameters) => {
      try {
        // Ensure each marker has time/timeInSeconds normalized
        const normalized = {
          ...parameters,
          markers: parameters.markers.map((m) => ({
            ...m,
            time: m.time ?? m.timeInSeconds ?? 0,
            timeInSeconds: m.timeInSeconds ?? m.time ?? 0,
          })),
        };
        const result = await sendBridgeCommand("addMarkersBulk", normalized, 10000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error adding bulk markers: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Apply spring animation
  server.tool(
    "apply-spring-animation",
    "Apply a physics-based spring animation expression to a layer property using Remotion spring physics or presets (gentle, default, wobbly, stiff, slow, bouncy, snappy).",
    {
      ...LayerIdentifierSchema,
      property: z.string().describe("Property name (e.g., 'position', 'scale', 'rotation', 'opacity')"),
      preset: z
        .enum(["gentle", "default", "wobbly", "stiff", "slow", "bouncy", "snappy"])
        .optional()
        .describe("Spring preset configuration"),
      mass: z.number().positive().optional().describe("Spring mass (default: 1.0)"),
      stiffness: z.number().positive().optional().describe("Spring stiffness / tension (default: 100.0)"),
      damping: z.number().positive().optional().describe("Spring damping / friction (default: 10.0)"),
      fromValue: z.union([z.number(), z.array(z.number())]).describe("Starting value (scalar or array)"),
      toValue: z.union([z.number(), z.array(z.number())]).describe("Target destination value (scalar or array)"),
      startTime: z.number().min(0).optional().describe("Animation start time in seconds (default: 0)"),
    },
    async (params) => {
      try {
        let config = params.preset ? { ...SPRING_PRESETS[params.preset] } : { mass: 1, stiffness: 100, damping: 10, overshoot: true };
        if (params.mass !== undefined) config.mass = params.mass;
        if (params.stiffness !== undefined) config.stiffness = params.stiffness;
        if (params.damping !== undefined) config.damping = params.damping;

        const expr = generateSpringExpression(config, params.fromValue, params.toValue, params.startTime || 0);
        const result = await sendBridgeCommand(
          "setLayerExpression",
          {
            ...params,
            propertyName: params.property,
            expressionString: expr,
            enabled: true,
          },
          10000,
          250,
        );
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error applying spring animation: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // List spring presets
  server.tool(
    "list-spring-presets",
    "List all available spring physics animation configurations (mass, stiffness, damping, overshoot).",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(SPRING_PRESETS, null, 2),
          },
        ],
      };
    },
  );

  // Calculate spring duration
  server.tool(
    "calculate-spring-duration",
    "Calculate the settling duration in seconds for a given spring configuration.",
    {
      preset: z.enum(["gentle", "default", "wobbly", "stiff", "slow", "bouncy", "snappy"]).optional(),
      mass: z.number().positive().optional(),
      stiffness: z.number().positive().optional(),
      damping: z.number().positive().optional(),
      threshold: z.number().positive().optional().describe("Settling threshold delta (default: 0.01)"),
    },
    async (params) => {
      let config = params.preset ? { ...SPRING_PRESETS[params.preset] } : { mass: 1, stiffness: 100, damping: 10, overshoot: true };
      if (params.mass !== undefined) config.mass = params.mass;
      if (params.stiffness !== undefined) config.stiffness = params.stiffness;
      if (params.damping !== undefined) config.damping = params.damping;

      const duration = calculateSpringDuration(config, params.threshold || 0.01);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ config, settlingDurationSeconds: Math.round(duration * 1000) / 1000 }, null, 2),
          },
        ],
      };
    },
  );

  // Apply expression template
  server.tool(
    "apply-expression-template",
    "Apply a pre-configured expression from the library to a layer property (e.g. overshoot, bounce, bounceBack, inertia, springy, speedControl, wiggle, loopCycle, clock, countdown).",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Layer index"),
      layerName: z.string().optional().describe("Layer name"),
      property: z.string().describe("Target property (e.g. 'rotation', 'position', 'scale', 'opacity')"),
      template: z.string().describe("Template name from expression library"),
      params: z.record(z.any()).optional().describe("Parameters for template placeholders"),
    },
    async (params) => {
      try {
        const script = generateApplyExpressionTemplate(params as any);
        const result = await executeExtendScript(script, 15000, "Apply Expression Template");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error applying expression template: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // List expression templates
  server.tool(
    "list-expression-templates",
    "List all available built-in expression templates with descriptions and default parameters.",
    {},
    async () => {
      const templates = getExpressionTemplates();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(templates, null, 2),
          },
        ],
      };
    },
  );

  // Batch set expressions
  server.tool(
    "batch-set-expressions",
    "Set multiple expressions across properties on a layer in a single atomic operation.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Layer index"),
      layerName: z.string().optional().describe("Layer name"),
      expressions: z
        .array(
          z.object({
            property: z.string().describe("Property name or path"),
            expression: z.string().describe("Expression code to set"),
            enabled: z.boolean().optional().describe("Enable expression (default: true)"),
          }),
        )
        .min(1)
        .describe("Array of property-expression mappings"),
    },
    async (params) => {
      try {
        const script = generateBatchSetExpressions(params as any);
        const result = await executeExtendScript(script, 15000, "Batch Set Expressions");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error batch setting expressions: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Link properties
  server.tool(
    "link-properties",
    "Intelligently link a property to another layer's property with optional offset, multiplier, or custom expression wrapper.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      sourceLayerIndex: z.number().int().positive().optional().describe("Source layer index"),
      sourceLayerName: z.string().optional().describe("Source layer name"),
      sourceProperty: z.string().describe("Source property name"),
      targetLayerName: z.string().describe("Target layer name to reference"),
      targetProperty: z.string().optional().describe("Target property name (defaults to source property name)"),
      offset: z.union([z.number(), z.array(z.number())]).optional().describe("Optional value offset"),
      multiplier: z.number().optional().describe("Optional multiplier factor"),
      expression: z.string().optional().describe("Custom expression template using {{target}}"),
    },
    async (params) => {
      try {
        const script = generateLinkProperties(params as any);
        const result = await executeExtendScript(script, 15000, "Link Properties");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error linking properties: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Add expression control
  server.tool(
    "add-expression-control",
    "Add an expression control effect (slider, angle, color, checkbox, point, 3dPoint, layer) to a layer.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Layer index"),
      layerName: z.string().optional().describe("Layer name"),
      controlType: z
        .enum(["slider", "angle", "color", "checkbox", "point", "3dPoint", "layer"])
        .describe("Type of control effect"),
      name: z.string().optional().describe("Custom name for the control effect"),
      value: z.any().optional().describe("Initial control value"),
    },
    async (params) => {
      try {
        const script = generateAddExpressionControl(params as any);
        const result = await executeExtendScript(script, 15000, "Add Expression Control");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error adding expression control: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Get expression
  server.tool(
    "get-expression",
    "Retrieve the current expression, enabled state, and error message from a layer property.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Layer index"),
      layerName: z.string().optional().describe("Layer name"),
      property: z.string().describe("Property name or path"),
    },
    async (params) => {
      try {
        const script = generateGetExpression(params as any);
        const result = await executeExtendScript(script, 10000, "Get Expression");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error retrieving expression: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Remove expression
  server.tool(
    "remove-expression",
    "Remove an expression from a layer property.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Layer index"),
      layerName: z.string().optional().describe("Layer name"),
      property: z.string().describe("Property name or path"),
    },
    async (params) => {
      try {
        const script = generateRemoveExpression(params as any);
        const result = await executeExtendScript(script, 10000, "Remove Expression");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error removing expression: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Enable/disable expression
  server.tool(
    "enable-expression",
    "Enable or disable an expression on a property without deleting the code.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Layer index"),
      layerName: z.string().optional().describe("Layer name"),
      property: z.string().describe("Property name or path"),
      enabled: z.boolean().describe("Whether expression should be active"),
    },
    async (params) => {
      try {
        const script = generateEnableExpression(params as any);
        const result = await executeExtendScript(script, 10000, "Enable Expression");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error toggling expression state: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Set keyframe advanced
  server.tool(
    "set-keyframe-advanced",
    "Set a keyframe with advanced temporal and spatial easing properties.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Layer index"),
      layerName: z.string().optional().describe("Layer name"),
      property: z.string().describe("Property name"),
      time: z.number().describe("Time in seconds"),
      value: z.any().describe("Keyframe value (scalar, array, or {x, y, z})"),
      interpolation: z.enum(["LINEAR", "BEZIER", "HOLD"]).optional().describe("Interpolation type"),
      inEase: z.object({ speed: z.number(), influence: z.number() }).optional().describe("In-ease parameters"),
      outEase: z.object({ speed: z.number(), influence: z.number() }).optional().describe("Out-ease parameters"),
    },
    async (params) => {
      try {
        const script = generateSetKeyframeAdvanced(params as any);
        const result = await executeExtendScript(script, 15000, "Set Keyframe Advanced");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting advanced keyframe: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Apply easy ease
  server.tool(
    "apply-easy-ease",
    "Apply Easy Ease, Easy Ease In, or Easy Ease Out to keyframes on a property.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Layer index"),
      layerName: z.string().optional().describe("Layer name"),
      property: z.string().describe("Property name"),
      keyIndices: z.array(z.number().int().positive()).optional().describe("Specific 1-based key indices (or all if omitted)"),
      easeType: z.enum(["both", "in", "out"]).optional().describe("Ease type (default: 'both')"),
    },
    async (params) => {
      try {
        const script = generateApplyEasyEase(params as any);
        const result = await executeExtendScript(script, 15000, "Apply Easy Ease");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error applying easy ease: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Set temporal ease
  server.tool(
    "set-temporal-ease",
    "Fine-tune incoming and outgoing temporal easing curves (speed and influence) for keyframes.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Layer index"),
      layerName: z.string().optional().describe("Layer name"),
      property: z.string().describe("Property name"),
      keyIndex: z.number().int().positive().describe("1-based keyframe index"),
      inSpeed: z.number().optional().describe("Incoming velocity"),
      inInfluence: z.number().min(0.1).max(100).optional().describe("Incoming influence (0.1 to 100)"),
      outSpeed: z.number().optional().describe("Outgoing velocity"),
      outInfluence: z.number().min(0.1).max(100).optional().describe("Outgoing influence (0.1 to 100)"),
    },
    async (params) => {
      try {
        const script = generateSetTemporalEase(params as any);
        const result = await executeExtendScript(script, 15000, "Set Temporal Ease");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting temporal ease: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Offset keyframes
  server.tool(
    "offset-keyframes",
    "Shift the timing of all or selected keyframes on a property by a delta time in seconds.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Layer index"),
      layerName: z.string().optional().describe("Layer name"),
      property: z.string().describe("Property name"),
      offsetSeconds: z.number().describe("Time shift in seconds (positive to delay, negative to advance)"),
      keyIndices: z.array(z.number().int().positive()).optional().describe("Specific key indices (or all if omitted)"),
    },
    async (params) => {
      try {
        const script = generateOffsetKeyframes(params as any);
        const result = await executeExtendScript(script, 15000, "Offset Keyframes");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error offsetting keyframes: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Scale keyframe timing
  server.tool(
    "scale-keyframe-timing",
    "Stretch or compress keyframe animation timing by a scale factor relative to an anchor time.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Layer index"),
      layerName: z.string().optional().describe("Layer name"),
      property: z.string().describe("Property name"),
      scaleFactor: z.number().positive().describe("Scaling multiplier (e.g. 2.0 = double duration, 0.5 = half duration)"),
      anchorTime: z.number().optional().describe("Anchor point time in seconds (default: first keyframe time)"),
    },
    async (params) => {
      try {
        const script = generateScaleKeyframeTiming(params as any);
        const result = await executeExtendScript(script, 15000, "Scale Keyframe Timing");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error scaling keyframe timing: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Reverse keyframes
  server.tool(
    "reverse-keyframes",
    "Reverse the order of keyframes on a property so the animation plays backwards.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Layer index"),
      layerName: z.string().optional().describe("Layer name"),
      property: z.string().describe("Property name"),
    },
    async (params) => {
      try {
        const script = generateReverseKeyframes(params as any);
        const result = await executeExtendScript(script, 15000, "Reverse Keyframes");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error reversing keyframes: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Copy keyframes
  server.tool(
    "copy-keyframes",
    "Copy all keyframes from one layer property to another layer property.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      sourceLayerIndex: z.number().int().positive().optional().describe("Source layer index"),
      sourceLayerName: z.string().optional().describe("Source layer name"),
      sourceProperty: z.string().describe("Source property name"),
      targetLayerIndex: z.number().int().positive().optional().describe("Target layer index"),
      targetLayerName: z.string().optional().describe("Target layer name"),
      targetProperty: z.string().optional().describe("Target property name (defaults to source property)"),
      timeOffset: z.number().optional().describe("Time offset for pasted keyframes in seconds"),
    },
    async (params) => {
      try {
        const script = generateCopyKeyframes(params as any);
        const result = await executeExtendScript(script, 15000, "Copy Keyframes");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error copying keyframes: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Get keyframes
  server.tool(
    "get-keyframes",
    "Inspect all keyframes on a property including times, values, and interpolation types.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Layer index"),
      layerName: z.string().optional().describe("Layer name"),
      property: z.string().describe("Property name"),
    },
    async (params) => {
      try {
        const script = generateGetKeyframes(params as any);
        const result = await executeExtendScript(script, 10000, "Get Keyframes");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error retrieving keyframes: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Add composition marker
  server.tool(
    "add-composition-marker",
    "Add a marker to the composition timeline with comment, duration, and optional chapter/URL data.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      time: z.number().describe("Time in seconds"),
      comment: z.string().describe("Marker text label"),
      duration: z.number().min(0).optional().describe("Marker duration in seconds (default: 0)"),
      chapter: z.string().optional().describe("Chapter marker label"),
      url: z.string().optional().describe("Web link URL"),
    },
    async (params) => {
      try {
        const script = generateAddCompositionMarker(params as any);
        const result = await executeExtendScript(script, 10000, "Add Composition Marker");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error adding composition marker: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Add layer marker
  server.tool(
    "add-layer-marker",
    "Add a marker to a specific layer timeline with comment and duration.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target layer index"),
      layerName: z.string().optional().describe("Target layer name"),
      time: z.number().describe("Time in seconds"),
      comment: z.string().describe("Marker label"),
      duration: z.number().min(0).optional().describe("Marker duration in seconds (default: 0)"),
    },
    async (params) => {
      try {
        const script = generateAddLayerMarker(params as any);
        const result = await executeExtendScript(script, 10000, "Add Layer Marker");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error adding layer marker: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Get markers
  server.tool(
    "get-markers",
    "Retrieve all markers from a composition or layer timeline.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target layer index (or composition markers if omitted)"),
      layerName: z.string().optional().describe("Target layer name"),
    },
    async (params) => {
      try {
        const script = generateGetMarkers(params as any);
        const result = await executeExtendScript(script, 10000, "Get Markers");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error retrieving markers: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Delete marker
  server.tool(
    "delete-marker",
    "Remove a marker by index from a composition or layer.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Target layer index (or composition if omitted)"),
      layerName: z.string().optional().describe("Target layer name"),
      markerIndex: z.number().int().positive().describe("1-based marker index to delete"),
    },
    async (params) => {
      try {
        const script = generateDeleteMarker(params as any);
        const result = await executeExtendScript(script, 10000, "Delete Marker");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error deleting marker: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Set work area
  server.tool(
    "set-work-area",
    "Set the composition work area start time and duration.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      start: z.number().min(0).describe("Work area start time in seconds"),
      duration: z.number().positive().describe("Work area duration in seconds"),
    },
    async (params) => {
      try {
        const script = generateSetWorkArea(params as any);
        const result = await executeExtendScript(script, 10000, "Set Work Area");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting work area: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Get current time
  server.tool(
    "get-current-time",
    "Get the current playhead time and frame number of the composition.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
    },
    async (params) => {
      try {
        const script = generateGetCurrentTime(params as any);
        const result = await executeExtendScript(script, 10000, "Get Current Time");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error getting playhead time: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Set current time
  server.tool(
    "set-current-time",
    "Scrub the composition playhead to a specific time in seconds.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      time: z.number().min(0).describe("Target playhead time in seconds"),
    },
    async (params) => {
      try {
        const script = generateSetCurrentTime(params as any);
        const result = await executeExtendScript(script, 10000, "Set Current Time");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting playhead time: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Snap to marker
  server.tool(
    "snap-to-marker",
    "Snap the playhead to a marker by index on the composition or a layer.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      markerIndex: z.number().int().positive().describe("1-based marker index"),
      layerIndex: z.number().int().positive().optional().describe("Layer index (or comp if omitted)"),
      layerName: z.string().optional().describe("Layer name"),
    },
    async (params) => {
      try {
        const script = generateSnapToMarker(params as any);
        const result = await executeExtendScript(script, 10000, "Snap To Marker");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error snapping to marker: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Get nearest marker
  server.tool(
    "get-nearest-marker",
    "Find the closest marker to a given timepoint or current playhead.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      time: z.number().optional().describe("Reference time in seconds (or current time if omitted)"),
      layerIndex: z.number().int().positive().optional().describe("Layer index (or comp if omitted)"),
      layerName: z.string().optional().describe("Layer name"),
    },
    async (params) => {
      try {
        const script = generateGetNearestMarker(params as any);
        const result = await executeExtendScript(script, 10000, "Get Nearest Marker");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error finding nearest marker: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Navigate markers
  server.tool(
    "navigate-markers",
    "Jump the playhead to the next or previous marker on the timeline.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      direction: z.enum(["next", "previous"]).describe("Navigation direction ('next' or 'previous')"),
      layerIndex: z.number().int().positive().optional().describe("Layer index (or comp if omitted)"),
      layerName: z.string().optional().describe("Layer name"),
    },
    async (params) => {
      try {
        const script = generateNavigateMarkers(params as any);
        const result = await executeExtendScript(script, 10000, "Navigate Markers");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error navigating markers: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );
}

