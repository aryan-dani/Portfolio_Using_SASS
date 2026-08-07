import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView, useMotionValue } from "framer-motion";
import { isFinePointerDevice } from "../../utils/device";
import { FaSearch, FaTimes, FaExternalLinkAlt, FaArrowRight, FaServer } from "react-icons/fa";
import {
  FaHtml5, FaCss3Alt, FaSass, FaJs, FaReact, FaAngular,
  FaNodeJs, FaPython, FaChartLine, FaBrain, FaRobot, FaGitAlt,
} from "react-icons/fa";
import {
  SiTypescript, SiExpress, SiMongodb, SiTensorflow, SiPytorch,
  SiScikitlearn, SiNextdotjs, SiTailwindcss, SiFastapi, SiFlask,
  SiSupabase, SiOpencv, SiDocker, SiVite, SiFirebase, SiVercel,
  SiRust, SiTauri,
} from "react-icons/si";
import { skills, skillCategories, getSkillById, getSkillCategory } from "../../data/skills";
import { usePageSEO } from "../../utils/seo";
import { getProjectsForSkill, projects } from "../../data/projects";
import { getAssetPath } from "../../utils/paths";
import { containerVariants, cardVariants, hoverSpring, defaultSpring } from "../../utils/motionVariants";
import { useModalLock } from "../../hooks/useModalLock";
import StatCard from "../../components/StatCard/StatCard";
import SkillsGraph from "../../components/SkillsGraph/SkillsGraph";
import PageHeader from "../../components/PageHeader/PageHeader";
import ProgressiveImage from "../../components/ProgressiveImage/ProgressiveImage";

const iconMap = {
  FaHtml5, FaCss3Alt, FaSass, FaJs, FaReact, FaAngular,
  FaNodeJs, FaPython, FaServer, FaChartLine, FaBrain, FaRobot,
  FaEye: FaServer, FaGitAlt,
  SiTypescript, SiExpress, SiMongodb, SiTensorflow, SiPytorch,
  SiScikitlearn, SiNextdotjs, SiTailwindcss, SiFastapi, SiFlask,
  SiSupabase, SiOpencv, SiDocker, SiVite, SiFirebase, SiVercel,
  SiRust, SiTauri,
};

function getProficiencyLabel(level) {
  if (level >= 78) return "Expert";
  if (level >= 65) return "Advanced";
  if (level >= 50) return "Intermediate";
  return "Learning";
}

function getLevelStyle(level) {
  if (level >= 78) return {
    bg: "var(--color-primary-container)", text: "var(--color-on-primary-container)",
    bar: "var(--color-primary-container)",
  };
  if (level >= 65) return {
    bg: "var(--color-on-background)", text: "var(--color-background)",
    bar: "var(--color-on-background)",
  };
  if (level >= 50) return {
    bg: "var(--color-secondary-container)", text: "var(--color-on-secondary-container)",
    bar: "var(--color-secondary-container)",
  };
  return {
    bg: "var(--color-surface-variant)", text: "var(--color-on-surface)",
    bar: "var(--color-surface-variant)",
  };
}

const VIEW_MODES = { GRID: "grid", LIST: "list", GRAPH: "graph" };
const SORT_OPTIONS = [
  { id: "default",       label: "Default" },
  { id: "level-desc",   label: "Highest" },
  { id: "level-asc",    label: "Lowest" },
  { id: "name-asc",     label: "A → Z" },
  { id: "projects-desc",label: "Most Used" },
];

const SKILL_LEVELS_OVERVIEW = [
  { label: "Frontend Dev",        level: 72 },
  { label: "Backend Dev",         level: 62 },
  { label: "AI & Machine Learning", level: 68 },
  { label: "Agentic AI & LLMs",   level: 76 },
  { label: "DevOps & Cloud",       level: 58 },
];

// ── Animated progress bar ─────────────────────────────────────

