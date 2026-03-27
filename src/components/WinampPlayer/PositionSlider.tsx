import { usePlayerStore } from '../../stores/playerStore';

export function PositionSlider() {
  const { position, currentTrack, seek } = usePlayerStore();

  if (!currentTrack) return null;

  const percentage = (position / currentTrack.duration) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPosition = (Number(e.target.value) / 100) * currentTrack.duration;
    seek(newPosition);
  };

  return (
    <div className="position-slider">
      <input
        type="range"
        min="0"
        max="100"
        value={percentage}
        onChange={handleChange}
        className="slider position-bar"
        aria-label="Seek position"
      />
      <div className="slider-fill" style={{ width: `${percentage}%` }} />
    </div>
  );
}
