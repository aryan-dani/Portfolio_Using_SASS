import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ACCENT_PALETTES, ACCENT_STORAGE_KEY } from "../data/accentPalettes";

const ThemeContext = createContext(null);

function applyAccent(paletteId) {
  const root = document.documentElement;
  Object.keys(ACCENT_PALETTES).forEach((id) => {
    root.classList.remove(`accent-${id}`);
  });
  root.style.removeProperty("--color-accent-electric");
  root.style.removeProperty("--color-secondary");

  const resolved = ACCENT_PALETTES[paletteId] ? paletteId : "mono";
  root.classList.add(`accent-${resolved}`);
  localStorage.setItem(ACCENT_STORAGE_KEY, resolved);
}

function getInitialAccent() {
  const stored = localStorage.getItem(ACCENT_STORAGE_KEY);
  if (stored && ACCENT_PALETTES[stored]) return stored;
  return "mono";
}

export function ThemeProvider({ children }) {
  const transitionTimeoutRef = useRef(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("portfolio_theme") || "light");
  const [crtMode, setCrtModeState] = useState(() => localStorage.getItem("portfolio_crt") === "true");
  const [accent, setAccentState] = useState(getInitialAccent);

  useLayoutEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === "dark";

    root.classList.toggle("dark", isDark && !crtMode);
    root.classList.toggle("light", !isDark && !crtMode);
    root.classList.toggle("crt", crtMode);
    root.style.colorScheme = crtMode ? "dark" : isDark ? "dark" : "light";

    localStorage.setItem("portfolio_theme", theme);
    localStorage.setItem("portfolio_crt", String(crtMode));
  }, [theme, crtMode]);

  useLayoutEffect(() => {
    applyAccent(accent);
  }, [accent]);

  const toggleTheme = useCallback(() => {
    const root = window.document.documentElement;
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    root.classList.add("theme-transitioning");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCrtModeState(false);
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
      });
    });
    transitionTimeoutRef.current = window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
      transitionTimeoutRef.current = null;
    }, 280);
  }, []);

  const setCrtMode = useCallback((enabled) => {
    setCrtModeState(!!enabled);
  }, []);

  const toggleCrtMode = useCallback(() => {
    setCrtModeState((prev) => !prev);
  }, []);

  const setAccent = useCallback((paletteId) => {
    setAccentState(ACCENT_PALETTES[paletteId] ? paletteId : "mono");
  }, []);

  const value = useMemo(
    () => ({
      theme,
      crtMode,
      accent,
      toggleTheme,
      setCrtMode,
      toggleCrtMode,
      setAccent,
      palettes: ACCENT_PALETTES,
    }),
    [theme, crtMode, accent, toggleTheme, setCrtMode, toggleCrtMode, setAccent],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
