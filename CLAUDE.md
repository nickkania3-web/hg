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

### Branding

Brand color tokens (`bg-brand`, `text-brand`, `border-brand`, `bg-brand-dark`, `bg-brand-cream`) are defined in `src/app/globals.css`'s `@theme inline` block — a terracotta (`#b5493c`) drawn from the HomeGame logo, with a darker hover shade and a cream accent. Used for primary CTAs, active tab/toggle states, selected-card borders, and nav-link hover — **not** for the ranking-tier badge colors (`src/lib/ranking.ts`) or the past/upcoming status badges, which are a deliberately separate semantic color system (green/amber/gray = hierarchy signal) and shouldn't be recolored to match brand chrome. `src/components/Logo.tsx` renders the icon+wordmark (used in every page header); `src/app/icon.svg` is the same mark as the site favicon (Next's file-convention icon, not `favicon.ico` — that file was removed in favor of this).

### Fan identity — the load-bearing concept

There is no auth. A `Fan` is identified by a `deviceId` (UUID minted client-side into `localStorage` via `src/lib/deviceId.ts`, sent with every write). The **first** write from a given device creates the `Fan` row; each route that mutates fan-owned data (verifications, team follows, bar favorites) does its own `prisma.fan.upsert({ where: { deviceId }, ... })` inline — there's no shared helper for this yet, so keep the upsert shape consistent with the existing routes (`src/app/api/verifications/route.ts`, `src/app/api/follows/route.ts`, `src/app/api/favorites/route.ts`) when adding a new one.

This means: no login, no password, no email required anywhere. A fan who clears `localStorage` or switches devices loses their identity and starts over as a new `Fan` on next action — an accepted MVP tradeoff, not a bug.

### Data model

Core many-to-many is `TeamBarLink(teamId, barId, verificationCount)` — which bars are "home" for which teams, with a **denormalized rollup count**. That count is not independently authoritative: it's kept in sync with the underlying `Verification` rows inside a `prisma.$transaction` (see `src/app/api/verifications/route.ts`) whenever a check-in is created. If you ever need to backfill/recompute it, sum `Verification` rows grouped by `(teamId, barId)` — don't trust `verificationCount` as a source of truth during data repair.

Fan-owned join tables, all keyed off `Fan.id`:
- `FanTeamFollow` — teams a fan follows ("My Teams" on the profile page)
- `FanBarFavorite` — bars a fan has starred, independent of verification history
- `Verification` — a check-in (fan + team + bar + timestamp); rolls up into `TeamBarLink.verificationCount` and is also the raw source for "visited bars" on the profile
- `WatchParty` (team + bar + city + `dateTime` + note + `createdByFanId`) / `RSVP` (fan + watchParty) — fan-hosted watch parties, independent of `Verification` (no auto-verify when a party happens). "Upcoming" vs. "Past" is computed from `dateTime` vs. `now()` at query time, never stored. Unlike `TeamBarLink`, RSVP counts are **not** denormalized — they're small enough that a plain `_count`/`.count()` per request is fine; don't add a rollup column here without a real reason. Note the generated Prisma Client property for the `RSVP` model is `prisma.rSVP` (only the leading character gets lowercased), not `prisma.rsvp`.

Verification writes are rate-limited per `(fan, team, bar)` to one per rolling 12h window (see the spam-guard check in `src/app/api/verifications/route.ts`) — this is enforced in the route, not the database.

Ranking tiers (`src/lib/ranking.ts`, `getTierInfo(verificationCount)`) are the single source of truth for the "Confirmed Fan Spot" / "Fans Gather Here" / "A Few Fans Go Here" thresholds (currently 10+ / 3–9 / 1–2) and their colors — used by both `BarCard` and `MapView` so list and map styling never drift apart. Change thresholds here, not in components.

### Route structure

API routes (`src/app/api/*/route.ts`) are intentionally thin: validate input, call Prisma, shape a DTO from `src/lib/types.ts`, return `Response.json(...)`. No service/repository layer — Prisma is called directly from route handlers.

Pages mix server and client components depending on whether they need `deviceId` (which only exists in `localStorage`, so anything fan-scoped must be client-rendered):
- `/admin` — straightforward, no fan-scoped data
- `/search`, `/watch-parties/[id]` — `page.tsx` is a server component that `await`s `params`/`searchParams` (Next 16: both are Promises) and passes plain props into a co-located client component (`SearchClient.tsx`, `WatchPartyDetailClient.tsx`) that does the actual fetching/state — the established pattern for any route that needs a dynamic segment or query param *and* `deviceId`
- `/` (main page), `/profile`, `/watch-parties`, `/timeline` — fully client-rendered (`"use client"` page, no server shell needed), since everything on them is keyed by the browser's `deviceId` and there's no route param to resolve server-side

When adding a data-fetch-on-mount `useEffect`, inline the `fetch(...).then(...)` chain directly in the effect body rather than calling a separately-defined async helper function — the project's eslint config (`react-hooks/set-state-in-effect`) flags indirect calls to a function that sets state, even when that function is genuinely async-safe. `loadBars` in `SearchClient.tsx` is the reference pattern: an inline effect for the initial/reactive load, plus a separately-defined async function only for imperative reloads triggered from event handlers (which the rule doesn't flag).

When stacking a modal/overlay over the Leaflet map, give the map's wrapper `isolate` (CSS containment) — Leaflet's internal panes/controls use `z-index` up to 1000, which will bleed through an uncontained ancestor and sit on top of a naively-z-indexed modal.

