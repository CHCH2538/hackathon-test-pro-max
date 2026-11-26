# Design Document: 00-foundation

## Overview

00-foundation is wave 0 of the Bangkok Flow build. It is executed by machine-a (lead) and depends on nothing. It delivers every shared path listed in `.kiro/steering/structure.md`: the Next.js scaffold, the complete Supabase schema with RLS on every table, shared TypeScript types, minimal seed fixtures, the app shell, the anonymous session and admin auth stub, the shared libraries (`lib/ai`, `lib/security`, `lib/catalog`, `lib/case`, `lib/maps`, `lib/routes`), middleware with security headers and CSP, `vercel.json` with every cron, `.env.example` with every env var, and a working production deploy on Vercel.

The goal is that the 12 other specs can be built in parallel without editing a shared file. Every table, column, enum value, RPC, route constant, env var, cron and dependency that a slice needs is declared here. The "Contracts for slices" section lists them per spec. If a slice finds a gap, it asks the lead. It never edits a shared path.

Design principles, mapped to requirement IDs:
- The catalog is the only source of government facts. The LLM gets read-only catalog tools and can only return `serviceId`s that exist (N-02, LLM06, LLM09).
- Private data never reaches the browser's Supabase client. Private tables have RLS enabled with no policies, so `anon` and `authenticated` see nothing. Server code reaches them with the service role, always scoped by a case token hash or a verified LINE user (A01, N-03).
- Text is masked before it reaches the LLM or a log. Coordinates never reach the LLM (N-04, LLM02, T-C3).
- Every outbound link passes one allowlist check (N-05, LLM05).
- Failures return generic messages and fall back. Nothing exposes a stack trace (A10).

Stack: Next.js App Router + TypeScript (strict), Tailwind CSS, Supabase Postgres + PostGIS + RLS, Vercel, Claude API (server only), LINE Messaging API + LINE Login/LIFF, Google Maps Platform. Tests: Vitest + fast-check, Playwright.

---

# Part 1: High-Level Design

## Architecture

```mermaid
graph TD
    subgraph Client
        WEB[Web chat in mobile browser]
        LIFF[LINE app with LIFF]
    end

    subgraph Vercel["Vercel (Next.js App Router)"]
        MW[src/middleware.ts<br/>CSP nonce, security headers,<br/>bf_sid session cookie]
        SHELL[layout.tsx + shell<br/>NotGovBanner, EmergencyBar]
        SLICES[Slice pages and API routes<br/>chat, plan, c, trip, line, admin, report, pass, wallet]
        CRON[Cron routes<br/>/api/cron/retention<br/>/api/line/cron/reminders<br/>/api/pass/cron/traffic-recheck]
        subgraph Shared["Shared libs (00-foundation)"]
            SEC[lib/security<br/>zod, allowlist, rateLimit,<br/>safe errors, PII-free log, LINE signature]
            AI[lib/ai<br/>Claude client, maskPii,<br/>catalog-only tools, output guard]
            CAT[lib/catalog<br/>read-only queries, staleness,<br/>opening hours, conditions]
            CASE[lib/case<br/>128-bit token, case CRUD,<br/>status machine]
            MAPS[lib/maps<br/>Routes/Places/Geocoding client,<br/>Maps URLs builder]
            AUTH[lib/auth<br/>session, requireAdmin,<br/>LINE ID token verify]
            DB[lib/db<br/>anon + service clients]
            RT[lib/routes.ts]
        end
    end

    subgraph Supabase
        PG[(Postgres + PostGIS<br/>RLS on every table)]
        SAUTH[Supabase Auth<br/>admin magic link]
    end

    CLAUDE[Claude API]
    GMP[Google Maps Platform]
    LINEAPI[LINE Messaging API / LINE Login]
    GOV[Official channels .go.th<br/>linked only]

    WEB --> MW --> SLICES
    LIFF --> MW
    SLICES --> SHELL
    SLICES --> Shared
    CRON --> Shared
    AI --> CLAUDE
    MAPS --> GMP
    AUTH --> LINEAPI
    AUTH --> SAUTH
    DB --> PG
    SLICES -. safeHref links .-> GOV
```

The web and LINE OA share one backend. A Case created on the web continues in LINE through its token. Official channels are only link targets.

## Folder tree

Paths marked `(foundation)` are created and owned by this spec. Slice folders are listed for orientation. Foundation does not create files in them, with one exception: a placeholder `src/app/(marketing)/page.tsx` so the first deploy has a home page. Ownership of that file passes to 90-landing-seo after wave 0.

```
.
├── package.json, pnpm-lock.yaml, tsconfig.json          (foundation)
├── next.config.ts, eslint.config.mjs, .prettierrc        (foundation)
├── postcss.config.mjs, vitest.config.ts                  (foundation)
├── vercel.json                                           (foundation) all crons
├── .env.example                                          (foundation) every env var
├── supabase/
│   ├── config.toml                                       (foundation) seed sql_paths = ['./seed/*.sql']
│   ├── migrations/
│   │   ├── 0001_extensions_enums.sql                     (foundation)
│   │   ├── 0002_catalog.sql                              (foundation)
│   │   ├── 0003_cases_sessions.sql                       (foundation)
│   │   ├── 0004_line_reminders.sql                       (foundation)
│   │   ├── 0005_ops_kpi.sql                              (foundation)
│   │   ├── 0006_phase2.sql                               (foundation)
│   │   ├── 0007_functions.sql                            (foundation)
│   │   └── 0008_rls_grants.sql                           (foundation)
│   └── seed/
│       ├── 00_fixtures.sql                               (foundation)
│       └── 10_demo_*.sql                                 (91-demo-catalog)
├── data/catalog/**                                       (91-demo-catalog)
├── e2e/**, playwright.config.ts                          (20-journeys-e2e)
├── docs/requirements.md                                  (lead)
├── docs/** (other), README.md                            (93-docs-pitch)
└── src/
    ├── middleware.ts                                     (foundation)
    ├── app/
    │   ├── layout.tsx, globals.css                       (foundation)
    │   ├── api/health/route.ts                           (foundation)
    │   ├── api/cron/retention/route.ts                   (foundation)
    │   ├── (marketing)/**, not-found.tsx, robots.ts, sitemap.ts   (90-landing-seo)
    │   ├── chat/**, api/chat/**                          (11-chat-triage)
    │   ├── plan/**, api/plan/**                          (12-office-finder)
    │   ├── c/**, api/case/**                             (13-case-tracker)
    │   ├── line/**, api/line/**                          (21-line-oa)
    │   ├── trip/**, api/trip/**                          (22-route-timing)
    │   ├── pass/**, api/pass/**                          (30-smart-pass)
    │   ├── wallet/**, api/wallet/**                      (31-phase2-extras)
    │   └── admin/**, api/admin/**, report/**             (92-admin-catalog)
    ├── components/
    │   ├── ui/**                                         (foundation)
    │   └── shell/**                                      (foundation)
    ├── features/<slice>/**                               (each slice)
    ├── lib/
    │   ├── db/{server.ts,service.ts,browser.ts}          (foundation)
    │   ├── ai/{client.ts,pii.ts,guard.ts,tools.ts,prompt.ts}      (foundation)
    │   ├── catalog/{queries.ts,staleness.ts,hours.ts,conditions.ts} (foundation)
    │   ├── case/{token.ts,repo.ts,status.ts}             (foundation)
    │   ├── maps/{client.ts,urls.ts}                      (foundation)
    │   ├── security/{schemas.ts,allowlist.ts,rateLimit.ts,errors.ts,log.ts,hash.ts,lineSignature.ts,cron.ts} (foundation)
    │   ├── auth/{session.ts,admin.ts,line.ts}            (foundation)
    │   └── routes.ts                                     (foundation)
    └── types/{database.ts,domain.ts}                     (foundation)
```

`src/types/database.ts` is generated by `supabase gen types typescript --local`. `src/types/domain.ts` holds the hand-written domain types in this document.

## Components and Interfaces

| Component | Path | Responsibility | Requirement IDs |
| --- | --- | --- | --- |
| Middleware | `src/middleware.ts` | Per-request CSP nonce, security headers, `bf_sid` cookie, Supabase auth refresh on `/admin` | A02, A07 |
| App shell | `src/app/layout.tsx`, `src/components/shell/**` | `lang="th"`, Thai font, font-scale toggle, header/nav/footer, NotGovBanner, EmergencyBar | N-05, N-07, RK-04 |
| UI kit | `src/components/ui/**` | Button, Card, Chip, ChoiceButtons, Checkbox, Alert, Spinner, SourceBadge, StaleBadge, ExternalLink | N-01, N-05, N-07 |
| DB clients | `src/lib/db/**` | Anon server client, service-role client (`server-only`), browser client | A01, A02 |
| Catalog | `src/lib/catalog/**` | Read-only queries for published catalog rows, jurisdiction RPC, staleness, opening hours, condition evaluation | D-01–D-06, D-09, N-01, N-02 |
| Case | `src/lib/case/**` | Token generation and hashing, create/read/update by token, D-10 state machine | D-07, D-10, A01, A04 |
| AI | `src/lib/ai/**` | Claude client with limits, PII masking, input/output guards, catalog-only tool definitions and validation | N-02, N-04, LLM01, LLM02, LLM05, LLM06, LLM07, LLM09, LLM10 |
| Maps | `src/lib/maps/**` | Server client for Routes, Route Matrix, Geocoding, Place Details with field masks and timeouts; Maps URLs builder | T-C2, T-C3 |
| Security | `src/lib/security/**` | zod schemas, link allowlist, DB-backed rate limit, safe errors, PII-free logger, IP hashing, LINE signature check, cron auth | A01–A10, N-05, N-09 |
| Auth | `src/lib/auth/**` | Anonymous session, `requireAdmin`, LINE ID token verification | A07 |
| Routes | `src/lib/routes.ts` | Route constants for every slice | — |
| Schema | `supabase/migrations/**` | Complete schema, enums, functions, triggers, RLS, grants | D-01–D-10, N-03, A01 |
| Seeds | `supabase/seed/00_fixtures.sql` | Minimal fixtures with canonical IDs so every slice can run | M-01 |
| Retention cron | `src/app/api/cron/retention/route.ts` | Calls `run_retention()` daily | N-03, T-C3 |
| Health | `src/app/api/health/route.ts` | `{ ok, version, db }`, no secrets | A10 |
| Deploy | Vercel + Supabase cloud | Production deploy, env vars, migrations | A02, A04 |

## Data flow

Main flow (J1 shape). Each slice's internals are its own. This shows only how they cross the shared layer.

