import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { executeExtendScript } from "../core/bridge.js";
import { bridgeToolResult } from "../lib/bridge-core.js";
import {
  generateCreateProject,
  generateOpenProject,
  generateSaveProject,
  generateCloseProject,
  generateGetProjectInfo,
} from "../lib/generators/projectGenerators.js";
import {
  generateImportFolder,
  generateReplaceFootage,
  generateOrganizeProjectItems,
  generateFindMissingFootage,
  generateCollectFiles,
  generateReduceProject,
} from "../lib/generators/assetGenerators.js";

export function registerProjectTools(server: McpServer): void {
  // Create project
  server.tool(
    "create-project",
    "Create a new After Effects project.",
    {
      name: z.string().optional().describe("Optional project name"),
    },
    async (params) => {
      try {
        const script = generateCreateProject(params as any);
        const result = await executeExtendScript(script, 10000, "Create Project");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error creating project: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Open project
  server.tool(
    "open-project",
    "Open an existing After Effects (.aep) project file.",
    {
      path: z.string().describe("Absolute file path to the .aep project file"),
    },
    async (params) => {
      try {
        const script = generateOpenProject(params as any);
        const result = await executeExtendScript(script, 30000, "Open Project");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error opening project: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Save project
  server.tool(
    "save-project",
    "Save the current After Effects project to disk.",
    {
      path: z.string().optional().describe("Optional destination file path for Save As"),
    },
    async (params) => {
      try {
        const script = generateSaveProject(params as any);
        const result = await executeExtendScript(script, 20000, "Save Project");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error saving project: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Close project
  server.tool(
    "close-project",
    "Close the current After Effects project.",
    {
      closeOptions: z
        .enum(["prompt", "save", "doNotSave"])
        .optional()
        .describe("Save behavior before closing (default: 'prompt')"),
    },
    async (params) => {
      try {
        const script = generateCloseProject(params as any);
        const result = await executeExtendScript(script, 15000, "Close Project");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error closing project: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Get project info
  server.tool(
    "get-project-info",
    "Get information about the current After Effects project (name, path, item count, bit depth, timecode).",
    {},
    async () => {
      try {
        const script = generateGetProjectInfo();
        const result = await executeExtendScript(script, 10000, "Get Project Info");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error getting project info: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Import folder
  server.tool(
    "import-folder",
    "Batch import all media files from a directory on disk into a project folder.",
    {
      folderPath: z.string().describe("Absolute directory path to import footage from"),
      targetFolderName: z.string().optional().describe("Destination folder name in the project panel"),
    },
    async (params) => {
      try {
        const script = generateImportFolder(params as any);
        const result = await executeExtendScript(script, 30000, "Import Folder");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error importing folder: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Replace footage
  server.tool(
    "replace-footage",
    "Replace the source file of an existing footage item.",
    {
      itemId: z.number().int().optional().describe("Footage project item ID"),
      itemName: z.string().optional().describe("Footage project item name"),
      newPath: z.string().describe("Absolute file path to the new source asset"),
    },
    async (params) => {
      try {
        const script = generateReplaceFootage(params as any);
        const result = await executeExtendScript(script, 15000, "Replace Footage");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error replacing footage: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Organize project items
  server.tool(
    "organize-project-items",
    "Automatically organize project panel items into structured bins (Compositions, Footage, Audio, Solids).",
    {
      structure: z.string().optional().describe("Folder structure preset (default: 'standard')"),
      customFolders: z.array(z.string()).optional().describe("Custom folder names to create"),
    },
    async (params) => {
      try {
        const script = generateOrganizeProjectItems(params);
        const result = await executeExtendScript(script, 20000, "Organize Project Items");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error organizing project items: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Find missing footage
  server.tool(
    "find-missing-footage",
    "Scan the project for footage items with missing or unlinked source files.",
    {},
    async () => {
      try {
        const script = generateFindMissingFootage();
        const result = await executeExtendScript(script, 15000, "Find Missing Footage");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error scanning for missing footage: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Collect files
  server.tool(
    "collect-files",
    "List and collect external source file dependencies of the project for archive collection.",
    {
      outputPath: z.string().describe("Target output directory path for collected files"),
      includeFootage: z.boolean().optional().describe("Include source footage files (default: true)"),
      includeFonts: z.boolean().optional().describe("Include font reports (default: false)"),
    },
    async (params) => {
      try {
        const script = generateCollectFiles(params);
        const result = await executeExtendScript(script, 20000, "Collect Files");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error collecting project file dependencies: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );

  // Reduce project
  server.tool(
    "reduce-project",
    "Reduce the project to only the items and compositions that are currently selected or specified.",
    {
      compId: z.number().int().optional().describe("Composition ID to preserve"),
      compName: z.string().optional().describe("Composition name to preserve"),
    },
    async (params) => {
      try {
        const script = generateReduceProject(params);
        const result = await executeExtendScript(script, 20000, "Reduce Project");
        return bridgeToolResult(result);
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error reducing project: ${String(error)}` }],
          isError: true,
        };
      }
    },
  );
}
