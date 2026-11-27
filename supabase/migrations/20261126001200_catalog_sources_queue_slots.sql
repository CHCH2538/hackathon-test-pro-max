create table public.catalog_sources (
  id           uuid primary key default gen_random_uuid(),
  service_id   public.slug references public.services(id) on delete set null,
  agency_id    public.slug references public.agencies(id) on delete set null,
  title_th     text not null check (length(title_th) between 1 and 300),
  source_url   public.https_url not null,
  excerpt_th   text not null check (length(excerpt_th) between 1 and 20000),
  retrieved_on date not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index catalog_sources_service_idx on public.catalog_sources (service_id);
create index catalog_sources_agency_idx on public.catalog_sources (agency_id);

create table public.office_queue_slots (
  id         uuid primary key default gen_random_uuid(),
  office_id  public.slug not null references public.offices(id) on delete cascade,
  service_id public.slug references public.services(id) on delete cascade,
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  available  smallint check (available >= 0),
  source     text not null check (source ~ '^[a-z0-9_]{1,32}$'),
  fetched_at timestamptz not null default now(),
  constraint office_queue_slots_range_ck check (ends_at > starts_at),
  constraint office_queue_slots_unique unique nulls not distinct (office_id, service_id, starts_at, source)
);
create index office_queue_slots_office_idx on public.office_queue_slots (office_id, starts_at);

create trigger catalog_sources_updated_at before update on public.catalog_sources
  for each row execute function public.set_updated_at();

do $$
declare t text;
begin
  foreach t in array array['catalog_sources','office_queue_slots'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I as restrictive for all to anon, authenticated using (false) with check (false)',
                   t || '_deny_clients', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;
