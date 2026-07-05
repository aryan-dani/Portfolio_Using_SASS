const GITHUB_USER = "aryan-dani";
const CACHE_KEY = "portfolio_github_events";
const DASHBOARD_CACHE_KEY = "portfolio_github_dashboard";
const CACHE_MS = 10 * 60 * 1000;
const DASHBOARD_CACHE_MS = 30 * 60 * 1000;

export async function fetchGitHubEvents() {
  // Parse cache once to avoid duplicate JSON.parse calls and double-throw on corrupt entries.
  let cachedEntry = null;
  try { cachedEntry = JSON.parse(sessionStorage.getItem(CACHE_KEY)); } catch { /* ignore */ }

  try {
    if (cachedEntry && Date.now() - cachedEntry.ts < CACHE_MS) return cachedEntry.data;

    const res = await fetch("/api/github-events");
    if (res.ok) {
      const data = await res.json();
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
      return data;
    }
    if (cachedEntry) return cachedEntry.data;
    throw new Error("GitHub events unavailable");
  } catch {
    return cachedEntry?.data ?? [];
  }
}

export function formatGitHubEvent(event) {
  const parsed = parseGitHubEvent(event);
  return parsed ? `${parsed.type} · ${parsed.repo}: ${parsed.summary}` : null;
}

export function parseGitHubEvent(event) {
  if (!event) return null;

  const repoFull = event.repo?.name || "";
  const repo = repoFull.replace(`${GITHUB_USER}/`, "") || "repo";
  const repoUrl = repoFull ? `https://github.com/${repoFull}` : `https://github.com/${GITHUB_USER}`;

  let type = "EVENT";
  let summary = event.type?.replace("Event", "") || "activity";
  let meta = "";

  switch (event.type) {
    case "PushEvent": {
      type = "PUSH";
      const commits = event.payload?.commits || [];
      summary = commits[0]?.message?.trim() || "pushed commits";
      meta = commits.length ? `${commits.length} commit${commits.length > 1 ? "s" : ""}` : "";
      break;
    }
    case "CreateEvent":
      type = "CREATE";
      summary = `created ${event.payload?.ref_type || "ref"}`;
      meta = event.payload?.ref || "";
      break;
    case "WatchEvent":
      type = "STAR";
      summary = "starred repository";
      break;
    case "PullRequestEvent":
      type = "PR";
      summary = event.payload?.action || "pull request";
      meta = event.payload?.pull_request?.title || "";
      break;
    case "IssuesEvent":
      type = "ISSUE";
      summary = event.payload?.action || "issue";
      break;
    default:
      break;
  }

  return {
    id: event.id,
    type,
    repo,
    repoUrl,
    summary: summary.slice(0, 80),
    meta: meta.slice(0, 48),
    time: event.created_at,
  };
}

export function formatRelativeTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Aggregated profile stats from GitHub REST API (via /api/github-stats). */
export async function fetchGitHubDashboard() {
  // Parse cache once to avoid duplicate JSON.parse calls and double-throw on corrupt entries.
  let cachedEntry = null;
  try { cachedEntry = JSON.parse(sessionStorage.getItem(DASHBOARD_CACHE_KEY)); } catch { /* ignore */ }

  try {
    if (cachedEntry && Date.now() - cachedEntry.ts < DASHBOARD_CACHE_MS) return cachedEntry.data;

    const res = await fetch("/api/github-stats");
    const data = await res.json().catch(() => null);
    if (res.ok && data && !data.error) {
      sessionStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
      return data;
    }
    return cachedEntry?.data ?? null;
  } catch {
    return cachedEntry?.data ?? null;
  }
}
