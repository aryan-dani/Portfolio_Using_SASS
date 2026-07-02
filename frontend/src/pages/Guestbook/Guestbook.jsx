import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePageSEO } from "../../utils/seo";
import { useAchievements } from "../../context/AchievementContext";
import { formatRelativeTime } from "../../utils/githubApi";
import PageHeader from "../../components/PageHeader/PageHeader";
import { containerVariants } from "../../utils/motionVariants";
const LOCAL_KEY = "portfolio_guestbook_local";
const TOKEN_KEY = "portfolio_guestbook_token";
const OWNED_KEY = "portfolio_guestbook_owned";
const BLOCKED = ["spam", "badword"];

function getOwnerToken() {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

function loadOwnedIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(OWNED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function rememberOwnedId(id) {
  const owned = loadOwnedIds();
  owned.add(id);
  localStorage.setItem(OWNED_KEY, JSON.stringify([...owned]));
}

function forgetOwnedId(id) {
  const owned = loadOwnedIds();
  owned.delete(id);
  localStorage.setItem(OWNED_KEY, JSON.stringify([...owned]));
}

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocal(entries) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(entries.slice(0, 40)));
}

async function fetchGuestbook() {
  try {
    const res = await fetch("/api/guestbook");
    if (res.ok) {
      return { entries: await res.json(), localMode: false };
    }
    if (res.status === 503) {
      return { entries: loadLocal(), localMode: true };
    }
  } catch {
    /* fall through */
  }
  return { entries: loadLocal(), localMode: true };
}

async function postGuestbook(entry) {
  const ownerToken = getOwnerToken();
  try {
    const res = await fetch("/api/guestbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...entry, ownerToken }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      if (data.entry?.id) rememberOwnedId(data.entry.id);
      return { entries: data.entries || [data.entry], localMode: false };
    }
    if (res.status === 503) throw new Error("offline");
    throw new Error(data.error || "Could not save to wall");
  } catch (error) {
    if (error.message === "offline" || error.message === "Failed to fetch") {
      const localEntry = { ...entry, id: `${Date.now()}-local`, owner_token: ownerToken };
      const local = [localEntry, ...loadLocal()];
      saveLocal(local);
      rememberOwnedId(localEntry.id);
      return { entries: local.map(({ owner_token, ...rest }) => rest), localMode: true };
    }
    throw error;
  }
}

async function removeGuestbookEntry(id) {
  const ownerToken = getOwnerToken();
  try {
    const res = await fetch("/api/guestbook", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ownerToken }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      forgetOwnedId(id);
      return { entries: data.entries || [], localMode: false };
    }
    if (res.status === 503) throw new Error("offline");
    throw new Error(data.error || "Could not remove stamp");
  } catch (error) {
    if (error.message === "offline" || error.message === "Failed to fetch") {
      const owned = loadOwnedIds();
      if (!owned.has(id)) throw new Error("You can only remove your own stamp.");
      const local = loadLocal().filter((entry) => entry.id !== id);
      saveLocal(local);
      forgetOwnedId(id);
      return {
        entries: local.map(({ owner_token, ...rest }) => rest),
        localMode: true,
      };
    }
    throw error;
  }
}

const Guestbook = memo(function Guestbook() {
  usePageSEO();
  const { track } = useAchievements();
  const [entries, setEntries] = useState([]);
  const [ownedIds, setOwnedIds] = useState(() => loadOwnedIds());
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [localMode, setLocalMode] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    fetchGuestbook().then(({ entries: data, localMode: offline }) => {
      setEntries(data);
      setLocalMode(offline);
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const cleanName = name.trim().slice(0, 40);
    const cleanMsg = message.trim().slice(0, 140);
    if (!cleanName || !cleanMsg) return;
    if (BLOCKED.some((w) => cleanMsg.toLowerCase().includes(w))) {
      setStatus("Message blocked.");
      return;
    }
    try {
      const entry = { name: cleanName, message: cleanMsg, created_at: new Date().toISOString() };
      const result = await postGuestbook(entry);
      const nextEntries = Array.isArray(result.entries) ? result.entries : [entry, ...entries];
      setEntries(nextEntries);
      setOwnedIds(loadOwnedIds());
      setLocalMode(Boolean(result.localMode));
      setName("");
      setMessage("");
      setStatus(result.localMode ? "Stamped locally (dev/offline mode)." : "Stamped on the wall!");
      track("guestbook");
    } catch (error) {
      setStatus(error.message || "Could not post - try again later.");
    }
  };

  const removeEntry = async (id) => {
    if (removingId) return;
    setRemovingId(id);
    setStatus("");
    try {
      const result = await removeGuestbookEntry(id);
      setEntries(result.entries);
      setOwnedIds(loadOwnedIds());
      setLocalMode(Boolean(result.localMode));
      setStatus("Your stamp was removed.");
    } catch (error) {
      setStatus(error.message || "Could not remove stamp.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <motion.section className="flex flex-col gap-10" initial="hidden" animate="visible" variants={containerVariants}>
      <PageHeader title="Guestbook" description="Sign the wall. Leave a stamp. No coffee allowed." />

      <form onSubmit={submit} className="border-4 border-outline bg-[var(--color-surface)] p-5 shadow-[6px_6px_0_var(--shadow-color)] grid gap-3 max-w-xl">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="border-2 border-outline px-3 py-2 bg-[var(--color-surface-variant)]"
          maxLength={40}
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message (140 chars)"
          className="border-2 border-outline px-3 py-2 bg-[var(--color-surface-variant)] min-h-[80px]"
          maxLength={140}
        />
        <button type="submit" className="border-4 border-outline px-4 py-3 font-label-bold uppercase bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] shadow-[4px_4px_0_var(--shadow-color)] w-fit">
          Stamp It
        </button>
        {status && <p className="font-body-md text-sm">{status}</p>}
        {localMode && (
          <p className="font-body-md text-xs text-[var(--color-text-muted)]">
            Dev/offline mode - entries stay in this browser until Redis is reachable.
          </p>
        )}
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 content-visibility-auto">
        {entries.length === 0 && (
          <p className="font-body-md text-sm text-[var(--color-text-muted)] col-span-full border-4 border-dashed border-outline-variant p-8 text-center bg-[var(--color-surface-variant)]">
            No stamps yet. Be the first to sign the wall.
          </p>
        )}
        {entries.map((entry) => {
          const canRemove = ownedIds.has(entry.id);
          return (
            <article
              key={entry.id || entry.created_at}
              className="flex flex-col border-4 border-outline bg-[var(--color-surface)] shadow-[4px_4px_0_var(--shadow-color)] overflow-hidden min-h-[140px]"
            >
              <div className="border-b-4 border-outline bg-[var(--color-surface-variant)] px-4 py-3">
                <p className="font-label-bold uppercase text-sm truncate">{entry.name}</p>
                {entry.created_at && (
                  <p className="font-mono text-[10px] uppercase text-[var(--color-text-muted)] mt-0.5">
                    {formatRelativeTime(entry.created_at)}
                  </p>
                )}
              </div>
              <p className="font-body-md text-sm leading-relaxed px-4 py-4 flex-1">{entry.message}</p>
              {canRemove && (
                <div className="px-4 pb-4 pt-0">
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    disabled={removingId === entry.id}
                    className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] hover:text-[var(--color-on-surface)] underline underline-offset-2 disabled:opacity-50"
                    aria-label={`Remove your stamp from ${entry.name}`}
                  >
                    {removingId === entry.id ? "Removing…" : "Remove my stamp"}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </motion.section>
  );
});

export default Guestbook;
