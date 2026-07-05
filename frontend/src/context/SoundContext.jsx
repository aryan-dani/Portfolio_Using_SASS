import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { playUiSound } from "../utils/uiSounds";
import { isFinePointerDevice } from "../utils/device";

const SoundContext = createContext(null);
const STORAGE_KEY = "portfolio_sound_enabled";
const HOVER_COOLDOWN_MS = 72;

export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
  const audioRef = useRef(null);
  const masterRef = useRef(null);
  const lastHoverAtRef = useRef(0);
  const lastHoverTargetRef = useRef(null);

  const getAudioContext = useCallback(() => {
    if (!audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      audioRef.current = new AudioContext();
    }
    if (audioRef.current.state === "suspended") {
      audioRef.current.resume();
    }
    return audioRef.current;
  }, []);

  const play = useCallback(
    (kind = "click") => {
      if (!enabled) return;
      const audioContext = getAudioContext();
      if (!audioContext) return;
      playUiSound(audioContext, masterRef, kind);
    },
    [enabled, getAudioContext],
  );

  const toggleSound = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    if (!enabled || !isFinePointerDevice()) return undefined;

    const onClick = (event) => {
      if (event.target.closest?.("button, a, [role='button']")) play("click");
    };

    const onPointerOver = (event) => {
      const target = event.target.closest?.("button, a, [role='button'], .cursor-image");
      if (!target) return;
      if (target === lastHoverTargetRef.current) return;

      const now = performance.now();
      if (now - lastHoverAtRef.current < HOVER_COOLDOWN_MS) return;

      lastHoverAtRef.current = now;
      lastHoverTargetRef.current = target;
      play("hover");
    };

    const onPointerOut = (event) => {
      const target = event.target.closest?.("button, a, [role='button'], .cursor-image");
      if (target && target === lastHoverTargetRef.current) {
        lastHoverTargetRef.current = null;
      }
    };

    document.addEventListener("click", onClick);
    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
    };
  }, [enabled, play]);

  // Close AudioContext on unmount to free hardware audio resources
  useEffect(() => {
    return () => { audioRef.current?.close(); };
  }, []);

  const value = useMemo(() => ({ enabled, toggleSound, play }), [enabled, play, toggleSound]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) throw new Error("useSound must be used within SoundProvider");
  return context;
}
