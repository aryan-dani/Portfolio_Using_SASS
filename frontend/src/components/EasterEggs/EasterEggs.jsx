import { memo } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useSiteIdleState } from "../../context/SiteIdleContext";

const StaleOverlay = memo(function StaleOverlay() {
  return createPortal(
    <motion.div
      className="fixed inset-0 z-[180] flex items-end md:items-center justify-center p-6 pb-28 md:pb-6 bg-[color-mix(in_srgb,var(--color-background)_72%,transparent)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      role="presentation"
      aria-hidden="true"
    >
      <motion.div
        className="bg-hatch border-4 border-outline px-6 py-5 md:px-8 md:py-6 shadow-[8px_8px_0_var(--shadow-color)] max-w-sm w-full text-center pointer-events-none"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <p className="font-label-bold text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          Session idle
        </p>
        <p className="font-headline-md text-xl md:text-2xl uppercase mt-2 text-[var(--color-on-surface)] leading-tight">
          Still here?
        </p>
        <p className="font-body-md text-sm mt-2 text-[var(--color-text-muted)]">
          Move or click anywhere to wake the site back up.
        </p>
      </motion.div>
    </motion.div>,
    document.body,
  );
});

function EasterEggs() {
  const { isStale } = useSiteIdleState();

  return (
    <AnimatePresence>
      {isStale && <StaleOverlay key="stale-overlay" />}
    </AnimatePresence>
  );
}

export default memo(EasterEggs);
