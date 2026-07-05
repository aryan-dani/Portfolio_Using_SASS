import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { pageVariants } from "./utils/motionVariants";
import { scrollToTopImmediate } from "./utils/smoothScroll";
import { SITE_ROUTES, routeOrder, PAGE_IMPORTS } from "./config/routes";
import { Analytics } from "@vercel/analytics/react";
import Layout from "./components/Layout/Layout";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SmoothScrollProvider } from "./context/SmoothScrollContext";
import { SoundProvider } from "./context/SoundContext";
import { AchievementProvider } from "./context/AchievementContext";
import { SiteIdleProvider } from "./context/SiteIdleContext";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { MOBILE_LITE_QUERY } from "./utils/device";
import { composeProviders } from "./utils/composeProviders";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";

import BackToTop from "./components/BackToTop/BackToTop";
import NoiseOverlay from "./components/NoiseOverlay/NoiseOverlay";
import PageLoader from "./components/PageLoader/PageLoader";
import CustomCursor from "./components/CustomCursor/CustomCursor";
import HackModeListener from "./components/HackModeListener/HackModeListener";

const lazyPages = Object.fromEntries(
  SITE_ROUTES.map((route) => [route.id, lazy(PAGE_IMPORTS[route.id])]),
);

const routeConfig = SITE_ROUTES.map((route) => ({
  index: route.segment === null,
  path: route.segment ?? undefined,
  component: lazyPages[route.id],
}));

const ChatWidget = lazy(() => import("./components/ChatWidget/ChatWidget"));
const EasterEggs = lazy(() => import("./components/EasterEggs/EasterEggs"));
const DevTools = lazy(() => import("./components/DevTools/DevTools"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

const basename = import.meta.env.BASE_URL;

function PageFallback() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-background)",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "4px solid var(--color-outline-variant)",
          borderTopColor: "var(--color-primary-container)",
          borderRadius: "0",
          animation: "spin 0.9s linear infinite",
          boxShadow: "4px 4px 0 var(--shadow-color)",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function PageTransition({ children, isFirstRender, direction, liteMode }) {
  return (
    <>
      {!isFirstRender && !liteMode && (
        <motion.div
          aria-hidden="true"
          className="fixed inset-0 z-[90] pointer-events-none bg-[var(--color-background)] gpu-layer"
          initial={{ opacity: 0.92 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0.82 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <motion.div
        variants={liteMode ? undefined : pageVariants}
        custom={direction}
        initial={isFirstRender || liteMode ? false : "initial"}
        animate={liteMode ? undefined : "animate"}
        exit={liteMode ? undefined : "exit"}
        transition={liteMode ? { duration: 0 } : undefined}
        className="w-full flex flex-col grow"
      >
        {children}
      </motion.div>
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const liteMode = useMediaQuery(MOBILE_LITE_QUERY);
  const isFirstRenderRef = useRef(true);
  const [direction, setDirection] = useState(1);
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    isFirstRenderRef.current = false;
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    scrollToTopImmediate();
    requestAnimationFrame(scrollToTopImmediate);
  }, [location.pathname]);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    if (previousPath === location.pathname) return;

    const fromIndex = routeOrder.indexOf(previousPath);
    const toIndex = routeOrder.indexOf(location.pathname);

    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
      setDirection(toIndex > fromIndex ? 1 : -1);
    } else {
      setDirection(1);
    }

    previousPathRef.current = location.pathname;
  }, [location.pathname]);

  const isFirstRender = isFirstRenderRef.current;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {routeConfig.map(({ index, path, component: Component }) => (
          <Route
            key={path ?? "/"}
            index={index}
            path={path}
            element={
              <ErrorBoundary>
                <Suspense fallback={<PageFallback />}>
                  <PageTransition isFirstRender={isFirstRender} direction={direction} liteMode={liteMode}>
                    <Component />
                  </PageTransition>
                </Suspense>
              </ErrorBoundary>
            }
          />
        ))}
        <Route
          path="*"
          element={
            <ErrorBoundary>
              <Suspense fallback={<PageFallback />}>
                <PageTransition isFirstRender={isFirstRender} direction={direction}>
                  <NotFound />
                </PageTransition>
              </Suspense>
            </ErrorBoundary>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function CustomCursorGate() {
  const [enabled, setEnabled] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    const onChange = (event) => setEnabled(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  if (!enabled) return null;
  return <CustomCursor />;
}

// Outer providers — no router dependency (safe to wrap Router itself)
const OuterProviders = composeProviders(ThemeProvider, SmoothScrollProvider, SoundProvider, ToastProvider);

function App() {
  return (
    // MotionConfig with reducedMotion="user" instructs Framer Motion to
    // automatically disable animations for users with prefers-reduced-motion set.
    <MotionConfig reducedMotion="user">
      <OuterProviders>
        <NoiseOverlay />
        <CustomCursorGate />
        <PageLoader />
        <Router
          basename={basename}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <AchievementProvider>
            <SiteIdleProvider>
              <HackModeListener />
              <Suspense fallback={null}>
                <EasterEggs />
                <DevTools />
                <ChatWidget />
              </Suspense>
              <BackToTop />
              <Layout>
                <AnimatedRoutes />
              </Layout>
              {import.meta.env.PROD && <Analytics />}
            </SiteIdleProvider>
          </AchievementProvider>
        </Router>
      </OuterProviders>
    </MotionConfig>
  );
}

export default App;
