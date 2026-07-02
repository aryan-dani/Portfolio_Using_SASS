export const ACHIEVEMENTS = [
  { id: "terminal_velocity", title: "Terminal Velocity", description: "Run 10 CLI commands in one session", icon: "⌨️", secret: false },
  { id: "night_owl", title: "Night Owl", description: "Toggle dark mode", icon: "🌙", secret: false },
  { id: "deep_diver", title: "Deep Diver", description: "Visit every portfolio page", icon: "🤿", secret: false },
  { id: "konami_kid", title: "Konami Kid", description: "Enter the Konami code", icon: "🎮", secret: true },
  { id: "speed_reader", title: "Speed Reader", description: "Scroll 10,000px in one session", icon: "📜", secret: false },
  { id: "certified_stalker", title: "Certified Stalker", description: "Open 5 project detail modals", icon: "👀", secret: false },
  { id: "hacker", title: "System Breach", description: "Complete the hack sequence", icon: "💀", secret: true },
  { id: "matrix", title: "Red Pill", description: "Witness the matrix rain", icon: "💊", secret: true },
  { id: "tea_time", title: "Tea Time", description: "Reject coffee the right way", icon: "🍵", secret: true },
  { id: "hired", title: "You're Hired", description: "Run sudo hire-me", icon: "📝", secret: true },
  { id: "idle_wake", title: "Power Nap", description: "Wake the site from deep idle", icon: "💤", secret: true },
  { id: "guestbook", title: "Signed The Wall", description: "Leave a guestbook message", icon: "✍️", secret: false },
  { id: "ai_curiosity", title: "AI Curious", description: "Ask Kuro a question", icon: "🤖", secret: false },
  { id: "dev_mode", title: "X-Ray Vision", description: "Enable the dev HUD", icon: "🔬", secret: true },
  { id: "breakout", title: "Brick Breaker", description: "Score in the 404 breakout game", icon: "🧱", secret: false },
  { id: "secret_agent", title: "Secret Agent", description: "Unlock every secret achievement", icon: "🕵️", secret: true },
];

export const ALL_PAGE_PATHS = [
  "/",
  "/projects",
  "/experience",
  "/certifications",
  "/skills",
  "/about",
  "/contact",
  "/playground",
  "/copyright",
  "/achievements",
  "/guestbook",
];

export function getAchievementById(id) {
  return ACHIEVEMENTS.find((a) => a.id === id) || null;
}
