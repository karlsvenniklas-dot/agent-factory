import { usePlayerStore } from '../../stores/playerStore';

export function TrackInfo() {
  const currentTrack = usePlayerStore((state) => state.currentTrack);

  if (!currentTrack) {
    return (
      <div className="track-info">
        <div className="track-display">No track loaded</div>
      </div>
    );
  }

  return (
    <div className="track-info">
      <div className="track-display">
        <div className="track-title marquee">
          {currentTrack.title} - {currentTrack.artist}
        </div>
      </div>
      <div className="track-time">
        <span className="time-display">{formatTime(usePlayerStore.getState().position)}</span>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
