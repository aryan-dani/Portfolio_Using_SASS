import { useState, useRef, useMemo, useEffect, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";import { motion, AnimatePresence, useInView } from "framer-motion";
import { FaChevronDown, FaExternalLinkAlt, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { experiences } from "../../data/experience";
import { containerVariants, hoverSpring, defaultSpring } from "../../utils/motionVariants";
import { usePageSEO } from "../../utils/seo";
import { subscribePortfolioScroll } from "../../utils/smoothScroll";
import PageHeader from "../../components/PageHeader/PageHeader";

const CARD_STYLES = [
  {
    header: { background: "var(--color-on-background)", color: "var(--color-background)" },
    body:   { background: "var(--color-surface)", color: "var(--color-on-surface)" },
    dot:    { background: "var(--color-primary-container)", border: "4px solid var(--color-outline)" },
    tagBg:  { background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" },
    shadow: "var(--shadow-color)",
  },
  {
    header: { background: "var(--color-surface-variant)", color: "var(--color-on-surface)" },
    body:   { background: "var(--color-surface)", color: "var(--color-on-surface)" },
    dot:    { background: "var(--color-on-background)", border: "4px solid var(--color-outline)" },
    tagBg:  { background: "var(--color-on-background)", color: "var(--color-background)" },
    shadow: "var(--shadow-color)",
  },
  {
    header: { background: "var(--color-surface)", color: "var(--color-on-surface)", borderBottom: "4px solid var(--color-outline)" },
    body:   { background: "var(--color-surface)", color: "var(--color-on-surface)" },
    dot:    { background: "var(--color-surface)", border: "4px solid var(--color-outline)" },
    tagBg:  { background: "var(--color-surface-variant)", color: "var(--color-on-surface)" },
    shadow: "var(--shadow-color)",
  },
];

// ── Shared card content (header + expandable body) ─────────────────────────
// Previously this was copy-pasted verbatim for the "even" and "odd" column branches.

function CardContent({ exp, style, isExpanded, onToggle }) {
  const navigate = useNavigate();
  return (
    <motion.div
      className="w-full border-4 border-outline overflow-hidden"
      style={{ boxShadow: `8px 8px 0px 0px ${style.shadow}` }}
      whileHover={{
        y: -4,
        x: -4,
        boxShadow: `14px 14px 0px 0px ${style.shadow}`,
        transition: hoverSpring,
      }}
    >
      <button
        className="w-full p-5 md:p-6 flex justify-between items-start gap-3 group cursor-none"
        style={style.header}
        onClick={() => onToggle(exp.id)}
      >
        <div className="text-left">
          <h2 className="font-headline-md text-xl md:text-2xl lg:text-3xl uppercase">{exp.position}</h2>
          <h3 className="font-label-bold text-sm uppercase mt-1 flex items-center gap-2 flex-wrap">
            {exp.companyUrl ? (
              <a
                href={exp.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-75 inline-flex items-center gap-1.5 hover:underline cursor-none"
                onClick={(e) => e.stopPropagation()}
              >
                {exp.company}
                <FaExternalLinkAlt className="text-[10px]" />
              </a>
            ) : (
              <span className="opacity-75">{exp.company}</span>
            )}
            {exp.current && (
              <span className="inline-block border-2 border-current px-1.5 py-0.5 text-[9px] tracking-[0.14em]">
                Now
              </span>
            )}
          </h3>
          <div className="md:hidden mt-2 flex items-center gap-2 opacity-60 text-xs font-label-bold uppercase">
            <FaCalendarAlt />
            {exp.period}
            {exp.location && <><FaMapMarkerAlt />{exp.location}</>}
          </div>
        </div>
        <motion.div
          className="shrink-0 w-8 h-8 border-4 border-current flex items-center justify-center mt-1"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ ...defaultSpring, damping: 28 }}
        >
          <FaChevronDown className="text-sm" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            style={style.body}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ ...defaultSpring, damping: 32 }}
            className="overflow-hidden"
          >
            <div className="p-5 md:p-6 border-t-4 border-outline flex flex-col gap-5">
              <p className="font-body-md text-base leading-relaxed text-[var(--color-on-surface-variant)]">
                {exp.description}
              </p>
              {exp.responsibilities && (
                <ul className="flex flex-col gap-3">
                  {exp.responsibilities.map((r, i) => (
                    <motion.li
                      key={i}
                      className="font-body-md text-sm md:text-base flex items-start gap-3 text-[var(--color-on-surface)]"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <span
                        className="shrink-0 mt-1.5 w-5 h-5 border-2 border-outline flex items-center justify-center font-bold text-xs select-none"
                        style={{ background: "var(--color-on-background)", color: "var(--color-primary-container)" }}
                      >
                        →
                      </span>
                      <span className="grow leading-relaxed" dangerouslySetInnerHTML={{ __html: r }} />
                    </motion.li>
                  ))}
                </ul>
              )}
              {exp.technologies && (
                <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-dashed border-outline-variant">
                  {exp.technologies.map((tech, techIdx) => (
                    <motion.button
                      key={tech}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/skills?skill=${encodeURIComponent(tech)}`);
                      }}
                      className="px-3 py-1 font-label-bold text-xs uppercase border-2 border-outline shadow-[2px_2px_0px_0px_var(--shadow-color)]"
                      style={style.tagBg}
                      whileHover={{
                        y: -4,
                        rotate: techIdx % 2 === 0 ? 2 : -2,
                        boxShadow: "4px 4px 0px 0px var(--shadow-color)",
                      }}
                      transition={defaultSpring}
                    >
                      {tech}
                    </motion.button>
                  ))}
                </div>
              )}
              {exp.links?.project && (
                <a
                  href={exp.links.project}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start flex items-center gap-2 font-label-bold text-xs uppercase border-4 border-outline px-4 py-2 shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-none"
                  style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}
                >
                  <FaExternalLinkAlt /> View Project
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Period / Location badge ────────────────────────────────────────────────

function PeriodBadge({ exp, alignRight = false }) {
  return (
    <motion.div
      className="inline-block border-4 border-outline px-4 py-3 shadow-[4px_4px_0px_0px_var(--shadow-color)]"
      style={{ background: "var(--color-on-background)", color: "var(--color-background)" }}
      whileHover={{
        y: -3,
        x: alignRight ? 3 : -3,
        boxShadow: "8px 8px 0px 0px var(--shadow-color)",
        transition: hoverSpring,
      }}
    >
      <p className="font-headline-md text-lg uppercase">
        {exp.period}
        {exp.current && (
          <span className="ml-2 align-middle inline-block border-2 border-current px-1.5 py-0.5 text-[9px] tracking-[0.14em]">
            Now
          </span>
        )}
      </p>
      {exp.location && (
        <p className={`font-body-md text-sm flex items-center gap-1.5 mt-1 opacity-70 ${alignRight ? "justify-end" : "justify-start"}`}>
          <FaMapMarkerAlt className="text-xs" />
          {exp.location}
        </p>
      )}
    </motion.div>
  );
}

// ── Experience Card (timeline row) ────────────────────────────────────────

function ExperienceCard({ exp, index, isExpanded, onToggle }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const style = CARD_STYLES[index % CARD_STYLES.length];
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      key={exp.id}
      className="relative z-10 w-full mb-10 md:mb-16 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)] md:gap-x-10 items-start gap-4 overflow-visible"
      data-timeline-origin={index === 0 ? "true" : undefined}
      initial={{ opacity: 0, x: isEven ? -60 : 60 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ ...defaultSpring, delay: index * 0.05 }}
    >
      {isEven ? (
        <>
          <div className="md:pr-6">
            <CardContent exp={exp} style={style} isExpanded={isExpanded} onToggle={onToggle} />
          </div>
          <TimelineDot index={index} inView={inView} isExpanded={isExpanded} style={style} />
          <div className="hidden md:flex justify-start pl-2 pt-8">
            <PeriodBadge exp={exp} alignRight={false} />
          </div>
        </>
      ) : (
        <>
          <div className="hidden md:flex justify-end pr-2 pt-8">
            <PeriodBadge exp={exp} alignRight />
          </div>
          <TimelineDot index={index} inView={inView} isExpanded={isExpanded} style={style} />
          <div className="md:pl-6">
            <CardContent exp={exp} style={style} isExpanded={isExpanded} onToggle={onToggle} />
          </div>
        </>
      )}
    </motion.div>
  );
}

function TimelineDot({ index, inView, isExpanded, style }) {
  return (
    <div className="hidden md:flex justify-center pt-8 z-20">
      <div className="relative">
        <motion.div
          className="w-8 h-8 border-4 border-outline relative z-10"
          style={style.dot}
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ ...defaultSpring, delay: index * 0.05 + 0.15 }}
        />
        {inView && (
          <motion.div
            className="absolute inset-0 border-4 border-primary-container pointer-events-none"
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: index * 0.05 + 0.3 }}
          />
        )}
        {isExpanded && (
          <motion.div
            className="absolute inset-0 border-4 border-outline pointer-events-none"
            animate={{ scale: [1, 2.2, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>
    </div>
  );
}

function Experience() {
  const seoData = useMemo(() => ({ experiences }), []);
  usePageSEO(seoData);
  const location = useLocation();
  const [expandedId, setExpandedId] = useState(experiences[0]?.id || null);
  const containerRef = useRef(null);
  const timelineFillRef = useRef(null);

  useEffect(() => {
    const updateProgress = () => {
      const section = containerRef.current;
      const fill = timelineFillRef.current;
      if (!section || !fill) return;

      const originEl = section.querySelector("[data-timeline-origin]");
      const track = fill.parentElement;
      const originTop = originEl ? originEl.offsetTop + 32 : 32;
      if (track) track.style.top = `${originTop}px`;

      const originBox = originEl?.getBoundingClientRect();
      const sectionBox = section.getBoundingClientRect();
      const start = originBox ? originBox.top + 32 : sectionBox.top + originTop;
      const end = sectionBox.bottom;
      const readLine = window.innerHeight * 0.4;
      const raw = (readLine - start) / Math.max(end - start, 1);
      // Always light the current (top) role a little; grow downward through older roles.
      const progress = Math.min(1, Math.max(0.14, raw));
      fill.style.transform = `scaleY(${progress})`;
    };

    const unsubscribe = subscribePortfolioScroll(updateProgress);
    updateProgress();
    return unsubscribe;
  }, []);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  useEffect(() => {
    const expandId = location.state?.expandId;
    if (expandId) setExpandedId(expandId);
  }, [location.state]);

  return (
    <motion.div
      className="flex flex-col gap-12 md:gap-16 relative"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <PageHeader
        title="Experience"
        description="Newest work first. Current role on top, then the trail that got me here."
        className="mb-8"
      />

      <section className="relative py-8 w-full" ref={containerRef}>
        {/* Timeline track */}
        <div
          className="absolute left-5 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-0.5 md:w-2 z-0"
          style={{ background: "var(--color-outline-variant)" }}
        />
        <div className="absolute left-5 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-0.5 md:w-2 z-0 overflow-hidden">
          <div
            ref={timelineFillRef}
            className="h-full w-full origin-top"
            style={{
              transform: "scaleY(0)",
              background: "linear-gradient(to bottom, var(--color-outline), var(--color-secondary))",
              willChange: "transform",
            }}
          />
        </div>

        {experiences.map((exp, index) => (
          <ExperienceCard
            key={exp.id}
            exp={exp}
            index={index}
            isExpanded={expandedId === exp.id}
            onToggle={toggleExpand}
          />
        ))}
      </section>
    </motion.div>
  );
}

export default memo(Experience);
