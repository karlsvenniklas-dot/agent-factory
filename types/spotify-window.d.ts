// Förläng Window-typen för Spotify Web Playback SDK.
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: typeof Spotify;
  }
}

export {};
