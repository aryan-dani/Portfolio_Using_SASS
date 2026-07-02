import {
  GITHUB_USER,
  githubFetch,
  getGitHubToken,
  readGithubCache,
  readStaleMemoryCache,
  writeGithubCache,
  writeMemoryCache,
} from "./githubApiShared.js";

const MAX_REPOS_FOR_ACTIVITY = 2;
const LANG_REPO_SAMPLE = 6;
const STATS_RETRY_MS = 1200;
const STATS_MAX_RETRIES = 3;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rateLimitError() {
  const error = new Error("GitHub rate limit exceeded");
  error.status = 403;
  error.rateLimited = true;
  return error;
}

async function fetchJson(path, token, { allow403 = false } = {}) {
  const res = await githubFetch(path, token);
  if (res.status === 403) {
    if (allow403) return null;
    throw rateLimitError();
  }
  if (!res.ok) {
    const error = new Error(`GitHub ${res.status} for ${path}`);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

async function fetchStatsJson(path, token) {
  for (let attempt = 0; attempt < STATS_MAX_RETRIES; attempt += 1) {
    const res = await githubFetch(path, token);
    if (res.status === 200) return res.json();
    if (res.status === 204 || res.status === 403) return null;
    if (res.status === 202) {
      await sleep(STATS_RETRY_MS * (attempt + 1));
      continue;
    }
    if (res.status === 404 || res.status === 422) return null;
    return null;
  }
  return null;
}

async function fetchUser(token) {
  return fetchJson(`/users/${GITHUB_USER}`, token);
}

async function fetchRepos(token) {
  return fetchJson(`/users/${GITHUB_USER}/repos?sort=pushed&per_page=100&type=owner`, token);
}

async function fetchRepoLanguages(repo, token) {
  const res = await githubFetch(`/repos/${GITHUB_USER}/${repo.name}/languages`, token);
  if (res.status === 403 || !res.ok) return {};
  return res.json();
}

function aggregateLanguages(reposWithLangs) {
  const totals = {};
  reposWithLangs.forEach(({ repo, langs }) => {
    const weight = Math.max(1, repo.stargazers_count + 1);
    Object.entries(langs).forEach(([name, bytes]) => {
      totals[name] = (totals[name] || 0) + bytes * weight;
    });
  });
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const sum = sorted.reduce((acc, [, v]) => acc + v, 0) || 1;
  return sorted.map(([name, bytes]) => ({
    name,
    bytes,
    percent: Math.round((bytes / sum) * 100),
  }));
}

function mergeWeeklyActivity(weeksList) {
  const byWeek = new Map();
  weeksList.forEach((weeks) => {
    if (!Array.isArray(weeks)) return;
    weeks.forEach((week) => {
      const key = week.week;
      const existing = byWeek.get(key) || { week: key, total: 0, days: [0, 0, 0, 0, 0, 0, 0] };
      existing.total += week.total || 0;
      week.days?.forEach((count, i) => {
        existing.days[i] = (existing.days[i] || 0) + (count || 0);
      });
      byWeek.set(key, existing);
    });
  });
  return [...byWeek.values()].sort((a, b) => a.week - b.week).slice(-52);
}

function mergeParticipation(participationList) {
  const all = Array(52).fill(0);
  participationList.forEach((data) => {
    if (!data?.all) return;
    data.all.forEach((count, i) => {
      all[i] = (all[i] || 0) + (count || 0);
    });
  });
  return all;
}

function weeksToContributionDays(weeks) {
  const days = [];
  weeks.forEach((week) => {
    const start = new Date(week.week * 1000);
    week.days.forEach((count, dayIndex) => {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + dayIndex);
      days.push({
        date: date.toISOString().slice(0, 10),
        count,
      });
    });
  });
  return days.slice(-364);
}

function weeklyCommitsToContributions(weeklyCommits) {
  const days = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  weeklyCommits.forEach((total, index) => {
    const weeksFromEnd = weeklyCommits.length - 1 - index;
    const weekStart = new Date(today);
    weekStart.setUTCDate(today.getUTCDate() - weeksFromEnd * 7 - 6);

    const count = total || 0;
    const base = count > 0 ? Math.floor(count / 7) : 0;
    let remainder = count - base * 7;

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const date = new Date(weekStart);
      date.setUTCDate(weekStart.getUTCDate() + dayIndex);
      const dayCount = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder -= 1;
      days.push({
        date: date.toISOString().slice(0, 10),
        count: dayCount,
      });
    }
  });

  return days.slice(-364);
}