function AnimatedBar({ level, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="h-6 md:h-8 w-full border-4 border-outline bg-[var(--color-surface)] overflow-hidden">
      <motion.div
        className="h-full w-full progress-bar-fill relative origin-left"
        style={{ background: "var(--color-on-background)", willChange: "transform" }}
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: level / 100 } : {}}
        transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      />
    </div>
  );
}

// ── Skills page ───────────────────────────────────────────────

function Skills() {
  usePageSEO();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm,    setSearchTerm]    = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedSkill,  setSelectedSkill]  = useState(null);
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [sortBy,   setSortBy]   = useState("default");
  const navigate = useNavigate();

  useEffect(() => {
    const skillParam = searchParams.get("skill");
    if (skillParam) {
      let skill = getSkillById(skillParam);
      if (!skill) {
        // Try fuzzy matching by name
        const allSkills = Object.values(skills).flat();
        const paramLower = skillParam.toLowerCase();
        skill = allSkills.find(s => s.name.toLowerCase() === paramLower) || 
                allSkills.find(s => s.name.toLowerCase().includes(paramLower) || paramLower.includes(s.name.toLowerCase()));
      }
      if (skill) { 
        setSelectedSkill(skill); 
        setSearchParams({}, { replace: true }); 
      }
    }
  }, [searchParams, setSearchParams]);

  // Modal scroll-lock + Escape key dismiss (shared hook)
  useModalLock(!!selectedSkill, () => setSelectedSkill(null));

  const filteredAndSorted = useMemo(() => {
    const result = {};
    Object.entries(skills).forEach(([category, categorySkills]) => {
      if (activeCategory === "all" || activeCategory === category) {
        let filtered = categorySkills.filter(
          (s) => {
            if (searchTerm === "") return true;
            const term = searchTerm.toLowerCase();
            const termNoSpace = term.replace(/\s+/g, '');
            const nameLower = s.name.toLowerCase();
            const nameNoSpace = nameLower.replace(/\s+/g, '');
            const descLower = s.description.toLowerCase();
            return nameLower.includes(term) || nameNoSpace.includes(termNoSpace) || descLower.includes(term);
          }
        );
        if (sortBy === "level-desc")   filtered = [...filtered].sort((a, b) => b.level - a.level);
        if (sortBy === "level-asc")    filtered = [...filtered].sort((a, b) => a.level - b.level);
        if (sortBy === "name-asc")     filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        if (sortBy === "projects-desc") filtered = [...filtered].sort((a, b) => (b.projectIds?.length || 0) - (a.projectIds?.length || 0));
        if (filtered.length > 0) result[category] = filtered;
      }
    });
    return result;
  }, [searchTerm, activeCategory, sortBy]);

  const flatSkills = useMemo(() => {
    const all = [];
    Object.entries(filteredAndSorted).forEach(([category, categorySkills]) => {
      const label = skillCategories.find((c) => c.id === category)?.label || category;
      categorySkills.forEach((s) => all.push({ ...s, category: label, categoryId: category }));
    });
    return all;
  }, [filteredAndSorted]);

  const totalSkills = useMemo(() => Object.values(skills).reduce((s, c) => s + c.length, 0), []);
  const avgLevel    = useMemo(() => {
    const all = Object.values(skills).flat();
    return all.length ? Math.round(all.reduce((s, x) => s + x.level, 0) / all.length) : 0;
  }, []);
  const expertCount = useMemo(() => Object.values(skills).flat().filter((s) => s.level >= 78).length, []);

  const getIcon = (iconName) => {
    const Icon = iconMap[iconName] || FaServer;
    return <Icon />;
  };

  return (
    <>
      <motion.div
        className="flex flex-col gap-8 md:gap-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <PageHeader
          title="Skills & Tools"
          description="A chaotic sticker sheet of the technologies I use to build loud, unapologetic digital experiences. Function over form, but make it look cool."
          className="!gap-5 !pb-6 !mb-0 !mt-0"
        />

        {/* Stats Bar */}
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" variants={cardVariants}>
          <StatCard value={totalSkills} label="Total Skills"  bg="var(--color-primary-container)" text="var(--color-on-primary-container)" shadow="var(--shadow-color)" />
          <StatCard value={Object.keys(skills).length} label="Categories"  bg="var(--color-surface)" text="var(--color-on-surface)" shadow="var(--shadow-color)" />
          <StatCard value={avgLevel}    label="Avg Level %"   bg="var(--color-on-background)" text="var(--color-background)" shadow="var(--shadow-accent)" />
          <StatCard value={expertCount} label="Expert Level"  bg="var(--color-secondary)" text="var(--color-on-secondary)" shadow="var(--shadow-color)" />
        </motion.div>

        {/* Controls */}
        <motion.div className="flex flex-col gap-4 bg-hatch border-4 border-outline p-4 md:p-5 shadow-[4px_4px_0px_0px_var(--shadow-color)]" variants={cardVariants}>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center bg-[var(--color-surface)] border-4 border-outline p-2 w-full md:w-96 shadow-[4px_4px_0px_0px_var(--shadow-color)] focus-within:shadow-[4px_4px_0px_0px_var(--shadow-accent)] transition-all">
              <FaSearch className="text-xl ml-2 mr-3 text-[var(--color-on-surface)]" />
              <input
                type="text"
                aria-label="Search skills"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none w-full font-body-md text-lg text-[var(--color-on-surface)] cursor-none placeholder:text-[var(--color-text-muted)]"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="mr-2 p-1 hover:bg-[var(--color-primary-container)] transition-colors" aria-label="Clear skill search">
                  <FaTimes className="text-[var(--color-on-surface)]" />
                </button>
              )}
            </div>
            <div className="flex gap-3">
              {[
                { mode: VIEW_MODES.GRID, label: "▦ Grid" },
                { mode: VIEW_MODES.LIST, label: "☰ List" },
                { mode: VIEW_MODES.GRAPH, label: "◇ Graph" },
              ].map(({ mode, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  aria-pressed={viewMode === mode}
                  className={`px-4 py-2 border-4 border-outline font-label-bold uppercase text-sm shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-none ${
                    viewMode === mode
                      ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
                      : "bg-[var(--color-surface)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {skillCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  aria-pressed={activeCategory === cat.id}
                  className={`px-5 py-2 border-4 border-outline font-label-bold uppercase text-sm md:text-base shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-none ${
                    activeCategory === cat.id
                      ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
                      : "bg-[var(--color-surface)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-label-bold text-sm uppercase text-[var(--color-on-surface)]">Sort:</span>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id)}
                    aria-pressed={sortBy === opt.id}
                    className={`px-3 py-1 border-2 border-outline font-label-bold text-xs uppercase transition-all cursor-none ${
                      sortBy === opt.id
                        ? "bg-[var(--color-on-background)] text-[var(--color-background)]"
                        : "bg-[var(--color-surface)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Skill content */}
        <AnimatePresence mode="wait">
          {viewMode === VIEW_MODES.GRAPH ? (
            <motion.div key="graph" variants={containerVariants} initial="hidden" animate="visible">
              {flatSkills.length > 0 ? (
                <SkillsGraph
                  skills={flatSkills}
                  projects={projects}
                  onSkillClick={(skill) => setSelectedSkill(skill)}
                  onProjectClick={(id) => navigate(`/projects?highlight=${id}`)}
                />
              ) : (
                <EmptyState />
              )}
            </motion.div>
          ) : viewMode === VIEW_MODES.LIST ? (
            <motion.div key="list" className="flex flex-col gap-4 overflow-visible p-3 -m-3" variants={containerVariants} initial="hidden" animate="visible">
              {flatSkills.length > 0
                ? flatSkills.map((skill) => (
                    <SkillListItem key={skill.id} skill={skill} icon={getIcon(skill.icon)} onClick={() => setSelectedSkill(skill)} />
                  ))
                : <EmptyState />}
            </motion.div>
          ) : (
            <motion.div key="grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-visible p-2 -m-2 content-visibility-auto" variants={containerVariants} initial="hidden" animate="visible">
              {flatSkills.length > 0
                ? flatSkills.map((skill) => (
                    <SkillGridCard key={skill.id} skill={skill} icon={getIcon(skill.icon)} onClick={() => setSelectedSkill(skill)} />
                  ))
                : <EmptyState />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skill Levels Overview */}
        <motion.section
          className="bg-[var(--color-surface)] border-4 border-outline p-8 md:p-10 shadow-[8px_8px_0px_0px_var(--shadow-color)]"
          variants={cardVariants}
        >
          <h2 className="font-headline-md text-3xl md:text-4xl uppercase border-b-4 border-outline pb-4 mb-8 text-[var(--color-on-surface)]">
            Skill Levels
          </h2>
          <div className="flex flex-col gap-7">
            {SKILL_LEVELS_OVERVIEW.map((item, i) => {
              const levelStyle = getLevelStyle(item.level);
              return (
                <div key={item.label} className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-label-bold uppercase text-sm md:text-base text-[var(--color-on-surface)]">{item.label}</span>
                    <span className="font-headline-md text-lg md:text-xl text-[var(--color-on-surface)]">{item.level}%</span>
                  </div>
                  <AnimatedBar level={item.level} delay={i * 0.08} color={levelStyle.bar} />
                </div>
              );
            })}
          </div>
        </motion.section>
      </motion.div>

      {/* Skill modal */}
      <AnimatePresence>
        {selectedSkill && (
          <SkillModal
            skill={selectedSkill}
            icon={getIcon(selectedSkill.icon)}
            onClose={() => setSelectedSkill(null)}
            onProjectClick={(id) => { setSelectedSkill(null); navigate(`/projects?highlight=${id}`); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── List Item ─────────────────────────────────────────────────

function SkillListItem({ skill, icon, onClick }) {
  const levelStyle = getLevelStyle(skill.level);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.button
      ref={ref}
      className="w-full text-left bg-[var(--color-surface)] border-2 border-outline p-3 md:p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)] cursor-none group"
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={defaultSpring}
      whileHover={{ y: -3, x: -3, boxShadow: "8px 8px 0px 0px var(--shadow-color)", transition: hoverSpring }}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 w-48 md:w-56 shrink-0">
          <motion.div
            className="text-xl p-2 border-2 border-outline shrink-0"
            style={{ background: "var(--color-on-background)", color: "var(--color-background)" }}
            whileHover={{ scale: 1.15, rotate: 5, boxShadow: "0 0 12px var(--color-on-background)" }}
            transition={hoverSpring}
          >
            {icon}
          </motion.div>
          <div className="min-w-0">
            <h3 className="font-headline-md text-base md:text-lg uppercase truncate text-[var(--color-on-surface)]">{skill.name}</h3>
            <span className="font-label-bold text-[10px] uppercase text-[var(--color-secondary)]">{skill.category}</span>
          </div>
        </div>

        <div className="hidden sm:flex flex-1 items-center gap-4">
          <div className="flex-1 h-3 border-2 border-outline bg-[var(--color-surface)] overflow-hidden">
            <motion.div
              className="h-full w-full progress-bar-fill origin-left"
              style={{ background: "var(--color-on-background)", willChange: "transform" }}
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: skill.level / 100 } : {}}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
          <span className="font-headline-md text-sm md:text-base w-10 text-right text-[var(--color-on-surface)]">{skill.level}%</span>
        </div>

        <div
          className="border-2 border-outline px-2 py-0.5 font-label-bold text-[10px] uppercase shadow-[2px_2px_0px_0px_var(--shadow-color)] shrink-0 ml-auto"
          style={{ background: levelStyle.bg, color: levelStyle.text }}
        >
          {getProficiencyLabel(skill.level)}
        </div>

        <span className="hidden md:block border-2 border-outline bg-[var(--color-surface-variant)] px-2 py-1 font-label-bold text-[10px] uppercase text-[var(--color-on-surface)] shadow-[2px_2px_0_var(--shadow-color)] group-hover:bg-[var(--color-primary-container)] group-hover:text-[var(--color-on-primary-container)] transition-all">
          View
        </span>
      </div>
    </motion.button>
  );
}

// ── Grid Card ─────────────────────────────────────────────────

function SkillGridCard({ skill, icon, onClick }) {
  const levelStyle = getLevelStyle(skill.level);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const handleMouseMove = (e) => {
    if (!isFinePointerDevice() || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    rotateX.set(-(mouseY / (rect.height / 2)) * 5);
    rotateY.set((mouseX / (rect.width / 2)) * 5);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.button
      ref={ref}
      className="w-full text-left bg-[var(--color-surface)] border-2 border-outline p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)] cursor-none group flex flex-col gap-3"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={defaultSpring}
      whileHover={{ y: -4, x: -4, boxShadow: "10px 10px 0px 0px var(--shadow-color)", transition: hoverSpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="text-xl p-2 border-2 border-outline"
            style={{ background: "var(--color-on-background)", color: "var(--color-background)" }}
            whileHover={{ scale: 1.15, boxShadow: "0 0 12px var(--color-on-background)" }}
            transition={hoverSpring}
          >
            {icon}
          </motion.div>
          <div>
            <h3 className="font-headline-md text-base md:text-lg uppercase text-[var(--color-on-surface)]">{skill.name}</h3>
            <span className="font-label-bold text-[10px] uppercase text-[var(--color-secondary)]">{skill.category}</span>
          </div>
        </div>
        <div
          className="border-2 border-outline px-2 py-0.5 font-label-bold text-[10px] uppercase shadow-[2px_2px_0px_0px_var(--shadow-color)]"
          style={{ background: levelStyle.bg, color: levelStyle.text }}
        >
          {getProficiencyLabel(skill.level)}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 border-2 border-outline bg-[var(--color-surface)] overflow-hidden">
          <motion.div
            className="h-full w-full progress-bar-fill origin-left"
            style={{ background: "var(--color-on-background)", willChange: "transform" }}
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: skill.level / 100 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <span className="font-headline-md text-sm w-8 text-right text-[var(--color-on-surface)]">{skill.level}%</span>
      </div>

      <p className="font-body-md text-xs text-[var(--color-text-muted)] overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {skill.description}
      </p>
      <div className="flex items-center gap-2 font-label-bold text-[10px] uppercase text-[var(--color-secondary)] opacity-80 group-hover:opacity-100 transition-opacity mt-auto pt-2 border-t-2 border-dashed border-outline-variant">
        <FaExternalLinkAlt className="text-[10px]" /> Click for details
      </div>
    </motion.button>
  );
}

// ── Empty State ───────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="col-span-full bg-[var(--color-surface)] border-2 border-outline p-6 shadow-[4px_4px_0px_0px_var(--shadow-color)] text-center">
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
        <FaSearch className="text-3xl mx-auto mb-3 text-[var(--color-on-surface)]" />
      </motion.div>
      <h3 className="font-headline-md text-xl uppercase text-[var(--color-on-surface)]">No skills found</h3>
      <p className="font-body-md text-sm mt-2 text-[var(--color-text-muted)]">Try a different search term or category.</p>
    </div>
  );
}

// ── Skill Modal ───────────────────────────────────────────────

function SkillModal({ skill, icon, onClose, onProjectClick }) {
  const category = getSkillCategory(skill.id);
  const relatedProjects = getProjectsForSkill(skill.id);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "color-mix(in srgb, var(--color-background) 75%, transparent)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="bg-[var(--color-surface)] border-4 border-outline shadow-[12px_12px_0px_0px_var(--shadow-color)] max-w-2xl w-full p-6 md:p-8 relative z-10 flex flex-col gap-6 max-h-[90vh] overflow-y-auto overscroll-contain"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-labelledby="skill-modal-title"
        initial={{ scale: 0.93, opacity: 0, y: 28 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ ...defaultSpring, damping: 28 }}
      >
        <button
          onClick={onClose}
          aria-label={`Close ${skill.name} skill details`}
          className="absolute top-3 right-3 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-outline w-10 h-10 flex items-center justify-center text-xl hover:bg-[var(--color-on-background)] hover:text-[var(--color-background)] transition-colors shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none cursor-none"
        >
          <FaTimes />
        </button>

        {/* Icon + Name */}
        <div className="flex items-center gap-5 border-b-2 border-outline pb-5">
          <motion.div
            className="text-3xl p-3 border-2 border-outline shadow-[3px_3px_0px_0px_var(--shadow-accent)]"
            style={{ background: "var(--color-on-background)", color: "var(--color-background)" }}
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={hoverSpring}
          >
            {icon}
          </motion.div>
          <div>
            <h2 id="skill-modal-title" className="font-headline-xl text-2xl md:text-3xl uppercase text-[var(--color-on-surface)]">{skill.name}</h2>
            <span className="font-label-bold bg-[var(--color-secondary)] text-[var(--color-on-secondary)] px-2 py-0.5 text-xs border-2 border-outline inline-block mt-1">{category}</span>
          </div>
        </div>

        {/* Proficiency bar */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between font-label-bold uppercase text-sm text-[var(--color-on-surface)]">
            <span>Proficiency</span>
            <span>{skill.level}% - {getProficiencyLabel(skill.level)}</span>
          </div>
          <div className="h-6 w-full border-2 border-outline bg-[var(--color-surface)] overflow-hidden">
            <motion.div
              className="h-full w-full progress-bar-fill origin-left"
              style={{ background: "var(--color-on-background)", willChange: "transform" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: skill.level / 100 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </div>

        {/* Description */}
        <p className="font-body-md text-base p-4 border-2 border-dashed border-outline-variant text-[var(--color-on-surface)]"
           style={{ background: "var(--color-surface-variant)" }}>
          {skill.description}
        </p>

        {/* Related projects */}
        {relatedProjects.length > 0 && (
          <div className="flex flex-col gap-4">
            <h4 className="font-headline-md text-xl uppercase border-b-2 border-outline inline-block w-fit pb-1 text-[var(--color-on-surface)]">
              Used in {relatedProjects.length} {relatedProjects.length === 1 ? "Project" : "Projects"}
            </h4>
            <div className="flex flex-col gap-3">
              {relatedProjects.map((project) => (
                <motion.button
                  key={project.id}
                  onClick={() => onProjectClick(project.id)}
                  className="bg-[var(--color-surface)] border-2 border-outline p-3 flex items-center gap-4 shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_var(--shadow-color)] group text-left w-full cursor-none"
                  whileHover={{ x: 2, y: 2, transition: { duration: 0.1 } }}
                >
                  <div className="w-14 h-14 border-2 border-outline overflow-hidden shrink-0">
                    <ProgressiveImage
                      src={getAssetPath(project.image)}
                      alt={project.imageAlt || `${project.title} project thumbnail`}
                      width="56"
                      height="56"
                      className="w-full h-full"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-headline-md text-sm uppercase truncate text-[var(--color-on-surface)]">{project.title}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-label-bold text-[10px] text-[var(--color-secondary)] uppercase">{project.year}</span>
                    </div>
                  </div>
                  <FaArrowRight className="text-sm shrink-0 group-hover:translate-x-1 transition-transform text-[var(--color-on-surface)]" />
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}

export default Skills;
