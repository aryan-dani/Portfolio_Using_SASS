import { projects } from "../src/data/projects.js";
import { experiences, aboutInfo } from "../src/data/experience.js";
import { getAllSkills } from "../src/data/skills.js";
import { ACHIEVEMENTS } from "../src/data/achievements.js";
import {
  KURO_PAGES,
  KURO_TOOLS,
  PAGE_BY_ID,
  parseToolCalls,
  describeActions,
} from "./kuroTools.js";

const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const GROQ_FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || "openai/gpt-oss-20b";
const MAX_HISTORY = 12;

function cleanApiKey(value) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/^["'“”‘’`]+|["'“”‘’`]+$/g, "")
    .replace(/[^\x20-\x7E]/g, "");
}

const ROUTE_LIST = KURO_PAGES.map((r) => `${r.id} → ${r.path} (${r.label})`).join("\n");

const REACTION_ONLY =
  /^(wow|nice|crazy|damn|cool|lol|lmao|okay|ok|oh okay|yep|yeah|yup|haha|ha|omg|whoa|dang|sick|fire|lit|bet|word|true|facts|same|mood|fr|ngl|tbh|hm+|hmm+)[\s!.?]*$/i;

const SITE_CONTROL_PATTERNS = [
  /^(go to|take me to|navigate to?|open|show me|visit|bring me|head to|jump to)\b/i,
  /^hack\s*mode|hackmode|crt\s*mode|berserk|matrix\s*mode/i,
  /^(turn|switch)\s+(it\s+)?back|unhack|exit hack|normal mode|turn off hack/i,
  /^(toggle|switch)\s+(the\s+)?(theme|dark|light)|dark mode|light mode|flip the lights/i,
  /^scroll (to )?top|back to top/i,
  /^(open|show)\s+(the\s+)?(command\s+)?palette/i,
  /^(projects?|experience|skills?|about|contact|playground|guestbook|achievements?|certifications?|home|copyright)\s*[!.]?$/i,
];

const PORTFOLIO_QA_PATTERNS = [
  /\b(what|which|tell me about|how (do|did|can)|where (is|can)|who (is|built|made))\b/i,
  /\b(email|resume|github|stack|tech|skills?|projects?|experience|certifications?)\b/i,
  /\b(aryan|dani|developer|built this|portfolio)\b/i,
];

function buildKnowledgePack() {
  const projectLines = projects
    .slice(0, 14)
    .map(
      (p) =>
        `- ${p.title} (${p.year}): ${(p.tags || []).slice(0, 5).join(", ")} — ${p.description.slice(0, 130)}`,
    )
    .join("\n");

  const expLines = experiences
    .map((e) => {
      const highlight = e.links?.[0]?.name || "";
      return `- ${e.position} @ ${e.company} (${e.period})${highlight ? ` — ${highlight}` : ""}`;
    })
    .join("\n");

  const secretEggs = ACHIEVEMENTS.filter((a) => a.secret)
    .map((a) => `- ${a.title}: ${a.description}`)
    .join("\n");

  const topSkills = getAllSkills()
    .sort((a, b) => b.level - a.level)
    .slice(0, 24)
    .map((s) => s.name)
    .join(", ");

  return `Developer: ${aboutInfo.name}, ${aboutInfo.title}
Tagline: ${aboutInfo.tagline}
Email: ${aboutInfo.email}
Bio: ${aboutInfo.bio.slice(0, 480)}

Projects:
${projectLines}

Experience:
${expLines}

Top skills: ${topSkills}

Site features you can mention (not auto-trigger):
- Command palette: Ctrl+K
- Konami code / Ctrl+Alt+H: hack mode
- Pet Kuro (hover the dog), guestbook wall, achievement hunt
- Playground CLI: type help

Secret easter eggs (hint only, don't spoil):
${secretEggs}

Pages:
${ROUTE_LIST}`;
}

function formatSiteState(siteState, currentPath) {
  if (!siteState) return `Current page: ${currentPath}`;

  const lines = [
    `Current page: ${currentPath}`,
    `Theme: ${siteState.theme || "light"}`,
    `Hack mode (CRT): ${siteState.hackMode ? "ON" : "OFF"}`,
    `Accent: ${siteState.accent || "mono"}`,
  ];

  if (siteState.lastAction?.type) {
    const la = siteState.lastAction;
    const detail =
      la.type === "set_hack_mode"
        ? `set_hack_mode enabled=${la.enabled}`
        : la.type === "navigate"
          ? `navigate to ${la.label || la.page}`
          : la.type;
    lines.push(`Your last site action this session: ${detail}`);
  }

  return lines.join("\n");
}

