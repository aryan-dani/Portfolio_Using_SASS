const GITHUB_USER = "aryan-dani";
const CACHE_KEY = "portfolio_github_events";
const CONTRIB_CACHE_KEY = "portfolio_github_contributions";
const CACHE_MS = 10 * 60 * 1000;

export async function fetchGitHubEvents() {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const { ts, data } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_MS) return data;
    }
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/events/public?per_page=10`);
    if (!res.ok) throw new Error("GitHub API unavailable");
    const data = await res.json();
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    return data;
  } catch {
    return [];
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

/** Last ~year of contribution counts from a public contributions API. */
export async function fetchGitHubContributions() {
  try {
    const cached = sessionStorage.getItem(CONTRIB_CACHE_KEY);
    if (cached) {
      const { ts, data } = JSON.parse(cached);
      if (Date.now() - ts < CACHE_MS) return data;
    }

    const year = new Date().getFullYear();
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=${year}`,
    );
    if (!res.ok) throw new Error("Contributions API unavailable");
    const json = await res.json();
    const contributions = json.contributions || [];
    sessionStorage.setItem(CONTRIB_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: contributions }));
    return contributions;
  } catch {
    return [];
  }
}
