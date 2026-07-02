import { memo } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { keyboardRoutes } from "../../hooks/useKeyboardNav";
import { useModalLock } from "../../hooks/useModalLock";

const GLOBAL_SHORTCUTS = [
  { keys: ["Ctrl/Alt", "K"], label: "Open search palette" },
  { keys: ["?"], label: "Show this guide" },
  { keys: ["Ctrl/Alt", "D"], label: "Toggle dev HUD" },
  { keys: ["Ctrl/Alt", "C"], label: "Toggle native cursor" },
  { keys: ["Alt", "←"], label: "Previous page" },
  { keys: ["Alt", "→"], label: "Next page" },
  { keys: ["Esc"], label: "Close overlays" },
];

const BERSERK_SHORTCUTS = [
  { keys: ["Ctrl/Alt", "H"], label: "Toggle CRT hack mode" },
  {
    keys: ["↑", "↑", "↓", "↓", "←", "→", "←", "→", "B", "A"],
    label: "Konami code (same effect)",
    compact: true,
  },
];

const PLAYGROUND_SHORTCUTS = [{ keys: ["Tab"], label: "Autocomplete CLI commands" }];

function Kbd({ children }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[1.75rem] border-2 border-outline bg-[var(--color-surface)] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[var(--color-on-surface)] shadow-[2px_2px_0_var(--shadow-color)]">
      {children}
    </kbd>
  );
}

function ShortcutRow({ label, keys, compact }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-2 border-outline bg-[var(--color-surface-variant)] p-3">
      <span className="font-body-md text-sm text-[var(--color-on-surface)]">{label}</span>
      <div
        className={`flex flex-wrap items-center gap-1 ${compact ? "max-w-full sm:max-w-[55%] sm:justify-end" : "justify-start sm:justify-end"}`}
      >
        {keys.map((key, i) => (
          <Kbd key={`${label}-${key}-${i}`}>{key}</Kbd>
        ))}
      </div>
    </div>
  );
}

function Section({ title, hint, children }) {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-label-bold text-xs uppercase tracking-[0.22em] text-[var(--color-on-surface)]">
          {title}
        </h3>
        {hint && (
          <span className="font-mono text-[10px] uppercase text-[var(--color-text-muted)]">{hint}</span>
        )}
      </div>
      <div className="grid gap-2">{children}</div>
    </section>
  );
}

const ShortcutsOverlay = memo(function ShortcutsOverlay({ isOpen, onClose }) {
  useModalLock(isOpen, onClose);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="shortcuts-backdrop"
            className="fixed inset-0 z-[100010] bg-black/70 backdrop-blur-sm gpu-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-[100011] flex items-center justify-center p-4 pointer-events-none gpu-layer">
            <motion.div
              key="shortcuts-panel"
              className="pointer-events-auto w-[min(100%,40rem)] max-h-[min(88vh,720px)] flex flex-col overflow-hidden bg-[var(--color-surface)] border-4 border-outline shadow-[14px_14px_0_var(--shadow-color)] paint-isolate"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              role="dialog"
              aria-modal="true"
              aria-label="Keyboard shortcuts"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="flex shrink-0 items-start justify-between gap-4 border-b-4 border-outline bg-[var(--color-primary-container)] px-5 py-4 text-[var(--color-on-primary-container)]">
                <div>
                  <p className="font-label-bold text-[10px] uppercase tracking-[0.28em] opacity-75">
                    Press ? anytime
                  </p>
                  <h2 className="font-headline-md text-2xl md:text-3xl uppercase leading-none">
                    Shortcuts
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 border-4 border-outline bg-[var(--color-surface)] px-3 py-2 font-label-bold text-xs uppercase text-[var(--color-on-surface)] shadow-[3px_3px_0_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  Esc
                </button>
              </header>

              <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-5 space-y-6" data-lenis-prevent>
                <Section title="Jump to page" hint="Alt + number">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {keyboardRoutes.map((route) => (
                      <div
                        key={route.key}
                        className="flex items-center justify-between gap-2 border-2 border-outline bg-[var(--color-surface-variant)] px-3 py-2.5"
                      >
                        <span className="font-label-bold text-xs uppercase text-[var(--color-on-surface)] truncate">
                          {route.label}
                        </span>
                        <Kbd>Alt+{route.key}</Kbd>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Global">
                  {GLOBAL_SHORTCUTS.map((item) => (
                    <ShortcutRow key={item.label} label={item.label} keys={item.keys} />
                  ))}
                </Section>

                <Section title="Berserk mode">
                  {BERSERK_SHORTCUTS.map((item) => (
                    <ShortcutRow
                      key={item.label}
                      label={item.label}
                      keys={item.keys}
                      compact={item.compact}
                    />
                  ))}
                </Section>

                <Section title="Playground CLI">
                  {PLAYGROUND_SHORTCUTS.map((item) => (
                    <ShortcutRow key={item.label} label={item.label} keys={item.keys} />
                  ))}
                </Section>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
});

export default ShortcutsOverlay;