```mermaid
sequenceDiagram
    participant U as Browser
    participant MW as middleware
    participant CH as /api/chat (11)
    participant SEC as lib/security
    participant AI as lib/ai
    participant CL as Claude API
    participant CAT as lib/catalog
    participant CS as lib/case
    participant PL as /api/plan (12)
    participant MP as lib/maps
    participant DB as Postgres

    U->>MW: POST /api/chat {messages}
    MW->>MW: ensure bf_sid cookie, set headers
    MW->>CH: request
    CH->>SEC: rateLimit('chat', sessionHash)
    SEC->>DB: rate_limit_hit()
    CH->>AI: guardInput(text) -> maskPii, length check
    CH->>CAT: listServices() (published only)
    CH->>AI: callClaude(system, wrapped messages, catalogTools(services))
    AI->>CL: messages.stream (max_tokens, timeout)
    CL-->>AI: tool_use select_services {serviceIds}
    AI->>AI: parseSelectServices (ids must exist)
    CH->>CAT: getRequirements(serviceIds, slots)
    CH->>CS: createCase(serviceIds, slots, requirementIds)
    CS->>DB: create_case_with_checklist()
    CS-->>CH: {caseId, token}
    CH-->>U: stream text (sanitizeLlmText) + routes.plan(token)
    U->>PL: POST /api/plan/jurisdiction {token, lat, lng}
    PL->>CAT: findJurisdiction(point, 'police_area')
    CAT->>DB: find_jurisdiction()
    PL->>MP: computeRouteMatrix (Essentials)
    PL->>CS: updateCase(token, {officeId, incidentPoint})
```

Coordinates enter only `/api/plan` and `/api/trip`. They are stored on the case row and never passed to `lib/ai`.

---

# Part 2: Low-Level Design

## Data Models

The data model is the complete database schema below, followed by the shared TypeScript types.

PostGIS is enabled in the `extensions` schema (Supabase default). All tables live in `public`. Catalog IDs are readable slugs (`text`, `^[a-z0-9-]{2,64}$`) so the LLM, seeds and tests can refer to them. Private rows use `uuid`.

### 0001_extensions_enums.sql

```sql
create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create type agency_kind        as enum ('district','police','dlt','gov_app','city_report','other');
create type jurisdiction_kind  as enum ('police_area','district');
create type office_rule        as enum ('incident_location','house_registration','any_office','online');
create type requirement_kind   as enum ('before_go','document','remember','step');
create type doc_form           as enum ('original','copy','original_and_copy','none');
create type link_relation      as enum ('next_step','same_trip_ok');
create type case_status        as enum ('planned','booked','due','done','rescheduled','cancelled');
create type travel_mode        as enum ('transit','drive','two_wheeler','walk');
create type reminder_kind      as enum ('appointment_d1','appointment_morning','unchecked_items',
                                        'expiry_60','expiry_30','expiry_7',
                                        'post_visit_survey','traffic_recheck');
create type reminder_status    as enum ('pending','sent','cancelled','failed');
create type consent_purpose    as enum ('line_link','reminders');
create type report_status      as enum ('open','triaged','fixed','rejected');
create type doc_type           as enum ('id_card','driving_licence','vehicle_tax','passport');
create type pass_reason        as enum ('purchase','use','refund','grant','expire');
create type payment_status     as enum ('pending','paid','failed','refunded');

create domain slug as text check (value ~ '^[a-z0-9-]{2,64}$');
create domain https_url as text check (value ~ '^https://[^\s]{4,2000}$');

create function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
```

### 0002_catalog.sql (D-01 to D-06, D-09)

```sql
create table agencies (                                   -- D-01
  id            slug primary key,
  name_th       text not null check (char_length(name_th) between 1 and 200),
  kind          agency_kind not null,
  hotline       text check (hotline ~ '^[0-9]{3,10}$'),
  website_url   https_url,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table offices (                                    -- D-02
  id                 slug primary key,
  agency_id          slug not null references agencies(id) on delete restrict,
  name_th            text not null check (char_length(name_th) between 1 and 200),
  location           extensions.geometry(Point, 4326) not null,
  address_th         text not null check (char_length(address_th) <= 500),
  district_name_th   text,
  phone              text check (phone ~ '^[0-9]{9,10}$'),
  opening_hours      jsonb not null,                    -- OpeningHours, includes Saturday and lunch break
  nearest_station_th text,
  booking_url        https_url,
  source_url         https_url not null,
  last_verified      date not null,
  is_published       boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index offices_agency_idx   on offices (agency_id) where is_published;
create index offices_location_gix on offices using gist (location);

create table jurisdictions (                              -- D-03
  id            uuid primary key default gen_random_uuid(),
  office_id     slug not null references offices(id) on delete cascade,
  kind          jurisdiction_kind not null,
  area          extensions.geometry(MultiPolygon, 4326) not null check (extensions.st_isvalid(area)),
  is_proxy      boolean not null default false,          -- D-14: แขวง used as stand-in
  source_url    https_url,
  last_verified date not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index jurisdictions_area_gix  on jurisdictions using gist (area);
create index jurisdictions_area_ggix on jurisdictions using gist ((area::extensions.geography));
create index jurisdictions_kind_idx  on jurisdictions (kind);

create table services (                                   -- D-04
  id                     slug primary key,
  name_th                text not null check (char_length(name_th) between 1 and 200),
  synonyms               text[] not null default '{}',
  example_utterances     text[] not null default '{}',
  agency_id              slug not null references agencies(id) on delete restrict,
  office_rule            office_rule not null,
  can_complete_online    boolean not null default false, -- W-04
  online_channel_name_th text,
  online_channel_url     https_url,
  triage_questions       jsonb not null default '[]',    -- TriageQuestion[] for W-02
  fee_thb                numeric(10,2) check (fee_thb >= 0),
  fee_note_th            text,
  est_minutes            integer check (est_minutes between 1 and 1440),
  hotline                text check (hotline ~ '^[0-9]{3,10}$'),
  source_url             https_url not null,
  last_verified          date not null,
  is_published           boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  check (not can_complete_online or online_channel_url is not null)
);
create index services_agency_idx on services (agency_id) where is_published;

create table service_requirements (                       -- D-05
  id                 uuid primary key default gen_random_uuid(),
  service_id         slug not null references services(id) on delete cascade,
  kind               requirement_kind not null,
  text_th            text not null check (char_length(text_th) between 1 and 300),
  condition          jsonb,                              -- Condition, null = always
  condition_label_th text,                               -- e.g. "เฉพาะกรณีมอบอำนาจ"
  doc_form           doc_form not null default 'none',
  copies             smallint check (copies between 1 and 10),
  sort_order         integer not null default 0,
  is_active          boolean not null default true,
  source_url         https_url,                          -- null = use service.source_url
  last_verified      date,                               -- null = use service.last_verified
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index service_requirements_service_idx on service_requirements (service_id, sort_order) where is_active;

create table service_links (                              -- D-06
  from_service_id    slug not null references services(id) on delete cascade,
  to_service_id      slug not null references services(id) on delete cascade,
  relation           link_relation not null default 'next_step',
  condition          jsonb,
  condition_label_th text,
  created_at         timestamptz not null default now(),
  primary key (from_service_id, to_service_id),
  check (from_service_id <> to_service_id)
);

create table holidays (                                   -- D-09
  id                 uuid primary key default gen_random_uuid(),
  date               date not null,
  name_th            text not null,
  closed_agency_ids  slug[],                             -- null = all government offices closed
  source_url         https_url,
  created_at         timestamptz not null default now(),
  unique (date, name_th)
);
create index holidays_date_idx on holidays (date);

-- updated_at triggers on agencies, offices, jurisdictions, services, service_requirements
```

### 0003_cases_sessions.sql (D-07, D-10)

```sql
create table sessions (
  id           uuid primary key default gen_random_uuid(),
  token_hash   bytea not null unique check (octet_length(token_hash) = 32),  -- sha256(bf_sid)
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table line_users (
  id                    uuid primary key default gen_random_uuid(),
  line_user_id          text not null unique check (line_user_id ~ '^U[0-9a-f]{32}$'),
  is_friend             boolean not null default false,    -- L-C2
  notifications_enabled boolean not null default true,     -- L-09
  created_at            timestamptz not null default now(),
  last_seen_at          timestamptz not null default now()
);

create table cases (                                      -- D-07
  id                  uuid primary key default gen_random_uuid(),
  token_hash          bytea not null unique check (octet_length(token_hash) = 32),
  session_id          uuid references sessions(id) on delete set null,
  line_user_id        uuid references line_users(id) on delete cascade,
  parent_case_id      uuid references cases(id) on delete set null,  -- chained case (J1 -> J3)
  service_ids         slug[] not null check (cardinality(service_ids) between 1 and 5),
  slot_answers        jsonb not null default '{}' check (pg_column_size(slot_answers) <= 4096),
  office_id           slug references offices(id) on delete set null,
  incident_point      extensions.geometry(Point, 4326),
  origin_point        extensions.geometry(Point, 4326),  -- T-C3: often home; never sent to LLM
  travel_mode         travel_mode,
  appointment_at      timestamptz,
  depart_at           timestamptz,                       -- T-03 result, used by L-02
  document_expires_on date,                              -- L-03 user-entered expiry
  status              case_status not null default 'planned',
  smart_mode          boolean not null default false,    -- Phase 2 (B-01)
  saved_minutes       integer check (saved_minutes >= 0),-- W-10
  push_count          smallint not null default 0,       -- L-C1 cap
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  completed_at        timestamptz,
  expires_at          timestamptz not null
);
create index cases_expires_idx  on cases (expires_at);
create index cases_line_idx     on cases (line_user_id) where line_user_id is not null;
create index cases_session_idx  on cases (session_id);
create index cases_appt_idx     on cases (appointment_at) where status in ('booked','due');

create table case_checklist_items (                       -- D-07 checklist tick state
  id             uuid primary key default gen_random_uuid(),
  case_id        uuid not null references cases(id) on delete cascade,
  requirement_id uuid not null references service_requirements(id) on delete cascade,
  checked        boolean not null default false,
  checked_at     timestamptz,
  sort_order     integer not null default 0,
  unique (case_id, requirement_id)
);
```

### 0004_line_reminders.sql (D-08)

```sql
create table consents (                                   -- N-03 consent before LINE link
  id             uuid primary key default gen_random_uuid(),
  line_user_id   uuid not null references line_users(id) on delete cascade,
  purpose        consent_purpose not null,
  policy_version text not null,
  granted_at     timestamptz not null default now(),
  revoked_at     timestamptz
);
create index consents_user_idx on consents (line_user_id, purpose);

create table document_expiries (                          -- P2-01, declared now (cheap)
  id           uuid primary key default gen_random_uuid(),
  line_user_id uuid not null references line_users(id) on delete cascade,
  doc_type     doc_type not null,                         -- type + date only, never the number
  expires_on   date not null,
  created_at   timestamptz not null default now(),
  unique (line_user_id, doc_type)
);

create table reminders (                                  -- D-08
  id                 uuid primary key default gen_random_uuid(),
  case_id            uuid references cases(id) on delete cascade,
  document_expiry_id uuid references document_expiries(id) on delete cascade,
  kind               reminder_kind not null,
  send_at            timestamptz not null,
  status             reminder_status not null default 'pending',
  sent_at            timestamptz,
  attempts           smallint not null default 0 check (attempts between 0 and 5),
  created_at         timestamptz not null default now(),
  check (num_nonnulls(case_id, document_expiry_id) = 1),
  unique (case_id, kind, send_at)
);
create index reminders_due_idx on reminders (send_at) where status = 'pending';
```

### 0005_ops_kpi.sql

