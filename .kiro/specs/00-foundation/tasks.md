# Implementation Plan: 00-foundation

## Overview

Wave 0, executor machine-a (lead), Jira KAN-4. The tasks set up the shared codebase described in `design.md` so every slice can start without editing a shared file. Order: scaffold → folders → schema → seed → contracts → shared libs → shell → auth stub → proxy → slice placeholders → env and crons → README → checkpoint → production deploy. There are no test tasks and no slice features. Shared libs get working bodies only where a slice needs them to run; the rest are signatures with minimal bodies. Code has no explanatory comments (`// MARK:` is allowed).

## Tasks

- [x] 1. Scaffold
  - [x] 1.1 Create `package.json` with exact pins and scripts
    - Pin every package and version from design "Scaffold and Version Pins" (no `^`), including `@line/bot-sdk`, `qrcode`, `@vis.gl/react-google-maps` for later slices
    - Add scripts `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `e2e`, `db:start`, `db:reset`, `db:types`, `audit`; set `engines.node` to `>=24 <27`
    - Run `npm install` to produce the lockfile; write `.nvmrc` with `24`
    - Files: `package.json`, `package-lock.json`, `.nvmrc`
    - _Requirements: A03_

  - [x] 1.2 Add TypeScript and Next.js config
    - `tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `moduleResolution: "bundler"`, `paths: { "@/*": ["./src/*"] }`
    - `next.config.ts`: `poweredByHeader: false`, `reactStrictMode: true`
    - `.gitignore`: `node_modules`, `.next`, `.env*.local`, `supabase/.temp`, `playwright-report`, `test-results`
    - Files: `tsconfig.json`, `next.config.ts`, `next-env.d.ts`, `.gitignore`
    - _Requirements: A02, A03_

  - [x] 1.3 Add lint, format and CSS tooling
    - `eslint.config.mjs`: `eslint-config-next` core-web-vitals + typescript; `no-restricted-imports` blocking `@/features/*` across slices and `@/lib/db/server` in client files
    - `.prettierrc` (single quotes, no semicolons, width 110); `postcss.config.mjs` with `@tailwindcss/postcss`
    - Files: `eslint.config.mjs`, `.prettierrc`, `postcss.config.mjs`
    - _Requirements: A03, A05_

  - [x] 1.4 Configure Vitest and Playwright without writing tests
    - `vitest.config.ts`: node environment, `include: ['src/**/*.test.ts']`, alias `@` → `src`, alias `server-only` → an empty module
    - `playwright.config.ts`: `testDir: 'e2e'`, `baseURL` from `NEXT_PUBLIC_SITE_URL`, `webServer: { command: 'npm run dev' }` (stub handed to 20-journeys-e2e)
    - Files: `vitest.config.ts`, `src/test/empty.ts`, `playwright.config.ts`
    - _Requirements: N-02_

  - [x] 1.5 Initialise Supabase locally
    - Run `npx supabase init`; edit `supabase/config.toml` per design "Supabase Config": `[db.seed] enabled = true`, `sql_paths = ["./seed/*.sql"]`, `[auth] enabled = false`
    - Files: `supabase/config.toml`
    - _Requirements: D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08, D-09_

- [x] 2. Folders
  - [x] 2.1 Create the shared folder tree
    - Create every shared directory and file from design "Folder Tree" under `src/lib/**`, `src/components/ui/**`, `src/components/shell/**`, `src/app/dev/`, `src/app/api/health/`, `src/app/api/cron/retention/`, `supabase/migrations/`, `supabase/seed/`, `public/`
    - Server-only lib files start with `import 'server-only'` and `export {}` until filled; isomorphic files start with `export {}`
    - Files: `src/lib/{contracts.ts,routes.ts}`, `src/lib/db/{server.ts,browser.ts}`, `src/lib/catalog/{index.ts,pure.ts,queries.ts,staleness.ts,conditions.ts,hours.ts}`, `src/lib/case/{index.ts,token.ts,status.ts,queries.ts}`, `src/lib/ai/{index.ts,client.ts,guard.ts,pii.ts,tools.ts,prompt.ts,cache.ts,emergency.ts,disclaimers.ts}`, `src/lib/maps/{server.ts,urls.ts,fieldMasks.ts}`, `src/lib/security/{schemas.ts,links.ts,rateLimit.ts,hash.ts,errors.ts,log.ts,signature.ts,cron.ts,headers.ts}`, `src/lib/auth/{session.ts,admin.ts,line.ts}`, `public/favicon.ico`
    - _Requirements: D-01, A02_

  - [x] 2.2 Create the slice folder tree
    - Create empty directories for every slice in design "Slice Placeholders and /dev": `src/app/{chat,plan/[token],c/[token],line,trip/[token],pass,wallet,admin,report,(marketing)}`, `src/app/api/{chat,plan,case,line/webhook,line/cron/reminders,trip,pass/cron/reroute,wallet,admin}`, `src/features/{chat,office-finder,case-tracker,line,route-timing,smart-pass,phase2,admin}/server`, `e2e/`, `data/catalog/`, `docs/`, `public/og/`
    - Files: directories only (filled in task group 10)
    - _Requirements: M-05_

