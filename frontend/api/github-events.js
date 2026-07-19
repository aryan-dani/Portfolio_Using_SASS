import { createGuestbookRedis } from "./guestbookStore.js";
import {
  GITHUB_USER,
  githubFetch,
  getGitHubToken,
  readGithubCache,
  writeGithubCache,
} from "./githubApiShared.js";

const CACHE_KEY = "github:events:aryan-dani";
const CACHE_TTL_SEC = 15 * 60;

export async function handleGitHubEventsRequest(_request, response) {
  const redis = createGuestbookRedis({ readOnly: true });
  const cached = await readGithubCache(redis, CACHE_KEY, { allowStale: false });
  if (cached) {
    response.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");
    response.setHeader("X-GitHub-Events-Cache", "hit");
    return response.status(200).json(cached);
  }

  try {
    const token = getGitHubToken();
    const res = await githubFetch(`/users/${GITHUB_USER}/events/public?per_page=10`, token);
    if (res.status === 403) {
      const stale = await readGithubCache(redis, CACHE_KEY, { allowStale: true });
      if (stale) {
        response.setHeader("X-GitHub-Events-Cache", "stale");
        return response.status(200).json(stale);
      }
      return response.status(503).json({ error: "GitHub rate limit exceeded. Add GITHUB_TOKEN." });
    }
    if (!res.ok) throw new Error("GitHub events unavailable");

    const data = await res.json();
    await writeGithubCache(createGuestbookRedis(), CACHE_KEY, data, CACHE_TTL_SEC);
    response.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");
    response.setHeader("X-GitHub-Events-Cache", "miss");
    return response.status(200).json(data);
  } catch (error) {
    const stale = await readGithubCache(redis, CACHE_KEY, { allowStale: true });
    if (stale) {
      response.setHeader("X-GitHub-Events-Cache", "stale");
      return response.status(200).json(stale);
    }
    return response.status(503).json({ error: "GitHub events unavailable" });
  }
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }
  return handleGitHubEventsRequest(request, response);
}
