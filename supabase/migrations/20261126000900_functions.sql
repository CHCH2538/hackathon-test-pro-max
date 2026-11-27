create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['agencies','offices','jurisdictions','services','service_requirements',
    'service_links','family_links','cases','case_origins','document_expiries','reminders'] loop
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
                   t || '_updated_at', t);
  end loop;
end $$;

create function public.case_transition_allowed(p_from public.case_status, p_to public.case_status, p_online_only boolean)
returns boolean language sql immutable set search_path = '' as $$
  select case
    when p_from = p_to then false
    when p_from in ('done','cancelled') then false
    when p_to = 'cancelled' then true
    when p_from = 'planned'   then p_to = 'booked' or (p_to = 'done' and p_online_only)
    when p_from = 'booked'    then p_to in ('due','postponed','done')
    when p_from = 'due'       then p_to in ('done','postponed')
    when p_from = 'postponed' then p_to = 'booked'
    else false
  end
$$;

create function public.cases_before_write() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if not public.case_transition_allowed(old.status, new.status, new.online_only) then
      raise exception 'invalid case transition % -> %', old.status, new.status using errcode = '23514';
    end if;
  end if;
  if new.status in ('done','cancelled') then
    if tg_op = 'INSERT' or old.status not in ('done','cancelled') then
      new.closed_at := coalesce(new.closed_at, now());
      new.expires_at := now() + interval '30 days';
    end if;
  else
    new.closed_at := null;
    new.expires_at := greatest(
      coalesce(new.expires_at, now()),
      now() + interval '30 days',
      coalesce(new.appointment_at + interval '30 days', '-infinity'::timestamptz));
  end if;
  return new;
end $$;
create trigger cases_before_write before insert or update on public.cases
  for each row execute function public.cases_before_write();

create function public.cases_after_status() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status in ('done','cancelled','postponed') then
    update public.reminders set status = 'cancelled'
     where case_id = new.id and status = 'pending';
  end if;
  return null;
end $$;
create trigger cases_after_status after update of status on public.cases
  for each row when (old.status is distinct from new.status)
  execute function public.cases_after_status();

create function public.touch_session(p_token_hash bytea) returns uuid
language sql set search_path = '' as $$
  insert into public.sessions (token_hash) values (p_token_hash)
  on conflict (token_hash) do update set last_seen_at = now()
  returning id
$$;

create function public.create_case_chain(p_session_id uuid, p_cases jsonb)
returns table (r_index integer, r_case_id uuid)
language plpgsql set search_path = '' as $$
declare
  v_ids uuid[] := '{}';
  v_case jsonb;
  v_parent integer;
  v_id uuid;
  v_i integer := 0;
begin
  if jsonb_typeof(p_cases) <> 'array' or jsonb_array_length(p_cases) not between 1 and 5 then
    raise exception 'p_cases must hold 1 to 5 drafts' using errcode = '22023';
  end if;
  for v_case in select value from jsonb_array_elements(p_cases) loop
    v_parent := (v_case->>'parent_index')::integer;
    if v_parent is not null and (v_parent < 0 or v_parent >= v_i) then
      raise exception 'parent_index must point to an earlier draft' using errcode = '22023';
    end if;
    insert into public.cases (token_hash, session_id, service_ids, slot_answers, online_only, parent_case_id)
    values (decode(v_case->>'token_hash_hex', 'hex'),
            p_session_id,
            array(select jsonb_array_elements_text(v_case->'service_ids'))::public.slug[],
            coalesce(v_case->'slot_answers', '{}'::jsonb),
            coalesce((v_case->>'online_only')::boolean, false),
            case when v_parent is null then null else v_ids[v_parent + 1] end)
    returning id into v_id;
    insert into public.case_checklist_items (case_id, requirement_id, service_id, kind, text_th,
      condition_label_th, condition_status, source_url, last_verified, sort_order)
    select v_id, (i->>'requirement_id')::uuid, i->>'service_id', (i->>'kind')::public.requirement_kind,
           i->>'text_th', i->>'condition_label_th', (i->>'condition_status')::public.condition_status,
           i->>'source_url', (i->>'last_verified')::date, coalesce((i->>'sort_order')::smallint, 0)
    from jsonb_array_elements(coalesce(v_case->'checklist', '[]'::jsonb)) as i;
    v_ids := v_ids || v_id;
    r_index := v_i;
    r_case_id := v_id;
    return next;
    v_i := v_i + 1;
  end loop;
end $$;