- [x] 3. Database schema
  - [x] 3.1 Write migration 1: extensions, domains, enums
    - `postgis` and `pgcrypto` in schema `extensions`; domains `slug`, `hotline`, `https_url`, `i18n_map`; all 21 enums exactly as in design Migration 1
    - Files: `supabase/migrations/20261126000100_extensions_types.sql`
    - _Requirements: D-01, D-04, D-10, M-01_

  - [x] 3.2 Write migration 2: catalog tables
    - `agencies`, `offices`, `jurisdictions`, `services`, `service_requirements`, `service_links`, `holidays` with all columns, checks, uniques and GiST/b-tree indexes from design Migration 2
    - Files: `supabase/migrations/20261126000200_catalog.sql`
    - _Requirements: D-01, D-02, D-03, D-04, D-05, D-06, D-09, N-01_

  - [x] 3.3 Write migration 3: identities
    - `sessions`, `line_users`, `consents`, `family_links` from design Migration 3
    - Files: `supabase/migrations/20261126000300_identities.sql`
    - _Requirements: D-07, N-03, A07_

  - [x] 3.4 Write migration 4: cases
    - `cases` (token hash, D-10 status, `online_only`, push counters, `expires_at`, all checks and indexes), `case_checklist_items`, `case_origins`
    - Files: `supabase/migrations/20261126000400_cases.sql`
    - _Requirements: D-07, D-10, N-03, T-C3, A01, A04_

  - [x] 3.5 Write migration 5: LINE tables
    - `document_expiries`, `reminders` (one target check, dedupe key, pending index), `line_push_usage`, `line_webhook_events`, `line_link_states`
    - Files: `supabase/migrations/20261126000500_line.sql`
    - _Requirements: D-08, N-03, N-09, A07, A08_

  - [x] 3.6 Write migration 6: route tables
    - `route_plans` and `route_legs` from design Migration 6; no origin columns
    - Files: `supabase/migrations/20261126000600_routes.sql`
    - _Requirements: T-C2, T-C3_

  - [x] 3.7 Write migration 7: admin, KPI and platform tables
    - `catalog_reports`, `catalog_review_log`, `events`, `survey_responses`, `rate_limits`, `cache_entries`
    - Files: `supabase/migrations/20261126000700_admin_kpi.sql`
    - _Requirements: N-09, A06, A09_

  - [x] 3.8 Write migration 8: Phase 2 tables
    - `pass_products`, `payments`, `payment_webhook_events`, `pass_wallets`, `sponsor_codes`, `pass_ledger`, `sponsor_redemptions`, `wait_reports`
    - Files: `supabase/migrations/20261126000800_phase2.sql`
    - _Requirements: M-05, A08_

  - [x] 3.9 Write migration 9, part 1: triggers and case functions
    - `set_updated_at` plus the trigger loop, `case_transition_allowed`, `cases_before_write`, `cases_after_status`, `touch_session`, `create_case_chain`; every function `set search_path = ''`
    - Files: `supabase/migrations/20261126000900_functions.sql`
    - _Requirements: D-07, D-10, N-03, A01_

  - [x] 3.10 Write migration 9, part 2: spatial, limits and retention functions
    - Append `find_jurisdictions`, `nearest_offices`, `rate_limit_hit`, `claim_push`, `delete_line_user_data`, `advance_due_cases`, `purge_expired`
    - Files: `supabase/migrations/20261126000900_functions.sql`
    - _Requirements: D-03, D-10, N-03, N-09, T-C2, T-C3, A06_

  - [x] 3.11 Write migration 10: RLS and grants
    - Enable RLS on every table; public select policies on published catalog rows, holidays and active pass products; restrictive deny policy and `revoke all` on every private table; revoke function execute from `public`, `anon`, `authenticated`; grant only `find_jurisdictions`, `nearest_offices`, `case_transition_allowed`
    - Files: `supabase/migrations/20261126001000_rls.sql`
    - _Requirements: A01, A02_

  - [x] 3.12 Apply the schema and generate DB types
    - Run `npm run db:start` and `npm run db:reset` until all 10 migrations apply cleanly; run `npm run db:types`
    - Files: `src/lib/db/database.types.ts` (generated)
    - _Requirements: A02, D-01_

