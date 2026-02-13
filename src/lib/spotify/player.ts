/**
 * Spotify Web Playback SDK Wrapper
 *
 * Handles SDK initialization, event management, and playback control.
 * The SDK script is loaded dynamically and player is initialized with proper
 * event handling for all critical events.
 *
 * @see https://developer.spotify.com/documentation/web-playback-sdk
 */

import type {
  SpotifyPlayerState,
  SpotifyWebPlaybackError,
  SpotifyPlayerError,
} from './types';

// Extend Window interface for Spotify SDK
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (config: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume: number;
      }) => SpotifyPlayer;
    };
  }
}

/**
 * Spotify Player instance interface
 */
interface SpotifyPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  addListener(
    event: string,
    callback: (data: unknown) => void
  ): boolean;
  removeListener(event: string): boolean;
  getCurrentState(): Promise<SpotifyPlayerState | null>;
  setName(name: string): Promise<void>;
  getVolume(): Promise<number>;
  setVolume(volume: number): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  togglePlay(): Promise<void>;
  seek(positionMs: number): Promise<void>;
  previousTrack(): Promise<void>;
  nextTrack(): Promise<void>;
  _options: { id: string };
}

/**
 * Player event listeners
 */
export interface PlayerEventHandlers {
  onReady?: (deviceId: string) => void;
  onNotReady?: (deviceId: string) => void;
  onPlayerStateChanged?: (state: SpotifyPlayerState | null) => void;
  onInitializationError?: (error: SpotifyPlayerError) => void;
  onAuthenticationError?: (error: SpotifyPlayerError) => void;
  onAccountError?: (error: SpotifyPlayerError) => void;
  onPlaybackError?: (error: SpotifyPlayerError) => void;
}

const SDK_SCRIPT_URL = 'https://sdk.scdn.co/spotify-player.js';
const SDK_LOAD_TIMEOUT = 10000; // 10 seconds

/**
 * Loads the Spotify Web Playback SDK script dynamically
 */
function loadSpotifySDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.Spotify) {
      resolve();
      return;
    }

    // Check if script is already in DOM
    if (document.querySelector(`script[src="${SDK_SCRIPT_URL}"]`)) {
      // Script exists, wait for it to load
      const timeout = setTimeout(() => {
        reject(new Error('Spotify SDK load timeout'));
      }, SDK_LOAD_TIMEOUT);

      window.onSpotifyWebPlaybackSDKReady = () => {
        clearTimeout(timeout);
        resolve();
      };
      return;
    }

    // Create and inject script
    const script = document.createElement('script');
    script.src = SDK_SCRIPT_URL;
    script.async = true;

    const timeout = setTimeout(() => {
      reject(new Error('Spotify SDK load timeout'));
    }, SDK_LOAD_TIMEOUT);

    window.onSpotifyWebPlaybackSDKReady = () => {
      clearTimeout(timeout);
      resolve();
    };

    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to load Spotify SDK script'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Initializes Spotify Web Playback SDK player
 *
 * @param accessToken - Valid Spotify access token with streaming scope
 * @param name - Name for the player device (visible in Spotify Connect)
 * @param handlers - Event handlers for player events
 * @returns Player instance and device ID
 */
export async function initializePlayer(
  accessToken: string,
  name: string,
  handlers: PlayerEventHandlers = {}
): Promise<{ player: SpotifyPlayer; deviceId: string }> {
  // Load SDK if not already loaded
  await loadSpotifySDK();

  return new Promise((resolve, reject) => {
    const player = new window.Spotify.Player({
      name,
      getOAuthToken: (cb) => {
        cb(accessToken);
      },
      volume: 0.75,
    });

    // Setup event listeners BEFORE connecting
    let deviceId: string | null = null;
    let hasResolved = false;

    // Ready event - player has connected and is ready to play
    player.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('Spotify Player ready with Device ID:', device_id);
      deviceId = device_id;

      if (handlers.onReady) {
        handlers.onReady(device_id);
      }

      // Resolve with player and device_id
      if (!hasResolved) {
        hasResolved = true;
        resolve({ player, deviceId: device_id });
      }
    });

    // Not Ready event - player has disconnected
    player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('Spotify Player disconnected:', device_id);

      if (handlers.onNotReady) {
        handlers.onNotReady(device_id);
      }
    });

    // Player State Changed - fired when playback state changes
    player.addListener(
      'player_state_changed',
      (state: SpotifyPlayerState | null) => {
        if (handlers.onPlayerStateChanged) {
          handlers.onPlayerStateChanged(state);
        }
      }
    );

    // Error handlers
    player.addListener(
      'initialization_error',
      ({ message }: SpotifyWebPlaybackError) => {
        console.error('Initialization Error:', message);
        const error: SpotifyPlayerError = {
          type: 'initialization_error',
          message,
        };

        if (handlers.onInitializationError) {
          handlers.onInitializationError(error);
        }

        if (!hasResolved) {
          hasResolved = true;
          reject(error);
        }
      }
    );

    player.addListener(
      'authentication_error',
      ({ message }: SpotifyWebPlaybackError) => {
        console.error('Authentication Error:', message);
        const error: SpotifyPlayerError = {
          type: 'authentication_error',
          message,
        };

        if (handlers.onAuthenticationError) {
          handlers.onAuthenticationError(error);
        }

        if (!hasResolved) {
          hasResolved = true;
          reject(error);
        }
      }
    );

    player.addListener(
      'account_error',
      ({ message }: SpotifyWebPlaybackError) => {
        console.error('Account Error:', message);
        const error: SpotifyPlayerError = {
          type: 'account_error',
          message,
        };

        if (handlers.onAccountError) {
          handlers.onAccountError(error);
        }

        if (!hasResolved) {
          hasResolved = true;
          reject(error);
        }
      }
    );

    player.addListener(
      'playback_error',
      ({ message }: SpotifyWebPlaybackError) => {
        console.error('Playback Error:', message);
        const error: SpotifyPlayerError = {
          type: 'playback_error',
          message,
        };

        if (handlers.onPlaybackError) {
          handlers.onPlaybackError(error);
        }
      }
    );

    // Connect to the player
    player.connect().catch((error) => {
      console.error('Failed to connect player:', error);
      if (!hasResolved) {
        hasResolved = true;
        reject(
          new Error(`Failed to connect player: ${error instanceof Error ? error.message : 'Unknown error'}`)
        );
      }
    });

    // Timeout fallback
    setTimeout(() => {
      if (!hasResolved) {
        hasResolved = true;
        reject(new Error('Player initialization timeout - no ready event received'));
      }
    }, SDK_LOAD_TIMEOUT);
  });
}

/**
 * Creates a state listener that calls callback on every state change
 * This is a convenience wrapper around the player_state_changed event
 */
export function createPlayerStateListener(
  player: SpotifyPlayer,
  callback: (state: SpotifyPlayerState | null) => void
): () => void {
  player.addListener('player_state_changed', callback);

  // Return cleanup function
  return () => {
    player.removeListener('player_state_changed');
  };
}

/**
 * Gets the current player state
 * Returns null if no track is playing
 */
export async function getPlayerState(
  player: SpotifyPlayer
): Promise<SpotifyPlayerState | null> {
  return player.getCurrentState();
}

/**
 * Safely disconnects the player
 */
export function disconnectPlayer(player: SpotifyPlayer): void {
  try {
    player.disconnect();
  } catch (error) {
    console.error('Error disconnecting player:', error);
  }
}
