/**
 * Spotify Web Playback SDK Integration Hook
 *
 * Initializes SDK player, syncs state with playerStore, and manages playback.
 * Handles SDK lifecycle, reconnection, and state synchronization.
 */

import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../stores/playerStore';
import { useSpotifyStore } from '../stores/spotifyStore';
import { initializePlayer, disconnectPlayer } from '../lib/spotify/player';
import { createSpotifyApi } from '../lib/spotify/api';
import type { Track } from '../types';
import type { SpotifyPlayerState } from '../lib/spotify/types';

interface UseSpotifyPlayerReturn {
  isReady: boolean;
  deviceId: string | null;
  error: string | null;
}

/**
 * Convert Spotify SDK track to internal Track format
 */
function convertSpotifyTrack(
  spotifyTrack: SpotifyPlayerState['track_window']['current_track']
): Track {
  return {
    id: spotifyTrack.id,
    title: spotifyTrack.name,
    artist: spotifyTrack.artists.map((a) => a.name).join(', '),
    album: spotifyTrack.album.name,
    duration: Math.floor(spotifyTrack.duration_ms / 1000),
    coverUrl: spotifyTrack.album.images[0]?.url,
  };
}

export function useSpotifyPlayer(): UseSpotifyPlayerReturn {
  const playerRef = useRef<ReturnType<typeof initializePlayer> extends Promise<infer T> ? T['player'] : never | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { tokens, deviceId, setDeviceId, setSDKReady, isAuthenticated } = useSpotifyStore();
  const playerStore = usePlayerStore();

  useEffect(() => {
    if (!isAuthenticated || !tokens) {
      return;
    }

    let isMounted = true;
    let player: Awaited<ReturnType<typeof initializePlayer>>['player'] | null = null;

    async function setupPlayer() {
      try {
        const result = await initializePlayer(
          tokens!.access_token,
          'Winamp Spotify Player',
          {
            onReady: (id) => {
              console.log('Player ready, device ID:', id);
              if (isMounted) {
                setDeviceId(id);
                setSDKReady(true);
                setIsReady(true);
                setError(null);

                // Transfer playback to this device
                const api = createSpotifyApi(tokens!.access_token);
                api.transferPlayback(id, false).catch((err) => {
                  console.error('Failed to transfer playback:', err);
                });
              }
            },

            onNotReady: (id) => {
              console.log('Player disconnected:', id);
              if (isMounted) {
                setIsReady(false);
                setSDKReady(false);
              }
            },

            onPlayerStateChanged: (state) => {
              if (!state || !isMounted) return;

              // Sync state with playerStore
              const track = convertSpotifyTrack(state.track_window.current_track);
              const position = Math.floor(state.position / 1000);
              const isPlaying = !state.paused;

              // Update player store
              playerStore.loadTrack(track);
              playerStore.seek(position);

              if (isPlaying && !playerStore.isPlaying) {
                playerStore.play();
              } else if (!isPlaying && playerStore.isPlaying) {
                playerStore.pause();
              }
            },

            onInitializationError: (err) => {
              console.error('Initialization error:', err);
              if (isMounted) {
                setError(err.message);
                setIsReady(false);
              }
            },

            onAuthenticationError: (err) => {
              console.error('Authentication error:', err);
              if (isMounted) {
                setError(err.message);
                setIsReady(false);
              }
            },

            onAccountError: (err) => {
              console.error('Account error:', err);
              if (isMounted) {
                setError(err.message);
                setIsReady(false);
              }
            },

            onPlaybackError: (err) => {
              console.error('Playback error:', err);
              if (isMounted) {
                setError(err.message);
              }
            },
          }
        );

        player = result.player;
        playerRef.current = player;
      } catch (err) {
        console.error('Failed to initialize player:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize player');
          setIsReady(false);
        }
      }
    }

    setupPlayer();

    return () => {
      isMounted = false;
      if (player) {
        disconnectPlayer(player);
        playerRef.current = null;
      }
      setIsReady(false);
      setSDKReady(false);
    };
  }, [isAuthenticated, tokens, setDeviceId, setSDKReady, playerStore]);

  // Sync position updates during playback
  useEffect(() => {
    if (!isReady || !playerStore.isPlaying) return;

    const interval = setInterval(() => {
      if (playerStore.currentTrack) {
        const newPosition = playerStore.position + 1;

        if (newPosition >= playerStore.currentTrack.duration) {
          // Track ended, next will be handled by SDK state change
          return;
        }

        playerStore.seek(newPosition);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isReady, playerStore, playerStore.isPlaying, playerStore.position, playerStore.currentTrack]);

  // Handle playback control actions via Web API
  useEffect(() => {
    if (!isReady || !tokens || !deviceId) return;

    const api = createSpotifyApi(tokens.access_token);

    // Create subscription to player actions
    // We'll use the player ref to control playback through SDK
    const player = playerRef.current;
    if (!player) return;

    // Note: Player controls are already wired through playerStore actions
    // The SDK will emit state changes that we catch in onPlayerStateChanged
    // This effect is mainly for ensuring API sync if needed

  }, [isReady, tokens, deviceId]);

  return {
    isReady,
    deviceId,
    error,
  };
}
