import { useEffect } from "react";

/**
 * Marks a subtree inert when hidden so focus cannot remain inside it.
 * Prefer this over aria-hidden on elements that contain links or buttons.
 */
export function useInertWhenHidden(ref, hidden) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (hidden) {
      if (el.contains(document.activeElement)) {
        document.activeElement?.blur?.();
      }
      el.inert = true;
    } else {
      el.inert = false;
    }

    return () => {
      el.inert = false;
    };
  }, [ref, hidden]);
}
