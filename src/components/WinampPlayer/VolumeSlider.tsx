import { usePlayerStore } from '../../stores/playerStore';

export function VolumeSlider() {
  const { volume, setVolume } = usePlayerStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };

  return (
    <div className="volume-slider">
      <label className="volume-label">
        <span className="volume-icon">🔊</span>
      </label>
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={handleChange}
        className="slider volume-bar"
        aria-label="Volume"
      />
      <span className="volume-value">{volume}</span>
    </div>
  );
}
