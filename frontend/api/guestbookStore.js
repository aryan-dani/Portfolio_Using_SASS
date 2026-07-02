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

export async function listGuestbookEntries(redis) {
  const raw = await redis.lrange(GUESTBOOK_KEY, 0, MAX_ENTRIES - 1);
  return raw.map(normalizeEntry).filter(Boolean);
}

export async function addGuestbookEntry(redis, { name, message }) {
  const cleanName = String(name || "").trim().slice(0, 40);
  const cleanMsg = String(message || "").trim().slice(0, 140);

  if (!cleanName || !cleanMsg) {
    const error = new Error("Name and message are required.");
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
  };

  await redis.lpush(GUESTBOOK_KEY, entry);
  await redis.ltrim(GUESTBOOK_KEY, 0, MAX_ENTRIES - 1);

  return entry;
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
