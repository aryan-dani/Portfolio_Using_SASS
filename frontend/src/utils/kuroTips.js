const TIP_POOL = {
  "/": [
    { label: "Projects", send: "go to projects" },
    { label: "Hack mode", send: "hack mode" },
    { label: "Who built this?", send: "Who built this?" },
    { label: "Swiggy Nexus", send: "Tell me about Swiggy Nexus" },
    { label: "Aegis vault", send: "Tell me about Aegis" },
    { label: "Pet tip", send: "What can you do?" },
  ],
  "/projects": [
    { label: "Swiggy Nexus", send: "Tell me about Swiggy Nexus" },
    { label: "Aegis", send: "Tell me about Aegis" },
    { label: "Samiksha", send: "What is Samiksha?" },
    { label: "Stack match", send: "Which projects use React?" },
    { label: "Open skills", send: "go to skills" },
    { label: "Live demos", send: "Which projects have a live demo?" },
  ],
  "/skills": [
    { label: "Rust / Tauri", send: "Does he use Rust?" },
    { label: "AI stack", send: "What AI tools does he use?" },
    { label: "See projects", send: "go to projects" },
    { label: "Who built this?", send: "Who built this?" },
  ],
  "/experience": [
    { label: "Latest role", send: "Summarize his experience" },
    { label: "Resume", send: "Where is the resume?" },
    { label: "Projects", send: "go to projects" },
  ],
  "/about": [
    { label: "GitHub stats", send: "Tell me about his GitHub" },
    { label: "Contact", send: "go to contact" },
    { label: "Email", send: "What's his email?" },
  ],
  "/contact": [
    { label: "Copy email", send: "What's his email?" },
    { label: "Projects", send: "go to projects" },
    { label: "Guestbook", send: "go to guestbook" },
  ],
  "/playground": [
    { label: "sudo hire-me", send: "What does sudo hire-me do?" },
    { label: "Hack mode", send: "hack mode" },
    { label: "Konami tip", send: "How do I enable hack mode?" },
  ],
  "/guestbook": [
    { label: "Sign the wall", send: "How does the guestbook work?" },
    { label: "Projects", send: "go to projects" },
  ],
  "/achievements": [
    { label: "Secret eggs", send: "Any easter eggs?" },
    { label: "Hack mode", send: "hack mode" },
    { label: "Home", send: "go to home" },
  ],
};

const FALLBACK_TIPS = [
  { label: "Projects", send: "go to projects" },
  { label: "Hack mode", send: "hack mode" },
  { label: "Who built this?", send: "Who built this?" },
  { label: "Aegis", send: "Tell me about Aegis" },
  { label: "Swiggy Nexus", send: "Tell me about Swiggy Nexus" },
  { label: "Skills", send: "go to skills" },
  { label: "Email", send: "What's his email?" },
];

const PLACEHOLDERS = [
  "Ask about Aryan, or say go to projects",
  "Try: who built this?",
  "Try: tell me about Swiggy Nexus",
  "Try: tell me about Aegis",
  "Try: take me to skills",
  "Try: how do I enable hack mode?",
];

const RECENT_KEY = "portfolio_kuro_tip_recent";

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function readRecent() {
  try {
    const raw = sessionStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecent(labels) {
  try {
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(labels.slice(-9)));
  } catch {
    /* ignore */
  }
}

/** Pick 3 suggestion chips for the current path, avoiding recently shown labels. */
export function getDynamicSuggestionChips(pathname = "/") {
  const pool = [...(TIP_POOL[pathname] || []), ...FALLBACK_TIPS];
  const recent = new Set(readRecent());
  const fresh = pool.filter((tip) => !recent.has(tip.label));
  const source = fresh.length >= 3 ? fresh : pool;
  const unique = [];
  const seen = new Set();
  for (const tip of shuffle(source)) {
    if (seen.has(tip.label)) continue;
    seen.add(tip.label);
    unique.push(tip);
    if (unique.length >= 3) break;
  }
  writeRecent([...readRecent(), ...unique.map((t) => t.label)]);
  return unique;
}

export function getDynamicPlaceholder() {
  return PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];
}
