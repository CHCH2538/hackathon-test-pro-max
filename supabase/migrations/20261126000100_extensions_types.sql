create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create domain public.slug as text
  check (value ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(value) <= 64);
create domain public.hotline as text
  check (value ~ '^[0-9]{3,10}$');
create domain public.https_url as text
  check (value ~ '^https://[^\s/@]+(/\S*)?$' and length(value) <= 2048);
create domain public.i18n_map as jsonb
  default '{}'::jsonb not null
  check (jsonb_typeof(value) = 'object');

create type public.agency_kind as enum ('district','police','dlt','gov_app','city_report',
  'land','social_security','consular','revenue','utility','other');
create type public.office_rule as enum ('incident_location','house_registration','any_office','online');
create type public.jurisdiction_kind as enum ('police_area','district_admin');
create type public.requirement_kind as enum ('before_go','document','step','remember');
create type public.copy_type as enum ('original','copy','original_and_copy','not_applicable');
create type public.condition_status as enum ('always','met','unknown');
create type public.case_status as enum ('planned','booked','due','done','postponed','cancelled');
create type public.case_mode as enum ('free','smart');
create type public.origin_source as enum ('gps','pin','search');
create type public.reminder_kind as enum ('d_minus_1','morning_of','unticked_docs','expiry',
  'next_step','reroute','route_event','survey');
create type public.reminder_status as enum ('pending','sent','cancelled','failed');
create type public.reminder_frequency as enum ('all','important_only','off');
create type public.consent_purpose as enum ('line_link','reminders','survey');
create type public.travel_mode as enum ('TRANSIT','DRIVE','TWO_WHEELER','WALK');
create type public.report_status as enum ('open','accepted','rejected','fixed');
create type public.review_action as enum ('create','update','verify','publish','unpublish','delete');
create type public.payment_status as enum ('pending','paid','failed','refunded');
create type public.ledger_reason as enum ('purchase','spend','refund','transfer_in','transfer_out',
  'sponsor','free_first','expire');
create type public.family_status as enum ('pending','active','revoked');
create type public.doc_type as enum ('id_card','driving_licence','vehicle_tax','passport');
create type public.day_part as enum ('morning','midday','afternoon');
