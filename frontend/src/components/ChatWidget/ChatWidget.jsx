import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useAchievements } from "../../context/AchievementContext";
import { useTheme } from "../../context/ThemeContext";
import { isFinePointerDevice } from "../../utils/device";
import { useSiteIdle } from "../../hooks/useSiteIdle";
import { askIshani } from "../../utils/askIshani";
import { executeIshaniActions, describeKuroActions } from "../../utils/ishaniActions";
import {
  getKuroWelcomeLine,
  getKuroPageLine,
  hasMetKuro,
  hasVisitedPage,
  markKuroMet,
  markPageVisited,
} from "../../data/ishaniRouteLines";

const EYE_RANGE = 3.2;
const PET_LINES = ["*tail wag*", "*happy pant*", "Good boy.", "*ear flop*", "*lean*", "More pets please."];
const CHAT_STORAGE_KEY = "portfolio_kuro_chat";
const THINKING_LINES = [
  "*sniffing the question*",
  "*tail wag while processing*",
  "*ears perk up*",
  "*consulting the portfolio*",
];
const SUGGESTION_CHIPS = [
  { label: "Projects", send: "go to projects" },
  { label: "Hack mode", send: "hack mode" },
  { label: "Who built this?", send: "Who built this?" },
];
const INPUT_PLACEHOLDERS = [
  "Ask about Aryan, or say 'go to projects'",
  "Try: who built this?",
  "Try: take me to skills",
];

function loadChatHistory() {
  try {
    const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [{ role: "assistant", text: getKuroWelcomeLine() }];
}

function saveChatHistory(messages) {
  try {
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-24)));
  } catch {
    /* ignore */
  }
}

const OUTLINE = "#131316";
const FUR = "#f0d4a8";
const FUR_EAR = "#b8894f";
const SNOUT = "#faecd8";
const ROBOT_BODY = "#1c2420";
const ROBOT_PANEL = "#2a3830";
const ROBOT_EAR = "#16331f";
const ROBOT_SNOUT = "#24302a";
const ROBOT_LED = "#39ff14";
const ROBOT_DIM = "#1a4d28";

const SNORING_GLYPHS = ["z", "Z", "zz", "Zz", "zZ"];

