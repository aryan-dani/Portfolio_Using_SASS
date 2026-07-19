import { generateIshaniReply } from "./ishaniChat.js";
import { createGuestbookRedis } from "./guestbookStore.js";

const CHAT_RATE_LIMIT = 30;
const CHAT_RATE_WINDOW_MS = 60 * 60 * 1000;
const memoryRateLimits = new Map();

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers["x-real-ip"] || "unknown";
}

function checkMemoryRateLimit(ip) {
  const now = Date.now();
  const key = ip || "unknown";
  let entry = memoryRateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + CHAT_RATE_WINDOW_MS };
    memoryRateLimits.set(key, entry);
  }
  entry.count += 1;
  if (entry.count > CHAT_RATE_LIMIT) {
    const error = new Error("Too many messages. Try again in a bit.");
    error.status = 429;
    throw error;
  }
}

export async function checkChatRateLimit(ip) {
  const redis = createGuestbookRedis();
  if (redis) {
    const key = `chat:rate:${ip || "unknown"}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 3600);
    if (count > CHAT_RATE_LIMIT) {
      const error = new Error("Too many messages. Try again in a bit.");
      error.status = 429;
      throw error;
    }
    return;
  }

  // Fail closed: without Redis, still cap per-IP in this process.
  checkMemoryRateLimit(ip);
}

export async function handleChatRequest(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { message, history, currentPath, siteState } = req.body || {};

  try {
    await checkChatRateLimit(getClientIp(req));
    const result = await generateIshaniReply(
      { message, history, currentPath, siteState },
      process.env.GROQ_API_KEY,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Generation failed" });
  }
}

export default async function handler(req, res) {
  return handleChatRequest(req, res);
}
