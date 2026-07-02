import { useCallback, useEffect, useRef, useState, memo } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../../context/ThemeContext";

/* ────────────────────────────────────────────────────────────
   High-Performance Custom Cursor
   - Direct DOM updates via refs bypass React and Framer Motion loops for 0-lag position tracking.
   - Snappy spring-like compositor-driven transitions for outer trail.
   - Automatically sample luminance for dynamic background contrast.
   ──────────────────────────────────────────────────────────── */
const LIGHT = "#f8f7f4";
const DARK  = "#131316";
const CRT_PHOSPHOR = "#39ff14";
const CRT_BG = "#050805";
const NATIVE_CURSOR_KEY = "portfolio_native_cursor";
const CUSTOM_CURSOR_CLASS = "custom-cursor-active";
const CUSTOM_CURSOR_PORTAL_CLASS = "portfolio-custom-cursor";
/** Above shortcuts overlay (100011) so the cursor stays visible on modals */
const CURSOR_Z_INDEX = 100020;

const parseColor = (str) => {
  if (!str || str === "transparent" || str === "rgba(0, 0, 0, 0)") return null;
  const m = str.match(/rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
};

const getEffectiveBgLuminance = (el) => {
  let node = el;
  while (node && node !== document.documentElement) {
    const style = window.getComputedStyle(node);
    if (style.pointerEvents === "none" && parseInt(style.zIndex) >= 9999) {
      node = node.parentElement;
      continue;
    }
    const color = parseColor(style.backgroundColor);
    if (color && color.a > 0.4) {
      const toLinear = (c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * toLinear(color.r) + 0.7152 * toLinear(color.g) + 0.0722 * toLinear(color.b);
    }
    node = node.parentElement;
  }
  return null;
};

const CustomCursor = memo(function CustomCursor() {
  const { theme, crtMode } = useTheme();
  const isDark = crtMode || theme === "dark";

  const resolveColors = useCallback(
    (darkBg, state) => {
      const isHover = state === "hover" || state === "image";
      if (crtMode) {
        return {
          primary: CRT_PHOSPHOR,
          inverted: CRT_BG,
          isHover,
        };
      }
      const primaryColor = darkBg ? LIGHT : DARK;
      const invertedColor = darkBg ? DARK : LIGHT;
      return { primary: primaryColor, inverted: invertedColor, isHover };
    },
    [crtMode],
  );

  const [cursorState, setCursorState] = useState("default");
  const [onDarkBg, setOnDarkBg] = useState(isDark);
  const [isVisible, setIsVisible] = useState(false);
  const [nativeCursor, setNativeCursor] = useState(
    () => localStorage.getItem(NATIVE_CURSOR_KEY) === "true",
  );

  const innerRef = useRef(null);
  const outerRef = useRef(null);
  const visibleRef = useRef(false);
  const cursorStateRef = useRef(cursorState);
  const onDarkBgRef = useRef(onDarkBg);
  const hoverTargetRef = useRef(null);
  const hoverRafRef = useRef(0);

  // Position tracking refs
  const mousePosRef = useRef({ x: -100, y: -100 });
  const innerPosRef = useRef({ x: -100, y: -100 });
  const outerPosRef = useRef({ x: -100, y: -100 });
  const loopActiveRef = useRef(false);

  const isHoverState = cursorState === "hover" || cursorState === "image";
  const shouldRenderCursor = cursorState !== "hidden";
  const isHoverStateRef = useRef(isHoverState);
  isHoverStateRef.current = isHoverState;

  useEffect(() => {
    onDarkBgRef.current = isDark;
    setOnDarkBg(isDark);
  }, [theme, crtMode, isDark]);

  useEffect(() => {
    document.documentElement.classList.toggle("native-cursor", nativeCursor);
    document.documentElement.classList.toggle(CUSTOM_CURSOR_CLASS, !nativeCursor);
    localStorage.setItem(NATIVE_CURSOR_KEY, String(nativeCursor));
    return () => {
      document.documentElement.classList.remove(CUSTOM_CURSOR_CLASS);
    };
  }, [nativeCursor]);

  // Ctrl/Alt+C toggles between the custom and native cursor (documented in shortcuts overlay)
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code !== "KeyC" || !event.ctrlKey || !event.altKey) return;
      if (event.target?.closest?.("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      setNativeCursor((prev) => !prev);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (nativeCursor || window.matchMedia("(pointer: coarse)").matches) return;

    const tick = () => {
      const targetX = mousePosRef.current.x;
      const targetY = mousePosRef.current.y;

      // Update inner dot position (instant)
      innerPosRef.current = { x: targetX, y: targetY };

      // Update outer trail position (lerp)
      let ox = outerPosRef.current.x;
      let oy = outerPosRef.current.y;
      
      const dx = targetX - ox;
      const dy = targetY - oy;

      // Physics interpolation step (0.26 factor for highly responsive snap trail)
      ox += dx * 0.26;
      oy += dy * 0.26;

      outerPosRef.current = { x: ox, y: oy };

      // Direct DOM rendering (completely bypasses React render tree)
      if (innerRef.current) {
        innerRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      }
      if (outerRef.current) {
        const rotateStr = isHoverStateRef.current ? "rotate(45deg)" : "rotate(0deg)";
        outerRef.current.style.transform = `translate3d(${ox}px, ${oy}px, 0) translate(-50%, -50%) ${rotateStr}`;
      }

      // Keep animation loop ticking if coordinates are still catching up
      const dist = Math.hypot(dx, dy);
      if (dist > 0.08) {
        requestAnimationFrame(tick);
      } else {
        loopActiveRef.current = false;
      }
    };

    const startLoop = () => {
      if (!loopActiveRef.current) {
        loopActiveRef.current = true;
        requestAnimationFrame(tick);
      }
    };

    const onMouseMove = (e) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };

      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }
      startLoop();
    };

    const onMouseLeave = () => {
      if (visibleRef.current) {
        visibleRef.current = false;
        setIsVisible(false);
      }
    };

    const onMouseEnter = () => {
      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }
      // Reset position to entry point so it doesn't animate from previous offscreen coordinates
      const handleFirstMove = (e) => {
        mousePosRef.current = { x: e.clientX, y: e.clientY };
        outerPosRef.current = { x: e.clientX, y: e.clientY };
        window.removeEventListener("mousemove", handleFirstMove);
      };
      window.addEventListener("mousemove", handleFirstMove);
    };

    const applyCursorColors = (darkBg, state) => {
      const { primary, inverted, isHover } = resolveColors(darkBg, state);

      if (innerRef.current) {
        innerRef.current.style.background = isHover ? inverted : primary;
        innerRef.current.style.borderColor = primary;
        innerRef.current.style.width = state === "text" ? "4px" : "16px";
        innerRef.current.style.height = state === "text" ? "22px" : "16px";
      }
      if (outerRef.current) {
        outerRef.current.style.borderColor = primary;
        outerRef.current.style.width = isHover ? "50px" : "36px";
        outerRef.current.style.height = isHover ? "50px" : "36px";
        outerRef.current.style.opacity = state === "text" ? "0" : "1";
      }
    };

    const processHoverTarget = () => {
      hoverRafRef.current = 0;
      const target = hoverTargetRef.current;
      if (!target || !target.closest) return;

      const el = target.closest("a, button, [role='button'], .cursor-pointer, .nb-carousel-arrow");
      const img = target.closest("img, canvas, .cursor-image");
      const input = target.closest("input, textarea, select");

      let state = "default";
      if (input) state = "text";
      else if (img) state = "image";
      else if (el) state = "hover";

      if (cursorStateRef.current !== state) {
        cursorStateRef.current = state;
        setCursorState(state);
      }

      let resolvedDark = isDark;
      if (!el && !img && !input) {
        const lum = getEffectiveBgLuminance(target);
        resolvedDark = lum !== null ? lum < 0.4 : isDark;
      } else if (crtMode) {
        resolvedDark = true;
      }

      if (onDarkBgRef.current !== resolvedDark) {
        onDarkBgRef.current = resolvedDark;
        setOnDarkBg(resolvedDark);
      }

      applyCursorColors(resolvedDark, state);
      startLoop();
    };

    const handleHoverChange = (e) => {
      hoverTargetRef.current = e.target;
      if (!hoverRafRef.current) {
        hoverRafRef.current = requestAnimationFrame(processHoverTarget);
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    window.addEventListener("mouseover", handleHoverChange, { passive: true });

    const onPointerDown = (e) => {
      if (e.button !== 0) return;
      const inner = innerRef.current;
      const outer = outerRef.current;
      if (!inner) return;

      const innerW = inner.offsetWidth;
      const innerH = inner.offsetHeight;
      inner.animate(
        [
          { width: `${innerW}px`, height: `${innerH}px` },
          { width: `${Math.max(6, innerW * 0.55)}px`, height: `${Math.max(6, innerH * 0.55)}px` },
          { width: `${innerW}px`, height: `${innerH}px` },
        ],
        { duration: 160, easing: "ease-out" },
      );

      if (outer && cursorStateRef.current !== "text") {
        const outerW = outer.offsetWidth;
        const outerH = outer.offsetHeight;
        outer.animate(
          [
            { width: `${outerW}px`, height: `${outerH}px`, opacity: 1 },
            { width: `${outerW + 6}px`, height: `${outerH + 6}px`, opacity: 0.45 },
            { width: `${outerW}px`, height: `${outerH}px`, opacity: 1 },
          ],
          { duration: 200, easing: "ease-out" },
        );
      }
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    // Initialize positions off-screen
    if (innerRef.current) {
      innerRef.current.style.transform = "translate3d(-100px, -100px, 0) translate(-50%, -50%)";
    }
    if (outerRef.current) {
      outerRef.current.style.transform = "translate3d(-100px, -100px, 0) translate(-50%, -50%) rotate(0deg)";
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      window.removeEventListener("mouseover", handleHoverChange);
      window.removeEventListener("pointerdown", onPointerDown);
      if (hoverRafRef.current) cancelAnimationFrame(hoverRafRef.current);
    };
  }, [isDark, crtMode, nativeCursor, resolveColors]);

  if (nativeCursor) return null;

  const { primary: primaryColor, inverted: invertedColor, isHover: isHoverStateColors } =
    resolveColors(onDarkBg, cursorState);
  const innerBg = isHoverStateColors ? invertedColor : primaryColor;
  const innerBorder = primaryColor;
  const outerBorder = primaryColor;

  return createPortal(
    <div
      className={CUSTOM_CURSOR_PORTAL_CLASS}
      style={{
        pointerEvents: "none",
        zIndex: CURSOR_Z_INDEX,
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: isVisible && shouldRenderCursor ? 1 : 0,
        transition: "opacity 0.2s ease",
      }}
    >
      {/* Inner dot (no hardcoded transform in React style object) */}
      <div
        ref={innerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: cursorState === "text" ? "4px" : "16px",
          height: cursorState === "text" ? "22px" : "16px",
          background: innerBg,
          border: `2px solid ${innerBorder}`,
          borderRadius: "0",
          transformOrigin: "center",
          transition: "width 0.15s, height 0.15s, background 0.12s, border-color 0.12s",
          willChange: "transform",
        }}
      />

      {/* Outer ring (no transform transition to prevent trailing delay, no hardcoded transform in React style) */}
      <div
        ref={outerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: isHoverState ? "50px" : "36px",
          height: isHoverState ? "50px" : "36px",
          border: `2px solid ${outerBorder}`,
          background: "transparent",
          borderRadius: "0",
          transformOrigin: "center",
          transition: "width 0.18s, height 0.18s, border-color 0.12s",
          willChange: "transform",
          opacity: cursorState === "text" ? 0 : 1,
        }}
      />
    </div>,
    document.body
  );
});

export default CustomCursor;
