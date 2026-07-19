import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useModalLock } from "../../hooks/useModalLock";
import { modalBackdropVariants, modalContentVariants } from "../../utils/motionVariants";
import { FaExternalLinkAlt, FaFileDownload, FaTimes } from "react-icons/fa";
import { aboutInfo } from "../../data/experience";
import { getAssetPath } from "../../utils/paths";

export default function ResumeModal({ isOpen, onClose }) {
  useModalLock(isOpen, onClose);

  const resumePath = getAssetPath(aboutInfo.resumeUrl);
  // Fit width; toolbar off. Interaction is on the outer scroller so the custom cursor stays active
  // (native PDF iframe chrome always forces the OS cursor).
  const embedSrc = `${resumePath}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;

  const handleClose = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    onClose?.();
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 gpu-layer cursor-none">
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-none"
          />

          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-5xl xl:max-w-6xl h-[min(92vh,920px)] bg-[var(--color-surface)] border-4 border-outline shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col z-10 overflow-hidden paint-isolate cursor-none"
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-labelledby="resume-viewer-title"
          >
            <div className="relative z-30 shrink-0 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-b-4 border-outline px-3 sm:px-4 py-3 flex items-center justify-between gap-3 cursor-none">
              <span
                id="resume-viewer-title"
                className="font-headline-md text-sm md:text-base uppercase tracking-wider truncate pointer-events-none"
              >
                DOCUMENT_VIEWER.EXE // RESUME.PDF
              </span>
              <div className="flex items-center gap-2 shrink-0 relative z-40">
                <a
                  href={resumePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open Aryan Dani resume in a new tab"
                  className="bg-[var(--color-surface)] text-[var(--color-on-surface)] border-2 border-outline px-3 py-1.5 font-label-bold text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-none"
                >
                  <FaExternalLinkAlt />
                  <span className="hidden sm:inline">Open</span>
                </a>
                <a
                  href={resumePath}
                  download="Aryan_Dani_Resume.pdf"
                  aria-label="Download Aryan Dani resume PDF"
                  className="bg-[var(--color-surface)] text-[var(--color-on-surface)] border-2 border-outline px-3 py-1.5 font-label-bold text-xs uppercase flex items-center gap-2 shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-none"
                >
                  <FaFileDownload />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  type="button"
                  onClick={handleClose}
                  className="relative z-50 bg-[var(--color-error)] text-[var(--color-on-error)] border-2 border-outline min-w-9 min-h-9 p-1.5 hover:bg-red-600 transition-colors flex items-center justify-center cursor-none"
                  aria-label="Close viewer"
                >
                  <FaTimes className="text-sm pointer-events-none" />
                </button>
              </div>
            </div>

            <div
              className="relative z-0 grow w-full min-h-0 overflow-y-auto overscroll-contain bg-[var(--color-surface-variant)] cursor-none no-scrollbar"
              data-lenis-prevent
            >
              {/*
                PDF plugins always show the OS cursor inside the iframe.
                pointer-events-none keeps hover on this scroller so the site cursor stays.
              */}
              <iframe
                src={embedSrc}
                title="Aryan Dani resume PDF"
                tabIndex={-1}
                className="block w-full border-0 bg-white pointer-events-none min-h-[min(1600px,220vh)] h-[1600px] md:h-[1700px]"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
