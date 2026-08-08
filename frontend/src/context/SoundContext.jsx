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
  const unlockedRef = useRef(false);
  const lastHoverAtRef = useRef(0);
  const lastHoverTargetRef = useRef(null);

  const getRunningContext = useCallback(() => {
    const ctx = audioRef.current;
    if (!ctx || ctx.state !== "running") return null;
    return ctx;
  }, []);

  /** Create/resume AudioContext only after a real user gesture (click/keydown). */
  const unlockAudio = useCallback(async () => {
    if (!enabled) return null;

    try {
      if (!audioRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return null;
        audioRef.current = new AudioContext();
        masterRef.current = null;
      }

      if (audioRef.current.state === "suspended") {
        await audioRef.current.resume();
      }

      unlockedRef.current = audioRef.current.state === "running";
      return unlockedRef.current ? audioRef.current : null;
    } catch {
      unlockedRef.current = false;
      return null;
    }
  }, [enabled]);

  const play = useCallback(
    (kind = "click", { fromGesture = false } = {}) => {
      if (!enabled) return;

      if (fromGesture) {
        // Fire-and-forget unlock; play once context is running.
        void unlockAudio().then((ctx) => {
          if (!ctx) return;
          playUiSound(ctx, masterRef, kind);
        });
        return;
      }

      // Hover / ambient: never create or resume — only play if already unlocked.
      const ctx = getRunningContext();
      if (!ctx) return;
      playUiSound(ctx, masterRef, kind);
    },
    [enabled, getRunningContext, unlockAudio],
  );

  const toggleSound = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      localStorage.setItem(STORAGE_KEY, String(next));
      if (next) {
        // Toggle is a user gesture — unlock immediately.
        queueMicrotask(() => {
          void unlockAudio();
        });
      } else if (audioRef.current) {
        unlockedRef.current = false;
        void audioRef.current.suspend?.();
      }
      return next;
    });
  }, [unlockAudio]);

  useEffect(() => {
    if (!enabled || !isFinePointerDevice()) return undefined;

    const onClick = (event) => {
      if (event.target.closest?.("button, a, [role='button']")) {
        play("click", { fromGesture: true });
      } else {
        // Any click unlocks audio for later hover ticks.
        void unlockAudio();
      }
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
  }, [enabled, play, unlockAudio]);

  useEffect(() => {
    return () => {
      unlockedRef.current = false;
      audioRef.current?.close();
      audioRef.current = null;
      masterRef.current = null;
    };
  }, []);

  const value = useMemo(
    () => ({ enabled, toggleSound, play, unlockAudio }),
    [enabled, toggleSound, play, unlockAudio],
  );
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) throw new Error("useSound must be used within SoundProvider");
  return context;
}
