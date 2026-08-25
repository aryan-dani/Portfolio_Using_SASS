import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { usePageSEO } from "../../utils/seo";
import { useAchievements } from "../../context/AchievementContext";
import Breakout404 from "../../components/Breakout404/Breakout404";

export default function NotFound() {
  usePageSEO(undefined, "/404");
  const { track } = useAchievements();

  return (
    <motion.section
      className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-6 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="border-4 border-outline bg-[var(--color-primary-container)] px-6 py-4 text-[var(--color-on-primary-container)] shadow-[8px_8px_0_var(--shadow-color)]">
        <h1 className="font-headline-xl text-5xl uppercase md:text-7xl">404</h1>
      </div>
      <div className="w-full max-w-xl border-4 border-outline bg-[var(--color-surface)] p-6 text-left shadow-[6px_6px_0_var(--shadow-color)]">
        <h2 className="font-headline-md text-3xl uppercase text-[var(--color-on-surface)]">
          Page Not Found - Play Breakout Instead
        </h2>
        <p className="mt-4 font-body-lg text-[var(--color-on-surface)]">
          This route does not exist. Move your pointer anywhere on the page, or use the arrow keys. ESC to leave - or clear the bricks.
        </p>
      </div>
      <Breakout404 onScore={() => track("breakout_score")} />
      <nav aria-label="Helpful portfolio links" className="flex flex-wrap justify-center gap-3">
        {[
          ["/", "Return home"],
          ["/projects", "Explore projects"],
          ["/playground", "Open CLI"],
        ].map(([to, label]) => (
          <Link
            key={to}
            to={to}
            className="border-4 border-outline bg-[var(--color-surface)] px-4 py-3 font-label-bold uppercase text-[var(--color-on-surface)] shadow-[4px_4px_0_var(--shadow-color)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            {label}
          </Link>
        ))}
      </nav>
    </motion.section>
  );
}
