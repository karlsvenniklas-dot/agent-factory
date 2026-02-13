// Common TypeScript types for the application

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlaybackState {
  isPlaying: boolean;
  currentTrack: Track | null;
  volume: number; // 0-100
  position: number; // current position in seconds
  queue: Track[];
  currentIndex: number;
  shuffle: boolean;
  repeat: RepeatMode;
}

export interface PlayerActions {
  play: () => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  seek: (position: number) => void;
  setVolume: (volume: number) => void;
  loadTrack: (track: Track) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

export interface WindowPosition {
  x: number;
  y: number;
}
