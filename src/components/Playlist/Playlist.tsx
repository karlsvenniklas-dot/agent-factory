import { useState, useEffect, useCallback } from 'react';
import { Window } from '../common/Window';
import { PlaylistItem } from './PlaylistItem';
import { usePlayerStore } from '../../stores/playerStore';
import { useSpotifyStore } from '../../stores/spotifyStore';
import { createSpotifyApi } from '../../lib/spotify/api';
import type { Track } from '../../types';
import type { SpotifyPlaylistTrack } from '../../lib/spotify/types';

function convertSpotifyTrackToTrack(item: SpotifyPlaylistTrack): Track {
  const t = item.track;
  return {
    id: t.id,
    title: t.name,
    artist: t.artists.map((a) => a.name).join(', '),
    album: t.album.name,
    duration: Math.floor(t.duration_ms / 1000),
    coverUrl: t.album.images[0]?.url,
  };
}

export function Playlist() {
  const { queue, currentIndex, loadTrack, play } = usePlayerStore();
  const { isAuthenticated, tokens, playlists, deviceId } = useSpotifyStore();

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

  // Load tracks from selected Spotify playlist
  const loadPlaylistTracks = useCallback(async (playlistId: string) => {
    if (!tokens) return;

    setIsLoadingTracks(true);
    try {
      const api = createSpotifyApi(tokens.access_token);
      const response = await api.getPlaylistTracks(playlistId, 50, 0);

      const tracks = response.items
        .filter((item) => item.track && item.track.id)
        .map(convertSpotifyTrackToTrack);

      // Replace queue with playlist tracks
      usePlayerStore.setState({
        queue: tracks,
        currentIndex: 0,
        currentTrack: tracks[0] ?? null,
        position: 0,
      });
    } catch (err) {
      console.error('Failed to load playlist tracks:', err);
    } finally {
      setIsLoadingTracks(false);
    }
  }, [tokens]);

  // Load tracks when playlist selection changes
  useEffect(() => {
    if (selectedPlaylistId && isAuthenticated) {
      loadPlaylistTracks(selectedPlaylistId);
    }
  }, [selectedPlaylistId, isAuthenticated, loadPlaylistTracks]);

  const handleTrackClick = (index: number) => {
    const track = queue[index];
    loadTrack(track);
    usePlayerStore.setState({ currentIndex: index, isPlaying: true });

    // Play via Spotify context if we have a selected playlist
    if (isAuthenticated && tokens && deviceId && selectedPlaylistId) {
      const playlist = playlists.find((p) => p.id === selectedPlaylistId);
      if (playlist) {
        const api = createSpotifyApi(tokens.access_token);
        api.play(deviceId, playlist.uri, undefined, 0).catch((err) => {
          console.error('Failed to play playlist context:', err);
        });
      }
    } else {
      play();
    }
  };

  const handlePlaylistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPlaylistId(value || null);
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
          {isAuthenticated && playlists.length > 0 ? (
            <select
              className="playlist-selector"
              value={selectedPlaylistId ?? ''}
              onChange={handlePlaylistChange}
            >
              <option value="">Local Queue ({queue.length} tracks)</option>
              {playlists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.name} ({pl.tracks.total})
                </option>
              ))}
            </select>
          ) : (
            <span className="playlist-count">{queue.length} tracks</span>
          )}
        </div>
        <div className="playlist-items">
          {isLoadingTracks ? (
            <div className="playlist-loading">Loading tracks...</div>
          ) : (
            queue.map((track, index) => (
              <PlaylistItem
                key={track.id}
                track={track}
                index={index}
                isActive={index === currentIndex}
                onClick={() => handleTrackClick(index)}
              />
            ))
          )}
        </div>
      </div>
    </Window>
  );
}
