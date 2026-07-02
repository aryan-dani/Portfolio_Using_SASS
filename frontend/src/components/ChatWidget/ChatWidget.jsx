import { memo, useCallback, useEffect, useRef, useState } from "react";

import { createPortal } from "react-dom";

import { motion, AnimatePresence } from "framer-motion";

import { useLocation, useNavigate } from "react-router-dom";

import { useAchievements } from "../../context/AchievementContext";

import { useTheme } from "../../context/ThemeContext";

import { isFinePointerDevice } from "../../utils/device";

import { useSiteIdle } from "../../hooks/useSiteIdle";

import { askIshani } from "../../utils/askIshani";

import { executeIshaniActions } from "../../utils/ishaniActions";

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



const OUTLINE = "#131316";
const FUR = "#f0d4a8";
const FUR_EAR = "#b8894f";
const SNOUT = "#faecd8";

function SleepSnores({ active }) {
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
      setSnores((prev) => [...prev.slice(-5), { id, x: 36 + Math.random() * 28, size: 9 + Math.random() * 5 }]);
    };

    spawn();
    const timer = window.setInterval(spawn, 750);
    return () => clearInterval(timer);
  }, [active]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden="true">
      <AnimatePresence>
        {snores.map((snore) => (
          <motion.span
            key={snore.id}
            className="absolute font-label-bold text-[#131316] leading-none select-none"
            style={{ left: snore.x, bottom: "58%", fontSize: snore.size }}
            initial={{ opacity: 1, y: 0, x: 0 }}
            animate={{ opacity: 0, y: -32, x: 14 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
          >
            z
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

const KuroFace = memo(function KuroFace({ pupilsRef, mood, bliss, sleeping, size = 68 }) {
  const thinking = mood === "thinking";
  const asleep = sleeping && !bliss && !thinking;

  return (
    <motion.svg
      viewBox="18 10 60 52"
      width={size}
      height={size}
      className="shrink-0 drop-shadow-[3px_3px_0_var(--shadow-color)]"
      aria-hidden="true"
      animate={
        asleep
          ? { y: [0, 1.5, 0], rotate: [0, 1.2, 0, -1.2, 0] }
          : bliss
            ? { y: -1.5, rotate: -2, scale: 1.04 }
            : { y: 0, scale: 1, rotate: 0 }
      }
      transition={
        asleep
          ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
          : { type: "spring", stiffness: 420, damping: 24 }
      }
    >
      {/* Ears */}
      <motion.g
        animate={bliss ? { rotate: -28 } : { rotate: -22 }}
        transition={{ type: "spring", stiffness: 420, damping: 24 }}
        style={{ transformOrigin: "26px 24px", transformBox: "fill-box" }}
      >
        <rect x="21" y="14" width="11" height="20" fill={FUR_EAR} stroke={OUTLINE} strokeWidth="2" />
      </motion.g>
      <motion.g
        animate={bliss ? { rotate: 28 } : { rotate: 22 }}
        transition={{ type: "spring", stiffness: 420, damping: 24 }}
        style={{ transformOrigin: "70px 24px", transformBox: "fill-box" }}
      >
        <rect x="64" y="14" width="11" height="20" fill={FUR_EAR} stroke={OUTLINE} strokeWidth="2" />
      </motion.g>

      {/* Head */}
      <rect x="28" y="20" width="40" height="36" fill={FUR} stroke={OUTLINE} strokeWidth="2.5" />

      {/* Cheek blush when petted / hovered */}
      {bliss && (
        <>
          <rect x="29" y="39" width="7" height="4" fill="#e8a898" opacity="0.55" />
          <rect x="60" y="39" width="7" height="4" fill="#e8a898" opacity="0.55" />
        </>
      )}

      {/* Muzzle */}
      <rect x="34" y="42" width="28" height="14" fill={SNOUT} stroke={OUTLINE} strokeWidth="2" />

      {asleep ? (
        <>
          <line x1="33" y1="35" x2="41" y2="35" stroke={OUTLINE} strokeWidth="2" strokeLinecap="square" />
          <line x1="55" y1="35" x2="63" y2="35" stroke={OUTLINE} strokeWidth="2" strokeLinecap="square" />
        </>
      ) : bliss ? (
        <>
          <polyline points="32,36 37,31 42,36" fill="none" stroke={OUTLINE} strokeWidth="2.25" strokeLinejoin="miter" strokeLinecap="square" />
          <polyline points="54,36 59,31 64,36" fill="none" stroke={OUTLINE} strokeWidth="2.25" strokeLinejoin="miter" strokeLinecap="square" />
        </>
      ) : (
        <motion.g
          animate={
            thinking
              ? { opacity: 1 }
              : { scaleY: [1, 1, 0.08, 1, 1] }
          }
          transition={
            thinking
              ? { duration: 0.2 }
              : { duration: 0.26, times: [0, 0.44, 0.5, 0.56, 1], repeat: Infinity, repeatDelay: 4.5 }
          }
          style={{ transformOrigin: "48px 33px" }}
        >
          <rect x="31" y="27" width="12" height="12" fill="#fff" stroke={OUTLINE} strokeWidth="2" />
          <rect x="53" y="27" width="12" height="12" fill="#fff" stroke={OUTLINE} strokeWidth="2" />
          <g ref={pupilsRef}>
            <rect x="35" y="31" width="5" height="5" fill={OUTLINE} />
            <rect x="57" y="31" width="5" height="5" fill={OUTLINE} />
            <rect x="36" y="32" width="2" height="2" fill="#fff" />
            <rect x="58" y="32" width="2" height="2" fill="#fff" />
          </g>
        </motion.g>
      )}

      {/* Nose */}
      <rect x="44" y="44" width="8" height="6" fill={OUTLINE} />
      {bliss && <rect x="46" y="45" width="2" height="1.5" fill="#5a5960" opacity="0.45" />}

      {!asleep && thinking && (
        <line x1="43" y1="52" x2="53" y2="52" stroke={OUTLINE} strokeWidth="2" strokeLinecap="square" />
      )}

      {thinking && !asleep && (
        <text x="64" y="24" fontSize="9" fontWeight="bold" fill={OUTLINE}>?</text>
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



const ChatWidget = memo(function ChatWidget() {

  const finePointer = isFinePointerDevice();

  const isIdle = useSiteIdle(9000);

  const [chatOpen, setChatOpen] = useState(false);

  const [welcomeBubble, setWelcomeBubble] = useState(null);

  const [petBubble, setPetBubble] = useState(null);

  const [petting, setPetting] = useState(false);

  const [dogHovered, setDogHovered] = useState(false);

  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([

    {

      role: "assistant",

      text: "Hey! I'm Kuro. Ask me to navigate, toggle themes, or hack the site!",

    },

  ]);

  const [loading, setLoading] = useState(false);

  const { track } = useAchievements();

  const { toggleTheme, setCrtMode, setAccent } = useTheme();

  const navigate = useNavigate();

  const location = useLocation();

  const endRef = useRef(null);

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

      });

    },

    [navigate, toggleTheme, setCrtMode, setAccent, track],

  );



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



  const closeChat = useCallback(() => {

    closeTimerRef.current = window.setTimeout(() => {

      setChatOpen(false);

    }, 280);

  }, []);



  const send = async () => {

    const text = input.trim();

    if (!text || loading) return;

    setInput("");

    const nextMessages = [...messages, { role: "user", text }];

    setMessages(nextMessages);

    setLoading(true);

    track("ai_ask");

    try {

      const { reply, actions } = await askIshani(text, {

        history: nextMessages.slice(-8),

        currentPath: location.pathname,

      });

      setMessages((m) => [...m, { role: "assistant", text: reply }]);

      if (actions.length) runActions(actions);

    } catch (e) {

      setMessages((m) => [...m, { role: "assistant", text: e.message }]);

    } finally {

      setLoading(false);

    }

  };



  if (!finePointer) return null;



  const mood = loading ? "thinking" : chatOpen ? "excited" : "happy";



  return createPortal(

    <div className="fixed left-7 bottom-4 z-[68] hidden md:block pointer-events-none">

      <motion.div

        className="relative flex flex-col items-start pointer-events-auto"

        onMouseEnter={openChat}

        onMouseLeave={closeChat}

      >

        <AnimatePresence>
          {chatOpen && (
            <motion.div
              className="relative z-20 w-[min(calc(100vw-2rem),340px)] border-4 border-outline bg-[var(--color-surface)] shadow-[8px_8px_0_var(--shadow-color)] flex flex-col max-h-[min(46vh,400px)] mb-2"

              initial={{ opacity: 0, y: 8, scale: 0.98 }}

              animate={{ opacity: 1, y: 0, scale: 1 }}

              exit={{ opacity: 0, y: 6, scale: 0.98 }}

              transition={{ type: "spring", stiffness: 400, damping: 28 }}

              role="dialog"

              aria-label="Kuro chat"

            >

              <div className="flex items-center justify-between border-b-4 border-outline px-3 py-2.5 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">

                <span className="font-label-bold uppercase text-sm tracking-wide">Kuro</span>

                <span className="font-mono text-[10px] uppercase opacity-70">nav · hack · theme</span>

              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm min-h-[112px]" data-lenis-prevent>

                {messages.map((msg, i) => (

                  <div

                    key={i}

                    className={`border-2 border-outline p-2 ${

                      msg.role === "user"

                        ? "bg-[var(--color-on-background)] text-[var(--color-background)] ml-4"

                        : "bg-[var(--color-surface-variant)] mr-4"

                    }`}

                  >

                    {msg.text}

                  </div>

                ))}

                {loading && <p className="font-mono text-xs animate-pulse">thinking…</p>}

                <div ref={endRef} />

              </div>

              <div className="border-t-4 border-outline p-2 flex gap-2">

                <input

                  value={input}

                  onChange={(e) => setInput(e.target.value)}

                  onKeyDown={(e) => e.key === "Enter" && send()}

                  placeholder="Go to projects, hack mode, dark theme…"

                  className="flex-1 border-2 border-outline px-2 py-2 bg-[var(--color-surface)] font-body-md text-sm"

                />

                <button

                  type="button"

                  onClick={send}

                  className="border-2 border-outline px-3 font-label-bold uppercase text-xs bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"

                >

                  Send

                </button>

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
          <SleepSnores active={sleeping && !chatOpen} />
          <button
            ref={dogRef}
            type="button"
            onClick={petDog}
            onMouseEnter={() => setDogHovered(true)}
            onMouseLeave={() => setDogHovered(false)}
            onFocus={() => setDogHovered(true)}
            onBlur={() => setDogHovered(false)}
            className="block cursor-pointer bg-transparent border-0 p-0"
            aria-label={sleeping ? "Kuro is sleeping" : bliss ? "Kuro is enjoying pets" : "Pet Kuro"}
          >
            <KuroFace
              pupilsRef={pupilsRef}
              mood={mood}
              bliss={bliss}
              sleeping={sleeping}
              size={68}
            />
          </button>
        </div>

      </motion.div>

    </div>,

    document.body,

  );

});



export default ChatWidget;


