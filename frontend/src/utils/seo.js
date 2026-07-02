import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { SEO_CONFIG, SITE_NAME, DEFAULT_IMAGE, TWITTER_HANDLE, DEFAULT_IMAGE_ALT, routeOgImage } from "../config/seoConfig";

/**
 * SEO hook - updates document <title>, meta tags, canonical URL,
 * Open Graph tags, Twitter Cards, and injects per-page JSON-LD
 * structured data on every route change.
 *
 * @param {Object} [extraData] - Optional data for dynamic schemas (e.g., projects list, FAQ items)
 */
export function usePageSEO(extraData, overridePath) {
  const { pathname } = useLocation();
  const schemaScriptRef = useRef(null);

  useEffect(() => {
    const config = SEO_CONFIG[overridePath || pathname];
    if (!config) return;
    const pagePath = overridePath || pathname;
    const image = config.ogImage || routeOgImage(pagePath) || DEFAULT_IMAGE;
    const imageAlt = config.imageAlt || DEFAULT_IMAGE_ALT;

    // ── Title ──────────────────────────────────────────────
    document.title = config.title;

    // ── Meta tags ──────────────────────────────────────────
    setMeta("name", "title", config.title);
    setMeta("name", "description", config.description);
    setMeta("name", "keywords", config.keywords);
    setMeta("name", "robots", config.robots);
    setMeta("name", "author", "Aryan Dani");
    setMeta("name", "creator", "Aryan Dani");
    setMeta("name", "publisher", "Aryan Dani");
    setMeta("name", "application-name", SITE_NAME);
    setMeta("name", "generator", "Vite + React");
    setMeta("name", "theme-color", "#f5f5f5");

    // ── Canonical ──────────────────────────────────────────
    setLink("canonical", config.canonical);

    // ── Open Graph ─────────────────────────────────────────
    setMeta("property", "og:title", config.title);
    setMeta("property", "og:description", config.description);
    setMeta("property", "og:url", config.canonical);
    setMeta("property", "og:type", config.ogType || "website");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:image", image);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:image:alt", imageAlt);

    // ── Twitter Cards ──────────────────────────────────────
    // Twitter uses name= not property= for its own tags
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", config.title);
    setMeta("name", "twitter:description", config.description);
    setMeta("name", "twitter:url", config.canonical);
    setMeta("name", "twitter:image", image);
    setMeta("name", "twitter:image:alt", imageAlt);
    setMeta("name", "twitter:site", TWITTER_HANDLE);
    setMeta("name", "twitter:creator", TWITTER_HANDLE);

    // ── Per-page JSON-LD structured data ───────────────────
    if (config.schemas) {
      const schemas = config.schemas(extraData);
      if (schemas && schemas.length > 0) {
        // Remove previous per-page schema
        if (schemaScriptRef.current) {
          schemaScriptRef.current.remove();
          schemaScriptRef.current = null;
        }

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-page-seo", "true");
        script.textContent = JSON.stringify(schemas);
        document.head.appendChild(script);
        schemaScriptRef.current = script;
      }
    }

    // Cleanup: remove per-page schema on unmount / route change
    return () => {
      if (schemaScriptRef.current) {
        schemaScriptRef.current.remove();
        schemaScriptRef.current = null;
      }
    };
  }, [pathname, extraData, overridePath]);
}

// ── Helpers ────────────────────────────────────────────────

/**
 * Set or create a <meta> tag.
 * @param {"name"|"property"} attr - The attribute type (name or property)
 * @param {string} key - The attribute value (e.g., "description", "og:title")
 * @param {string} content - The content value
 */
function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Set or create a <link> tag.
 * @param {string} rel - The rel attribute value
 * @param {string} href - The href value
 */
function setLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}
