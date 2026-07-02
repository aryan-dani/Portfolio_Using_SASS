import { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAchievements } from "../../context/AchievementContext";
import { shouldUseSmoothScroll } from "../../utils/device";
import { getPortfolioScrollY } from "../../utils/smoothScroll";

const DevHUD = memo(function DevHUD({ xray, onToggleXray }) {
  const location = useLocation();
  const { theme, crtMode } = useTheme();
  const [fps, setFps] = useState(60);
  const [scrollY, setScrollY] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const tick = (now) => {
      frames += 1;
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)));
        setScrollY(Math.round(getPortfolioScrollY()));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const sessionMin = Math.floor((Date.now() - startRef.current) / 60000);

  return createPortal(
    <div className="fixed bottom-24 left-4 z-[150] w-64 border-4 border-outline bg-[var(--color-on-background)] text-[var(--color-background)] p-3 font-mono text-[10px] uppercase shadow-[6px_6px_0_var(--shadow-color)] pointer-events-auto">
      <div className="flex justify-between items-center border-b-2 border-dashed border-current pb-2 mb-2">
        <span className="font-label-bold">Dev HUD</span>
        <button type="button" onClick={onToggleXray} className="border-2 border-current px-1">
          XRAY {xray ? "ON" : "OFF"}
        </button>
      </div>
      <p>FPS: {fps}</p>
      <p>Route: {location.pathname}</p>
      <p>Viewport: {window.innerWidth}x{window.innerHeight}</p>
      <p>Scroll: {scrollY}px</p>
      <p>Theme: {theme}{crtMode ? "+CRT" : ""}</p>
      <p>Lenis: {shouldUseSmoothScroll() ? "on" : "off"}</p>
      <p>Session: {sessionMin}m</p>
    </div>,
    document.body,
  );
});

function DevTools() {
  const [open, setOpen] = useState(false);
  const [xray, setXray] = useState(false);
  const { track } = useAchievements();

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey && e.altKey && e.code === "KeyD") {
        e.preventDefault();
        setOpen((v) => {
          if (!v) track("dev_hud");
          return !v;
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [track]);

  useEffect(() => {
    document.documentElement.classList.toggle("dev-xray", xray);
    return () => document.documentElement.classList.remove("dev-xray");
  }, [xray]);

  if (!open) return null;
  return <DevHUD xray={xray} onToggleXray={() => setXray((v) => !v)} />;
}

export default memo(DevTools);
