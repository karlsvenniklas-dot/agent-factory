/**
 * Visualizer system entry point
 * Import this to get everything you need
 */

// Core types
export type { AudioAnalysis, Renderer, RendererFactory, VisualizerPreset } from './types';

// Core classes
export { AudioPipeline } from './AudioPipeline';
export { VisualizerEngine } from './VisualizerEngine';
export { RendererRegistry } from './RendererRegistry';

// Renderers (auto-registers on import)
export * from './renderers';

// Presets
export { BUILTIN_PRESETS, getPreset, getPresetNames, getDefaultPreset } from './presets';
