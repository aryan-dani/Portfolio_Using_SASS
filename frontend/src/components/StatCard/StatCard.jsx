import { useRef, memo } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useCountUp } from "../../hooks/useCountUp";
import { hoverSpring } from "../../utils/motionVariants";

const MotionLink = motion.create(Link);

const cardMotion = {
  initial: false,
  whileHover: {
    y: -3,
    x: -3,
    transition: hoverSpring,
  },
};

function StatCard({ value, isPlus, label, bg, text, shadow, to, compact = false }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const displayVal = useCountUp(typeof value === "number" ? value : parseInt(value), {
    duration: 1600,
    trigger: inView,
  });

  const shadowValue = shadow || "var(--shadow-color)";
  const style = {
    background: bg,
    color: text,
    boxShadow: `4px 4px 0px 0px ${shadowValue}`,
  };

  const hoverShadow = `6px 6px 0px 0px ${shadowValue}`;
  const shellClass = compact
    ? "relative border-4 border-outline px-4 py-2.5 md:py-3 text-center"
    : "relative border-4 border-outline px-4 py-3 md:px-5 md:py-3.5 text-center";

  const valueClass = compact
    ? "font-headline-xl text-2xl md:text-3xl font-black leading-none"
    : "font-headline-xl text-2xl md:text-4xl font-black leading-none";

  const content = compact ? (
    <div className="flex items-baseline justify-center gap-2.5 w-full">
      <div className={valueClass}>
        {displayVal}{isPlus && "+"}
      </div>
      <div className="font-label-bold text-[10px] md:text-xs uppercase opacity-80 tracking-wider">
        {label}
      </div>
    </div>
  ) : (
    <>
      <div className={valueClass}>
        {displayVal}{isPlus && "+"}
      </div>
      <div className="font-label-bold text-[10px] md:text-xs uppercase mt-0.5 opacity-80 tracking-wider">
        {label}
      </div>
    </>
  );

  const openHint = to ? (
    <div className="absolute bottom-1 right-2 font-label-bold text-[9px] uppercase tracking-[0.18em] opacity-0 group-hover:opacity-70 transition-opacity pointer-events-none">
      Open
    </div>
  ) : null;

  if (to) {
    return (
      <MotionLink
        ref={ref}
        to={to}
        className={`block cursor-none group ${shellClass}`}
        style={style}
        {...cardMotion}
        whileHover={{ ...cardMotion.whileHover, boxShadow: hoverShadow }}
        aria-label={`Open ${label}`}
      >
        {content}
        {openHint}
      </MotionLink>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={`block ${shellClass}`}
      style={style}
      {...cardMotion}
      whileHover={{ ...cardMotion.whileHover, boxShadow: hoverShadow }}
    >
      {content}
    </motion.div>
  );
}

export default memo(StatCard);
