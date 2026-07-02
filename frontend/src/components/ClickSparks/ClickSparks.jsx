import { memo, useEffect, useRef } from "react";
import { isFinePointerDevice } from "../../utils/device";

const POOL_SIZE = 10;

/** Subtle neo-brutalist click stamp: one expanding square ring per tap. */
function ClickSparks() {
  const poolRef = useRef([]);

  useEffect(() => {
    if (!isFinePointerDevice()) return undefined;

    const container = document.createElement("div");
    container.setAttribute("aria-hidden", "true");
    container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:99998;";
    document.body.appendChild(container);

    const pool = Array.from({ length: POOL_SIZE }, () => {
      const el = document.createElement("div");
      el.style.cssText =
        "position:absolute;width:20px;height:20px;border:2px solid var(--color-outline);background:color-mix(in srgb, var(--color-on-background) 8%, transparent);opacity:0;will-change:transform,opacity;box-sizing:border-box;";
      container.appendChild(el);
      return { el, busy: false };
    });
    poolRef.current = pool;

    const pulse = (x, y) => {
      const item = pool.find((p) => !p.busy);
      if (!item) return;
      item.busy = true;
      const { el } = item;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.opacity = "1";
      el.style.transform = "translate(-50%,-50%) scale(0.55)";
      el.animate(
        [
          { transform: "translate(-50%,-50%) scale(0.55)", opacity: 0.55 },
          { transform: "translate(-50%,-50%) scale(1.85)", opacity: 0 },
        ],
        { duration: 340, easing: "cubic-bezier(0.33, 1, 0.68, 1)", fill: "forwards" },
      ).onfinish = () => {
        item.busy = false;
        el.style.opacity = "0";
      };
    };

    const onPointerDown = (e) => {
      if (e.button !== 0) return;
      pulse(e.clientX, e.clientY);
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      container.remove();
    };
  }, []);

  return null;
}

export default memo(ClickSparks);
