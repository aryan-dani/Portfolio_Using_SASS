import { mkdir, writeFile } from "node:fs/promises";
import { SEO_CONFIG, SEO_ROUTE_ORDER, SEO_ROUTE_META, SITE_URL } from "../src/config/seoConfig.js";

const publicDir = new URL("../public/", import.meta.url);
const today = new Date().toISOString().slice(0, 10);

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function writePublicFile(path, contents) {
  await writeFile(new URL(path, publicDir), contents, "utf8");
}

function buildSitemap() {
  const urls = SEO_ROUTE_ORDER.map((path) => {
    const config = SEO_CONFIG[path];
    const meta = SEO_ROUTE_META[path];
    return `  <url>
    <loc>${xmlEscape(config.canonical)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${meta.changefreq}</changefreq>
    <priority>${meta.priority}</priority>
  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function buildRobots() {
  return `# robots.txt for ${SITE_URL}/

User-agent: *
Allow: /
Disallow: /api/

# AI and search crawlers
User-agent: Google-Extended
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

function buildLlmsTxt() {
  return `# Aryan Dani Portfolio

Aryan Dani is an AI Engineer, Machine Learning Engineer, Computer Vision developer, and Full Stack Developer based in Pune, India. He studies at MIT-WPU and builds production-style projects across Generative AI, LLMs, RAG, vector databases, Python, FastAPI, React, Angular, Next.js, and modern web development.

## Canonical Website
${SITE_URL}/

## Important Pages
${SEO_ROUTE_ORDER.map((path) => {
  const config = SEO_CONFIG[path];
  return `- ${config.title}: ${config.canonical} - ${config.description}`;
}).join("\n")}

## Entity Keywords
Aryan Dani, AI Engineer, Machine Learning Engineer, Computer Vision, Full Stack Developer, Angular Developer, Python Developer, Generative AI, LLMs, RAG, Vector Database, MIT WPU, Pune, portfolio, projects.

## Preferred Summary
Aryan Dani is an AI Engineer and Full Stack Developer from Pune, India, focused on Machine Learning, Computer Vision, Generative AI, LLM applications, RAG systems, and modern full-stack web development.
`;
}

function buildHumansTxt() {
  return `/* TEAM */
Developer: Aryan Dani
Role: AI Engineer & Full Stack Developer
Site: ${SITE_URL}/
LinkedIn: https://www.linkedin.com/in/aryandani/
GitHub: https://github.com/aryan-dani

/* SITE */
Stack: React, Vite, Framer Motion, Lenis, Tailwind CSS
Language: English
Last updated: ${today}
`;
}

function buildRouteOgSvg(title, accent = "#2f6bff") {
  const safe = xmlEscape(title);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f8f7f4"/>
  <rect x="40" y="40" width="1120" height="550" fill="#ffffff" stroke="#131316" stroke-width="12"/>
  <rect x="72" y="72" width="180" height="56" fill="${accent}"/>
  <text x="92" y="110" fill="#f8f7f4" font-family="Arial, sans-serif" font-size="28" font-weight="800">ARYAN DANI</text>
  <text x="72" y="280" fill="#131316" font-family="Arial, sans-serif" font-size="64" font-weight="900">${safe}</text>
  <text x="72" y="360" fill="#454449" font-family="Arial, sans-serif" font-size="30" font-weight="700">aryandani.com</text>
</svg>`;
}

function buildOgSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">Aryan Dani - AI Engineer &amp; Full Stack Developer</title>
  <desc id="desc">Social preview image for Aryan Dani portfolio.</desc>
  <rect width="1200" height="630" fill="#f8f7f4"/>
  <rect x="44" y="44" width="1112" height="542" fill="#ffffff" stroke="#131316" stroke-width="10"/>
  <rect x="82" y="82" width="270" height="72" fill="#131316"/>
  <text x="106" y="130" fill="#f8f7f4" font-family="Arial, sans-serif" font-size="38" font-weight="800">ARYAN DANI</text>
  <text x="82" y="262" fill="#131316" font-family="Arial, sans-serif" font-size="72" font-weight="900">AI Engineer</text>
  <text x="82" y="344" fill="#131316" font-family="Arial, sans-serif" font-size="72" font-weight="900">&amp; Full Stack Developer</text>
  <text x="86" y="430" fill="#454449" font-family="Arial, sans-serif" font-size="34" font-weight="700">Machine Learning • Computer Vision • Generative AI • RAG</text>
  <text x="86" y="492" fill="#454449" font-family="Arial, sans-serif" font-size="28" font-weight="700">React • Angular • Python • FastAPI • MIT-WPU • Pune</text>
  <rect x="928" y="98" width="142" height="142" fill="#131316"/>
  <rect x="962" y="132" width="142" height="142" fill="#f8f7f4" stroke="#131316" stroke-width="8"/>
</svg>
`;
}

function buildFaviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#f8f7f4"/>
  <rect x="56" y="56" width="400" height="400" fill="#ffffff" stroke="#131316" stroke-width="28"/>
  <text x="256" y="300" text-anchor="middle" fill="#131316" font-family="Arial, sans-serif" font-size="150" font-weight="900">AD</text>
</svg>
`;
}

await mkdir(new URL("favicons/", publicDir), { recursive: true });
await writePublicFile("sitemap.xml", buildSitemap());
await writePublicFile("robots.txt", buildRobots());
await writePublicFile("llms.txt", buildLlmsTxt());
await writePublicFile("humans.txt", buildHumansTxt());
await writePublicFile("og-image.svg", buildOgSvg());
for (const path of SEO_ROUTE_ORDER) {
  const meta = SEO_ROUTE_META[path];
  const slug = path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-");
  await writePublicFile(`og-${slug}.svg`, buildRouteOgSvg(meta?.label || path));
}
await writePublicFile("favicons/favicon.svg", buildFaviconSvg());
await writePublicFile("favicons/apple-touch-icon.svg", buildFaviconSvg());

console.log("Generated SEO public assets.");
