import { memo, useRef, useEffect, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { HiVolumeUp, HiVolumeOff } from "react-icons/hi";
import { useSound } from "../../context/SoundContext";
import { useScrollVisibility } from "../../hooks/useScrollVisibility";
import { useSiteIdleState } from "../../context/SiteIdleContext";
import { useInertWhenHidden } from "../../hooks/useInertWhenHidden";

import { dockNavItems } from "../../config/routes";

function FloatingDock() {
  const location = useLocation();
  const dockRef = useRef(null);
  const { enabled: soundEnabled, toggleSound, play } = useSound();
  const { hideChrome, wake } = useSiteIdleState();
  const revealDock = useCallback(() => {
    wake();
  }, [wake]);

  const { isVisible, reveal } = useScrollVisibility({
    topThreshold: 80,
    deltaThreshold: 18,
    revealOnBottomProximity: true,
    bottomProximity: 160,
    onBottomProximity: revealDock,
  });
  const showDock = isVisible && !hideChrome;
  useInertWhenHidden(dockRef, !showDock);
  const wasVisibleRef = useRef(isVisible);

  const revealDockFull = useCallback(() => {
    wake();
    reveal();
  }, [wake, reveal]);

  useEffect(() => {
    if (isVisible && !wasVisibleRef.current) wake();
    wasVisibleRef.current = isVisible;
  }, [isVisible, wake]);

  useEffect(() => {
    const el = dockRef.current;
    if (el?.contains(document.activeElement)) {
      document.activeElement?.blur?.();
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!showDock || !dockRef.current) return undefined;
    const el = dockRef.current;
    const keepAwake = () => wake();
    el.addEventListener("pointerenter", keepAwake);
    el.addEventListener("pointermove", keepAwake);
    return () => {
      el.removeEventListener("pointerenter", keepAwake);
      el.removeEventListener("pointermove", keepAwake);
    };
  }, [showDock, wake]);

  return (
    <>
      {!showDock && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 h-28 sm:h-36 pointer-events-auto"
          onPointerEnter={revealDockFull}
          onPointerMove={revealDockFull}
          onMouseEnter={revealDockFull}
          aria-hidden="true"
        />
      )}
    <motion.div
      ref={dockRef}
      initial={{ y: 0, opacity: 1, x: "-50%" }}
      animate={{ y: showDock ? 0 : 96, opacity: showDock ? 1 : 0, x: "-50%" }}
      transition={{ type: "spring", stiffness: 280, damping: 34, mass: 0.9 }}
      className="fixed bottom-4 sm:bottom-6 left-1/2 z-50 px-2 sm:px-4 w-full max-w-fit pointer-events-none flex justify-center gpu-layer"
    >
          <nav
            aria-label="Quick navigation"
            className={`flex items-center gap-1 sm:gap-2 p-1 border-4 border-outline shadow-[4px_4px_0px_0px_var(--shadow-color)] sm:shadow-[6px_6px_0px_0px_var(--shadow-color)] overflow-x-auto sm:overflow-visible no-scrollbar max-w-full paint-isolate ${showDock ? "pointer-events-auto" : "pointer-events-none"}`}
            style={{ backgroundColor: "color-mix(in srgb, var(--color-surface) 96%, transparent)" }}
          >
            {dockNavItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`relative isolate flex items-center justify-center p-2 sm:p-3 transition-all duration-200 select-none group shrink-0 hover-gpu ${
                    isActive
                      ? "text-[var(--color-on-primary-container)]"
                      : "text-[var(--color-on-surface)] hover:text-[var(--color-primary)]"
                  }`}
                  aria-label={item.label}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 -z-10 bg-[var(--color-primary-container)] border-2 sm:border-[3px] border-outline shadow-[2px_2px_0_0_var(--shadow-color)]"
                      initial={false}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                    />
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 border-2 sm:border-[3px] border-transparent group-hover:border-outline group-hover:bg-[var(--color-surface-variant)] -z-10 transition-all duration-200" />
                  )}
                  
                  <Icon className="text-lg sm:text-xl relative z-10" />
                  
                  {/* Tooltip on hover for desktop */}
                  <span className={`absolute -top-12 scale-0 group-hover:scale-100 transition-transform bg-[var(--color-on-background)] text-[var(--color-background)] text-xs font-bold px-3 py-1.5 border-2 border-outline whitespace-nowrap pointer-events-none shadow-[2px_2px_0px_0px_var(--shadow-accent)] z-50 font-label-bold uppercase tracking-wider hidden sm:block ${index === dockNavItems.length - 1 ? 'right-0 origin-bottom-right' : 'left-1/2 -translate-x-1/2 origin-bottom'}`}>
                    {item.label} <span className="opacity-60 ml-1">{item.shortcut}</span>
                  </span>
                </NavLink>
              );
            })}
            <button
              type="button"
              onClick={() => {
                toggleSound();
                play("success", { fromGesture: true });
              }}
              className={`relative isolate flex items-center justify-center p-2 sm:p-3 transition-all duration-200 select-none group shrink-0 hover-gpu ${
                soundEnabled
                  ? "text-[var(--color-on-primary-container)]"
                  : "text-[var(--color-on-surface)] hover:text-[var(--color-on-surface)]"
              }`}
              aria-label={soundEnabled ? "Disable interface sounds" : "Enable interface sounds"}
              title={soundEnabled ? "Sound on" : "Sound off"}
            >
              <div
                className={`absolute inset-0 border-2 sm:border-[3px] border-outline -z-10 shadow-[2px_2px_0_0_var(--shadow-color)] transition-all duration-200 ${
                  soundEnabled
                    ? "bg-[var(--color-primary-container)]"
                    : "bg-[var(--color-surface)] group-hover:bg-[var(--color-on-background)]"
                }`}
              />
              {!soundEnabled && (
                <div className="absolute h-[3px] w-8 rotate-45 bg-[var(--color-outline)] group-hover:bg-[var(--color-background)] z-20 pointer-events-none" />
              )}
              {soundEnabled ? (
                <HiVolumeUp className="text-lg sm:text-xl relative z-10 text-[var(--color-on-primary-container)]" />
              ) : (
                <HiVolumeOff className="text-lg sm:text-xl relative z-10 group-hover:text-[var(--color-background)]" />
              )}
              <span className="absolute -top-12 right-0 origin-bottom-right scale-0 group-hover:scale-100 transition-transform bg-[var(--color-on-background)] text-[var(--color-background)] text-xs font-bold px-3 py-1.5 border-2 border-outline whitespace-nowrap pointer-events-none shadow-[2px_2px_0px_0px_var(--shadow-accent)] z-50 font-label-bold uppercase tracking-wider hidden sm:block">
                Sound {soundEnabled ? "On" : "Off"}
              </span>
            </button>
          </nav>
    </motion.div>
    </>
  );
}

export default memo(FloatingDock);
