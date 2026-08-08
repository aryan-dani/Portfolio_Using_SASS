import { useState, useRef, useEffect, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { skills } from "../../data/skills";
import { projects } from "../../data/projects";
import { certifications } from "../../data/certifications";
import { experiences, aboutInfo } from "../../data/experience";
import { useTheme } from "../../context/ThemeContext";
import { useAchievements } from "../../context/AchievementContext";
import { useSound } from "../../context/SoundContext";
import { askKuro } from "../../utils/askKuro";
import { useModalLock } from "../../hooks/useModalLock";
import PageHeader from "../../components/PageHeader/PageHeader";
import { usePageSEO } from "../../utils/seo";
import "./Playground.scss";

import { playgroundRouteMap as ROUTES } from "../../config/routes";

const COMMAND_HELP = [
  ["help", "Display this helper screen"],
  ["whoami", "Print the developer profile"],
  ["ls", "List portfolio pages"],
  ["open [page]", "Navigate to a page, e.g. open projects"],
  ["projects", "List all engineering projects"],
  ["project [N]", "View details and route to project N"],
  ["skills", "List core technical skills"],
  ["stack", "Summarize the current platform stack"],
  ["experience", "List career milestones"],
  ["certifications", "List verified credentials"],
  ["contact / hire", "Print contact info and route to contact"],
  ["email", "Copy the email address"],
  ["socials", "List direct social links"],
  ["theme", "Toggle light/dark mode"],
  ["resume", "Open resume details from About"],
  ["wow / graph", "Jump to skills graph"],
  ["date / now", "Print local time"],
  ["echo [text]", "Print text back to the terminal"],
  ["banner", "Print the portfolio wordmark"],
  ["history", "Show command history"],
  ["clear", "Clear terminal log history"],
  ["ask [question]", "Ask Kuro about the portfolio"],
  ["hack", "Toggle CRT hacker mode"],
  ["unhack", "Exit CRT hacker mode"],
  ["matrix", "Matrix rain in terminal"],
  ["achievements", "Show trophy progress"],
  ["neofetch", "System info card"],
  ["coffee", "Request coffee"],
  ["konami", "Hint at a secret code"],
  ["devmode", "Toggle dev HUD hint"],
  ["sudo hire-me", "Print employment contract"],
];

const COMMANDS = Array.from(
  new Set(COMMAND_HELP.flatMap(([command]) => command.split(" / ").map((part) => part.split(" ")[0]))),
);
const STARTER_COMMANDS = ["help", "whoami", "stack", "ask", "hack", "neofetch"];

function getSuggestion(command) {
  if (!command) return null;
  const exactPrefix = COMMANDS.find((cmd) => cmd.startsWith(command));
  if (exactPrefix) return exactPrefix;
  return COMMANDS.find((cmd) => {
    const longer = cmd.length > command.length ? cmd : command;
    const shorter = cmd.length > command.length ? command : cmd;
    let matches = 0;
    for (let i = 0; i < shorter.length; i += 1) {
      if (longer.includes(shorter[i])) matches += 1;
    }
    return matches / Math.max(shorter.length, 1) > 0.72;
  }) || null;
}

function Playground() {
  usePageSEO();
  const navigate = useNavigate();
  const { theme, crtMode, toggleTheme, setCrtMode } = useTheme();
  const { track } = useAchievements();
  const { play } = useSound();
  const [history, setHistory] = useState([
    { text: "ARYAN DANI [PORTFOLIO INTERACTIVE CLI v3.0]", type: "info" },
    { text: "Type 'help', press Tab to autocomplete, or click a starter command below.", type: "success" },
    { text: "", type: "spacing" },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const terminalEndRef = useRef(null);
  const terminalLogRef = useRef(null);
  const collapsedTerminalRef = useRef(null);
  const expandedTerminalRef = useRef(null);
  const inputRef = useRef(null);

  const focusInput = () => {
    const selection = window.getSelection().toString();
    if (selection) return;
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  };

  useModalLock(isExpanded, () => setIsExpanded(false));

  useEffect(() => {
    if (isExpanded) {
      focusInput();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (terminalLogRef.current) {
      terminalLogRef.current.scrollTo({
        top: terminalLogRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [history]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === "Tab" || e.key === "Escape") return;

      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA" ||
        document.activeElement.tagName === "SELECT" ||
        document.activeElement.contentEditable === "true"
      ) {
        return;
      }

      // If it's a single character, focus the terminal input
      if (e.key.length === 1 && inputRef.current) {
      play("hover");
      inputRef.current.focus();
    }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [play]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const trimmedVal = inputVal.trim();
      if (trimmedVal) {
        setCmdHistory((prev) => [...prev, trimmedVal]);
      }
      setHistoryIdx(-1);
      processCommand(trimmedVal);
      setInputVal("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx =
        historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputVal(cmdHistory[nextIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      if (historyIdx === cmdHistory.length - 1) {
        setHistoryIdx(-1);
        setInputVal("");
      } else {
        const nextIdx = historyIdx + 1;
        setHistoryIdx(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const parts = inputVal.trim().split(/\s+/);
      const suggestion = getSuggestion(parts[0]?.toLowerCase() || "");
      if (suggestion) {
        setInputVal(parts.length > 1 ? `${suggestion} ${parts.slice(1).join(" ")}` : suggestion);
      }
    }
  };

  const handleTerminalWheel = useCallback((event) => {
    if (!terminalLogRef.current) return;
    const log = terminalLogRef.current;
    const canScroll = log.scrollHeight > log.clientHeight;
    if (!canScroll) return;

    event.preventDefault();
    event.stopPropagation();
    log.scrollTop += event.deltaY;
  }, []);

  useEffect(() => {
    const nodes = [collapsedTerminalRef.current, expandedTerminalRef.current].filter(Boolean);
    if (!nodes.length) return undefined;

    nodes.forEach((node) => node.addEventListener("wheel", handleTerminalWheel, { passive: false }));
    return () => {
      nodes.forEach((node) => node.removeEventListener("wheel", handleTerminalWheel));
    };
  }, [isExpanded, handleTerminalWheel]);

  const processCommand = (rawCommand) => {
    const normalizedCommand = rawCommand.trim();
    const args = normalizedCommand.toLowerCase().split(/\s+/);
    const command = args[0];
    const originalArgs = normalizedCommand.split(/\s+/).slice(1);

    // Echo the command typed
    setHistory((prev) => [
      ...prev,
      { text: `guest@aryan-dani.dev:~$ ${normalizedCommand}`, type: "command" },
    ]);

    if (!command) return;
    track("cli_command");

    switch (command) {
      case "help":
        setHistory((prev) => [
          ...prev,
          { text: "Available commands:", type: "info" },
          ...COMMAND_HELP.map(([cmd, desc]) => ({
            text: `  ${cmd.padEnd(18)} - ${desc}`,
            type: "text",
          })),
        ]);
        break;

      case "clear":
        setHistory([
          { text: "ARYAN DANI [PORTFOLIO INTERACTIVE CLI v3.0]", type: "info" },
          {
            text: "Type 'help', press Tab to autocomplete, or click a starter command below.",
            type: "success",
          },
          { text: "", type: "spacing" },
        ]);
        break;

      case "whoami":
        setHistory((prev) => [
          ...prev,
          { text: `${aboutInfo.name} - ${aboutInfo.title}`, type: "info" },
          { text: aboutInfo.tagline, type: "text" },
          { text: `Email: ${aboutInfo.email}`, type: "text" },
        ]);
        break;

      case "ls":
        setHistory((prev) => [
          ...prev,
          { text: "Portfolio routes:", type: "info" },
          ...Object.entries(ROUTES).map(([name, path]) => ({ text: `  ${name.padEnd(16)} ${path}`, type: "text" })),
        ]);
        break;

      case "open":
        if (!args[1] || !ROUTES[args[1]]) {
          setHistory((prev) => [
            ...prev,
            { text: "Usage: open [home|projects|experience|certifications|skills|about|contact|playground|copyright]", type: "error" },
          ]);
        } else {
          setHistory((prev) => [
            ...prev,
            { text: `Opening ${args[1]}...`, type: "success" },
          ]);
          setTimeout(() => navigate(ROUTES[args[1]]), 600);
        }
        break;

      case "theme":
        toggleTheme();
        track("theme_toggle");
        setHistory((prev) => [
          ...prev,
          {
            text: `Theme successfully toggled. Current mode: ${theme === "light" ? "dark" : "light"}`,
            type: "success",
          },
        ]);
        break;

      case "stack":
        setHistory((prev) => [
          ...prev,
          { text: "Platform Stack:", type: "info" },
          { text: "  Frontend: React 18, Vite, React Router", type: "text" },
          { text: "  Motion: Framer Motion, Lenis smooth scroll", type: "text" },
          { text: "  Styling: Tailwind v4 CSS variables, SCSS, monochrome neo-brutalism", type: "text" },
          { text: "  UX: custom cursor, command palette, CLI, canvas tech globe", type: "text" },
        ]);
        break;

      case "skills": {
        const allSkills = Object.values(skills)
          .flat()
          .map((s) => s.name)
          .join(", ");
        setHistory((prev) => [
          ...prev,
          { text: "Core Technical Skills Registry:", type: "info" },
          { text: allSkills, type: "text" },
        ]);
        break;
      }

      case "projects":
        setHistory((prev) => [
          ...prev,
          { text: "Portfolio Projects Directory:", type: "info" },
          ...projects.map((p, idx) => ({
            text: `  [${idx + 1}] ${p.title} - ${p.category.toUpperCase()}`,
            type: "text",
          })),
        ]);
        break;

      case "project": {
        const idx = parseInt(args[1], 10) - 1;
        if (isNaN(idx) || idx < 0 || idx >= projects.length) {
          setHistory((prev) => [
            ...prev,
            {
              text: "Error: Please specify a valid project index, e.g. 'project 1'",
              type: "error",
            },
          ]);
        } else {
          const proj = projects[idx];
          setHistory((prev) => [
            ...prev,
            { text: `Title: ${proj.title}`, type: "info" },
            { text: `Category: ${proj.category.toUpperCase()}`, type: "text" },
            { text: `Description: ${proj.description}`, type: "text" },
            { text: `Routing you to project section...`, type: "success" },
          ]);
          setTimeout(() => {
            navigate(`/projects?highlight=${proj.id}`);
          }, 1500);
        }
        break;
      }

      case "certifications":
        setHistory((prev) => [
          ...prev,
          { text: "Credentials & Certifications:", type: "info" },
          ...certifications.map((c, idx) => ({
            text: `  [${idx + 1}] ${c.title} - Issued by ${c.issuer} (${c.date})`,
            type: "text",
          })),
        ]);
        break;

      case "about":
        setHistory((prev) => [
          ...prev,
          {
            text: `${aboutInfo.name} - ${aboutInfo.title}`,
            type: "info",
          },
          {
            text: "Specializes in building modern high-contrast neobrutalist platforms, fine-tuning large language models, setting up multimodal RAG architectures, and programming creative interfaces.",
            type: "text",
          },
          { text: "Redirecting you to the About section...", type: "success" },
        ]);
        setTimeout(() => navigate("/about"), 1500);
        break;

      case "experience":
        setHistory((prev) => [
          ...prev,
          { text: "Career Timeline Experiences:", type: "info" },
          ...experiences.flatMap((exp, idx) => [
            {
              text: `  [${idx + 1}] ${exp.position} @ ${exp.company} (${exp.period})`,
              type: "text",
            },
            {
              text: `      - ${exp.technologies.slice(0, 5).join(" / ")}`,
              type: "text",
            },
          ]),
        ]);
        break;

      case "contact":
      case "hire":
        setHistory((prev) => [
          ...prev,
          { text: "Contact Details:", type: "info" },
          { text: `  Email: ${aboutInfo.email}`, type: "text" },
          { text: "  LinkedIn: linkedin.com/in/aryandani/", type: "text" },
          { text: "  GitHub: github.com/aryan-dani", type: "text" },
          { text: "Redirecting to contact page...", type: "success" },
        ]);
        setTimeout(() => navigate("/contact"), 1500);
        break;

      case "socials":
        setHistory((prev) => [
          ...prev,
          { text: "Social profiles:", type: "info" },
          { text: "  GitHub:    https://github.com/aryan-dani", type: "text" },
          {
            text: "  LinkedIn:  https://www.linkedin.com/in/aryandani/",
            type: "text",
          },
          {
            text: "  Instagram: https://www.instagram.com/aryandani_06/",
            type: "text",
          },
        ]);
        break;

      case "email":
        navigator.clipboard?.writeText(aboutInfo.email);
        setHistory((prev) => [
          ...prev,
          { text: `Copied email: ${aboutInfo.email}`, type: "success" },
        ]);
        break;

      case "resume":
        setHistory((prev) => [
          ...prev,
          { text: "Opening resume details in About...", type: "success" },
        ]);
        setTimeout(() => navigate("/about"), 1000);
        break;

      case "date":
      case "now":
        setHistory((prev) => [
          ...prev,
          { text: new Date().toLocaleString(), type: "info" },
        ]);
        break;

      case "echo":
        setHistory((prev) => [
          ...prev,
          { text: originalArgs.join(" ") || "", type: "text" },
        ]);
        break;

      case "banner":
        setHistory((prev) => [
          ...prev,
          { text: "  ARYAN DANI", type: "info" },
          { text: "  WEB DEV / AI ENGINEER / BUILDER", type: "success" },
        ]);
        break;

      case "history":
        setHistory((prev) => [
          ...prev,
          { text: "Command history:", type: "info" },
          ...(cmdHistory.length
            ? cmdHistory.map((cmd, idx) => ({ text: `  ${idx + 1}. ${cmd}`, type: "text" }))
            : [{ text: "  No commands yet.", type: "text" }]),
        ]);
        break;

      case "sudo":
        if (originalArgs.join(" ").toLowerCase().includes("hire")) {
          track("hire");
          setHistory((prev) => [
            ...prev,
            { text: "EMPLOYMENT CONTRACT - ARYAN DANI", type: "info" },
            { text: "Role: AI Engineer / Full-Stack Developer", type: "text" },
            { text: "Start: ASAP  |  Location: Remote / Pune", type: "text" },
            { text: "Perks: ships agentic systems, drinks chai, debugs in neo-brutalist UI", type: "success" },
            { text: "Sign here: mailto:daniaryan212@gmail.com", type: "success" },
          ]);
        } else {
          setHistory((prev) => [
            ...prev,
            { text: "Nice try. You already have root access to the portfolio.", type: "success" },
          ]);
        }
        break;

      case "coffee":
        track("coffee");
        setHistory((prev) => [
          ...prev,
          { text: "tea > coffee. Try again.", type: "error" },
        ]);
        break;

      case "konami":
        setHistory((prev) => [
          ...prev,
          { text: "↑ ↑ ↓ ↓ ← → ← → B A  -  or press Ctrl+Alt+H", type: "info" },
        ]);
        break;

      case "devmode":
        setHistory((prev) => [
          ...prev,
          { text: "Dev HUD: Ctrl+Alt+D | X-ray toggle inside HUD", type: "success" },
        ]);
        break;

      case "achievements":
        navigate("/achievements");
        setHistory((prev) => [...prev, { text: "Routing to trophy wall...", type: "success" }]);
        break;

      case "neofetch":
        setHistory((prev) => [
          ...prev,
          { text: "aryan@portfolio", type: "info" },
          { text: "OS: Vercel Edge / React 18", type: "text" },
          { text: "Shell: Playground CLI v3.0", type: "text" },
          { text: "Theme: " + theme, type: "text" },
          { text: "Stack: Groq, LangGraph, Next.js, FastAPI", type: "text" },
          { text: "Uptime: always shipping", type: "success" },
        ]);
        break;

      case "matrix": {
        track("matrix");
        const lines = Array.from({ length: 8 }, () =>
          Array.from({ length: 42 }, () => String.fromCharCode(0x30a0 + Math.random() * 96)).join(""),
        );
        setHistory((prev) => [
          ...prev,
          { text: "MATRIX RAIN INIT", type: "info" },
          ...lines.map((line) => ({ text: line, type: "success" })),
        ]);
        break;
      }

      case "unhack": {
        setCrtMode(false);
        setHistory((prev) => [
          ...prev,
          { text: "ACCESS REVOKED - CRT MODE DISABLED", type: "success" },
          { text: "Welcome back to normal reality.", type: "text" },
        ]);
        break;
      }

      case "hack": {
        if (crtMode) {
          setHistory((prev) => [
            ...prev,
            { text: "CRT mode already active. Run unhack to exit.", type: "info" },
          ]);
          break;
        }

        track("hack");
        const hex = Array.from({ length: 6 }, () =>
          Math.random().toString(16).slice(2, 10).toUpperCase(),
        );
        setHistory((prev) => [
          ...prev,
          { text: "[BREACH] scanning ports...", type: "info" },
          ...hex.map((h) => ({ text: `0x${h} ... OK`, type: "text" })),
          { text: "ACCESS GRANTED - CRT MODE ENABLED", type: "success" },
          { text: "Run unhack, Ctrl+Alt+H, or Konami again to exit.", type: "text" },
        ]);
        setCrtMode(true);
        break;
      }

      case "ask": {
        const question = originalArgs.slice(1).join(" ").trim();
        if (!question) {
          setHistory((prev) => [...prev, { text: "Usage: ask <your question>", type: "error" }]);
          break;
        }
        track("ai_ask");
        setHistory((prev) => [...prev, { text: "Kuro is thinking...", type: "info" }]);
        askKuro(question, { currentPath: window.location.pathname })
          .then(({ reply, actions }) => {
            setHistory((prev) => [...prev, { text: reply, type: "success" }]);
            if (actions?.length) {
              actions.forEach((a) => {
                if (a.type === "navigate" && a.path) navigate(a.path);
              });
            }
          })
          .catch((err) => {
            setHistory((prev) => [...prev, { text: err.message, type: "error" }]);
          });
        break;
      }

      case "wow":
      case "graph":
        setHistory((prev) => [
          ...prev,
          { text: "Initializing skills graph view...", type: "info" },
          { text: "Routing to /skills with Graph mode ready for launch.", type: "success" },
        ]);
        setTimeout(() => navigate("/skills"), 900);
        break;

      default: {
        const suggestion = getSuggestion(command);
        setHistory((prev) => [
          ...prev,
          {
            text: `Command not found: '${command}'. ${suggestion ? `Did you mean '${suggestion}'? ` : ""}Type 'help' to see valid commands.`,
            type: "error",
          },
        ]);
      }
    }
  };

  const renderTerminalContent = () => (
    <>
      {/* Terminal Header / Title bar */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b-2 border-dashed border-outline-variant pb-3 mb-4 select-none shrink-0">
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full border border-outline bg-[var(--color-on-background)] opacity-30" />
          <span className="w-3 h-3 rounded-full border border-outline bg-[var(--color-on-background)] opacity-60" />
          <span className="w-3 h-3 rounded-full border border-outline bg-[var(--color-on-background)] opacity-100" />
        </div>
        <div className="min-w-0 text-center text-[10px] sm:text-xs font-bold font-mono text-[var(--color-on-surface-variant)] uppercase tracking-wider truncate">
          guest@aryan-dani.dev: ~ {isExpanded ? "[EXPANDED]" : "[NORMAL]"}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse CLI playground terminal" : "Expand CLI playground terminal"}
          className="bg-[var(--color-primary-container)] border-2 border-outline text-[var(--color-on-primary-container)] px-3 py-1 text-xs font-bold uppercase cursor-none hover:bg-[var(--color-surface)] hover:text-[var(--color-on-surface)] transition-colors active:translate-y-0.5 active:translate-x-0.5 active:shadow-none shadow-[2px_2px_0px_0px_var(--shadow-color)]"
        >
          {isExpanded ? "Collapse ↙" : "Expand ⛶"}
        </button>
      </div>

      {/* Starter command chips */}
      <div className="flex flex-wrap gap-2 border-b-2 border-dashed border-outline-variant pb-4 mb-4 select-none">
        {STARTER_COMMANDS.map((command) => (
          <button
            key={command}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              processCommand(command);
            }}
            aria-label={`Run ${command} starter command`}
            className="border-2 border-outline bg-[var(--color-surface-variant)] px-3 py-1 font-label-bold text-[10px] uppercase tracking-wider text-[var(--color-on-surface)] shadow-[2px_2px_0_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-none"
          >
            {command}
          </button>
        ))}
      </div>

      {/* Terminal logs list */}
      <div
        ref={terminalLogRef}
        className="grow min-h-0 overflow-y-auto overscroll-contain space-y-2 pr-2"
        data-lenis-prevent
        role="log"
        aria-live="polite"
        aria-label="CLI terminal output"
      >
        {history.map((line, index) => {
          if (line.type === "spacing")
            return <div key={index} className="h-2" />;
          const colorClass =
            line.type === "command"
              ? "text-[#3a3a3a] dark:text-[#c8c8c8] font-bold"
              : line.type === "info"
                ? "text-[#555555] dark:text-[#aaaaaa] font-bold"
                : line.type === "success"
                  ? "text-[#404040] dark:text-[#b8b8b8]"
                  : line.type === "error"
                    ? "text-[var(--color-error)]"
                    : "text-[var(--color-on-surface)]";
          return (
            <div
              key={index}
              className={`text-sm md:text-base leading-relaxed ${colorClass} whitespace-pre-wrap`}
            >
              {line.text}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Input prompt line */}
      <div className="flex items-center gap-2 border-t-2 border-dashed border-outline-variant pt-4 mt-4 relative shrink-0">
        <span className="text-[var(--color-on-surface-variant)] font-bold text-sm md:text-base shrink-0 opacity-60">
          guest@aryan-dani.dev:~$
        </span>

        <div className="relative grow flex items-center h-6">
          {/* Real input, caret-invisible & text-transparent, captures typing */}
          <input
            ref={inputRef}
            type="text"
            aria-label="CLI command input"
            className="absolute inset-0 bg-transparent border-none outline-none font-mono text-sm md:text-base focus:ring-0 p-0 w-full z-10 cursor-none"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={60}
            autoComplete="off"
            spellCheck="false"
            style={{ color: "transparent", caretColor: "transparent" }}
          />
          {/* Display overlay with typing text and custom blinking block cursor */}
          <div className="absolute left-0 top-0 bottom-0 right-0 flex items-center font-mono text-sm md:text-base text-[var(--color-on-surface)] pointer-events-none select-none whitespace-pre">
            <span>{inputVal}</span>
            <span
              className={`w-2.5 h-4.5 bg-[var(--color-primary-container)] border border-outline ml-0.5 inline-block align-middle ${
                isFocused ? "animate-blink" : "opacity-40"
              }`}
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <section className="flex flex-col gap-12 w-full mt-4">
      <PageHeader
        title="CLI Playground"
        description="Use the keyboard command line interface to query projects, list skills, toggle themes, or navigate the site directly."
      />

      {/* Render collapsed inline terminal */}
      {!isExpanded && (
        <motion.div
          ref={collapsedTerminalRef}
          className="nb-cli-container border-4 border-outline bg-[var(--color-surface)] p-6 font-mono flex flex-col relative overflow-hidden min-h-120 h-120 w-full shadow-[8px_8px_0px_0px_var(--shadow-color)] paint-isolate hover-gpu"
          onClick={focusInput}
          role="application"
          aria-label="Interactive CLI playground terminal"
          whileHover={{ y: -2, boxShadow: "10px 10px 0px 0px var(--shadow-color)" }}
          transition={{ type: "spring", stiffness: 180, damping: 32 }}
        >
          {renderTerminalContent()}
        </motion.div>
      )}

      {/* Render expanded terminal in a portal */}
      {createPortal(
        <AnimatePresence>
          {isExpanded && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  onClick={() => setIsExpanded(false)}
                  className="fixed inset-0 bg-black/60 z-190 cursor-none gpu-layer"
                />
                <div className="fixed inset-0 z-200 flex items-center justify-center p-3 sm:p-4 md:p-6 pointer-events-none">
                  <motion.div
                    ref={expandedTerminalRef}
                    className="nb-cli-container pointer-events-auto bg-[var(--color-surface)] p-4 sm:p-5 md:p-6 font-mono flex flex-col relative w-full h-full max-w-[1600px] overflow-hidden border-4 border-outline shadow-[6px_6px_0_var(--shadow-color)] gpu-layer paint-isolate"
                    onClick={focusInput}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Expanded CLI playground terminal"
                    initial={{ opacity: 0, scale: 0.985, y: 14, clipPath: "inset(4% 2% 6% 2%)" }}
                    animate={{ opacity: 1, scale: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" }}
                    exit={{ opacity: 0, scale: 0.99, y: 10, clipPath: "inset(5% 2% 6% 2%)" }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: "center" }}
                  >
                    {renderTerminalContent()}
                  </motion.div>
                </div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
}

export default memo(Playground);
