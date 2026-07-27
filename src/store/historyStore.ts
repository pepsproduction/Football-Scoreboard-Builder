// src/store/historyStore.ts
import { create } from 'zustand';
import type { EditorState } from '../types/editor';

const MAX_HISTORY = 20;

interface HistoryStore {
  past: EditorState[];
  future: EditorState[];

  push: (snapshot: EditorState) => void;
  undo: (current: EditorState) => EditorState | null;
  redo: (current: EditorState) => EditorState | null;
  clear: () => void;

  canUndo: boolean;
  canRedo: boolean;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  push: (snapshot) => {
    set((s) => {
      const past = [...s.past, snapshot].slice(-MAX_HISTORY);
      return { past, future: [], canUndo: past.length > 0, canRedo: false };
    });
  },

  undo: (current) => {
    const { past } = get();
    if (past.length === 0) return null;
    const previous = past[past.length - 1];
    set((s) => {
      const newPast = s.past.slice(0, -1);
      const future = [current, ...s.future].slice(0, MAX_HISTORY);
      return {
        past: newPast,
        future,
        canUndo: newPast.length > 0,
        canRedo: true,
      };
    });
    return previous;
  },

  redo: (current) => {
    const { future } = get();
    if (future.length === 0) return null;
    const next = future[0];
    set((s) => {
      const newFuture = s.future.slice(1);
      const past = [...s.past, current].slice(-MAX_HISTORY);
      return {
        past,
        future: newFuture,
        canUndo: true,
        canRedo: newFuture.length > 0,
      };
    });
    return next;
  },

  clear: () => set(() => ({ past: [], future: [], canUndo: false, canRedo: false })),
}));
