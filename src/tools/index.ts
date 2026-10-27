import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAliasTools } from "./aliases.js";
import { registerAnimationTools } from "./animation.js";
import { registerAudioTools } from "./audio.js";
import { registerCompositionTools } from "./composition.js";
import { registerEffectTools } from "./effect.js";
import { registerFootageTools } from "./footage.js";
import { registerLayerTools } from "./layer.js";
import { registerMaskTools } from "./masks.js";
import { registerProjectTools } from "./project.js";
import { registerRenderTools } from "./render.js";
import { registerShapeTools } from "./shapes.js";
import { registerSystemTools } from "./system.js";
import { registerTemplateTools } from "./templates.js";
import { registerThreeDTools } from "./threeD.js";
import { registerVisualTools } from "./visual.js";

export { registerAliasTools } from "./aliases.js";
export { registerAnimationTools } from "./animation.js";
export { registerAudioTools } from "./audio.js";
export { registerCompositionTools } from "./composition.js";
export { registerEffectTools } from "./effect.js";
export { registerFootageTools } from "./footage.js";
export { registerLayerTools } from "./layer.js";
export { registerMaskTools } from "./masks.js";
export { registerProjectTools } from "./project.js";
export { registerRenderTools } from "./render.js";
export { registerShapeTools } from "./shapes.js";
export { registerSystemTools } from "./system.js";
export { registerTemplateTools } from "./templates.js";
export { registerThreeDTools } from "./threeD.js";
export { registerVisualTools } from "./visual.js";

/**
 * Register all tools across all domain modules + compatibility aliases into the MCP Server instance.
 */
export function registerAllTools(server: McpServer): void {
  registerCompositionTools(server);
  registerLayerTools(server);
  registerAnimationTools(server);
  registerEffectTools(server);
  registerFootageTools(server);
  registerAudioTools(server);
  registerVisualTools(server);
  registerRenderTools(server);
  registerSystemTools(server);
  registerTemplateTools(server);
  registerShapeTools(server);
  registerThreeDTools(server);
  registerMaskTools(server);
  registerProjectTools(server);
  registerAliasTools(server);
}
