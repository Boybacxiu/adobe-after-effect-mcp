import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as fs from "fs";
import { z } from "zod";
import { sendBridgeCommand } from "../core/bridge.js";
import { bridgeToolResult } from "../lib/bridge-core.js";
import { analyzeWavBuffer } from "../lib/wav.js";

export function registerAudioTools(server: McpServer): void {
  server.tool(
    "set-audio-levels",
    "Set the audio volume levels (in decibels) on a layer with audio.",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      compIndex: z.number().int().positive().optional().describe("1-based composition index."),
      layerIndex: z.number().int().positive().optional().describe("1-based layer index."),
      layerName: z.string().optional().describe("Target layer name."),
      levels: z
        .array(z.number())
        .describe("Audio levels in dB [left, right] or [mono] (e.g. [0, 0] for unity gain, [-96, -96] for mute)."),
      timeInSeconds: z.number().optional().describe("Time at which to set keyframe (omit to set static level)."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("setAudioLevels", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting audio levels: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get-audio-info",
    "Inspect the audio properties of a layer (hasAudio, audioEnabled, audioLevels, duration).",
    {
      compName: z.string().optional().describe("Composition name (or active comp if omitted)."),
      compIndex: z.number().int().positive().optional().describe("1-based composition index."),
      layerIndex: z.number().int().positive().optional().describe("1-based layer index."),
      layerName: z.string().optional().describe("Target layer name."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("getAudioInfo", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error inspecting audio: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "analyze-audio-waveform",
    "Analyze an external WAV file directly in Node and return sample rate, duration, and amplitude statistics.",
    {
      wavPath: z.string().describe("Absolute file path to an uncompressed 16-bit or 24-bit PCM WAV file."),
    },
    async (parameters) => {
      try {
        if (!fs.existsSync(parameters.wavPath)) {
          return {
            content: [{ type: "text", text: `WAV file not found at: ${parameters.wavPath}` }],
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
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  status: "success",
                  sampleRate: analysis.sampleRate,
                  channels: analysis.channels,
                  duration: analysis.duration,
                  peakTimesCount: analysis.peakTimes.length,
                  waveformPointsCount: analysis.waveformPoints.length,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error analyzing audio: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );
}
