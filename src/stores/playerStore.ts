import { create } from 'zustand';
import type { Track, PlaybackState, PlayerActions } from '../types';

// Mock tracks for development
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
  },

  pause: () => {
    set({ isPlaying: false });
  },

  stop: () => {
    set({ isPlaying: false, position: 0 });
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
  },

  previous: () => {
    const { currentIndex, queue, position } = get();
    // If more than 3 seconds into the song, restart it
    if (position > 3) {
      set({ position: 0 });
    } else {
      const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
      set({
        currentIndex: prevIndex,
        currentTrack: queue[prevIndex],
        position: 0,
        isPlaying: true,
      });
    }
  },

  seek: (position: number) => {
    set({ position });
  },

  setVolume: (volume: number) => {
    set({ volume: Math.max(0, Math.min(100, volume)) });
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
