/**
 * Presets Library Index
 */

export * from './springPresets.js';
export * from './motionPresets.js';
export {
  type ExpressionTemplate,
  EXPRESSION_LIBRARY,
  getExpressionTemplate,
  processTemplate,
  listExpressionTemplates,
  getTemplatesByCategory as getExpressionTemplatesByCategory,
} from './expressions.js';
export * from './motionGraphics.js';
export {
  type EffectProperty,
  type EffectConfig,
  type EffectTemplate as PresetEffectTemplate,
  EFFECT_TEMPLATES,
  getEffectTemplate,
  listEffectTemplates,
  getTemplatesByCategory as getEffectTemplatesByCategory,
} from './effects.js';