function SleepSnores({ active, onPop, robot = false }) {
  const [snores, setSnores] = useState([]);
  const snoreIdRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setSnores([]);
      return undefined;
    }

    const spawn = () => {
      snoreIdRef.current += 1;
      const id = snoreIdRef.current;
      setSnores((prev) => [
        ...prev.slice(-7),
        {
          id,
          x: 28 + Math.random() * 40,
          size: 11 + Math.random() * 10,
          drift: 10 + Math.random() * 18,
          rotate: -18 + Math.random() * 36,
          glyph: SNORING_GLYPHS[Math.floor(Math.random() * SNORING_GLYPHS.length)],
          delay: Math.random() * 0.2,
        },
      ]);
    };

    spawn();
    const timer = window.setInterval(spawn, 520);
    return () => clearInterval(timer);
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute -inset-6 pointer-events-none overflow-visible z-20" aria-hidden="true">
      <AnimatePresence>
        {snores.map((snore) => (
          <motion.button
            key={snore.id}
            type="button"
            className={`absolute font-label-bold leading-none select-none pointer-events-auto border-2 border-outline px-1 shadow-[2px_2px_0_var(--shadow-color)] ${
              robot
                ? "bg-[#0d1a10] text-[#39ff14]"
                : "bg-[var(--color-surface)] text-[var(--color-on-surface)]"
            }`}
            style={{ left: snore.x, bottom: "62%", fontSize: snore.size }}
            initial={{ opacity: 0, y: 6, x: 0, scale: 0.7, rotate: snore.rotate }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: -44 - snore.size,
              x: snore.drift,
              scale: [0.7, 1.05, 1],
              rotate: snore.rotate + 8,
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 1.9, delay: snore.delay, ease: "easeOut" }}
            onClick={(event) => {
              event.stopPropagation();
              setSnores((prev) => prev.filter((s) => s.id !== snore.id));
              onPop?.();
            }}
            aria-label="Wake Kuro"
          >
            {snore.glyph}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

const KuroFace = memo(function KuroFace({ pupilsRef, mood, bliss, sleeping, size = 68, robot = false }) {
  const thinking = mood === "thinking";
  const asleep = sleeping && !bliss && !thinking;
  const body = robot ? ROBOT_BODY : FUR;
  const ear = robot ? ROBOT_EAR : FUR_EAR;
  const snout = robot ? ROBOT_SNOUT : SNOUT;
  const eyeFill = robot ? ROBOT_DIM : "#fff";
  const pupil = robot ? ROBOT_LED : OUTLINE;
  const highlight = robot ? "#0a120a" : "#fff";

  return (
    <motion.svg
      viewBox="18 6 60 56"
      width={size}
      height={size}
      className="shrink-0 drop-shadow-[3px_3px_0_var(--shadow-color)]"
      aria-hidden="true"
      animate={
        asleep
          ? { y: [0, 1.5, 0], rotate: [0, 1.2, 0, -1.2, 0] }
          : bliss
            ? { y: -1.5, rotate: -2, scale: 1.04 }
            : robot
              ? { y: [0, -1, 0] }
              : { y: 0, scale: 1, rotate: 0 }
      }
      transition={
        asleep
          ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
          : robot && !bliss && !thinking
            ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
            : { type: "spring", stiffness: 420, damping: 24 }
      }
    >
      {robot && (
        <>
          <line x1="48" y1="8" x2="48" y2="16" stroke={ROBOT_LED} strokeWidth="2" />
          <rect x="46" y="6" width="4" height="4" fill={ROBOT_LED} stroke={OUTLINE} strokeWidth="1.5" />
        </>
      )}

      <motion.g
        animate={bliss ? { rotate: -28 } : { rotate: -22 }}
        transition={{ type: "spring", stiffness: 420, damping: 24 }}
        style={{ transformOrigin: "26px 24px", transformBox: "fill-box" }}
      >
        <rect x="21" y="14" width="11" height="20" fill={ear} stroke={OUTLINE} strokeWidth="2" />
        {robot && <rect x="24" y="18" width="5" height="8" fill={ROBOT_LED} opacity="0.85" />}
      </motion.g>
      <motion.g
        animate={bliss ? { rotate: 28 } : { rotate: 22 }}
        transition={{ type: "spring", stiffness: 420, damping: 24 }}
        style={{ transformOrigin: "70px 24px", transformBox: "fill-box" }}
      >
        <rect x="64" y="14" width="11" height="20" fill={ear} stroke={OUTLINE} strokeWidth="2" />
        {robot && <rect x="67" y="18" width="5" height="8" fill={ROBOT_LED} opacity="0.85" />}
      </motion.g>

      <rect x="28" y="20" width="40" height="36" fill={body} stroke={OUTLINE} strokeWidth="2.5" />
      {robot && (
        <>
          <rect x="31" y="23" width="34" height="8" fill={ROBOT_PANEL} stroke={OUTLINE} strokeWidth="1.5" />
          <rect x="33" y="25" width="4" height="4" fill={ROBOT_LED} />
          <rect x="40" y="25" width="4" height="4" fill={ROBOT_DIM} />
          <rect x="47" y="25" width="4" height="4" fill={ROBOT_LED} opacity="0.55" />
        </>
      )}

      {bliss && !robot && (
        <>
          <rect x="29" y="39" width="7" height="4" fill="#e8a898" opacity="0.55" />
          <rect x="60" y="39" width="7" height="4" fill="#e8a898" opacity="0.55" />
        </>
      )}

      <rect x="34" y="42" width="28" height="14" fill={snout} stroke={OUTLINE} strokeWidth="2" />
      {robot && <rect x="38" y="45" width="20" height="3" fill={ROBOT_DIM} />}

      {asleep ? (
        <>
          <line x1="33" y1="35" x2="41" y2="35" stroke={robot ? ROBOT_LED : OUTLINE} strokeWidth="2" strokeLinecap="square" />
          <line x1="55" y1="35" x2="63" y2="35" stroke={robot ? ROBOT_LED : OUTLINE} strokeWidth="2" strokeLinecap="square" />
        </>
      ) : bliss ? (
        <>
          <polyline points="32,36 37,31 42,36" fill="none" stroke={robot ? ROBOT_LED : OUTLINE} strokeWidth="2.25" strokeLinejoin="miter" strokeLinecap="square" />
          <polyline points="54,36 59,31 64,36" fill="none" stroke={robot ? ROBOT_LED : OUTLINE} strokeWidth="2.25" strokeLinejoin="miter" strokeLinecap="square" />
        </>
      ) : (
        <motion.g
          animate={thinking ? { opacity: 1 } : { scaleY: [1, 1, 0.08, 1, 1] }}
          transition={
            thinking
              ? { duration: 0.2 }
              : { duration: 0.26, times: [0, 0.44, 0.5, 0.56, 1], repeat: Infinity, repeatDelay: 4.5 }
          }
          style={{ transformOrigin: "48px 33px" }}
        >
          <rect x="31" y="27" width="12" height="12" fill={eyeFill} stroke={OUTLINE} strokeWidth="2" />
          <rect x="53" y="27" width="12" height="12" fill={eyeFill} stroke={OUTLINE} strokeWidth="2" />
          <g ref={pupilsRef}>
            <rect x="35" y="31" width="5" height="5" fill={pupil} />
            <rect x="57" y="31" width="5" height="5" fill={pupil} />
            <rect x="36" y="32" width="2" height="2" fill={highlight} />
            <rect x="58" y="32" width="2" height="2" fill={highlight} />
          </g>
        </motion.g>
      )}

      <rect x="44" y="44" width="8" height="6" fill={robot ? ROBOT_LED : OUTLINE} />
      {bliss && !robot && <rect x="46" y="45" width="2" height="1.5" fill="#5a5960" opacity="0.45" />}

      {!asleep && thinking && (
        <line x1="43" y1="52" x2="53" y2="52" stroke={robot ? ROBOT_LED : OUTLINE} strokeWidth="2" strokeLinecap="square" />
      )}

      {thinking && !asleep && (
        <text x="64" y="24" fontSize="9" fontWeight="bold" fill={robot ? ROBOT_LED : OUTLINE}>
          ?
        </text>
      )}
    </motion.svg>
  );
});

function RouteBubble({ text }) {
  return (
    <motion.div
      className="absolute bottom-full left-0 mb-3 w-[min(260px,calc(100vw-2.5rem))] border-2 border-outline bg-[var(--color-surface)] px-3 py-2.5 shadow-[4px_4px_0_var(--shadow-color)] z-0 pointer-events-none"
      initial={{ opacity: 0, y: 8, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      <p className="font-body-md text-sm text-[var(--color-on-surface)] leading-snug whitespace-normal">{text}</p>
      <span
        className="absolute -bottom-2 left-8 h-3 w-3 rotate-45 border-r-2 border-b-2 border-outline bg-[var(--color-surface)]"
        aria-hidden="true"
      />
    </motion.div>
  );
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 ml-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-1.5 w-1.5 bg-[var(--color-on-surface)]"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}

const ChatWidget = memo(function ChatWidget() {
  const finePointer = isFinePointerDevice();
  const isIdle = useSiteIdle(9000);
  const [chatOpen, setChatOpen] = useState(false);
  const [welcomeBubble, setWelcomeBubble] = useState(null);
  const [petBubble, setPetBubble] = useState(null);
  const [petting, setPetting] = useState(false);
  const [dogHovered, setDogHovered] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(loadChatHistory);
  const [loading, setLoading] = useState(false);
  const [thinkingLine, setThinkingLine] = useState(THINKING_LINES[0]);
  const [placeholder] = useState(
    () => INPUT_PLACEHOLDERS[Math.floor(Math.random() * INPUT_PLACEHOLDERS.length)],
  );
  const [inputFocused, setInputFocused] = useState(false);

  const { track } = useAchievements();
  const { toggleTheme, setCrtMode, setAccent, theme, crtMode, accent } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const endRef = useRef(null);
  const inputRef = useRef(null);
  const widgetRef = useRef(null);
  const dogRef = useRef(null);
  const pupilsRef = useRef(null);
  const closeTimerRef = useRef(0);
  const bubbleTimerRef = useRef(0);
  const petTimerRef = useRef(0);
  const welcomeShownRef = useRef(hasMetKuro());
  const sleepingRef = useRef(false);
  const blissRef = useRef(false);
  const eyeRafRef = useRef(0);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const lastActionRef = useRef(null);
  const hasStoredChat = useRef(sessionStorage.getItem(CHAT_STORAGE_KEY) != null);
  const pointerInsideRef = useRef(false);
  const inputFocusedRef = useRef(false);

  const sleeping = isIdle && !chatOpen && !petting && !dogHovered && !loading;
  const bliss = petting || dogHovered;

  useEffect(() => {
    sleepingRef.current = sleeping;
    blissRef.current = bliss;
    if ((sleeping || bliss) && pupilsRef.current) {
      pupilsRef.current.setAttribute("transform", "translate(0 0)");
    }
  }, [sleeping, bliss]);

  const showBubble = useCallback((text, ms = 6500) => {
    setWelcomeBubble(text);
    clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = window.setTimeout(() => setWelcomeBubble(null), ms);
  }, []);

  const showFirstVisitWelcome = useCallback(() => {
    if (welcomeShownRef.current) return;
    welcomeShownRef.current = true;
    markKuroMet();
    showBubble(getKuroWelcomeLine(), 7000);
  }, [showBubble]);

  useEffect(() => {
    const path = location.pathname;
    if (hasVisitedPage(path)) return;
    markPageVisited(path);
    const timer = window.setTimeout(() => {
      showBubble(getKuroPageLine(path), 6000);
    }, 400);
    return () => clearTimeout(timer);
  }, [location.pathname, showBubble]);

  const petDog = useCallback(() => {
    setPetting(true);
    setPetBubble(PET_LINES[Math.floor(Math.random() * PET_LINES.length)]);
    clearTimeout(petTimerRef.current);
    petTimerRef.current = window.setTimeout(() => {
      setPetting(false);
      setPetBubble(null);
    }, 1600);
  }, []);

  const runActions = useCallback(
    (actions) => {
      executeIshaniActions(actions, {
        navigate,
        toggleTheme,
        setCrtMode,
        setAccent,
        track,
        onAction: (executed) => {
          if (executed.length) {
            lastActionRef.current = {
              type: executed[0].type,
              enabled: executed[0].enabled,
              page: executed[0].page,
              label: executed[0].label,
              at: Date.now(),
            };
          }
        },
      });
      return describeKuroActions(actions);
    },
    [navigate, toggleTheme, setCrtMode, setAccent, track],
  );

  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!finePointer) return undefined;

    const aimEyes = () => {
      eyeRafRef.current = 0;
      if (sleepingRef.current || blissRef.current) return;
      const dog = dogRef.current;
      const pupils = pupilsRef.current;
      if (!dog || !pupils) return;
      const rect = dog.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.38;
      const dx = lastPointerRef.current.x - cx;
      const dy = lastPointerRef.current.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const scale = Math.min(EYE_RANGE, dist / 20);
      const px = (dx / dist) * scale;
      const py = (dy / dist) * scale;
      pupils.setAttribute("transform", `translate(${px.toFixed(2)} ${py.toFixed(2)})`);
    };

    const onPointerMove = (event) => {
      lastPointerRef.current.x = event.clientX;
      lastPointerRef.current.y = event.clientY;
      showFirstVisitWelcome();
      if (!eyeRafRef.current) {
        eyeRafRef.current = requestAnimationFrame(aimEyes);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      clearTimeout(petTimerRef.current);
      clearTimeout(bubbleTimerRef.current);
      if (eyeRafRef.current) cancelAnimationFrame(eyeRafRef.current);
    };
  }, [finePointer, showFirstVisitWelcome]);

  const openChat = useCallback(() => {
    clearTimeout(closeTimerRef.current);
    clearTimeout(bubbleTimerRef.current);
    setWelcomeBubble(null);
    setPetBubble(null);
    setChatOpen(true);
  }, []);

  const scheduleCloseChat = useCallback(() => {
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      if (inputFocusedRef.current || pointerInsideRef.current) return;
      setChatOpen(false);
    }, 280);
  }, []);

  const forceCloseChat = useCallback(() => {
    clearTimeout(closeTimerRef.current);
    inputFocusedRef.current = false;
    pointerInsideRef.current = false;
    setInputFocused(false);
    setChatOpen(false);
  }, []);

  const handleWidgetEnter = useCallback(() => {
    pointerInsideRef.current = true;
    openChat();
  }, [openChat]);

  const handleWidgetLeave = useCallback(() => {
    pointerInsideRef.current = false;
    scheduleCloseChat();
  }, [scheduleCloseChat]);

  const handleInputFocus = useCallback(() => {
    inputFocusedRef.current = true;
    setInputFocused(true);
    clearTimeout(closeTimerRef.current);
  }, []);

  const handleInputBlur = useCallback(() => {
    inputFocusedRef.current = false;
    setInputFocused(false);
    window.requestAnimationFrame(() => {
      const focusInside = widgetRef.current?.contains(document.activeElement);
      if (!focusInside && !pointerInsideRef.current) {
        scheduleCloseChat();
      }
    });
  }, [scheduleCloseChat]);

  useEffect(() => {
    return () => {
      clearTimeout(closeTimerRef.current);
      clearTimeout(bubbleTimerRef.current);
      clearTimeout(petTimerRef.current);
    };
  }, []);

  const sendMessage = async (text) => {
    const clean = text.trim();
    if (!clean || loading) return;
    setInput("");
    setThinkingLine(THINKING_LINES[Math.floor(Math.random() * THINKING_LINES.length)]);
    const nextMessages = [...messages, { role: "user", text: clean }];
    setMessages(nextMessages);
    setLoading(true);
    track("ai_ask");

    const siteState = {
      theme,
      hackMode: crtMode,
      accent: accent || "mono",
      lastAction: lastActionRef.current,
    };

    try {
      const { reply, actions } = await askIshani(clean, {
        history: nextMessages.slice(-12),
        currentPath: location.pathname,
        siteState,
      });
      const actionLabel = actions.length ? runActions(actions) : "";
      setMessages((m) => [
        ...m,
        { role: "assistant", text: reply, actionLabel: actionLabel || undefined },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Something went wrong. Try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const send = () => sendMessage(input);

  useEffect(() => {
    if (chatOpen) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 220);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [chatOpen]);

  if (!finePointer) return null;

  const mood = loading ? "thinking" : chatOpen ? "excited" : "happy";
  const showSuggestions = messages.length <= 2 && !loading;
  const canSend = Boolean(input.trim()) && !loading;

  return createPortal(
    <div className="fixed left-7 bottom-4 z-[68] hidden md:block pointer-events-none">
      <div className="relative flex flex-col items-start">
        <motion.div
          ref={widgetRef}
          className="relative flex flex-col items-start pointer-events-auto"
          onMouseEnter={handleWidgetEnter}
          onMouseLeave={handleWidgetLeave}
        >
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                className="relative z-20 mb-3 w-[min(calc(100vw-2rem),380px)] flex flex-col max-h-[min(54vh,460px)] border-4 border-outline bg-[var(--color-surface)] shadow-[10px_10px_0_var(--shadow-color)] overflow-hidden"
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                role="dialog"
                aria-label="Kuro chat"
              >
              {/* Header */}
              <div className="flex items-center gap-3 border-b-4 border-outline px-3.5 py-3 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
                <div className="relative shrink-0">
                  <div className="border-2 border-[var(--color-on-primary-container)] bg-[var(--color-surface)] p-0.5">
                    <KuroFace pupilsRef={null} mood={mood} bliss={false} sleeping={false} robot={crtMode} size={36} />
                  </div>
                  <span
                    className={`absolute -right-1 -bottom-1 h-2.5 w-2.5 border-2 border-[var(--color-primary-container)] ${
                      loading ? "bg-[var(--color-surface-variant)] animate-pulse" : "bg-[#7dcea0]"
                    }`}
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <h2 className="font-label-bold uppercase text-sm tracking-[0.14em]">Kuro</h2>
                    <span className="font-mono text-[9px] uppercase opacity-65">
                      {loading ? "thinking" : "online"}
                    </span>
                  </div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] opacity-70 truncate">
                    Co-pilot · nav · hack · theme
                  </p>
                </div>
                <button
                  type="button"
                  onClick={forceCloseChat}
                  className="shrink-0 h-8 w-8 border-2 border-[var(--color-on-primary-container)] bg-[var(--color-surface)] text-[var(--color-on-surface)] font-label-bold text-xs hover:translate-x-px hover:translate-y-px transition-transform"
                  aria-label="Close chat"
                >
                  ✕
                </button>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto px-3.5 py-3.5 space-y-3.5 text-sm min-h-[140px] bg-[var(--color-surface)]"
                data-lenis-prevent
              >
                {hasStoredChat.current && messages.length > 1 && (
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--color-text-muted)] text-center">
                    Kuro remembers this visit
                  </p>
                )}

                {messages.map((msg, i) => {
                  const isUser = msg.role === "user";
                  return (
                    <motion.div
                      key={`${i}-${msg.role}`}
                      className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    >
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--color-text-muted)] px-0.5">
                        {isUser ? "You" : "Kuro"}
                      </span>
                      <div
                        className={`max-w-[92%] border-2 border-outline px-3 py-2.5 leading-snug shadow-[3px_3px_0_var(--shadow-color)] ${
                          isUser
                            ? "bg-[var(--color-on-background)] text-[var(--color-background)]"
                            : "bg-[var(--color-surface-variant)] text-[var(--color-on-surface)]"
                        }`}
                      >
                        {msg.text}
                      </div>
                      {msg.actionLabel && (
                        <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--color-text-muted)] px-0.5">
                          {msg.actionLabel}
                        </p>
                      )}
                    </motion.div>
                  );
                })}

                {loading && (
                  <motion.div
                    className="flex flex-col items-start gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--color-text-muted)] px-0.5">
                      Kuro
                    </span>
                    <div className="inline-flex items-center border-2 border-outline bg-[var(--color-surface-variant)] px-3 py-2.5 shadow-[3px_3px_0_var(--shadow-color)]">
                      <span className="font-mono text-xs text-[var(--color-text-muted)]">{thinkingLine}</span>
                      <ThinkingDots />
                    </div>
                  </motion.div>
                )}
                <div ref={endRef} />
              </div>

              {/* Suggestions */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    className="px-3.5 pb-3 flex flex-wrap gap-2 border-t-2 border-dashed border-outline"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <span className="w-full pt-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                      Try saying
                    </span>
                    {SUGGESTION_CHIPS.map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => sendMessage(chip.send)}
                        className="border-2 border-outline px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide bg-[var(--color-surface)] text-[var(--color-on-surface)] shadow-[2px_2px_0_var(--shadow-color)] hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)] hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0_var(--shadow-color)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Composer */}
              <div className="border-t-4 border-outline p-2.5 bg-[var(--color-surface-variant)]">
                <div
                  className={`flex gap-2 border-2 border-outline bg-[var(--color-surface)] p-1.5 shadow-[3px_3px_0_var(--shadow-color)] transition-shadow ${
                    inputFocused ? "shadow-[4px_4px_0_var(--shadow-color)]" : ""
                  }`}
                >
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder={placeholder}
                    className="flex-1 min-w-0 bg-transparent px-2 py-2 font-body-md text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-text-muted)] outline-none"
                    aria-label="Message Kuro"
                  />
                  <button
                    type="button"
                    onClick={send}
                    disabled={!canSend}
                    className={`shrink-0 border-2 border-outline px-3.5 py-2 font-label-bold uppercase text-xs tracking-wide transition-all ${
                      canSend
                        ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] shadow-[2px_2px_0_var(--shadow-color)] hover:translate-x-px hover:translate-y-px hover:shadow-none"
                        : "bg-[var(--color-surface-variant)] text-[var(--color-text-muted)] opacity-60 cursor-not-allowed"
                    }`}
                  >
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(welcomeBubble || petBubble) && !chatOpen && (
            <RouteBubble text={petBubble || welcomeBubble} />
          )}
        </AnimatePresence>

        <div className="relative z-10">
          <button
            ref={dogRef}
            type="button"
            onClick={petDog}
            onMouseEnter={() => setDogHovered(true)}
            onMouseLeave={() => setDogHovered(false)}
            onFocus={() => setDogHovered(true)}
            onBlur={() => setDogHovered(false)}
            className="block cursor-pointer bg-transparent border-0 p-0"
            aria-label={
              crtMode
                ? sleeping
                  ? "Kuro-bot is idle"
                  : "Interact with Kuro-bot"
                : sleeping
                  ? "Kuro is sleeping"
                  : bliss
                    ? "Kuro is enjoying pets"
                    : "Pet Kuro"
            }
          >
            <KuroFace
              pupilsRef={pupilsRef}
              mood={mood}
              bliss={bliss}
              sleeping={sleeping}
              robot={crtMode}
              size={68}
            />
          </button>
        </div>
      </motion.div>

      {/* Outside openChat hover root so Z clicks wake/pet without forcing the panel open */}
      <div className="absolute bottom-0 left-0 z-30 pointer-events-none" aria-hidden={!sleeping || chatOpen}>
        <div className="relative w-[68px] h-[68px]">
          <SleepSnores
            active={sleeping && !chatOpen}
            robot={crtMode}
            onPop={petDog}
          />
        </div>
      </div>
      </div>
    </div>,
    document.body,
  );
});

export default ChatWidget;
