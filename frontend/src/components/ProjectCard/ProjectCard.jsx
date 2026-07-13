import { memo } from "react";
import { motion } from "framer-motion";
import { FaEye, FaGithub } from "react-icons/fa";
import { getAssetPath } from "../../utils/paths";
import { cardVariants } from "../../utils/motionVariants";
import ProgressiveImage from "../ProgressiveImage/ProgressiveImage";

const ProjectCard = memo(function ProjectCard({ project, onOpenModal, index, isHighlighted }) {
  const isFeatured = project.featured || false;
  const eager = typeof index === "number" && index < 3;

  return (
    <motion.div
      variants={cardVariants}
      transition={{ type: "spring", stiffness: 220, damping: 28, delay: (index % 3) * 0.04 }}
      className="w-full h-full"
    >
      <motion.article
        className={`group bg-[var(--color-surface)] border-4 border-outline hover:border-secondary transition-[border-color] duration-300 shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col cursor-none relative overflow-hidden h-full hover-gpu ${
          isHighlighted ? "ring-4 ring-[var(--color-primary-container)] ring-offset-2" : ""
        }`}
        onClick={() => onOpenModal(project)}
        whileHover={{
          y: -6,
          x: -6,
          boxShadow: "16px 16px 0px 0px var(--shadow-color)",
          transition: { type: "spring", stiffness: 300, damping: 20 },
        }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Image */}
        <div className="h-48 md:h-56 border-b-4 border-outline overflow-hidden relative">
          <ProgressiveImage
            src={getAssetPath(project.image)}
            alt={project.imageAlt || `${project.title} project preview by Aryan Dani`}
            width="640"
            height="420"
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : undefined}
            className="h-full w-full"
            imgClassName="w-full h-full gpu-layer"
            hoverScale
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2 z-10">
            <span className="bg-[var(--color-on-background)] text-[var(--color-background)] border-2 border-outline px-2 py-1 font-label-bold text-[10px] uppercase shadow-[2px_2px_0px_0px_var(--shadow-color)]">
              {project.year}
            </span>
            {project.category && (
              <span className="bg-[var(--color-surface)] text-[var(--color-on-surface)] border-2 border-outline px-2 py-1 font-label-bold text-[10px] uppercase shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                {project.category}
              </span>
            )}
          </div>
          {isFeatured && (
            <motion.div
              className="absolute top-3 right-3 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-outline px-3 py-1 font-label-bold text-xs uppercase shadow-[2px_2px_0px_0px_var(--shadow-color)] z-10"
              animate={{ rotate: [3, -3, 3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              Featured
            </motion.div>
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[var(--color-primary-container)] opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none z-[1]" />
        </div>

        {/* Content */}
        <div className="p-6 md:p-7 flex flex-col grow">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="font-headline-md text-xl md:text-2xl text-[var(--color-on-surface)] uppercase">
              {project.title}
            </h3>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenModal(project);
              }}
              className="shrink-0 border-2 border-outline bg-[var(--color-primary-container)] px-3 py-1 font-label-bold text-[10px] uppercase text-[var(--color-on-primary-container)] shadow-[2px_2px_0_var(--shadow-color)] transition-colors hover:bg-[var(--color-surface-variant)] hover:text-[var(--color-on-surface)] focus-visible:bg-[var(--color-surface-variant)] focus-visible:text-[var(--color-on-surface)]"
              aria-label={`Open details for ${project.title}`}
            >
              Details
            </button>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {project.tags.slice(0, 2).map((tag) => (
              <span
                key={`lead-${tag}`}
                className="bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] border-2 border-outline px-2 py-1 font-label-bold text-[10px] uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
          <p
            className="font-body-md text-sm text-[var(--color-text-muted)] mb-5 whitespace-normal"
            style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.slice(2, 5).map((tag) => (
              <span
                key={tag}
                className="bg-[var(--color-on-background)] text-[var(--color-background)] border-2 border-outline px-2 py-1 font-label-bold text-xs uppercase"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 5 && (
              <span className="bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] border-2 border-outline px-2 py-1 font-label-bold text-xs uppercase">
                +{project.tags.length - 5}
              </span>
            )}
          </div>

          <div
            className="flex gap-3 border-t-4 border-outline pt-5 mt-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {project.links?.preview && (
              <a
                href={project.links.preview}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-outline text-center py-2 md:py-3 font-label-bold text-sm uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex justify-center items-center gap-2 cursor-none"
              >
                <FaEye /> Live
              </a>
            )}
            {project.links?.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[var(--color-surface)] text-[var(--color-on-surface)] border-4 border-outline text-center py-2 md:py-3 font-label-bold text-sm uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-[var(--color-surface-variant)] transition-all flex justify-center items-center gap-2 cursor-none"
              >
                <FaGithub /> Source
              </a>
            )}
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
});

export default ProjectCard;
