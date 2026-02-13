import type { Renderer, AudioAnalysis } from '../types';

interface ParticleConfig {
  particleCount?: number;
  baseSpeed?: number;
  colors?: string[];
  particleSize?: number;
  trailLength?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

/**
 * Particle system renderer
 * Particles react to beats and frequency bands
 */
export class ParticleRenderer implements Renderer {
  name = 'particle';

  private particleCount: number;
  private baseSpeed: number;
  private colors: string[];
  private particleSize: number;
  private trailLength: number;

  // Particle pool (pre-allocated, no GC)
  private particles: Particle[] = [];
  private centerX = 0;
  private centerY = 0;

  constructor(config: ParticleConfig = {}) {
    this.particleCount = config.particleCount ?? 100;
    this.baseSpeed = config.baseSpeed ?? 2;
    this.colors = config.colors ?? ['#ff0066', '#00ffff', '#ffff00', '#00ff00'];
    this.particleSize = config.particleSize ?? 3;
    this.trailLength = config.trailLength ?? 10;

    // Pre-allocate particles
    this.initParticles();
  }

  setup(canvas: HTMLCanvasElement): void {
    this.centerX = canvas.width / 2;
    this.centerY = canvas.height / 2;
    this.resetParticles();
  }

  render(ctx: CanvasRenderingContext2D, analysis: AudioAnalysis, deltaTime: number): void {
    const { width, height } = ctx.canvas;

    // Update center if canvas resized
    if (this.centerX !== width / 2 || this.centerY !== height / 2) {
      this.centerX = width / 2;
      this.centerY = height / 2;
    }

    // Trail effect (fade previous frame)
    ctx.fillStyle = `rgba(0, 0, 0, ${1 / this.trailLength})`;
    ctx.fillRect(0, 0, width, height);

    // On beat, create explosion
    if (analysis.beat.detected) {
      this.createExplosion(analysis.beat.confidence);
    }

    // Update and draw particles
    const dt = deltaTime / 16; // Normalize for 60fps

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Update position
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Apply drag
      p.vx *= 0.98;
      p.vy *= 0.98;

      // React to treble (vibration)
      if (analysis.bands.treble > 0.5) {
        p.x += (Math.random() - 0.5) * analysis.bands.treble * 2;
        p.y += (Math.random() - 0.5) * analysis.bands.treble * 2;
      }

      // Update life
      p.life -= dt;
      if (p.life <= 0) {
        this.respawnParticle(p);
      }

      // Wrap around edges
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Draw particle
      const alpha = p.life / p.maxLife;
      const size = p.size * (0.5 + alpha * 0.5);

      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  /**
   * Initialize particle pool
   */
  private initParticles(): void {
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        life: 0,
        maxLife: 60,
        size: this.particleSize,
      });
    }
  }

  /**
   * Reset all particles to center
   */
  private resetParticles(): void {
    for (let i = 0; i < this.particles.length; i++) {
      this.respawnParticle(this.particles[i]);
    }
  }

  /**
   * Respawn a particle at center with random velocity
   */
  private respawnParticle(p: Particle): void {
    p.x = this.centerX;
    p.y = this.centerY;

    const angle = Math.random() * Math.PI * 2;
    const speed = this.baseSpeed * (0.5 + Math.random() * 0.5);
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;

    p.life = p.maxLife * (0.5 + Math.random() * 0.5);
    p.color = this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  /**
   * Create explosion effect on beat
   */
  private createExplosion(confidence: number): void {
    const explosionSize = Math.floor(this.particleCount * 0.3 * confidence);

    for (let i = 0; i < explosionSize; i++) {
      const p = this.particles[Math.floor(Math.random() * this.particles.length)];

      p.x = this.centerX + (Math.random() - 0.5) * 20;
      p.y = this.centerY + (Math.random() - 0.5) * 20;

      const angle = Math.random() * Math.PI * 2;
      const speed = this.baseSpeed * 3 * confidence * (0.8 + Math.random() * 0.4);
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;

      p.life = p.maxLife;
      p.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }
  }

  cleanup(): void {
    // No cleanup needed
  }
}

/**
 * Factory function for creating particle renderer
 */
export function createParticleRenderer(config?: ParticleConfig): Renderer {
  return new ParticleRenderer(config);
}
