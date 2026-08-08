import { playgroundRouteMap } from "../config/routes";
import { aboutInfo } from "../data/experience";
import { smoothScrollToTop } from "./smoothScroll";

const PALETTE_EVENT = "portfolio:open-palette";

async function copyEmailToClipboard() {
  const email = aboutInfo?.email;
  if (!email || !navigator?.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(email);
    return true;
  } catch {
    return false;
  }
}

export function executeKuroActions(actions, handlers) {
  if (!Array.isArray(actions) || !actions.length) return [];

  const {
    navigate,
    toggleTheme,
    setCrtMode,
    setAccent,
    track,
    onAction,
  } = handlers;

  const executed = [];

  for (const action of actions) {
    switch (action.type) {
      case "navigate": {
        const path = action.path || playgroundRouteMap[action.page];
        if (path && navigate) navigate(path);
        executed.push(action);
        break;
      }
      case "toggle_theme":
        toggleTheme?.();
        executed.push(action);
        break;
      case "set_hack_mode":
        if (action.enabled) {
          track?.("hack");
          setCrtMode?.(true);
        } else {
          setCrtMode?.(false);
        }
        executed.push(action);
        break;
      case "scroll_to_top":
        smoothScrollToTop();
        executed.push(action);
        break;
      case "set_accent":
        if (action.palette) setAccent?.(action.palette);
        executed.push(action);
        break;
      case "open_palette":
        window.dispatchEvent(new CustomEvent(PALETTE_EVENT));
        executed.push(action);
        break;
      case "copy_email":
        void copyEmailToClipboard();
        executed.push(action);
        break;
      case "open_resume": {
        const url = aboutInfo?.resumeUrl || "/resume.pdf";
        window.open(url, "_blank", "noopener,noreferrer");
        executed.push(action);
        break;
      }
      default:
        break;
    }
  }

  onAction?.(executed);
  return executed;
}

export function describeKuroActions(actions) {
  if (!Array.isArray(actions) || !actions.length) return "";
  return actions
    .map((a) => {
      switch (a.type) {
        case "navigate":
          return `-> Opened ${a.label || a.page}`;
        case "toggle_theme":
          return "-> Toggled theme";
        case "set_hack_mode":
          return a.enabled ? "-> Hack mode on" : "-> Hack mode off";
        case "scroll_to_top":
          return "-> Scrolled to top";
        case "set_accent":
          return `-> Accent: ${a.palette}`;
        case "open_palette":
          return "-> Opened command palette";
        case "copy_email":
          return "-> Copied email";
        case "open_resume":
          return "-> Opened resume";
        default:
          return "-> Done";
      }
    })
    .join(" ");
}

export { PALETTE_EVENT };
