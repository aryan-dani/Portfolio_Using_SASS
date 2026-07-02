import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllSkills } from "../../data/skills";

const TechGlobeFallback = memo(function TechGlobeFallback() {
  const topSkills = useMemo(
    () =>
      getAllSkills()
        .sort(
          (a, b) =>
            (b.projectIds?.length || 0) - (a.projectIds?.length || 0) || b.level - a.level,
        )
        .slice(0, 14),
    [],
  );

  return (
    <div className="relative w-full max-w-[620px] min-h-[280px] sm:min-h-[320px] border-4 border-outline bg-[var(--color-surface)] shadow-[12px_12px_0_var(--shadow-color)] p-4 sm:p-5 flex flex-col gap-4 overflow-hidden">
      <div className="absolute -inset-2 border-4 border-outline bg-hatch pointer-events-none -z-10" />
      <div className="flex items-center justify-between gap-3 border-b-4 border-dashed border-outline pb-3">
        <span className="font-label-bold text-[10px] uppercase tracking-[0.24em] text-[var(--color-on-surface)]">
          Live Stack
        </span>
        <span className="font-label-bold text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          Tap a skill
        </span>
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-2.5 content-start flex-1">
        {topSkills.map((skill) => (
          <Link
            key={skill.id}
            to={`/skills?skill=${encodeURIComponent(skill.id)}`}
            className="border-2 border-outline bg-[var(--color-surface-variant)] px-2.5 py-1.5 font-label-bold text-[10px] sm:text-xs uppercase tracking-wide text-[var(--color-on-surface)] shadow-[2px_2px_0_var(--shadow-color)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-transform"
          >
            {skill.name}
          </Link>
        ))}
      </div>
      <p className="font-body-md text-xs text-[var(--color-text-muted)] border-t-2 border-dashed border-outline pt-3">
        Optimized static view for mobile - full interactive globe on desktop.
      </p>
    </div>
  );
});

export default TechGlobeFallback;
