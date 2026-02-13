import { usePlayerStore } from '../../stores/playerStore';

export function Controls() {
  const { isPlaying, play, pause, stop, previous, next } = usePlayerStore();

  return (
    <div className="player-controls">
      <button
        className="control-btn prev"
        onClick={previous}
        aria-label="Previous track"
        title="Previous"
      >
        <span className="btn-icon">⏮</span>
      </button>

      <button
        className="control-btn play"
        onClick={isPlaying ? pause : play}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        <span className="btn-icon">{isPlaying ? '⏸' : '▶'}</span>
      </button>

      <button
        className="control-btn stop"
        onClick={stop}
        aria-label="Stop"
        title="Stop"
      >
        <span className="btn-icon">⏹</span>
      </button>

      <button
        className="control-btn next"
        onClick={next}
        aria-label="Next track"
        title="Next"
      >
        <span className="btn-icon">⏭</span>
      </button>
    </div>
  );
}