- [x] 4. Seed fixtures
  - [x] 4.1 Seed catalog places
    - Placeholder banner; 5 agencies (one per MVP kind), 5 offices with opening hours, 2 tiny `police_area` polygons near Siam sharing the lng 100.5380 edge, 4 holidays plus 1 single-office closure, exactly as in design "Seed Fixtures"
    - Files: `supabase/seed/00_fixtures.sql`
    - _Requirements: D-01, D-02, D-03, D-09, M-01_

  - [x] 4.2 Seed the 5 MVP services
    - Services `police-report-property`, `online-fraud-report`, `driving-licence-renewal`, `id-card-new`, `change-of-address` with triage questions, 2–3 requirements each (one conditional, fixed UUIDs), the `police-report-property → id-card-new` link, and `change-of-address.last_verified = current_date - 120`
    - Files: `supabase/seed/00_fixtures.sql`
    - _Requirements: D-04, D-05, D-06, N-01_

  - [x] 4.3 Seed demo cases and LINE rows
    - Fixture session, LINE user and consent; 7 demo cases (one per status plus online-only done) using the `DEMO_TOKENS` hashes; checklist snapshots, one origin, booked-case reminders, one document expiry, one route plan, KPI events
    - Files: `supabase/seed/00_fixtures.sql`
    - _Requirements: D-07, D-08, D-10, T-C3_

  - [x] 4.4 Seed Phase 2 rows and reload
    - `pass-1` and `pass-3` products, wallet with one `free_first` ledger entry; run `npm run db:reset` and confirm every insert succeeds
    - Files: `supabase/seed/00_fixtures.sql`
    - _Requirements: M-05_

- [x] 5. Shared types
  - [x] 5.1 Write primitives and enums in `contracts.ts`
    - Brands, IDs, `LatLng`, `Locale`, `I18nMap`, and every `*_KINDS` / `*_STATUSES` const array with its union type, matching migration 1
    - Files: `src/lib/contracts.ts`
    - _Requirements: D-01, D-04, D-10_

  - [x] 5.2 Write row types in `contracts.ts`
    - `Condition`, `TriageQuestion`, `OpeningHours`; catalog rows; `Case`, `ChecklistItem`, `CaseOrigin`; LINE, route, admin, KPI and Phase 2 rows from design "Shared Types"
    - Files: `src/lib/contracts.ts`
    - _Requirements: D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08, D-09_

  - [x] 5.3 Write DTOs, status machine and manifest types in `contracts.ts`
    - `CASE_TRANSITIONS`, `ONLINE_ONLY_EDGE`, `OPEN_CASE_STATUSES`, `CASE_STATUS_LABEL_TH`; `CaseDraft`, `CreatedCase`, `CasePatch`, `CaseView`, `CaseSummary`, `TransitionResult`, `Staleness`, `EmergencyResult`, `MapsResult`; `SAFE_ERROR_CODES`, `EVENT_NAMES`, `HealthResponse`, `SpecId`, `SpecInfo`
    - Files: `src/lib/contracts.ts`
    - _Requirements: D-10, A10_

