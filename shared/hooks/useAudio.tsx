"use client";

import { createContext, useContext, useRef, ReactNode, useEffect } from "react";

export type SoundName = "notification" | "ringtone" | "like" | "join" | "leave";

interface AudioContextType {
  play: (sound: SoundName) => void;
  playLoop: (sound: SoundName) => void;
  stop: (sound: SoundName) => void;
  stopAll: () => void;
  setVolume: (volume: number) => void; // 0.0 to 1.0
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRefs = useRef<Map<SoundName, HTMLAudioElement>>(new Map());
  const globalVolume = useRef<number>(1.0);

  const getAudio = (sound: SoundName) => {
    if (!audioRefs.current.has(sound)) {
      const audio = new Audio(`/sounds/${sound}.mp3`);
      audio.volume = globalVolume.current;
      audioRefs.current.set(sound, audio);
    }
    return audioRefs.current.get(sound)!;
  };

  const play = (sound: SoundName) => {
    try {
      const audio = getAudio(sound);
      audio.loop = false;
      audio.currentTime = 0;
      audio.play().catch(() => {}); // catch auto-play policy errors
    } catch (e) {}
  };

  const playLoop = (sound: SoundName) => {
    try {
      const audio = getAudio(sound);
      audio.loop = true;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const stop = (sound: SoundName) => {
    try {
      if (audioRefs.current.has(sound)) {
        const audio = audioRefs.current.get(sound)!;
        audio.pause();
        audio.currentTime = 0;
      }
    } catch (e) {}
  };

  const stopAll = () => {
    audioRefs.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  };

  const setVolume = (volume: number) => {
    const safeVolume = Math.max(0, Math.min(1, volume));
    globalVolume.current = safeVolume;
    audioRefs.current.forEach(audio => {
      audio.volume = safeVolume;
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  return (
    <AudioContext.Provider value={{ play, playLoop, stop, stopAll, setVolume }}>
      {children}
    </AudioContext.Provider>
  );
}

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within an AudioProvider");
  return ctx;
};