```sql
create table catalog_reports (                            -- N-08 "ข้อมูลนี้ไม่ตรง", RK-02
  id             uuid primary key default gen_random_uuid(),
  service_id     slug references services(id) on delete set null,
  office_id      slug references offices(id) on delete set null,
  requirement_id uuid references service_requirements(id) on delete set null,
  message_th     text not null check (char_length(message_th) between 1 and 500),  -- masked
  status         report_status not null default 'open',
  admin_note     text,
  session_id     uuid references sessions(id) on delete set null,
  created_at     timestamptz not null default now(),
  resolved_at    timestamptz
);
create index catalog_reports_status_idx on catalog_reports (status, created_at desc);

create table events (                                     -- KPI event log (K-01..K-05), no PII
  id         bigint generated always as identity primary key,
  name       text not null check (name ~ '^[a-z][a-z0-9_]{1,47}$'),
  session_id uuid references sessions(id) on delete set null,
  case_id    uuid references cases(id) on delete set null,
  props      jsonb not null default '{}' check (pg_column_size(props) <= 2048),
  created_at timestamptz not null default now()
);
create index events_name_time_idx on events (name, created_at);
create index events_case_idx      on events (case_id) where case_id is not null;

create table rate_limits (                                -- A06, LLM10
  key          text not null check (char_length(key) <= 128),
  window_start timestamptz not null,
  count        integer not null,
  primary key (key, window_start)
);

create table admin_users (                                -- admin stub (N-08 uses it)
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
```

### 0006_phase2.sql (declared now, unused in MVP per M-05)

```sql
create table wait_reports (                               -- P2-03
  id           uuid primary key default gen_random_uuid(),
  office_id    slug not null references offices(id) on delete cascade,
  service_id   slug references services(id) on delete set null,
  visited_on   date not null,
  arrived_hour smallint not null check (arrived_hour between 0 and 23),
  wait_minutes smallint not null check (wait_minutes between 0 and 600),
  created_at   timestamptz not null default now()
);

create table payments (                                   -- B-02, no card data stored
  id            uuid primary key default gen_random_uuid(),
  line_user_id  uuid references line_users(id) on delete set null,
  provider      text not null,
  provider_ref  text not null unique,
  amount_satang integer not null check (amount_satang > 0),
  status        payment_status not null default 'pending',
  created_at    timestamptz not null default now(),
  paid_at       timestamptz
);

create table pass_ledger (                                -- B-03 wallet as an append-only ledger
  id           uuid primary key default gen_random_uuid(),
  line_user_id uuid not null references line_users(id) on delete cascade,
  delta        integer not null check (delta <> 0),
  reason       pass_reason not null,
  case_id      uuid references cases(id) on delete set null,
  payment_id   uuid references payments(id) on delete set null,
  expires_at   timestamptz,
  created_at   timestamptz not null default now()
);
create index pass_ledger_user_idx on pass_ledger (line_user_id, created_at);
```

Not declared (needs a wave-3 lead migration): P2-02 family links, B-05 pass transfer, B-06 sponsor codes, W-16 multi-language columns.

### 0007_functions.sql

All functions set `search_path = public, extensions`. Default `EXECUTE` to `PUBLIC` is revoked for every function in 0008, then granted explicitly.

#### Jurisdiction lookup (D-03, W-05 support, RK-01 support)

```sql
create function find_jurisdiction(
  p_lat double precision, p_lng double precision,
  p_kind jurisdiction_kind, p_edge_m integer default 200
) returns table (office_id slug, jurisdiction_id uuid, covers boolean,
                 distance_m double precision, is_proxy boolean)
language sql stable security invoker
set search_path = public, extensions as $$
  with pt as (select st_setsrid(st_makepoint(p_lng, p_lat), 4326) as g)
  select j.office_id, j.id,
         st_covers(j.area, pt.g)                          as covers,
         st_distance(j.area::geography, pt.g::geography)  as distance_m,
         j.is_proxy
  from jurisdictions j
  join offices o on o.id = j.office_id and o.is_published
  cross join pt
  where j.kind = p_kind
    and p_lat between 13.45 and 14.00 and p_lng between 100.30 and 100.98   -- M-01 Bangkok bbox
    and p_edge_m between 0 and 1000
    and st_dwithin(j.area::geography, pt.g::geography, p_edge_m)
  order by covers desc, distance_m asc
  limit 3;
$$;
```

`security invoker` keeps RLS in force, so only published offices are returned. A point inside one polygon and within `p_edge_m` of another returns both rows, which lets 12-office-finder show 2 สน. near a boundary.

#### Session touch

```sql
create function touch_session(p_token_hash bytea) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  insert into sessions (token_hash) values (p_token_hash)
  on conflict (token_hash) do update set last_seen_at = now()
    where sessions.last_seen_at < now() - interval '1 hour';
  select id into v_id from sessions where token_hash = p_token_hash;
  return v_id;
end $$;
```

#### Case status machine (D-10)

```sql
create function case_transition_allowed(p_from case_status, p_to case_status) returns boolean
language sql immutable as $$
  select p_from = p_to or (p_from, p_to) in (
    ('planned','booked'), ('booked','due'), ('due','done'),
    ('booked','rescheduled'), ('due','rescheduled'), ('rescheduled','booked'),
    ('planned','cancelled'), ('booked','cancelled'), ('due','cancelled'), ('rescheduled','cancelled')
  );
$$;
```

#### Case expiry (N-03, T-C3)

Retention is 30 days after the latest of: creation, completion, appointment, last pending reminder, last update. OQ-05 (anonymous retention) is still open; changing 30 is a lead migration.

```sql
create function case_before_write() returns trigger
language plpgsql set search_path = public as $$
declare v_last_reminder timestamptz;
begin
  if tg_op = 'UPDATE' and not case_transition_allowed(old.status, new.status) then
    raise exception 'invalid case transition % -> %', old.status, new.status using errcode = 'P0001';
  end if;
  if new.status in ('done','cancelled') and new.completed_at is null then
    new.completed_at := now();
  end if;
  if exists (select 1 from unnest(new.service_ids) s
             where not exists (select 1 from services where id = s)) then
    raise exception 'unknown service id' using errcode = 'P0002';
  end if;
  select max(send_at) into v_last_reminder
    from reminders where case_id = new.id and status = 'pending';
  new.updated_at := now();
  new.expires_at := greatest(new.created_at, now(),
                             coalesce(new.completed_at,   new.created_at),
                             coalesce(new.appointment_at, new.created_at),
                             coalesce(v_last_reminder,    new.created_at))
                    + interval '30 days';
  return new;
end $$;
create trigger cases_before_write before insert or update on cases
  for each row execute function case_before_write();

create function reminder_touch_case() returns trigger
language plpgsql set search_path = public as $$
begin
  update cases set updated_at = now() where id = coalesce(new.case_id, old.case_id);
  return null;
end $$;
create trigger reminders_touch_case after insert or update or delete on reminders
  for each row when (coalesce(new.case_id, old.case_id) is not null)
  execute function reminder_touch_case();
```

#### Create case with checklist (atomic)

```sql
create function create_case_with_checklist(
  p_token_hash bytea, p_session_id uuid, p_service_ids slug[],
  p_slot_answers jsonb, p_requirement_ids uuid[], p_parent_case_id uuid default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_case uuid;
begin
  if exists (select 1 from unnest(p_requirement_ids) r
             where not exists (select 1 from service_requirements sr
                               where sr.id = r and sr.is_active
                                 and sr.service_id = any(p_service_ids))) then
    raise exception 'requirement not in selected services' using errcode = 'P0003';
  end if;
  insert into cases (token_hash, session_id, service_ids, slot_answers, parent_case_id, expires_at)
  values (p_token_hash, p_session_id, p_service_ids, coalesce(p_slot_answers,'{}'), p_parent_case_id, now())
  returning id into v_case;
  insert into case_checklist_items (case_id, requirement_id, sort_order)
  select v_case, r.id, row_number() over (order by s.ord, sr.sort_order)
  from unnest(p_requirement_ids) as r(id)
  join service_requirements sr on sr.id = r.id
  join unnest(p_service_ids) with ordinality as s(id, ord) on s.id = sr.service_id;
  return v_case;
end $$;
```

#### Rate limit (fixed window)

```sql
create function rate_limit_hit(p_key text, p_window_seconds integer, p_max integer)
returns table (allowed boolean, retry_after integer)
language plpgsql security definer set search_path = public as $$
declare
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  c integer;
begin
  insert into rate_limits (key, window_start, count) values (p_key, w, 1)
  on conflict (key, window_start) do update set count = rate_limits.count + 1
  returning count into c;
  allowed := c <= p_max;
  retry_after := case when allowed then 0
                 else ceil(extract(epoch from (w + make_interval(secs => p_window_seconds) - now())))::integer end;
  return next;
end $$;
```

#### Delete a LINE user's data (L-09 support)

```sql
create function delete_line_user_data(p_line_user_id text) returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  with d as (delete from line_users where line_user_id = p_line_user_id returning 1)
  select count(*) into n from d;      -- cascades: cases, checklist, reminders, consents, document_expiries, pass_ledger
  return n;
end $$;
```

#### Retention job (N-03)

```sql
create function run_retention() returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_cases int; v_sessions int; v_rl int; v_events int;
begin
  with d as (delete from cases where expires_at < now() returning 1) select count(*) into v_cases from d;
  with d as (delete from sessions s where s.last_seen_at < now() - interval '30 days'
               and not exists (select 1 from cases c where c.session_id = s.id) returning 1)
    select count(*) into v_sessions from d;
  with d as (delete from rate_limits where window_start < now() - interval '1 day' returning 1)
    select count(*) into v_rl from d;
  with d as (delete from events where created_at < now() - interval '365 days' returning 1)
    select count(*) into v_events from d;
  update reminders set status = 'cancelled'
    where status = 'pending' and send_at < now() - interval '1 day';
  return jsonb_build_object('cases', v_cases, 'sessions', v_sessions,
                            'rate_limits', v_rl, 'events', v_events);
end $$;
```

### 0008_rls_grants.sql (A01, A02)

