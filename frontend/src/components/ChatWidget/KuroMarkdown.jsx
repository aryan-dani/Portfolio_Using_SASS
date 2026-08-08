import { Fragment, memo } from "react";

/**
 * Lightweight Kuro markdown: **bold**, `code`, [label](url), newlines.
 * No dependency; falls back to plain text on odd input.
 */
function tokenize(text) {
  const src = String(text ?? "");
  const tokens = [];
  const re = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let match;
  while ((match = re.exec(src)) !== null) {
    if (match.index > last) {
      tokens.push({ type: "text", value: src.slice(last, match.index) });
    }
    const raw = match[0];
    if (raw.startsWith("**")) {
      tokens.push({ type: "bold", value: raw.slice(2, -2) });
    } else if (raw.startsWith("`")) {
      tokens.push({ type: "code", value: raw.slice(1, -1) });
    } else {
      const linkMatch = raw.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        tokens.push({ type: "link", value: linkMatch[1], href: linkMatch[2] });
      } else {
        tokens.push({ type: "text", value: raw });
      }
    }
    last = match.index + raw.length;
  }
  if (last < src.length) {
    tokens.push({ type: "text", value: src.slice(last) });
  }
  return tokens.length ? tokens : [{ type: "text", value: src }];
}

function renderInline(text, keyPrefix) {
  return tokenize(text).map((token, i) => {
    const key = `${keyPrefix}-${i}`;
    if (token.type === "bold") {
      return (
        <strong key={key} className="font-label-bold">
          {token.value}
        </strong>
      );
    }
    if (token.type === "code") {
      return (
        <code
          key={key}
          className="font-mono text-[0.85em] border border-outline bg-[var(--color-surface)] px-1 py-0.5"
        >
          {token.value}
        </code>
      );
    }
    if (token.type === "link") {
      return (
        <a
          key={key}
          href={token.href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-label-bold"
        >
          {token.value}
        </a>
      );
    }
    return <Fragment key={key}>{token.value}</Fragment>;
  });
}

export const KuroMarkdown = memo(function KuroMarkdown({ text, className = "" }) {
  const lines = String(text ?? "").split("\n");
  return (
    <div className={className}>
      {lines.map((line, lineIdx) => (
        <p key={lineIdx} className={lineIdx > 0 ? "mt-2" : undefined}>
          {renderInline(line, `l${lineIdx}`)}
        </p>
      ))}
    </div>
  );
});

export default KuroMarkdown;
