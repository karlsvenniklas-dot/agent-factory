import type { Renderer, AudioAnalysis } from '../types';

interface ScopeConfig {
  fadeSpeed?: number;
  dotSize?: number;
  color?: string;
  mode?: 'lissajous' | 'spiral';
  rotation?: number;
}

/**
 * Lissajous/Butterfly scope renderer
 * Plots stereo phase relationship (simulated in mono)
 */
export class ScopeRenderer implements Renderer {
  name = 'scope';

  private fadeSpeed: number;
  private dotSize: number;
  private color: string;
  private mode: 'lissajous' | 'spiral';
  private rotation: number;

  // Animation state
  private angle = 0;

  constructor(config: ScopeConfig = {}) {
    this.fadeSpeed = config.fadeSpeed ?? 0.15;
    this.dotSize = config.dotSize ?? 2;
    this.color = config.color ?? '#00ffff';
    this.mode = config.mode ?? 'lissajous';
    this.rotation = config.rotation ?? 0;
  }

  setup(): void {
    // No setup needed
  }

  render(ctx: CanvasRenderingContext2D, analysis: AudioAnalysis, deltaTime: number): void {
    const { width, height } = ctx.canvas;

    // Apply fade effect
    ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeSpeed})`;
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / 2 - 10;

    // Update rotation
    this.angle += 0.005 * deltaTime / 16;

    if (this.mode === 'lissajous') {
      this.renderLissajous(ctx, analysis, centerX, centerY, scale);
    } else {
      this.renderSpiral(ctx, analysis, centerX, centerY, scale);
    }
  }

  /**
   * Render Lissajous curve (X-Y scope)
   */
  private renderLissajous(
    ctx: CanvasRenderingContext2D,
    analysis: AudioAnalysis,
    centerX: number,
    centerY: number,
    scale: number
  ): void {
    ctx.fillStyle = this.color;

    // Simulate stereo by using phase-shifted waveform
    const samples = analysis.waveform.length;
    const step = Math.max(1, Math.floor(samples / 200)); // Limit points for performance

    for (let i = 0; i < samples; i += step) {
      // Left channel (actual waveform)
      const left = (analysis.waveform[i] - 128) / 128;

      // Right channel (simulated with offset)
      const rightIndex = (i + Math.floor(samples * 0.1)) % samples;
      const right = (analysis.waveform[rightIndex] - 128) / 128;

      // Apply reactivity based on frequency bands
      const energy = analysis.bands.bass * 0.5 + analysis.bands.mids * 0.3 + analysis.bands.treble * 0.2;
      const effectiveScale = scale * (0.6 + energy * 0.4);

      // Plot X-Y coordinates
      const x = centerX + left * effectiveScale;
      const y = centerY + right * effectiveScale;

      // Apply rotation
      const rotated = this.rotatePoint(x - centerX, y - centerY, this.rotation + this.angle);

      // Draw dot
      const alpha = 0.6 + Math.sin(i / samples * Math.PI) * 0.4;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(centerX + rotated.x, centerY + rotated.y, this.dotSize, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  /**
   * Render spiral scope
   */
  private renderSpiral(
    ctx: CanvasRenderingContext2D,
    analysis: AudioAnalysis,
    centerX: number,
    centerY: number,
    scale: number
  ): void {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const samples = analysis.waveform.length;
    const step = Math.max(1, Math.floor(samples / 200));

    for (let i = 0; i < samples; i += step) {
      const value = (analysis.waveform[i] - 128) / 128;
      const angle = (i / samples) * Math.PI * 4 + this.angle;

      // Radius based on waveform value and frequency bands
      const energy = analysis.bands.bass * 0.5 + analysis.bands.mids * 0.3 + analysis.bands.treble * 0.2;
      const radius = (0.5 + value * 0.5 + energy * 0.3) * scale;

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }

  /**
   * Rotate a point around origin
   */
  private rotatePoint(x: number, y: number, angle: number): { x: number; y: number } {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: x * cos - y * sin,
      y: x * sin + y * cos,
    };
  }

  cleanup(): void {
    // No cleanup needed
  }
}

/**
 * Factory function for creating scope renderer
 */
export function createScopeRenderer(config?: ScopeConfig): Renderer {
  return new ScopeRenderer(config);
}
