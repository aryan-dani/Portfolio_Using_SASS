import { useState, useEffect, useRef, memo, lazy, Suspense, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope, FaFileDownload, FaPaperPlane, FaChevronDown, FaCheck, FaCopy, FaEye,
} from "react-icons/fa";
import { aboutInfo, socialLinks } from "../../data/experience";
import { useToast } from "../../context/ToastContext";
import { getAssetPath } from "../../utils/paths";
import { containerVariants, itemVariants } from "../../utils/motionVariants";
import { socialIconMap } from "../../utils/socialIcons";
import PageHeader from "../../components/PageHeader/PageHeader";
import { usePageSEO } from "../../utils/seo";

const ResumeModal = lazy(() => import("../../components/ResumeModal/ResumeModal"));

const SUBJECT_OPTIONS = [
  "Freelance Project", "Collaboration", "Job Opportunity",
  "Open Source", "Just Saying Hi",
];

const FAQ_ITEMS = [
  {
    q: "What's your primary tech stack?",
    a: "React / Next.js for frontend, FastAPI / Node.js for backend, and Google Gemini / LangGraph for AI agents. I'm comfortable with TypeScript, Python, Supabase, Docker, and Vercel.",
  },
  {
    q: "Do you freelance?",
    a: "Yes! I'm open to freelance projects, especially full-stack web apps and AI-powered tools. Let's discuss your idea - I'd love to hear about it.",
  },
  {
    q: "What's your typical response time?",
    a: "I usually respond within 24 hours. For urgent projects, mention it in the subject and I'll prioritize.",
  },
  {
    q: "Can you work with a team?",
    a: "Absolutely. I've collaborated with cross-functional teams at Artem HealthTech and in hackathons like NASA Space Apps and RIFT 2026.",
  },
];

const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || "/api/contact";

// ── Confetti burst on submit ──────────────────────────────────