```sql
-- 1. RLS on every table, no exceptions.
alter table agencies             enable row level security;
alter table offices              enable row level security;
alter table jurisdictions        enable row level security;
alter table services             enable row level security;
alter table service_requirements enable row level security;
alter table service_links        enable row level security;
alter table holidays             enable row level security;
alter table sessions             enable row level security;
alter table line_users           enable row level security;
alter table cases                enable row level security;
alter table case_checklist_items enable row level security;
alter table consents             enable row level security;
alter table document_expiries    enable row level security;
alter table reminders            enable row level security;
alter table catalog_reports      enable row level security;
alter table events               enable row level security;
alter table rate_limits          enable row level security;
alter table admin_users          enable row level security;
alter table wait_reports         enable row level security;
alter table payments             enable row level security;
alter table pass_ledger          enable row level security;

-- 2. Catalog: public read of published rows only. No write policies (writes go through service role).
create policy agencies_read      on agencies      for select to anon, authenticated using (is_published);
create policy offices_read       on offices       for select to anon, authenticated using (is_published);
create policy services_read      on services      for select to anon, authenticated using (is_published);
create policy jurisdictions_read on jurisdictions for select to anon, authenticated
  using (exists (select 1 from offices o where o.id = office_id and o.is_published));
create policy requirements_read  on service_requirements for select to anon, authenticated
  using (is_active and exists (select 1 from services s where s.id = service_id and s.is_published));
create policy links_read         on service_links for select to anon, authenticated
  using (exists (select 1 from services s where s.id = from_service_id and s.is_published)
     and exists (select 1 from services s where s.id = to_service_id   and s.is_published));
create policy holidays_read      on holidays      for select to anon, authenticated using (true);

-- 3. admin_users: a signed-in user can see only their own row (used by requireAdmin).
create policy admin_self_read on admin_users for select to authenticated using (user_id = auth.uid());

-- 4. Private tables: no policies => deny all for anon/authenticated. Also revoke privileges.
revoke all on sessions, line_users, cases, case_checklist_items, consents, document_expiries,
              reminders, catalog_reports, events, rate_limits, wait_reports, payments, pass_ledger
  from anon, authenticated;
revoke insert, update, delete on agencies, offices, jurisdictions, services,
              service_requirements, service_links, holidays, admin_users
  from anon, authenticated;

-- 5. Functions.
revoke execute on all functions in schema public from public, anon, authenticated;
grant  execute on function find_jurisdiction(double precision, double precision, jurisdiction_kind, integer)
  to anon, authenticated, service_role;
grant  execute on function touch_session(bytea), create_case_with_checklist(bytea, uuid, slug[], jsonb, uuid[], uuid),
                           rate_limit_hit(text, integer, integer), delete_line_user_data(text),
                           run_retention(), case_transition_allowed(case_status, case_status)
  to service_role;
alter default privileges in schema public revoke execute on functions from public;
```

The service role has `BYPASSRLS`. It is only reachable through `createServiceClient()`, which imports `server-only` and reads `SUPABASE_SERVICE_ROLE_KEY`. Every case-scoped query in server code starts from `getCaseByToken()` and filters by the returned `case.id`.

## Shared TypeScript types (`src/types/domain.ts`)

```typescript
export type Slug = string & { readonly __brand: 'Slug' }
export type CaseToken = string & { readonly __brand: 'CaseToken' }   // 22-char base64url, 128-bit
export type IsoDate = string                                          // 'YYYY-MM-DD'

export type AgencyKind = 'district' | 'police' | 'dlt' | 'gov_app' | 'city_report' | 'other'
export type JurisdictionKind = 'police_area' | 'district'
export type OfficeRule = 'incident_location' | 'house_registration' | 'any_office' | 'online'
export type RequirementKind = 'before_go' | 'document' | 'remember' | 'step'
export type DocForm = 'original' | 'copy' | 'original_and_copy' | 'none'
export type CaseStatus = 'planned' | 'booked' | 'due' | 'done' | 'rescheduled' | 'cancelled'
export type TravelMode = 'transit' | 'drive' | 'two_wheeler' | 'walk'
export type ReminderKind =
  | 'appointment_d1' | 'appointment_morning' | 'unchecked_items'
  | 'expiry_60' | 'expiry_30' | 'expiry_7' | 'post_visit_survey' | 'traffic_recheck'
export type ReminderStatus = 'pending' | 'sent' | 'cancelled' | 'failed'

export interface LatLng { lat: number; lng: number }

export interface Agency {
  id: Slug; nameTh: string; kind: AgencyKind; hotline: string | null; websiteUrl: string | null
}

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
export interface TimeRange { start: string; end: string }            // 'HH:MM', Asia/Bangkok
export interface OpeningHours {
  weekly: Partial<Record<Weekday, { open: string; close: string; breaks?: TimeRange[] }>>
  notesTh?: string
}

export interface Office {
  id: Slug; agencyId: Slug; nameTh: string; location: LatLng; addressTh: string
  districtNameTh: string | null; phone: string | null; openingHours: OpeningHours
  nearestStationTh: string | null; bookingUrl: string | null
  sourceUrl: string; lastVerified: IsoDate
}

export type SlotValue = string | number | boolean | null
export type SlotAnswers = Record<string, SlotValue>                  // never contains coordinates

export type Condition =
  | { slot: string; op: 'eq' | 'neq'; value: SlotValue }
  | { slot: string; op: 'in'; value: SlotValue[] }
  | { all: Condition[] }
  | { any: Condition[] }

export interface TriageQuestion {
  id: string                                                          // slot key
  labelTh: string
  kind: 'choice' | 'location' | 'date' | 'boolean'
  options?: { value: string; labelTh: string }[]
  askIf?: Condition
}

export interface Service {
  id: Slug; nameTh: string; synonyms: string[]; exampleUtterances: string[]
  agencyId: Slug; officeRule: OfficeRule
  canCompleteOnline: boolean; onlineChannelNameTh: string | null; onlineChannelUrl: string | null
  triageQuestions: TriageQuestion[]
  feeThb: number | null; feeNoteTh: string | null; estMinutes: number | null; hotline: string | null
  sourceUrl: string; lastVerified: IsoDate
}

export interface ServiceRequirement {
  id: string; serviceId: Slug; kind: RequirementKind; textTh: string
  condition: Condition | null; conditionLabelTh: string | null
  docForm: DocForm; copies: number | null; sortOrder: number
  sourceUrl: string; lastVerified: IsoDate                            // resolved: falls back to service
}

export interface ServiceLink {
  fromServiceId: Slug; toServiceId: Slug; relation: 'next_step' | 'same_trip_ok'
  condition: Condition | null; conditionLabelTh: string | null
}

export interface Holiday { date: IsoDate; nameTh: string; closedAgencyIds: Slug[] | null }

export interface JurisdictionMatch {
  officeId: Slug; jurisdictionId: string; covers: boolean; distanceM: number; isProxy: boolean
}

export interface Case {
  id: string; sessionId: string | null; lineUserId: string | null; parentCaseId: string | null
  serviceIds: Slug[]; slotAnswers: SlotAnswers; officeId: Slug | null
  incidentPoint: LatLng | null; originPoint: LatLng | null; travelMode: TravelMode | null
  appointmentAt: string | null; departAt: string | null; documentExpiresOn: IsoDate | null
  status: CaseStatus; smartMode: boolean; savedMinutes: number | null; pushCount: number
  createdAt: string; updatedAt: string; completedAt: string | null; expiresAt: string
}

export interface ChecklistItem {
  id: string; requirement: ServiceRequirement; checked: boolean; checkedAt: string | null; sortOrder: number
}

export type EventName =
  | 'chat_started' | 'services_selected' | 'low_confidence' | 'emergency_shown'
  | 'online_resolved' | 'plan_ready' | 'office_selected' | 'maps_fallback'
  | 'case_viewed' | 'calendar_added' | 'line_linked' | 'push_sent'
  | 'case_status_changed' | 'catalog_report' | 'llm_call' | 'rate_limited' | 'survey_answered'
```

## Library function signatures

### `src/lib/db`

```typescript
export function createServerAnonClient(): SupabaseClient<Database>     // server.ts, anon key, catalog reads
export function createServiceClient(): SupabaseClient<Database>        // service.ts, 'server-only', service role
export function createBrowserAnonClient(): SupabaseClient<Database>    // browser.ts, catalog reads + admin auth only
```

### `src/lib/catalog` (read-only, published rows only)

```typescript
export function listServices(): Promise<Service[]>                     // cached 300 s (N-09)
export function getService(id: Slug): Promise<Service | null>
export function getServicesByIds(ids: Slug[]): Promise<Service[]>
export function getRequirements(serviceId: Slug, slots?: SlotAnswers): Promise<ServiceRequirement[]>
export function getServiceLinks(fromId: Slug, slots?: SlotAnswers): Promise<ServiceLink[]>
export function listAgencies(): Promise<Agency[]>
export function getAgency(id: Slug): Promise<Agency | null>
export function getOffice(id: Slug): Promise<Office | null>
export function listOfficesByAgency(agencyId: Slug): Promise<Office[]>
export function findJurisdiction(p: LatLng, kind: JurisdictionKind, edgeM?: number): Promise<JurisdictionMatch[]>
export function listHolidays(from: IsoDate, to: IsoDate): Promise<Holiday[]>

// pure helpers
export const STALE_AFTER_DAYS = 90
export function staleness(lastVerified: IsoDate, now: Date): { days: number; isStale: boolean }  // N-01
export function evaluateCondition(c: Condition | null, slots: SlotAnswers): boolean               // null => true
export function openingRangesOn(office: Office, date: IsoDate, holidays: Holiday[]): TimeRange[]  // [] if closed
```

`staleness` computes whole days between `lastVerified` and `now` in Asia/Bangkok. `isStale` is `days > 90`.

### `src/lib/case`

```typescript
export function generateCaseToken(): CaseToken                         // token.ts
export function isCaseToken(s: string): s is CaseToken                 // /^[A-Za-z0-9_-]{22}$/
export function hashToken(t: string): Promise<Uint8Array>              // SHA-256, 32 bytes

export interface CreateCaseInput {
  serviceIds: Slug[]; slotAnswers: SlotAnswers; requirementIds: string[]; parentCaseId?: string
}
export function createCase(input: CreateCaseInput, sessionId: string): Promise<{ case: Case; token: CaseToken }>
export function getCaseByToken(token: string): Promise<Case | null>    // null for bad format or no match
export type CasePatch = Partial<Pick<Case,
  'officeId' | 'incidentPoint' | 'originPoint' | 'travelMode' | 'appointmentAt' | 'departAt'
  | 'documentExpiresOn' | 'status' | 'slotAnswers' | 'savedMinutes' | 'smartMode'>>
export function updateCase(token: string, patch: CasePatch): Promise<Case>     // throws AppError('invalid_transition')
export function listChecklist(token: string): Promise<ChecklistItem[]>
export function setChecklistItem(token: string, itemId: string, checked: boolean): Promise<void>
export function bindLineUser(token: string, lineUserDbId: string): Promise<void>
export function deleteCase(token: string): Promise<void>

export const CASE_TRANSITIONS: Record<CaseStatus, CaseStatus[]>       // status.ts, mirrors SQL
export function canTransition(from: CaseStatus, to: CaseStatus): boolean
```

### `src/lib/ai`

```typescript
export type PiiKind = 'national_id' | 'phone' | 'bank_account' | 'card' | 'email' | 'coordinates'
export function maskPii(text: string): { masked: string; found: PiiKind[] }      // pii.ts

export const MAX_USER_CHARS = 1000
export function guardInput(raw: string):
  | { ok: true; text: string; found: PiiKind[] }
  | { ok: false; reason: 'empty' | 'too_long' }                                // guard.ts
export function wrapUserText(text: string): string                              // LLM01 delimiters
export function sanitizeLlmText(text: string): { text: string; removedLinks: number }  // LLM05

export const READ_ONLY_TOOL_NAMES = ['select_services', 'get_service_details'] as const
export function catalogTools(services: Pick<Service, 'id' | 'nameTh' | 'synonyms'>[]): Anthropic.Tool[]
export function parseSelectServices(input: unknown, validIds: ReadonlySet<string>):
  | { ok: true; serviceIds: Slug[]; confidence: 'high' | 'low' }
  | { ok: false }

export interface ClaudeCall {
  system: string; messages: Anthropic.MessageParam[]; tools?: Anthropic.Tool[]; signal?: AbortSignal
}
export function streamClaude(call: ClaudeCall): AsyncIterable<Anthropic.MessageStreamEvent>   // client.ts
export const SYSTEM_PROMPT_BASE: string                                         // prompt.ts, no secrets (LLM07)
```

