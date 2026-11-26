# Structure and ownership

Stack (hackathon): Next.js App Router + TypeScript, Supabase Postgres + PostGIS + RLS, Vercel, Claude API (server only), LINE Messaging API + LINE Login/LIFF, Google Maps Platform. Tests: Vitest + fast-check (property tests), Playwright (e2e).

## Ownership rule
Every path has exactly one owning spec. A spec edits only paths it owns. Shared paths belong to `00-foundation` and change only through the lead (machine-a). If a slice needs a new column, dependency, env var, route, or cron, it asks the lead to add it to foundation; it never edits shared files itself.

## Shared (owned by 00-foundation)
```
package.json, lockfile, tsconfig.json, next.config.ts, eslint/prettier config
vercel.json                      # all crons pre-declared (reminders, retention)
.env.example                     # every env var for every slice
src/middleware.ts                # security headers, CSP (Maps, LIFF allowed), session cookie
src/app/layout.tsx               # app shell, nav, font scaling, "not a government site" banner
src/app/api/health/route.ts
src/components/ui/**             # buttons, cards, chips, badges (SourceBadge, StaleBadge)
src/components/shell/**          # header, nav, footer, emergency bar
src/lib/db/**                    # Supabase server/browser clients
src/lib/ai/**                    # Claude client, PII masking, guardrails, catalog-only tools
src/lib/catalog/**               # read-only catalog queries (services, requirements, offices, holidays)
src/lib/case/**                  # case create/read by token, 128-bit token, session binding
src/lib/maps/**                  # server Maps client (field masks, timeout), Maps URLs builder
src/lib/security/**              # zod schemas, link allowlist, rate limit, safe errors, PII-free logger
src/lib/auth/**                  # anonymous session + admin auth stub
src/lib/routes.ts                # route constants for every slice page
src/types/**                     # shared domain types (mirror the DB schema)
supabase/config.toml             # seed sql_paths = ['./seed/*.sql'] so demo seeds load without edits
supabase/migrations/**           # the complete schema; slices never add migrations
supabase/seed/00_fixtures.sql    # minimal fixtures so every slice can run
src/app/api/cron/retention/**    # case expiry and deletion
```

## Slice folders
| Spec | Owns |
| --- | --- |
| 11-chat-triage | `src/app/chat/**`, `src/app/api/chat/**`, `src/features/chat/**` |
| 12-office-finder | `src/app/plan/**`, `src/app/api/plan/**`, `src/features/office-finder/**` |
| 13-case-tracker | `src/app/c/**`, `src/app/api/case/**`, `src/features/case-tracker/**` |
| 20-journeys-e2e | `e2e/**`, `playwright.config.ts` |
| 21-line-oa | `src/app/line/**`, `src/app/api/line/**`, `src/features/line/**` |
| 22-route-timing | `src/app/trip/**`, `src/app/api/trip/**`, `src/features/route-timing/**` |
| 30-smart-pass | `src/app/pass/**`, `src/app/api/pass/**`, `src/features/smart-pass/**` |
| 31-phase2-extras | `src/app/wallet/**`, `src/app/api/wallet/**`, `src/features/phase2/**` |
| 90-landing-seo | `src/app/(marketing)/**`, `src/app/not-found.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `public/og/**` |
| 91-demo-catalog | `supabase/seed/10_demo_*.sql`, `data/catalog/**` |
| 92-admin-catalog | `src/app/admin/**`, `src/app/api/admin/**`, `src/app/report/**`, `src/features/admin/**` |
| 93-docs-pitch | `docs/**` except `docs/requirements.md` (lead-owned), `README.md` |

Tests live next to the code they test inside the owning folder (`*.test.ts`).

## Contracts between slices
Slices never import from each other's `src/features/**`. They meet only through:
- DB tables from foundation (e.g. chat writes `cases` + `case_checklist_items`; office-finder writes `cases.office_id`; route-timing reads it).
- URLs from `src/lib/routes.ts` (e.g. chat links to the plan page; case page links to the LINE link page).
- Shared libs and types above.
