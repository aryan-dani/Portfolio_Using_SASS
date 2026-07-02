import { memo, useCallback, useEffect, useRef } from "react";
import { useAchievements } from "../../context/AchievementContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { useKonami } from "../../hooks/useKonami";

/** Always-mounted listener - Konami + Ctrl+Alt+H hack toggle (not lazy-loaded). */
function HackModeListener() {
  const { toggleCrtMode, setCrtMode, crtMode } = useTheme();
  const { track } = useAchievements();
  const { showToast } = useToast();
  const crtRef = useRef(crtMode);
  crtRef.current = crtMode;

  const notify = useCallback(
    (enabled) => {
      showToast(
        enabled ? "CRT hack mode engaged - matrix vibes." : "Hack mode off. Welcome back.",
        enabled ? "success" : "info",
        { title: enabled ? "SYSTEM BREACH" : "ACCESS REVOKED", duration: 3200 },
      );
    },
    [showToast],
  );

  const engageHack = useCallback(
    (source) => {
      if (source === "konami") {
        track("konami");
        const next = !crtRef.current;
        toggleCrtMode();
        notify(next);
        return;
      }
      if (crtRef.current) {
        setCrtMode(false);
        notify(false);
        return;
      }
      setCrtMode(true);
      track("hack");
      notify(true);
    },
    [notify, setCrtMode, toggleCrtMode, track],
  );

  useKonami(
    useCallback(() => {
      engageHack("konami");
    }, [engageHack]),
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code !== "KeyH" || !event.ctrlKey) return;
      if (!(event.altKey || event.getModifierState?.("AltGraph"))) return;
      if (event.target?.closest?.("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      event.stopPropagation();
      engageHack("shortcut");
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [engageHack]);

  return null;
}

export default memo(HackModeListener);
