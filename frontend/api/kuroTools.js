/** Route + tool defs for Kuro chat (no React/icon deps - safe for serverless). */
export const KURO_PAGES = [
  { id: "home", path: "/", label: "Home" },
  { id: "projects", path: "/projects", label: "Projects" },
  { id: "experience", path: "/experience", label: "Experience" },
  { id: "certifications", path: "/certifications", label: "Certifications" },
  { id: "skills", path: "/skills", label: "Skills" },
  { id: "about", path: "/about", label: "About" },
  { id: "contact", path: "/contact", label: "Contact" },
  { id: "playground", path: "/playground", label: "Playground" },
  { id: "achievements", path: "/achievements", label: "Achievements" },
  { id: "guestbook", path: "/guestbook", label: "Guestbook" },
  { id: "copyright", path: "/copyright", label: "Copyright" },
];

export const NAV_PAGE_IDS = KURO_PAGES.map((r) => r.id);

export const PAGE_BY_ID = Object.fromEntries(KURO_PAGES.map((r) => [r.id, r]));

export const LOOKUP_TOPICS = [
  "projects",
  "skills",
  "experience",
  "about",
  "aegis",
  "samiksha",
  "swiggy",
  "utility",
  "ishani",
  "clover",
  "contact",
  "achievements",
  "certifications",
];

/** Client-side site actions returned to the browser. */
export const SITE_ACTION_TYPES = new Set([
  "navigate",
  "toggle_theme",
  "set_hack_mode",
  "scroll_to_top",
  "set_accent",
  "open_palette",
  "copy_email",
  "open_resume",
]);

export const KURO_TOOLS = [
  {
    type: "function",
    function: {
      name: "navigate",
      description: "Navigate to a portfolio page when the user wants to go somewhere.",
      parameters: {
        type: "object",
        properties: {
          page: {
            type: "string",
            enum: NAV_PAGE_IDS,
            description: "Target page id",
          },
        },
        required: ["page"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "toggle_theme",
      description: "Switch light/dark theme when the user asks to change theme or flip the lights.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "set_hack_mode",
      description: "Enable or disable CRT hacker mode when the user asks for hackmode, unhack, or similar.",
      parameters: {
        type: "object",
        properties: {
          enabled: { type: "boolean", description: "true = hack on, false = exit hack" },
        },
        required: ["enabled"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "scroll_to_top",
      description: "Scroll to the top of the page when the user asks.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "set_accent",
      description: "Change the site accent color palette.",
      parameters: {
        type: "object",
        properties: {
          palette: {
            type: "string",
            enum: ["mono"],
          },
        },
        required: ["palette"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "open_command_palette",
      description: "Open the command palette (Ctrl+K) when the user asks for search or the palette.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "lookup_portfolio",
      description:
        "Look up grounded portfolio facts (projects, skills, experience, about, Aegis, Samiksha, contact). Use when answering questions about the builder or work.",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            enum: LOOKUP_TOPICS,
            description: "Which slice of portfolio data to load",
          },
          query: {
            type: "string",
            description: "Optional focus keyword (project name, skill, company)",
          },
        },
        required: ["topic"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "copy_email",
      description: "Copy Aryan's email to the clipboard when the user asks for the email.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "open_resume",
      description: "Open the resume PDF when the user asks for the resume or CV.",
      parameters: { type: "object", properties: {} },
    },
  },
];

export function parseToolCalls(toolCalls) {
  if (!Array.isArray(toolCalls)) return [];

  const actions = [];
  for (const call of toolCalls) {
    const name = call.function?.name;
    let args = {};
    try {
      args = JSON.parse(call.function?.arguments || "{}");
    } catch {
      args = {};
    }

    switch (name) {
      case "navigate":
        if (args.page && PAGE_BY_ID[args.page]) {
          actions.push({
            type: "navigate",
            page: args.page,
            path: PAGE_BY_ID[args.page].path,
            label: PAGE_BY_ID[args.page].label,
          });
        }
        break;
      case "toggle_theme":
        actions.push({ type: "toggle_theme" });
        break;
      case "set_hack_mode":
        actions.push({ type: "set_hack_mode", enabled: !!args.enabled });
        break;
      case "scroll_to_top":
        actions.push({ type: "scroll_to_top" });
        break;
      case "set_accent":
        if (args.palette) actions.push({ type: "set_accent", palette: args.palette });
        break;
      case "open_command_palette":
        actions.push({ type: "open_palette" });
        break;
      case "lookup_portfolio":
        actions.push({
          type: "lookup_portfolio",
          topic: args.topic || "projects",
          query: typeof args.query === "string" ? args.query.slice(0, 80) : "",
          toolCallId: call.id,
        });
        break;
      case "copy_email":
        actions.push({ type: "copy_email" });
        break;
      case "open_resume":
        actions.push({ type: "open_resume" });
        break;
      default:
        break;
    }
  }
  return actions;
}

export function describeActions(actions) {
  if (!actions.length) return "";
  return actions
    .map((a) => {
      switch (a.type) {
        case "navigate":
          return `Taking you to ${a.label}...`;
        case "toggle_theme":
          return "Flipping the lights...";
        case "set_hack_mode":
          return a.enabled ? "Engaging hack mode..." : "Exiting hack mode...";
        case "scroll_to_top":
          return "Zooming back to the top...";
        case "set_accent":
          return `Accent -> ${a.palette}`;
        case "open_palette":
          return "Opening command palette...";
        case "copy_email":
          return "Copying email...";
        case "open_resume":
          return "Opening resume...";
        default:
          return "On it...";
      }
    })
    .join(" ");
}
