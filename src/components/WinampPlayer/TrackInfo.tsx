import { usePlayerStore } from '../../stores/playerStore';

export function TrackInfo() {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const position = usePlayerStore((state) => state.position);

  if (!currentTrack) {
    return (
      <div className="track-info">
        <div className="track-display">No track loaded</div>
      </div>
    );
  }

  return (
    <div className="track-info">
      <div className="track-info-row">
        {currentTrack.coverUrl && (
          <div className="track-cover">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.album}
              width={48}
              height={48}
            />
          </div>
        )}
        <div className="track-info-text">
          <div className="track-display">
            <div className="track-title marquee">
              {currentTrack.title} - {currentTrack.artist}
            </div>
          </div>
          <div className="track-meta">
            <span className="time-display">{formatTime(position)}</span>
            <span className="time-separator">/</span>
            <span className="time-total">{formatTime(currentTrack.duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
