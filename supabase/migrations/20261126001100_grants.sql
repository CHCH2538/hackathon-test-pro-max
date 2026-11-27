grant usage on schema public to anon, authenticated, service_role;

grant select on public.agencies, public.offices, public.jurisdictions, public.services,
  public.service_requirements, public.service_links, public.holidays, public.pass_products
  to anon, authenticated;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
