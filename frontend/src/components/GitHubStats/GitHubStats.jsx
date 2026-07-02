import { memo, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

const GITHUB_USERNAME = "aryan-dani";

import { containerVariants, itemVariants } from "../../utils/motionVariants";
import ContributionHeatmap from "./ContributionHeatmap";

function ImageWithSkeleton({ src, alt, className = "", imgClassName = "", width = 495, height = 195 }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`flex min-h-[160px] items-center justify-center border-4 border-dashed border-outline-variant bg-[var(--color-surface-variant)] p-4 text-center ${className}`}>
        <span className="font-body-md text-sm text-[var(--color-text-muted)]">
          GitHub stats are temporarily unavailable.
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden flex justify-center items-center ${className}`}>
      {!loaded && (
        <div className="w-full min-h-[160px] bg-[var(--color-surface-variant)] flex items-center justify-center border-4 border-dashed border-outline-variant relative overflow-hidden">
          <div className="absolute inset-0 animate-shimmer opacity-20" />
          <span className="font-mono text-xs uppercase tracking-widest opacity-60 animate-pulse">Loading github stats...</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`${imgClassName} transition-all duration-300 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-95 absolute w-0 h-0"}`}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function GHCard({ header, children, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={`border-4 border-outline shadow-[8px_8px_0px_0px_var(--shadow-color)] overflow-hidden ${className}`}
      style={{ background: "var(--color-surface)" }}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      whileHover={{
        y: -6,
        x: -6,
        boxShadow: "14px 14px 0px 0px var(--shadow-color)",
        transition: { type: "spring", stiffness: 350, damping: 22 },
      }}
    >
      <div className="px-4 py-2.5 font-label-bold text-sm uppercase flex items-center justify-between border-b-4 border-outline bg-[var(--color-surface-variant)] text-[var(--color-on-surface)]">
        {header}
      </div>
      {children}
    </motion.div>
  );
}

