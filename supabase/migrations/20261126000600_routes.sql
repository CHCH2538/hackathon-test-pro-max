create table public.route_plans (
  id                  uuid primary key default gen_random_uuid(),
  case_id             uuid not null references public.cases(id) on delete cascade,
  office_id           public.slug references public.offices(id) on delete set null,
  travel_mode         public.travel_mode not null,
  traffic_aware       boolean not null default false,
  is_chain            boolean not null default false,
  arrive_by           timestamptz,
  depart_at           timestamptz,
  duration_s          integer check (duration_s >= 0),
  distance_m          integer check (distance_m >= 0),
  buffer_min          smallint not null default 0 check (buffer_min between 0 and 180),
  baseline_duration_s integer check (baseline_duration_s >= 0),
  is_fallback         boolean not null default false,
  summary_th          text check (length(summary_th) <= 300),
  encoded_polyline    text check (length(encoded_polyline) <= 20000),
  computed_at         timestamptz not null default now(),
  rerouted_at         timestamptz,
  constraint route_plans_unique unique (case_id, travel_mode, is_chain)
);

create table public.route_legs (
  id            uuid primary key default gen_random_uuid(),
  route_plan_id uuid not null references public.route_plans(id) on delete cascade,
  seq           smallint not null check (seq between 0 and 9),
  to_office_id  public.slug references public.offices(id) on delete set null,
  travel_mode   public.travel_mode not null,
  duration_s    integer check (duration_s >= 0),
  distance_m    integer check (distance_m >= 0),
  arrive_at     timestamptz,
  within_hours  boolean,
  steps         jsonb not null default '[]' check (jsonb_typeof(steps) = 'array'),
  constraint route_legs_unique unique (route_plan_id, seq)
);
