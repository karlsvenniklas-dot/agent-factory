import { useEffect } from 'react';
import { usePlayerStore } from '../stores/playerStore';
import { useVisualizerStore } from '../stores/visualizerStore';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const store = usePlayerStore.getState();

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          store.isPlaying ? store.pause() : store.play();
          break;

        case 'KeyN':
          store.next();
          break;

        case 'KeyP':
          store.previous();
          break;

        case 'KeyS':
          if (!e.ctrlKey && !e.metaKey) {
            store.stop();
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (store.currentTrack) {
            const newPos = Math.min(store.position + 5, store.currentTrack.duration);
            store.seek(newPos);
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          store.seek(Math.max(store.position - 5, 0));
          break;

        case 'ArrowUp':
          e.preventDefault();
          store.setVolume(store.volume + 5);
          break;

        case 'ArrowDown':
          e.preventDefault();
          store.setVolume(store.volume - 5);
          break;

        case 'KeyR':
          if (!e.ctrlKey && !e.metaKey) {
            store.cycleRepeat();
          }
          break;

        case 'KeyZ':
          if (!e.ctrlKey && !e.metaKey) {
            store.toggleShuffle();
          }
          break;

        case 'KeyV':
          if (!e.ctrlKey && !e.metaKey) {
            useVisualizerStore.getState().nextPreset();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
