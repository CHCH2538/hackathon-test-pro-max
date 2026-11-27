create table public.cases (
  id                 uuid primary key default gen_random_uuid(),
  token_hash         bytea not null unique check (octet_length(token_hash) = 32),
  session_id         uuid references public.sessions(id) on delete set null,
  line_user_id       uuid references public.line_users(id) on delete cascade,
  family_link_id     uuid references public.family_links(id) on delete set null,
  parent_case_id     uuid references public.cases(id) on delete set null,
  service_ids        public.slug[] not null check (cardinality(service_ids) between 1 and 5),
  slot_answers       jsonb not null default '{}' check (jsonb_typeof(slot_answers) = 'object'),
  online_only        boolean not null default false,
  office_id          public.slug references public.offices(id) on delete set null,
  incident_point     extensions.geography(Point, 4326),
  incident_confirmed boolean not null default false,
  appointment_at     timestamptz,
  depart_at          timestamptz,
  status             public.case_status not null default 'planned',
  mode               public.case_mode not null default 'free',
  smart_activated_at timestamptz,
  push_count         smallint not null default 0 check (push_count >= 0),
  push_cap           smallint not null default 3 check (push_cap between 0 and 50),
  reminders_muted    boolean not null default false,
  time_saved_min     integer check (time_saved_min between 0 and 10000),
  locale             text not null default 'th' check (locale in ('th','en','my','km')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  closed_at          timestamptz,
  expires_at         timestamptz not null default now() + interval '30 days',
  constraint cases_not_own_parent check (parent_case_id is null or parent_case_id <> id),
  constraint cases_appointment_ck check (status not in ('booked','due') or appointment_at is not null),
  constraint cases_push_ck check (push_count <= push_cap),
  constraint cases_closed_ck check ((status in ('done','cancelled')) = (closed_at is not null)),
  constraint cases_smart_ck check (mode = 'free' or smart_activated_at is not null)
);
create index cases_session_idx on public.cases (session_id);
create index cases_line_user_idx on public.cases (line_user_id);
create index cases_parent_idx on public.cases (parent_case_id);
create index cases_expires_idx on public.cases (expires_at);
create index cases_booked_idx on public.cases (appointment_at) where status in ('booked','due');

create table public.case_checklist_items (
  id                 uuid primary key default gen_random_uuid(),
  case_id            uuid not null references public.cases(id) on delete cascade,
  requirement_id     uuid references public.service_requirements(id) on delete set null,
  service_id         public.slug not null,
  kind               public.requirement_kind not null,
  text_th            text not null check (length(text_th) between 1 and 500),
  condition_label_th text check (length(condition_label_th) <= 120),
  condition_status   public.condition_status not null default 'always',
  source_url         public.https_url not null,
  last_verified      date not null,
  sort_order         smallint not null default 0,
  checked            boolean not null default false,
  checked_at         timestamptz,
  created_at         timestamptz not null default now(),
  constraint checklist_unique unique (case_id, requirement_id)
);
create index checklist_case_idx on public.case_checklist_items (case_id, sort_order);

create table public.case_origins (
  case_id    uuid primary key references public.cases(id) on delete cascade,
  point      extensions.geography(Point, 4326) not null,
  source     public.origin_source not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
