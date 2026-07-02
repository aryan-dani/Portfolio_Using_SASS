import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { itemVariants } from "../../utils/motionVariants";
import { fetchGitHubEvents, parseGitHubEvent, formatRelativeTime } from "../../utils/githubApi";

const TYPE_STYLES = {
  PUSH: { bg: "#7ee787", label: "push" },
  STAR: { bg: "#f0c14b", label: "star" },
  CREATE: { bg: "#79c0ff", label: "new" },
  PR: { bg: "#d2a8ff", label: "pr" },
  ISSUE: { bg: "#ffa657", label: "issue" },
  EVENT: { bg: "#8b949e", label: "event" },
};

const GitHubTicker = memo(function GitHubTicker() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGitHubEvents().then((data) => {
      setEvents(data.map(parseGitHubEvent).filter(Boolean).slice(0, 6));
      setLoading(false);
    });
  }, []);

  return (
    <motion.section
      className="relative -mx-4 md:-mx-8 border-y-4 border-outline bg-[var(--color-surface)] shadow-[inset_0_0_0_1px_var(--color-outline-variant)]"
      variants={itemVariants}
      aria-label="Live GitHub activity"
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-[var(--color-accent-electric)]" aria-hidden="true" />

      <div className="px-4 md:px-8 py-4 md:py-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="flex h-10 w-10 items-center justify-center border-4 border-outline bg-[var(--color-on-background)] text-[var(--color-background)] font-label-bold text-sm shadow-[3px_3px_0_var(--shadow-color)]">
                GH
              </span>
              <span className="absolute -right-1 -top-1 h-3 w-3 border-2 border-outline bg-[#7ee787] animate-pulse" />
            </div>
            <div>
              <p className="font-label-bold text-xs uppercase tracking-[0.22em] text-[var(--color-on-surface)]">
                Live from GitHub
              </p>
              <a
                href="https://github.com/aryan-dani"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-accent-electric)] hover:underline"
              >
                @aryan-dani
              </a>
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase border-2 border-outline px-2 py-1 bg-[var(--color-surface-variant)] text-[var(--color-text-muted)]">
            cached 10m
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 border-4 border-outline border-dashed bg-[var(--color-surface-variant)] animate-pulse"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="font-mono text-xs uppercase text-[var(--color-text-muted)] py-4">
            No recent public events - check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {events.map((ev) => {
              const style = TYPE_STYLES[ev.type] || TYPE_STYLES.EVENT;
              return (
                <a
                  key={ev.id}
                  href={ev.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-2 border-4 border-outline bg-[var(--color-surface-variant)] p-3 shadow-[4px_4px_0_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--shadow-color)] transition-all min-h-[108px]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="font-label-bold text-[9px] uppercase tracking-widest px-2 py-0.5 border-2 border-outline text-[#131316]"
                      style={{ background: style.bg }}
                    >
                      {style.label}
                    </span>
                    <time className="font-mono text-[10px] text-[var(--color-text-muted)]">
                      {formatRelativeTime(ev.time)}
                    </time>
                  </div>
                  <p className="font-label-bold text-xs uppercase text-[var(--color-on-surface)] truncate">
                    {ev.repo}
                  </p>
                  <p className="font-mono text-[11px] leading-snug text-[var(--color-on-surface-variant)] line-clamp-2 group-hover:text-[var(--color-on-surface)]">
                    {ev.summary}
                  </p>
                  {ev.meta && (
                    <p className="font-mono text-[10px] text-[var(--color-text-muted)] truncate">{ev.meta}</p>
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </motion.section>
  );
});

export default GitHubTicker;
