import { projects } from "../src/data/projects.js";
import { experiences, aboutInfo } from "../src/data/experience.js";
import { getAllSkills } from "../src/data/skills.js";
import { ISHANI_PAGES, PAGE_BY_ID } from "./ishaniTools.js";

const GROQ_MODEL = "llama-3.3-70b-versatile";
const MAX_HISTORY = 8;

const ROUTE_LIST = ISHANI_PAGES.map((r) => `${r.id} → ${r.path} (${r.label})`).join("\n");

const ACTION_HELP = `Site control: when the user wants an action, end your reply with ONE line:
<actions>[...]</actions>

Valid actions (use only when needed):
{"type":"navigate","page":"projects"} (pages: ${ISHANI_PAGES.map((p) => p.id).join(", ")})
{"type":"toggle_theme"}
{"type":"set_hack_mode","enabled":true|false}
{"type":"scroll_to_top"}
{"type":"set_accent","palette":"mono"}
{"type":"open_palette"}

Example: "Projects coming right up!" then <actions>[{"type":"navigate","page":"projects"}]</actions>`;

function buildSystemPrompt(currentPath = "/") {
  return `You are Kuro, the AI co-pilot embedded in Aryan Dani's portfolio.
You CONTROL this website: navigate pages, toggle theme, hack mode, accents, scroll top, command palette.

RULES:
- Short replies (1-3 sentences), playful, confident dog energy.
- NEVER say you cannot navigate or control the site. You can and must use <actions> when asked.
- Portfolio Q&A from data below only.

Current page: ${currentPath}
${ACTION_HELP}

Pages:
${ROUTE_LIST}

Developer: ${aboutInfo.name}, ${aboutInfo.title}
Email: ${aboutInfo.email}
Bio: ${aboutInfo.bio.slice(0, 500)}

Projects:
${projects.map((p) => `- ${p.title} (${p.year}): ${p.description.slice(0, 160)}`).join("\n")}

Experience:
${experiences.map((e) => `- ${e.position} @ ${e.company} (${e.period})`).join("\n")}

Top skills: ${getAllSkills()
  .sort((a, b) => b.level - a.level)
  .slice(0, 20)
  .map((s) => s.name)
  .join(", ")}`;
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));
}

function normalizeActions(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw) {
    if (!item || typeof item.type !== "string") continue;
    switch (item.type) {
      case "navigate": {
        const page = item.page;
        if (page && PAGE_BY_ID[page]) {
          out.push({
            type: "navigate",
            page,
            path: PAGE_BY_ID[page].path,
            label: PAGE_BY_ID[page].label,
          });
        }
        break;
      }
      case "toggle_theme":
        out.push({ type: "toggle_theme" });
        break;
      case "set_hack_mode":
        out.push({ type: "set_hack_mode", enabled: !!item.enabled });
        break;
      case "scroll_to_top":
        out.push({ type: "scroll_to_top" });
        break;
      case "set_accent":
        if (item.palette) out.push({ type: "set_accent", palette: item.palette });
        break;
      case "open_palette":
        out.push({ type: "open_palette" });
        break;
      default:
        break;
    }
  }
  return out;
}

export function parseActionsFromReply(text) {
  const match = text.match(/<actions>([\s\S]*?)<\/actions>/i);
  if (!match) return { reply: text.trim(), actions: [] };

  let actions = [];
  try {
    actions = normalizeActions(JSON.parse(match[1].trim()));
  } catch {
    actions = [];
  }

  const reply = text.replace(match[0], "").trim();
  return { reply: reply || "On it!", actions };
}

/** Quick intent fallback when the model forgets action tags. */
function inferActions(message, currentPath) {
  const q = message.toLowerCase();
  const actions = [];

  const navPatterns = [
    [/projects?/, "projects"],
    [/experience|work|jobs?/, "experience"],
    [/skills?/, "skills"],
    [/about/, "about"],
    [/contact/, "contact"],
    [/cert/, "certifications"],
    [/playground|terminal|cli/, "playground"],
    [/achievements?|trophies/, "achievements"],
    [/guestbook/, "guestbook"],
    [/home|landing/, "home"],
    [/copyright/, "copyright"],
  ];

  const wantsNav = /go to|take me|navigate|open|show me|visit|bring me|head to|jump to/.test(q);
  if (wantsNav) {
    for (const [re, page] of navPatterns) {
      if (re.test(q)) {
        const p = PAGE_BY_ID[page];
        if (p && p.path !== currentPath) {
          actions.push({ type: "navigate", page, path: p.path, label: p.label });
        }
        break;
      }
    }
  }

  if (/hack|crt|berserk|matrix/.test(q) && !/unhack|exit|off/.test(q)) {
    actions.push({ type: "set_hack_mode", enabled: true });
  }
  if (/unhack|exit hack|normal mode/.test(q)) {
    actions.push({ type: "set_hack_mode", enabled: false });
  }
  if (/dark mode|light mode|toggle theme|flip the lights/.test(q)) {
    actions.push({ type: "toggle_theme" });
  }
  if (/scroll (to )?top|back to top/.test(q)) {
    actions.push({ type: "scroll_to_top" });
  }

  return actions;
}

export async function generateIshaniReply({ message, history, currentPath }, apiKey) {
  if (!apiKey) {
    const err = new Error(
      "Kuro is not configured. Add GROQ_API_KEY to frontend/.env.local (free at console.groq.com/keys), then restart npm run dev.",
    );
    err.status = 503;
    throw err;
  }

  if (!message || typeof message !== "string" || message.length > 500) {
    const err = new Error("Invalid message");
    err.status = 400;
    throw err;
  }

  const messages = [
    { role: "system", content: buildSystemPrompt(currentPath) },
    ...normalizeHistory(history),
    { role: "user", content: message },
  ];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: 400,
      temperature: 0.55,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const err = new Error(errBody.error?.message || `Groq API error ${response.status}`);
    err.status = 500;
    throw err;
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content?.trim() || "";
  let { reply, actions } = parseActionsFromReply(raw);

  if (!actions.length) {
    actions = inferActions(message, currentPath || "/");
  }

  if (!reply) {
    reply = actions.length ? "On it." : "What should we do next?";
  }

  return { reply, actions };
}