const GitHubStats = memo(function GitHubStats() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Build stat image URLs with theme-aware params
  const statsUrl = isDark
    ? `https://github-readme-stats.vercel.app/api?username=${GITHUB_USERNAME}&show_icons=true&count_private=true&hide_border=true&bg_color=ffffff00&title_color=f0ff00&text_color=b0b0c0&icon_color=f0ff00&ring_color=f0ff00`
    : `https://github-readme-stats.vercel.app/api?username=${GITHUB_USERNAME}&show_icons=true&count_private=true&hide_border=true&bg_color=ffffff00&title_color=0d0d0d&text_color=4a4a52&icon_color=5d6300&ring_color=f0ff00`;

  const langsUrl = isDark
    ? `https://github-readme-stats.vercel.app/api/top-langs/?username=${GITHUB_USERNAME}&layout=compact&hide_border=true&bg_color=ffffff00&title_color=f0ff00&text_color=b0b0c0&langs_count=8`
    : `https://github-readme-stats.vercel.app/api/top-langs/?username=${GITHUB_USERNAME}&layout=compact&hide_border=true&bg_color=ffffff00&title_color=0d0d0d&text_color=4a4a52&langs_count=8`;

  const streakUrl = isDark
    ? `https://streak-stats.demolab.com/?user=${GITHUB_USERNAME}&hide_border=true&background=00000000&ring=f0ff00&fire=f0ff00&currStreakNum=f0ff00&sideNums=f0f0f5&currStreakLabel=b0b0c0&sideLabels=b0b0c0&dates=6b6b80`
    : `https://streak-stats.demolab.com/?user=${GITHUB_USERNAME}&hide_border=true&background=00000000&ring=f0ff00&fire=0d0d0d&currStreakNum=0d0d0d&sideNums=0d0d0d&currStreakLabel=5d6300&sideLabels=5d6300&dates=78795f`;

  const trophiesUrl = isDark
    ? `https://github-profile-trophy.vercel.app/?username=${GITHUB_USERNAME}&theme=darkhub&no-bg=true&no-frame=true&column=4&margin-w=8&margin-h=8`
    : `https://github-profile-trophy.vercel.app/?username=${GITHUB_USERNAME}&theme=flat&no-bg=true&no-frame=true&column=4&margin-w=8&margin-h=8`;

  const activityUrl = isDark
    ? `https://github-readme-activity-graph.vercel.app/graph?username=${GITHUB_USERNAME}&bg_color=13131a&color=b0b0c0&line=f0ff00&point=f0f0f5&hide_border=true&area=true&area_color=1e1e2a`
    : `https://github-readme-activity-graph.vercel.app/graph?username=${GITHUB_USERNAME}&bg_color=ffffff&color=4a4a52&line=5d6300&point=0d0d0d&hide_border=true&area=true&area_color=f0f0ee`;

  return (
    <motion.section
      className="flex flex-col gap-8"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      <motion.h2
        className="font-headline-md text-3xl md:text-4xl uppercase border-b-4 border-outline pb-4 text-[var(--color-on-surface)]"
        variants={itemVariants}
      >
        GitHub Activity
      </motion.h2>

      {/* Stats + Languages row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GHCard
          header={
            <>
              <span>Stats Overview</span>
              <span className="opacity-60 text-xs">@{GITHUB_USERNAME}</span>
            </>
          }
        >
          <div className="p-4 flex justify-center items-center min-h-50">
            <ImageWithSkeleton
              src={statsUrl}
              alt="GitHub Stats"
              imgClassName="w-full max-w-[495px] h-auto"
            />
          </div>
        </GHCard>

        <GHCard
          header={
            <>
              <span>Top Languages</span>
              <span className="text-xs opacity-60">By Repo</span>
            </>
          }
        >
          <div className="p-4 flex justify-center items-center min-h-50">
            <ImageWithSkeleton
              src={langsUrl}
              alt="Top Languages"
              imgClassName="w-full max-w-[495px] h-auto"
            />
          </div>
        </GHCard>
      </div>

      {/* Live contribution grid */}
      <GHCard
        header={
          <>
            <span>Contributions Calendar</span>
            <span className="text-xs opacity-60">Live data</span>
          </>
        }
      >
        <ContributionHeatmap />
      </GHCard>

      {/* Activity Graph */}
      <GHCard
        header={
          <>
            <span>Contribution Trend</span>
            <span className="opacity-60 text-xs">Activity Pulse</span>
          </>
        }
      >
        <div
          className="p-4 flex justify-center"
          style={{ background: isDark ? "#13131a" : "var(--color-surface)" }}
        >
          <ImageWithSkeleton
            src={activityUrl}
            alt="Contribution Trend Graph"
            imgClassName="w-full max-w-3xl h-auto"
            width={900}
            height={300}
          />
        </div>
      </GHCard>

      {/* Streak */}
      <GHCard
        header={
          <>
            <span>Contribution Streak</span>
            <span className="text-xs opacity-60">Consistency is key</span>
          </>
        }
      >
        <div className="p-4 flex justify-center">
          <ImageWithSkeleton
            src={streakUrl}
            alt="GitHub Streak"
            imgClassName="w-full max-w-[495px] h-auto"
          />
        </div>
      </GHCard>

      {/* Trophies */}
      <GHCard
        header={
          <>
            <span>Trophies</span>
            <span className="opacity-60 text-xs">Achievements Unlocked</span>
          </>
        }
      >
        <div className="p-4 flex justify-center">
          <ImageWithSkeleton
            src={trophiesUrl}
            alt="GitHub Trophies"
            imgClassName="w-full max-w-3xl h-auto"
            width={900}
            height={220}
          />
        </div>
      </GHCard>

      {/* Profile link */}
      <motion.a
        href={`https://github.com/${GITHUB_USERNAME}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-outline px-6 py-4 font-label-bold text-lg uppercase flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_var(--shadow-accent)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all w-full md:w-fit cursor-none"
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
        View Full GitHub Profile
      </motion.a>
    </motion.section>
  );
});

export default GitHubStats;
