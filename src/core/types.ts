import { z } from "zod";

/**
 * Common schema for identifying a layer in After Effects.
 * Flexible layer identification: supports comp/layer names, 1-based indices, or active comp.
 */
export const LayerIdentifierSchema = {
  compIndex: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("1-based index of the target composition in the project panel."),
  compName: z
    .string()
    .optional()
    .describe("Name of the composition. If both compIndex and compName are omitted, active comp is used."),
  layerIndex: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("1-based index of the target layer within the composition."),
  layerName: z
    .string()
    .optional()
    .describe("Name of the target layer. If layerIndex is also given, layerIndex takes precedence."),
};

export interface BridgeResult {
  status?: string;
  success?: boolean;
  error?: string;
  message?: string;
  [key: string]: unknown;
}

export * from "./aeTypes.js";

