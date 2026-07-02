import { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowUp } from "react-icons/fa";
import { getPortfolioScrollY, smoothScrollToTop, subscribePortfolioScroll } from "../../utils/smoothScroll";
import { snappySpring } from "../../utils/motionVariants";
import { useSiteIdleState } from "../../context/SiteIdleContext";

function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

const BackToTop = memo(function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const isScrollingRef = useRef(false);
  const { hideChrome } = useSiteIdleState();

  useEffect(() => {
    const handleScroll = throttle(() => {
      if (isScrollingRef.current) return;
      setIsVisible(getPortfolioScrollY() > 400);
    }, 60);

    const unsubscribe = subscribePortfolioScroll(handleScroll);
    handleScroll();
    return unsubscribe;
  }, []);

  const scrollToTop = useCallback(() => {
    if (isScrollingRef.current) return;

    isScrollingRef.current = true;
    setIsScrolling(true);

    smoothScrollToTop().finally(() => {
      isScrollingRef.current = false;
      setIsScrolling(false);
      setIsVisible(getPortfolioScrollY() > 400);
    });
  }, []);

  const showButton = (isVisible || isScrolling) && !hideChrome;

  return (
    <AnimatePresence>
      {showButton && (
        <motion.div
          className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[999]"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={snappySpring}
        >
          <motion.button
            className="back-to-top"
            onClick={scrollToTop}
            aria-label="Back to top"
            title="Back to top"
            disabled={isScrolling}
            whileHover={isScrolling ? undefined : { scale: 1.06 }}
            whileTap={isScrolling ? undefined : { scale: 0.94 }}
          >
            <motion.div animate={{ y: 0 }} transition={{ duration: 0.2 }}>
              <FaArrowUp />
            </motion.div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default BackToTop;
