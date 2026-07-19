import { useCallback, useEffect, useRef, useState } from "react";
import { getPortfolioScrollY, subscribePortfolioScroll } from "../utils/smoothScroll";

/**
 * Chrome show/hide from scroll position.
 * Shows at page top (and optional bottom proximity). Does not re-show on mid-page scroll-up.
 */
export function useScrollVisibility({
  topThreshold = 72,
  deltaThreshold = 12,
  revealOnBottomProximity = false,
  bottomProximity = 120,
  onBottomProximity,
} = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastYRef = useRef(typeof window === "undefined" ? 0 : getPortfolioScrollY());
  const tickingRef = useRef(false);
  const visibleRef = useRef(true);
  const scrolledRef = useRef(false);

  const reveal = useCallback(() => {
    if (visibleRef.current) return;
    visibleRef.current = true;
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const setVisible = (next) => {
      if (visibleRef.current === next) return;
      visibleRef.current = next;
      setIsVisible(next);
    };

    const setScrolled = (next) => {
      if (scrolledRef.current === next) return;
      scrolledRef.current = next;
      setIsScrolled(next);
    };

    const update = () => {
      const currentY = getPortfolioScrollY();
      const previousY = lastYRef.current;
      const delta = currentY - previousY;

      setScrolled(currentY > topThreshold * 0.6);

      if (currentY <= topThreshold) {
        setVisible(true);
      } else if (Math.abs(delta) >= deltaThreshold) {
        // Mid-page: hide on scroll-down only — never auto-reveal on scroll-up.
        if (delta > 0) setVisible(false);
        lastYRef.current = currentY;
      }

      tickingRef.current = false;
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(update);
    };

    let mouseMoveRaf = 0;
    const onMouseMove = (event) => {
      if (!revealOnBottomProximity) return;
      if (mouseMoveRaf) return;
      mouseMoveRaf = requestAnimationFrame(() => {
        mouseMoveRaf = 0;
        if (window.innerHeight - event.clientY <= bottomProximity) {
          setVisible(true);
          onBottomProximity?.();
        }
      });
    };

    const unsubscribeScroll = subscribePortfolioScroll(onScroll);
    if (revealOnBottomProximity) {
      window.addEventListener("pointermove", onMouseMove, { passive: true });
    }
    update();

    return () => {
      unsubscribeScroll();
      if (revealOnBottomProximity) {
        window.removeEventListener("pointermove", onMouseMove);
      }
      if (mouseMoveRaf) cancelAnimationFrame(mouseMoveRaf);
    };
  }, [bottomProximity, deltaThreshold, onBottomProximity, revealOnBottomProximity, topThreshold]);

  return { isVisible, isScrolled, reveal };
}
