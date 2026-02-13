/**
 * Main Application Component
 *
 * Handles authentication flow and renders appropriate UI based on auth state.
 * Initializes Spotify player when authenticated.
 */

import { useEffect } from 'react';
import { useSpotifyStore, initializeAuth } from './stores/spotifyStore';
import { useSpotifyPlayer } from './hooks/useSpotifyPlayer';
import { LoginScreen } from './components/LoginScreen';
import { WinampPlayer } from './components/WinampPlayer/WinampPlayer';
import { Playlist } from './components/Playlist/Playlist';
import { Visualizer } from './components/Visualizer/Visualizer';

function App() {
  const { isAuthenticated } = useSpotifyStore();
  const { isReady, error: playerError } = useSpotifyPlayer();

  // Initialize authentication on mount (restore session if available)
  useEffect(() => {
    initializeAuth();
  }, []);

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Show player interface when authenticated
  return (
    <div className="app">
      {playerError && (
        <div className="player-error">
          Playback Error: {playerError}
        </div>
      )}

      {!isReady && (
        <div className="player-initializing">
          Initializing Spotify player...
        </div>
      )}

      <WinampPlayer />
      <Visualizer />
      <Playlist />
    </div>
  );
}

export default App;
