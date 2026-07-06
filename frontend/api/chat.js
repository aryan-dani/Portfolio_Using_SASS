import { generateIshaniReply } from "./ishaniChat.js";
import { createGuestbookRedis } from "./guestbookStore.js";

async function checkChatRateLimit(ip) {
  const redis = createGuestbookRedis();
  if (!redis) return;

  const key = `chat:rate:${ip || "unknown"}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 3600);
  if (count > 30) {
    const error = new Error("Too many messages. Try again in a bit.");
    error.status = 429;
    throw error;
  }
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers["x-real-ip"] || "unknown";
}

export default async function handler(req, res) {
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