function buildSystemPrompt({ currentPath = "/", siteState, intent }) {
  const intentNote =
    intent === "site_control"
      ? "The user explicitly asked for a site action. You may use tools ONLY if their message calls for it."
      : "Do NOT use site control tools. Chat only—react naturally, answer questions. No navigation, theme, or hack changes unless they clearly ask in a NEW message.";

  return `You are Kuro—a witty, loyal dog co-pilot on Aryan Dani's portfolio site. You live in the bottom-left mascot.

CHARACTER:
- 1–3 short sentences. Playful, cheeky, warm. Contractions OK.
- Loyal to Aryan, not a corporate bot. Never say "I obeyed" or act subservient.
- React to feelings first. Don't pitch pages unless they ask or conversation stalls.
- Vary your wording—don't repeat the same intro twice in one chat.
- Never say you can't control the site when they DO ask—but right now: ${intentNote}

ANTI-PATTERNS (never do these):
- Don't navigate or change theme/hack on reactions like "wow", "nice", "crazy", compliments.
- Don't repeat "I'm Kuro, the AI co-pilot" every turn.
- Don't force "want to see projects?" after every message.

EXAMPLES (match this tone):
User: "damn I like his portfolio" → "Right? Neo-brutalist flex. Want the project breakdown or just vibing?"
User: "wow" → "Yeah, it's a lot—in a good way."
User: "turn it back" → "CRT off. Back to normal."
User: "why did you turn hack mode on" → "You said hackmode—I'm not gonna pretend that was my idea."
User: "who are you" → "Kuro. I guard this portfolio and know where the good stuff is."

${formatSiteState(siteState, currentPath)}

${buildKnowledgePack()}`;
}

export function classifyIntent(message) {
  const q = message.trim().toLowerCase();

  if (REACTION_ONLY.test(q)) return "chat";

  if (SITE_CONTROL_PATTERNS.some((re) => re.test(q))) return "site_control";

  if (/^(who are you|what are you|why did you|why do you|how do you)\b/i.test(q)) return "chat";

  if (/like (his |this |the )?portfolio|love (his |this )?portfolio|great portfolio|nice portfolio/i.test(q)) {
    return "chat";
  }

  if (PORTFOLIO_QA_PATTERNS.some((re) => re.test(q))) return "portfolio_qa";

  return "chat";
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));
}

function messageAllowsAction(type, message) {
  const q = message.toLowerCase();

  switch (type) {
    case "navigate":
      return (
        /go to|take me|navigate|open|show me|visit|bring me|head to|jump to/i.test(q) ||
        /^(projects?|experience|skills?|about|contact|playground|guestbook|achievements?|certifications?|home|copyright)\s*[!.]?$/i.test(
          q.trim(),
        )
      );
    case "scroll_to_top":
      return /scroll|back to top|top of (the )?page/i.test(q);
    case "toggle_theme":
      return /theme|dark mode|light mode|flip the lights|toggle.*(dark|light)/i.test(q);
    case "set_hack_mode":
      return /hack|crt|berserk|matrix|unhack|turn.*back|normal mode|exit hack/i.test(q);
    case "set_accent":
      return /accent|palette|color/i.test(q);
    case "open_palette":
      return /palette|ctrl\+k|command palette|search/i.test(q);
    default:
      return true;
  }
}

export function filterActions(intent, message, actions) {
  if (intent !== "site_control" || !Array.isArray(actions)) return [];

  const filtered = actions.filter((action) => messageAllowsAction(action.type, message));
  return filtered.slice(0, 1);
}

