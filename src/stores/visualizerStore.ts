import { create } from 'zustand';
import type { VisualizerPreset } from '../lib/visualizer/types';
import { BUILTIN_PRESETS, getDefaultPreset } from '../lib/visualizer/presets';

interface VisualizerState {
  activePreset: VisualizerPreset | null;
  availablePresets: VisualizerPreset[];
  isRunning: boolean;
}

interface VisualizerActions {
  setPreset: (preset: VisualizerPreset) => void;
  setPresetByName: (name: string) => void;
  nextPreset: () => void;
  previousPreset: () => void;
  setIsRunning: (isRunning: boolean) => void;
  addPreset: (preset: VisualizerPreset) => void;
  removePreset: (name: string) => void;
}

interface VisualizerStore extends VisualizerState, VisualizerActions {}

export const useVisualizerStore = create<VisualizerStore>((set, get) => ({
  // Initial state
  activePreset: getDefaultPreset(),
  availablePresets: BUILTIN_PRESETS,
  isRunning: false,

  // Actions
  setPreset: (preset: VisualizerPreset) => {
    set({ activePreset: preset });
  },

  setPresetByName: (name: string) => {
    const preset = get().availablePresets.find(p => p.name === name);
    if (preset) {
      set({ activePreset: preset });
    }
  },

  nextPreset: () => {
    const { activePreset, availablePresets } = get();
    if (!activePreset || availablePresets.length === 0) return;

    const currentIndex = availablePresets.findIndex(p => p.name === activePreset.name);
    const nextIndex = (currentIndex + 1) % availablePresets.length;
    set({ activePreset: availablePresets[nextIndex] });
  },

  previousPreset: () => {
    const { activePreset, availablePresets } = get();
    if (!activePreset || availablePresets.length === 0) return;

    const currentIndex = availablePresets.findIndex(p => p.name === activePreset.name);
    const prevIndex = currentIndex === 0 ? availablePresets.length - 1 : currentIndex - 1;
    set({ activePreset: availablePresets[prevIndex] });
  },

  setIsRunning: (isRunning: boolean) => {
    set({ isRunning });
  },

  addPreset: (preset: VisualizerPreset) => {
    set((state) => ({
      availablePresets: [...state.availablePresets, preset],
    }));
  },

  removePreset: (name: string) => {
    set((state) => ({
      availablePresets: state.availablePresets.filter(p => p.name !== name),
    }));
  },
}));
