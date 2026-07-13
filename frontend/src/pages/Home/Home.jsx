import { lazy, memo, Suspense } from "react";
import { motion } from "framer-motion";
import { aboutInfo } from "../../data/experience";
import { portfolioStats } from "../../data/stats";
import TypeWriter from "../../components/TypeWriter/TypeWriter";
import StatCard from "../../components/StatCard/StatCard";
import MagneticLink from "../../components/MagneticLink/MagneticLink";
import { usePageSEO } from "../../utils/seo";
import { containerVariants, itemVariants } from "../../utils/motionVariants";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { MOBILE_LITE_QUERY, FINE_POINTER_QUERY } from "../../utils/device";
import { usePrefetchPortfolioImages } from "../../hooks/usePrefetchPortfolioImages";
import TechGlobeFallback from "../../components/TechGlobe/TechGlobeFallback";

const TechGlobe = lazy(() => import("../../components/TechGlobe/TechGlobe"));

const carouselVariants = {
  hidden:  { opacity: 0, x: 48, scale: 0.97 },
  visible: {
    opacity: 1, x: 0, scale: 1,
    transition: { type: "spring", stiffness: 170, damping: 28, delay: 0.18 },
  },
};

// ─── Data ─────────────────────────────────────────────────────

const roles = ["Web Developer", "AI Engineer", "Agentic AI Builder", "Problem Solver"];

// ─── Page ─────────────────────────────────────────────────────

const Home = memo(function Home() {
  usePageSEO();
  const preferLiteHero = useMediaQuery(MOBILE_LITE_QUERY);
  const showCommandHint = useMediaQuery(FINE_POINTER_QUERY);
  usePrefetchPortfolioImages({ enabled: !preferLiteHero });
  const totalProjects = portfolioStats.projects;
  const totalSkills   = portfolioStats.skills;
  const totalCerts    = portfolioStats.certifications;

  return (
    <motion.section
      className="flex flex-col gap-8 lg:gap-10 w-full relative pb-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero row */}
      <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-center justify-between relative z-10">
        {/* Text content */}
        <div className="flex-1 flex flex-col gap-3.5 lg:gap-4 max-w-2xl w-full z-10">

          {/* Name heading with shimmer */}
          <motion.div variants={itemVariants}>
            <motion.h1
              className="font-headline-xl text-5xl md:text-6xl xl:text-8xl text-[var(--color-on-background)] uppercase leading-none bg-[var(--color-surface)] border-4 border-outline p-3 md:p-4 shadow-[8px_8px_0px_0px_var(--shadow-color)] inline-block w-fit relative overflow-hidden"
              whileHover={{
                x: -2,
                y: -2,
                boxShadow: "12px 12px 0px 0px var(--shadow-color)",
                transition: { type: "spring", stiffness: 400, damping: 20 },
              }}
            >
              <div className="absolute inset-0 animate-shimmer opacity-20 pointer-events-none" />
              {aboutInfo.name}
            </motion.h1>
          </motion.div>

          {/* Role typewriter */}
          <motion.h2
            className="font-headline-md text-lg md:text-2xl text-[var(--color-on-primary-container)] bg-[var(--color-primary-container)] border-4 border-outline p-2 px-4 w-fit shadow-[4px_4px_0px_0px_var(--shadow-color)] uppercase"
            variants={itemVariants}
          >
            <TypeWriter texts={roles} speed={80} deleteSpeed={40} pauseTime={2500} />
          </motion.h2>

          {/* Bio */}
          <motion.p
            className="font-body-lg text-base md:text-lg text-[var(--color-on-surface)] bg-[var(--color-surface)] border-4 border-outline p-3.5 md:p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)] max-w-xl leading-snug"
            variants={itemVariants}
          >
            I build fast, high-contrast web products and AI systems that feel
            sharp, useful, and memorable. Start with the work, search the site,
            or jump straight into the CLI.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-wrap items-center gap-3 mt-1"
            variants={itemVariants}
          >
            <MagneticLink
              to="/projects"
              className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-outline px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-label-bold uppercase shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-200 inline-block animate-pulse-glow"
            >
              View My Work
            </MagneticLink>
            <span className="hidden sm:inline font-label-bold text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              {showCommandHint ? "or press Ctrl/Alt+K" : "or open the menu"}
            </span>
          </motion.div>

        </div>

        {/* Signature 3D showcase */}
        <motion.div
          className="flex-1 w-full flex justify-center lg:justify-end mt-2 lg:mt-0 max-w-[560px] lg:max-w-none mx-auto lg:mx-0"
          variants={carouselVariants}
        >
          <Suspense fallback={<div className="w-full max-w-[560px] min-h-[280px] border-4 border-outline bg-[var(--color-surface)] shadow-[8px_8px_0_var(--shadow-color)]" />}>
            {preferLiteHero ? <TechGlobeFallback /> : <TechGlobe />}
          </Suspense>
        </motion.div>
      </div>

      {/* Stats ribbon */}
      <motion.div
        className="bg-hatch border-4 border-outline p-3 md:p-4 shadow-[4px_4px_0_var(--shadow-color)] w-full"
        variants={itemVariants}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          <StatCard compact to="/projects" value={totalProjects} label="Projects" bg="var(--color-primary-container)" text="var(--color-on-primary-container)" />
          <StatCard compact to="/skills" value={totalSkills} isPlus label="Skills" bg="var(--color-on-background)" text="var(--color-background)" />
          <StatCard compact to="/certifications" value={totalCerts} label="Certifications" bg="var(--color-surface)" text="var(--color-on-surface)" />
        </div>
      </motion.div>
    </motion.section>
  );
});

export default Home;
