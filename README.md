# CardsIQ Inventory Console (enhanced)

A self-contained inventory console. All inventory, cost basis, events, reports,
views, and settings live in the browser (localStorage). The only server calls are:

- `POST /api/price` — prices one cert. Reads `{cert, grader}`, returns
  `{ result: { cert, grader, data: { certification, valuation, market, cardsiq, errors } } }`.
- `POST /api/auth` — optional access-password check via the `x-app-password` header.

That's the whole "backend": two serverless functions that proxy your pricing API
and keep the API key server-side. Everything else is client-side.

## Files
- `index.html` — the app (localStorage; no build step)
- `api/price.js` — pricing proxy; adds `Authorization` from `CARDSIQ_API_KEY`
- `api/auth.js` — password check; on if `APP_PASSWORD` is set, otherwise open
- `vercel.json` — function config

## Deploy (Vercel)
```bash
cd cardsiq-enhanced
vercel                      # or import the folder/repo in the Vercel dashboard
vercel env add CARDSIQ_API_KEY   # your pricing API key (Production + Preview)
# optional gate:
vercel env add APP_PASSWORD      # if set, /api/price requires x-app-password
vercel --prod
```

## Notes
- This app calls `/api/price` **one cert at a time** (it prices in a loop), so a
  large batch is many function calls. The functions already handle that; if you
  hit the provider's rate limit, raise the pricing delay in Settings.
- To move inventory off the browser and onto a real multi-user database
  (server-persisted, partner-isolated), that's the separate `cardsiq-backend`
  project — this bundle is the standalone client version.
- Rotate the pricing API key before sharing; it lives only in the Vercel env var,
  never in these files.
