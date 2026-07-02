import { memo } from "react";
import { motion } from "framer-motion";
import { useAchievements } from "../../context/AchievementContext";
import { usePageSEO } from "../../utils/seo";
import PageHeader from "../../components/PageHeader/PageHeader";
import { containerVariants, cardVariants } from "../../utils/motionVariants";

const Achievements = memo(function Achievements() {
  usePageSEO();
  const { achievements, unlocked, progress } = useAchievements();
  const unlockedSet = new Set(unlocked);

  return (
    <motion.section
      className="flex flex-col gap-10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <PageHeader
        title="Achievements"
        description={`${unlocked.length} / ${achievements.length} unlocked - explore the site like a game.`}
      />

      <div className="border-4 border-outline bg-[var(--color-surface)] p-4 shadow-[6px_6px_0_var(--shadow-color)]">
        <div className="h-4 border-2 border-outline bg-[var(--color-surface-variant)] overflow-hidden">
          <motion.div
            className="h-full bg-[var(--color-primary-container)] origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="mt-2 font-label-bold text-xs uppercase tracking-widest text-[var(--color-text-muted)]">
          Trophy progress {Math.round(progress * 100)}%
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 content-visibility-auto"
        variants={containerVariants}
      >
        {achievements.map((achievement) => {
          const isUnlocked = unlockedSet.has(achievement.id);
          return (
            <motion.article
              key={achievement.id}
              variants={cardVariants}
              className={`border-4 border-outline p-5 shadow-[6px_6px_0_var(--shadow-color)] ${
                isUnlocked
                  ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
                  : "bg-[var(--color-surface)] text-[var(--color-on-surface)] grayscale opacity-70"
              }`}
              style={{ transform: isUnlocked ? `rotate(${achievement.id.length % 3 - 1}deg)` : undefined }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-3xl" aria-hidden="true">{achievement.icon}</span>
                {achievement.secret && (
                  <span className="font-label-bold text-[10px] uppercase border-2 border-current px-2 py-0.5">
                    Secret
                  </span>
                )}
              </div>
              <h2 className="font-headline-md text-xl uppercase mt-3">{achievement.title}</h2>
              <p className="font-body-md text-sm mt-2 opacity-90">{achievement.description}</p>
              <p className="font-label-bold text-[10px] uppercase tracking-widest mt-4 opacity-70">
                {isUnlocked ? "Unlocked" : "Locked"}
              </p>
            </motion.article>
          );
        })}
      </motion.div>
    </motion.section>
  );
});

export default Achievements;
