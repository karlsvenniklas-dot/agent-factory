import { create } from 'zustand';
import type { Track, PlaybackState, PlayerActions } from '../types';
import { useSpotifyStore } from './spotifyStore';
import { createSpotifyApi } from '../lib/spotify/api';

// Mock tracks for development (fallback when not connected to Spotify)
const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Electric Dreams',
    artist: 'Synthwave Artist',
    album: 'Retro Vibes',
    duration: 245,
  },
  {
    id: '2',
    title: 'Neon Nights',
    artist: 'Retrowave Band',
    album: 'Midnight Drive',
    duration: 198,
  },
  {
    id: '3',
    title: 'Digital Love',
    artist: 'Cyber Sound',
    album: 'Future Past',
    duration: 312,
  },
];

interface PlayerStore extends PlaybackState, PlayerActions {}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  // Initial state
  isPlaying: false,
  currentTrack: mockTracks[0],
  volume: 75,
  position: 0,
  queue: mockTracks,
  currentIndex: 0,

  // Actions
  play: () => {
    set({ isPlaying: true });

    // Call Spotify API to resume playback
    const spotifyStore = useSpotifyStore.getState();
    if (spotifyStore.tokens && spotifyStore.deviceId) {
      const api = createSpotifyApi(spotifyStore.tokens.access_token);
      api.play(spotifyStore.deviceId).catch((err) => {
        console.error('Failed to play:', err);
      });
    }
  },

  pause: () => {
    set({ isPlaying: false });

    // Call Spotify API to pause playback
    const spotifyStore = useSpotifyStore.getState();
    if (spotifyStore.tokens && spotifyStore.deviceId) {
      const api = createSpotifyApi(spotifyStore.tokens.access_token);
      api.pause(spotifyStore.deviceId).catch((err) => {
        console.error('Failed to pause:', err);
      });
    }
  },

  stop: () => {
    set({ isPlaying: false, position: 0 });

    // Pause and seek to start
    const spotifyStore = useSpotifyStore.getState();
    if (spotifyStore.tokens && spotifyStore.deviceId) {
      const api = createSpotifyApi(spotifyStore.tokens.access_token);
      api.pause(spotifyStore.deviceId).catch((err) => {
        console.error('Failed to stop:', err);
      });
      api.seek(0, spotifyStore.deviceId).catch((err) => {
        console.error('Failed to seek:', err);
      });
    }
  },

  next: () => {
    const { currentIndex, queue } = get();
    const nextIndex = (currentIndex + 1) % queue.length;
    set({
      currentIndex: nextIndex,
      currentTrack: queue[nextIndex],
      position: 0,
      isPlaying: true,
    });

    // Call Spotify API to skip to next
    const spotifyStore = useSpotifyStore.getState();
    if (spotifyStore.tokens && spotifyStore.deviceId) {
      const api = createSpotifyApi(spotifyStore.tokens.access_token);
      api.skipToNext(spotifyStore.deviceId).catch((err) => {
        console.error('Failed to skip to next:', err);
      });
    }
  },

  previous: () => {
    const { currentIndex, queue, position } = get();
    // If more than 3 seconds into the song, restart it
    if (position > 3) {
      set({ position: 0 });

      // Seek to start
      const spotifyStore = useSpotifyStore.getState();
      if (spotifyStore.tokens && spotifyStore.deviceId) {
        const api = createSpotifyApi(spotifyStore.tokens.access_token);
        api.seek(0, spotifyStore.deviceId).catch((err) => {
          console.error('Failed to seek:', err);
        });
      }
    } else {
      const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
      set({
        currentIndex: prevIndex,
        currentTrack: queue[prevIndex],
        position: 0,
        isPlaying: true,
      });

      // Call Spotify API to skip to previous
      const spotifyStore = useSpotifyStore.getState();
      if (spotifyStore.tokens && spotifyStore.deviceId) {
        const api = createSpotifyApi(spotifyStore.tokens.access_token);
        api.skipToPrevious(spotifyStore.deviceId).catch((err) => {
          console.error('Failed to skip to previous:', err);
        });
      }
    }
  },

  seek: (position: number) => {
    set({ position });

    // Call Spotify API to seek (debounced in practice, but for now immediate)
    const spotifyStore = useSpotifyStore.getState();
    if (spotifyStore.tokens && spotifyStore.deviceId) {
      const api = createSpotifyApi(spotifyStore.tokens.access_token);
      api.seek(position * 1000, spotifyStore.deviceId).catch((err) => {
        console.error('Failed to seek:', err);
      });
    }
  },

  setVolume: (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, volume));
    set({ volume: clampedVolume });

    // Call Spotify API to set volume
    const spotifyStore = useSpotifyStore.getState();
    if (spotifyStore.tokens && spotifyStore.deviceId) {
      const api = createSpotifyApi(spotifyStore.tokens.access_token);
      api.setVolume(clampedVolume, spotifyStore.deviceId).catch((err) => {
        console.error('Failed to set volume:', err);
      });
    }
  },

  loadTrack: (track: Track) => {
    set({ currentTrack: track, position: 0 });
  },

  addToQueue: (track: Track) => {
    set((state) => ({
      queue: [...state.queue, track],
    }));
  },

  removeFromQueue: (index: number) => {
    set((state) => ({
      queue: state.queue.filter((_, i) => i !== index),
    }));
  },
}));
