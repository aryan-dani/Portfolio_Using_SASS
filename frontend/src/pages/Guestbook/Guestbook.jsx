import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePageSEO } from "../../utils/seo";
import { useAchievements } from "../../context/AchievementContext";
import PageHeader from "../../components/PageHeader/PageHeader";
import { containerVariants } from "../../utils/motionVariants";

const LOCAL_KEY = "portfolio_guestbook_local";
const BLOCKED = ["spam", "badword"];

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
  try {
    const res = await fetch("/api/guestbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return { entries: data.entries || [data.entry], localMode: false };
    if (res.status === 503) throw new Error("offline");
    throw new Error(data.error || "Could not save to wall");
  } catch (error) {
    if (error.message === "offline" || error.message === "Failed to fetch") {
      const local = [{ ...entry, id: Date.now() }, ...loadLocal()];
      saveLocal(local);
      return { entries: local, localMode: true };
    }
    throw error;
  }
}

const Guestbook = memo(function Guestbook() {
  usePageSEO();
  const { track } = useAchievements();
  const [entries, setEntries] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [localMode, setLocalMode] = useState(false);

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
      setLocalMode(Boolean(result.localMode));
      setName("");
      setMessage("");
      setStatus(result.localMode ? "Stamped locally (dev/offline mode)." : "Stamped on the wall!");
      track("guestbook");
    } catch (error) {
      setStatus(error.message || "Could not post - try again later.");
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-visibility-auto">
        {entries.map((entry) => (
          <article
            key={entry.id || entry.created_at}
            className="border-4 border-outline bg-[var(--color-surface-variant)] p-4 shadow-[5px_5px_0_var(--shadow-color)]"
            style={{ transform: `rotate(${(entry.name?.length || 0) % 5 - 2}deg)` }}
          >
            <p className="font-label-bold uppercase text-sm">{entry.name}</p>
            <p className="font-body-md text-sm mt-2">{entry.message}</p>
          </article>
        ))}
      </div>
    </motion.section>
  );
});

export default Guestbook;
