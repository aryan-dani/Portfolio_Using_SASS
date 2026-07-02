import { experiences } from "../data/experience";

function fakeHash(seed) {
  let h = 5381;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 33) ^ seed.charCodeAt(i);
  }
  return (h >>> 0).toString(16).slice(0, 7).padStart(7, "0");
}

function branchSlug(exp) {
  if (exp.id === 1) return "artem-intern";
  if (exp.id === 2) return "mit-capstone";
  if (exp.id === 3) return "freelance";
  return `exp-${exp.id}`;
}

function linkToMsg(name) {
  const short = name
    .replace(/\(.*?\)/g, "")
    .trim()
    .toLowerCase();
  if (short.includes("arbiter")) return "feat(agent): Arbiter autonomous CI";
  if (short.includes("shadow")) return "feat(ai): Shadow Instructor dual-agent";
  if (short.includes("utility")) return "feat(web): Utility academic OS";
  if (short.includes("threat")) return "feat(cv): real-time threat detection";
  if (short.includes("pose")) return "feat(cv): PosePro motion analyzer";
  if (short.includes("speech")) return "feat(api): speech-to-text pipeline";
  if (short.includes("democrazy")) return "feat: Democrazy civic sim";
  if (short.includes("fourth")) return "feat: Fourth Clover web app";
  return `feat: ${name.slice(0, 42)}`;
}

function row(seed, fields) {
  return {
    id: seed,
    hash: fakeHash(seed),
    ...fields,
  };
}

const HIGHLIGHTS_PER_ROLE = 1;

/** Grouped roles for the About page career section. */
export function buildCareerRoles() {
  return [...experiences]
    .sort((a, b) => b.id - a.id)
    .map((exp) => {
      const link = (exp.links || [])[0];
      return {
        id: exp.id,
        branch: branchSlug(exp),
        position: exp.position,
        company: exp.company,
        period: exp.period,
        highlight: link
          ? {
              name: link.name,
              msg: linkToMsg(link.name),
              hash: fakeHash(`${exp.id}-${link.name}`),
            }
          : null,
      };
    });
}

/** Build a compact git-log from experience + linked projects (not the GitHub API). */
export function buildCareerCommits() {
  const rows = [];
  const ordered = [...experiences].sort((a, b) => b.id - a.id);

  ordered.forEach((exp, expIndex) => {
    const branch = branchSlug(exp);
    const highlight = (exp.links || []).slice(0, HIGHLIGHTS_PER_ROLE);

    highlight.forEach((link, i) => {
      rows.push(
        row(`${exp.id}-${branch}-link-${i}-${link.name}`, {
          branch,
          msg: linkToMsg(link.name),
          expId: exp.id,
          graph: "| *",
        }),
      );
    });

    rows.push(
      row(`merge-${exp.id}-${branch}`, {
        branch: "main",
        msg: `merge(${branch}): ${exp.position}`,
        expId: exp.id,
        graph: expIndex === ordered.length - 1 ? "* |\\" : "|\\",
        meta: exp.company,
      }),
    );
  });

  return rows;
}
