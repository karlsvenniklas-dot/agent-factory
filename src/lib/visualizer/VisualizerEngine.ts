import type { Renderer, VisualizerPreset } from './types';
import type { AudioPipeline } from './AudioPipeline';
import { RendererRegistry } from './RendererRegistry';

/**
 * Main visualizer engine
 * Manages the render loop, active renderer, and preset transitions
 */
export class VisualizerEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private audioPipeline: AudioPipeline;

  private activeRenderer: Renderer | null = null;
  private activePreset: VisualizerPreset | null = null;

  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private isRunning = false;

  // FPS tracking
  private frameCount = 0;
  private fpsTime = 0;
  private currentFps = 60;

  // Transition state
  private transitionProgress = 0;
  private transitionDuration = 0;
  private previousRenderer: Renderer | null = null;

  constructor(canvas: HTMLCanvasElement, audioPipeline: AudioPipeline) {
    this.canvas = canvas;
    this.audioPipeline = audioPipeline;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = ctx;

    // Setup canvas for crisp rendering
    this.setupCanvas();
  }

  /**
   * Setup canvas for optimal rendering
   */
  private setupCanvas(): void {
    // Disable image smoothing for pixel-perfect rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  /**
   * Set the active preset and create renderer
   */
  setPreset(preset: VisualizerPreset, transitionDuration = 500): void {
    try {
      // Create new renderer
      const newRenderer = RendererRegistry.create(preset.renderer, preset.config);
      newRenderer.setup(this.canvas);

      // Start transition if we have an active renderer
      if (this.activeRenderer && transitionDuration > 0) {
        this.previousRenderer = this.activeRenderer;
        this.transitionProgress = 0;
        this.transitionDuration = transitionDuration;
      } else {
        // No transition, cleanup old renderer immediately
        if (this.activeRenderer) {
          this.activeRenderer.cleanup();
        }
        this.previousRenderer = null;
        this.transitionProgress = 1;
        this.transitionDuration = 0;
      }

      this.activeRenderer = newRenderer;
      this.activePreset = preset;
    } catch (error) {
      console.error('Failed to set preset:', error);
      throw error;
    }
  }

  /**
   * Get the current active preset
   */
  getActivePreset(): VisualizerPreset | null {
    return this.activePreset;
  }

  /**
   * Start the render loop
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.fpsTime = this.lastFrameTime;
    this.frameCount = 0;

    this.renderLoop();
  }

  /**
   * Stop the render loop
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main render loop
   */
  private renderLoop = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    // Update FPS
    this.updateFPS(now);

    // Get audio analysis
    const analysis = this.audioPipeline.analyze();

    // Handle canvas resize
    this.handleResize();

    // Render based on transition state
    if (this.transitionProgress < 1 && this.transitionDuration > 0) {
      // In transition
      this.renderTransition(analysis, deltaTime);
      this.transitionProgress += deltaTime / this.transitionDuration;

      if (this.transitionProgress >= 1) {
        // Transition complete
        this.transitionProgress = 1;
        if (this.previousRenderer) {
          this.previousRenderer.cleanup();
          this.previousRenderer = null;
        }
      }
    } else {
      // Normal rendering
      if (this.activeRenderer) {
        this.activeRenderer.render(this.ctx, analysis, deltaTime);
      }
    }

    // Continue loop
    this.animationFrameId = requestAnimationFrame(this.renderLoop);
  };

  /**
   * Render transition between two renderers
   */
  private renderTransition(analysis: ReturnType<AudioPipeline['analyze']>, deltaTime: number): void {
    if (!this.activeRenderer) return;

    // Create offscreen canvas for previous renderer
    if (this.previousRenderer) {
      const offscreen = document.createElement('canvas');
      offscreen.width = this.canvas.width;
      offscreen.height = this.canvas.height;
      const offCtx = offscreen.getContext('2d');

      if (offCtx) {
        // Render previous
        this.previousRenderer.render(offCtx, analysis, deltaTime);

        // Clear main canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw previous with fade
        this.ctx.globalAlpha = 1 - this.transitionProgress;
        this.ctx.drawImage(offscreen, 0, 0);
      }
    }

    // Render current with fade in
    const offscreen = document.createElement('canvas');
    offscreen.width = this.canvas.width;
    offscreen.height = this.canvas.height;
    const offCtx = offscreen.getContext('2d');

    if (offCtx) {
      this.activeRenderer.render(offCtx, analysis, deltaTime);
      this.ctx.globalAlpha = this.transitionProgress;
      this.ctx.drawImage(offscreen, 0, 0);
      this.ctx.globalAlpha = 1;
    }
  }

  /**
   * Update FPS counter
   */
  private updateFPS(now: number): void {
    this.frameCount++;
    const elapsed = now - this.fpsTime;

    if (elapsed >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.fpsTime = now;
    }
  }

  /**
   * Handle canvas resize
   */
  private handleResize(): void {
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;

    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
      this.setupCanvas();
    }
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.currentFps;
  }

  /**
   * Check if engine is running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stop();

    if (this.activeRenderer) {
      this.activeRenderer.cleanup();
      this.activeRenderer = null;
    }

    if (this.previousRenderer) {
      this.previousRenderer.cleanup();
      this.previousRenderer = null;
    }

    this.activePreset = null;
  }
}