function ConfettiBurst({ active }) {
  const colors = ["#f0f0f0", "#a0a0a0", "#606060", "#2a2a2a", "#ffffff", "#777777", "#e0e0e0", "#333333"];
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 confetti-particle"
          style={{
            background: colors[i % colors.length],
            left: `${50 + (Math.random() - 0.5) * 100}%`,
            top: "50%",
          }}
          initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
          animate={{
            y: -(Math.random() * 120 + 40),
            x: (Math.random() - 0.5) * 160,
            opacity: 0,
            scale: [1, 1.5, 0],
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 0.8 + Math.random() * 0.4, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function Contact() {
  const faqData = useMemo(() => ({ faqItems: FAQ_ITEMS }), []);
  usePageSEO(faqData);

  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const { showToast } = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = CONTACT_ENDPOINT;
      const payload = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject || "Portfolio Contact",
        message: formData.message,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success === true) {
        setSubmitted(true);
        setShowConfetti(true);
        showToast("Message sent successfully!", "success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error(result.message || result.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      showToast(error.message || "Direct send failed. Please try again in a moment.", "error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => { setSubmitted(false); setShowConfetti(false); }, 3500);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(aboutInfo.email);
    setEmailCopied(true);
    showToast("Email copied to clipboard!", "success");
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <motion.section
      className="flex flex-col gap-16 md:gap-20 w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero */}
      <PageHeader
        title="Let's Build"
        description="Got a project idea? Want to collaborate? Or just want to geek out about tech and anime? I'm all ears. Drop me a message and let's build something epic."
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
        {/* Contact Form */}
        <motion.div className="lg:col-span-3 flex flex-col gap-8" variants={itemVariants}>
          <div
            className="border-4 border-outline p-6 md:p-8 shadow-[8px_8px_0px_0px_var(--shadow-color)]"
            style={{ background: "var(--color-surface)" }}
          >
            <h2 className="font-headline-md text-3xl uppercase mb-6 border-b-4 border-outline pb-4 flex items-center gap-3 text-[var(--color-on-surface)]">
              <FaPaperPlane className="text-2xl" />
              Send a Message
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { id: "contact-name",  name: "name",  type: "text",  label: "Your Name *",  placeholder: "Aryan Dani",         required: true },
                  { id: "contact-email", name: "email", type: "email", label: "Your Email *", placeholder: "aryan@example.com", required: true },
                ].map((field) => (
                  <div key={field.id} className="flex flex-col gap-2">
                    <label htmlFor={field.id} className="font-label-bold uppercase text-sm text-[var(--color-on-surface)]">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      id={field.id}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="border-4 border-outline p-4 font-body-md text-lg focus:outline-none focus:border-outline shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all duration-200 cursor-none"
                      style={{ background: "var(--color-surface-variant)", color: "var(--color-on-surface)" }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2" ref={dropdownRef}>
                <label id="subject-label" className="font-label-bold uppercase text-sm text-[var(--color-on-surface)]">
                  What&apos;s this about?
                </label>
                <div className="relative">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-haspopup="listbox"
                    aria-expanded={isDropdownOpen}
                    aria-labelledby="subject-label"
                    aria-controls="contact-subject-options"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsDropdownOpen(!isDropdownOpen);
                      }
                    }}
                    className="w-full border-4 border-outline p-4 font-body-md text-lg shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:shadow-[6px_6px_0px_0px_var(--shadow-color)] transition-all duration-200 cursor-none flex justify-between items-center bg-[var(--color-surface-variant)] text-[var(--color-on-surface)]"
                  >
                    <span className={formData.subject ? "opacity-100" : "opacity-60"}>
                      {formData.subject || "Select a topic..."}
                    </span>
                    <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }}>
                      <FaChevronDown className="text-[var(--color-on-surface)]" />
                    </motion.div>
                  </div>
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        role="listbox"
                        id="contact-subject-options"
                        aria-labelledby="subject-label"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 border-4 border-outline shadow-[8px_8px_0px_0px_var(--shadow-color)] z-50 bg-[var(--color-surface)] flex flex-col"
                      >
                        {SUBJECT_OPTIONS.map((opt) => (
                          <div
                            key={opt}
                            role="option"
                            aria-selected={formData.subject === opt}
                            tabIndex={0}
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, subject: opt }));
                              setIsDropdownOpen(false);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setFormData((prev) => ({ ...prev, subject: opt }));
                                setIsDropdownOpen(false);
                              }
                            }}
                            className="p-4 font-body-md text-lg hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)] text-[var(--color-on-surface)] transition-colors cursor-none border-b-2 border-transparent hover:border-outline last:border-b-0 focus:outline-none focus:bg-[var(--color-primary-container)] focus:text-[var(--color-on-primary-container)]"
                          >
                            {opt}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="contact-message" className="font-label-bold uppercase text-sm text-[var(--color-on-surface)]">
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project, idea, or just say hi..."
                  rows="6"
                  required
                  className="border-4 border-outline p-4 font-body-md text-lg focus:outline-none focus:border-outline shadow-[2px_2px_0px_0px_var(--shadow-color)] focus:shadow-[6px_6px_0px_0px_var(--shadow-color)] resize-none transition-all duration-200 cursor-none"
                  style={{ background: "var(--color-surface-variant)", color: "var(--color-on-surface)" }}
                />
              </div>

              <div className="relative">
                <ConfettiBurst active={showConfetti} />
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full border-4 border-outline px-6 py-4 font-headline-md text-2xl uppercase flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_var(--shadow-color)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] transition-all disabled:opacity-70 cursor-none relative overflow-hidden"
                  style={{
                    background: submitted ? "var(--color-primary-container)" : "var(--color-primary-container)",
                    color: submitted ? "var(--color-on-primary-container)" : "var(--color-on-primary-container)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting && (
                    <div className="absolute inset-0 animate-shimmer opacity-25 pointer-events-none" />
                  )}
                  {isSubmitting ? (
                    <motion.div
                      className="w-6 h-6 border-3 border-current border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : submitted ? (
                    <><FaCheck className="text-xl" /><span>Sent!</span></>
                  ) : (
                    <><FaPaperPlane className="text-xl" /><span>Send Message</span></>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div className="lg:col-span-2 flex flex-col gap-8" variants={containerVariants}>
          {/* Quick Connect */}
          <motion.div
            className="border-4 border-outline p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)]"
            style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}
            variants={itemVariants}
          >
            <h3 className="font-headline-md text-2xl uppercase mb-4 border-b-4 border-outline pb-3">
              Quick Connect
            </h3>
            <button
              onClick={copyEmail}
              aria-label={`Copy Aryan Dani email address ${aboutInfo.email}`}
              className="w-full border-4 border-outline p-4 mb-4 flex items-center gap-3 shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-left cursor-none"
              style={{ background: "var(--color-surface)", color: "var(--color-on-surface)" }}
            >
              <FaEnvelope className="text-xl shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-label-bold text-xs uppercase text-[var(--color-secondary)]">Email</div>
                <div className="font-body-md text-sm truncate">{aboutInfo.email}</div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={emailCopied ? "check" : "copy"}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {emailCopied
                    ? <FaCheck className="text-green-600 shrink-0" />
                    : <FaCopy className="opacity-50 shrink-0" />}
                </motion.div>
              </AnimatePresence>
            </button>

            <div className="grid grid-cols-2 gap-3">
              {socialLinks.map((link, idx) => {
                const Icon = socialIconMap[link.name];
                if (!Icon) return null;
                return (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open Aryan Dani ${link.name} profile`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.12 + idx * 0.04 }}
                    className="border-4 border-outline p-3 flex items-center gap-2 font-label-bold text-sm uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-none"
                    style={{ background: "var(--color-surface)", color: "var(--color-on-surface)" }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="text-lg" />{link.name}
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Resume */}
          <motion.div
            className="border-4 border-outline p-6 flex flex-col gap-4 shadow-[4px_4px_0px_0px_var(--shadow-accent)] relative overflow-hidden"
            style={{ background: "var(--color-on-background)", color: "var(--color-background)" }}
            variants={itemVariants}
          >
            <div className="flex items-center gap-3 border-b-4 border-current pb-3">
              <FaFileDownload className="text-3xl text-current" />
              <div>
                <div className="font-headline-md text-xl uppercase">My Resume</div>
                <div className="font-body-md text-sm opacity-60">PDF • Latest Version</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                onClick={() => setIsResumeOpen(true)}
                className="bg-transparent text-[var(--color-background)] border-4 border-current px-3 py-3.5 font-label-bold text-sm uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_var(--color-background)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all cursor-none"
              >
                <FaEye className="text-lg text-current" />
                <span>View</span>
              </button>
              <a
                href={getAssetPath(aboutInfo.resumeUrl)}
                download="Aryan_Dani_Resume.pdf"
                className="bg-transparent text-[var(--color-background)] border-4 border-current px-3 py-3.5 font-label-bold text-sm uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_var(--color-background)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all w-full cursor-none flex-1"
              >
                <FaFileDownload className="text-lg text-current" />
                <span>Download</span>
              </a>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            className="border-4 border-outline p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)]"
            style={{ background: "var(--color-surface)" }}
            variants={itemVariants}
          >
            <h3 className="font-headline-md text-2xl uppercase mb-4 border-b-4 border-outline pb-3 text-[var(--color-on-surface)]">
              FAQ
            </h3>
            <div className="flex flex-col gap-3">
              {FAQ_ITEMS.map((faq, i) => (
                <div key={i} className="border-2 border-outline">
                  <button
                    id={`faq-button-${i}`}
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    aria-expanded={expandedFaq === i}
                    aria-controls={`faq-panel-${i}`}
                    className={`w-full text-left p-4 font-label-bold text-sm uppercase flex items-center justify-between transition-colors cursor-none ${
                      expandedFaq === i
                        ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
                        : "bg-[var(--color-surface)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)]"
                    }`}
                  >
                    {faq.q}
                    <motion.div
                      animate={{ rotate: expandedFaq === i ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    >
                      <FaChevronDown className="shrink-0 ml-2" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {expandedFaq === i && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        role="region"
                        aria-labelledby={`faq-button-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="p-4 font-body-md text-sm border-t-2 border-outline text-[var(--color-on-surface-variant)]"
                          style={{ background: "var(--color-surface-variant)" }}
                        >
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {isResumeOpen && (
        <Suspense fallback={null}>
          <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
        </Suspense>
      )}
    </motion.section>
  );
}

export default memo(Contact);