- [x] 6. Shared libraries
  - [x] 6.1 Implement Supabase clients
    - Working `createServiceClient` (secret key, no session persistence, singleton, `server-only`), `createCatalogClient` (publishable key on the server), `createBrowserClient`; throw `not_configured` when env is missing
    - Files: `src/lib/db/server.ts`, `src/lib/db/browser.ts`
    - _Requirements: A01, A02_

  - [x] 6.2 Implement zod schemas
    - All schemas listed in design `lib/security`, with `.strict()` objects, Bangkok bounds on `LatLngSchema`, depth 4 on `ConditionSchema`
    - Files: `src/lib/security/schemas.ts`
    - _Requirements: A05, M-01, LLM01_

  - [x] 6.3 Implement the link allowlist
    - Working `checkLink`, `safeHref`, `OFFICIAL_HOSTS`, `UTILITY_HOSTS` per Algorithm 3
    - Files: `src/lib/security/links.ts`
    - _Requirements: N-05, LLM05_

  - [x] 6.4 Implement PII masking, disclaimers and the emergency detector
    - Working `maskPii` (Algorithm 2), the 5 disclaimer constants and `OFFICIAL_POLICE_CHANNEL`, `detectEmergency` with `EMERGENCY_TERMS` and `NEGATION_WINDOW` (Algorithm 4); all isomorphic
    - Files: `src/lib/ai/pii.ts`, `src/lib/ai/disclaimers.ts`, `src/lib/ai/emergency.ts`
    - _Requirements: N-04, N-05, LLM02, RK-04_

  - [x] 6.5 Implement safe errors, the logger and event tracking
    - Working `AppError`, `SAFE_MESSAGES_TH`, `toSafeResponse`; `log.info/warn/error` with key deny-list, masking and truncation; `trackEvent` that never throws
    - Files: `src/lib/security/errors.ts`, `src/lib/security/log.ts`
    - _Requirements: A09, A10, N-04_

  - [x] 6.6 Implement rate limiting, IP hashing, cron auth and signatures
    - Working `hashIp`, `clientIp`, `RATE_LIMITS`, `rateLimit` (fail closed), `requireCronAuth`, `verifyLineSignature`, `verifyHmacSignature` (all constant-time)
    - Files: `src/lib/security/hash.ts`, `src/lib/security/rateLimit.ts`, `src/lib/security/cron.ts`, `src/lib/security/signature.ts`
    - _Requirements: A06, A08, LLM10, N-09_

  - [x] 6.7 Implement pure catalog helpers
    - Working `staleness` (`STALE_AFTER_DAYS = 90`, Bangkok days), `evaluateCondition`, `evaluateCondition3`, `isOpenAt`, `openSlots`; `pure.ts` re-exports them
    - Files: `src/lib/catalog/staleness.ts`, `src/lib/catalog/conditions.ts`, `src/lib/catalog/hours.ts`, `src/lib/catalog/pure.ts`
    - _Requirements: N-01, D-02, D-09_

  - [x] 6.8 Implement catalog queries
    - Working `listAgencies`, `getAgency`, `listServices`, `getService`, `getServicesByIds`, `getRequirements`, `getServiceLinks`, `listOffices`, `getOffice`, `findJurisdictions`, `nearestOffices`, `listHolidays` through `createCatalogClient`, mapping rows to `contracts.ts` types
    - Files: `src/lib/catalog/queries.ts`, `src/lib/catalog/index.ts`
    - _Requirements: D-01, D-02, D-03, D-04, D-05, D-06, D-09, N-02_

  - [x] 6.9 Implement case tokens and the status rule
    - Working `newCaseToken`, `hashToken`, `isCaseToken`, `canTransition` (mirrors `case_transition_allowed`)
    - Files: `src/lib/case/token.ts`, `src/lib/case/status.ts`
    - _Requirements: A01, A04, D-10_

  - [x] 6.10 Implement case create and read
    - Working `createCases` (Algorithm 5, one `create_case_chain` call), `getCaseByToken` (no DB call for malformed tokens, hides origin and hash), `getCaseById`, `listChecklist`, `listCasesForSession`, `listCasesForLineUser`
    - Files: `src/lib/case/queries.ts`, `src/lib/case/index.ts`
    - _Requirements: D-07, A01, N-03_

  - [x] 6.11 Implement case updates
    - Working `updateCase`, `transitionCase`, `setChecklistItem`, `setOrigin`, `getOrigin`, `clearOrigin`, `bindLineUser`, `claimPush`, `deleteLineUserData`; every update filters by the token's case ID
    - Files: `src/lib/case/queries.ts`
    - _Requirements: D-07, D-10, T-C3, N-03, N-09_

  - [x] 6.12 Implement LLM guardrails, prompt and catalog tools
    - Working `MAX_USER_CHARS`, `guardInput`, `wrapUserText`, `sanitizeLlmText`; `SYSTEM_PROMPT_BASE` text; `catalogTools` (read-only `select_services`, `get_service_details`) and `parseSelectServices`
    - Files: `src/lib/ai/guard.ts`, `src/lib/ai/prompt.ts`, `src/lib/ai/tools.ts`
    - _Requirements: N-02, LLM01, LLM05, LLM06, LLM07, LLM09_

  - [x] 6.13 Implement the Claude client and answer cache
    - `streamClaude` and `callClaude` with model from env, `max_tokens` cap, timeout, `llm_daily` limit, coordinate guard and `llm_call` event; `cachedAnswer` over `cache_entries`; `index.ts` re-exports server modules
    - Files: `src/lib/ai/client.ts`, `src/lib/ai/cache.ts`, `src/lib/ai/index.ts`
    - _Requirements: LLM02, LLM10, N-06, N-09, T-C3_

  - [x] 6.14 Implement the Maps client and URL builders
    - `FIELD_MASKS`, `BANGKOK_BOUNDS`; working `mapsFetch` (required field mask, timeout, never throws), `directionsUrl` and `searchUrl` (no origin); signature-level `computeRoutes`, `computeRouteMatrix`, `autocomplete`, `placeDetails`, `geocode`, `staticMapUrl` built on `mapsFetch`
    - Files: `src/lib/maps/fieldMasks.ts`, `src/lib/maps/urls.ts`, `src/lib/maps/server.ts`
    - _Requirements: T-C2, T-C3, M-01, A01, A10_

  - [x] 6.15 Implement route constants and the spec manifest
    - Working `routes`, `reportUrl`, `api`, `hotlines`, `tel`, `DEMO_TOKENS`, `SPECS` (13 rows from `spec-map.md` with Jira keys), `NAV_ITEMS`
    - Files: `src/lib/routes.ts`
    - _Requirements: M-01, N-07_

