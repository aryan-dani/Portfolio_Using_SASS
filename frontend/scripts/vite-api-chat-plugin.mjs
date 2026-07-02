import { loadEnv } from "vite";
import { generateIshaniReply } from "../api/ishaniChat.js";
import { handleGuestbookRequest } from "../api/guestbook.js";

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function createMockResponse(res) {
  return {
    status(code) {
      res.statusCode = code;
      return this;
    },
    json(payload) {
      sendJson(res, res.statusCode || 200, payload);
      return this;
    },
    setHeader(key, value) {
      res.setHeader(key, value);
      return this;
    },
  };
}

/** Serves /api/* during `vite` dev (Vercel functions only run on deploy or `vercel dev`). */
export function apiChatDevPlugin() {
  return {
    name: "api-chat-dev",
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, "");
      const apiKey = env.GROQ_API_KEY || process.env.GROQ_API_KEY;

      for (const [key, value] of Object.entries(env)) {
        if (value && !process.env[key]) process.env[key] = String(value).trim();
      }

      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split("?")[0];

        if (path === "/api/guestbook") {
          try {
            const body = req.method === "POST" ? await readJsonBody(req) : {};
            await handleGuestbookRequest(
              { method: req.method, headers: req.headers, body },
              createMockResponse(res),
            );
          } catch (error) {
            sendJson(res, 500, { error: error.message || "Guestbook failed" });
          }
          return;
        }

        if (path !== "/api/chat") {
          next();
          return;
        }

        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed" });
          return;
        }

        try {
          const body = await readJsonBody(req);
          const result = await generateIshaniReply(
            {
              message: body.message,
              history: body.history,
              currentPath: body.currentPath,
            },
            apiKey,
          );
          sendJson(res, 200, result);
        } catch (error) {
          sendJson(res, error.status || 500, { error: error.message || "Generation failed" });
        }
      });
    },
  };
}
