# SaaS Live Dashboard

A live SaaS dashboard application — a calm personal operating system that turns
habits, spending, health, audience growth and long-term goals into one clear
daily view.

This repository is a **daily build archive**: the working source is committed
here as it evolves, with a dated entry in [`docs/daily/`](docs/daily) describing
what changed on each build day.

---

## What's in the app

| Area | What it does |
| --- | --- |
| Dashboard | Daily "flow score", next action, and a summary tile per pillar |
| Habits | Create, complete (optimistic toggle), delete; streak tracking |
| Money | Weekly budget with spend/remaining/percent used, expense log |
| Health | Readiness, sleep, steps, and logged movement minutes |
| Growth | Audience total, weekly delta, weekly check-in cadence |
| Goals | 90-day goals with progress logging and percent complete |
| Calendar | Prepares a time block as a Google Calendar link or `.ics` export |

The landing page is public; every dashboard route is behind authentication.

## Stack

- **Monorepo:** pnpm workspaces, Node.js 24, TypeScript 5.9
- **Web:** React 19 + Vite 7, Tailwind CSS v4, shadcn/ui (new-york), wouter, TanStack Query, Framer Motion, Recharts
- **API:** Express 5
- **Database:** PostgreSQL + Drizzle ORM
- **Validation:** Zod, `drizzle-zod`
- **API contract:** OpenAPI 3.1 → Orval codegen (React Query hooks + Zod schemas)
- **Auth:** Clerk (browser-side), with a server-side Clerk Frontend API proxy
- **Server build:** esbuild (single ESM bundle)

## Layout

```
artifacts/
  mindflow/          React landing page + authenticated dashboard
  api-server/        Express API, auth middleware, seeded first-run data
lib/
  api-spec/          openapi.yaml — source of truth for the API contract
  api-client-react/  Generated React Query hooks + custom fetch wrapper
  api-zod/           Generated Zod schemas used by the server
  db/                Drizzle schema and database client
scripts/             Workspace scripts
docs/                Architecture notes and the daily build archive
```

## Run it

```bash
pnpm install
cp .env.example .env          # fill in DATABASE_URL and Clerk keys

pnpm --filter @workspace/db run push            # push the schema (dev only)
pnpm --filter @workspace/api-spec run codegen   # generate API client + zod schemas
pnpm --filter @workspace/api-server run dev     # API server (PORT, default 5000)
pnpm --filter @workspace/mindflow run dev       # web app (PORT, BASE_PATH)
```

Other commands:

```bash
pnpm run typecheck    # typecheck every package
pnpm run build        # typecheck + build all packages
```

### Generated code

`lib/api-client-react/src/generated/` and `lib/api-zod/src/generated/` are
produced by Orval from `lib/api-spec/openapi.yaml` and are **not** committed in
this archive. Run the codegen command above once after installing — before that,
typechecking will report missing modules.

### UI components

Only the shadcn/ui components the app imports are vendored under
`artifacts/mindflow/src/components/ui/`. `components.json` is committed, so any
additional component can be pulled in with `pnpm dlx shadcn@latest add <name>`.

## Architecture decisions

- The OpenAPI spec is the single source of truth; clients and server schemas are
  generated from it. Regenerate after every spec change.
- Clerk owns browser authentication; protected API routes derive the user ID
  server-side and never trust a client-supplied ID.
- The app is the source of truth for tasks. Calendar preparation records do not
  complete app tasks.
- Calendar export is intentionally permission-honest: `.ics` files and Google
  Calendar review links are never presented as a live two-way sync.
- New accounts receive a small per-user seed dataset on first authenticated use,
  and the dashboard labels it as demo data.
- The Clerk proxy middleware must be mounted before the Express body parsers.

## Archive conventions

- One commit per build day, at minimum; more when the work splits cleanly.
- Every build day gets a dated entry in `docs/daily/YYYY-MM-DD.md` covering what
  changed, why, and what's next. `docs/daily/TEMPLATE.md` is the starting point.
- Secrets never land in the repo — only `.env.example` with empty values.
