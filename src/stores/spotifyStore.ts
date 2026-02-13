/**
 * Spotify Authentication and API State Management
 *
 * Manages OAuth tokens, user profile, playlists, and SDK state.
 * Integrates with playerStore for playback synchronization.
 */

import { create } from 'zustand';
import {
  exchangeCodeForToken,
  refreshAccessToken,
  isTokenExpired,
} from '../lib/spotify/auth';
import { createSpotifyApi } from '../lib/spotify/api';
import type {
  SpotifyTokens,
  SpotifyUser,
  SpotifyPlaylist,
} from '../lib/spotify/types';

interface SpotifyState {
  // Authentication
  tokens: SpotifyTokens | null;
  isAuthenticated: boolean;
  user: SpotifyUser | null;

  // Player SDK
  deviceId: string | null;
  isSDKReady: boolean;

  // Data
  playlists: SpotifyPlaylist[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  setTokens: (tokens: SpotifyTokens) => void;
  setUser: (user: SpotifyUser) => void;
  setDeviceId: (deviceId: string) => void;
  setSDKReady: (ready: boolean) => void;
  setPlaylists: (playlists: SpotifyPlaylist[]) => void;
  setError: (error: string | null) => void;

  // Async actions
  handleCallback: (code: string, codeVerifier: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  loadUser: () => Promise<void>;
  loadPlaylists: () => Promise<void>;
  logout: () => void;
}

// Constants
const STORAGE_KEY_REFRESH_TOKEN = 'spotify_refresh_token';
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || '';

/**
 * Save refresh token to sessionStorage (more secure than localStorage)
 */
function saveRefreshToken(token: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, token);
  } catch (error) {
    console.error('Failed to save refresh token:', error);
  }
}

/**
 * Load refresh token from sessionStorage
 */
function loadRefreshToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY_REFRESH_TOKEN);
  } catch (error) {
    console.error('Failed to load refresh token:', error);
    return null;
  }
}

/**
 * Clear saved refresh token
 */
function clearRefreshToken(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN);
  } catch (error) {
    console.error('Failed to clear refresh token:', error);
  }
}

export const useSpotifyStore = create<SpotifyState>((set, get) => ({
  // Initial state
  tokens: null,
  isAuthenticated: false,
  user: null,
  deviceId: null,
  isSDKReady: false,
  playlists: [],
  isLoading: false,
  error: null,

  // Setters
  setTokens: (tokens) => {
    set({ tokens, isAuthenticated: true, error: null });
    // Save refresh token to sessionStorage
    if (tokens.refresh_token) {
      saveRefreshToken(tokens.refresh_token);
    }
  },

  setUser: (user) => set({ user }),

  setDeviceId: (deviceId) => set({ deviceId }),

  setSDKReady: (ready) => set({ isSDKReady: ready }),

  setPlaylists: (playlists) => set({ playlists }),

  setError: (error) => set({ error }),

  /**
   * Handle OAuth callback - exchange code for tokens
   */
  handleCallback: async (code, codeVerifier) => {
    set({ isLoading: true, error: null });

    try {
      const tokens = await exchangeCodeForToken(
        code,
        codeVerifier,
        CLIENT_ID,
        REDIRECT_URI
      );

      set({
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });

      // Save refresh token
      saveRefreshToken(tokens.refresh_token);

      // Load user profile
      await get().loadUser();

      // Load playlists
      await get().loadPlaylists();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      set({
        error: message,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async () => {
    const { tokens } = get();
    let refreshToken = tokens?.refresh_token;

    // Try to load from storage if not in state
    if (!refreshToken) {
      refreshToken = loadRefreshToken();
    }

    if (!refreshToken) {
      set({ error: 'No refresh token available', isAuthenticated: false });
      return;
    }

    try {
      const newTokens = await refreshAccessToken(refreshToken, CLIENT_ID);
      set({
        tokens: newTokens,
        isAuthenticated: true,
        error: null,
      });

      // Update stored refresh token
      saveRefreshToken(newTokens.refresh_token);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token refresh failed';
      console.error('Token refresh failed:', message);
      set({
        error: message,
        isAuthenticated: false,
        tokens: null,
      });
      clearRefreshToken();
      throw error;
    }
  },

  /**
   * Load current user profile
   */
  loadUser: async () => {
    const { tokens } = get();

    if (!tokens) {
      set({ error: 'Not authenticated' });
      return;
    }

    // Check if token is expired and refresh if needed
    if (isTokenExpired(tokens.expires_at)) {
      await get().refreshToken();
    }

    const currentTokens = get().tokens;
    if (!currentTokens) return;

    try {
      const api = createSpotifyApi(currentTokens.access_token);
      const user = await api.getCurrentUser();
      set({ user, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load user';
      set({ error: message });
      throw error;
    }
  },

  /**
   * Load user's playlists
   */
  loadPlaylists: async () => {
    const { tokens } = get();

    if (!tokens) {
      set({ error: 'Not authenticated' });
      return;
    }

    // Check if token is expired and refresh if needed
    if (isTokenExpired(tokens.expires_at)) {
      await get().refreshToken();
    }

    const currentTokens = get().tokens;
    if (!currentTokens) return;

    try {
      const api = createSpotifyApi(currentTokens.access_token);
      const response = await api.getUserPlaylists(50, 0);
      set({ playlists: response.items, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load playlists';
      set({ error: message });
      throw error;
    }
  },

  /**
   * Logout - clear all state and stored tokens
   */
  logout: () => {
    clearRefreshToken();
    set({
      tokens: null,
      isAuthenticated: false,
      user: null,
      deviceId: null,
      isSDKReady: false,
      playlists: [],
      error: null,
    });
  },
}));

/**
 * Initialize authentication on app load
 * Attempts to restore session from stored refresh token
 */
export async function initializeAuth(): Promise<void> {
  const refreshToken = loadRefreshToken();

  if (refreshToken) {
    try {
      const store = useSpotifyStore.getState();
      // Set a temporary token object so refreshToken() can work
      store.setTokens({
        access_token: '',
        refresh_token: refreshToken,
        expires_at: 0,
        token_type: 'Bearer',
        scope: '',
      });
      await store.refreshToken();
      await store.loadUser();
      await store.loadPlaylists();
    } catch (error) {
      console.error('Failed to restore session:', error);
      clearRefreshToken();
    }
  }
}
