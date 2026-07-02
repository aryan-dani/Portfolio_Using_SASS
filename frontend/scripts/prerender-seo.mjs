import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SEO_CONFIG, SEO_ROUTE_ORDER, buildBaseSchemas, DEFAULT_IMAGE, DEFAULT_IMAGE_ALT, SITE_NAME, TWITTER_HANDLE, routeOgImage } from "../src/config/seoConfig.js";
import { projects } from "../src/data/projects.js";
import { certifications } from "../src/data/certifications.js";
import { experiences } from "../src/data/experience.js";

const distDir = new URL("../dist/", import.meta.url);
const baseHtmlPath = new URL("index.html", distDir);

const EXTRA_DATA = {
  "/": { projects },
  "/projects": { projects },
  "/experience": { experiences },
  "/certifications": { certifications },
  "/contact": {
    faqItems: [
      { q: "Is Aryan Dani available for freelance projects?", a: "Yes. Aryan Dani is open to freelance web development, AI engineering, and full-stack collaboration opportunities." },
      { q: "What does Aryan Dani specialize in?", a: "Aryan Dani specializes in AI engineering, machine learning, computer vision, Generative AI, LLMs, RAG systems, Python, Angular, React, and full-stack development." },
    ],
  },
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function jsonScript(schema) {
  return `<script type="application/ld+json" data-page-seo="true">${JSON.stringify(schema).replaceAll("</", "<\\/")}</script>`;
}

function metaName(name, content, extra = "") {
  if (!content) return "";
  return `<meta name="${name}" content="${escapeHtml(content)}"${extra} />`;
}

function metaProperty(property, content) {
  if (!content) return "";
  return `<meta property="${property}" content="${escapeHtml(content)}" />`;
}

function routeFallback(path, config) {
  const links = SEO_ROUTE_ORDER
    .filter((routePath) => routePath !== path)
    .map((routePath) => `<li><a href="${routePath}">${escapeHtml(SEO_CONFIG[routePath].title)}</a></li>`)
    .join("");

  return `<noscript data-route-fallback="true">
  <main>
    <h1>${escapeHtml(config.title)}</h1>
    <p>${escapeHtml(config.description)}</p>
    <nav aria-label="Portfolio sections">
      <ul>${links}</ul>
    </nav>
  </main>
</noscript>`;
}

function replaceHead(html, config, schemas, routePath) {
  const image = config.ogImage || routeOgImage(routePath) || DEFAULT_IMAGE;
  const imageAlt = config.imageAlt || DEFAULT_IMAGE_ALT;
  const headMeta = [
    `<title>${escapeHtml(config.title)}</title>`,
    metaName("title", config.title),
    metaName("description", config.description),
    metaName("keywords", config.keywords),
    metaName("author", "Aryan Dani"),
    metaName("creator", "Aryan Dani"),
    metaName("publisher", "Aryan Dani"),
    metaName("application-name", SITE_NAME),
    metaName("generator", "Vite + React"),
    metaName("robots", config.robots),
    metaName("theme-color", "#f5f5f5", ' media="(prefers-color-scheme: light)"'),
    metaName("theme-color", "#272727", ' media="(prefers-color-scheme: dark)"'),
    `<link rel="canonical" href="${escapeHtml(config.canonical)}" />`,
    metaProperty("og:type", config.ogType || "website"),
    metaProperty("og:url", config.canonical),
    metaProperty("og:locale", "en_US"),
    metaProperty("og:title", config.title),
    metaProperty("og:description", config.description),
    metaProperty("og:image", image),
    metaProperty("og:image:width", "1200"),
    metaProperty("og:image:height", "630"),
    metaProperty("og:image:alt", imageAlt),
    metaProperty("og:site_name", SITE_NAME),
    metaName("twitter:card", "summary_large_image"),
    metaName("twitter:url", config.canonical),
    metaName("twitter:title", config.title),
    metaName("twitter:description", config.description),
    metaName("twitter:image", image),
    metaName("twitter:image:alt", imageAlt),
    metaName("twitter:creator", TWITTER_HANDLE),
    metaName("twitter:site", TWITTER_HANDLE),
    ...schemas.map(jsonScript),
  ].filter(Boolean).join("\n    ");

  return html
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/<meta\s+(?:name|property)="(?:title|description|keywords|robots|author|creator|publisher|application-name|generator|theme-color|twitter:[^"]+|og:[^"]+)"[\s\S]*?>/g, "")
    .replace(/<link rel="canonical"[\s\S]*?>/g, "")
    .replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>/g, "")
    .replace("</head>", `    ${headMeta}\n  </head>`);
}

async function writeRouteHtml(routePath, html) {
  const relativePath = routePath === "/" ? "index.html" : `${routePath.slice(1)}/index.html`;
  const outputUrl = new URL(relativePath, distDir);
  await mkdir(dirname(fileURLToPath(outputUrl)), { recursive: true });
  await writeFile(outputUrl, html, "utf8");
}

const baseHtml = await readFile(baseHtmlPath, "utf8");

for (const routePath of SEO_ROUTE_ORDER) {
  const config = SEO_CONFIG[routePath];
  const routeSchemas = [
    ...buildBaseSchemas(),
    ...(config.schemas?.(EXTRA_DATA[routePath]) || []),
  ];
  const routeHtml = replaceHead(baseHtml, config, routeSchemas, routePath)
    .replace('<div id="root"></div>', `${routeFallback(routePath, config)}\n    <div id="root"></div>`);
  await writeRouteHtml(routePath, routeHtml);
}

const notFoundConfig = SEO_CONFIG["/404"];
const notFoundHtml = replaceHead(baseHtml, notFoundConfig, notFoundConfig.schemas?.() || [], "/404")
  .replace('<div id="root"></div>', `${routeFallback("/404", notFoundConfig)}\n    <div id="root"></div>`);
await writeFile(new URL("404.html", distDir), notFoundHtml, "utf8");

console.log(`Prerendered SEO HTML for ${SEO_ROUTE_ORDER.length} routes plus 404.`);
