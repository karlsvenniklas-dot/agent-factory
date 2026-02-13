import { WinampPlayer } from './components/WinampPlayer/WinampPlayer';
import { Playlist } from './components/Playlist/Playlist';
import { Visualizer } from './components/Visualizer/Visualizer';

function App() {
  return (
    <div className="app">
      <WinampPlayer />
      <Visualizer />
      <Playlist />
    </div>
  );
}

export default App;