- [x] 7. App shell
  - [x] 7.1 Build the basic UI kit
    - `Button`, `LinkButton`, `Card`, `Chip`, `Alert`, `Spinner`, `Checkbox`, `ChoiceButtons` with the prop types from design "App Shell"; 48 px targets, visible focus, radio-group keyboard support
    - Files: `src/components/ui/{Button,LinkButton,Card,Chip,Alert,Spinner,Checkbox,ChoiceButtons}.tsx`, `src/components/ui/index.ts`
    - _Requirements: N-07_

  - [x] 7.2 Build the trust components
    - `SourceBadge`, `StaleBadge` ("ควรโทรยืนยัน" when stale), `ExternalLink` (renders only `safeHref` output, `rel="noopener noreferrer"`), `HotlineLink`
    - Files: `src/components/ui/{SourceBadge,StaleBadge,ExternalLink,HotlineLink}.tsx`, `src/components/ui/index.ts`
    - _Requirements: N-01, N-05, LLM05, LLM09_

  - [x] 7.3 Build the banner, emergency bar and footer
    - `TrustBanner` with `NOT_GOV_SITE_TH`, `NOT_POLICE_CHANNEL_TH`, `NO_MONEY_NO_PASSWORD_TH`; `EmergencyBar` (`bar` and `inline` variants, `tel:191`, `tel:1669`); `Footer` with about/privacy/terms, report link, hotlines
    - Files: `src/components/shell/{TrustBanner,EmergencyBar,Footer}.tsx`
    - _Requirements: N-05, N-07, RK-04_

  - [x] 7.4 Build the header, nav and font-size control
    - `Header`; `Nav` as a `<details>` menu over `NAV_ITEMS` grouped by wave plus `/dev`; client `FontSizeControl` switching `data-font-scale` 100/125/150 and writing the `bf_fs` cookie
    - Files: `src/components/shell/{Header,Nav,FontSizeControl}.tsx`
    - _Requirements: N-07_

  - [x] 7.5 Build the root layout and global styles
    - `layout.tsx`: `lang="th"`, `Noto_Sans_Thai` via `next/font`, `data-font-scale` from cookie, skip link, banner, header, main, emergency bar, footer, default metadata; `globals.css`: Tailwind import, 18 px base, rem scale per `data-font-scale`, AA colours
    - Files: `src/app/layout.tsx`, `src/app/globals.css`
    - _Requirements: N-05, N-07, M-01_

  - [x] 7.6 Build the slice placeholder component and the `/dev` page
    - `SlicePlaceholder` showing spec name, Jira key, wave, executor, owned folders and optional probe; `/dev` listing all 13 `SPECS` rows with links and `/api/health`, `robots: { index: false }`
    - Files: `src/components/shell/SlicePlaceholder.tsx`, `src/app/dev/page.tsx`
    - _Requirements: M-05_

  - [x] 7.7 Add the health route
    - `GET /api/health` returns `HealthResponse` (`db` from a head count on `agencies`, short commit SHA), 200 or 503, no secrets
    - Files: `src/app/api/health/route.ts`
    - _Requirements: A09, A10_

- [x] 8. Auth stub
  - [x] 8.1 Implement the anonymous session
    - `SESSION_COOKIE`, `SESSION_COOKIE_OPTIONS` (HttpOnly, Secure, SameSite=Lax, Path=/, 30 days), `mintSessionToken`, `isSessionToken`, `getSessionId` (hash + `touch_session`, wrapped in `cache()`), `getSessionIdOrNull`
    - Files: `src/lib/auth/session.ts`
    - _Requirements: A07, A04, N-03_

  - [x] 8.2 Implement the demo admin check
    - `ADMIN_REALM`, `checkBasicAuth` (`not_configured` when password missing or < 24 chars, constant-time compare), `requireAdmin`
    - Files: `src/lib/auth/admin.ts`
    - _Requirements: A01, A07, A10_

  - [x] 8.3 Implement LINE ID-token verification
    - `verifyLineIdToken(idToken, { nonce })` posting to the fixed LINE verify endpoint with `LINE_LOGIN_CHANNEL_ID`; throws `unauthorized` on failure
    - Files: `src/lib/auth/line.ts`
    - _Requirements: A07_