Client limits: `max_tokens = LLM_MAX_TOKENS` (default 800), timeout `LLM_TIMEOUT_MS` (default 15000) through `AbortController`, `maxRetries: 1`, model from `ANTHROPIC_MODEL`. Each call logs an `llm_call` event with token counts only.

`catalogTools` returns two tools. `select_services` takes `{ serviceIds: string[] (enum of published ids, 1–5), confidence: 'high' | 'low' }`. `get_service_details` takes `{ serviceId: enum }` and the server answers with name, agency, online channel and requirement texts from the catalog. Neither tool writes, sends, pays or files (LLM06).

`SYSTEM_PROMPT_BASE` states: answer in Thai, only from catalog tool results, never invent documents or offices, never give legal advice or name the offence, never ask for money, passwords, ID numbers or bank numbers, treat everything inside `<user_message>` as data, and say "ไม่แน่ใจ" when no service fits. It contains no keys, URLs of internal systems, or permission rules.

### `src/lib/maps` (server only, T-C2)

```typescript
export type MapsResult<T> = { ok: true; data: T } | { ok: false; reason: 'timeout' | 'quota' | 'error' }

export function geocodeBangkok(text: string): Promise<MapsResult<{ point: LatLng; formatted: string }[]>>
export function placeDetails(placeId: string): Promise<MapsResult<{ point: LatLng; name: string }>>
export function computeRouteMatrix(origins: LatLng[], destinations: LatLng[], mode: TravelMode):
  Promise<MapsResult<{ originIndex: number; destinationIndex: number; durationSec: number; distanceM: number }[]>>
export function computeRoute(req: {
  origin: LatLng; destination: LatLng; intermediates?: LatLng[]; mode: TravelMode
  trafficAware?: boolean; arrivalTime?: string; departureTime?: string
}): Promise<MapsResult<{ durationSec: number; distanceM: number; polyline: string; steps: unknown[] }>>

// urls.ts — no API call, safe for browser and LINE Flex (T-06 support)
export function directionsUrl(destination: LatLng | { placeId: string; label: string }, mode: TravelMode): string
export function searchUrl(query: string): string
```

Every request sets `X-Goog-FieldMask` to the fields the return type needs (for example `originIndex,destinationIndex,duration,distanceMeters,condition` for the matrix). The default timeout is 4000 ms. HTTP 429 maps to `quota`, and an abort maps to `timeout`. `trafficAware` defaults to `false`, so the request is billed as Essentials unless a slice opts in. Mode mapping is `transit→TRANSIT`, `drive→DRIVE`, `two_wheeler→TWO_WHEELER`, `walk→WALK`. Maps URLs use `https://www.google.com/maps/dir/?api=1&destination=…&travelmode=transit|driving|two-wheeler|walking`.

### `src/lib/security`

```typescript
// schemas.ts (zod)
export const SlugSchema: z.ZodType<Slug>
export const CaseTokenSchema: z.ZodType<CaseToken>
export const LatLngSchema          // lat 13.45–14.00, lng 100.30–100.98 (M-01)
export const ChatTextSchema        // 1..1000 chars after trim
export const SlotAnswersSchema     // ≤ 30 keys, key /^[a-z_]{1,32}$/, string values ≤ 200 chars
export const ConditionSchema, TriageQuestionSchema, OpeningHoursSchema
export const AgencyInputSchema, OfficeInputSchema, ServiceInputSchema,
             RequirementInputSchema, ServiceLinkInputSchema, HolidayInputSchema  // admin writes; URL fields use OfficialUrlSchema
export const OfficialUrlSchema     // z.string().refine(u => checkLink(u).category === 'official')

// allowlist.ts (N-05, LLM05)
export const OFFICIAL_SUFFIXES: readonly ['.go.th']
export const OFFICIAL_HOSTS: readonly string[]   // ['traffy.in.th', 'www.traffy.in.th', 'fondue.traffy.in.th']
export const UTILITY_HOSTS: readonly string[]    // ['www.google.com','maps.google.com','calendar.google.com','line.me','liff.line.me','access.line.me']
export type LinkCheck = { ok: true; url: string; category: 'official' | 'utility' } | { ok: false }
export function checkLink(raw: string): LinkCheck
export function safeHref(raw: string | null | undefined): string | null

// rateLimit.ts (A06, LLM10)
export const RATE_LIMITS: {
  chat:       { windowSec: 300; max: 20 }      // per session
  chat_ip:    { windowSec: 300; max: 60 }      // per hashed IP
  plan:       { windowSec: 300; max: 40 }
  maps:       { windowSec: 300; max: 30 }
  case_write: { windowSec: 300; max: 60 }
  report:     { windowSec: 3600; max: 5 }
  line_login: { windowSec: 300; max: 10 }
  admin:      { windowSec: 300; max: 120 }
}
export function rateLimit(policy: keyof typeof RATE_LIMITS, subject: string):
  Promise<{ ok: true } | { ok: false; retryAfterSec: number }>

// errors.ts (A10)
export class AppError extends Error { constructor(code: AppErrorCode, status: number) }
export type AppErrorCode = 'bad_request' | 'not_found' | 'rate_limited' | 'unauthorized'
  | 'forbidden' | 'invalid_transition' | 'upstream_unavailable' | 'internal'
export function toSafeResponse(err: unknown, requestId: string): Response
// body: { error: code, message: generic Thai text, requestId }. Never err.message or stack.

// log.ts (A09)
export const log: {
  info(event: string, fields?: Record<string, unknown>): void
  warn(event: string, fields?: Record<string, unknown>): void
  error(event: string, fields?: Record<string, unknown>): void
}
export function trackEvent(name: EventName, ctx: { sessionId?: string; caseId?: string },
                           props?: Record<string, string | number | boolean>): Promise<void>

// hash.ts
export function hashIp(ip: string): Promise<string>          // HMAC-SHA256(IP_HASH_SALT), hex, first 32 chars

// lineSignature.ts (A08)
export function verifyLineSignature(rawBody: string, signatureB64: string | null, channelSecret: string): Promise<boolean>

// cron.ts
export function requireCronAuth(req: Request): void           // Authorization: Bearer CRON_SECRET, else AppError('unauthorized')
```

### `src/lib/auth`

```typescript
export const SESSION_COOKIE = 'bf_sid'
export function getSessionId(): Promise<string>               // session.ts: cookie -> sha256 -> touch_session()
export function requireAdmin(): Promise<{ userId: string; email: string }>   // admin.ts: Supabase Auth + admin_users
export function verifyLineIdToken(idToken: string, nonce?: string): Promise<{ sub: string }>  // line.ts (A07)
```

`requireAdmin` reads the Supabase Auth session from cookies (`@supabase/ssr`), then selects the user's own `admin_users` row with the user's client. It throws `unauthorized` or `forbidden`. Admin accounts are inserted by the lead with the service role. The production upgrade is MFA (A07). `verifyLineIdToken` posts to `https://api.line.me/oauth2/v2.1/verify` with `client_id = LINE_LOGIN_CHANNEL_ID`, then checks `aud`, `exp` and `nonce`.

## Algorithms

### Token generation (A01, A04)

```typescript
function generateCaseToken(): CaseToken {
  const bytes = new Uint8Array(16)                 // 128 bits
  crypto.getRandomValues(bytes)                    // CSPRNG, Web Crypto (edge + node)
  return base64url(bytes) as CaseToken             // 22 chars, no padding
}
async function hashToken(t: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))
}
```

**Preconditions:** Web Crypto is available.
**Postconditions:** the token matches `^[A-Za-z0-9_-]{22}$` and decodes to 16 bytes. Only `hashToken(token)` is stored (`cases.token_hash`, `sessions.token_hash`). The raw token appears only in the URL given to the user and in the `bf_sid` cookie.

`getCaseByToken(t)` returns `null` without a DB call when `isCaseToken(t)` is false. Otherwise it selects by `token_hash = hashToken(t)`. The lookup is by hash equality, so response time does not depend on how much of a token matches.

### PII masking (N-04, LLM02, T-C3)

```typescript
const THAI_DIGITS = /[๐-๙]/g
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
const COORDS = /-?\d{1,3}\.\d{4,}\s*,\s*-?\d{1,3}\.\d{4,}/g
const DIGIT_RUN = /\+?\d(?:[ \-]?\d){8,}/g                  // ≥ 9 digits, single space/hyphen separators

function maskPii(text: string): { masked: string; found: PiiKind[] } {
  const found = new Set<PiiKind>()
  let s = text.replace(THAI_DIGITS, d => String(d.charCodeAt(0) - 0x0E50))   // ๐..๙ -> 0..9
  s = s.replace(EMAIL,  () => (found.add('email'), '[อีเมล]'))
  s = s.replace(COORDS, () => (found.add('coordinates'), '[พิกัด]'))
  s = s.replace(DIGIT_RUN, m => {
    const d = m.replace(/\D/g, '')
    if (m.startsWith('+66') || (d.startsWith('66') && d.length === 11)) return (found.add('phone'), '[เบอร์โทร]')
    if (d.length === 13)                               return (found.add('national_id'), '[เลขบัตรประชาชน]')
    if ((d.length === 9 || d.length === 10) && d[0] === '0') return (found.add('phone'), '[เบอร์โทร]')
    if (d.length >= 14 && d.length <= 19 && luhn(d))   return (found.add('card'), '[เลขบัตร]')
    return (found.add('bank_account'), '[เลขบัญชี]')
  })
  return { masked: s, found: [...found] }
}
```

**Preconditions:** `text` is any string.
**Postconditions:** the output contains no match of `DIGIT_RUN`, `EMAIL` or `COORDS`. Digit runs shorter than 9 (hotlines 191, 1669, 1441, 1111, 1584, 1555, times, years, fees) are unchanged. Text without Thai digits, `@` or a 9+ digit run is returned unchanged. The function is idempotent because placeholders contain no digits or `@`.
**Loop invariant (per replace pass):** every span already replaced is a placeholder, and later passes never match inside a placeholder.

The masker over-masks on purpose. A run like "25 11 2026 10" becomes `[เลขบัญชี]`. Leaking an ID is worse than losing a date in the LLM prompt; slot answers carry dates separately. `maskPii` runs in `guardInput` (before the LLM), in `log.*` for every string field, and before inserting `catalog_reports.message_th`. Chat transcripts are not stored. The client sends the visible history each turn, and the server masks it again.

Coordinates have a second guard. Location slots are filled by UI components that call `/api/plan` directly. The chat route replaces a location answer with the text `[ตำแหน่งที่ผู้ใช้ยืนยันแล้ว]` before building messages.

### Prompt wrapping (LLM01)

```typescript
function wrapUserText(text: string): string {
  const safe = text.replace(/<\/?\s*user_message\s*>/gi, '')
  return `<user_message>\n${safe}\n</user_message>`
}
```

**Postconditions:** the output has exactly one opening and one closing `user_message` tag, at its ends.

### Link allowlist (N-05, LLM05)

