import { Window } from '../common/Window';
import { PlaylistItem } from './PlaylistItem';
import { usePlayerStore } from '../../stores/playerStore';

export function Playlist() {
  const { queue, currentIndex, loadTrack, play } = usePlayerStore();

  const handleTrackClick = (index: number) => {
    const track = queue[index];
    loadTrack(track);
    usePlayerStore.setState({ currentIndex: index });
    play();
  };

  return (
    <Window
      title="Playlist Editor"
      initialPosition={{ x: 360, y: 50 }}
      width={400}
      height={300}
      className="playlist-window"
    >
      <div className="playlist-container">
        <div className="playlist-header">
          <span className="playlist-count">{queue.length} tracks</span>
        </div>
        <div className="playlist-items">
          {queue.map((track, index) => (
            <PlaylistItem
              key={track.id}
              track={track}
              index={index}
              isActive={index === currentIndex}
              onClick={() => handleTrackClick(index)}
            />
          ))}
        </div>
      </div>
    </Window>
  );
}
