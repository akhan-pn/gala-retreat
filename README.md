# Gala Retreat — website & visitor dashboard

Marketing site and private admin dashboard for **Gala Retreat Resort &
Convention**, Ramdas Pally, Hyderabad.

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Drizzle ORM · Neon Postgres.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then fill in the three values
npm run db:push                # creates the two tables in Neon
npm run dev                    # http://localhost:3000
```

The site renders fine with **no** environment variables — enquiries return a
clear "could not save, please call us" message and `/admin` explains what is
missing, rather than crashing.

## Environment

| Variable | What it is |
|---|---|
| `DATABASE_URL` | Neon Postgres pooled connection string. Free tier is plenty. |
| `ADMIN_PASSWORD` | The password for `/admin`. Share this with the client. |
| `ADMIN_SESSION_SECRET` | Any long random string — `openssl rand -base64 32`. |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local development |
| `npm run build` / `start` | Production build and serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:push` | Push the Drizzle schema to Neon |
| `npm run db:studio` | Browse the data in Drizzle Studio |
| `npm run check` | Report outstanding placeholders and unconfirmed config |
| `npm run predeploy` | **Run before going live** — typecheck, lint, and *fail* on any placeholder or unconfirmed value |

## Structure

```
src/
  config/site.ts        Every client-specific value — phone, address, hours
  config/pending.ts     Values still unconfirmed; gates `check:config`
  content/gallery.ts    Image manifest (src, alt, space, dimensions)
  content/spaces.ts     The four bookable spaces
  content/seasonal.ts   The seasonal banner slot on the home page
  components/           Carousel, Lightbox, Reveal, Parallax, forms, chrome
  lib/db/               Drizzle schema and Neon client
  lib/auth.ts           HMAC-signed admin session cookie
  app/(site)/           Home, About, Gallery, Enquiry, Contact
  app/(admin)/          The dashboard — its own root layout, never tracked
  app/api/              enquiry, pageview, admin login/logout/export
```

The carousel is one component (`components/Carousel.tsx`) used twice: as the
full-bleed home hero, and inside the gallery lightbox.

## The dashboard

`/admin`, password-gated. Shows unique visitors, page views, enquiries, a
14-day traffic chart, where visitors came from, most-visited pages, and the
full enquiry log with a CSV export.

Analytics are first-party only — one `httpOnly` cookie holding a random id so
repeat visits collapse into one visitor. No third-party scripts, no
cross-site tracking, nothing to disclose in a cookie banner beyond the basics.
Admin pages are excluded from the visitor log.

## Running the database locally

Neon's driver speaks HTTP, not the Postgres wire protocol, so a plain local
Postgres needs a small proxy in front of it. `getDb()` detects a localhost
`DATABASE_URL` and points the driver at that proxy automatically.

```bash
docker run -d --name gala-pg -e POSTGRES_PASSWORD=gala -e POSTGRES_DB=gala \
  -p 55432:5432 postgres:16-alpine

docker run -d --name neon-proxy --add-host=host.docker.internal:host-gateway \
  -p 4444:4444 \
  -e PG_CONNECTION_STRING="postgres://postgres:gala@host.docker.internal:55432/gala" \
  ghcr.io/timowilhelm/local-neon-http-proxy:main

psql postgresql://postgres:gala@localhost:55432/gala -f drizzle/0000_*.sql
```

Then in `.env.local`:

```
DATABASE_URL="postgres://postgres:gala@db.localtest.me:5432/gala"
```

`npm run smoke:db` exercises the schema and every dashboard aggregate against
a plain Postgres connection — useful for catching a query mistake without a
Neon project:

```bash
SMOKE_DATABASE_URL=postgresql://postgres:gala@localhost:55432/gala npm run smoke:db
```

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import it in Vercel — the framework is detected automatically.
3. Add the three environment variables above to **Production** and **Preview**.
4. Deploy, then run `npm run db:push` locally once against the production
   `DATABASE_URL` to create the tables.
5. Add the custom domain in Vercel → Settings → Domains, and update
   `site.url` in `src/config/site.ts` to match.

## Before launch

Run `npm run predeploy`. It fails while either of these is outstanding:

- **Photography** — every image is a licensed stand-in. See
  [`docs/shot-list.md`](docs/shot-list.md).
- **Config** — domain, email address, Google Maps link and opening hours are
  assumptions. See `src/config/pending.ts`.

Confirmed from the client's Instagram bio and already wired in: WhatsApp on
+91 98488 19444 (bookings), call-now on +91 90328 07333 (reception).
