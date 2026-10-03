# Timer

A desktop countdown timer. Enter the clock time it should end; if that time has passed today, it counts down to tomorrow. Timer sessions survive page refreshes. Screens narrower than 1100 pixels show a desktop-only notice.

Set a time in the URL with `?end=17:00`. Starting the timer changes the URL to a shareable `?timer=…` link that opens the active countdown.

## Local development

- Use Node.js 22 and pnpm 10.
- Run `pnpm install`.
- Run `pnpm db:migrate` to create the local D1 database.
- Run `pnpm dev` and open `http://localhost:4321` in a desktop browser at least 1100 pixels wide.

Astro serves the page at port 4321. Wrangler serves the Hono API at port 8787.

## Cloudflare deployment

The Worker is configured for `timer.kuyacarlo.dev` and the `stilltime-db` D1 database. After setting your Cloudflare `account_id` and the database ID in `wrangler.jsonc`, apply migrations with `pnpm --filter @starter/api exec wrangler d1 migrations apply stilltime-db --remote --config ../../wrangler.jsonc`, then deploy with `pnpm deploy`.

The deploy command builds the static Astro page and deploys it with the Hono Worker. Cloudflare D1 stores timer sessions.
