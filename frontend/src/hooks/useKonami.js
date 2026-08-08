import { useEffect } from "react";
import { clearKonamiProgress, markKonamiProgress } from "../utils/konamiProgress";

const KONAMI_CODES = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

const KONAMI_KEYS = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const SEQUENCE_TIMEOUT_MS = 4000;

function isTypingTarget(target) {
  if (!target) return false;
  return (
    target.closest?.("input, textarea, select, [contenteditable='true']") ||
    target.getAttribute?.("role") === "textbox"
  );
}

function matchKonamiStep(event, index) {
  const code = event.code;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  return code === KONAMI_CODES[index] || key === KONAMI_KEYS[index];
}

function matchesKonamiStart(event) {
  return matchKonamiStep(event, 0);
}

export function useKonami(onSuccess) {
  useEffect(() => {
    let index = 0;
    let lastStepAt = 0;

    const reset = () => {
      index = 0;
      lastStepAt = 0;
      clearKonamiProgress();
    };

    const onKeyDown = (event) => {
      if (event.repeat) return;
      if (isTypingTarget(event.target)) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const now = Date.now();
      if (index > 0 && now - lastStepAt > SEQUENCE_TIMEOUT_MS) {
        reset();
      }

      if (matchKonamiStep(event, index)) {
        index += 1;
        lastStepAt = now;
        markKonamiProgress();
        if (index === KONAMI_CODES.length) {
          reset();
          onSuccess?.();
        }
        return;
      }

      index = matchesKonamiStart(event) ? 1 : 0;
      lastStepAt = index ? now : 0;
      if (index) markKonamiProgress();
      else clearKonamiProgress();
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      clearKonamiProgress();
    };
  }, [onSuccess]);
}
