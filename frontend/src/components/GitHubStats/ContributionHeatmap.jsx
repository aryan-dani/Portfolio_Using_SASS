import { memo, useEffect, useRef, useState } from "react";
import { fetchGitHubContributions } from "../../utils/githubApi";

const LEVEL_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
const LEVEL_COLORS_DARK = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];
const OUTLINE = "#131316";
const WEEKS = 52;
const ROWS = 7;
const CELL = 11;
const GAP = 3;

function ContributionHeatmap() {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let cancelled = false;

    fetchGitHubContributions().then((contributions) => {
      if (cancelled) return;
      setLoading(false);

      if (!contributions.length) {
        setEmpty(true);
        return;
      }

      const isDark = document.documentElement.classList.contains("dark")
        || document.documentElement.classList.contains("crt");
      const palette = isDark ? LEVEL_COLORS_DARK : LEVEL_COLORS;

      const ctx = canvas.getContext("2d");
      const slice = contributions.slice(-WEEKS * ROWS);
      canvas.width = WEEKS * (CELL + GAP);
      canvas.height = ROWS * (CELL + GAP);

      const max = Math.max(...slice.map((c) => c.count || 0), 1);

      slice.forEach((day, i) => {
        const col = Math.floor(i / ROWS);
        const row = i % ROWS;
        const count = day.count || 0;
        let level = 0;
        if (count > 0) {
          const ratio = count / max;
          if (ratio > 0.75) level = 4;
          else if (ratio > 0.5) level = 3;
          else if (ratio > 0.25) level = 2;
          else level = 1;
        }

        const x = col * (CELL + GAP);
        const y = row * (CELL + GAP);
        ctx.fillStyle = palette[level];
        ctx.fillRect(x, y, CELL, CELL);
        ctx.strokeStyle = OUTLINE;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, CELL, CELL);
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center text-center min-h-[120px] justify-center">
        <div className="h-20 w-full max-w-md border-4 border-dashed border-outline-variant bg-[var(--color-surface-variant)] animate-pulse" />
        <p className="mt-2 font-mono text-[10px] uppercase text-[var(--color-text-muted)]">Loading contributions…</p>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="p-4 flex flex-col items-center text-center">
        <p className="font-mono text-xs uppercase text-[var(--color-text-muted)]">
          Contribution data unavailable right now.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center text-center">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto border-2 border-outline"
        aria-label="GitHub contribution heatmap from live data"
      />
      <p className="mt-2 font-mono text-[10px] uppercase text-[var(--color-text-muted)] max-w-md">
        Live contribution grid - cached 10m
      </p>
    </div>
  );
}

export default memo(ContributionHeatmap);
