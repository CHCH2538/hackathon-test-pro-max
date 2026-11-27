create table public.catalog_reports (
  id             uuid primary key default gen_random_uuid(),
  service_id     public.slug references public.services(id) on delete set null,
  requirement_id uuid references public.service_requirements(id) on delete set null,
  office_id      public.slug references public.offices(id) on delete set null,
  message_th     text not null check (length(message_th) between 1 and 1000),
  status         public.report_status not null default 'open',
  admin_note     text check (length(admin_note) <= 1000),
  created_at     timestamptz not null default now(),
  resolved_at    timestamptz,
  constraint catalog_reports_resolved_ck check ((status in ('open','accepted')) = (resolved_at is null))
);
create index catalog_reports_status_idx on public.catalog_reports (status, created_at desc);

create table public.catalog_review_log (
  id             bigint generated always as identity primary key,
  entity_table   text not null check (entity_table in ('agencies','offices','jurisdictions','services',
                   'service_requirements','service_links','holidays')),
  entity_id      text not null check (length(entity_id) between 1 and 64),
  action         public.review_action not null,
  changed_fields text[] not null default '{}',
  note           text check (length(note) <= 500),
  reviewed_by    text not null check (length(reviewed_by) between 1 and 64),
  reviewed_at    timestamptz not null default now()
);
create index catalog_review_log_entity_idx on public.catalog_review_log (entity_table, entity_id, reviewed_at desc);

create table public.events (
  id         bigint generated always as identity primary key,
  name       text not null check (name ~ '^[a-z][a-z0-9_]{1,47}$'),
  session_id uuid references public.sessions(id) on delete set null,
  case_id    uuid references public.cases(id) on delete set null,
  props      jsonb not null default '{}' check (jsonb_typeof(props) = 'object' and pg_column_size(props) <= 2048),
  created_at timestamptz not null default now()
);
create index events_name_time_idx on public.events (name, created_at);
create index events_session_idx on public.events (session_id, created_at);
create index events_case_idx on public.events (case_id);

create table public.survey_responses (
  id          uuid primary key default gen_random_uuid(),
  case_id     uuid references public.cases(id) on delete set null,
  service_id  public.slug,
  trips_saved smallint not null check (trips_saved between 0 and 10),
  created_at  timestamptz not null default now()
);

create table public.rate_limits (
  key          text primary key check (length(key) between 1 and 200),
  window_start timestamptz not null,
  hits         integer not null check (hits >= 0)
);

create table public.cache_entries (
  key        text primary key check (length(key) between 1 and 200),
  value      jsonb not null,
  expires_at timestamptz not null
);
create index cache_entries_expires_idx on public.cache_entries (expires_at);