- [x] 9. Proxy and security headers
  - [x] 9.1 Implement CSP and header builders
    - `buildCsp(nonce, env)` with the exact directives in design "Proxy" (Maps and LIFF hosts, dev-only `'unsafe-eval'`), `securityHeaders(env)` (HSTS only in production), `getNonce()`
    - Files: `src/lib/security/headers.ts`
    - _Requirements: A02, N-05_

  - [x] 9.2 Implement `src/proxy.ts`
    - `proxy()` per Algorithm 1: nonce per request, CSP in request and response headers, Basic Auth gate on `/admin` and `/api/admin`, `bf_sid` minting when `needsSession`, matcher excluding static assets; export function named `proxy` (Next.js 16)
    - Files: `src/proxy.ts`
    - _Requirements: A01, A02, A07, N-05_

- [x] 10. Slice placeholders (each set of files is handed to its slice after this task)
  - [x] 10.1 Placeholder for 11-chat-triage (KAN-6)
    - `/chat` page with `SlicePlaceholder` and probe `listServices().length`; `POST /api/chat` returning 501 via `toSafeResponse`; empty server module
    - Files: `src/app/chat/page.tsx`, `src/app/api/chat/route.ts`, `src/features/chat/server/index.ts`
    - _Requirements: M-05_

  - [x] 10.2 Placeholder for 12-office-finder (KAN-7)
    - `/plan/[token]` page probing `getCaseByToken` (status + office name, `notFound()` when null); `POST /api/plan` 501; empty server module
    - Files: `src/app/plan/[token]/page.tsx`, `src/app/api/plan/route.ts`, `src/features/office-finder/server/index.ts`
    - _Requirements: M-05_

  - [x] 10.3 Placeholder for 13-case-tracker (KAN-5)
    - `/c/[token]` page probing status label and checklist count; `POST /api/case` 501; empty server module
    - Files: `src/app/c/[token]/page.tsx`, `src/app/api/case/route.ts`, `src/features/case-tracker/server/index.ts`
    - _Requirements: M-05_

  - [x] 10.4 Placeholder for 20-journeys-e2e (KAN-11)
    - `e2e/journeys.spec.ts` with `test.fixme` titles only for J1, J1b, J2, J3 (no assertions); `playwright.config.ts` from task 1.4 is handed over
    - Files: `e2e/journeys.spec.ts`
    - _Requirements: M-05_

  - [x] 10.5 Placeholder for 21-line-oa (KAN-12)
    - `/line` page showing whether LINE env is configured; `POST /api/line/webhook` verifying `X-Line-Signature` then returning 200 `{}`; `GET /api/line/cron/reminders` with `requireCronAuth` returning `{ skipped: true }`; empty server module
    - Files: `src/app/line/page.tsx`, `src/app/api/line/webhook/route.ts`, `src/app/api/line/cron/reminders/route.ts`, `src/features/line/server/index.ts`
    - _Requirements: A08, M-05_

  - [x] 10.6 Placeholder for 22-route-timing (KAN-13)
    - `/trip/[token]` page probing `departAt`; `POST /api/trip` 501; empty server module
    - Files: `src/app/trip/[token]/page.tsx`, `src/app/api/trip/route.ts`, `src/features/route-timing/server/index.ts`
    - _Requirements: M-05_

  - [x] 10.7 Placeholder for 30-smart-pass (KAN-15)
    - `/pass` page; `GET /api/pass/cron/reroute` with `requireCronAuth` returning `{ skipped: true }`; empty server module
    - Files: `src/app/pass/page.tsx`, `src/app/api/pass/cron/reroute/route.ts`, `src/features/smart-pass/server/index.ts`
    - _Requirements: M-05_

  - [x] 10.8 Placeholder for 31-phase2-extras (KAN-16)
    - `/wallet` page; `POST /api/wallet` 501; empty server module
    - Files: `src/app/wallet/page.tsx`, `src/app/api/wallet/route.ts`, `src/features/phase2/server/index.ts`
    - _Requirements: M-05_

  - [x] 10.9 Placeholder for 90-landing-seo (KAN-8)
    - `/` page in `(marketing)` with `SlicePlaceholder` and a link to `/chat`; `not-found.tsx`; `robots.ts` disallowing `/admin`, `/dev`, `/c/`, `/plan/`, `/trip/`; `sitemap.ts` with `/` and `/chat`; `public/og/.gitkeep`
    - Files: `src/app/(marketing)/page.tsx`, `src/app/not-found.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `public/og/.gitkeep`
    - _Requirements: N-05, M-05_

  - [x] 10.10 Placeholder for 91-demo-catalog (KAN-9)
    - Comment-only seed file naming the upsert contract (same canonical IDs, `on conflict` by `id` or `(date, name_th)`); `data/catalog/README.md` naming the spec, Jira key and owned paths
    - Files: `supabase/seed/10_demo_00_placeholder.sql`, `data/catalog/README.md`
    - _Requirements: M-05_

  - [x] 10.11 Placeholder for 92-admin-catalog (KAN-10)
    - `/admin` page calling `requireAdmin` and probing services with `staleness`; `/report` page reading `serviceId`, `requirementId`, `officeId` query params; `GET /api/admin` calling `requireAdmin` then 501; empty server module
    - Files: `src/app/admin/page.tsx`, `src/app/report/page.tsx`, `src/app/api/admin/route.ts`, `src/features/admin/server/index.ts`
    - _Requirements: A01, M-05_

  - [x] 10.12 Placeholder for 93-docs-pitch (KAN-14)
    - `docs/README.md` naming the spec, Jira key and owned paths (all of `docs/**` except `docs/requirements.md`)
    - Files: `docs/README.md`
    - _Requirements: M-05_

- [x] 11. Environment and crons
  - [x] 11.1 Write `.env.example`
    - Every variable from design "Environment" with its one-line comment and `[server]` / `[public]` marker; copy to `.env.local` and fill local Supabase keys from `supabase status`
    - Files: `.env.example`
    - _Requirements: A02, T-C2, N-09_

  - [x] 11.2 Write `vercel.json`
    - Region `sin1`; crons `/api/line/cron/reminders` `*/5 * * * *`, `/api/cron/retention` `5 17 * * *`, `/api/pass/cron/reroute` `*/10 22,23,0,1,2 * * *`
    - Files: `vercel.json`
    - _Requirements: N-03, N-06_

  - [x] 11.3 Implement the retention cron route
    - `GET /api/cron/retention` per Algorithm 6: `requireCronAuth`, `advance_due_cases(today in Bangkok)`, `purge_expired(now)`, `cron_run` log, safe errors
    - Files: `src/app/api/cron/retention/route.ts`
    - _Requirements: N-03, T-C3, D-10, A10_

- [x] 12. README "Start here"
  - [x] 12.1 Write the "Start here" section
    - The exact section from design "README.md Start here Section" (clone, env, `db:start`, `db:reset`, `dev`, `/dev`, finding your spec/folder/Jira key, ownership rule, `KAN-4 request:` sub-task process, PR title contains the Jira key), followed by an empty `## Project docs` heading for 93
    - Files: `README.md`
    - _Requirements: M-05_

