import { useState, useEffect, useCallback, useRef } from 'react';
import { Window } from '../common/Window';
import { PlaylistItem } from './PlaylistItem';
import { usePlayerStore } from '../../stores/playerStore';
import { useSpotifyStore } from '../../stores/spotifyStore';
import { createSpotifyApi } from '../../lib/spotify/api';
import type { Track } from '../../types';
import type { SpotifyPlaylistTrack, SpotifyTrack } from '../../lib/spotify/types';

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

function convertSearchTrack(t: SpotifyTrack): Track {
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
  const { queue, currentIndex, loadTrack, play, addToQueue } = usePlayerStore();
  const { isAuthenticated, tokens, playlists, deviceId } = useSpotifyStore();

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

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

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || !tokens || !isAuthenticated) {
      setSearchResults([]);
      return;
    }

    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const api = createSpotifyApi(tokens.access_token);
        const response = await api.search(searchQuery, ['track'], 15);
        if (response.tracks) {
          setSearchResults(response.tracks.items.map(convertSearchTrack));
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery, tokens, isAuthenticated]);

  const handleTrackClick = (index: number) => {
    const track = queue[index];
    loadTrack(track);
    usePlayerStore.setState({ currentIndex: index, isPlaying: true });

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

  const handleSearchResultClick = (track: Track) => {
    addToQueue(track);
    loadTrack(track);
    usePlayerStore.setState({
      currentIndex: usePlayerStore.getState().queue.length - 1,
      isPlaying: true,
    });
    play();
    setSearchQuery('');
    setSearchResults([]);
  };

  const handlePlaylistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPlaylistId(value || null);
  };

  const showingSearch = searchQuery.trim().length > 0;

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

          {isAuthenticated && (
            <input
              type="text"
              className="playlist-search"
              placeholder="Search Spotify..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}
        </div>

        <div className="playlist-items">
          {isLoadingTracks || isSearching ? (
            <div className="playlist-loading">
              {isSearching ? 'Searching...' : 'Loading tracks...'}
            </div>
          ) : showingSearch ? (
            searchResults.length > 0 ? (
              searchResults.map((track, index) => (
                <PlaylistItem
                  key={`search-${track.id}`}
                  track={track}
                  index={index}
                  isActive={false}
                  onClick={() => handleSearchResultClick(track)}
                />
              ))
            ) : (
              <div className="playlist-loading">No results</div>
            )
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
