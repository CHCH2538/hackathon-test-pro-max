create table public.document_expiries (
  id             uuid primary key default gen_random_uuid(),
  line_user_id   uuid not null references public.line_users(id) on delete cascade,
  family_link_id uuid references public.family_links(id) on delete cascade,
  doc_type       public.doc_type not null,
  expires_on     date not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint document_expiries_unique unique nulls not distinct (line_user_id, family_link_id, doc_type)
);

create table public.reminders (
  id                 uuid primary key default gen_random_uuid(),
  case_id            uuid references public.cases(id) on delete cascade,
  document_expiry_id uuid references public.document_expiries(id) on delete cascade,
  kind               public.reminder_kind not null,
  send_at            timestamptz not null,
  status             public.reminder_status not null default 'pending',
  attempts           smallint not null default 0 check (attempts between 0 and 10),
  sent_at            timestamptz,
  last_error         text check (length(last_error) <= 200),
  dedupe_key         text not null unique check (length(dedupe_key) between 1 and 200),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint reminders_target_ck check (num_nonnulls(case_id, document_expiry_id) = 1),
  constraint reminders_sent_ck check ((status = 'sent') = (sent_at is not null))
);
create index reminders_due_idx on public.reminders (send_at) where status = 'pending';
create index reminders_case_idx on public.reminders (case_id);
create index reminders_expiry_idx on public.reminders (document_expiry_id);

create table public.line_push_usage (
  month      date primary key check (extract(day from month) = 1),
  push_count integer not null default 0 check (push_count >= 0)
);

create table public.line_webhook_events (
  event_id    text primary key check (length(event_id) between 1 and 64),
  received_at timestamptz not null default now()
);

create table public.line_link_states (
  state_hash bytea primary key check (octet_length(state_hash) = 32),
  nonce_hash bytea not null check (octet_length(nonce_hash) = 32),
  case_id    uuid not null references public.cases(id) on delete cascade,
  expires_at timestamptz not null default now() + interval '10 minutes'
);