/** Fallback when model forgets tools — site_control only. */
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

  const wantsNav =
    /go to|take me|navigate|open|show me|visit|bring me|head to|jump to/i.test(q) ||
    /^(projects?|experience|skills?|about|contact|playground|guestbook|achievements?|certifications?|home)\s*[!.]?$/i.test(
      q.trim(),
    );

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

  if (/hackmode|hack\s*mode|crt|berserk|matrix/.test(q) && !/unhack|exit|off|turn.*back|normal/.test(q)) {
    actions.push({ type: "set_hack_mode", enabled: true });
  }
  if (/unhack|exit hack|normal mode|turn.*back|turn it back/.test(q)) {
    actions.push({ type: "set_hack_mode", enabled: false });
  }
  if (/dark mode|light mode|toggle theme|flip the lights/.test(q)) {
    actions.push({ type: "toggle_theme" });
  }
  if (/scroll (to )?top|back to top/.test(q)) {
    actions.push({ type: "scroll_to_top" });
  }
  if (/command palette|open palette|ctrl\+k/.test(q)) {
    actions.push({ type: "open_palette" });
  }

  return actions;
}

export function parseActionsFromReply(text) {
  const match = text.match(/<actions>([\s\S]*?)<\/actions>/i);
  if (!match) return { reply: text.trim(), actions: [] };

  let actions = [];
  try {
    const raw = JSON.parse(match[1].trim());
    if (Array.isArray(raw)) {
      for (const item of raw) {
        if (!item?.type) continue;
        if (item.type === "navigate" && item.page && PAGE_BY_ID[item.page]) {
          actions.push({
            type: "navigate",
            page: item.page,
            path: PAGE_BY_ID[item.page].path,
            label: PAGE_BY_ID[item.page].label,
          });
        } else if (item.type === "toggle_theme") {
          actions.push({ type: "toggle_theme" });
        } else if (item.type === "set_hack_mode") {
          actions.push({ type: "set_hack_mode", enabled: !!item.enabled });
        } else if (item.type === "scroll_to_top") {
          actions.push({ type: "scroll_to_top" });
        } else if (item.type === "set_accent" && item.palette) {
          actions.push({ type: "set_accent", palette: item.palette });
        } else if (item.type === "open_palette") {
          actions.push({ type: "open_palette" });
        }
      }
    }
  } catch {
    actions = [];
  }

  const reply = text.replace(match[0], "").trim();
  return { reply: reply || "On it!", actions };
}

export async function generateKuroReply({ message, history, currentPath, siteState }, apiKey) {
  const key = cleanApiKey(apiKey);
  if (!key) {
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

  const intent = classifyIntent(message);
  const messages = [
    { role: "system", content: buildSystemPrompt({ currentPath, siteState, intent }) },
    ...normalizeHistory(history),
    { role: "user", content: message },
  ];

  const buildBody = (model) => {
    const body = {
      model,
      messages,
      max_tokens: 400,
      temperature: 0.42,
    };

    if (intent === "site_control") {
      body.tools = KURO_TOOLS;
      body.tool_choice = "auto";
    }
    return body;
  };

  const callGroq = async (model) => {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(buildBody(model)),
    });
    return response;
  };

  let response = await callGroq(GROQ_MODEL);
  if (!response.ok && response.status !== 429 && GROQ_FALLBACK_MODEL !== GROQ_MODEL) {
    // Deprecated / unavailable primary model → try the lighter fallback once.
    const primaryStatus = response.status;
    response = await callGroq(GROQ_FALLBACK_MODEL);
    if (!response.ok && primaryStatus === 400) {
      // Keep the later error path; both failed.
    }
  }

  if (!response.ok) {
    console.error("[kuro] Groq error", response.status);
    const err = new Error(
      response.status === 429
        ? "The model is busy. Try again in a moment."
        : "Kuro hit a snag talking to the model. Try again shortly.",
    );
    err.status = response.status === 429 ? 429 : 502;
    throw err;
  }

  const data = await response.json();
  const choice = data.choices?.[0]?.message;
  let reply = choice?.content?.trim() || "";
  let actions = parseToolCalls(choice?.tool_calls);

  if (!actions.length && intent === "site_control") {
    if (reply.includes("<actions>")) {
      const legacy = parseActionsFromReply(reply);
      reply = legacy.reply;
      actions = legacy.actions;
    } else {
      actions = inferActions(message, currentPath || "/");
    }
  }

  actions = filterActions(intent, message, actions);

  if (!reply) {
    reply = actions.length ? describeActions(actions) || "On it." : "What's on your mind?";
  }

  return { reply, actions, intent };
}
