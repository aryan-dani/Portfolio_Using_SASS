import { memo, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { fetchGitHubDashboard } from "../../utils/githubApi";
import { containerVariants, itemVariants } from "../../utils/motionVariants";
import ContributionHeatmap from "./ContributionHeatmap";

const GITHUB_USERNAME = "aryan-dani";

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

function StatTile({ label, value }) {
  return (
    <div className="border-4 border-outline bg-[var(--color-surface-variant)] px-4 py-8 md:py-10 min-h-[128px] md:min-h-[148px] flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_0px_var(--shadow-color)]">
      <p className="font-headline-md text-3xl md:text-4xl lg:text-5xl leading-none text-[var(--color-on-surface)]">{value}</p>
      <p className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-[var(--color-text-muted)] mt-3">{label}</p>
    </div>
  );
}

function LanguageBars({ languages = [] }) {
  if (!languages.length) {
    return (
      <p className="p-4 font-mono text-xs uppercase text-[var(--color-text-muted)] text-center">
        Language breakdown unavailable.
      </p>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-3">
      {languages.map((lang) => (
        <div key={lang.name}>
          <div className="flex justify-between font-mono text-xs uppercase mb-1">
            <span>{lang.name}</span>
            <span className="text-[var(--color-text-muted)]">{lang.percent}%</span>
          </div>
          <div className="h-3 border-2 border-outline bg-[var(--color-surface-variant)]">
            <div
              className="h-full bg-[var(--color-on-surface)]"
              style={{ width: `${Math.max(lang.percent, 2)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function WeeklyActivityChart({ weeklyCommits = [] }) {
  if (!weeklyCommits.length) {
    return (
      <p className="p-4 font-mono text-xs uppercase text-[var(--color-text-muted)] text-center">
        Weekly activity unavailable.
      </p>
    );
  }

  const max = Math.max(...weeklyCommits, 1);
  const recent = weeklyCommits.slice(-26);

  return (
    <div className="p-4">
      <div className="flex items-end gap-1 h-32 border-b-4 border-outline pb-1">
        {recent.map((count, i) => (
          <div
            key={i}
            className="flex-1 min-w-0 bg-[var(--color-on-surface)] border border-outline"
            style={{ height: `${Math.max((count / max) * 100, count > 0 ? 8 : 2)}%` }}
            title={`${count} commit${count === 1 ? "" : "s"}`}
          />
        ))}
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase text-[var(--color-text-muted)] text-center">
        Last 26 weeks · aggregated repo participation
      </p>
    </div>
  );
}

function StreakPanel({ current = 0, longest = 0, commitsLastYear = 0 }) {
  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatTile label="Current streak" value={`${current}d`} />
      <StatTile label="Longest streak" value={`${longest}d`} />
      <StatTile label="Commits (year)" value={commitsLastYear.toLocaleString()} />
    </div>
  );
}

function LoadingBlock({ label }) {
  return (
    <div className="p-4 flex flex-col items-center min-h-[120px] justify-center">
      <div className="h-20 w-full max-w-md border-4 border-dashed border-outline-variant bg-[var(--color-surface-variant)] animate-pulse" />
      <p className="mt-2 font-mono text-[10px] uppercase text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}

const GitHubStats = memo(function GitHubStats() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchGitHubDashboard().then((data) => {
      if (cancelled) return;
      setLoading(false);
      if (!data) {
        setFailed(true);
        return;
      }
      setDashboard(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const user = dashboard?.user;
  const totals = dashboard?.totals;

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

      {loading && <LoadingBlock label="Fetching GitHub stats (may take a moment on first load)…" />}

      {failed && !loading && (
        <div className="border-4 border-dashed border-outline-variant p-6 text-center bg-[var(--color-surface-variant)]">
          <p className="font-body-md text-sm text-[var(--color-text-muted)]">
            GitHub stats are temporarily unavailable — usually a rate limit. Add <code className="font-mono text-xs">GITHUB_TOKEN</code> to your env vars, restart the dev server, and try again in a few minutes.
          </p>
        </div>
      )}

      {dashboard && (
        <>
          {dashboard.stale && (
            <p className="font-mono text-[10px] uppercase text-[var(--color-text-muted)] text-center -mb-4">
              Showing cached GitHub data while the API cools down.
            </p>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GHCard
              header={
                <>
                  <span>Stats Overview</span>
                  <span className="opacity-60 text-xs">@{user?.login || GITHUB_USERNAME}</span>
                </>
              }
            >
              <div className="p-4 md:p-5 grid grid-cols-2 gap-4 md:gap-5 content-stretch">
                <StatTile label="Public repos" value={user?.publicRepos ?? "—"} />
                <StatTile label="Followers" value={user?.followers ?? "—"} />
                <StatTile label="Stars earned" value={totals?.stars?.toLocaleString() ?? "—"} />
                <StatTile label="Following" value={user?.following ?? "—"} />
              </div>
            </GHCard>

            <GHCard
              header={
                <>
                  <span>Top Languages</span>
                  <span className="text-xs opacity-60">By repo weight</span>
                </>
              }
            >
              <LanguageBars languages={dashboard.languages} />
            </GHCard>
          </div>

          <GHCard
            header={
              <>
                <span>Contributions Calendar</span>
                <span className="text-xs opacity-60">
                  {dashboard.contributionSource === "github-calendar"
                    ? "Matches GitHub profile"
                    : "Repo commit activity"}
                </span>
              </>
            }
          >
            <ContributionHeatmap
              contributions={dashboard.contributions}
              source={dashboard.contributionSource}
            />
          </GHCard>

          <GHCard
            header={
              <>
                <span>Contribution Trend</span>
                <span className="opacity-60 text-xs">Weekly commits</span>
              </>
            }
          >
            <WeeklyActivityChart weeklyCommits={dashboard.weeklyCommits} />
          </GHCard>

          <GHCard
            header={
              <>
                <span>Contribution Streak</span>
                <span className="text-xs opacity-60">From aggregated activity</span>
              </>
            }
          >
            <StreakPanel
              current={totals?.streakCurrent}
              longest={totals?.streakLongest}
              commitsLastYear={totals?.commitsLastYear}
            />
          </GHCard>

          {dashboard.activityRepos?.length > 0 && (
            <p className="font-mono text-[10px] uppercase text-[var(--color-text-muted)] text-center -mt-4">
              Activity from {dashboard.activityRepos.length} recent repos · cached 30m · official GitHub REST API
            </p>
          )}
        </>
      )}

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
