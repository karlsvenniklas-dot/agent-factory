import type { VisualizerPreset } from './types';

/**
 * Built-in visualizer presets
 * Users can create their own presets using this format
 */

export const BUILTIN_PRESETS: VisualizerPreset[] = [
  {
    name: 'Classic Spectrum',
    author: 'Plugin Maestro',
    renderer: 'spectrum',
    config: {
      barCount: 32,
      gap: 2,
      showPeaks: true,
      colorScheme: 'winamp',
      logarithmic: true,
    },
  },

  {
    name: 'Oscilloscope',
    author: 'Plugin Maestro',
    renderer: 'oscilloscope',
    config: {
      lineWidth: 2,
      color: '#00ff00',
      glow: true,
      backgroundColor: '#000000',
    },
  },

  {
    name: 'Beat Particles',
    author: 'Plugin Maestro',
    renderer: 'particle',
    config: {
      particleCount: 100,
      baseSpeed: 2,
      colors: ['#ff0066', '#00ffff', '#ffff00', '#00ff00'],
      particleSize: 3,
      trailLength: 10,
    },
  },

  {
    name: 'Butterfly Scope',
    author: 'Plugin Maestro',
    renderer: 'scope',
    config: {
      fadeSpeed: 0.15,
      dotSize: 2,
      color: '#00ffff',
      mode: 'lissajous',
      rotation: 0,
    },
  },

  {
    name: 'Fire Spectrum',
    author: 'Plugin Maestro',
    renderer: 'spectrum',
    config: {
      barCount: 40,
      gap: 1,
      showPeaks: true,
      colorScheme: 'fire',
      logarithmic: true,
    },
  },

  {
    name: 'Ocean Waves',
    author: 'Plugin Maestro',
    renderer: 'spectrum',
    config: {
      barCount: 24,
      gap: 3,
      showPeaks: false,
      colorScheme: 'ocean',
      logarithmic: true,
    },
  },

  {
    name: 'Spiral Scope',
    author: 'Plugin Maestro',
    renderer: 'scope',
    config: {
      fadeSpeed: 0.1,
      dotSize: 1,
      color: '#ff00ff',
      mode: 'spiral',
      rotation: 0,
    },
  },

  {
    name: 'Rainbow Spectrum',
    author: 'Plugin Maestro',
    renderer: 'spectrum',
    config: {
      barCount: 48,
      gap: 1,
      showPeaks: true,
      colorScheme: 'rainbow',
      logarithmic: true,
    },
  },

  {
    name: 'Neon Particles',
    author: 'Plugin Maestro',
    renderer: 'particle',
    config: {
      particleCount: 150,
      baseSpeed: 3,
      colors: ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5'],
      particleSize: 2,
      trailLength: 15,
    },
  },

  {
    name: 'Retro Scope',
    author: 'Plugin Maestro',
    renderer: 'oscilloscope',
    config: {
      lineWidth: 3,
      color: '#39ff14',
      glow: true,
      backgroundColor: '#001100',
    },
  },
];

/**
 * Get a preset by name
 */
export function getPreset(name: string): VisualizerPreset | undefined {
  return BUILTIN_PRESETS.find(p => p.name === name);
}

/**
 * Get all preset names
 */
export function getPresetNames(): string[] {
  return BUILTIN_PRESETS.map(p => p.name);
}

/**
 * Get the default preset
 */
export function getDefaultPreset(): VisualizerPreset {
  return BUILTIN_PRESETS[0];
}
