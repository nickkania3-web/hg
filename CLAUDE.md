# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

HomeGame: a web app MVP where fans away from their team's home market find bars where *that team's* fans actually gather, ranked by crowd-verified check-ins rather than generic bar listings. Solo-dev MVP, no real user accounts.

## Commands

```bash
npm run dev          # start dev server (Turbopack) at localhost:3000
npm run build         # production build — also the fastest way to catch route/type errors across the whole app
npm run lint           # eslint (flat config, eslint.config.mjs)
npx tsc --noEmit        # typecheck only (no build script wraps this — run directly)
```

There is no test suite in this repo.

### Database (Prisma + local Postgres)

Dev Postgres runs locally via Homebrew, not Docker: `brew services start postgresql@16` (data dir auto-managed by brew). Connection details live in `.env` (git-ignored); `.env.example` documents both the local and production (Neon/Supabase) shapes. Local DB name is `homegame`.

```bash
npx prisma migrate dev --name <description>   # create + apply a migration in dev
npx prisma migrate reset --force                # DESTRUCTIVE: drops all data, reapplies migrations, re-runs seed
npx tsx prisma/seed.ts                            # re-run seed manually (also runs automatically after migrate reset)
npx prisma studio                                  # browse data
```

`prisma migrate reset` is blocked by two independent layers when run by an agent: Prisma's own CLI detects agent invocation and refuses without a `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` env var set to the user's exact consent text, and Claude Code's own permission classifier can separately block the Bash call regardless of that env var. Neither layer distinguishes "the agent typed this" from "the user typed this via `!` in an agent session" — both trigger either way. Don't try to route around either layer (e.g. raw `psql` drops); get explicit user consent and, if the classifier still blocks it, have the user run the command themselves via `!`.

**Gotcha:** the `PrismaClient` in `src/lib/db.ts` is cached on `globalThis` for dev hot-reload. If you run a migration while `next dev` is already running, the live server keeps the *old* generated client and schema changes silently won't take effect (queries against new fields/tables will throw "Unknown field" errors). Restart the dev server after any `prisma migrate dev` / `prisma generate`.

**Gotcha:** adding a required/unique column to a table that already has rows will fail a normal `migrate dev` (Postgres can't backfill a value it doesn't have). Since this is pre-launch dev/seed data only, the resolution used throughout this project is `migrate reset` rather than hand-writing a backfill migration — not a general pattern to reach for once there's real user data.

npm here also gates install scripts (see `allowScripts` in `package.json`) — a new dependency with a postinstall script will need `npm approve-scripts <pkg>` before `npm install` finishes wiring it up.

## Architecture

**Stack:** Next.js 16 (App Router, TypeScript, `src/` dir), Prisma 6 (pinned — Prisma 7 removed schema-file `datasource url` in favor of adapter config, which isn't worth the churn for this project's scale), Postgres, Tailwind v4 (CSS-first config, no `tailwind.config.ts`), Leaflet/`react-leaflet` for maps.

### Fan identity — the load-bearing concept

There is no auth. A `Fan` is identified by a `deviceId` (UUID minted client-side into `localStorage` via `src/lib/deviceId.ts`, sent with every write). The **first** write from a given device creates the `Fan` row; each route that mutates fan-owned data (verifications, team follows, bar favorites) does its own `prisma.fan.upsert({ where: { deviceId }, ... })` inline — there's no shared helper for this yet, so keep the upsert shape consistent with the existing routes (`src/app/api/verifications/route.ts`, `src/app/api/follows/route.ts`, `src/app/api/favorites/route.ts`) when adding a new one.

This means: no login, no password, no email required anywhere. A fan who clears `localStorage` or switches devices loses their identity and starts over as a new `Fan` on next action — an accepted MVP tradeoff, not a bug.

### Data model

Core many-to-many is `TeamBarLink(teamId, barId, verificationCount)` — which bars are "home" for which teams, with a **denormalized rollup count**. That count is not independently authoritative: it's kept in sync with the underlying `Verification` rows inside a `prisma.$transaction` (see `src/app/api/verifications/route.ts`) whenever a check-in is created. If you ever need to backfill/recompute it, sum `Verification` rows grouped by `(teamId, barId)` — don't trust `verificationCount` as a source of truth during data repair.

Fan-owned join tables, all keyed off `Fan.id`:
- `FanTeamFollow` — teams a fan follows ("My Teams" on the profile page)
- `FanBarFavorite` — bars a fan has starred, independent of verification history
- `Verification` — a check-in (fan + team + bar + timestamp); rolls up into `TeamBarLink.verificationCount` and is also the raw source for "visited bars" on the profile

Verification writes are rate-limited per `(fan, team, bar)` to one per rolling 12h window (see the spam-guard check in `src/app/api/verifications/route.ts`) — this is enforced in the route, not the database.

Ranking tiers (`src/lib/ranking.ts`, `getTierInfo(verificationCount)`) are the single source of truth for the "Confirmed Fan Spot" / "Fans Gather Here" / "A Few Fans Go Here" thresholds (currently 10+ / 3–9 / 1–2) and their colors — used by both `BarCard` and `MapView` so list and map styling never drift apart. Change thresholds here, not in components.

### Route structure

API routes (`src/app/api/*/route.ts`) are intentionally thin: validate input, call Prisma, shape a DTO from `src/lib/types.ts`, return `Response.json(...)`. No service/repository layer — Prisma is called directly from route handlers.

Pages mix server and client components depending on whether they need `deviceId` (which only exists in `localStorage`, so anything fan-scoped must be client-rendered):
- `/` (landing), `/admin` — straightforward
- `/search` — `page.tsx` is a server component that `await`s `searchParams` (Next 16: `params`/`searchParams` are Promises) and passes plain props into `SearchClient.tsx`, a client component that does the actual fetching/state
- `/profile` — fully client-rendered (`"use client"` page), since everything on it is keyed by the browser's `deviceId`

When adding a data-fetch-on-mount `useEffect`, inline the `fetch(...).then(...)` chain directly in the effect body rather than calling a separately-defined async helper function — the project's eslint config (`react-hooks/set-state-in-effect`) flags indirect calls to a function that sets state, even when that function is genuinely async-safe. `loadBars` in `SearchClient.tsx` is the reference pattern: an inline effect for the initial/reactive load, plus a separately-defined async function only for imperative reloads triggered from event handlers (which the rule doesn't flag).

When stacking a modal/overlay over the Leaflet map, give the map's wrapper `isolate` (CSS containment) — Leaflet's internal panes/controls use `z-index` up to 1000, which will bleed through an uncontained ancestor and sit on top of a naively-z-indexed modal.

### Seed data

`prisma/seed.ts` clears and repopulates: 9 teams (football + basketball; NCAA/NFL/NBA) and 18 real Chicago bar venues (fabricated team associations/counts), wired through `TeamBarLink` with a deliberately varied spread of verification counts so all three ranking tiers are represented, plus a batch of seeded `Fan`/`Verification` rows. Team and bar IDs are Prisma-generated `cuid()`s that change on every reseed — don't hardcode them anywhere outside ad hoc test scripts.
