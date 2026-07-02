import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { buildCareerCommits } from "../../utils/careerGitLog";
import { experiences } from "../../data/experience";

const GitCareerTimeline = memo(function GitCareerTimeline({ onSelectExperience }) {
  const navigate = useNavigate();
  const commits = useMemo(() => buildCareerCommits(), []);

  const handleSelect = (exp) => {
    if (!exp) return;
    if (onSelectExperience) {
      onSelectExperience(exp.id);
      return;
    }
    navigate("/experience", { state: { expandId: exp.id } });
  };
  return (
    <section className="border-4 border-outline bg-[var(--color-on-background)] text-[var(--color-background)] p-4 md:p-6 shadow-[8px_8px_0_var(--shadow-color)] font-mono text-xs md:text-sm overflow-x-auto max-w-3xl mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b-2 border-dashed border-[color-mix(in_srgb,var(--color-background)_35%,transparent)] pb-3">
        <p className="font-label-bold uppercase tracking-widest text-[var(--color-accent-electric)]">
          git log --oneline --graph
        </p>
        <p className="text-[10px] uppercase opacity-60 text-right">
          {experiences.length} roles · {commits.length} highlights
          <span className="block normal-case opacity-80">from experience data (not live GitHub)</span>
        </p>
      </div>
      <div className="space-y-0.5">
        {commits.map((commit) => {
          const exp = experiences.find((e) => e.id === commit.expId);
          return (
            <button
              key={commit.id}
              type="button"
              onClick={() => handleSelect(exp)}
              className={`group block w-full text-left px-2 py-1.5 transition-colors border-l-2 border-transparent hover:border-[var(--color-accent-electric)] hover:bg-[color-mix(in_srgb,var(--color-background)_10%,transparent)] ${
                exp ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <span className="text-[var(--color-accent-electric)] opacity-90">
                {(commit.graph || "|").padEnd(4)}
              </span>
              <span className="text-[#7ee787] group-hover:underline">{commit.hash}</span>{" "}
              <span className="opacity-55">({commit.branch})</span>{" "}
              <span className="opacity-95">{commit.msg}</span>
              {commit.meta && (
                <span className="ml-2 opacity-45 hidden sm:inline">- {commit.meta}</span>
              )}
              {exp && (
                <span className="ml-2 text-[10px] uppercase opacity-40 group-hover:opacity-70">
                  ↳ {exp.period}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
});

export default GitCareerTimeline;
