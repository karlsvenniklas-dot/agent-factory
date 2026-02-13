import type { Track } from '../../types';

interface PlaylistItemProps {
  track: Track;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

export function PlaylistItem({ track, index, isActive, onClick }: PlaylistItemProps) {
  return (
    <div
      className={`playlist-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="item-number">{index + 1}.</span>
      <span className="item-title">{track.title}</span>
      <span className="item-artist">{track.artist}</span>
      <span className="item-duration">{formatDuration(track.duration)}</span>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
