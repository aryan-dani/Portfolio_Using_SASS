/** Kuro welcome + per-page first-visit lines. */
export const KURO_WELCOME_KEY = "portfolio_kuro_welcome";
export const KURO_PAGES_KEY = "portfolio_kuro_pages";
const LEGACY_WELCOME_KEY = "portfolio_ishani_welcome";

export const KURO_WELCOME_LINES = [
  "Hey—I'm Kuro. Ask about Aryan, or tell me where to go.",
  "Yo. I'm the dog in the corner. Projects, hack mode, whatever—your call.",
  "What's up. I'm Kuro. Compliments welcome. Random theme flips, not so much.",
];

export const KURO_PAGE_LINES = {
  "/": [
    "Welcome home! Check out the globe or jump straight to projects.",
    "First time here? This is the launch pad. Ask me anything!",
  ],
  "/projects": [
    "Projects time! These are the builds I'm most proud of.",
    "First look at the work? Tell me a stack and I'll point you to a match.",
  ],
  "/experience": [
    "Career timeline unlocked! Expand any role for the full story.",
    "New to the resume rail? Click a dot for details.",
  ],
  "/skills": [
    "Skills vault! Search or filter by category.",
    "First visit? Ask me what I use for AI or full-stack work.",
  ],
  "/about": [
    "About page! GitHub stats and the backstory live here.",
    "First time? The live GitHub feed is worth a scroll.",
  ],
  "/contact": [
    "Contact zone! Email, form, or socials. Go say hi.",
    "Need to reach out? I can copy my email for you.",
  ],
  "/playground": [
    "CLI playground! Type `help` and go wild.",
    "Terminal mode! Try `hack` or `ask` when you're ready.",
  ],
  "/certifications": [
    "Certs loaded! Filters help if the list looks long.",
    "Credential wall! Good place to see what I've validated.",
  ],
  "/achievements": [
    "Achievement hunt! Explore the site to unlock trophies.",
    "Gamified portfolio! See how many you can trigger.",
  ],
  "/guestbook": [
    "Guestbook! Leave a note on the wall.",
    "First time? Sign the wall before you bounce.",
  ],
};

const DEFAULT_PAGE_LINES = [
  "New page! Ask me to navigate anywhere on the site.",
  "First time here? I'm Kuro. Tell me where you want to go next!",
];

export function getKuroWelcomeLine() {
  return KURO_WELCOME_LINES[Math.floor(Math.random() * KURO_WELCOME_LINES.length)];
}

export function getKuroPageLine(pathname) {
  const lines = KURO_PAGE_LINES[pathname] || DEFAULT_PAGE_LINES;
  return lines[Math.floor(Math.random() * lines.length)];
}

function readVisitedPages() {
  try {
    const raw = localStorage.getItem(KURO_PAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function hasVisitedPage(pathname) {
  return readVisitedPages().includes(pathname);
}

export function markPageVisited(pathname) {
  try {
    const pages = readVisitedPages();
    if (!pages.includes(pathname)) {
      pages.push(pathname);
      localStorage.setItem(KURO_PAGES_KEY, JSON.stringify(pages));
    }
  } catch {
    /* ignore */
  }
}

export function hasMetKuro() {
  try {
    if (localStorage.getItem(KURO_WELCOME_KEY) === "true") return true;
    if (localStorage.getItem(LEGACY_WELCOME_KEY) === "true") {
      localStorage.setItem(KURO_WELCOME_KEY, "true");
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

export function markKuroMet() {
  try {
    localStorage.setItem(KURO_WELCOME_KEY, "true");
  } catch {
    /* ignore */
  }
}

/** @deprecated use Kuro exports */
export const ISHANI_WELCOME_KEY = KURO_WELCOME_KEY;
export const getIshaniWelcomeLine = getKuroWelcomeLine;
export const hasMetIshani = hasMetKuro;
export const markIshaniMet = markKuroMet;
