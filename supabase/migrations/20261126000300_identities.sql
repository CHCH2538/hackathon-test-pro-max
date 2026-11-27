create table public.sessions (
  id           uuid primary key default gen_random_uuid(),
  token_hash   bytea not null unique check (octet_length(token_hash) = 32),
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
create index sessions_last_seen_idx on public.sessions (last_seen_at);

create table public.line_users (
  id                 uuid primary key default gen_random_uuid(),
  line_uid           text not null unique check (line_uid ~ '^U[0-9a-f]{32}$'),
  is_friend          boolean not null default false,
  reminder_frequency public.reminder_frequency not null default 'all',
  locale             text not null default 'th' check (locale in ('th','en','my','km')),
  free_smart_used_at timestamptz,
  created_at         timestamptz not null default now(),
  last_seen_at       timestamptz not null default now(),
  blocked_at         timestamptz
);

create table public.consents (
  id             uuid primary key default gen_random_uuid(),
  line_user_id   uuid not null references public.line_users(id) on delete cascade,
  purpose        public.consent_purpose not null,
  policy_version text not null check (length(policy_version) between 1 and 32),
  granted_at     timestamptz not null default now(),
  revoked_at     timestamptz,
  constraint consents_unique unique (line_user_id, purpose, policy_version)
);

create table public.family_links (
  id                  uuid primary key default gen_random_uuid(),
  carer_line_user_id  uuid not null references public.line_users(id) on delete cascade,
  member_line_user_id uuid references public.line_users(id) on delete set null,
  member_label_th     text not null check (length(member_label_th) between 1 and 40),
  status              public.family_status not null default 'pending',
  invite_token_hash   bytea unique check (octet_length(invite_token_hash) = 32),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint family_links_not_self check (member_line_user_id is null or member_line_user_id <> carer_line_user_id)
);
create index family_links_carer_idx on public.family_links (carer_line_user_id);
