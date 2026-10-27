import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as fs from "fs";
import { z } from "zod";
import { sendBridgeCommand } from "../core/bridge.js";
import { bridgeToolResult } from "../lib/bridge-core.js";
import {
  buildFrameContent,
  isCompletePng,
  type ContentBlock,
  type FrameFile,
} from "../lib/see-frame.js";

async function readScratchPngBase64(p: string, timeoutMs = 15000): Promise<string | null> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      const buf = fs.readFileSync(p);
      if (isCompletePng(buf)) return buf.toString("base64");
    } catch {
      // not ready yet
    }
    if (Date.now() >= deadline) return null;
    await new Promise((r) => setTimeout(r, 100));
  }
}

async function imageResultFromPaths(
  raw: string,
  entries: Array<{ path?: string; caption: string }>,
  headerText: string,
): Promise<{ content: ContentBlock[]; isError?: boolean }> {
  const cleanup: string[] = [];
  try {
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { content: [{ type: "text", text: raw }], isError: true };
    }
    if (!parsed || parsed.status === "error" || parsed.error) {
      return bridgeToolResult(raw) as { content: ContentBlock[]; isError?: boolean };
    }
    const content: ContentBlock[] = [{ type: "text", text: headerText }];
    const withPaths = entries.filter((e): e is { path: string; caption: string } => !!e.path);
    withPaths.forEach((e) => cleanup.push(e.path));
    const b64Results = await Promise.all(withPaths.map((e) => readScratchPngBase64(e.path)));
    withPaths.forEach((e, i) => {
      const b64 = b64Results[i];
      if (b64) {
        content.push({ type: "text", text: e.caption });
        content.push({ type: "image", data: b64, mimeType: "image/png" });
      }
    });
    if (parsed.note) content.push({ type: "text", text: String(parsed.note) });
    const anyImage = content.some((b) => b.type === "image");
    return { content, isError: anyImage ? false : true };
  } finally {
    for (const p of cleanup) {
      try {
        fs.unlinkSync(p);
      } catch {
        /* already gone */
      }
    }
  }
}

