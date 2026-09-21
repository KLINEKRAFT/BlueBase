'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { loadDirectory, startDirectorySession } from './client';
import type { DirectorySnapshot } from './types';
type State = { data: DirectorySnapshot | null; error: string; loading: boolean };
const empty: State = { data: null, error: '', loading: true };
let state = empty;
let pending: Promise<void> | null = null;
let generation = 0;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const emit = (next: State) => {
  state = next;
  listeners.forEach((l) => l());
};
export function clearDirectoryCache() {
  generation++;
  pending = null;
  emit(empty);
}
export function refreshDirectory() {
  if (pending) return pending;
  const current = generation;
  emit({ ...state, error: '', loading: true });
  pending = (async () => {
    try {
      await startDirectorySession();
      const data = await loadDirectory();
      if (current === generation) emit({ data, error: '', loading: false });
    } catch (error) {
      if (current === generation)
        emit({ data: state.data, error: (error as Error).message, loading: false });
    } finally {
      if (current === generation) pending = null;
    }
  })();
  return pending;
}
export function useDirectory(enabled = true) {
  const current = useSyncExternalStore(
    subscribe,
    () => state,
    () => empty,
  );
  useEffect(() => {
    if (!enabled) return;
    if (!state.data && !pending) void refreshDirectory();
    const refresh = () => {
      if (document.visibilityState === 'visible') void refreshDirectory();
    };
    window.addEventListener('focus', refresh);
    const interval = window.setInterval(refresh, 60000);
    return () => {
      window.removeEventListener('focus', refresh);
      window.clearInterval(interval);
    };
  }, [enabled]);
  return current;
}
