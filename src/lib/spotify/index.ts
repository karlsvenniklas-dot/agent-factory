/**
 * Spotify Integration Library
 * Convenience re-exports for easy importing
 */

// Authentication
export {
  getAuthUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  isTokenExpired,
  verifyState,
  generateCodeVerifier,
  generateCodeChallenge,
  SPOTIFY_SCOPES,
} from './auth';

// API Client
export { createSpotifyApi, SpotifyAPIRequestError } from './api';
export type { SpotifyApi } from './api';

// Web Playback SDK
export {
  initializePlayer,
  disconnectPlayer,
  createPlayerStateListener,
  getPlayerState,
} from './player';
export type { PlayerEventHandlers } from './player';

// Types
export type {
  SpotifyTokens,
  SpotifyUser,
  SpotifyPlaylist,
  SpotifyPlaylistTrack,
  SpotifyTrack,
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyDevice,
  SpotifyPlayerState,
  SpotifyWebPlaybackTrack,
  SpotifySearchResponse,
  SpotifyAPIError,
  SpotifyPlayerError,
  SpotifyErrorType,
} from './types';
