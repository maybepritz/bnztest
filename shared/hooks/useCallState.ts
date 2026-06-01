"use client";

import { useSyncExternalStore, useCallback } from "react";

let _state = { isCalling: false, activeRoom: null as string | null };
const _listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

function getSnapshot() {
  return _state;
}

function updateState(newState: Partial<typeof _state>) {
  _state = { ..._state, ...newState };
  _listeners.forEach(l => l());
}

function getServerSnapshot() {
  return _state; // Or _initialState
}

export function useCallState() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const startCall = useCallback((roomName?: string) => {
    updateState({ isCalling: true, activeRoom: roomName || _state.activeRoom });
  }, []);
  
  const endCall = useCallback(() => {
    updateState({ isCalling: false, activeRoom: null });
  }, []);
  
  const toggleCall = useCallback((roomName: string) => {
    if (_state.isCalling && _state.activeRoom === roomName) {
      updateState({ isCalling: false, activeRoom: null });
    } else {
      updateState({ isCalling: true, activeRoom: roomName });
    }
  }, []);

  return { ...state, startCall, endCall, toggleCall };
}