create function public.find_jurisdictions(p_lat double precision, p_lng double precision,
  p_kind public.jurisdiction_kind, p_border_m integer default 150)
returns table (office_id public.slug, jurisdiction_id uuid, covers boolean,
               edge_distance_m double precision, is_proxy boolean)
language sql stable set search_path = '' as $$
  with p as (select extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326) as g)
  select j.office_id,
         j.id,
         extensions.st_covers(j.area, p.g),
         extensions.st_distance(extensions.st_boundary(j.area)::extensions.geography, p.g::extensions.geography),
         j.is_proxy
  from public.jurisdictions j
  join public.offices o on o.id = j.office_id and o.published
  cross join p
  where j.kind = p_kind
    and extensions.st_dwithin(j.area::extensions.geography, p.g::extensions.geography, p_border_m)
  order by 3 desc, 4 asc
  limit 3
$$;

create function public.nearest_offices(p_lat double precision, p_lng double precision,
  p_agency_kind public.agency_kind, p_limit integer default 5)
returns table (office_id public.slug, straight_m double precision)
language sql stable set search_path = '' as $$
  select o.id,
         extensions.st_distance(o.location, extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography)
  from public.offices o
  join public.agencies a on a.id = o.agency_id and a.published
  where o.published and a.kind = p_agency_kind
  order by o.location operator(extensions.<->) extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography
  limit least(greatest(p_limit, 1), 20)
$$;

create function public.rate_limit_hit(p_key text, p_window_sec integer, p_max integer)
returns table (allowed boolean, retry_after_sec integer)
language plpgsql set search_path = '' as $$
declare
  v_start timestamptz;
  v_hits integer;
begin
  insert into public.rate_limits as r (key, window_start, hits) values (p_key, now(), 1)
  on conflict (key) do update set
    window_start = case when r.window_start <= now() - make_interval(secs => p_window_sec) then now() else r.window_start end,
    hits         = case when r.window_start <= now() - make_interval(secs => p_window_sec) then 1 else r.hits + 1 end
  returning r.window_start, r.hits into v_start, v_hits;
  allowed := v_hits <= p_max;
  retry_after_sec := case when allowed then 0
    else greatest(1, ceil(extract(epoch from (v_start + make_interval(secs => p_window_sec) - now())))::integer) end;
  return next;
end $$;

create function public.claim_push(p_monthly_budget integer, p_case_id uuid default null)
returns boolean language plpgsql set search_path = '' as $$
declare
  v_month date := date_trunc('month', now() at time zone 'Asia/Bangkok')::date;
  v_used integer;
begin
  insert into public.line_push_usage (month) values (v_month) on conflict (month) do nothing;
  select push_count into v_used from public.line_push_usage where month = v_month for update;
  if v_used >= p_monthly_budget then
    return false;
  end if;
  if p_case_id is not null then
    update public.cases set push_count = push_count + 1
     where id = p_case_id and push_count < push_cap and not reminders_muted;
    if not found then
      return false;
    end if;
  end if;
  update public.line_push_usage set push_count = push_count + 1 where month = v_month;
  return true;
end $$;

create function public.delete_line_user_data(p_line_user_id uuid) returns void
language sql set search_path = '' as $$
  delete from public.line_users where id = p_line_user_id
$$;

create function public.advance_due_cases(p_today date) returns integer
language sql set search_path = '' as $$
  with u as (
    update public.cases set status = 'due'
     where status = 'booked' and (appointment_at at time zone 'Asia/Bangkok')::date <= p_today
    returning 1)
  select count(*)::integer from u
$$;

create function public.purge_expired(p_now timestamptz) returns jsonb
language plpgsql set search_path = '' as $$
declare
  v_cases integer;
  v_sessions integer;
begin
  delete from public.cases where expires_at < p_now;
  get diagnostics v_cases = row_count;
  delete from public.sessions s
   where s.last_seen_at < p_now - interval '30 days'
     and not exists (select 1 from public.cases c where c.session_id = s.id);
  get diagnostics v_sessions = row_count;
  delete from public.rate_limits where window_start < p_now - interval '1 day';
  delete from public.cache_entries where expires_at < p_now;
  delete from public.line_link_states where expires_at < p_now;
  delete from public.line_webhook_events where received_at < p_now - interval '7 days';
  delete from public.payment_webhook_events where received_at < p_now - interval '30 days';
  delete from public.events where created_at < p_now - interval '365 days';
  return jsonb_build_object('cases', v_cases, 'sessions', v_sessions);
end $$;
