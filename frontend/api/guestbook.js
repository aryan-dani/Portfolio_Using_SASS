import {
  addGuestbookEntry,
  checkGuestbookRateLimit,
  createGuestbookRedis,
  getClientIp,
  isGuestbookConfigured,
  listGuestbookEntries,
} from "./guestbookStore.js";

export async function handleGuestbookRequest(request, response) {
  if (!isGuestbookConfigured()) {
    return response.status(503).json({
      error: "Guestbook is not configured. Add Upstash Redis env vars in Vercel.",
    });
  }

  if (request.method === "GET") {
    try {
      const redis = createGuestbookRedis({ readOnly: true });
      const entries = await listGuestbookEntries(redis);
      return response.status(200).json(entries);
    } catch {
      return response.status(500).json({ error: "Could not load guestbook." });
    }
  }

  if (request.method === "POST") {
    try {
      const redis = createGuestbookRedis({ readOnly: false });
      await checkGuestbookRateLimit(redis, getClientIp(request));

      const { name, message } = request.body || {};
      const entry = await addGuestbookEntry(redis, { name, message });
      const entries = await listGuestbookEntries(redis);
      return response.status(201).json({ entry, entries });
    } catch (error) {
      return response.status(error.status || 500).json({
        error: error.message || "Could not save to wall.",
      });
    }
  }

  response.setHeader("Allow", "GET, POST");
  return response.status(405).json({ error: "Method not allowed" });
}

export default async function handler(request, response) {
  return handleGuestbookRequest(request, response);
}
