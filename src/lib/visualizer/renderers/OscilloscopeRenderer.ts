import type { Renderer, AudioAnalysis } from '../types';

interface OscilloscopeConfig {
  lineWidth?: number;
  color?: string;
  glow?: boolean;
  backgroundColor?: string;
}

/**
 * Classic oscilloscope renderer
 * Draws the waveform as a smooth line
 */
export class OscilloscopeRenderer implements Renderer {
  name = 'oscilloscope';

  private lineWidth: number;
  private color: string;
  private glow: boolean;
  private backgroundColor: string;

  constructor(config: OscilloscopeConfig = {}) {
    this.lineWidth = config.lineWidth ?? 2;
    this.color = config.color ?? '#00ff00';
    this.glow = config.glow ?? true;
    this.backgroundColor = config.backgroundColor ?? '#000000';
  }

  setup(): void {
    // No setup needed
  }

  render(ctx: CanvasRenderingContext2D, analysis: AudioAnalysis): void {
    const { width, height } = ctx.canvas;

    // Clear canvas
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Setup line style
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Apply glow effect
    if (this.glow) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
    }

    // Draw waveform
    ctx.beginPath();

    const step = width / analysis.waveform.length;
    const centerY = height / 2;
    const amplitude = height / 2 - 10;

    for (let i = 0; i < analysis.waveform.length; i++) {
      const x = i * step;
      const normalized = (analysis.waveform[i] - 128) / 128;
      const y = centerY + normalized * amplitude;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Reset shadow
    if (this.glow) {
      ctx.shadowBlur = 0;
    }
  }

  cleanup(): void {
    // No cleanup needed
  }
}

/**
 * Factory function for creating oscilloscope renderer
 */
export function createOscilloscopeRenderer(config?: OscilloscopeConfig): Renderer {
  return new OscilloscopeRenderer(config);
}