export function registerVisualTools(server: McpServer): void {
  server.tool(
    "see-frame",
    "SEE what a composition actually looks like: render one or more frames to images and return them so you can visually verify and self-correct (make a change, look, fix). Use this after edits to catch problems the DOM does not reveal - clipped or empty text, blown-out glow, off-frame layers, wrong colors, or Arabic/RTL text that did not shape correctly. Select the comp by name or 1-based index, or leave empty for the active comp. Returns downscaled preview images by default (maxWidth 512) to keep it fast and cheap; pass maxWidth 0 for a native-resolution still. Note: a still is a still - time-based effects like motion blur may look different from playback.",
    {
      comp: z
        .union([z.string(), z.number().int().positive()])
        .optional()
        .describe("Composition name or 1-based index. Omit to use the active comp."),
      times: z
        .union([z.number(), z.array(z.number())])
        .optional()
        .describe(
          "Time(s) in seconds to capture. A single number or an array. Defaults to the comp midpoint. Out-of-range values are clamped.",
        ),
      maxWidth: z
        .number()
        .int()
        .min(0)
        .max(4096)
        .optional()
        .describe(
          "Max preview width in pixels (default 512, aspect preserved). Use 0 for a guaranteed-faithful native-resolution frame.",
        ),
      includeState: z
        .boolean()
        .optional()
        .describe(
          "Also return the comp's structured state (like inspect-comp) alongside the images.",
        ),
      motionBlur: z
        .boolean()
        .optional()
        .describe("Render the still with motion blur enabled (default false)."),
      timeoutMs: z
        .number()
        .int()
        .positive()
        .max(600000)
        .optional()
        .describe("How long to wait for the render, in milliseconds (default 60000)."),
    },
    async ({
      comp,
      times,
      maxWidth = 512,
      includeState = false,
      motionBlur = false,
      timeoutMs = 60000,
    }) => {
      const scratchPaths: string[] = [];
      try {
        const raw = await sendBridgeCommand(
          "seeFrame",
          {
            compName: typeof comp === "string" ? comp : undefined,
            compIndex: typeof comp === "number" ? comp : undefined,
            times: times === undefined ? undefined : Array.isArray(times) ? times : [times],
            maxWidth,
            includeState,
            motionBlur,
          },
          timeoutMs,
          250,
        );

        let parsed: any;
        try {
          parsed = JSON.parse(raw);
        } catch {
          return { content: [{ type: "text", text: raw }], isError: true };
        }
        if (!parsed || parsed.status === "error" || parsed.error) {
          return bridgeToolResult(raw);
        }

        const frames: FrameFile[] = Array.isArray(parsed.frames) ? parsed.frames : [];
        for (const f of frames) if (f && f.path) scratchPaths.push(f.path);

        const compName: string = parsed.compName || (typeof comp === "string" ? comp : "composition");
        const stateJson: string | undefined =
          includeState && parsed.state !== undefined
            ? typeof parsed.state === "string"
              ? parsed.state
              : JSON.stringify(parsed.state)
            : undefined;

        const b64ByPath = new Map<string, string>();
        const framePaths = frames.filter((f) => f && f.path).map((f) => f.path);
        const b64Results = await Promise.all(framePaths.map((p) => readScratchPngBase64(p)));
        framePaths.forEach((p, i) => {
          const b64 = b64Results[i];
          if (b64 !== null) b64ByPath.set(p, b64);
        });
        const readBase64 = (p: string): string | null => b64ByPath.get(p) ?? null;

        const content: ContentBlock[] = buildFrameContent(compName, frames, readBase64, stateJson);
        if (parsed.note) content.push({ type: "text", text: String(parsed.note) });
        const anyImage = content.some((b) => b.type === "image");
        return { content, isError: anyImage ? false : true };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error capturing frame: ${String(error)}` }],
          isError: true,
        };
      } finally {
        for (const p of scratchPaths) {
          try {
            fs.unlinkSync(p);
          } catch {
            /* already gone */
          }
        }
      }
    },
  );

  server.tool(
    "contact-sheet",
    "Render N frames sampled across the duration and composite them into ONE labeled thumbnail grid, returned as a single image.",
    {
      comp: z
        .union([z.string(), z.number().int().positive()])
        .optional()
        .describe("Composition name or 1-based index. Omit to use the active comp."),
      count: z
        .number()
        .int()
        .min(1)
        .max(64)
        .optional()
        .describe("How many frames to sample across the duration (default 9)."),
      maxWidth: z
        .number()
        .int()
        .min(64)
        .max(4096)
        .optional()
        .describe("Width of the whole grid image in pixels (default 1024)."),
      timeoutMs: z
        .number()
        .int()
        .positive()
        .max(600000)
        .optional()
        .describe("Wait time in ms (default 90000)."),
    },
    async ({ comp, count = 9, maxWidth = 1024, timeoutMs = 90000 }) => {
      try {
        const raw = await sendBridgeCommand(
          "contactSheet",
          {
            compName: typeof comp === "string" ? comp : undefined,
            compIndex: typeof comp === "number" ? comp : undefined,
            count,
            maxWidth,
          },
          timeoutMs,
          300,
        );
        let parsed: any;
        try {
          parsed = JSON.parse(raw);
        } catch {
          return { content: [{ type: "text", text: raw }], isError: true };
        }
        const name = parsed?.compName || "composition";
        return imageResultFromPaths(
          raw,
          [{ path: parsed?.gridPath, caption: `Contact sheet for "${name}" (${count} frames)` }],
          `Contact sheet for "${name}"`,
        );
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error generating contact sheet: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "match-reference",
    "Visually compare a rendered frame of your composition against an external reference image. Produces a side-by-side comparison image AND a highlighted pixel-difference map.",
    {
      referencePath: z.string().describe("Absolute file path to the reference image (PNG, JPEG, etc.)."),
      comp: z
        .union([z.string(), z.number().int().positive()])
        .optional()
        .describe("Composition name or 1-based index. Omit to use the active comp."),
      time: z.number().optional().describe("Time in seconds to sample from the comp (default 0)."),
      timeoutMs: z
        .number()
        .int()
        .positive()
        .max(600000)
        .optional()
        .describe("Wait time in ms (default 90000)."),
    },
    async ({ referencePath, comp, time, timeoutMs = 90000 }) => {
      try {
        const raw = await sendBridgeCommand(
          "matchReference",
          {
            referencePath,
            compName: typeof comp === "string" ? comp : undefined,
            compIndex: typeof comp === "number" ? comp : undefined,
            time,
          },
          timeoutMs,
          300,
        );
        let parsed: any;
        try {
          parsed = JSON.parse(raw);
        } catch {
          return { content: [{ type: "text", text: raw }], isError: true };
        }
        const name = parsed?.compName || "composition";
        return imageResultFromPaths(
          raw,
          [
            { path: parsed?.sideBySidePath, caption: `Reference (left) vs "${name}" (right)` },
            {
              path: parsed?.diffPath,
              caption: "Difference map: bright areas are where the render deviates",
            },
          ],
          `Match check for "${name}" against the reference`,
        );
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error matching reference: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );
}