function computeStreak(contributions) {
  if (!contributions.length) return { current: 0, longest: 0 };
  const byDate = new Map(contributions.map((d) => [d.date, d.count || 0]));
  let longest = 0;
  let current = 0;
  let run = 0;

  const sorted = [...byDate.keys()].sort();
  sorted.forEach((date) => {
    if ((byDate.get(date) || 0) > 0) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  });

  const today = new Date();
  for (let i = 0; i < 400; i += 1) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    if ((byDate.get(key) || 0) > 0) current += 1;
    else break;
  }

  return { current, longest };
}

function buildDashboardPayload(user, repos, activityPairs) {
  const publicRepos = repos.filter((repo) => !repo.private);
  const weeklyActivity = mergeWeeklyActivity(
    activityPairs.map((p) => p.commitActivity).filter(Boolean),
  );
  const weeklyCommits = mergeParticipation(
    activityPairs.map((p) => p.participation).filter(Boolean),
  );
  let contributions = weeksToContributionDays(weeklyActivity);
  if (!contributions.some((day) => day.count > 0) && weeklyCommits.some((count) => count > 0)) {
    contributions = weeklyCommitsToContributions(weeklyCommits);
  }
  const streak = computeStreak(contributions);
  const totalCommitsYear = contributions.reduce((sum, d) => sum + (d.count || 0), 0);
  const totalStars = publicRepos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);

  return {
    user: {
      login: user.login,
      avatarUrl: user.avatar_url,
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
      profileUrl: user.html_url,
    },
    totals: {
      stars: totalStars,
      commitsLastYear: totalCommitsYear,
      streakCurrent: streak.current,
      streakLongest: streak.longest,
    },
    languages: [],
    contributions,
    weeklyCommits,
    activityRepos: activityPairs.map((p) => p.repo),
    fetchedAt: new Date().toISOString(),
  };
}

export async function buildGitHubDashboard(token = getGitHubToken()) {
  const [user, repos] = await Promise.all([fetchUser(token), fetchRepos(token)]);

  const publicRepos = repos.filter((repo) => !repo.private);
  const activityRepos = publicRepos
    .filter((repo) => !repo.fork)
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, MAX_REPOS_FOR_ACTIVITY);

  const langSample = publicRepos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, LANG_REPO_SAMPLE);

  const langsPairs = await Promise.all(
    langSample.map(async (repo) => ({
      repo,
      langs: await fetchRepoLanguages(repo, token),
    })),
  );

  const activityPairs = [];
  for (const repo of activityRepos) {
    activityPairs.push({
      repo: repo.name,
      commitActivity: await fetchStatsJson(
        `/repos/${GITHUB_USER}/${repo.name}/stats/commit_activity`,
        token,
      ),
      participation: await fetchStatsJson(
        `/repos/${GITHUB_USER}/${repo.name}/stats/participation`,
        token,
      ),
    });
  }

  const dashboard = buildDashboardPayload(user, repos, activityPairs);
  dashboard.languages = aggregateLanguages(langsPairs);
  return dashboard;
}

export function seedDashboardCache(data) {
  writeMemoryCache("github:dashboard:aryan-dani", data);
}

export function readDashboardMemoryCache() {
  return readStaleMemoryCache("github:dashboard:aryan-dani");
}
