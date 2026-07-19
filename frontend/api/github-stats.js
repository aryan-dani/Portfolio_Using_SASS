import { buildGitHubDashboard, readDashboardMemoryCache, seedDashboardCache } from "./githubStatsStore.js";
import { createGuestbookRedis } from "./guestbookStore.js";
import { readGithubCache, writeGithubCache } from "./githubApiShared.js";

const CACHE_KEY = "github:dashboard:aryan-dani";
const CACHE_TTL_SEC = 30 * 60;

async function readCachedDashboard({ allowStale = false } = {}) {
  const redis = createGuestbookRedis({ readOnly: true });
  return readGithubCache(redis, CACHE_KEY, { allowStale });
}

async function writeCachedDashboard(data) {
  const redis = createGuestbookRedis();
  await writeGithubCache(redis, CACHE_KEY, data, CACHE_TTL_SEC);
  seedDashboardCache(data);
}

export async function handleGitHubStatsRequest(_request, response) {
  try {
    const cached = await readCachedDashboard({ allowStale: false });
    if (cached) {
      response.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
      response.setHeader("X-GitHub-Stats-Cache", "hit");
      return response.status(200).json(cached);
    }

    const data = await buildGitHubDashboard();
    await writeCachedDashboard(data);
    response.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
    response.setHeader("X-GitHub-Stats-Cache", "miss");
    return response.status(200).json(data);
  } catch (error) {
    const stale =
      (await readCachedDashboard({ allowStale: true })) || readDashboardMemoryCache();
    if (stale) {
      response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
      response.setHeader("X-GitHub-Stats-Cache", "stale");
      return response.status(200).json({ ...stale, stale: true });
    }

    const message = error.rateLimited
      ? "GitHub rate limit hit. Add GITHUB_TOKEN to .env.local / Vercel, then wait a few minutes."
      : "GitHub stats unavailable";

    return response.status(503).json({ error: message });
  }
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }
  return handleGitHubStatsRequest(request, response);
}
