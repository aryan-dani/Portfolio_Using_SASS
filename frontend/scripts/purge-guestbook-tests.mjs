import { loadEnv } from "vite";
import { createGuestbookRedis, purgeGuestbookEntries } from "../api/guestbookStore.js";

const env = loadEnv("development", process.cwd(), "");
for (const [key, value] of Object.entries(env)) {
  if (value && !process.env[key]) process.env[key] = String(value).trim();
}

const TEST_PATTERN = /\btest(er)?\b/i;

const redis = createGuestbookRedis();
if (!redis) {
  console.error("Redis not configured.");
  process.exit(1);
}

const remaining = await purgeGuestbookEntries(
  redis,
  (entry) => TEST_PATTERN.test(entry.name || "") || TEST_PATTERN.test(entry.message || ""),
);

console.log(`Purged test entries. ${remaining.length} stamp(s) remain.`);
