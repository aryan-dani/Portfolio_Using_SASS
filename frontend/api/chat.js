import { generateIshaniReply } from "./ishaniChat.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { message, history, currentPath } = req.body || {};

  try {
    const result = await generateIshaniReply(
      { message, history, currentPath },
      process.env.GROQ_API_KEY,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "Generation failed" });
  }
}
