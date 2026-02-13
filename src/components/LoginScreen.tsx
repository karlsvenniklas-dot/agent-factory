/**
 * Spotify Login Screen Component
 *
 * Handles OAuth login flow and callback processing.
 * Shows login button if not authenticated, handles redirect callback.
 */

import { useEffect, useState } from 'react';
import { useSpotifyStore } from '../stores/spotifyStore';
import { getAuthUrl, verifyState } from '../lib/spotify/auth';
import './LoginScreen.css';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || '';

// Session storage keys
const STORAGE_KEY_CODE_VERIFIER = 'spotify_code_verifier';
const STORAGE_KEY_STATE = 'spotify_state';

export function LoginScreen() {
  const { isAuthenticated, user, handleCallback, error: authError } = useSpotifyStore();
  const [error, setError] = useState<string | null>(null);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);

  // Handle OAuth callback on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');

    // Handle error from Spotify
    if (error) {
      setError(`Authentication failed: ${error}`);
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Process authorization code
    if (code && state) {
      const savedCodeVerifier = sessionStorage.getItem(STORAGE_KEY_CODE_VERIFIER);
      const savedState = sessionStorage.getItem(STORAGE_KEY_STATE);

      if (!savedCodeVerifier || !savedState) {
        setError('Session expired. Please log in again.');
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Verify state to prevent CSRF
      if (!verifyState(state, savedState)) {
        setError('Invalid state parameter. Possible CSRF attempt.');
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Exchange code for tokens
      setIsProcessingCallback(true);
      handleCallback(code, savedCodeVerifier)
        .then(() => {
          // Clean up
          sessionStorage.removeItem(STORAGE_KEY_CODE_VERIFIER);
          sessionStorage.removeItem(STORAGE_KEY_STATE);
          // Clear URL params
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Authentication failed');
        })
        .finally(() => {
          setIsProcessingCallback(false);
        });
    }
  }, [handleCallback]);

  const handleLogin = async () => {
    if (!CLIENT_ID || !REDIRECT_URI) {
      setError('Spotify credentials not configured. Please check your .env file.');
      return;
    }

    try {
      const { url, codeVerifier, state } = await getAuthUrl(CLIENT_ID, REDIRECT_URI);

      // Save verifier and state for callback
      sessionStorage.setItem(STORAGE_KEY_CODE_VERIFIER, codeVerifier);
      sessionStorage.setItem(STORAGE_KEY_STATE, state);

      // Redirect to Spotify authorization
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate login');
    }
  };

  if (isProcessingCallback) {
    return (
      <div className="login-screen">
        <div className="login-container">
          <h1>Authenticating...</h1>
          <p>Please wait while we complete the login process.</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="login-screen">
        <div className="login-container">
          <h1>Welcome, {user.display_name}!</h1>
          <p>Loading your music...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-container">
        <h1>Winamp Spotify Player</h1>
        <p className="subtitle">Connect your Spotify account to start playing music</p>

        {(error || authError) && (
          <div className="error-message">
            {error || authError}
          </div>
        )}

        <button className="login-button" onClick={handleLogin}>
          Login with Spotify
        </button>

        <div className="info-box">
          <p>This app requires a Spotify Premium account to use the Web Playback SDK.</p>
        </div>
      </div>
    </div>
  );
}
