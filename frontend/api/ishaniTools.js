/** Route data for Ishani tools (no React/icon deps - safe for serverless). */
export const ISHANI_PAGES = [
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

export const NAV_PAGE_IDS = ISHANI_PAGES.map((r) => r.id);

export const PAGE_BY_ID = Object.fromEntries(ISHANI_PAGES.map((r) => [r.id, r]));

export const ISHANI_TOOLS = [
  {
    type: "function",
    function: {
      name: "navigate",
      description: "Navigate the visitor to a portfolio page. Use when they ask to go somewhere, open a section, or see projects/skills/etc.",
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
      description: "Switch between light and dark theme.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "set_hack_mode",
      description: "Enable or disable CRT hacker / berserk visual mode.",
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
      description: "Scroll the page back to the top.",
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
      description: "Open the site command palette search (Ctrl+K).",
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
          return `Taking you to ${a.label}…`;
        case "toggle_theme":
          return "Flipping the lights…";
        case "set_hack_mode":
          return a.enabled ? "Engaging hack mode…" : "Exiting hack mode…";
        case "scroll_to_top":
          return "Zooming back to the top…";
        case "set_accent":
          return `Accent → ${a.palette}`;
        case "open_palette":
          return "Opening command palette…";
        default:
          return "On it…";
      }
    })
    .join(" ");
}
