create table public.pass_products (
  id           public.slug primary key,
  name_th      text not null check (length(name_th) between 1 and 120),
  passes       smallint not null check (passes between 1 and 20),
  price_satang integer not null check (price_satang >= 0),
  valid_months smallint not null default 12 check (valid_months between 1 and 36),
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create table public.payments (
  id            uuid primary key default gen_random_uuid(),
  line_user_id  uuid references public.line_users(id) on delete set null,
  product_id    public.slug not null references public.pass_products(id) on delete restrict,
  provider      text not null check (provider ~ '^[a-z0-9_]{2,32}$'),
  provider_ref  text not null unique check (length(provider_ref) between 1 and 128),
  amount_satang integer not null check (amount_satang >= 0),
  currency      char(3) not null default 'THB',
  status        public.payment_status not null default 'pending',
  receipt_url   public.https_url,
  created_at    timestamptz not null default now(),
  paid_at       timestamptz,
  refunded_at   timestamptz
);
create index payments_user_idx on public.payments (line_user_id);

create table public.payment_webhook_events (
  event_id    text primary key check (length(event_id) between 1 and 128),
  provider    text not null,
  received_at timestamptz not null default now()
);

create table public.pass_wallets (
  id           uuid primary key default gen_random_uuid(),
  line_user_id uuid not null unique references public.line_users(id) on delete cascade,
  created_at   timestamptz not null default now()
);

create table public.sponsor_codes (
  code_hash       bytea primary key check (octet_length(code_hash) = 32),
  sponsor_name    text not null check (length(sponsor_name) between 1 and 120),
  passes_per_code smallint not null check (passes_per_code between 1 and 10),
  max_redemptions integer not null check (max_redemptions > 0),
  redeemed_count  integer not null default 0,
  expires_at      timestamptz not null,
  created_at      timestamptz not null default now(),
  constraint sponsor_codes_cap check (redeemed_count between 0 and max_redemptions)
);

create table public.pass_ledger (
  id                    bigint generated always as identity primary key,
  wallet_id             uuid not null references public.pass_wallets(id) on delete cascade,
  delta                 smallint not null check (delta <> 0),
  reason                public.ledger_reason not null,
  case_id               uuid references public.cases(id) on delete set null,
  payment_id            uuid references public.payments(id) on delete set null,
  counterpart_wallet_id uuid references public.pass_wallets(id) on delete set null,
  sponsor_code_hash     bytea references public.sponsor_codes(code_hash) on delete set null,
  expires_at            timestamptz,
  created_at            timestamptz not null default now(),
  constraint pass_ledger_sign_ck check ((delta > 0) = (reason in ('purchase','refund','transfer_in','sponsor','free_first'))),
  constraint pass_ledger_expiry_ck check (delta < 0 or expires_at is not null)
);
create index pass_ledger_wallet_idx on public.pass_ledger (wallet_id, created_at);

create table public.sponsor_redemptions (
  id          uuid primary key default gen_random_uuid(),
  code_hash   bytea not null references public.sponsor_codes(code_hash) on delete cascade,
  wallet_id   uuid references public.pass_wallets(id) on delete set null,
  redeemed_at timestamptz not null default now()
);
create index sponsor_redemptions_code_idx on public.sponsor_redemptions (code_hash);

create table public.wait_reports (
  id         uuid primary key default gen_random_uuid(),
  office_id  public.slug not null references public.offices(id) on delete cascade,
  service_id public.slug references public.services(id) on delete set null,
  visited_on date not null,
  day_part   public.day_part not null,
  wait_min   smallint not null check (wait_min between 0 and 600),
  created_at timestamptz not null default now()
);
create index wait_reports_office_idx on public.wait_reports (office_id, visited_on);
