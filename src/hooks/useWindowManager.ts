import { create } from 'zustand';
import type { WindowPosition } from '../types';

interface WindowRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WindowManagerState {
  windows: Map<string, WindowRect>;
  register: (id: string, rect: WindowRect) => void;
  unregister: (id: string) => void;
  update: (id: string, position: WindowPosition) => void;
  snapPosition: (id: string, x: number, y: number, width: number, height: number) => WindowPosition;
}

const SNAP_DISTANCE = 12;

export const useWindowManager = create<WindowManagerState>((set, get) => ({
  windows: new Map(),

  register: (id, rect) => {
    set((state) => {
      const windows = new Map(state.windows);
      windows.set(id, rect);
      return { windows };
    });
  },

  unregister: (id) => {
    set((state) => {
      const windows = new Map(state.windows);
      windows.delete(id);
      return { windows };
    });
  },

  update: (id, position) => {
    set((state) => {
      const windows = new Map(state.windows);
      const existing = windows.get(id);
      if (existing) {
        windows.set(id, { ...existing, x: position.x, y: position.y });
      }
      return { windows };
    });
  },

  snapPosition: (id, x, y, width, height) => {
    const { windows } = get();
    let snappedX = x;
    let snappedY = y;

    for (const [otherId, other] of windows) {
      if (otherId === id) continue;

      // Snap left edge to right edge of other
      if (Math.abs(x - (other.x + other.width)) < SNAP_DISTANCE) {
        snappedX = other.x + other.width;
      }
      // Snap right edge to left edge of other
      if (Math.abs((x + width) - other.x) < SNAP_DISTANCE) {
        snappedX = other.x - width;
      }
      // Snap left edges together
      if (Math.abs(x - other.x) < SNAP_DISTANCE) {
        snappedX = other.x;
      }
      // Snap right edges together
      if (Math.abs((x + width) - (other.x + other.width)) < SNAP_DISTANCE) {
        snappedX = other.x + other.width - width;
      }

      // Snap top edge to bottom edge of other
      if (Math.abs(y - (other.y + other.height)) < SNAP_DISTANCE) {
        snappedY = other.y + other.height;
      }
      // Snap bottom edge to top edge of other
      if (Math.abs((y + height) - other.y) < SNAP_DISTANCE) {
        snappedY = other.y - height;
      }
      // Snap top edges together
      if (Math.abs(y - other.y) < SNAP_DISTANCE) {
        snappedY = other.y;
      }
      // Snap bottom edges together
      if (Math.abs((y + height) - (other.y + other.height)) < SNAP_DISTANCE) {
        snappedY = other.y + other.height - height;
      }
    }

    return { x: snappedX, y: snappedY };
  },
}));
