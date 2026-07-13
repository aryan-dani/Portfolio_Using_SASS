import { useState, useMemo, useRef, memo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { FaSearch, FaTimes, FaEye, FaExternalLinkAlt } from "react-icons/fa";
import { certifications, certificationCategories } from "../../data/certifications";
import { getAssetPath } from "../../utils/paths";
import { containerVariants, cardVariants } from "../../utils/motionVariants";
import { useModalLock } from "../../hooks/useModalLock";
import { usePageSEO } from "../../utils/seo";
import PageHeader from "../../components/PageHeader/PageHeader";
import ProgressiveImage from "../../components/ProgressiveImage/ProgressiveImage";

function Certifications() {
  const seoData = useMemo(() => ({ certifications }), []);
  usePageSEO(seoData);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [previewImage, setPreviewImage] = useState(null);

  const filteredCerts = useMemo(() =>
    certifications.filter((cert) => {
      const matchesCategory = activeFilter === "all" || cert.category === activeFilter;
      const matchesSearch =
        searchTerm === "" ||
        cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    }),
    [searchTerm, activeFilter]
  );

  // Modal scroll-lock + Escape key dismiss (shared hook)
  useModalLock(!!previewImage, () => setPreviewImage(null));


  return (
    <>
      <motion.section
        className="flex flex-col gap-6 w-full mt-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <PageHeader
          title="Certifications"
          count={filteredCerts.length}
          description="Proof of work - industry-recognized credentials across AI, cloud, and web technologies."
        />

        {/* Controls */}
        <div className="bg-hatch border-4 border-outline p-4 md:p-6 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between w-full">
            {/* Search */}
            <motion.div
              className="flex items-center bg-[var(--color-surface)] border-4 border-outline p-3 w-full md:w-80 shadow-[4px_4px_0px_0px_var(--shadow-color)] focus-within:shadow-[4px_4px_0px_0px_var(--shadow-accent)] transition-all"
              variants={cardVariants}
            >
              <FaSearch className="text-xl ml-2 mr-3 text-[var(--color-on-surface)]" />
              <input
                type="text"
                aria-label="Search certifications"
                placeholder="Search certifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none w-full font-body-md text-base text-[var(--color-on-surface)] cursor-none placeholder:text-[var(--color-text-muted)]"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="mr-1 p-1 hover:bg-[var(--color-primary-container)] transition-colors">
                  <FaTimes className="text-[var(--color-on-surface)]" />
                </button>
              )}
            </motion.div>

            {/* Filters */}
            <motion.div className="flex flex-wrap gap-2.5" variants={cardVariants}>
              {certificationCategories.map((cat) => (
                <motion.button
                  key={cat.id}
                  onClick={() => setActiveFilter(cat.id)}
                  className={`border-4 border-outline px-4 py-2 font-label-bold text-xs uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-none ${
                    activeFilter === cat.id
                      ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] translate-x-[2px] translate-y-[2px] shadow-[2px_2px_0px_0px_var(--shadow-color)]"
                      : "bg-[var(--color-surface)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)]"
                  }`}
                  whileTap={{ scale: 0.97 }}
                >
                  {cat.label}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          {filteredCerts.length > 0 ? (
            <motion.div
              key={activeFilter + searchTerm}
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 overflow-visible p-3 -m-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredCerts.map((cert, index) => (
                <CertCard
                  key={cert.id}
                  cert={cert}
                  index={index}
                  onPreview={() => setPreviewImage({ src: cert.image, title: cert.title })}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="bg-[var(--color-surface)] border-4 border-outline p-12 text-center shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col items-center gap-4 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <FaSearch className="text-5xl text-[var(--color-on-surface)]" />
              </motion.div>
              <h3 className="font-headline-md text-3xl uppercase text-[var(--color-on-surface)]">No certifications found</h3>
              <p className="font-body-md text-lg text-[var(--color-text-muted)]">Try adjusting your search or filter.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <ImagePreviewModal
            src={previewImage.src}
            title={previewImage.title}
            onClose={() => setPreviewImage(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Cert Card ─────────────────────────────────────────────────

const CertCard = memo(function CertCard({ cert, index, onPreview }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      layout
      variants={cardVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: (index % 3) * 0.05 }}
      className="w-full h-full"
    >
      <motion.article
        className="bg-[var(--color-surface)] border-4 border-outline shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col group hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[16px_16px_0px_0px_var(--shadow-color)] transition-all duration-200 h-full"
      >
        {/* Image Container */}
        <button
          type="button"
          className="aspect-[4/3] w-full border-b-4 border-outline overflow-hidden relative cursor-pointer bg-[var(--color-surface)] flex items-center justify-center p-3 text-left"
          onClick={onPreview}
          aria-label={`Preview certificate image for ${cert.title}`}
        >
          <ProgressiveImage
            src={getAssetPath(cert.image)}
            alt={cert.imageAlt || `${cert.title} certificate issued by ${cert.issuer}`}
            width="640"
            height="480"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            loading={index < 3 ? "eager" : "lazy"}
            fetchPriority={index < 3 ? "high" : undefined}
            className="w-full h-full"
            objectFit="contain"
            hoverScale
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <FaEye className="text-white text-3xl" />
          </div>
          <div className="absolute left-4 top-4 bg-[var(--color-surface)] text-[var(--color-on-surface)] border-2 border-outline px-2 py-1 font-label-bold text-[10px] uppercase shadow-[2px_2px_0_var(--shadow-color)] z-10">
            Click to preview
          </div>
          
          {/* Category badge */}
          {cert.badge && (
            <div className="absolute top-4 right-4 bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] border-4 border-outline px-3 py-1 font-label-bold text-xs md:text-sm uppercase shadow-[2px_2px_0px_0px_var(--shadow-color)] z-10">
              {cert.badge}
            </div>
          )}
        </button>

        {/* Content */}
        <div className="p-6 md:p-8 flex flex-col grow">
          {/* Date badge */}
          <span className="font-label-bold text-sm md:text-base text-[var(--color-secondary)] uppercase tracking-widest mb-2 border-2 border-outline w-fit px-2.5 py-1 shadow-[2px_2px_0px_0px_var(--shadow-color)] bg-[var(--color-surface)]">
            {cert.date}
          </span>
          
          <h3 className="font-headline-md text-2xl md:text-3xl text-[var(--color-on-surface)] mb-4 uppercase mt-2 leading-tight">
            {cert.title}
          </h3>
          
          <p className="font-body-md text-base text-[var(--color-on-surface)] mb-6 grow leading-relaxed">
            {cert.description}
          </p>

          {/* Tech Stack / Issuer Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t-4 border-outline pt-4 mb-6 gap-4 sm:gap-0">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 rounded-full border-2 border-outline overflow-hidden bg-white shrink-0"
                initial={{ scale: 0.4, y: 8 }}
                animate={inView ? { scale: 1, y: 0 } : {}}
                transition={{ type: "spring", stiffness: 350, damping: 15, delay: (index % 3) * 0.05 + 0.25 }}
              >
                <img
                  src={cert.issuerLogo}
                  alt={`${cert.issuer} logo`}
                  width="40"
                  height="40"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain p-1"
                />
              </motion.div>
              <span className="font-label-bold text-sm md:text-base uppercase text-[var(--color-on-surface)]">
                {cert.issuer}
              </span>
            </div>
            <span className="font-label-bold text-xs bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] border-2 border-outline px-2 py-1 shadow-[2px_2px_0px_0px_var(--shadow-color)] text-center">
              {cert.tag || "Credential"}
            </span>
          </div>

          {/* Action Button */}
          {cert.link && cert.link !== "#" ? (
            <a
              href={cert.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-outline text-center py-3 font-label-bold text-sm md:text-base uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex justify-center items-center gap-2 cursor-none"
            >
              <FaExternalLinkAlt className="text-sm" />
              View Certificate
            </a>
          ) : (
            <button
              onClick={onPreview}
              className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-outline text-center py-3 font-label-bold text-sm md:text-base uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex justify-center items-center gap-2 w-full cursor-none"
            >
              <FaEye className="text-sm" />
              View Certificate
            </button>
          )}
        </div>
      </motion.article>
    </motion.div>
  );
});

// ── Image Preview Modal ───────────────────────────────────────

const ImagePreviewModal = memo(function ImagePreviewModal({ src, title, onClose }) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <motion.div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "color-mix(in srgb, var(--color-background) 80%, transparent)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative z-10 border-8 border-outline shadow-[16px_16px_0px_0px_var(--shadow-color)] max-w-5xl w-full"
        style={{ background: "var(--color-surface)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="certificate-preview-title"
        initial={{ scale: 0.88, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
      >
        {/* Header bar */}
        <div
          className="flex justify-between items-center px-5 py-3 border-b-4 border-outline"
          style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}
        >
          <span id="certificate-preview-title" className="font-headline-md text-base uppercase">{title}</span>
          <button
            className="border-4 border-outline w-9 h-9 flex items-center justify-center font-black hover:translate-x-0.5 hover:translate-y-0.5 transition-transform cursor-none"
            style={{ background: "var(--color-on-primary-container)", color: "var(--color-primary-container)" }}
            onClick={onClose}
            aria-label="Close preview"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-2 md:p-4 bg-white flex justify-center items-center min-h-[200px]">
          <ProgressiveImage
            src={getAssetPath(src)}
            alt={`${title} certificate full preview`}
            width="1200"
            height="900"
            loading="eager"
            fetchPriority="high"
            className="w-full max-h-[75vh]"
            imgClassName="w-full h-auto max-h-[75vh]"
            objectFit="contain"
          />
        </div>
      </motion.div>
    </div>,
    document.body
  );
});

export default Certifications;
