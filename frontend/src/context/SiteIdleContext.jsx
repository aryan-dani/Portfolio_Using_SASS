import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getPortfolioScrollY, subscribePortfolioScroll } from "../utils/smoothScroll";
import { useAchievements } from "./AchievementContext";

export const RESTING_IDLE_MS = 9000;
/** Navbar + dock hide after this much inactivity. */
export const CHROME_IDLE_MS = 2000;
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
  const [hideChrome, setHideChrome] = useState(false);
  const pointerRef = useRef({ x: 0, y: 0, moved: 0 });
  const scrollYRef = useRef(0);
  const wakeChromeRef = useRef(() => {});

  useEffect(() => {
    let restingTimer = 0;
    let chromeTimer = 0;
    let staleTimer = 0;

    const clearTimers = () => {
      clearTimeout(restingTimer);
      clearTimeout(chromeTimer);
      clearTimeout(staleTimer);
    };

    const armChromeIdle = () => {
      clearTimeout(chromeTimer);
      chromeTimer = window.setTimeout(() => setHideChrome(true), CHROME_IDLE_MS);
    };

    const armActivityIdle = () => {
      clearTimeout(restingTimer);
      clearTimeout(staleTimer);
      restingTimer = window.setTimeout(() => setPhase((p) => Math.max(p, 1)), RESTING_IDLE_MS);
      staleTimer = window.setTimeout(() => setPhase((p) => Math.max(p, 3)), STALE_IDLE_MS);
    };

    /** General site activity (Kuro sleep / stale) — does not re-show chrome. */
    const bumpActivity = () => {
      setPhase(0);
      armActivityIdle();
    };

    /**
     * Explicit chrome reveal — top of page, top edge, or dock edge only.
     * Also counts as activity.
     */
    const wakeChrome = () => {
      setHideChrome(false);
      armChromeIdle();
      bumpActivity();
    };
    wakeChromeRef.current = wakeChrome;

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
        bumpActivity();
      }
    };

    const onScroll = () => {
      const y = getPortfolioScrollY();
      if (Math.abs(y - scrollYRef.current) >= SCROLL_RESET_PX) {
        scrollYRef.current = y;
        bumpActivity();
      }
    };

    pointerRef.current = { x: 0, y: 0, moved: 0 };
    scrollYRef.current = getPortfolioScrollY();
    setHideChrome(false);
    setPhase(0);
    armChromeIdle();
    armActivityIdle();

    const instantEvents = ["pointerdown", "keydown", "click", "touchstart"];
    instantEvents.forEach((event) => window.addEventListener(event, bumpActivity, { passive: true }));
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    const unsubScroll = subscribePortfolioScroll(onScroll);

    return () => {
      clearTimers();
      wakeChromeRef.current = () => {};
      instantEvents.forEach((event) => window.removeEventListener(event, bumpActivity));
      window.removeEventListener("pointermove", onPointerMove);
      unsubScroll();
    };
  }, [pathname]);

  const wake = useCallback(() => {
    wakeChromeRef.current();
  }, []);

  const isResting = phase >= 1;
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
