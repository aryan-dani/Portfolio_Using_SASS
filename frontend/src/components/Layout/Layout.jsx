import { lazy, memo, Suspense, useCallback, useEffect, useState } from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import FloatingDock from "../FloatingDock/FloatingDock";
import ShortcutsOverlay from "../ShortcutsOverlay/ShortcutsOverlay";
import OnboardingHint from "../OnboardingHint/OnboardingHint";
import InstallPrompt from "../InstallPrompt/InstallPrompt";
import CrtExitBanner from "../CrtExitBanner/CrtExitBanner";
import { useKeyboardNav } from "../../hooks/useKeyboardNav";
const CommandPalette = lazy(() => import("../CommandPalette/CommandPalette"));

const Layout = memo(function Layout({ children }) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [paletteMounted, setPaletteMounted] = useState(false);
  const showShortcuts = useCallback(() => setShortcutsOpen(true), []);
  useKeyboardNav({ onShowShortcuts: showShortcuts });

  useEffect(() => {
    const mountPalette = () => setPaletteMounted(true);

    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey || event.altKey) && event.code === "KeyK") {
        mountPalette();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    const idle = window.requestIdleCallback || ((cb) => window.setTimeout(cb, 2500));
    const handle = idle(mountPalette);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(handle);
      } else {
        window.clearTimeout(handle);
      }
    };
  }, []);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md selection:bg-primary-container selection:text-black">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100000] focus:border-4 focus:border-outline focus:bg-[var(--color-primary-container)] focus:px-4 focus:py-3 focus:font-label-bold focus:uppercase focus:text-[var(--color-on-primary-container)] focus:shadow-[4px_4px_0_var(--shadow-color)]"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="grow w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-10 pb-24 md:pb-28 flex flex-col gap-12 md:gap-section-gap relative z-10 mt-6 md:mt-0">
        {children}
      </main>
      <Footer />
      <FloatingDock />
      {paletteMounted && (
        <Suspense fallback={null}>
          <CommandPalette />
        </Suspense>
      )}
      <OnboardingHint />
      <InstallPrompt />
      <CrtExitBanner />
      <ShortcutsOverlay isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
});

export default Layout;
