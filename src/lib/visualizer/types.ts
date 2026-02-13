/**
 * Core interfaces for the modular visualizer system
 * Inspired by Winamp AVS and Milkdrop plugin architecture
 */

/**
 * Audio analysis data extracted from the audio pipeline
 * All values are normalized and ready for visualization
 */
export interface AudioAnalysis {
  /** Raw FFT frequency data (0-255) */
  fft: Uint8Array;

  /** Time-domain waveform data (0-255) */
  waveform: Uint8Array;

  /** Frequency band energy levels (0-1) */
  bands: {
    subBass: number;  // 20-60 Hz
    bass: number;     // 60-250 Hz
    mids: number;     // 250-2000 Hz
    treble: number;   // 2000+ Hz
  };

  /** Beat detection information */
  beat: {
    detected: boolean;
    confidence: number; // 0-1
  };

  /** Overall loudness (RMS) (0-1) */
  rms: number;
}

/**
 * Base interface for all visualizer renderers
 * Each renderer is a stateless plugin that draws to a canvas
 */
export interface Renderer {
  /** Unique name of the renderer */
  name: string;

  /**
   * Setup phase - called once when renderer is created
   * Use this to initialize any renderer-specific state
   */
  setup(canvas: HTMLCanvasElement): void;

  /**
   * Render a single frame
   * Called every frame with fresh audio analysis data
   * @param ctx - Canvas 2D context
   * @param analysis - Current audio analysis
   * @param deltaTime - Time since last frame in milliseconds
   */
  render(
    ctx: CanvasRenderingContext2D,
    analysis: AudioAnalysis,
    deltaTime: number
  ): void;

  /**
   * Cleanup phase - called when renderer is destroyed
   * Use this to release any resources
   */
  cleanup(): void;
}

/**
 * Factory function that creates a renderer instance
 */
export type RendererFactory = (config?: Record<string, unknown>) => Renderer;

/**
 * Visualizer preset definition
 * Presets are data-driven configurations that can be shared as JSON
 */
export interface VisualizerPreset {
  /** Display name of the preset */
  name: string;

  /** Creator of the preset */
  author: string;

  /** Name of the renderer to use (must be registered) */
  renderer: string;

  /** Renderer-specific configuration */
  config: Record<string, unknown>;
}
