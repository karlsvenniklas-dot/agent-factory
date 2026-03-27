/**
 * Spotify OAuth 2.0 PKCE Authentication
 *
 * Implements the Authorization Code with PKCE flow as recommended by Spotify.
 * NEVER use implicit grant (deprecated).
 *
 * @see https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 */

import type { SpotifyTokens } from './types';

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

/**
 * Required Spotify scopes for Web Playback SDK and playlist access
 */
export const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-library-read',
  'playlist-read-private',
  'user-modify-playback-state',
  'user-read-playback-state',
  'user-read-currently-playing',
] as const;

/**
 * Generates a cryptographically random code verifier for PKCE
 * Length: 43-128 characters
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Generates SHA256 code challenge from verifier
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

/**
 * Base64URL encoding (without padding)
 */
function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generates the Spotify authorization URL with PKCE parameters
 *
 * @param clientId - Your Spotify application client ID
 * @param redirectUri - Registered redirect URI
 * @returns Authorization URL to redirect user to
 */
export async function getAuthUrl(
  clientId: string,
  redirectUri: string
): Promise<{ url: string; codeVerifier: string; state: string }> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateCodeVerifier(); // Random state for CSRF protection

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    state: state,
    scope: SPOTIFY_SCOPES.join(' '),
  });

  return {
    url: `${SPOTIFY_AUTH_URL}?${params.toString()}`,
    codeVerifier,
    state,
  };
}

/**
 * Exchanges authorization code for access and refresh tokens
 *
 * @param code - Authorization code from callback
 * @param codeVerifier - Original code verifier used in authorization
 * @param clientId - Spotify client ID
 * @param redirectUri - Must match the one used in authorization
 * @returns Spotify tokens
 * @throws Error if exchange fails
 */
export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
  clientId: string,
  redirectUri: string
): Promise<SpotifyTokens> {
  const params = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Token exchange failed: ${error.error_description || error.error}`
      );
    }

    const data = await response.json();

    // Calculate expiration timestamp
    const expiresAt = Date.now() + data.expires_in * 1000;

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: expiresAt,
      token_type: data.token_type,
      scope: data.scope,
    };
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
}

/**
 * Refreshes an expired access token
 *
 * @param refreshToken - The refresh token from initial authorization
 * @param clientId - Spotify client ID
 * @returns New tokens with updated access token
 * @throws Error if refresh fails
 */
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string
): Promise<SpotifyTokens> {
  const params = new URLSearchParams({
    client_id: clientId,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Token refresh failed: ${error.error_description || error.error}`
      );
    }

    const data = await response.json();

    // Calculate expiration timestamp
    const expiresAt = Date.now() + data.expires_in * 1000;

    return {
      access_token: data.access_token,
      // Refresh token may or may not be returned; keep the old one if not
      refresh_token: data.refresh_token || refreshToken,
      expires_at: expiresAt,
      token_type: data.token_type,
      scope: data.scope,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}

/**
 * Checks if the token is expired or about to expire (within 5 minutes)
 */
export function isTokenExpired(expiresAt: number): boolean {
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  return Date.now() >= expiresAt - bufferTime;
}

/**
 * Verifies state parameter to prevent CSRF attacks
 */
export function verifyState(receivedState: string, expectedState: string): boolean {
  return receivedState === expectedState;
}
