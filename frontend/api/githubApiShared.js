const GITHUB_USER = "aryan-dani";
const API_VERSION = "2022-11-28";

const memoryStore = new Map();

export { GITHUB_USER, API_VERSION };

function cleanSecret(value) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .replace(/^["'“”‘’`]+|["'“”‘’`]+$/g, "")
    .replace(/[^\x20-\x7E]/g, "");
}

export function getGitHubToken() {
  return cleanSecret(process.env.GITHUB_TOKEN || process.env.GITHUB_PAT || "");
}

export function authHeaders(token = getGitHubToken()) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": API_VERSION,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function githubFetch(path, token = getGitHubToken()) {
  return fetch(`https://api.github.com${path}`, { headers: authHeaders(token) });
}

export async function githubGraphQL(query, variables = {}, token = getGitHubToken()) {
  if (!token) return null;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      ...authHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) return null;
  return res.json();
}

export function readMemoryCache(key, ttlMs) {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > ttlMs) return null;
  return entry.data;
}

export function writeMemoryCache(key, data) {
  memoryStore.set(key, { at: Date.now(), data });
}

export function readStaleMemoryCache(key) {
  return memoryStore.get(key)?.data ?? null;
}

export async function readGithubCache(redis, key, { allowStale = false } = {}) {
  if (redis) {
    try {
      const cached = await redis.get(key);
      if (cached) return cached;
    } catch {
      /* fall through */
    }
  }
  const fresh = readMemoryCache(key, 30 * 60 * 1000);
  if (fresh) return fresh;
  if (allowStale) return readStaleMemoryCache(key);
  return null;
}

export async function writeGithubCache(redis, key, data, ttlSec = 30 * 60) {
  writeMemoryCache(key, data);
  if (!redis) return;
  try {
    await redis.set(key, data, { ex: ttlSec });
  } catch {
    /* ignore */
  }
}
