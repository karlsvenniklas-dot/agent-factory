/**
 * Spotify Web API Client
 *
 * Wrapper around Spotify REST API endpoints with proper error handling
 * and automatic token refresh.
 *
 * @see https://developer.spotify.com/documentation/web-api
 */

import type {
  SpotifyUser,
  SpotifyPlaylist,
  SpotifyPlaylistTrack,
  SpotifySearchResponse,
  SpotifyDevice,
  SpotifyAPIError,
} from './types';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

/**
 * Custom error class for Spotify API errors
 */
export class SpotifyAPIRequestError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'SpotifyAPIRequestError';
  }
}

/**
 * Creates a Spotify API client with authenticated requests
 *
 * @param accessToken - Valid Spotify access token
 * @returns Object with API methods
 */
export function createSpotifyApi(accessToken: string) {
  /**
   * Internal fetch wrapper with error handling
   */
  async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${SPOTIFY_API_BASE}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error: SpotifyAPIError = await response.json().catch(() => ({
          error: { status: response.status, message: response.statusText },
        }));

        throw new SpotifyAPIRequestError(
          response.status,
          error.error.message || `API request failed with status ${response.status}`
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof SpotifyAPIRequestError) {
        throw error;
      }
      console.error('Spotify API request failed:', error);
      throw new Error(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  return {
    /**
     * Get current user's profile
     * @see https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile
     */
    async getCurrentUser(): Promise<SpotifyUser> {
      return fetchAPI<SpotifyUser>('/me');
    },

    /**
     * Get current user's playlists
     * @see https://developer.spotify.com/documentation/web-api/reference/get-a-list-of-current-users-playlists
     */
    async getUserPlaylists(
      limit = 20,
      offset = 0
    ): Promise<{ items: SpotifyPlaylist[]; total: number }> {
      return fetchAPI<{ items: SpotifyPlaylist[]; total: number }>(
        `/me/playlists?limit=${limit}&offset=${offset}`
      );
    },

    /**
     * Get tracks from a specific playlist
     * @see https://developer.spotify.com/documentation/web-api/reference/get-playlists-tracks
     */
    async getPlaylistTracks(
      playlistId: string,
      limit = 50,
      offset = 0
    ): Promise<{ items: SpotifyPlaylistTrack[]; total: number }> {
      return fetchAPI<{ items: SpotifyPlaylistTrack[]; total: number }>(
        `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`
      );
    },

    /**
     * Search for tracks, artists, or albums
     * @see https://developer.spotify.com/documentation/web-api/reference/search
     */
    async search(
      query: string,
      types: Array<'track' | 'artist' | 'album'> = ['track'],
      limit = 20
    ): Promise<SpotifySearchResponse> {
      const typeString = types.join(',');
      const encodedQuery = encodeURIComponent(query);
      return fetchAPI<SpotifySearchResponse>(
        `/search?q=${encodedQuery}&type=${typeString}&limit=${limit}`
      );
    },

    /**
     * Get user's available devices
     * @see https://developer.spotify.com/documentation/web-api/reference/get-a-users-available-devices
     */
    async getDevices(): Promise<{ devices: SpotifyDevice[] }> {
      return fetchAPI<{ devices: SpotifyDevice[] }>('/me/player/devices');
    },

    /**
     * Transfer playback to a specific device
     * @see https://developer.spotify.com/documentation/web-api/reference/transfer-a-users-playback
     */
    async transferPlayback(
      deviceId: string,
      play = false
    ): Promise<void> {
      await fetchAPI<void>('/me/player', {
        method: 'PUT',
        body: JSON.stringify({
          device_ids: [deviceId],
          play,
        }),
      });
    },

    /**
     * Start/resume playback
     * @see https://developer.spotify.com/documentation/web-api/reference/start-a-users-playback
     */
    async play(
      deviceId?: string,
      contextUri?: string,
      uris?: string[],
      positionMs?: number
    ): Promise<void> {
      const params = deviceId ? `?device_id=${deviceId}` : '';
      const body: Record<string, unknown> = {};

      if (contextUri) body.context_uri = contextUri;
      if (uris) body.uris = uris;
      if (positionMs !== undefined) body.position_ms = positionMs;

      await fetchAPI<void>(`/me/player/play${params}`, {
        method: 'PUT',
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
      });
    },

    /**
     * Pause playback
     * @see https://developer.spotify.com/documentation/web-api/reference/pause-a-users-playback
     */
    async pause(deviceId?: string): Promise<void> {
      const params = deviceId ? `?device_id=${deviceId}` : '';
      await fetchAPI<void>(`/me/player/pause${params}`, {
        method: 'PUT',
      });
    },

    /**
     * Skip to next track
     * @see https://developer.spotify.com/documentation/web-api/reference/skip-users-playback-to-next-track
     */
    async skipToNext(deviceId?: string): Promise<void> {
      const params = deviceId ? `?device_id=${deviceId}` : '';
      await fetchAPI<void>(`/me/player/next${params}`, {
        method: 'POST',
      });
    },

    /**
     * Skip to previous track
     * @see https://developer.spotify.com/documentation/web-api/reference/skip-users-playback-to-previous-track
     */
    async skipToPrevious(deviceId?: string): Promise<void> {
      const params = deviceId ? `?device_id=${deviceId}` : '';
      await fetchAPI<void>(`/me/player/previous${params}`, {
        method: 'POST',
      });
    },

    /**
     * Seek to position in currently playing track
     * @see https://developer.spotify.com/documentation/web-api/reference/seek-to-position-in-currently-playing-track
     */
    async seek(positionMs: number, deviceId?: string): Promise<void> {
      const params = new URLSearchParams({ position_ms: positionMs.toString() });
      if (deviceId) params.append('device_id', deviceId);
      await fetchAPI<void>(`/me/player/seek?${params.toString()}`, {
        method: 'PUT',
      });
    },

    /**
     * Set playback volume
     * @see https://developer.spotify.com/documentation/web-api/reference/set-volume-for-users-playback
     */
    async setVolume(volumePercent: number, deviceId?: string): Promise<void> {
      const params = new URLSearchParams({
        volume_percent: Math.round(volumePercent).toString(),
      });
      if (deviceId) params.append('device_id', deviceId);
      await fetchAPI<void>(`/me/player/volume?${params.toString()}`, {
        method: 'PUT',
      });
    },
  };
}

export type SpotifyApi = ReturnType<typeof createSpotifyApi>;
