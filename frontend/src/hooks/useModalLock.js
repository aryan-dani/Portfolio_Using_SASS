import { useEffect } from "react";

/**
 * Locks body scroll and adds Escape key dismissal when a modal/overlay is open.
 *
 * @param {boolean} isOpen  - Whether the modal is currently open.
 * @param {function} onClose - Callback to close the modal (called on Escape).
 */
export function useModalLock(isOpen, onClose) {
  // Body + Lenis scroll lock (supports nested overlays)
  useEffect(() => {
    if (!isOpen) return undefined;

    const html = document.documentElement;
    const body = document.body;
    const lenis = window.__portfolioLenis;
    const lockAttr = "data-modal-lock-count";

    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = html.style.overflow;
    const currentCount = Number.parseInt(html.getAttribute(lockAttr) || "0", 10);
    const nextCount = currentCount + 1;

    html.setAttribute(lockAttr, String(nextCount));

    if (nextCount === 1) {
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
      html.classList.add("lenis-stopped", "portfolio-modal-open");
      lenis?.stop?.();
    }

    return () => {
      const countNow = Number.parseInt(html.getAttribute(lockAttr) || "1", 10);
      const reducedCount = Math.max(0, countNow - 1);

      if (reducedCount === 0) {
        html.removeAttribute(lockAttr);
        body.style.overflow = previousBodyOverflow;
        html.style.overflow = previousHtmlOverflow;
        html.classList.remove("lenis-stopped", "portfolio-modal-open");
        lenis?.start?.();
      } else {
        html.setAttribute(lockAttr, String(reducedCount));
      }
    };
  }, [isOpen]);

  // Escape key dismiss
  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);
}
