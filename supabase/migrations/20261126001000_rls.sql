do $$
declare t text;
begin
  foreach t in array array['agencies','offices','jurisdictions','services','service_requirements',
    'service_links','holidays','pass_products'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke insert, update, delete, truncate on public.%I from anon, authenticated', t);
  end loop;
end $$;

create policy agencies_public_read on public.agencies for select to anon, authenticated using (published);
create policy offices_public_read on public.offices for select to anon, authenticated using (published);
create policy jurisdictions_public_read on public.jurisdictions for select to anon, authenticated
  using (exists (select 1 from public.offices o where o.id = office_id and o.published));
create policy services_public_read on public.services for select to anon, authenticated using (published);
create policy service_requirements_public_read on public.service_requirements for select to anon, authenticated
  using (active and exists (select 1 from public.services s where s.id = service_id and s.published));
create policy service_links_public_read on public.service_links for select to anon, authenticated
  using (active
    and exists (select 1 from public.services s where s.id = from_service_id and s.published)
    and exists (select 1 from public.services s where s.id = to_service_id and s.published));
create policy holidays_public_read on public.holidays for select to anon, authenticated using (true);
create policy pass_products_public_read on public.pass_products for select to anon, authenticated using (active);

do $$
declare t text;
begin
  foreach t in array array['sessions','line_users','consents','family_links','cases','case_checklist_items',
    'case_origins','document_expiries','reminders','line_push_usage','line_webhook_events','line_link_states',
    'route_plans','route_legs','catalog_reports','catalog_review_log','events','survey_responses',
    'rate_limits','cache_entries','payments','payment_webhook_events','pass_wallets','pass_ledger',
    'sponsor_codes','sponsor_redemptions','wait_reports'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I as restrictive for all to anon, authenticated using (false) with check (false)',
                   t || '_deny_clients', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;

revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
grant execute on function public.find_jurisdictions(double precision, double precision, public.jurisdiction_kind, integer)
  to anon, authenticated;
grant execute on function public.nearest_offices(double precision, double precision, public.agency_kind, integer)
  to anon, authenticated;
grant execute on function public.case_transition_allowed(public.case_status, public.case_status, boolean)
  to anon, authenticated;
