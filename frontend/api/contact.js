import { createGuestbookRedis, getClientIp } from "./guestbookStore.js";

const CONTACT_EMAIL = "daniaryan212@gmail.com";
const MAX_MESSAGE_LENGTH = 5000;
const CONTACT_RATE_LIMIT = 8;
const CONTACT_RATE_WINDOW_MS = 60 * 60 * 1000;
const memoryRateLimits = new Map();

function stripNewlines(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

function checkMemoryRateLimit(ip) {
  const now = Date.now();
  const key = ip || "unknown";
  let entry = memoryRateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + CONTACT_RATE_WINDOW_MS };
    memoryRateLimits.set(key, entry);
  }
  entry.count += 1;
  if (entry.count > CONTACT_RATE_LIMIT) {
    const error = new Error("Too many messages. Try again later.");
    error.status = 429;
    throw error;
  }
}

async function checkContactRateLimit(ip) {
  const redis = createGuestbookRedis();
  if (redis) {
    const key = `contact:rate:${ip || "unknown"}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 3600);
    if (count > CONTACT_RATE_LIMIT) {
      const error = new Error("Too many messages. Try again later.");
      error.status = 429;
      throw error;
    }
    return;
  }
  checkMemoryRateLimit(ip);
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return response.status(503).json({
      error: "Contact endpoint is not configured. Add RESEND_API_KEY in production.",
    });
  }

  try {
    await checkContactRateLimit(getClientIp(request));
  } catch (error) {
    return response.status(error.status || 429).json({ error: error.message });
  }

  const { name, email, subject, message } = request.body || {};
  if (!name || !email || !message) {
    return response.status(400).json({ error: "Name, email, and message are required." });
  }

  const safeName = stripNewlines(name).slice(0, 120);
  const safeEmail = stripNewlines(email).slice(0, 200);
  const safeSubject = stripNewlines(subject || "Portfolio Contact").slice(0, 200);
  const safeMessage = String(message).trim();

  if (!safeName || !safeEmail || !safeMessage) {
    return response.status(400).json({ error: "Name, email, and message are required." });
  }
  if (safeMessage.length > MAX_MESSAGE_LENGTH) {
    return response.status(400).json({
      error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).`,
    });
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
      to: [CONTACT_EMAIL],
      reply_to: safeEmail,
      subject: `[Portfolio] ${safeSubject} from ${safeName}`,
      text: `Name: ${safeName}\nEmail: ${safeEmail}\nSubject: ${safeSubject}\n\nMessage:\n${safeMessage}`,
    }),
  });

  const data = await resendResponse.json().catch(() => ({}));
  if (!resendResponse.ok) {
    return response.status(resendResponse.status).json({
      error: "Failed to send message.",
    });
  }

  return response.status(200).json({ success: true, id: data.id });
}
