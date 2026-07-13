import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getPortfolioScrollY, subscribePortfolioScroll } from "../utils/smoothScroll";
import { useAchievements } from "./AchievementContext";

export const RESTING_IDLE_MS = 9000;
export const CHROME_IDLE_MS = 12000;
export const STALE_IDLE_MS = 45000;

const MOVE_RESET_PX = 72;
const SCROLL_RESET_PX = 48;

const SiteIdleContext = createContext(null);

function StaleWakeTracker({ isStale }) {
  const { track } = useAchievements();
  const wasStaleRef = useRef(false);

  useEffect(() => {
    if (wasStaleRef.current && !isStale) {
      track("idle_wake");
    }
    wasStaleRef.current = isStale;
  }, [isStale, track]);

  return null;
}

export function SiteIdleProvider({ children }) {
  const { pathname } = useLocation();
  const [phase, setPhase] = useState(0);
  const pointerRef = useRef({ x: 0, y: 0, moved: 0 });
  const scrollYRef = useRef(0);
  const wakeRef = useRef(() => {});

  useEffect(() => {
    let restingTimer = 0;
    let chromeTimer = 0;
    let staleTimer = 0;

    const clearTimers = () => {
      clearTimeout(restingTimer);
      clearTimeout(chromeTimer);
      clearTimeout(staleTimer);
    };

    const armIdle = () => {
      clearTimers();
      restingTimer = window.setTimeout(() => setPhase((p) => Math.max(p, 1)), RESTING_IDLE_MS);
      chromeTimer = window.setTimeout(() => setPhase((p) => Math.max(p, 2)), CHROME_IDLE_MS);
      staleTimer = window.setTimeout(() => setPhase((p) => Math.max(p, 3)), STALE_IDLE_MS);
    };

    const bump = () => {
      setPhase(0);
      armIdle();
    };
    wakeRef.current = bump;

    const onPointerMove = (e) => {
      const prev = pointerRef.current;
      if (!prev.x && !prev.y) {
        pointerRef.current = { x: e.clientX, y: e.clientY, moved: 0 };
        return;
      }
      const step = Math.hypot(e.clientX - prev.x, e.clientY - prev.y);
      const moved = prev.moved + step;
      pointerRef.current = { x: e.clientX, y: e.clientY, moved };
      if (moved >= MOVE_RESET_PX) {
        pointerRef.current.moved = 0;
        bump();
      }
    };

    const onScroll = () => {
      const y = getPortfolioScrollY();
      if (Math.abs(y - scrollYRef.current) >= SCROLL_RESET_PX) {
        scrollYRef.current = y;
        bump();
      }
    };

    pointerRef.current = { x: 0, y: 0, moved: 0 };
    scrollYRef.current = getPortfolioScrollY();
    bump();

    const instantEvents = ["pointerdown", "keydown", "click", "touchstart"];
    instantEvents.forEach((event) => window.addEventListener(event, bump, { passive: true }));
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    const unsubScroll = subscribePortfolioScroll(onScroll);

    return () => {
      clearTimers();
      wakeRef.current = () => {};
      instantEvents.forEach((event) => window.removeEventListener(event, bump));
      window.removeEventListener("pointermove", onPointerMove);
      unsubScroll();
    };
  }, [pathname]);

  const wake = useCallback(() => {
    wakeRef.current();
  }, []);

  const isResting = phase >= 1;
  const hideChrome = phase >= 2;
  const isStale = phase >= 3;

  useEffect(() => {
    document.documentElement.classList.toggle("site-stale", isStale);
    return () => document.documentElement.classList.remove("site-stale");
  }, [isStale]);

  const value = useMemo(
    () => ({ phase, isResting, hideChrome, isStale, wake }),
    [phase, isResting, hideChrome, isStale, wake],
  );

  return (
    <SiteIdleContext.Provider value={value}>
      <StaleWakeTracker isStale={isStale} />
      {children}
    </SiteIdleContext.Provider>
  );
}

export function useSiteIdleState() {
  const ctx = useContext(SiteIdleContext);
  if (!ctx) {
    throw new Error("useSiteIdleState must be used within SiteIdleProvider");
  }
  return ctx;
}
