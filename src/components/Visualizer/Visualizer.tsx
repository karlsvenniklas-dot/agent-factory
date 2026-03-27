import { useEffect, useRef, useState } from 'react';
import { Window } from '../common/Window';
import { usePlayerStore } from '../../stores/playerStore';
import { useVisualizerStore } from '../../stores/visualizerStore';
import { AudioPipeline } from '../../lib/visualizer/AudioPipeline';
import { VisualizerEngine } from '../../lib/visualizer/VisualizerEngine';
import '../../lib/visualizer/renderers'; // Register all renderers

/**
 * Canvas-based audio visualizer using the modular preset system
 * Click to cycle through presets
 */
export function Visualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<VisualizerEngine | null>(null);
  const pipelineRef = useRef<AudioPipeline | null>(null);

  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const activePreset = useVisualizerStore((state) => state.activePreset);
  const nextPreset = useVisualizerStore((state) => state.nextPreset);
  const setIsRunning = useVisualizerStore((state) => state.setIsRunning);

  const [presetName, setPresetName] = useState<string>('');

  // Initialize engine and pipeline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create audio pipeline (mock mode for now)
    const pipeline = new AudioPipeline(2048);
    pipelineRef.current = pipeline;

    // Create visualizer engine
    const engine = new VisualizerEngine(canvas, pipeline);
    engineRef.current = engine;

    // Set initial preset
    if (activePreset) {
      engine.setPreset(activePreset, 0); // No transition on initial load
      setPresetName(activePreset.name);
    }

    // Start engine
    engine.start();
    setIsRunning(true);

    // Cleanup
    return () => {
      engine.dispose();
      pipeline.dispose();
      engineRef.current = null;
      pipelineRef.current = null;
      setIsRunning(false);
    };
  }, []); // Only run once on mount

  // Update preset when changed
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !activePreset) return;

    engine.setPreset(activePreset, 500); // 500ms transition
    setPresetName(activePreset.name);
  }, [activePreset]);

  // Sync play/pause state with audio pipeline
  useEffect(() => {
    const pipeline = pipelineRef.current;
    if (pipeline) {
      pipeline.setPaused(!isPlaying);
    }
  }, [isPlaying]);

  // Handle preset cycling on click
  const handleClick = () => {
    nextPreset();
  };

  return (
    <Window
      title="Visualizer"
      initialPosition={{ x: 50, y: 200 }}
      width={275}
      height={116}
      className="visualizer-window"
    >
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={275}
          height={80}
          className="visualizer-canvas"
          onClick={handleClick}
          style={{
            cursor: 'pointer',
            display: 'block',
          }}
          title={`Current: ${presetName}\nClick to change preset`}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            left: '4px',
            color: '#00ff00',
            fontSize: '10px',
            fontFamily: 'monospace',
            textShadow: '0 0 3px #000, 1px 1px 0 #000',
            pointerEvents: 'none',
            opacity: 0.8,
          }}
        >
          {presetName}
        </div>
      </div>
    </Window>
  );
}
