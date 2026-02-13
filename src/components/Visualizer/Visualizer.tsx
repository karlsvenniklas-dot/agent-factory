import { useEffect, useRef } from 'react';
import { Window } from '../common/Window';
import { usePlayerStore } from '../../stores/playerStore';

/**
 * Canvas-based audio visualizer
 * Placeholder implementation - will be enhanced by Canvas Visualizer Developer
 */
export function Visualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      if (isPlaying) {
        // Simple placeholder visualization
        const barCount = 20;
        const barWidth = width / barCount;

        for (let i = 0; i < barCount; i++) {
          const barHeight = Math.random() * height * 0.8;
          const x = i * barWidth;
          const y = height - barHeight;

          // Green gradient (Winamp style)
          const gradient = ctx.createLinearGradient(0, y, 0, height);
          gradient.addColorStop(0, '#00ff00');
          gradient.addColorStop(1, '#003300');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, barWidth - 2, barHeight);
        }
      } else {
        // Show static bars when paused
        ctx.fillStyle = '#003300';
        const centerY = height / 2;
        ctx.fillRect(0, centerY - 2, width, 4);
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  return (
    <Window
      title="Visualizer"
      initialPosition={{ x: 50, y: 200 }}
      width={275}
      height={116}
      className="visualizer-window"
    >
      <canvas
        ref={canvasRef}
        width={275}
        height={80}
        className="visualizer-canvas"
      />
    </Window>
  );
}
