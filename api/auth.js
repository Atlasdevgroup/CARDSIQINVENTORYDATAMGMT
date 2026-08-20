// api/auth.js
// Lets the front-end check the access password and learn whether protection is on.
// Real protection lives here (and in price.js): the password is compared server-side
// against APP_PASSWORD, which never reaches the browser. The client-side gate is only UX.

export default async function handler(req, res) {
  const appPw = process.env.APP_PASSWORD;

  // No password configured -> the app is open. Tell the client so it skips the gate.
  if (!appPw) return res.status(200).json({ ok: true, unprotected: true });

  const got = req.headers["x-app-password"] || (req.body && req.body.password) || "";
  if (got === appPw) return res.status(200).json({ ok: true });
  return res.status(401).json({ ok: false });
}
