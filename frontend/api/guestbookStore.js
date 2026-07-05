import { Redis } from "@upstash/redis";

const GUESTBOOK_KEY = "guestbook:entries";
const MAX_ENTRIES = 40;
const BLOCKED = ["spam", "badword"];

function cleanEnv(value) {
  return typeof value === "string" ? value.trim() : value;
}

function redisUrl() {
  return cleanEnv(
    process.env.UPSTASH_REDIS_REST_KV_REST_API_URL
    || process.env.UPSTASH_REDIS_REST_URL,
  );
}

function redisToken(readOnly = false) {
  if (readOnly) {
    return cleanEnv(
      process.env.UPSTASH_REDIS_REST_KV_REST_API_READ_ONLY_TOKEN
      || process.env.UPSTASH_REDIS_REST_READ_ONLY_TOKEN
      || redisToken(false),
    );
  }
  return cleanEnv(
    process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN
    || process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

export function createGuestbookRedis({ readOnly = false } = {}) {
  const url = redisUrl();
  const token = redisToken(readOnly);
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function isGuestbookConfigured() {
  return Boolean(redisUrl() && redisToken(false));
}

function normalizeEntry(item) {
  if (!item) return null;
  if (typeof item === "string") {
    try {
      return JSON.parse(item);
    } catch {
      return null;
    }
  }
  return item;
}

function publicEntry(entry) {
  if (!entry) return null;
  const { owner_token: _owner_token, ...safe } = entry;
  return safe;
}

export function sanitizeEntriesForPublic(entries) {
  return entries.map(publicEntry).filter(Boolean);
}

export async function listGuestbookEntries(redis) {
  const raw = await redis.lrange(GUESTBOOK_KEY, 0, MAX_ENTRIES - 1);
  return raw.map(normalizeEntry).filter(Boolean);
}

async function rewriteGuestbookEntries(redis, entries) {
  await redis.del(GUESTBOOK_KEY);
  if (entries.length === 0) return;
  await redis.lpush(GUESTBOOK_KEY, ...entries.slice().reverse());
}

export async function purgeGuestbookEntries(redis, predicate) {
  const entries = await listGuestbookEntries(redis);
  const next = entries.filter((entry) => !predicate(entry));
  await rewriteGuestbookEntries(redis, next);
  return sanitizeEntriesForPublic(next);
}

export async function addGuestbookEntry(redis, { name, message, ownerToken }) {
  const cleanName = String(name || "").trim().slice(0, 40);
  const cleanMsg = String(message || "").trim().slice(0, 140);
  const token = String(ownerToken || "").trim();

  if (!cleanName || !cleanMsg) {
    const error = new Error("Name and message are required.");
    error.status = 400;
    throw error;
  }

  if (!token || token.length < 16 || token.length > 64) {
    const error = new Error("Invalid session token.");
    error.status = 400;
    throw error;
  }

  const lower = cleanMsg.toLowerCase();
  if (BLOCKED.some((word) => lower.includes(word))) {
    const error = new Error("Message blocked.");
    error.status = 400;
    throw error;
  }

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: cleanName,
    message: cleanMsg,
    created_at: new Date().toISOString(),
    owner_token: token,
  };

  await redis.lpush(GUESTBOOK_KEY, entry);
  await redis.ltrim(GUESTBOOK_KEY, 0, MAX_ENTRIES - 1);

  return publicEntry(entry);
}

export async function deleteGuestbookEntry(redis, { id, ownerToken }) {
  const entryId = String(id || "").trim();
  const token = String(ownerToken || "").trim();

  if (!entryId || !token) {
    const error = new Error("Entry id and owner token are required.");
    error.status = 400;
    throw error;
  }

  const entries = await listGuestbookEntries(redis);
  const target = entries.find((entry) => entry.id === entryId);

  if (!target) {
    const error = new Error("Entry not found.");
    error.status = 404;
    throw error;
  }

  if (target.owner_token !== token) {
    const error = new Error("You can only remove your own stamp.");
    error.status = 403;
    throw error;
  }

  const next = entries.filter((entry) => entry.id !== entryId);
  await rewriteGuestbookEntries(redis, next);
  return sanitizeEntriesForPublic(next);
}

export async function checkGuestbookRateLimit(redis, ip) {
  const key = `guestbook:rate:${ip || "unknown"}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 3600);
  }
  if (count > 8) {
    const error = new Error("Too many posts. Try again later.");
    error.status = 429;
    throw error;
  }
}

export function getClientIp(request) {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers["x-real-ip"] || "unknown";
}