```typescript
function checkLink(raw: string): LinkCheck {
  let u: URL
  try { u = new URL(raw.trim()) } catch { return { ok: false } }
  if (u.protocol !== 'https:') return { ok: false }
  if (u.username || u.password) return { ok: false }
  if (u.port && u.port !== '443') return { ok: false }
  const host = u.hostname.toLowerCase().replace(/\.$/, '')    // URL already punycodes IDNs
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) || host.includes(':')) return { ok: false }   // IPs
  if (OFFICIAL_SUFFIXES.some(sfx => host.endsWith(sfx) && host.length > sfx.length) || OFFICIAL_HOSTS.includes(host))
    return { ok: true, url: u.toString(), category: 'official' }
  if (UTILITY_HOSTS.includes(host))
    return { ok: true, url: u.toString(), category: 'utility' }
  return { ok: false }
}
const safeHref = (raw) => { if (!raw) return null; const r = checkLink(raw); return r.ok ? r.url : null }

function sanitizeLlmText(text: string) {
  let removed = 0
  const out = text.replace(/https?:\/\/[^\s<>"')\]]+/gi, m => checkLink(m).ok ? m : (removed++, '[ลิงก์ถูกนำออก]'))
  return { text: out, removedLinks: removed }
}
```

**Postconditions:** `ok` implies the scheme is https, there is no userinfo, and the host is either a strict subdomain of `go.th` (for example `dlt.go.th`), an `OFFICIAL_HOSTS` entry or a `UTILITY_HOSTS` entry. Hosts such as `go.th.evil.com` and `evil-go.th` are rejected because the check uses `.go.th` with the leading dot. `ExternalLink` renders only `safeHref` output, with `target="_blank" rel="noopener noreferrer"`. LLM text is rendered as React text, never as HTML (A05).

### Rate limit (A06, LLM10)

`rateLimit(policy, subject)` builds `key = policy + ':' + subject`. The subject is the session id or `hashIp(ip)`, never a raw IP. It calls `rate_limit_hit(key, windowSec, max)`. If the RPC fails, the function returns `{ ok: false, retryAfterSec: 30 }` (fail closed, A10) and logs `rate_limit_error`. A blocked request returns 429 with `Retry-After` and logs a `rate_limited` event.

### Retention job (N-03)

```typescript
// src/app/api/cron/retention/route.ts
export async function GET(req: Request) {
  requireCronAuth(req)                                   // Bearer CRON_SECRET (Vercel sends it)
  const { data, error } = await createServiceClient().rpc('run_retention')
  if (error) { log.error('retention_failed', { code: error.code }); return new Response(null, { status: 500 }) }
  log.info('retention_done', data)
  return Response.json({ ok: true })
}
```

`run_retention()` is idempotent. Running it twice deletes nothing more the second time.

### Middleware and CSP (A02, A07)

```typescript
export function middleware(req: NextRequest) {
  const nonce = base64(crypto.getRandomValues(new Uint8Array(16)))
  const reqHeaders = new Headers(req.headers); reqHeaders.set('x-nonce', nonce)
  let sid = req.cookies.get(SESSION_COOKIE)?.value
  const isNew = !sid || !isCaseToken(sid)                 // same 22-char format, 128-bit
  if (isNew) { sid = generateCaseToken(); req.cookies.set(SESSION_COOKIE, sid) }
  const res = NextResponse.next({ request: { headers: reqHeaders } })
  if (isNew) res.cookies.set(SESSION_COOKIE, sid!, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
  setSecurityHeaders(res, nonce)
  if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin'))
    return refreshSupabaseAuth(req, res)                  // @supabase/ssr updateSession pattern
  return res
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|og/).*)'] }
```

CSP (one line in production; `{N}` is the nonce, `{SB}` is the Supabase host from `NEXT_PUBLIC_SUPABASE_URL`):

```
default-src 'self';
script-src 'nonce-{N}' 'strict-dynamic' https: 'unsafe-eval' blob:;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com *.google.com *.googleusercontent.com https://*.line-scdn.net;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self' https://{SB} wss://{SB} https://*.googleapis.com *.google.com https://*.gstatic.com https://api.line.me https://*.line-scdn.net data: blob:;
frame-src *.google.com;
worker-src blob:;
frame-ancestors 'none';
base-uri 'none';
object-src 'none';
form-action 'self';
upgrade-insecure-requests
```

The script and worker directives follow Google's [Maps JavaScript API CSP guidance](https://developers.google.com/maps/documentation/javascript/content-security-policy), which lists `'unsafe-eval'` and `blob:` for a nonce-based strict CSP. LIFF SDK and Maps JS load with the nonce, and `'strict-dynamic'` lets them load their own scripts. Styles use `'unsafe-inline'` without a nonce. A nonce in `style-src` would disable `'unsafe-inline'` and block React `style` attributes. Style injection is lower risk than script injection.

Other headers: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` (case tokens in paths do not leak cross-origin), `Permissions-Policy: geolocation=(self), camera=(), microphone=(), payment=(), usb=()`, `Cross-Origin-Opener-Policy: same-origin-allow-popups`.

Nonce CSP makes every page render dynamically. That is acceptable on Vercel for this app. If Next.js is version 16 or later when scaffolded, the file is `src/proxy.ts` with the same logic, and the lead updates `structure.md`.

## Route constants (`src/lib/routes.ts`)

```typescript
export const routes = {
  // 90-landing-seo
  home: '/', about: '/about', privacy: '/privacy', terms: '/terms',
  // 11-chat-triage
  chat: '/chat',
  // 12-office-finder
  plan: (t: CaseToken) => `/plan/${t}`,
  // 13-case-tracker
  case: (t: CaseToken) => `/c/${t}`,
  // 21-line-oa
  lineLink: (t: CaseToken) => `/line/link/${t}`,
  liff: '/line/liff',
  // 22-route-timing
  trip: (t: CaseToken) => `/trip/${t}`,
  // 30-smart-pass
  pass: (t: CaseToken) => `/pass/${t}`,
  // 31-phase2-extras
  wallet: '/wallet',
  // 92-admin-catalog
  admin: '/admin', adminLogin: '/admin/login', adminServices: '/admin/services',
  adminOffices: '/admin/offices', adminReports: '/admin/reports',
  report: '/report',
} as const

export const api = {
  health: '/api/health',
  cronRetention: '/api/cron/retention',
  chat: '/api/chat',
  planJurisdiction: '/api/plan/jurisdiction', planOffices: '/api/plan/offices',
  planGeocode: '/api/plan/geocode', planSelect: '/api/plan/select',
  case: (t: CaseToken) => `/api/case/${t}`,
  caseChecklist: (t: CaseToken) => `/api/case/${t}/checklist`,
  caseIcs: (t: CaseToken) => `/api/case/${t}/ics`,
  lineWebhook: '/api/line/webhook', lineLoginCallback: '/api/line/login/callback',
  lineCronReminders: '/api/line/cron/reminders',
  tripRoutes: '/api/trip/routes', tripDeparture: '/api/trip/departure',
  passCheckout: '/api/pass/checkout', passWebhook: '/api/pass/webhook',
  passCronTraffic: '/api/pass/cron/traffic-recheck',
  walletDocuments: '/api/wallet/documents', walletWaitReport: '/api/wallet/wait-report',
  admin: '/api/admin',
  reportSubmit: '/report/submit',
} as const

export const hotlines = { police: '191', ems: '1669', govCenter: '1111', bma: '1555',
                          dlt: '1584', techCrime: '1441' } as const
```

A slice may add files under its own folders. Any new public route is first added here by the lead.

## Environment variables (`.env.example`)

| Name | Scope | Used by | MVP |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | public | all (absolute links, LINE Flex, ICS) | yes |
| `NEXT_PUBLIC_APP_ENV` | public | shell (`development`/`preview`/`production`) | yes |
| `NEXT_PUBLIC_SUPABASE_URL` | public | lib/db, CSP | yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | lib/db | yes |
| `SUPABASE_SERVICE_ROLE_KEY` | server | lib/db service client | yes |
| `ANTHROPIC_API_KEY` | server | lib/ai | yes |
| `ANTHROPIC_MODEL` | server | lib/ai | yes |
| `LLM_MAX_TOKENS` | server | lib/ai (default 800) | yes |
| `LLM_TIMEOUT_MS` | server | lib/ai (default 15000) | yes |
| `GOOGLE_MAPS_SERVER_KEY` | server | lib/maps (restricted to Routes, Geocoding, Places APIs) | yes |
| `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` | public | 12, 22 (HTTP-referrer restricted; Maps JS + Places only) | yes |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | public | 12, 22 (optional styled map) | no |
| `LINE_CHANNEL_SECRET` | server | lib/security LINE signature, 21 | yes |
| `LINE_CHANNEL_ACCESS_TOKEN` | server | 21 | yes |
| `LINE_LOGIN_CHANNEL_ID` | server | lib/auth/line, 21 | yes |
| `LINE_LOGIN_CHANNEL_SECRET` | server | 21 (login code exchange) | yes |
| `NEXT_PUBLIC_LIFF_ID` | public | 21 | yes |
| `NEXT_PUBLIC_LINE_OA_BASIC_ID` | public | 21 (add-friend link, L-C2) | yes |
| `LINE_PUSH_CAP_PER_CASE` | server | 21 (L-C1, default 6) | yes |
| `CRON_SECRET` | server | lib/security/cron, all cron routes | yes |
| `IP_HASH_SALT` | server | lib/security/hash | yes |
| `PRIVACY_POLICY_VERSION` | server | 21 consents, 90 privacy page | yes |
| `FEATURE_PHASE2` | server | 30, 31 (default `false`, M-05) | yes |
| `PAYMENT_PROVIDER` | server | 30 | no |
| `PAYMENT_PUBLIC_KEY` | public-safe | 30 | no |
| `PAYMENT_SECRET_KEY` | server | 30 | no |
| `PAYMENT_WEBHOOK_SECRET` | server | 30 | no |

`next.config.ts` fails the build if a server variable is referenced from a client component (`server-only` import in every module that reads one). Real values live only in Vercel project settings and local `.env.local` (git-ignored).

## Crons (`vercel.json`)

| Path | Schedule (UTC) | Bangkok time | Owner | Purpose |
| --- | --- | --- | --- | --- |
| `/api/cron/retention` | `0 19 * * *` | 02:00 daily | 00-foundation | N-03 deletion |
| `/api/line/cron/reminders` | `*/5 * * * *` | every 5 min | 21-line-oa | L-02, L-03, N-06 (≤ 5 min drift) |
| `/api/pass/cron/traffic-recheck` | `*/10 22,23,0,1,2 * * *` | every 10 min, 05:00–09:59 | 30-smart-pass | T-08 (Phase 2) |

Vercel Hobby only allows daily crons and fails the deploy otherwise ([Vercel docs](https://vercel.com/docs/cron-jobs/usage-and-pricing)). This design assumes the team uses Vercel Pro. On Hobby, the lead changes the two frequent schedules to daily and adds a Supabase `pg_cron` + `pg_net` job that calls the same routes with `CRON_SECRET`. Routes owned by slices that are not built yet return 404, which is harmless.

## Seed fixtures (`supabase/seed/00_fixtures.sql`)

Minimal rows so every slice runs locally. Every `text_th`/`name_th` starts with `[ตัวอย่าง]`. 91-demo-catalog replaces them with `insert … on conflict (id) do update` in `10_demo_*.sql`, which sorts after `00_`.

- Agencies: `bma-district` (district), `royal-thai-police` (police, 191), `dlt` (dlt, 1584), `tangrat` (gov_app), `traffy-fondue` (city_report).
- Services (canonical IDs for M-02): `police-report-property` (incident_location), `online-fraud-report` (online, `https://thaipoliceonline.go.th`, hotline 1441), `driving-licence-renewal` (any_office), `id-card-new` (any_office), `change-of-address` (house_registration). Each has 2 requirements, one of them conditional (`{"slot":"proxy","op":"eq","value":true}`). `change-of-address` has `last_verified` 120 days before the seed date, so StaleBadge can be tested.
- Service link: `police-report-property → id-card-new`, condition `{"slot":"id_card_lost","op":"eq","value":true}`.
- Offices: `sn-pathumwan` (police, near Siam), `khet-pathumwan` (district), `dlt-bangkok-area-1` (dlt), with weekday 08:30–16:30, lunch 12:00–13:00, and Saturday for the district office.
- Jurisdiction: one `police_area` square polygon around Siam for `sn-pathumwan`, `is_proxy = true`.
- Holidays: two dates in the current year.