### Seed data

`prisma/seed.ts` clears and repopulates: 9 teams (football + basketball; NCAA/NFL/NBA) and 18 real Chicago bar venues (fabricated team associations/counts), wired through `TeamBarLink` with a deliberately varied spread of verification counts so all three ranking tiers are represented, plus a batch of seeded `Fan`/`Verification` rows, and 7 `WatchParty` rows (4 upcoming, 3 past) with `RSVP`s — one deliberately has 21 RSVPs to exercise the "show count, not attendee names" fallback (see below). Team and bar IDs are Prisma-generated `cuid()`s that change on every reseed — don't hardcode them anywhere outside ad hoc test scripts.

### Watch parties — attendee list vs. count

`GET /api/watch-parties/[id]` returns full attendee names only when `rsvpCount <= 20` (constant `ATTENDEE_LIST_THRESHOLD` in that route); above that it returns an empty `attendees` array and the UI falls back to showing just the count. This mirrors the ranking-tier-threshold pattern — tunable, not load-bearing logic. Hosting a party auto-creates an RSVP for the host. `WatchParty.city` is copied from the selected `Bar.city` at creation time, not typed by the host — keep it that way rather than letting it drift from the bar's actual city.

### Timeline feed — cursor pagination, not offset

`/timeline` (`GET /api/feed`) is a global, unpersonalized activity feed read straight off `Verification` — no new tables. Pagination is cursor-based on `Verification.id` via Prisma's native `cursor`/`skip: 1` (not a `createdAt < x` filter) specifically because `createdAt` values can collide across rows (easy with seeded/bulk data, not impossible with real concurrent check-ins); a timestamp-filter approach can silently skip or duplicate rows on a tie, cursor-on-id can't. `orderBy` is `[{ createdAt: "desc" }, { id: "desc" }]` — Prisma still locates the cursor row correctly by its unique `id` even with the compound sort. The `take: limit + 1` "peek one ahead" is how `nextCursor` gets computed without a separate count query — same pattern to reach for anywhere else that needs cursor pagination.

The `/timeline` page uses real infinite scroll (`IntersectionObserver` on a sentinel div), not a "Load more" button like the rest of the app. The observer callback (not the `useEffect` body itself) is what calls the paginated fetch — same reasoning as the `set-state-in-effect` note above: the callback fires asynchronously off a browser event, so it's exempt from that lint rule the same way an event handler would be.

Fan display name here reuses the existing nullable `Fan.displayName` with a `"A HomeGame fan"` fallback (same pattern as watch-party attendees) — there is no unique handle system in this schema. One was proposed once for an earlier version of this feature and explicitly backed out; don't reintroduce it without being asked.

### Main page — multi-team selection, and the one-row-per-team-bar gotcha

The main page (`src/app/page.tsx`) lets a fan multi-select any number of teams ("Choose My Team", `TeamMultiSelect`) and shows one aggregate, inline bar list + map filtered to bars linked to *any* selected team — no separate search/submit step. This reuses `FanTeamFollow`/`/api/follows` directly (the exact same persistence `/search`'s single-team `FollowButton` already used) — selecting a team here and following it from `/search` are the same underlying action. `/search?teamId=X` still exists unchanged as a single-team deep-dive (linked from profile team chips); it wasn't replaced, just no longer the main page's primary flow.

The multi-team bars query (`GET /api/bars/for-teams?teamIds=a,b,c&city=`) returns **one row per (team, bar) match**, not one row per bar — a bar linked to two selected teams (common in seed data, e.g. Kirkwood Bar & Grill matches both Michigan State football and the Packers) appears twice, each with its own team-specific tier/count from `TeamBarLink`. There's no cross-team merge/dedup; ranking is inherently team-specific (`TeamBarLink.verificationCount`), so merging would mean inventing a ranking concept the schema doesn't have.

**This means bar `id` is no longer a unique key** wherever a list of these entries is rendered — `BarList`/`MapView` key on `` `${teamId}-${barId}` `` (falling back to plain `barId` when `teamId` isn't present, e.g. on `/search`'s single-team `RankedBarDTO[]`). If you add another place that renders a list of `TeamBarEntryDTO`, key it the same composite way — plain `bar.id` will produce a duplicate-React-key console error that's easy to miss (it doesn't throw, just silently risks React reusing/dropping the wrong DOM node). This exact bug shipped once during development and was only caught by checking the browser console directly, not by type-checking or a visual screenshot.

`BarCard`'s `bar` prop type (`BarCardEntry`, exported from `BarCard.tsx`) is `RankedBarDTO & Partial<Pick<TeamBarEntryDTO, "teamId" | "teamName" | "sport">>` — one type that structurally accepts either a single-team `RankedBarDTO` (no team label rendered) or a multi-team `TeamBarEntryDTO` (team name + sport line rendered above the bar name). `BarCard`'s `onVerify` passes back the whole entry object, not just an id — necessary so the caller knows *which* team's row was clicked when a bar has more than one.

### Team logos

`Team.logoUrl` holds a self-contained `data:image/svg+xml,...` URI (colored circle + initials, generated per team in `prisma/seed.ts`'s `logoDataUri()`) — not a hosted image file. No network fetch, nothing in `/public`. Not official team artwork, deliberately just a placeholder. `TeamLogo.tsx` is the one place that renders it.
