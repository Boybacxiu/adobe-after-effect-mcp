import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { getAETempDir, sendBridgeCommand, executeExtendScript } from "../core/bridge.js";
import { bridgeToolResult } from "../lib/bridge-core.js";

const EXPECTED_BRIDGE_VERSION = "1.13.0-mcp-enhanced";

export function registerSystemTools(server: McpServer): void {
  server.tool(
    "run-script",
    "Run a predefined script in After Effects with optional parameters.",
    {
      script: z.string().describe("Name of the predefined script/command to run."),
      parameters: z.record(z.any()).optional().describe("Parameters for the script."),
    },
    async ({ script, parameters = {} }) => {
      try {
        const result = await sendBridgeCommand(script, parameters, 10000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error running script: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get-results",
    "Get results from the last script executed in After Effects.",
    {},
    async () => {
      try {
        const tempFilePath = path.join(getAETempDir(), "ae_mcp_result.json");
        if (fs.existsSync(tempFilePath)) {
          const content = fs.readFileSync(tempFilePath, "utf8");
          return {
            content: [{ type: "text", text: content }],
          };
        } else {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: "No results file found." }) }],
            isError: true,
          };
        }
      } catch (error) {
        return {
          content: [{ type: "text", text: `Failed to read results: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get-help",
    "Get help on using the After Effects MCP server and command reference.",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: `After Effects MCP Core Server:
- Total Tools: 110+ comprehensive tools + cross-client compatibility aliases
- Bridge mode: Automated CLI invocation via afterfx.exe -r & fast local IPC polling
- Supports: Compositions, Motion Graphics Templates (Lower Thirds, Titles, Transitions, Logo Reveals), Remotion-inspired Spring Physics, Vector Bezier Shapes, 3D Scenes, Materials & Renderers, Advanced Keyframing & Curves, Full Expression Library, Effects, Presets, Footage & Proxies, Audio, Background Render Queue & AME, and Visual Frame Inspection.`,
          },
        ],
      };
    },
  );

  server.tool(
    "check-bridge",
    "Health check: verify the After Effects MCP connection is responding and report status.",
    {},
    async () => {
      try {
        const raw = await sendBridgeCommand("ping", {}, 5000, 200);
        let parsed: any = null;
        try {
          parsed = JSON.parse(raw);
        } catch {
          /* not JSON */
        }

        if (!parsed || parsed.pong !== true) {
          let stalePanelDetected = false;
          let panelReportedVersion: string | null = null;
          try {
            const rf = path.join(getAETempDir(), "ae_mcp_result.json");
            if (fs.existsSync(rf)) {
              const last = JSON.parse(fs.readFileSync(rf, "utf8"));
              if (last && last.pong === true && last._commandId === undefined) {
                stalePanelDetected = true;
                panelReportedVersion = last.bridgeVersion ?? null;
              }
            }
          } catch {
            /* ignore */
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    ok: false,
                    stalePanelDetected,
                    panelReportedVersion,
                    problem: stalePanelDetected
                      ? "Stale bridge panel detected."
                      : "No response from After Effects.",
                    bridgeFolder: getAETempDir(),
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        const versionMismatch = parsed.bridgeVersion !== EXPECTED_BRIDGE_VERSION;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  ok: true,
                  bridgeVersion: parsed.bridgeVersion,
                  serverExpectedVersion: EXPECTED_BRIDGE_VERSION,
                  versionMismatch,
                  aeVersion: parsed.aeVersion,
                  bridgeFolder: getAETempDir(),
                  openProject: parsed.project,
                  activeComp: parsed.activeComp,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error checking bridge: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "run-bridge-test",
    "Run verification diagnostics on the After Effects communication bridge.",
    {},
    async () => {
      try {
        const result = await sendBridgeCommand("bridgeTestEffects", {}, 10000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Bridge test failed: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "execute-script",
    'Run ARBITRARY ExtendScript (the After Effects scripting DOM) inside After Effects and return the result. This is the most powerful tool: use it for anything the dedicated tools do not cover - masks, track mattes, parenting, 3D layers/cameras/lights, blending modes, precomposing, time remapping, layer styles, text animators, puppet pins, importing/replacing footage, batch edits across many layers, project-wide changes, etc. Your code runs as the body of a function, so use `return <value>;` to send data back, and return only JSON-serializable values (numbers, strings, arrays, plain objects). The whole script already runs inside one undo group, so do NOT call app.beginUndoGroup yourself. Use `app` and `app.project` to reach everything. On error you get back the message and line number. Example script: "var c = app.project.activeItem; return { name: c.name, layers: c.numLayers };"',
    {
      script: z
        .string()
        .describe(
          "ExtendScript code to execute. Runs as a function body; use 'return value;' to return JSON-serializable data. Do not call app.beginUndoGroup (handled automatically).",
        ),
      timeoutMs: z
        .number()
        .int()
        .positive()
        .max(600000)
        .optional()
        .describe(
          "How long to wait for the result, in milliseconds (default 60000). Increase for long-running scripts.",
        ),
    },
    async ({ script, timeoutMs = 60000 }) => {
      try {
        const result = await executeExtendScript(script, timeoutMs);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error executing ExtendScript: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );
}
