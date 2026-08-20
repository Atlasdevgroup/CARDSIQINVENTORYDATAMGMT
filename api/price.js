// api/price.js
// Serverless proxy: the browser calls THIS, never the upstream API directly.
// The CardsIQ API key lives only in the Vercel env var CARDSIQ_API_KEY and
// never reaches the client. One cert per invocation keeps latency low and lets
// the front-end fill rows in one at a time.

const UPSTREAM = process.env.CARDSIQ_API_URL || "http://2.24.119.170:3000/api/price-batch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }

  const apiKey = process.env.CARDSIQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server missing CARDSIQ_API_KEY. Set it in Vercel project settings." });
  }

  // Optional access password: if APP_PASSWORD is set, every call must carry it.
  const appPw = process.env.APP_PASSWORD;
  if (appPw && (req.headers["x-app-password"] || "") !== appPw) {
    return res.status(401).json({ error: "Unauthorized — access password required or incorrect." });
  }

  // Vercel parses JSON bodies automatically for application/json.
  const body = req.body || {};
  const cert = body.cert != null ? String(body.cert).trim() : "";
  const grader = body.grader != null ? String(body.grader).trim().toLowerCase() : "";

  if (!cert || !grader) {
    return res.status(400).json({ error: "Both cert and grader are required." });
  }

  try {
    const upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{ cert, grader }]),
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      // Surface the upstream status so the client can distinguish auth (401)
      // from rate limiting and other failures.
      return res.status(upstream.status).json({
        error: `Upstream returned ${upstream.status}.`,
        status: upstream.status,
        detail: text.slice(0, 300),
      });
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: "Upstream sent a non-JSON response." });
    }

    const result = json.results && json.results[0] ? json.results[0] : null;
    if (!result) {
      return res.status(502).json({ error: "Upstream returned no result for this cert." });
    }

    return res.status(200).json({ result });
  } catch (err) {
    return res.status(502).json({ error: "Could not reach the pricing API.", detail: String(err && err.message || err) });
  }
}
