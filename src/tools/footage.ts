import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { executeExtendScript, sendBridgeCommand } from "../core/bridge.js";
import { bridgeToolResult } from "../lib/bridge-core.js";
import {
  generateSetProxy,
  generateRemoveProxy,
} from "../lib/generators/assetGenerators.js";

export function registerFootageTools(server: McpServer): void {
  server.tool(
    "import-footage",
    "Import an external footage file (video, audio, image, PSD, Illustrator) into the After Effects project.",
    {
      filePath: z.string().describe("Absolute file path to the footage asset to import."),
      folderName: z.string().optional().describe("Project folder name into which to organize the imported item."),
      sequence: z.boolean().optional().describe("Whether to import as an image sequence (default false)."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("importFootage", parameters, 15000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error importing footage: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "list-project-items",
    "List items in the project panel (compositions, footage, solids, folders), with id, name, type, and dimensions.",
    {
      itemType: z
        .enum(["all", "comp", "footage", "folder"])
        .optional()
        .describe("Filter by item type (default 'all')."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("listProjectItems", parameters, 8000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error listing project items: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "relink-footage",
    "Replace the file source of a footage item in the project panel with a new file path.",
    {
      itemId: z.number().int().positive().optional().describe("Project item id of the footage."),
      name: z.string().optional().describe("Name of the footage item to relink."),
      newPath: z.string().describe("Absolute file path to the new footage file."),
    },
    async (parameters) => {
      try {
        const result = await sendBridgeCommand("relinkFootage", parameters, 10000, 250);
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error relinking footage: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Set proxy
  server.tool(
    "set-proxy",
    "Assign a low-resolution proxy file to a footage item for faster preview performance.",
    {
      itemId: z.number().int().optional().describe("Footage project item ID"),
      itemName: z.string().optional().describe("Footage project item name"),
      proxyPath: z.string().describe("Absolute file path to the proxy media file"),
    },
    async (params) => {
      try {
        const script = generateSetProxy(params as any);
        const result = await executeExtendScript(script, 15000, "Set Proxy");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error setting footage proxy: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Remove proxy
  server.tool(
    "remove-proxy",
    "Remove or unlink the proxy file from a footage item.",
    {
      itemId: z.number().int().optional().describe("Footage project item ID"),
      itemName: z.string().optional().describe("Footage project item name"),
    },
    async (params) => {
      try {
        const script = generateRemoveProxy(params as any);
        const result = await executeExtendScript(script, 15000, "Remove Proxy");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error removing footage proxy: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );
}