- [x] 13. Checkpoint: build and seed
  - Run `npm run lint`, `npm run typecheck` and `npm run build`; all must pass with no errors
  - Run `npm run db:reset`; all migrations apply and `00_fixtures.sql` plus `10_demo_00_placeholder.sql` load
  - Run `npm run dev` manually and open `/dev`, every placeholder from task group 10, `/admin` (Basic Auth prompt) and `/api/health`; check `curl -I http://localhost:3000/` shows the CSP and `Set-Cookie: bf_sid`
  - Ask the user if any check fails before continuing

- [ ] 14. Production deploy
  - Create the Supabase project in `ap-southeast-1`, `npx supabase link`, `npx supabase db push --include-seed`; confirm the advisor shows RLS on every table
  - Create the Vercel project (Node 24, `sin1`, Pro plan for the 5-minute cron or switch to the Hobby schedules in design "Crons"); add all env vars to Production and Preview with `APP_ENV=production` and generated `CRON_SECRET`, `IP_HASH_SALT`, `ADMIN_DEMO_PASSWORD`
  - Restrict the browser Maps key by referrer and API, the server key by API; set quotas and a budget alert
  - Deploy `main`; verify `https://<prod-domain>/api/health` returns 200 `{ ok: true, db: "ok" }`, security headers and `bf_sid` flags on `/`, Basic Auth on `/admin`, and the three crons listed in Vercel
  - Files: none (cloud configuration)
  - _Requirements: A02, T-C2, N-06, M-01_

