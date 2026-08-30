import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { buildCareerRoles } from "../../utils/careerGitLog";
import { itemVariants } from "../../utils/motionVariants";

const GitCareerTimeline = memo(function GitCareerTimeline({ onSelectExperience }) {
  const navigate = useNavigate();
  const roles = useMemo(() => buildCareerRoles(), []);

  const handleSelect = (id) => {
    if (!id) return;
    if (onSelectExperience) {
      onSelectExperience(id);
      return;
    }
    navigate("/experience", { state: { expandId: id } });
  };

  return (
    <motion.section className="flex flex-col gap-6" variants={itemVariants}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b-4 border-outline pb-4">
        <h2 className="font-headline-md text-3xl md:text-4xl uppercase text-[var(--color-on-surface)]">
          Career Timeline
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
          {roles.length} roles · git-style log
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role, index) => (
          <motion.button
            key={role.id}
            type="button"
            onClick={() => handleSelect(role.id)}
            className="group text-left bg-[var(--color-surface)] border-4 border-outline shadow-[6px_6px_0px_0px_var(--shadow-color)] flex flex-col h-full hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_0px_var(--shadow-color)] transition-all"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: index * 0.08, type: "spring", stiffness: 280, damping: 22 }}
          >
            <div className="flex items-center justify-between gap-3 border-b-4 border-outline bg-[var(--color-surface-variant)] px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-on-surface)] opacity-70">
                {role.branch}
              </span>
              <span className="font-mono text-[10px] uppercase text-[var(--color-text-muted)] whitespace-nowrap">
                {role.current ? "Now · " : ""}
                {role.period}
              </span>
            </div>

            <div className="p-5 flex flex-col flex-1 gap-2">
              <h3 className="font-label-bold text-sm uppercase leading-snug text-[var(--color-on-surface)]">
                {role.position}
              </h3>
              {role.companyUrl ? (
                <a
                  href={role.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body-md text-sm text-[var(--color-on-surface-variant)] hover:underline cursor-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  {role.company}
                </a>
              ) : (
                <p className="font-body-md text-sm text-[var(--color-on-surface-variant)]">
                  {role.company}
                </p>
              )}

              {role.highlight && (
                <p className="mt-auto pt-4 border-t-2 border-dashed border-outline-variant font-mono text-[11px] leading-relaxed text-[var(--color-text-muted)] group-hover:text-[var(--color-on-surface)] transition-colors">
                  <span className="text-[var(--color-on-surface)] opacity-80">{role.highlight.hash}</span>
                  {" "}
                  {role.highlight.msg}
                </p>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <p className="font-mono text-[10px] uppercase text-[var(--color-text-muted)] text-center">
        Click a role to open the full experience · not live GitHub data
      </p>
    </motion.section>
  );
});

export default GitCareerTimeline;