Seeds load locally with `supabase db reset`. Production gets migrations through `supabase db push`, and the lead seeds production once with `supabase db push --include-seed` after 91-demo-catalog lands.

## Example usage

```typescript
// A slice API route (e.g. 11-chat-triage) using only shared libs
export async function POST(req: Request) {
  const requestId = crypto.randomUUID()
  try {
    const sessionId = await getSessionId()
    const rl = await rateLimit('chat', sessionId)
    if (!rl.ok) throw new AppError('rate_limited', 429)
    const body = z.object({ text: ChatTextSchema }).parse(await req.json())
    const g = guardInput(body.text)
    if (!g.ok) throw new AppError('bad_request', 400)
    const services = await listServices()
    const stream = streamClaude({
      system: SYSTEM_PROMPT_BASE,
      messages: [{ role: 'user', content: wrapUserText(g.text) }],
      tools: catalogTools(services),
    })
    // ...on tool_use: parseSelectServices(input, new Set(services.map(s => s.id)))
    // ...requirements = (await getRequirements(id, slots)) ; createCase({...}, sessionId)
    // ...stream sanitizeLlmText(chunk).text to the client
  } catch (e) {
    return toSafeResponse(e, requestId)
  }
}

// Rendering a checklist item with N-01
<SourceBadge sourceUrl={req.sourceUrl} lastVerified={req.lastVerified} />
{staleness(req.lastVerified, new Date()).isStale && <StaleBadge />}   // "ควรโทรยืนยัน"
<ExternalLink href={service.onlineChannelUrl}>{service.onlineChannelNameTh}</ExternalLink>
```

## Contracts for slices

Each slice uses only what is listed in its row, plus the UI kit and shell. Write access to private tables always goes through `lib/case` or the service client in the slice's own server code.

| Spec | Tables / columns (R = read, W = write) | RPC / lib functions | Routes, env, cron, events |
| --- | --- | --- | --- |
| 11-chat-triage | R `services.*` (incl. `triage_questions`, `can_complete_online`, `online_channel_*`, `hotline`, `source_url`, `last_verified`), `service_requirements.*`, `service_links.*`, `agencies.hotline`. W `cases` + `case_checklist_items` via `createCase`; `cases.slot_answers`, `parent_case_id` | `listServices`, `getServicesByIds`, `getRequirements`, `getServiceLinks`, `evaluateCondition`, `staleness`, all `lib/ai`, `guardInput`, `rateLimit('chat'/'chat_ip')`, `hashIp`, `createCase`, `updateCase`, `trackEvent`, `toSafeResponse` | `routes.chat`, `api.chat`, links to `routes.plan(t)`, `routes.case(t)`, `hotlines`; env `ANTHROPIC_*`, `LLM_*`; events `chat_started`, `services_selected`, `low_confidence`, `emergency_shown`, `online_resolved`, `plan_ready`, `llm_call`; components `ChoiceButtons`, `SourceBadge`, `StaleBadge`, `EmergencyBar`, `ExternalLink` |
| 12-office-finder | R `offices.*`, `jurisdictions` via RPC, `holidays.*`, `services.office_rule`, `agencies.kind`. W `cases.office_id`, `incident_point`, `origin_point`, `travel_mode` via `updateCase` | `findJurisdiction` (`find_jurisdiction`), `getOffice`, `listOfficesByAgency`, `listHolidays`, `openingRangesOn`, `geocodeBangkok`, `placeDetails`, `computeRouteMatrix`, `directionsUrl`, `LatLngSchema`, `rateLimit('plan'/'maps')` | `routes.plan(t)`, `api.plan*`; env `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`; dep `@googlemaps/js-api-loader`; events `office_selected`, `maps_fallback` |
| 13-case-tracker | R `cases.*`, `case_checklist_items`, `offices.*`. W `case_checklist_items.checked`, `cases.appointment_at`, `status`, `saved_minutes` | `getCaseByToken`, `listChecklist`, `setChecklistItem`, `updateCase`, `canTransition`, `getOffice`, `directionsUrl`, `rateLimit('case_write')` | `routes.case(t)`, `api.case*`, `api.caseIcs(t)` (ICS written by hand, RFC 5545), links to `routes.lineLink(t)`, `routes.trip(t)`; events `case_viewed`, `calendar_added`, `case_status_changed` |
| 20-journeys-e2e | R `events` (K-01: `chat_started` → `plan_ready` per session), fixture IDs from `00_fixtures.sql` and demo IDs from 91 | `api.health` | all `routes`/`api` constants; dep `@playwright/test`; runs against `NEXT_PUBLIC_SITE_URL` |
| 21-line-oa | R/W `line_users.*`, `consents.*`, `reminders.*`, `document_expiries` (L-03 if used), `cases.line_user_id`, `status`, `push_count`, `depart_at`, `appointment_at`, `document_expires_on` | `verifyLineSignature`, `verifyLineIdToken`, `bindLineUser`, `getCaseByToken`, `updateCase`, `canTransition`, `delete_line_user_data` (L-09), `requireCronAuth`, `rateLimit('line_login')`, `directionsUrl`, `maskPii` (L-07), `streamClaude` | `routes.lineLink(t)`, `routes.liff`, `api.lineWebhook`, `api.lineLoginCallback`, `api.lineCronReminders` (cron `*/5`); env `LINE_*`, `NEXT_PUBLIC_LIFF_ID`, `NEXT_PUBLIC_LINE_OA_BASIC_ID`, `LINE_PUSH_CAP_PER_CASE`, `PRIVACY_POLICY_VERSION`; dep `@line/bot-sdk`, `qrcode`; events `line_linked`, `push_sent`, `survey_answered` |
| 22-route-timing | R `offices.location`, `opening_hours`, `cases.office_id`, `origin_point`, `appointment_at`, `parent_case_id`. W `cases.depart_at`, `travel_mode`, `origin_point` | `computeRoute` (`trafficAware` opt-in, T-C1), `computeRouteMatrix`, `openingRangesOn`, `listHolidays`, `directionsUrl`, `getCaseByToken`, `updateCase`, `rateLimit('maps')` | `routes.trip(t)`, `api.trip*`; env `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY`; events `maps_fallback` |
| 30-smart-pass | R/W `payments`, `pass_ledger`, `cases.smart_mode`, `reminders` (`traffic_recheck`) | `getCaseByToken`, `updateCase`, `computeRoute(trafficAware: true)`, `requireCronAuth`, `checkLink` | `routes.pass(t)`, `api.pass*`, cron `traffic-recheck`; env `PAYMENT_*`, `FEATURE_PHASE2` |
| 31-phase2-extras | R/W `document_expiries`, `wait_reports`, R `offices` | `getOffice`, `rateLimit('case_write')` | `routes.wallet`, `api.wallet*`; env `FEATURE_PHASE2`. P2-02 family tables need a wave-3 lead migration |
| 90-landing-seo | none | `safeHref`, `hotlines` | `routes.home/about/privacy/terms`; owns `(marketing)/page.tsx` placeholder after wave 0; env `NEXT_PUBLIC_SITE_URL`, `PRIVACY_POLICY_VERSION` |
| 91-demo-catalog | W (seed only) every column of `agencies`, `offices`, `jurisdictions` (`is_proxy` for D-14), `services` (incl. `triage_questions` JSON matching `TriageQuestionSchema`), `service_requirements` (`condition` matching `ConditionSchema`), `service_links`, `holidays` | upsert keys: `id` for slug tables, `(date, name_th)` for holidays; validation script may import `src/lib/security/schemas.ts` | files `supabase/seed/10_demo_*.sql`, `data/catalog/**`; keep the 5 canonical service IDs |
| 92-admin-catalog | R/W all catalog tables via service client after `requireAdmin`; R/W `catalog_reports.status`, `admin_note`, `resolved_at`; W `catalog_reports` (public report, masked); R `events` (K-02 `online_resolved`, K-04 `line_linked`) | `requireAdmin`, `createServiceClient`, `*InputSchema`, `OfficialUrlSchema`, `maskPii`, `rateLimit('report'/'admin')`, `staleness` | `routes.admin*`, `routes.report`, `api.admin`, `api.reportSubmit`; events `catalog_report` |
| 93-docs-pitch | none | none | reads this design for the OWASP slide (X-03); ZAP baseline target is the production `NEXT_PUBLIC_SITE_URL` |

Pre-installed dependencies (in `package.json`, shared): `next`, `react`, `react-dom`, `typescript`, `tailwindcss`, `@tailwindcss/postcss`, `zod`, `@supabase/supabase-js`, `@supabase/ssr`, `@anthropic-ai/sdk`, `@line/bot-sdk`, `@googlemaps/js-api-loader`, `qrcode`, `server-only`; dev: `vitest`, `fast-check`, `@playwright/test`, `supabase`, `@types/qrcode`, `eslint`, `prettier`.

## Correctness Properties

Tests use Vitest + fast-check (`*.test.ts` next to the code). Database checks run against local Supabase (`supabase start`).

### Property 1: PII masking removes all identifiers

For any string `s` with any number of inserted 13-digit IDs, Thai phone numbers (`0XXXXXXXXX`, `+66…`), 10–12 digit account numbers, 16-digit card numbers, emails or decimal coordinate pairs, written with Arabic or Thai digits and optional single spaces/hyphens: `maskPii(s).masked` has no match for `DIGIT_RUN`, `EMAIL` or `COORDS`.

**Validates: Requirements N-04, LLM02, T-C3**

### Property 2: PII masking is idempotent

`maskPii` is idempotent: `mask(mask(s)) === mask(s)`.

**Validates: Requirements N-04**

### Property 3: PII masking preserves non-PII text and hotlines

For any string without digits, Thai digits or `@`, `maskPii(s).masked === s`. Hotlines 191, 1669, 1441, 1111, 1555, 1584 survive masking inside any text.

**Validates: Requirements N-04, N-02**

### Property 4: Logs are PII-free

For any log call with arbitrary string fields containing PII from Property 1's generator, the emitted log line has no match for `DIGIT_RUN`/`EMAIL`/`COORDS`, and denylisted keys (`lat`, `lng`, `text`, `message`, `lineUserId`, `token`) are absent.

