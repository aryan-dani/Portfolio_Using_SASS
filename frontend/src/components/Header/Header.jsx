import { useState, useEffect, memo, useRef, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { useAchievements } from "../../context/AchievementContext";
// Fix #5: Import motionEase from the canonical shared location instead of re-declaring locally
import { snappySpring, defaultSpring, motionEase } from "../../utils/motionVariants";
import { useScrollVisibility } from "../../hooks/useScrollVisibility";
import { useSiteIdleState } from "../../context/SiteIdleContext";
import { useInertWhenHidden } from "../../hooks/useInertWhenHidden";

import { headerNavItems } from "../../config/routes";

const menuVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { staggerChildren: 0.03, staggerDirection: -1 }
  }
};

const menuItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

// Fix #7: Shared mobile nav class function — eliminates verbatim duplication across Home + nav items
const mobileNavClass = ({ isActive }) =>
  `block w-full text-center py-3 px-4 border-4 transition-all text-[var(--color-on-surface)] ${
    isActive
      ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-outline shadow-[4px_4px_0_0_var(--shadow-color)]"
      : "border-transparent hover:border-outline hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)]"
  }`;

// Fix #6: Extract shared ThemeToggleButton to eliminate 40-line duplication between desktop and mobile
function ThemeToggleButton({ theme, onToggle, className, springConfig }) {
  return (
    <motion.button
      onClick={onToggle}
      className={className}
      aria-label="Toggle theme"
      whileTap={{ scale: 0.9 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={springConfig}
        >
          {theme === "dark" ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const { track } = useAchievements();
  const location = useLocation();
  const { isVisible, isScrolled, reveal } = useScrollVisibility({
    topThreshold: 84,
    deltaThreshold: 16,
  });
  const { hideChrome, wake } = useSiteIdleState();
  const showChrome = isVisible && !hideChrome;
  useInertWhenHidden(navRef, !showChrome);
  const wasVisibleRef = useRef(isVisible);

  const revealChrome = useCallback(() => {
    wake();
    reveal();
  }, [wake, reveal]);

  // Reaching the top (or top-edge reveal) should bring chrome back after idle hide.
  useEffect(() => {
    if (isVisible && !wasVisibleRef.current) wake();
    wasVisibleRef.current = isVisible;
  }, [isVisible, wake]);

  useEffect(() => {
    const el = navRef.current;
    if (el?.contains(document.activeElement)) {
      document.activeElement?.blur?.();
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!showChrome) setIsMenuOpen(false);
  }, [showChrome]);

  // While chrome is visible, keep resetting the 2s idle timer on intentional nav hover.
  useEffect(() => {
    if (!showChrome || !navRef.current) return undefined;
    const el = navRef.current;
    const keepAwake = () => wake();
    el.addEventListener("pointerenter", keepAwake);
    el.addEventListener("pointermove", keepAwake);
    return () => {
      el.removeEventListener("pointerenter", keepAwake);
      el.removeEventListener("pointermove", keepAwake);
    };
  }, [showChrome, wake]);

  const handleToggleTheme = useCallback(() => {
    toggleTheme();
    track("theme_toggle");
  }, [toggleTheme, track]);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  return (
    <>
      {!showChrome && (
        <div
          className="fixed inset-x-0 top-0 z-40 h-24 pointer-events-auto"
          onPointerEnter={revealChrome}
          onMouseEnter={revealChrome}
          aria-hidden="true"
        />
      )}
      <motion.nav
        ref={navRef}
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: showChrome ? 0 : "-100%", opacity: showChrome ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 34, mass: 0.9 }}
        aria-label="Main navigation"
        className={`sticky top-0 w-full border-b-4 z-50 transition-[box-shadow,border-color] duration-300 gpu-layer paint-isolate ${
          isScrolled
            ? "border-outline shadow-[0_5px_0_0_var(--shadow-color)]"
            : "border-outline shadow-[0_8px_0_0_var(--shadow-color)]"
        } ${showChrome ? "pointer-events-auto" : "pointer-events-none"}`}
        style={{ backgroundColor: "color-mix(in srgb, var(--color-surface) 96%, transparent)" }}
      >
            <div
              className="flex justify-between items-center gap-2 px-3 md:px-6 lg:px-5 xl:px-8 w-full h-16 md:h-[4.25rem] xl:h-20 min-w-0"
            >
              {/* Logo */}
              <div className="flex-shrink-0">
                <NavLink
                  to="/"
                  onClick={closeMenu}
                  className="block text-base lg:text-lg xl:text-2xl font-black tracking-tighter text-[var(--color-on-primary-container)] border-4 border-outline px-2.5 lg:px-3 xl:px-4 py-1.5 lg:py-2 bg-[var(--color-primary-container)] shadow-[4px_4px_0_0_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_var(--shadow-color)] transition-all duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] select-none whitespace-nowrap hover-gpu"
                >
                  ARYAN DANI
                </NavLink>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-0 xl:gap-1 mx-auto min-w-0 flex-1 justify-center max-w-[52rem]">
                {headerNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={`relative isolate font-bold px-1.5 lg:px-2 xl:px-3 py-1.5 border-4 border-transparent transition-all duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] select-none uppercase text-[10px] lg:text-[11px] xl:text-sm tracking-wide xl:tracking-widest hover-gpu whitespace-nowrap ${
                        isActive
                          ? "text-[var(--color-on-primary-container)]"
                          : "text-[var(--color-on-surface)] hover:border-outline hover:bg-[var(--color-surface-variant)]"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute -inset-[4px] -z-10">
                          <motion.div
                            layoutId="activeNav"
                            className="w-full h-full bg-[var(--color-primary-container)] border-4 border-outline shadow-[2px_2px_0_0_var(--shadow-color)] overflow-hidden"
                            transition={defaultSpring}
                          >
                            <div className="absolute inset-0 animate-shimmer opacity-35" />
                          </motion.div>
                        </div>
                      )}
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>

              {/* Right side Actions */}
              <div className="hidden lg:flex items-center gap-1.5 xl:gap-3 flex-shrink-0">
                <NavLink
                  to="/contact"
                  className="hidden sm:flex font-headline-md text-[11px] lg:text-xs xl:text-base uppercase tracking-wide xl:tracking-widest font-black text-[var(--color-on-primary-container)] bg-[var(--color-primary-container)] border-4 border-outline px-3 lg:px-4 xl:px-5 py-2 xl:py-3 shadow-[4px_4px_0px_0px_var(--shadow-color)] xl:shadow-[6px_6px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] items-center justify-center whitespace-nowrap"
                >
                  Work with me
                </NavLink>

                {/* Desktop Theme Toggle */}
                <ThemeToggleButton
                  theme={theme}
                  onToggle={handleToggleTheme}
                  className="bg-[var(--color-surface)] text-[var(--color-on-surface)] border-4 border-outline w-10 h-10 xl:w-12 xl:h-12 flex items-center justify-center text-base xl:text-lg shadow-[4px_4px_0_0_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] cursor-none overflow-hidden"
                  springConfig={snappySpring}
                />
              </div>

              {/* Mobile actions */}
              <div className="flex lg:hidden items-center gap-2">
                {/* Mobile Theme Toggle */}
                <ThemeToggleButton
                  theme={theme}
                  onToggle={handleToggleTheme}
                  className="bg-[var(--color-surface)] text-[var(--color-on-surface)] border-4 border-outline w-10 h-10 flex items-center justify-center text-base shadow-[2px_2px_0_0_var(--shadow-color)] hover:shadow-none transition-all cursor-none overflow-hidden"
                  springConfig={{ duration: 0.28, ease: motionEase.out }}
                />

                <button
                  className="text-[var(--color-on-surface)] p-2 hover:bg-[var(--color-surface-variant)] transition-colors rounded-sm"
                  onClick={() => setIsMenuOpen((p) => !p)}
                  aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                  aria-expanded={isMenuOpen}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={isMenuOpen ? "close" : "open"}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.28, ease: motionEase.out }}
                    >
                      {isMenuOpen ? <HiX size={28} /> : <HiMenuAlt3 size={28} />}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </div>
            </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && showChrome && (
          <motion.div
            className="lg:hidden fixed inset-0 z-40 top-[64px] md:top-[80px] flex flex-col items-center pt-8 pb-8 border-t-4 border-outline font-headline-md uppercase font-bold text-xl gap-4 overflow-y-auto"
            style={{ backgroundColor: "color-mix(in srgb, var(--color-surface) 96%, transparent)" }}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Home item */}
            <motion.div variants={menuItemVariants} className="w-[80%]">
              <NavLink to="/" onClick={closeMenu} className={mobileNavClass}>
                Home
              </NavLink>
            </motion.div>

            {headerNavItems.map((item) => (
              <motion.div key={item.path} variants={menuItemVariants} className="w-[80%]">
                <NavLink to={item.path} onClick={closeMenu} className={mobileNavClass}>
                  {item.label}
                </NavLink>
              </motion.div>
            ))}

            <motion.div variants={menuItemVariants} className="w-[80%] mt-2">
              <NavLink
                to="/contact"
                onClick={closeMenu}
                className="w-full flex justify-center items-center font-headline-md text-lg uppercase tracking-widest font-black text-[var(--color-on-primary-container)] bg-[var(--color-primary-container)] border-4 border-outline px-4 py-3 shadow-[6px_6px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Work with me
              </NavLink>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default memo(Header);
