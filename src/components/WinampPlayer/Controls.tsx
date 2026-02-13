import { usePlayerStore } from '../../stores/playerStore';

export function Controls() {
  const { isPlaying, shuffle, repeat, play, pause, stop, previous, next, toggleShuffle, cycleRepeat } = usePlayerStore();

  const repeatLabel = repeat === 'off' ? 'Off' : repeat === 'all' ? 'All' : '1';

  return (
    <div className="player-controls-wrapper">
      <div className="player-controls">
        <button
          className="control-btn prev"
          onClick={previous}
          aria-label="Previous track"
          title="Previous (P)"
        >
          <span className="btn-icon">⏮</span>
        </button>

        <button
          className="control-btn play"
          onClick={isPlaying ? pause : play}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          <span className="btn-icon">{isPlaying ? '⏸' : '▶'}</span>
        </button>

        <button
          className="control-btn stop"
          onClick={stop}
          aria-label="Stop"
          title="Stop (S)"
        >
          <span className="btn-icon">⏹</span>
        </button>

        <button
          className="control-btn next"
          onClick={next}
          aria-label="Next track"
          title="Next (N)"
        >
          <span className="btn-icon">⏭</span>
        </button>
      </div>

      <div className="player-modes">
        <button
          className={`mode-btn ${shuffle ? 'active' : ''}`}
          onClick={toggleShuffle}
          aria-label="Toggle shuffle"
          title={`Shuffle: ${shuffle ? 'On' : 'Off'}`}
        >
          SHF
        </button>

        <button
          className={`mode-btn ${repeat !== 'off' ? 'active' : ''}`}
          onClick={cycleRepeat}
          aria-label="Cycle repeat mode"
          title={`Repeat: ${repeatLabel}`}
        >
          RPT{repeat === 'one' ? '1' : ''}
        </button>
      </div>
    </div>
  );
}
