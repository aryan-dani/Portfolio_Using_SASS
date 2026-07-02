export async function askIshani(message, { history = [], currentPath = "/" } = {}) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history: history.map((m) => ({ role: m.role, content: m.text })),
      currentPath,
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || "Kuro is offline");
  }
  const data = await response.json();
  return {
    reply: data.reply || "No response.",
    actions: Array.isArray(data.actions) ? data.actions : [],
  };
}
