export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL requerida" });
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SocialPlanner/1.0)" }
    });
    const html = await response.text();
    // Strip HTML tags, keep text content
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 8000); // Limit to 8k chars
    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: "No se pudo leer la URL" });
  }
}
