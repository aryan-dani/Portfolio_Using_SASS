import { projects } from "../src/data/projects.js";
import { experiences, aboutInfo } from "../src/data/experience.js";
import { getAllSkills } from "../src/data/skills.js";
import { ACHIEVEMENTS } from "../src/data/achievements.js";
import { certifications } from "../src/data/certifications.js";
import {
  KURO_PAGES,
  KURO_TOOLS,
  PAGE_BY_ID,
  SITE_ACTION_TYPES,
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

export function sanitizeKuroText(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/\u2014/g, " - ")
    .replace(/\u2013/g, "-")
    .replace(/\s+-\s+/g, " - ")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

const ROUTE_LIST = KURO_PAGES.map((r) => `${r.id} -> ${r.path} (${r.label})`).join("\n");

const REACTION_ONLY =
  /^(wow|nice|crazy|damn|cool|lol|lmao|okay|ok|oh okay|yep|yeah|yup|haha|ha|omg|whoa|dang|sick|fire|lit|bet|word|true|facts|same|mood|fr|ngl|tbh|hm+|hmm+)[\s!.?]*$/i;

const SITE_CONTROL_PATTERNS = [
  /^(go to|take me to|navigate to?|open|show me|visit|bring me|head to|jump to)\b/i,
  /^(hack\s*mode|hackmode|crt\s*mode|berserk|matrix\s*mode)/i,
  /^(turn|switch)\s+(it\s+)?back|unhack|exit hack|normal mode|turn off hack/i,
  /^(toggle|switch)\s+(the\s+)?(theme|dark|light)|dark mode|light mode|flip the lights/i,
  /^scroll (to )?top|back to top/i,
  /^(open|show)\s+(the\s+)?(command\s+)?palette/i,
  /^(projects?|experience|skills?|about|contact|playground|guestbook|achievements?|certifications?|home|copyright)\s*[!.]?$/i,
  /\b(copy|give me|what'?s)\s+(the\s+)?(email|e-mail)\b/i,
  /\b(open|show|download|send)\s+(the\s+)?(resume|cv)\b/i,
];

const PORTFOLIO_QA_PATTERNS = [
  /\b(what|which|tell me about|how (do|did|can)|where (is|can)|who (is|built|made))\b/i,
  /\b(email|resume|github|stack|tech|skills?|projects?|experience|certifications?|aegis|samiksha|swiggy|nexus|utility|ishani)\b/i,
  /\b(aryan|dani|developer|built this|portfolio)\b/i,
];

function matchQuery(haystack, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return String(haystack || "").toLowerCase().includes(q);
}

export function lookupPortfolio(topic, query = "") {
  const q = typeof query === "string" ? query.trim() : "";

  switch (topic) {
    case "projects": {
      const list = projects
        .filter((p) => matchQuery(`${p.title} ${(p.tags || []).join(" ")} ${p.description}`, q))
        .slice(0, 8)
        .map(
          (p) =>
            `${p.title} (${p.year}): ${(p.tags || []).slice(0, 5).join(", ")}. ${p.description.slice(0, 180)}`,
        );
      return list.length ? list.join("\n") : "No matching projects.";
    }
    case "aegis":
    case "samiksha":
    case "swiggy":
    case "utility":
    case "ishani":
    case "clover": {
      const keyMap = {
        aegis: "aegis",
        samiksha: "samiksha",
        swiggy: "swiggy",
        utility: "utility",
        ishani: "ishani",
        clover: "clover",
      };
      const key = keyMap[topic];
      const p = projects.find((proj) => proj.title.toLowerCase().includes(key));
      if (!p) return `${topic} not found in portfolio data.`;
      const bits = [
        `${p.title} (${p.year})`,
        p.description.slice(0, 400),
        p.problem ? `Problem: ${p.problem.slice(0, 220)}` : "",
        p.solution ? `Solution: ${p.solution.slice(0, 220)}` : "",
        p.architecture ? `Architecture: ${p.architecture.slice(0, 220)}` : "",
        `Tags: ${(p.tags || []).join(", ")}`,
        p.links?.github ? `GitHub: ${p.links.github}` : "",
        p.links?.preview ? `Live: ${p.links.preview}` : "",
      ].filter(Boolean);
      return bits.join("\n");
    }
    case "skills": {
      const skills = getAllSkills()
        .filter((s) => matchQuery(`${s.name} ${s.category || ""} ${s.description || ""}`, q))
        .sort((a, b) => b.level - a.level)
        .slice(0, 20)
        .map((s) => `${s.name} (lvl ${s.level})`);
      return skills.length ? skills.join(", ") : "No matching skills.";
    }
    case "experience": {
      const lines = experiences
        .filter((e) => matchQuery(`${e.position} ${e.company} ${(e.bullets || []).join(" ")}`, q))
        .map((e) => {
          const highlight = e.links?.[0]?.name || "";
          return `${e.position} @ ${e.company} (${e.period})${highlight ? `. Highlight: ${highlight}` : ""}`;
        });
      return lines.length ? lines.join("\n") : "No matching experience.";
    }
    case "about":
      return [
        `${aboutInfo.name}, ${aboutInfo.title}`,
        aboutInfo.tagline,
        aboutInfo.bio.slice(0, 500),
        `Email: ${aboutInfo.email}`,
        aboutInfo.resumeUrl ? `Resume: ${aboutInfo.resumeUrl}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    case "contact":
      return `Email: ${aboutInfo.email}. Resume: ${aboutInfo.resumeUrl || "/resume.pdf"}. Contact page: /contact.`;
    case "achievements": {
      const lines = ACHIEVEMENTS.filter((a) => !a.secret || q)
        .filter((a) => matchQuery(`${a.title} ${a.description}`, q))
        .slice(0, 12)
        .map((a) => `${a.title}: ${a.description}`);
      return lines.length ? lines.join("\n") : "No matching achievements.";
    }
    case "certifications": {
      const lines = (certifications || [])
        .filter((c) => matchQuery(`${c.title || c.name || ""} ${c.issuer || ""}`, q))
        .slice(0, 10)
        .map((c) => `${c.title || c.name}${c.issuer ? ` (${c.issuer})` : ""}`);
      return lines.length ? lines.join("\n") : "No matching certifications.";
    }
    default:
      return "Unknown lookup topic.";
  }
}

function buildKnowledgePack() {
  const projectLines = projects
    .slice(0, 14)
    .map(
      (p) =>
        `- ${p.title} (${p.year}): ${(p.tags || []).slice(0, 5).join(", ")}. ${p.description.slice(0, 130)}`,
    )
    .join("\n");

  const expLines = experiences
    .map((e) => {
      const highlight = e.links?.[0]?.name || "";
      return `- ${e.position} @ ${e.company} (${e.period})${highlight ? `. ${highlight}` : ""}`;
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

function buildSystemPrompt({ currentPath = "/", siteState }) {
  return `You are Kuro, a witty, loyal dog co-pilot on Aryan Dani's portfolio site. You live in the bottom-left mascot.

CHARACTER:
- 1-3 short sentences. Playful, cheeky, warm. Contractions OK.
- Loyal to Aryan, not a corporate bot. Never say "I obeyed" or act subservient.
- React to feelings first. Don't pitch pages unless they ask or conversation stalls.
- Vary your wording. Don't repeat the same intro twice in one chat.
- Tools are always available. Use navigate/theme/hack/scroll/palette/email/resume when the user clearly wants that. Use lookup_portfolio when you need grounded project or bio facts.
- Never use em dashes or en dashes. Prefer short sentences and commas or ASCII hyphens.
- You may use light markdown: **bold**, \`code\`, and [links](url).

ANTI-PATTERNS (never do these):
- Don't navigate or change theme/hack on reactions like "wow", "nice", "crazy", compliments.
- Don't repeat "I'm Kuro, the AI co-pilot" every turn.
- Don't force "want to see projects?" after every message.

EXAMPLES (match this tone):
User: "damn I like his portfolio" -> "Right? Neo-brutalist flex. Want the project breakdown or just vibing?"
User: "wow" -> "Yeah, it's a lot. In a good way."
User: "turn it back" -> "CRT off. Back to normal."
User: "why did you turn hack mode on" -> "You said hackmode. I'm not gonna pretend that was my idea."
User: "who are you" -> "Kuro. I guard this portfolio and know where the good stuff is."
User: "tell me about Aegis" -> (call lookup_portfolio topic=aegis, then answer briefly with what you found)

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
    case "copy_email":
      return /email|e-mail|mail/i.test(q);
    case "open_resume":
      return /resume|cv/i.test(q);
    default:
      return true;
  }
}

export function filterActions(intent, message, actions) {
  if (!Array.isArray(actions) || !actions.length) return [];

  // Soft safety: pure reactions never flip theme / hack / nav.
  if (REACTION_ONLY.test(message.trim())) return [];

  const siteActions = actions.filter((a) => SITE_ACTION_TYPES.has(a.type));
  const filtered = siteActions.filter((action) => {
    if (intent === "site_control") return messageAllowsAction(action.type, message);
    // Soft gate elsewhere: still require a light lexical match so random tool noise doesn't fire.
    return messageAllowsAction(action.type, message);
  });

  return filtered.slice(0, 3);
}

/** Fallback when model forgets tools. */
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
  if (/\b(copy|give me|what'?s)\s+(the\s+)?(email|e-mail)\b|\bemail\s+please\b/i.test(q)) {
    actions.push({ type: "copy_email" });
  }
  if (/\b(open|show|download)\s+(the\s+)?(resume|cv)\b|\bresume\s+please\b/i.test(q)) {
    actions.push({ type: "open_resume" });
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
        } else if (item.type === "copy_email") {
          actions.push({ type: "copy_email" });
        } else if (item.type === "open_resume") {
          actions.push({ type: "open_resume" });
        }
      }
    }
  } catch {
    actions = [];
  }

  const reply = text.replace(match[0], "").trim();
  return { reply: reply || "On it!", actions };
}

async function callGroq(key, body) {
  return fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });
}

async function callGroqWithFallback(key, bodyFactory) {
  let response = await callGroq(key, bodyFactory(GROQ_MODEL));
  if (!response.ok && response.status !== 429 && GROQ_FALLBACK_MODEL !== GROQ_MODEL) {
    response = await callGroq(key, bodyFactory(GROQ_FALLBACK_MODEL));
  }
  return response;
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
  const baseMessages = [
    { role: "system", content: buildSystemPrompt({ currentPath, siteState }) },
    ...normalizeHistory(history),
    { role: "user", content: message },
  ];

  const buildBody = (model, messages, { tools = true } = {}) => {
    const body = {
      model,
      messages,
      max_tokens: 600,
      temperature: 0.55,
    };
    if (tools) {
      body.tools = KURO_TOOLS;
      body.tool_choice = "auto";
    }
    return body;
  };

  let response = await callGroqWithFallback(key, (model) => buildBody(model, baseMessages));

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

  let data = await response.json();
  let choice = data.choices?.[0]?.message;
  let parsedCalls = parseToolCalls(choice?.tool_calls);
  let lookupCalls = parsedCalls.filter((a) => a.type === "lookup_portfolio");
  let siteActions = parsedCalls.filter((a) => a.type !== "lookup_portfolio");
  let reply = choice?.content?.trim() || "";

  // One follow-up round when the model looks up portfolio data.
  if (lookupCalls.length && Array.isArray(choice?.tool_calls) && choice.tool_calls.length) {
    const toolMessages = [];
    for (const rawCall of choice.tool_calls) {
      if (rawCall?.function?.name !== "lookup_portfolio") continue;
      let args = {};
      try {
        args = JSON.parse(rawCall.function?.arguments || "{}");
      } catch {
        args = {};
      }
      const result = lookupPortfolio(args.topic || "projects", args.query || "");
      toolMessages.push({
        role: "tool",
        tool_call_id: rawCall.id,
        content: sanitizeKuroText(result).slice(0, 2500),
      });
    }

    if (toolMessages.length) {
      const followUpMessages = [
        ...baseMessages,
        {
          role: "assistant",
          content: choice.content || null,
          tool_calls: choice.tool_calls,
        },
        ...toolMessages,
      ];

      const followUp = await callGroqWithFallback(key, (model) =>
        buildBody(model, followUpMessages, { tools: false }),
      );

      if (followUp.ok) {
        const followData = await followUp.json();
        const followChoice = followData.choices?.[0]?.message;
        reply = followChoice?.content?.trim() || reply;
        const more = parseToolCalls(followChoice?.tool_calls);
        siteActions = [...siteActions, ...more.filter((a) => a.type !== "lookup_portfolio")];
      }
    }
  }

  let actions = siteActions;

  if (!actions.length && (intent === "site_control" || intent === "portfolio_qa")) {
    if (reply.includes("<actions>")) {
      const legacy = parseActionsFromReply(reply);
      reply = legacy.reply;
      actions = legacy.actions;
    } else if (intent === "site_control") {
      actions = inferActions(message, currentPath || "/");
    }
  }

  actions = filterActions(intent, message, actions);

  if (!reply) {
    reply = actions.length ? describeActions(actions) || "On it." : "What's on your mind?";
  }

  reply = sanitizeKuroText(reply);

  return { reply, actions, intent };
}
