import { memo, useEffect, useRef, useState } from "react";

const WEEKS = 52;
const ROWS = 7;
const CELL = 11;
const GAP = 3;
const OUTLINE = "#131316";

const LEVEL_COLORS = ["#f0f0ee", "#c8c8c4", "#9a9a96", "#6b6b68", "#3a3a36"];
const LEVEL_COLORS_DARK = ["#1a1a1e", "#3a3a40", "#5a5a62", "#7a7a82", "#b0b0b8"];

function ContributionHeatmap({ contributions = [] }) {
  const canvasRef = useRef(null);
  const [empty, setEmpty] = useState(!contributions.length);

  useEffect(() => {
    setEmpty(!contributions.length);
    const canvas = canvasRef.current;
    if (!canvas || !contributions.length) return undefined;

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

    return undefined;
  }, [contributions]);

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
        aria-label="GitHub contribution heatmap from repository commit activity"
      />
      <p className="mt-2 font-mono text-[10px] uppercase text-[var(--color-text-muted)] max-w-md">
        Aggregated from recent public repos · GitHub REST API
      </p>
    </div>
  );
}

export default memo(ContributionHeatmap);