- [x] 15. Slice gap fixes (parallel-build audit, item 3)
  - [x] 15.1 Add the shared LINE push sender
    - `pushToLineUser(lineUserId, messages, { caseId, retryKey })`: friend and block check, `claimPush`, `pushMessage` with retry key, 409 counts as sent, `push_sent` event; so 30 (T-08, L-08) and 31 (K-05) do not depend on 21
    - Add `src/lib/line/**` to the shared list in `structure.md`; add the `lib/line` section to design
    - Files: `src/lib/line/push.ts`, `src/lib/line/index.ts`, `.kiro/steering/structure.md`, `.kiro/specs/00-foundation/design.md`
    - _Requirements: N-09_

  - [x] 15.2 Add the public report API stub for 92
    - `api.report = '/api/report'`; `POST /api/report` returning 501 (handed to 92); outside the `/api/admin` Basic Auth gate so N-08 "ข้อมูลนี้ไม่ตรง" works for citizens
    - Add `src/app/api/report/**` to 92 in `structure.md` and in `SPECS`
    - Files: `src/lib/routes.ts`, `src/app/api/report/route.ts`, `.kiro/steering/structure.md`, `.kiro/specs/00-foundation/design.md`
    - _Requirements: M-05_

  - [x] 15.3 Widen slice contract rows
    - 12: `computeRoutes` (traffic-unaware, selected office) for the T-05 polyline, so 12 does not wait for 22
    - 21: `lib/ai` intake parts, catalog reads, `createCases`, `pushToLineUser`, so L-07 and L-06 do not need `src/features/chat`
    - 30, 31: `pushToLineUser`; 92: `api.report`
    - Files: `.kiro/specs/00-foundation/design.md`
    - _Requirements: M-05_

  - [x] 15.4 Run 20-journeys-e2e after 21 and 22
    - 20 moves to wave 3; 30 and 31 move to wave 4 (Phase 2); `SpecInfo.wave` gains `4`; nav label for wave 4
    - Files: `.kiro/steering/spec-map.md`, `src/lib/contracts.ts`, `src/lib/routes.ts`, `src/components/shell/Nav.tsx`, `.kiro/specs/00-foundation/design.md`, `.kiro/specs/{20-journeys-e2e,30-smart-pass,31-phase2-extras}/requirements.md`
    - _Requirements: M-05_

  - [x] 15.5 Add a catalog source store for D-11
    - Migration 12 `catalog_sources` (excerpts, source URL, retrieved date; no embeddings), service-role only; `CatalogSource` type; contract rows for 91 and 92
    - Pushed to production by the lead; types generated with `supabase gen types typescript --linked`
    - Files: `supabase/migrations/20261126001200_catalog_sources_queue_slots.sql`, `src/lib/contracts.ts`, `src/lib/db/database.types.ts`, `.kiro/specs/00-foundation/design.md`
    - _Requirements: M-05_

  - [x] 15.6 Reserve live queue slots for P2-04
    - Migration 12 `office_queue_slots` (office, service, slot range, availability, source, fetch time), service-role only; `OfficeQueueSlot` type; contract row for 31
    - Pushed and typed with 15.5
    - Files: `supabase/migrations/20261126001200_catalog_sources_queue_slots.sql`, `src/lib/contracts.ts`, `src/lib/db/database.types.ts`, `.kiro/specs/00-foundation/design.md`
    - _Requirements: M-05_

  - [x] 15.7 Checkpoint
    - `npm run lint`, `npm run typecheck`, `npm run build` pass

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5"] },
    { "id": 2, "tasks": ["2.1", "2.2", "3.1"] },
    { "id": 3, "tasks": ["3.2", "5.1"] },
    { "id": 4, "tasks": ["3.3", "5.2"] },
    { "id": 5, "tasks": ["3.4", "5.3"] },
    { "id": 6, "tasks": ["3.5", "3.6", "3.7", "3.8"] },
    { "id": 7, "tasks": ["3.9"] },
    { "id": 8, "tasks": ["3.10"] },
    { "id": 9, "tasks": ["3.11"] },
    { "id": 10, "tasks": ["3.12"] },
    { "id": 11, "tasks": ["4.1", "6.1", "6.2", "6.3", "6.4", "6.9", "6.14", "6.15"] },
    { "id": 12, "tasks": ["4.2", "6.5", "6.7", "8.1", "8.3"] },
    { "id": 13, "tasks": ["4.3", "6.6", "6.8", "8.2"] },
    { "id": 14, "tasks": ["4.4", "6.10", "6.12", "9.1"] },
    { "id": 15, "tasks": ["6.11", "6.13", "7.1", "9.2"] },
    { "id": 16, "tasks": ["7.2", "7.3", "7.4", "7.7"] },
    { "id": 17, "tasks": ["7.5", "7.6"] },
    { "id": 18, "tasks": ["10.1", "10.2", "10.3", "10.4", "10.5", "10.6", "10.7", "10.8", "10.9", "10.10", "10.11", "10.12", "11.1", "11.2", "11.3"] },
    { "id": 19, "tasks": ["12.1"] },
    { "id": 20, "tasks": ["13"] },
    { "id": 21, "tasks": ["14"] },
    { "id": 22, "tasks": ["15.1", "15.2", "15.3", "15.4", "15.5", "15.6"] },
    { "id": 23, "tasks": ["15.7"] }
  ]
}
```

## Notes

- Task 13 is the checkpoint before deploy; task 14 is last.
- After task group 10, every placeholder file belongs to its slice and the foundation does not edit it again.
- Shared changes requested by slices later go through `KAN-4 request:` sub-tasks to the lead.