**Validates: Requirements A09, N-04**

### Property 5: Link allowlist accepts only official or utility hosts

For any URL: `checkLink(u).ok` iff the scheme is https, there is no userinfo, the port is empty or 443, the host is not an IP, and the normalized host ends with `.go.th` (with something before it) or is in `OFFICIAL_HOSTS ∪ UTILITY_HOSTS`. Generated attacks (`go.th.evil.com`, `evil-go.th`, `https://go.th@evil.com`, `http://x.go.th`, mixed case, trailing dot, IDN look-alikes) are rejected unless they satisfy the rule.

**Validates: Requirements N-05, LLM05**

### Property 6: LLM output keeps only allowlisted links

For any LLM text, every URL left in `sanitizeLlmText(t).text` passes `checkLink`, and `removedLinks` equals the number of URLs that failed.

**Validates: Requirements LLM05, N-05**

### Property 7: Case token format and entropy

`generateCaseToken()` always matches `^[A-Za-z0-9_-]{22}$` and decodes to 16 bytes. 100,000 generated tokens are pairwise distinct. `hashToken` is deterministic and returns 32 bytes.

**Validates: Requirements A01, A04**

### Property 8: Unknown or malformed tokens find no case

For any random well-formed token not created by `createCase`, `getCaseByToken` returns `null`. For any malformed string, it returns `null` without a DB call.

**Validates: Requirements A01**

### Property 9: Staleness threshold is 90 days

For any `lastVerified` and `now`: `staleness().isStale` iff whole days between them in Asia/Bangkok `> 90`. Day 90 is not stale; day 91 is stale.

**Validates: Requirements N-01**

### Property 10: RLS isolates private tables

With the anon key, and with an authenticated non-admin user, for every private table (sessions, line_users, cases, case_checklist_items, consents, document_expiries, reminders, catalog_reports, events, rate_limits, wait_reports, payments, pass_ledger): select returns 0 rows or a permission error, and any generated insert/update/delete fails. Calling any function except `find_jurisdiction` fails.

**Validates: Requirements A01, A02, N-03**

### Property 11: Unpublished catalog rows are invisible and catalog is read-only

With the anon key, for any catalog row with `is_published = false` (or `is_active = false` for requirements), selects never return it, and `find_jurisdiction` never returns its office. Any write to a catalog table fails.

**Validates: Requirements A01, N-02**

### Property 12: RLS is enabled on every table

Every table in `public` has `relrowsecurity = true` (query `pg_class`).

**Validates: Requirements A01, A02**

### Property 13: Case status follows the D-10 state machine

For any sequence of status updates applied to a case, the DB accepts an update iff `canTransition(from, to)` is true, and `CASE_TRANSITIONS` equals the SQL `case_transition_allowed` table for all 36 pairs. `done` and `cancelled` have no outgoing edges.

**Validates: Requirements D-10**

### Property 14: Case expiry and retention

For any case after any sequence of writes: `expires_at >= greatest(created_at, completed_at, appointment_at, max pending reminder send_at) + 30 days`. After `run_retention()`, no case with `expires_at < now()` exists, all cases with `expires_at >= now()` remain, and their checklist items and reminders are deleted with them.

**Validates: Requirements N-03, T-C3**

### Property 15: Rate limit admits at most max per window

For any `n` calls to `rateLimit(p, subject)` inside one window, exactly `min(n, max)` return `ok`. Different subjects never affect each other.

**Validates: Requirements A06, LLM10, N-09**

### Property 16: AI tools are read-only and catalog-bound

Every tool returned by `catalogTools` has a name in `READ_ONLY_TOOL_NAMES`. For any input, `parseSelectServices(input, ids)` returns `ok` only if every returned id is in `ids`, the count is 1–5, and confidence is `high` or `low`.

**Validates: Requirements LLM06, N-02, LLM09**

### Property 17: User text is wrapped in exactly one delimiter pair

For any user text, `wrapUserText` output has exactly one opening and one closing `user_message` tag, at its start and end.

**Validates: Requirements LLM01**

### Property 18: System prompt holds no secrets

`SYSTEM_PROMPT_BASE` contains no value of any server env var and no substring matching key patterns (`sk-`, `eyJ`, 32+ hex chars).

**Validates: Requirements LLM07, A02**

### Property 19: Safe errors never leak details

For any thrown value (Error, string, object with `stack`/`message`, AppError), `toSafeResponse` returns a body whose keys are only `error`, `message`, `requestId`, and the original message/stack is not in it.

**Validates: Requirements A10**

### Property 20: LINE signature verification

For any body and secret, `verifyLineSignature(body, hmac(body, secret), secret)` is true. Any single-byte change to the body or the signature, or a missing header, gives false.

**Validates: Requirements A08**

### Property 21: Jurisdiction lookup by point

For any point generated inside the fixture polygon, `find_jurisdiction(..., 'police_area')` returns `sn-pathumwan` with `covers = true` first. For any point outside the Bangkok bbox, it returns no rows.

**Validates: Requirements D-03, M-01**

### Property 22: Requirement selection follows conditions

For any requirements and slot answers, `getRequirements(serviceId, slots)` returns exactly the active requirements where `evaluateCondition(condition, slots)` is true, ordered by `sort_order`. `create_case_with_checklist` rejects any requirement id outside the selected services.

**Validates: Requirements D-05, N-02**

### Property 23: Locations outside Bangkok are rejected

For any `LatLng` outside lat 13.45–14.00 / lng 100.30–100.98, `LatLngSchema` rejects it.

**Validates: Requirements M-01**

### Property 24: Security headers and session cookie on every response

Every response from the middleware matcher has the CSP with a fresh nonce (two requests never share one), HSTS, `X-Frame-Options: DENY` and `nosniff`. A first visit gets a `bf_sid` cookie with `HttpOnly; Secure; SameSite=Lax`.

**Validates: Requirements A02, A07**

## Error Handling

| Scenario | Condition | Response | Recovery |
| --- | --- | --- | --- |
| Invalid input | zod parse fails | 400 `bad_request`, generic Thai message | User retries; nothing stored |
| Rate limited | `rate_limit_hit` returns `allowed = false` | 429 + `Retry-After`, `rate_limited` event | Next window |
| Rate limiter down | RPC error | Fail closed: 429 with 30 s retry | Logged `rate_limit_error` |
| Claude timeout/error | Abort or 5xx | `upstream_unavailable`; slice shows hotlines (W-13 owned by 11) | User retries; no partial case |
| LLM returns unknown serviceId | `parseSelectServices` not ok | Treated as low confidence | Slice asks a clarifying question |
| Maps timeout/quota | `MapsResult.ok = false` | Slice shows address, phone, nearest station + `directionsUrl` (T-10 owned by 12) | Logged `maps_fallback` |
| Invalid status transition | Trigger raises `P0001` | 409 `invalid_transition` | Client refreshes the case |
| Unknown service/requirement id | `P0002`/`P0003` | 400 `bad_request` | None needed |
| Bad cron auth | Missing/wrong bearer | 401, no body | None |
| Bad LINE signature | `verifyLineSignature` false | 401, log `line_signature_fail` | None |
| Unhandled error | Anything else | 500 `internal` + requestId, no stack | Logged with requestId only |
| Health check DB down | select 1 fails | `/api/health` → 503 `{ ok: false, db: 'down' }` | Vercel/monitor alert |

## Testing Strategy

### Unit testing
Vitest for pure functions: `maskPii`, `checkLink`, `sanitizeLlmText`, `wrapUserText`, `staleness`, `evaluateCondition`, `openingRangesOn` (holiday, Saturday, lunch break), `canTransition`, `generateCaseToken`, `toSafeResponse`, `verifyLineSignature`, Maps field-mask and URL builders.

### Property-based testing
**Property Test Library:** fast-check. Properties 1–9, 13 (TS side), 15–20 and 22–23 run in `vitest --run`. Properties 10–14, 21 and 22 (SQL side) run in `vitest --run --project db` against local Supabase, using a generated anon client and service client. Each property runs at least 200 cases. PII generators produce Thai and Arabic digits and random separators.

### Integration testing
- Migration test: `supabase db reset` applies all migrations and seeds with no error, and Property 12 passes.
- `/api/health` returns 200 on the preview deploy.
- Header test (Property 24) against `next start`.
- Security pass before freeze: `npm audit --omit=dev`, OWASP ZAP baseline against production (result used by 93-docs-pitch).

## Performance Considerations

- `listServices` is cached for 300 s with Next `unstable_cache` (tag `catalog`). 92-admin-catalog calls `revalidateTag('catalog')` after writes. This supports N-09.
- Claude responses stream, so the first token arrives within N-06's 3 s target. `max_tokens` and the 1,000-character input cap bound cost (LLM10).
- GIST indexes on `offices.location`, `jurisdictions.area` and `area::geography` keep `find_jurisdiction` to an index scan.
- `reminders_due_idx` is partial on `pending`, so the 5-minute cron scans only due rows.
- Rate-limit rows are pruned daily.

## Security Considerations

- Secrets: Claude, LINE, service role, Maps server key, cron secret and salt are server-only and imported only from modules that `import 'server-only'`. The Maps browser key is restricted by HTTP referrer to the production and preview domains, and by API to Maps JS + Places (A02).
- No password system. Admins use Supabase Auth magic link plus the `admin_users` allowlist. LINE users are verified by ID token on the server (A07).
- Session and case tokens are 128-bit CSPRNG values. Only their SHA-256 hashes are stored (A01, A04).
- The server never fetches a URL supplied by a user. Maps calls use fixed Google hosts (A01 SSRF).
- No `dangerouslySetInnerHTML` anywhere. ESLint rule `react/no-danger` is set to error (A05).
- Lockfile committed, small dependency list, `npm audit` in the security pass (A03).
- The shell shows "ไม่ใช่เว็บไซต์ราชการ · ไม่ใช่ช่องทางรับแจ้งความ" on every page. The footer states the service never asks for money, passwords or bank numbers. The brand name must not imitate an agency (RK-04, N-05).
- PDPA: no ID numbers, document photos or chat transcripts are stored. Home coordinates stay on the case row and are deleted with it (N-03, T-C3).

## Dependencies

- Supabase cloud project (region `ap-southeast-1`), with PostGIS and pgcrypto enabled.
- Vercel project linked to the repo. Production and Preview env vars are set. Pro plan is assumed for crons (see Crons).
- Anthropic API key. Google Cloud project with Routes, Geocoding, Places (New) and Maps JavaScript APIs enabled, quotas and a budget alert set (T-C2).
- LINE Developers: one Messaging API channel and one LINE Login channel with a LIFF app.
- Deploy steps: `supabase link` → `supabase db push` → set Vercel env → `vercel --prod` → check `/api/health` → insert the first `admin_users` row.

## Open decisions

- OQ-05: retention for anonymous cases is fixed at 30 days after the last activity until the team decides.
- D-10 has no edge from `planned` to `done`. Online-only cases (J1b) stay `planned` until they expire, unless the team adds that edge. Adding it is a lead migration plus a `CASE_TRANSITIONS` change.
- Vercel plan tier: Pro assumed. See the Hobby fallback under Crons.
