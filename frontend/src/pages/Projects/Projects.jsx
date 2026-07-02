import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaTimes, FaChevronDown } from "react-icons/fa";
import { projects, projectCategories } from "../../data/projects";
import { containerVariants, cardVariants } from "../../utils/motionVariants";
import { useModalLock } from "../../hooks/useModalLock";
import { usePageSEO } from "../../utils/seo";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import ProjectModal from "../../components/ProjectModal/ProjectModal";
import PageHeader from "../../components/PageHeader/PageHeader";
import { useAchievements } from "../../context/AchievementContext";

function Projects() {
  usePageSEO(useMemo(() => ({ projects }), []));
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm,   setSearchTerm]   = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [highlightedId, setHighlightedId]     = useState(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const navigate = useNavigate();
  const { track } = useAchievements();

  const openProject = useCallback(
    (project) => {
      setSelectedProject(project);
      track("project_modal");
    },
    [track],
  );

  const allTags = useMemo(() => {
    const s = new Set();
    projects.forEach((p) => p.tags.forEach((t) => s.add(t)));
    return Array.from(s);
  }, []);

  useEffect(() => {
    const searchQuery = searchParams.get("search");
    const highlightParam = searchParams.get("highlight");
    if (searchQuery) { setSearchTerm(searchQuery); setSearchParams({}, { replace: true }); }
    if (highlightParam) {
      const id = parseInt(highlightParam, 10);
      const project = projects.find((p) => p.id === id);
      if (project) { openProject(project); setHighlightedId(id); }
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, openProject]);

  useEffect(() => {
    if (highlightedId) {
      const t = setTimeout(() => setHighlightedId(null), 3000);
      return () => clearTimeout(t);
    }
  }, [highlightedId]);

  // Modal scroll-lock + Escape key dismiss (shared hook)
  useModalLock(!!selectedProject, () => setSelectedProject(null));

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesCat  = activeFilter === "all" || p.category === activeFilter;
      const matchesTags = selectedTags.length === 0 || selectedTags.every((t) => p.tags.includes(t));
      const matchesSrch = searchTerm === "" ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCat && matchesTags && matchesSrch;
    });
  }, [searchTerm, activeFilter, selectedTags]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  return (
    <>
      <motion.section
        className="flex flex-col gap-12 md:gap-16 w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <PageHeader
          title="Projects"
          count={filteredProjects.length}
          description="Systems engineered to resist and adapt. Full-stack applications with modern architectures. AI-powered solutions and creative experiments."
        >
          {/* Search + Filters */}
          <motion.div
            className="flex flex-col xl:flex-row gap-6 w-full justify-between items-stretch xl:items-center mt-4"
            variants={cardVariants}
          >
            <div className="flex items-center bg-[var(--color-surface)] border-4 border-outline p-2 w-full xl:w-80 shadow-[4px_4px_0px_0px_var(--shadow-color)] focus-within:shadow-[4px_4px_0px_0px_var(--shadow-accent)] transition-all">
              <FaSearch className="text-xl ml-2 mr-3 text-[var(--color-on-surface)]" />
              <input
                type="text"
                aria-label="Search projects"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none w-full font-body-md text-lg text-[var(--color-on-surface)] cursor-none placeholder:text-[var(--color-text-muted)]"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="mr-2 p-1 hover:bg-[var(--color-primary-container)] transition-colors" aria-label="Clear project search">
                  <FaTimes className="text-[var(--color-on-surface)]" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {projectCategories.map((category) => {
                const isSelected = activeFilter === category.id;
                return (
                  <motion.button
                    key={category.id}
                    className={`border-4 border-outline px-4 py-2 font-label-bold text-sm md:text-base uppercase transition-all cursor-none ${
                      isSelected
                        ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] shadow-[2px_2px_0px_0px_var(--shadow-color)] translate-x-[2px] translate-y-[2px]"
                        : "bg-[var(--color-surface)] text-[var(--color-on-surface)] shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 hover:bg-[var(--color-surface-variant)]"
                    }`}
                    onClick={() => setActiveFilter(category.id)}
                    aria-pressed={isSelected}
                    whileTap={{ scale: 0.97 }}
                  >
                    {category.label}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Tech tag matrix */}
          <motion.div
            className="w-full bg-[var(--color-surface)] border-4 border-outline shadow-[4px_4px_0px_0px_var(--shadow-color)] flex flex-col overflow-hidden"
            variants={cardVariants}
          >
            <div className={`flex items-center justify-between bg-[var(--color-surface)] ${isFilterExpanded ? 'border-b-4 border-outline' : ''}`}>
              <button
                type="button"
                className="flex flex-1 items-center gap-3 px-6 py-4 text-left cursor-pointer"
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                aria-expanded={isFilterExpanded}
                aria-controls="project-tech-filters"
              >
                <span className="font-label-bold text-sm uppercase tracking-wider text-[var(--color-on-surface)]">
                  Filter by Tech Stack {selectedTags.length > 0 && `(${selectedTags.length})`}
                </span>
                <motion.div animate={{ rotate: isFilterExpanded ? 180 : 0 }}>
                  <FaChevronDown className="text-outline" />
                </motion.div>
              </button>
              {selectedTags.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTags([])}
                  className="mr-6 text-xs uppercase font-label-bold text-red-500 hover:underline cursor-none"
                  aria-label="Clear selected project technology filters"
                >
                  Clear
                </button>
              )}
            </div>
            
            <AnimatePresence initial={false}>
              {isFilterExpanded && (
                <motion.div
                  key="content"
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  variants={{
                    open: { opacity: 1, height: "auto" },
                    collapsed: { opacity: 0, height: 0 }
                  }}
                  transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                >
                  <div id="project-tech-filters" className="flex flex-wrap gap-2 px-6 py-4">
                    {allTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <motion.button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          aria-pressed={isSelected}
                          className={`px-3 py-1 text-xs uppercase font-label-bold border-2 border-outline transition-all cursor-none ${
                            isSelected
                              ? "bg-[var(--color-on-background)] text-[var(--color-background)] shadow-[2px_2px_0px_0px_var(--shadow-color)] translate-x-[1px] translate-y-[1px]"
                              : "bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:shadow-none hover:translate-y-0.5 hover:translate-x-0.5 hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)]"
                          }`}
                          whileTap={{ scale: 0.96 }}
                        >
                          {tag}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </PageHeader>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          {filteredProjects.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 overflow-visible p-3 -m-3 content-visibility-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpenModal={openProject}
                  index={index}
                  isHighlighted={highlightedId === project.id}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="bg-[var(--color-surface)] border-4 border-outline shadow-[8px_8px_0px_0px_var(--shadow-color)] p-12 text-center flex flex-col items-center gap-4 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <FaSearch className="text-5xl text-[var(--color-on-surface)]" />
              </motion.div>
              <h3 className="font-headline-md text-3xl uppercase text-[var(--color-on-surface)]">No projects found</h3>
              <p className="font-body-md text-lg text-[var(--color-text-muted)]">Try adjusting your search terms or filters.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onSkillClick={(skillId) => { setSelectedProject(null); navigate(`/skills?skill=${encodeURIComponent(skillId)}`); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default Projects;
