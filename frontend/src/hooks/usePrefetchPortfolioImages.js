import { useEffect } from "react";
import { projects } from "../data/projects";
import { getAssetPath } from "../utils/paths";

const ABOUT_FIRST = "Images/About/pic_1.jpg";
const PREFETCH_COUNT = 6;

function shouldPrefetch() {
  if (typeof navigator === "undefined") return false;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType && ["slow-2g", "2g"].includes(connection.effectiveType)) {
    return false;
  }
  return true;
}

/**
 * Warm project + about image cache while the user is on Home,
 * so Projects/About feel faster on first navigation.
 */
export function usePrefetchPortfolioImages({ enabled = true } = {}) {
  useEffect(() => {
    if (!enabled || !shouldPrefetch()) return undefined;

    const urls = [
      ...projects.slice(0, PREFETCH_COUNT).map((project) => getAssetPath(project.image)),
      getAssetPath(ABOUT_FIRST),
    ];

    const loaders = urls.map((url) => {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      return img;
    });

    return () => {
      loaders.forEach((img) => {
        img.onload = null;
        img.onerror = null;
        img.src = "";
      });
    };
  }, [enabled]);
}
