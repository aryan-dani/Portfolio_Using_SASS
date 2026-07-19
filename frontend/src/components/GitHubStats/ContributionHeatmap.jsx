import { memo, useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const WEEKS = 53;
const ROWS = 7;
const CELL = 12;
const GAP = 3;
const OUTLINE = "#131316";

const LEVEL_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
const LEVEL_COLORS_DARK = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];
const LEVEL_COLORS_CRT = ["#0a120a", "#0d3d14", "#1a6b24", "#2ebd3a", "#39ff14"];

function ContributionHeatmap({ contributions = [], source = "repo-stats" }) {
  const canvasRef = useRef(null);
  const [empty, setEmpty] = useState(!contributions.length);
  const { theme, crtMode } = useTheme();

  useEffect(() => {
    setEmpty(!contributions.length);
    const canvas = canvasRef.current;
    if (!canvas || !contributions.length) return undefined;

    const isDark = document.documentElement.classList.contains("dark")
      || document.documentElement.classList.contains("crt");
    const palette = crtMode ? LEVEL_COLORS_CRT : isDark ? LEVEL_COLORS_DARK : LEVEL_COLORS;

    const ctx = canvas.getContext("2d");
    const slice = contributions.slice(-WEEKS * ROWS);
    const width = WEEKS * (CELL + GAP);
    const height = ROWS * (CELL + GAP);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

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
      ctx.globalAlpha = isDark || crtMode ? 0.35 : 0.55;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, CELL, CELL);
      ctx.globalAlpha = 1;
    });

    return undefined;
  }, [contributions, theme, crtMode]);

  if (empty) {
    return (
      <div className="p-4 flex flex-col items-center text-center min-h-[140px] justify-center">
        <p className="font-mono text-xs uppercase text-[var(--color-text-muted)]">
          Contribution data unavailable right now.
        </p>
      </div>
    );
  }

  const caption =
    source === "github-calendar"
      ? "Day counts match your GitHub profile · intensity levels are relative"
      : "Aggregated from recent public repos · GitHub REST API";

  return (
    <div className="p-4 md:p-5 flex flex-col items-center gap-3">
      <div className="w-full overflow-x-auto flex justify-center">
        <canvas
          ref={canvasRef}
          className="border-2 border-outline shadow-[3px_3px_0_var(--shadow-color)]"
          aria-label="GitHub contribution heatmap"
        />
      </div>
      <div className="flex items-center gap-2 font-mono text-[9px] uppercase text-[var(--color-text-muted)]">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className="inline-block h-2.5 w-2.5 border border-outline"
            style={{
              background: (crtMode ? LEVEL_COLORS_CRT : theme === "dark" ? LEVEL_COLORS_DARK : LEVEL_COLORS)[level],
            }}
          />
        ))}
        <span>More</span>
      </div>
      <p className="font-mono text-[10px] uppercase text-[var(--color-text-muted)] text-center max-w-lg">
        {caption}
      </p>
    </div>
  );
}

export default memo(ContributionHeatmap);
