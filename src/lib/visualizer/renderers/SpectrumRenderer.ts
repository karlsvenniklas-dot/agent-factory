import type { Renderer, AudioAnalysis } from '../types';

interface SpectrumConfig {
  barCount?: number;
  gap?: number;
  showPeaks?: boolean;
  colorScheme?: 'winamp' | 'fire' | 'ocean' | 'rainbow';
  logarithmic?: boolean;
}

interface Peak {
  height: number;
  fallSpeed: number;
}

/**
 * Classic spectrum analyzer with bars
 * Inspired by Winamp's spectrum visualization
 */
export class SpectrumRenderer implements Renderer {
  name = 'spectrum';

  private barCount: number;
  private gap: number;
  private showPeaks: boolean;
  private colorScheme: string;
  private logarithmic: boolean;

  // Peak dots tracking
  private peaks: Peak[] = [];

  constructor(config: SpectrumConfig = {}) {
    this.barCount = config.barCount ?? 32;
    this.gap = config.gap ?? 2;
    this.showPeaks = config.showPeaks ?? true;
    this.colorScheme = config.colorScheme ?? 'winamp';
    this.logarithmic = config.logarithmic ?? true;

    // Initialize peaks
    for (let i = 0; i < this.barCount; i++) {
      this.peaks.push({ height: 0, fallSpeed: 0.5 });
    }
  }

  setup(): void {
    // No setup needed
  }

  render(ctx: CanvasRenderingContext2D, analysis: AudioAnalysis, deltaTime: number): void {
    const { width, height } = ctx.canvas;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    const barWidth = (width - this.gap * (this.barCount - 1)) / this.barCount;
    const maxBarHeight = height - 4; // Leave some padding

    for (let i = 0; i < this.barCount; i++) {
      // Get frequency value with logarithmic mapping
      const freqIndex = this.logarithmic
        ? Math.floor(Math.pow(i / this.barCount, 1.5) * analysis.fft.length)
        : Math.floor((i / this.barCount) * analysis.fft.length);

      const value = analysis.fft[Math.min(freqIndex, analysis.fft.length - 1)] / 255;
      const barHeight = value * maxBarHeight;

      const x = i * (barWidth + this.gap);
      const y = height - barHeight;

      // Draw bar with gradient
      const gradient = ctx.createLinearGradient(0, y, 0, height);
      this.applyColorScheme(gradient, value);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Update and draw peak
      if (this.showPeaks) {
        const peak = this.peaks[i];

        if (barHeight > peak.height) {
          peak.height = barHeight;
          peak.fallSpeed = 0.5;
        } else {
          peak.height -= peak.fallSpeed * deltaTime / 16; // Normalize for 60fps
          peak.fallSpeed += 0.05 * deltaTime / 16; // Accelerate fall
          peak.height = Math.max(0, peak.height);
        }

        // Draw peak dot
        const peakY = height - peak.height;
        ctx.fillStyle = this.getPeakColor();
        ctx.fillRect(x, peakY - 2, barWidth, 3);
      }
    }
  }

  /**
   * Apply color scheme to gradient
   */
  private applyColorScheme(gradient: CanvasGradient, value: number): void {
    switch (this.colorScheme) {
      case 'winamp':
        // Classic Winamp green-to-red
        if (value < 0.5) {
          gradient.addColorStop(0, '#00ff00');
          gradient.addColorStop(1, '#003300');
        } else {
          gradient.addColorStop(0, '#ff0000');
          gradient.addColorStop(0.5, '#ffff00');
          gradient.addColorStop(1, '#00ff00');
        }
        break;

      case 'fire':
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.5, '#ff9900');
        gradient.addColorStop(1, '#ffff00');
        break;

      case 'ocean':
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(0.5, '#0099ff');
        gradient.addColorStop(1, '#000066');
        break;

      case 'rainbow':
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.17, '#ff9900');
        gradient.addColorStop(0.33, '#ffff00');
        gradient.addColorStop(0.5, '#00ff00');
        gradient.addColorStop(0.67, '#0099ff');
        gradient.addColorStop(0.83, '#0000ff');
        gradient.addColorStop(1, '#9900ff');
        break;
    }
  }

  /**
   * Get peak indicator color
   */
  private getPeakColor(): string {
    switch (this.colorScheme) {
      case 'winamp': return '#ffffff';
      case 'fire': return '#ffff00';
      case 'ocean': return '#ffffff';
      case 'rainbow': return '#ffffff';
      default: return '#ffffff';
    }
  }

  cleanup(): void {
    // No cleanup needed
  }
}

/**
 * Factory function for creating spectrum renderer
 */
export function createSpectrumRenderer(config?: SpectrumConfig): Renderer {
  return new SpectrumRenderer(config);
}
