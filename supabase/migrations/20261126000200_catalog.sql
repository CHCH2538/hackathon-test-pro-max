create table public.agencies (
  id           public.slug primary key,
  name_th      text not null check (length(name_th) between 1 and 200),
  kind         public.agency_kind not null,
  hotline      public.hotline,
  website_url  public.https_url,
  published    boolean not null default true,
  i18n         public.i18n_map,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.offices (
  id                 public.slug primary key,
  agency_id          public.slug not null references public.agencies(id) on delete restrict,
  name_th            text not null check (length(name_th) between 1 and 200),
  location           extensions.geography(Point, 4326) not null,
  address_th         text not null check (length(address_th) between 1 and 500),
  phone              text check (phone ~ '^[0-9+][0-9 -]{2,19}$'),
  opening_hours      jsonb not null check (jsonb_typeof(opening_hours) = 'object'),
  nearest_station_th text check (length(nearest_station_th) <= 120),
  booking_url        public.https_url,
  google_place_id    text check (length(google_place_id) <= 256),
  source_url         public.https_url not null,
  last_verified      date not null,
  published          boolean not null default true,
  i18n               public.i18n_map,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index offices_agency_idx on public.offices (agency_id);
create index offices_location_gix on public.offices using gist (location);

create table public.jurisdictions (
  id            uuid primary key default gen_random_uuid(),
  office_id     public.slug not null references public.offices(id) on delete cascade,
  kind          public.jurisdiction_kind not null,
  area          extensions.geometry(MultiPolygon, 4326) not null check (extensions.st_isvalid(area)),
  is_proxy      boolean not null default false,
  source_url    public.https_url not null,
  last_verified date not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index jurisdictions_area_gix on public.jurisdictions using gist (area);
create index jurisdictions_office_idx on public.jurisdictions (office_id, kind);

create table public.services (
  id                     public.slug primary key,
  agency_id              public.slug not null references public.agencies(id) on delete restrict,
  name_th                text not null check (length(name_th) between 1 and 200),
  synonyms               text[] not null default '{}' check (cardinality(synonyms) <= 50),
  example_phrases        text[] not null default '{}' check (cardinality(example_phrases) <= 50),
  office_rule            public.office_rule not null,
  can_complete_online    boolean not null default false,
  online_channel_name_th text check (length(online_channel_name_th) <= 200),
  online_channel_url     public.https_url,
  fee_thb                numeric(10,2) check (fee_thb >= 0),
  fee_note_th            text check (length(fee_note_th) <= 300),
  duration_min           integer check (duration_min between 0 and 1440),
  hotline                public.hotline,
  triage_questions       jsonb not null default '[]'
                         check (jsonb_typeof(triage_questions) = 'array' and jsonb_array_length(triage_questions) <= 8),
  source_url             public.https_url not null,
  last_verified          date not null,
  published              boolean not null default false,
  i18n                   public.i18n_map,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint services_online_channel_ck check (not can_complete_online or online_channel_url is not null)
);
create index services_agency_idx on public.services (agency_id);

create table public.service_requirements (
  id                 uuid primary key default gen_random_uuid(),
  service_id         public.slug not null references public.services(id) on delete cascade,
  kind               public.requirement_kind not null,
  text_th            text not null check (length(text_th) between 1 and 500),
  condition          jsonb check (condition is null or jsonb_typeof(condition) = 'object'),
  condition_label_th text check (length(condition_label_th) <= 120),
  copy_type          public.copy_type not null default 'not_applicable',
  copies             smallint check (copies between 1 and 10),
  sort_order         smallint not null default 0,
  active             boolean not null default true,
  i18n               public.i18n_map,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index service_requirements_service_idx on public.service_requirements (service_id, sort_order);

create table public.service_links (
  id                 uuid primary key default gen_random_uuid(),
  from_service_id    public.slug not null references public.services(id) on delete cascade,
  to_service_id      public.slug not null references public.services(id) on delete cascade,
  condition          jsonb check (condition is null or jsonb_typeof(condition) = 'object'),
  condition_label_th text check (length(condition_label_th) <= 120),
  sort_order         smallint not null default 0,
  active             boolean not null default true,
  i18n               public.i18n_map,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint service_links_unique unique (from_service_id, to_service_id),
  constraint service_links_no_self check (from_service_id <> to_service_id)
);
create index service_links_to_idx on public.service_links (to_service_id);

create table public.holidays (
  id                  uuid primary key default gen_random_uuid(),
  date                date not null,
  name_th             text not null check (length(name_th) between 1 and 200),
  closed_agency_kinds public.agency_kind[],
  closed_office_ids   public.slug[],
  source_url          public.https_url,
  created_at          timestamptz not null default now(),
  constraint holidays_unique unique (date, name_th)
);
create index holidays_date_idx on public.holidays (date);
