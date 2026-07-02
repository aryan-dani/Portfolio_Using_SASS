import { playgroundRouteMap } from "../config/routes";
import { smoothScrollToTop } from "./smoothScroll";

const PALETTE_EVENT = "portfolio:open-palette";

export function executeIshaniActions(actions, handlers) {
  if (!Array.isArray(actions) || !actions.length) return;

  const {
    navigate,
    toggleTheme,
    setCrtMode,
    setAccent,
    track,
  } = handlers;

  for (const action of actions) {
    switch (action.type) {
      case "navigate": {
        const path = action.path || playgroundRouteMap[action.page];
        if (path && navigate) navigate(path);
        break;
      }
      case "toggle_theme":
        toggleTheme?.();
        break;
      case "set_hack_mode":
        if (action.enabled) {
          track?.("hack");
          setCrtMode?.(true);
        } else {
          setCrtMode?.(false);
        }
        break;
      case "scroll_to_top":
        smoothScrollToTop();
        break;
      case "set_accent":
        if (action.palette) setAccent?.(action.palette);
        break;
      case "open_palette":
        window.dispatchEvent(new CustomEvent(PALETTE_EVENT));
        break;
      default:
        break;
    }
  }
}

export { PALETTE_EVENT };
