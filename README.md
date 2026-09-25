# Swapr

I had 24 hours to build an FX wallet Swapr, which holds NGN, USD, GBP, EUR and JPY. You can see what you have, watch the rate move, lock a quote for 30 seconds, and keep a history of swaps.

I built the interface first so I could feel the product, then wired a mock API that behaves like a slightly unreliable network: latency, the odd 503, expired quotes, and fees charged on top of what you send.

## Setup

Node 20+ and pnpm. No login. No `.env`.

```bash
pnpm install
pnpm dev     # http://localhost:3000
pnpm test
```

**Reviewer tools.** Open `http://localhost:3000/?debug=1`. A **Reviewer tools** button appears at the bottom right. Click it.

- **Force rates outage** — the next rate polls return 503. The board should keep the last good rates and mark them stale, not go blank. Click again to clear the outage.
- **Expire next conversion** — lock a quote on Convert, then confirm. The server returns `QUOTE_EXPIRED`. Balances should not change. Get a fresh quote after that.
- **Reset balances** — puts wallets, quotes, and history back to the seed amounts and clears the flags.

You can stay on a screen with the flag, e.g. `/convert?debug=1`.

The mock is Next.js Route Handlers. State lives in memory on the server. A refresh in the same session is fine. A new process (including a Vercel cold start) starts clean.

## Architecture

The UI does not import server money functions. Screens call HTTP (`src/lib/api`) → `src/app/api` → `src/server`. Routes are `/`, `/convert`, `/rates`, and `/transactions`. TanStack Query polls rates every five seconds and keeps the last good payload if a request fails. `src/utils` is the careful stuff: `bigint` money, quote remaining time, formatting. `src/components` is what you see.

Next.js 16, React 19, TypeScript (strict), Tailwind v4, React Hook Form, Axios, Jest.

## Key decisions

**Money.** Amounts cross the API as integer strings in minor units. I used `bigint`, not floats. Display is `Intl.NumberFormat` (JPY has no kobo). The fee is 0.5% rounded up, at least 1 minor unit, added on top of the sell amount. The locked rate is 0.5% worse than mid-market so the quote is not a fantasy mid.

**Quote countdown.** I do not decrement a counter in `setInterval`. Remaining time is `expiresAt` and `serverTime` compared with when the client received the quote. Background the tab and it should still be true. At zero, confirm is disabled. If the server still returns `QUOTE_EXPIRED`, balances do not move. Change the amount or either currency and that quote is thrown away.

**Stale rates.** Poll every 5s. Pause while the tab is hidden; fetch again when it is visible. A failed poll keeps the last numbers and labels them stale after 15s. I would rather show an old rate than a blank board.

**Double submit.** Confirm is ignored while a request is in flight. Each quote gets one idempotency key. Send it twice and you get the first conversion back. A used quote cannot be spent again with a different key.

**Sparkline.** The live board keeps the last 36 successful polls per pair (about three minutes at 5s). It is a tiny SVG. No extra API. The first load looks almost flat until a few polls land. Failed 503s are skipped so the line never crashes to zero.

## Trade-offs

I shipped two stretch items: **dark mode** (system preference plus a toggle) and the **sparkline**. I did not add streaming rates, a locale switcher, or a Playwright convert flow.

## Next steps

An end-to-end test around quote expiry, and not losing history when a serverless instance dies.

## AI usage

I used Cursor (Grok) for the **mock APIs** and the **Jest tests**. 

## Time spent

About five focused hours.
