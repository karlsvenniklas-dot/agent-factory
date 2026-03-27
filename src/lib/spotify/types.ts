/**
 * Spotify-specific TypeScript types
 * These align with Spotify Web API and Web Playback SDK responses
 */

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Unix timestamp in milliseconds
  token_type: string;
  scope: string;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  product: 'premium' | 'free' | 'open';
  country: string;
}

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  uri: string;
  images: SpotifyImage[];
  artists: SpotifyArtist[];
  release_date: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  uri: string;
  images: SpotifyImage[];
  owner: {
    id: string;
    display_name: string;
  };
  tracks: {
    total: number;
    href: string;
  };
}

export interface SpotifyPlaylistTrack {
  added_at: string;
  track: SpotifyTrack;
}

export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: 'computer' | 'smartphone' | 'speaker';
  volume_percent: number;
}

/**
 * Web Playback SDK types
 */
export interface SpotifyPlayerState {
  paused: boolean;
  position: number; // milliseconds
  duration: number; // milliseconds
  track_window: {
    current_track: SpotifyWebPlaybackTrack;
    previous_tracks: SpotifyWebPlaybackTrack[];
    next_tracks: SpotifyWebPlaybackTrack[];
  };
  context: {
    uri: string;
    metadata: Record<string, unknown>;
  };
  disallows: {
    pausing?: boolean;
    skipping_prev?: boolean;
    skipping_next?: boolean;
    seeking?: boolean;
  };
}

export interface SpotifyWebPlaybackTrack {
  uri: string;
  id: string;
  name: string;
  duration_ms: number;
  artists: Array<{ uri: string; name: string }>;
  album: {
    uri: string;
    name: string;
    images: Array<{ url: string }>;
  };
}

export interface SpotifyWebPlaybackError {
  message: string;
}

/**
 * Search response types
 */
export interface SpotifySearchResponse {
  tracks?: {
    items: SpotifyTrack[];
    total: number;
    limit: number;
    offset: number;
  };
  artists?: {
    items: SpotifyArtist[];
    total: number;
  };
  albums?: {
    items: SpotifyAlbum[];
    total: number;
  };
}

/**
 * API Error types
 */
export interface SpotifyAPIError {
  error: {
    status: number;
    message: string;
  };
}

export type SpotifyErrorType =
  | 'initialization_error'
  | 'authentication_error'
  | 'account_error'
  | 'playback_error';

export interface SpotifyPlayerError {
  type: SpotifyErrorType;
  message: string;
}
