import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { executeExtendScript, getAETempDir, nextCommandId, sendBridgeCommand } from "../core/bridge.js";
import {
  generateListRenderQueue,
  generateListRenderTemplates,
  generateSetRenderQueueItem,
  generateRemoveFromRenderQueue,
  generateControlRender,
  generateQueueInAME,
} from "../lib/generators/renderQueueGenerators.js";
import {
  aerenderCandidates,
  bridgeToolResult,
  tail,
} from "../lib/bridge-core.js";

function findAerender(): string | null {
  const override = process.env.AE_AERENDER_PATH;
  if (override && fs.existsSync(override)) return override;
  for (const c of aerenderCandidates(process.platform, process.env)) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function pidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function tailFile(p: string, maxChars: number = 4000): string {
  try {
    return tail(fs.readFileSync(p, "utf8"), maxChars);
  } catch {
    return "";
  }
}

interface RenderJob {
  pid: number;
  comp: string;
  output: string;
  logPath: string;
  startedAt: string;
}
const runningRenders = new Map<number, RenderJob>();

async function getOpenProjectPath(): Promise<string | null> {
  const raw = await sendBridgeCommand("getProjectInfo", {}, 6000, 250);
  try {
    const p = JSON.parse(raw);
    return p && p.path && String(p.path).length > 0 ? String(p.path) : null;
  } catch {
    return null;
  }
}

export function registerRenderTools(server: McpServer): void {
  server.tool(
    "add-to-render-queue",
    "Add a composition to the After Effects render queue and configure its output. Templates must already exist in this AE installation.",
    {
      compName: z.string().optional().describe("Name of the composition to render (recommended)."),
      compIndex: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("1-based index among compositions. Used only if compName is omitted."),
      outputPath: z
        .string()
        .optional()
        .describe(
          "Absolute output file path (e.g. C:\\\\renders\\\\out.mov). Extension should match the output module format.",
        ),
      outputModuleTemplate: z
        .string()
        .optional()
        .describe(
          "Name of an existing Output Module template to apply (e.g. 'Lossless', 'H.264 - Match Render Settings - 15 Mbps').",
        ),
      renderSettingsTemplate: z
        .string()
        .optional()
        .describe(
          "Name of an existing Render Settings template to apply (e.g. 'Best Settings', 'Draft Settings').",
        ),
      startTime: z.number().optional().describe("Render span start in seconds (optional)."),
      endTime: z.number().optional().describe("Render span end in seconds (optional)."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("addToRenderQueue", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error adding to render queue: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "render-queue",
    "Inspect or manage the After Effects render queue: list items with their status and output path, clear the whole queue, or remove a single item by index.",
    {
      action: z
        .enum(["list", "clear", "remove"])
        .optional()
        .describe("'list' (default), 'clear' (remove all items), or 'remove' a single item by index."),
      index: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("1-based render queue item index (required when action is 'remove')."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("manageRenderQueue", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error managing render queue: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "start-render",
    "Render all QUEUED items in the After Effects render queue. Add items first with add-to-render-queue.",
    {
      timeoutMs: z
        .number()
        .int()
        .positive()
        .max(3600000)
        .optional()
        .describe(
          "Maximum time to wait for the render to finish, in milliseconds (default 300000 = 5 minutes).",
        ),
    },
    async ({ timeoutMs = 300000 }) => {
      try {
        const result = await sendBridgeCommand("startRender", {}, timeoutMs, 500);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error starting render: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "render-aerender",
    "Render a composition to a file in the BACKGROUND using aerender (a separate headless After Effects process). Does NOT freeze your After Effects UI.",
    {
      compName: z.string().describe("Name of the composition to render."),
      outputPath: z
        .string()
        .describe("Absolute output file path (e.g. .mov / .mp4 / .avi)."),
      projectPath: z
        .string()
        .optional()
        .describe("Absolute path to the .aep to render. If omitted, the currently open project is used."),
      saveFirst: z
        .boolean()
        .optional()
        .describe("Save the open project before rendering so unsaved changes are included (default: true)."),
      renderSettingsTemplate: z
        .string()
        .optional()
        .describe("Existing Render Settings template name (aerender -RStemplate), e.g. 'Best Settings'."),
      outputModuleTemplate: z
        .string()
        .optional()
        .describe("Existing Output Module template name (aerender -OMtemplate)."),
      startFrame: z.number().int().optional().describe("First frame to render (aerender -s)."),
      endFrame: z.number().int().optional().describe("Last frame to render (aerender -e)."),
      waitMs: z
        .number()
        .int()
        .positive()
        .max(3600000)
        .optional()
        .describe("If set, wait up to this many ms for the render to finish; otherwise return immediately."),
    },
    async (p) => {
      try {
        const aerenderPath = findAerender();
        if (!aerenderPath) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "error",
                    error: "aerender not found. Set the AE_AERENDER_PATH env var to aerender.exe path.",
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        let projectPath = p.projectPath;
        if (!projectPath) {
          if (p.saveFirst !== false) {
            await sendBridgeCommand(
              "executeScript",
              {
                script:
                  "if (app.project.file) { app.project.save(); return app.project.file.fsName; } else { return null; }",
              },
              20000,
              300,
            );
          }
          projectPath = (await getOpenProjectPath()) || undefined;
          if (!projectPath) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "error",
                      error: "No saved project found. Save the project in After Effects first, or pass projectPath.",
                    },
                    null,
                    2,
                  ),
                },
              ],
              isError: true,
            };
          }
        }
        if (!fs.existsSync(projectPath)) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  { status: "error", error: `Project file does not exist: ${projectPath}` },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        const args = ["-project", projectPath, "-comp", p.compName, "-output", p.outputPath];
        if (p.renderSettingsTemplate) args.push("-RStemplate", p.renderSettingsTemplate);
        if (p.outputModuleTemplate) args.push("-OMtemplate", p.outputModuleTemplate);
        if (p.startFrame !== undefined) args.push("-s", String(p.startFrame));
        if (p.endFrame !== undefined) args.push("-e", String(p.endFrame));

        const logPath = path.join(getAETempDir(), `aerender-${nextCommandId()}.log`);
        const out = fs.openSync(logPath, "a");
        const child = spawn(aerenderPath, args, { detached: true, stdio: ["ignore", out, out] });
        child.unref();
        try {
          fs.closeSync(out);
        } catch {
          /* ignore close error */
        }
        const pid = child.pid || -1;
        if (pid > 0)
          runningRenders.set(pid, {
            pid,
            comp: p.compName,
            output: p.outputPath,
            logPath,
            startedAt: new Date().toISOString(),
          });

        if (p.waitMs && p.waitMs > 0) {
          const start = Date.now();
          while (Date.now() - start < p.waitMs) {
            if (!pidAlive(pid)) break;
            await new Promise((r) => setTimeout(r, 1000));
          }
          const alive = pidAlive(pid);
          if (!alive) runningRenders.delete(pid);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: alive ? "running" : "finished",
                    pid,
                    comp: p.compName,
                    output: p.outputPath,
                    logTail: tailFile(logPath),
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  status: "started",
                  pid,
                  comp: p.compName,
                  output: p.outputPath,
                  logPath,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error running aerender: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "render-status",
    "Check on background renders started by render-aerender.",
    {
      pid: z
        .number()
        .int()
        .optional()
        .describe("Optional specific render PID. If omitted, reports all tracked renders."),
    },
    async ({ pid }) => {
      try {
        const jobs = pid
          ? runningRenders.has(pid)
            ? [runningRenders.get(pid)!]
            : []
          : Array.from(runningRenders.values());
        if (jobs.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    status: "success",
                    message: pid ? `No tracked render with pid ${pid}.` : "No tracked renders.",
                    renders: [],
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }
        const renders = jobs.map((j) => {
          const alive = pidAlive(j.pid);
          if (!alive) runningRenders.delete(j.pid);
          return {
            pid: j.pid,
            comp: j.comp,
            output: j.output,
            startedAt: j.startedAt,
            state: alive ? "running" : "finished",
            logTail: tailFile(j.logPath),
          };
        });
        return {
          content: [{ type: "text", text: JSON.stringify({ status: "success", renders }, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error checking render status: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // List render queue
  server.tool(
    "list-render-queue",
    "List all items currently in the After Effects render queue with status, composition name, and output file paths.",
    {},
    async () => {
      try {
        const script = generateListRenderQueue();
        const result = await executeExtendScript(script, 10000, "List Render Queue");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error listing render queue: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // List render templates
  server.tool(
    "list-render-templates",
    "List all available render settings templates and output module templates in After Effects.",
    {},
    async () => {
      try {
        const script = generateListRenderTemplates();
        const result = await executeExtendScript(script, 10000, "List Render Templates");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error listing render templates: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Set render queue item
  server.tool(
    "set-render-queue-item",
    "Configure output path, render settings template, and output module template for a render queue item.",
    {
      itemIndex: z.number().int().positive().describe("1-based render queue item index"),
      outputPath: z.string().optional().describe("Destination file path for output"),
      renderSettings: z.string().optional().describe("Render settings template name (e.g. 'Best Settings')"),
      outputModule: z.string().optional().describe("Output module template name (e.g. 'High Quality', 'Lossless')"),
    },
    async (params) => {
      try {
        const script = generateSetRenderQueueItem(params as any);
        const result = await executeExtendScript(script, 15000, "Set Render Queue Item");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting render queue item: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Remove from render queue
  server.tool(
    "remove-from-render-queue",
    "Remove an item from the render queue by index.",
    {
      itemIndex: z.number().int().positive().describe("1-based render queue item index"),
    },
    async (params) => {
      try {
        const script = generateRemoveFromRenderQueue(params as any);
        const result = await executeExtendScript(script, 10000, "Remove From Render Queue");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error removing item from render queue: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Control render
  server.tool(
    "control-render",
    "Control the native render queue execution (action: start, pause, resume, stop).",
    {
      action: z.enum(["start", "pause", "resume", "stop"]).describe("Render control action"),
    },
    async (params) => {
      try {
        const script = generateControlRender(params as any);
        const result = await executeExtendScript(script, 60000, "Control Render");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error controlling render: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Queue in AME
  server.tool(
    "queue-in-ame",
    "Send a composition to Adobe Media Encoder for background rendering.",
    {
      compId: z.number().int().optional().describe("Composition ID (or active comp if omitted)"),
      compName: z.string().optional().describe("Composition name (or active comp if omitted)"),
      renderToQueue: z.boolean().optional().describe("Whether to immediately start AME queue (default: false)"),
    },
    async (params) => {
      try {
        const script = generateQueueInAME(params as any);
        const result = await executeExtendScript(script, 20000, "Queue in AME");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error queuing in Adobe Media Encoder: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );
}

