# CardsIQ Inventory Intake

Upload a `grader,cert` CSV, watch each card price in live, see the inventory value assemble.

The browser never touches the API key. It calls `/api/price` (a Vercel serverless
function), which adds the `Authorization` header server-side and forwards one cert
to the CardsIQ pricing API.

## Files
- `index.html` — the app (static, no build step)
- `api/price.js` — serverless proxy; reads `CARDSIQ_API_KEY` from the environment
- `vercel.json` — function config
- `sample.csv` — a few certs to test with

## Deploy (Vercel CLI)

```powershell
npm i -g vercel
cd cardsiq-inventory
vercel                       # first run: link/create the project, accept defaults
vercel env add CARDSIQ_API_KEY   # paste the key when prompted; choose Production (and Preview)
vercel --prod                # deploy to the live URL
```

To change the upstream URL without editing code, also set `CARDSIQ_API_URL`
(defaults to the current pricing endpoint).

## Deploy (GitHub + dashboard)
1. Push this folder to a GitHub repo.
2. vercel.com → New Project → import the repo.
3. Settings → Environment Variables → add `CARDSIQ_API_KEY`.
4. Deploy.

## Notes
- The **gap (ms)** control paces requests. If cards start returning `err:lookup`,
  raise it — that error is the upstream rate limit, not a bad cert.
- Rotate the API key before this is shared with anyone; set the new value with
  `vercel env rm CARDSIQ_API_KEY` then `vercel env add CARDSIQ_API_KEY`.
