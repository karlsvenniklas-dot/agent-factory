import type { RendererFactory, Renderer } from './types';

/**
 * Global registry for visualizer renderers
 * Implements singleton pattern for centralized renderer management
 */
class RendererRegistryClass {
  private renderers = new Map<string, RendererFactory>();

  /**
   * Register a new renderer factory
   */
  register(name: string, factory: RendererFactory): void {
    if (this.renderers.has(name)) {
      console.warn(`Renderer "${name}" is already registered, overwriting`);
    }
    this.renderers.set(name, factory);
  }

  /**
   * Create a renderer instance by name
   */
  create(name: string, config?: Record<string, unknown>): Renderer {
    const factory = this.renderers.get(name);
    if (!factory) {
      throw new Error(`Renderer "${name}" not found. Available renderers: ${this.getAvailable().join(', ')}`);
    }
    return factory(config);
  }

  /**
   * Get list of all registered renderer names
   */
  getAvailable(): string[] {
    return Array.from(this.renderers.keys());
  }

  /**
   * Check if a renderer is registered
   */
  has(name: string): boolean {
    return this.renderers.has(name);
  }

  /**
   * Unregister a renderer
   */
  unregister(name: string): boolean {
    return this.renderers.delete(name);
  }

  /**
   * Clear all registered renderers
   */
  clear(): void {
    this.renderers.clear();
  }
}

// Export singleton instance
export const RendererRegistry = new RendererRegistryClass();
