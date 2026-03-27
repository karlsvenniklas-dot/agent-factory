/**
 * Register all built-in renderers
 * Import this file to make all renderers available
 */

import { RendererRegistry } from '../RendererRegistry';
import { createOscilloscopeRenderer } from './OscilloscopeRenderer';
import { createSpectrumRenderer } from './SpectrumRenderer';
import { createParticleRenderer } from './ParticleRenderer';
import { createScopeRenderer } from './ScopeRenderer';

// Register all built-in renderers
export function registerBuiltinRenderers(): void {
  RendererRegistry.register('oscilloscope', createOscilloscopeRenderer);
  RendererRegistry.register('spectrum', createSpectrumRenderer);
  RendererRegistry.register('particle', createParticleRenderer);
  RendererRegistry.register('scope', createScopeRenderer);
}

// Auto-register on import
registerBuiltinRenderers();

// Re-export for convenience
export { createOscilloscopeRenderer } from './OscilloscopeRenderer';
export { createSpectrumRenderer } from './SpectrumRenderer';
export { createParticleRenderer } from './ParticleRenderer';
export { createScopeRenderer } from './ScopeRenderer';
