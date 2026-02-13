import { useDraggable } from '../../hooks/useDraggable';
import { useSpotifyPlayer } from '../../hooks/useSpotifyPlayer';
import { TitleBar } from './TitleBar';
import { TrackInfo } from './TrackInfo';
import { Controls } from './Controls';
import { PositionSlider } from './PositionSlider';
import { VolumeSlider } from './VolumeSlider';

export function WinampPlayer() {
  const { position, isDragging, dragRef, handleMouseDown } = useDraggable({
    initialPosition: { x: 50, y: 50 },
  });

  // Initialize Spotify player (currently mock)
  useSpotifyPlayer();

  return (
    <div
      ref={dragRef}
      className={`winamp-player ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
      }}
    >
      <TitleBar onMouseDown={handleMouseDown} />

      <div className="player-main">
        <div className="player-display">
          <TrackInfo />
        </div>

        <div className="player-controls-section">
          <Controls />
        </div>

        <div className="player-sliders">
          <PositionSlider />
          <VolumeSlider />
        </div>
      </div>
    </div>
  );
}
