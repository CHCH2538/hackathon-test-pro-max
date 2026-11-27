-- PLACEHOLDER FIXTURES. Not verified government data. Do not show in the demo.
-- Real, human-verified content is owned by 91-demo-catalog in supabase/seed/10_demo_*.sql,
-- which upserts over these rows using the same canonical IDs.

set time zone 'Asia/Bangkok';

-- MARK: agencies
insert into public.agencies (id, name_th, kind, hotline, website_url) values
  ('bma-district',  'สำนักงานเขต กรุงเทพมหานคร',        'district',    '1555', 'https://www.bangkok.go.th'),
  ('mpb-police',    'กองบัญชาการตำรวจนครบาล',           'police',      '191',  'https://www.metro.police.go.th'),
  ('dlt',           'กรมการขนส่งทางบก',                 'dlt',         '1584', 'https://www.dlt.go.th'),
  ('dga-tangrat',   'ทางรัฐ (สำนักงานพัฒนารัฐบาลดิจิทัล)', 'gov_app',     '1111', 'https://www.dga.or.th'),
  ('traffy-fondue', 'Traffy Fondue',                    'city_report', '1555', 'https://www.traffy.in.th')
on conflict (id) do nothing;

-- MARK: offices
insert into public.offices (id, agency_id, name_th, location, address_th, phone, opening_hours,
  nearest_station_th, booking_url, source_url, last_verified) values
  ('pathumwan-police', 'mpb-police', 'สน.ปทุมวัน',
   'SRID=4326;POINT(100.5299 13.7437)'::extensions.geography,
   'ถนนพระรามที่ 1 แขวงรองเมือง เขตปทุมวัน กรุงเทพฯ (ตัวอย่าง)', '191',
   '{"mon":[{"open":"00:00","close":"23:59"}],"tue":[{"open":"00:00","close":"23:59"}],
     "wed":[{"open":"00:00","close":"23:59"}],"thu":[{"open":"00:00","close":"23:59"}],
     "fri":[{"open":"00:00","close":"23:59"}],"sat":[{"open":"00:00","close":"23:59"}],
     "sun":[{"open":"00:00","close":"23:59"}]}'::jsonb,
   null, null, 'https://www.metro.police.go.th', current_date - 10),
  ('lumpini-police', 'mpb-police', 'สน.ลุมพินี',
   'SRID=4326;POINT(100.5440 13.7300)'::extensions.geography,
   'ถนนวิทยุ แขวงลุมพินี เขตปทุมวัน กรุงเทพฯ (ตัวอย่าง)', '191',
   '{"mon":[{"open":"00:00","close":"23:59"}],"tue":[{"open":"00:00","close":"23:59"}],
     "wed":[{"open":"00:00","close":"23:59"}],"thu":[{"open":"00:00","close":"23:59"}],
     "fri":[{"open":"00:00","close":"23:59"}],"sat":[{"open":"00:00","close":"23:59"}],
     "sun":[{"open":"00:00","close":"23:59"}]}'::jsonb,
   null, null, 'https://www.metro.police.go.th', current_date - 10),
  ('pathumwan-district', 'bma-district', 'สำนักงานเขตปทุมวัน',
   'SRID=4326;POINT(100.5216 13.7449)'::extensions.geography,
   'ถนนพระรามที่ 1 แขวงวังใหม่ เขตปทุมวัน กรุงเทพฯ (ตัวอย่าง)', '1555',
   '{"mon":[{"open":"08:30","close":"12:00"},{"open":"13:00","close":"16:30"}],
     "tue":[{"open":"08:30","close":"12:00"},{"open":"13:00","close":"16:30"}],
     "wed":[{"open":"08:30","close":"12:00"},{"open":"13:00","close":"16:30"}],
     "thu":[{"open":"08:30","close":"12:00"},{"open":"13:00","close":"16:30"}],
     "fri":[{"open":"08:30","close":"12:00"},{"open":"13:00","close":"16:30"}],
     "sat":[{"open":"08:30","close":"12:00"}],"sun":[]}'::jsonb,
   'BTS สนามกีฬาแห่งชาติ', 'https://bmaq.bangkok.go.th', 'https://www.bangkok.go.th', current_date - 10),
  ('ratchathewi-district', 'bma-district', 'สำนักงานเขตราชเทวี',
   'SRID=4326;POINT(100.5341 13.7593)'::extensions.geography,
   'ถนนพญาไท แขวงถนนพญาไท เขตราชเทวี กรุงเทพฯ (ตัวอย่าง)', '1555',
   '{"mon":[{"open":"08:30","close":"12:00"},{"open":"13:00","close":"16:30"}],
     "tue":[{"open":"08:30","close":"12:00"},{"open":"13:00","close":"16:30"}],
     "wed":[{"open":"08:30","close":"12:00"},{"open":"13:00","close":"16:30"}],
     "thu":[{"open":"08:30","close":"12:00"},{"open":"13:00","close":"16:30"}],
     "fri":[{"open":"08:30","close":"12:00"},{"open":"13:00","close":"16:30"}],
     "sat":[{"open":"08:30","close":"12:00"}],"sun":[]}'::jsonb,
   'BTS ราชเทวี', null, 'https://www.bangkok.go.th', current_date - 10),
  ('dlt-chatuchak', 'dlt', 'กรมการขนส่งทางบก จตุจักร',
   'SRID=4326;POINT(100.5617 13.8127)'::extensions.geography,
   'ถนนพหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพฯ (ตัวอย่าง)', '1584',
   '{"mon":[{"open":"08:30","close":"12:00"},{"open":"13:00","close":"16:30"}],
     "tue":[{"open":"08:30","close":"12:00"},{"open":"13:00","close":"16:30"}],
     "wed":[{"open":"08:30","close":"12:00"},{"open":"13:00","close":"16:30"}],
     "thu":[{"open":"08:30","close":"12:00"},{"open":"13:00","close":"16:30"}],
     "fri":[{"open":"08:30","close":"12:00"},{"open":"13:00","close":"16:30"}],
     "sat":[],"sun":[]}'::jsonb,
   'MRT กำแพงเพชร', 'https://gecc.dlt.go.th', 'https://www.dlt.go.th', current_date - 10)
on conflict (id) do nothing;

-- MARK: jurisdictions (pilot proxies sharing the lng 100.5380 edge for RK-01)
insert into public.jurisdictions (id, office_id, kind, area, is_proxy, source_url, last_verified) values
  ('00000000-0000-4000-8000-000000000101', 'pathumwan-police', 'police_area',
   extensions.st_geomfromtext('MULTIPOLYGON(((100.5280 13.7420, 100.5380 13.7420, 100.5380 13.7500, 100.5280 13.7500, 100.5280 13.7420)))', 4326),
   true, 'https://www.metro.police.go.th', current_date - 10),
  ('00000000-0000-4000-8000-000000000102', 'lumpini-police', 'police_area',
   extensions.st_geomfromtext('MULTIPOLYGON(((100.5380 13.7380, 100.5480 13.7380, 100.5480 13.7500, 100.5380 13.7500, 100.5380 13.7380)))', 4326),
   true, 'https://www.metro.police.go.th', current_date - 10)
on conflict (id) do nothing;

-- MARK: holidays
insert into public.holidays (date, name_th, closed_agency_kinds, closed_office_ids, source_url) values
  ('2026-12-05', 'วันพ่อแห่งชาติ',  null, null, 'https://www.bangkok.go.th'),
  ('2026-12-10', 'วันรัฐธรรมนูญ',   null, null, 'https://www.bangkok.go.th'),
  ('2026-12-31', 'วันสิ้นปี',       null, null, 'https://www.bangkok.go.th'),
  ('2027-01-01', 'วันขึ้นปีใหม่',   null, null, 'https://www.bangkok.go.th'),
  (current_date + 7, 'ปิดปรับปรุงระบบ (ตัวอย่าง)', null,
   array['ratchathewi-district']::public.slug[], 'https://www.bangkok.go.th')
on conflict (date, name_th) do nothing;
-- MARK: services (5 canonical M-02 IDs)
insert into public.services (id, agency_id, name_th, office_rule, can_complete_online,
  online_channel_name_th, online_channel_url, hotline, triage_questions, source_url, last_verified, published) values
  ('police-report-property', 'mpb-police', 'แจ้งความทรัพย์สินหายหรือถูกขโมย', 'incident_location', false,
   null, null, null,
   '[{"id":"loss_type","labelTh":"ของหายเองหรือถูกขโมย","kind":"single",
      "options":[{"value":"lost","labelTh":"หายเอง"},{"value":"stolen","labelTh":"ถูกขโมย"}]},
     {"id":"incident_location","labelTh":"เกิดเหตุที่ไหน (ปักหมุด)","kind":"location"},
     {"id":"bank_card_lost","labelTh":"บัตร ATM หรือบัตรเครดิตหายด้วยไหม","kind":"boolean"},
     {"id":"id_card_lost","labelTh":"บัตรประชาชนหายด้วยไหม","kind":"boolean"}]'::jsonb,
   'https://www.metro.police.go.th', current_date - 10, true),
  ('online-fraud-report', 'mpb-police', 'แจ้งความถูกหลอกโอนเงินออนไลน์', 'online', true,
   'ระบบแจ้งความออนไลน์', 'https://www.thaipoliceonline.go.th', '1441',
   '[{"id":"bank_transfer","labelTh":"โอนเงินผ่านบัญชีธนาคารใช่ไหม","kind":"boolean"}]'::jsonb,
   'https://www.thaipoliceonline.go.th', current_date - 10, true),
  ('driving-licence-renewal', 'dlt', 'ต่ออายุใบอนุญาตขับรถ', 'any_office', false,
   'DLT Smart Queue', 'https://gecc.dlt.go.th', null,
   '[{"id":"licence_type","labelTh":"ใบขับขี่ที่จะต่อเป็นชนิดไหน","kind":"single",
      "options":[{"value":"temporary","labelTh":"ชนิดชั่วคราว (2 ปี)"},{"value":"five_year","labelTh":"ชนิด 5 ปี"}]},
     {"id":"expired_over_years","labelTh":"ใบขับขี่หมดอายุมานานแค่ไหน","kind":"single",
      "options":[{"value":"not_expired","labelTh":"ยังไม่หมดอายุ"},{"value":"under_1","labelTh":"ไม่เกิน 1 ปี"},
                 {"value":"1_to_3","labelTh":"1–3 ปี"},{"value":"over_3","labelTh":"เกิน 3 ปี"}]}]'::jsonb,
   'https://www.dlt.go.th', current_date - 10, true),
  ('id-card-new', 'bma-district', 'ทำบัตรประจำตัวประชาชนใหม่', 'any_office', false,
   null, null, null,
   '[{"id":"police_record","labelTh":"มีใบแจ้งความเรื่องบัตรหายแล้วใช่ไหม","kind":"boolean"},
     {"id":"proxy","labelTh":"มีคนไปทำแทน (มอบอำนาจ) ใช่ไหม","kind":"boolean"}]'::jsonb,
   'https://www.bangkok.go.th', current_date - 10, true),
  ('change-of-address', 'bma-district', 'แจ้งย้ายที่อยู่', 'house_registration', false,
   null, null, null,
   '[{"id":"proxy","labelTh":"มีคนไปทำแทน (มอบอำนาจ) ใช่ไหม","kind":"boolean"}]'::jsonb,
   'https://www.bangkok.go.th', current_date - 120, true)
on conflict (id) do nothing;
-- MARK: service_requirements
insert into public.service_requirements (id, service_id, kind, text_th, condition, condition_label_th,
  copy_type, sort_order) values
  ('00000000-0000-4000-8000-000000000001', 'police-report-property', 'before_go', 'อายัดบัตร ATM/บัตรเครดิต',
   '{"slot":"bank_card_lost","op":"eq","value":true}'::jsonb, 'ถ้าบัตร ATM/บัตรเครดิตหายด้วย', 'not_applicable', 0),
  ('00000000-0000-4000-8000-000000000002', 'police-report-property', 'document', 'บัตรประจำตัวประชาชน (ถ้ามี)',
   null, null, 'original', 1),
  ('00000000-0000-4000-8000-000000000003', 'police-report-property', 'remember', 'เวลา สถานที่ และรายการของที่หาย',
   null, null, 'not_applicable', 2),
  ('00000000-0000-4000-8000-000000000004', 'online-fraud-report', 'before_go', 'โทรแจ้งธนาคารให้ระงับบัญชีปลายทางทันที',
   '{"slot":"bank_transfer","op":"eq","value":true}'::jsonb, 'ถ้าโอนผ่านบัญชีธนาคาร', 'not_applicable', 0),
  ('00000000-0000-4000-8000-000000000005', 'online-fraud-report', 'document', 'หลักฐานการโอนเงิน (สลิป)',
   null, null, 'not_applicable', 1),
  ('00000000-0000-4000-8000-000000000006', 'online-fraud-report', 'document', 'ภาพหน้าจอแชตหรือประกาศของคนร้าย',
   null, null, 'not_applicable', 2),
  ('00000000-0000-4000-8000-000000000007', 'driving-licence-renewal', 'step', 'อบรมออนไลน์ผ่านระบบของกรมการขนส่งทางบก',
   null, null, 'not_applicable', 0),
  ('00000000-0000-4000-8000-000000000008', 'driving-licence-renewal', 'document', 'ใบรับรองแพทย์ (อายุไม่เกิน 1 เดือน)',
   null, null, 'original', 1),
  ('00000000-0000-4000-8000-000000000009', 'driving-licence-renewal', 'step', 'สอบข้อเขียนและสอบขับรถใหม่',
   '{"slot":"expired_over_years","op":"eq","value":"over_3"}'::jsonb, 'ถ้าหมดอายุเกิน 3 ปี', 'not_applicable', 2),
  ('00000000-0000-4000-8000-000000000010', 'id-card-new', 'document', 'ใบแจ้งความ',
   '{"slot":"police_record","op":"eq","value":true}'::jsonb, 'ถ้ามีใบแจ้งความ', 'original', 0),
  ('00000000-0000-4000-8000-000000000011', 'id-card-new', 'document', 'หนังสือมอบอำนาจ',
   '{"slot":"proxy","op":"eq","value":true}'::jsonb, 'เฉพาะกรณีมอบอำนาจ', 'original', 1),
  ('00000000-0000-4000-8000-000000000012', 'id-card-new', 'document', 'สูติบัตรหรือทะเบียนบ้าน (ถ้ามี)',
   null, null, 'original', 2),
  ('00000000-0000-4000-8000-000000000013', 'change-of-address', 'document', 'ทะเบียนบ้านฉบับเจ้าบ้าน',
   null, null, 'original', 0),
  ('00000000-0000-4000-8000-000000000014', 'change-of-address', 'document', 'บัตรประจำตัวประชาชนของผู้ย้ายและเจ้าบ้าน',
   null, null, 'original', 1),
  ('00000000-0000-4000-8000-000000000015', 'change-of-address', 'document', 'หนังสือมอบอำนาจ',
   '{"slot":"proxy","op":"eq","value":true}'::jsonb, 'เฉพาะกรณีมอบอำนาจ', 'original', 2)
on conflict (id) do nothing;
-- MARK: service_links (J1 -> J3)
insert into public.service_links (id, from_service_id, to_service_id, condition, condition_label_th, sort_order) values
  ('00000000-0000-4000-8000-000000000201', 'police-report-property', 'id-card-new',
   '{"slot":"id_card_lost","op":"eq","value":true}'::jsonb, 'ถ้าบัตรประชาชนหายด้วย', 0)
on conflict do nothing;

-- MARK: sessions (token demoSession0000000000A)
insert into public.sessions (id, token_hash) values
  ('00000000-0000-4000-8000-000000000401', extensions.digest('demoSession0000000000A', 'sha256'))
on conflict do nothing;

-- MARK: line_users and consents
insert into public.line_users (id, line_uid, is_friend) values
  ('00000000-0000-4000-8000-000000000501', 'U00000000000000000000000000000000', true)
on conflict do nothing;

insert into public.consents (id, line_user_id, purpose, policy_version) values
  ('00000000-0000-4000-8000-000000000502', '00000000-0000-4000-8000-000000000501', 'line_link', '2026-11-26')
on conflict do nothing;

-- MARK: cases (DEMO_TOKENS; inserted with their final status, cases_before_write sets closed_at/expires_at)
insert into public.cases (id, token_hash, session_id, line_user_id, parent_case_id, service_ids, slot_answers,
  online_only, office_id, incident_point, incident_confirmed, appointment_at, depart_at, status, time_saved_min) values
  ('00000000-0000-4000-8000-000000000301', extensions.digest('demoPlanned0000000000A', 'sha256'),
   '00000000-0000-4000-8000-000000000401', null, null,
   array['police-report-property']::public.slug[],
   '{"loss_type":"stolen","incident_location":"สยาม","bank_card_lost":true,"id_card_lost":true}'::jsonb,
   false, 'pathumwan-police', 'SRID=4326;POINT(100.5347 13.7462)'::extensions.geography, true,
   null, null, 'planned', null),
  ('00000000-0000-4000-8000-000000000302', extensions.digest('demoBooked00000000000A', 'sha256'),
   '00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000501', null,
   array['driving-licence-renewal']::public.slug[],
   '{"licence_type":"five_year","expired_over_years":"not_expired"}'::jsonb,
   false, 'dlt-chatuchak', null, false,
   ((current_date + 1) + time '09:00') at time zone 'Asia/Bangkok',
   ((current_date + 1) + time '07:45') at time zone 'Asia/Bangkok', 'booked', null),
  ('00000000-0000-4000-8000-000000000303', extensions.digest('demoDue00000000000000A', 'sha256'),
   '00000000-0000-4000-8000-000000000401', null, '00000000-0000-4000-8000-000000000301',
   array['id-card-new']::public.slug[],
   '{"police_record":true,"proxy":false}'::jsonb,
   false, 'pathumwan-district', null, false,
   (current_date + time '10:00') at time zone 'Asia/Bangkok', null, 'due', null),
  ('00000000-0000-4000-8000-000000000304', extensions.digest('demoDone0000000000000A', 'sha256'),
   '00000000-0000-4000-8000-000000000401', null, null,
   array['change-of-address']::public.slug[],
   '{"proxy":false}'::jsonb,
   false, 'pathumwan-district', null, false, null, null, 'done', null),
  ('00000000-0000-4000-8000-000000000305', extensions.digest('demoPostponed00000000A', 'sha256'),
   '00000000-0000-4000-8000-000000000401', null, null,
   array['id-card-new']::public.slug[],
   '{"police_record":false,"proxy":false}'::jsonb,
   false, 'ratchathewi-district', null, false, null, null, 'postponed', null),
  ('00000000-0000-4000-8000-000000000306', extensions.digest('demoCancelled00000000A', 'sha256'),
   '00000000-0000-4000-8000-000000000401', null, null,
   array['driving-licence-renewal']::public.slug[],
   '{"licence_type":"temporary","expired_over_years":"under_1"}'::jsonb,
   false, null, null, false, null, null, 'cancelled', null),
  ('00000000-0000-4000-8000-000000000307', extensions.digest('demoOnline00000000000A', 'sha256'),
   '00000000-0000-4000-8000-000000000401', null, null,
   array['online-fraud-report']::public.slug[],
   '{"bank_transfer":true}'::jsonb,
   true, null, null, false, null, null, 'done', 120)
on conflict do nothing;

-- MARK: case_checklist_items (snapshots of the planned and booked cases)
insert into public.case_checklist_items (id, case_id, requirement_id, service_id, kind, text_th,
  condition_label_th, condition_status, source_url, last_verified, sort_order, checked, checked_at)
select v.id, v.case_id, r.id, r.service_id, r.kind, r.text_th, r.condition_label_th, v.condition_status,
       s.source_url, s.last_verified, r.sort_order, v.checked, case when v.checked then now() end
from (values
  ('00000000-0000-4000-8000-000000000311'::uuid, '00000000-0000-4000-8000-000000000301'::uuid,
   '00000000-0000-4000-8000-000000000001'::uuid, 'met'::public.condition_status, false),
  ('00000000-0000-4000-8000-000000000312', '00000000-0000-4000-8000-000000000301',
   '00000000-0000-4000-8000-000000000002', 'always', false),
  ('00000000-0000-4000-8000-000000000313', '00000000-0000-4000-8000-000000000301',
   '00000000-0000-4000-8000-000000000003', 'always', false),
  ('00000000-0000-4000-8000-000000000314', '00000000-0000-4000-8000-000000000302',
   '00000000-0000-4000-8000-000000000007', 'always', true),
  ('00000000-0000-4000-8000-000000000315', '00000000-0000-4000-8000-000000000302',
   '00000000-0000-4000-8000-000000000008', 'always', false)
) as v(id, case_id, requirement_id, condition_status, checked)
join public.service_requirements r on r.id = v.requirement_id
join public.services s on s.id = r.service_id
on conflict do nothing;

-- MARK: case_origins (T-C3: bound to the planned case, deleted with it)
insert into public.case_origins (case_id, point, source) values
  ('00000000-0000-4000-8000-000000000301', 'SRID=4326;POINT(100.5318 13.7563)'::extensions.geography, 'pin')
on conflict do nothing;

-- MARK: document_expiries
insert into public.document_expiries (id, line_user_id, doc_type, expires_on) values
  ('00000000-0000-4000-8000-000000000601', '00000000-0000-4000-8000-000000000501', 'driving_licence', current_date + 30)
on conflict do nothing;

-- MARK: reminders (booked case D-1 and morning-of, one document expiry)
insert into public.reminders (id, case_id, document_expiry_id, kind, send_at, dedupe_key) values
  ('00000000-0000-4000-8000-000000000611', '00000000-0000-4000-8000-000000000302', null, 'd_minus_1',
   (current_date + time '18:00') at time zone 'Asia/Bangkok',
   'case:00000000-0000-4000-8000-000000000302:d_minus_1:' || to_char(current_date + 1, 'YYYY-MM-DD')),
  ('00000000-0000-4000-8000-000000000612', '00000000-0000-4000-8000-000000000302', null, 'morning_of',
   ((current_date + 1) + time '07:15') at time zone 'Asia/Bangkok',
   'case:00000000-0000-4000-8000-000000000302:morning_of:' || to_char(current_date + 1, 'YYYY-MM-DD')),
  ('00000000-0000-4000-8000-000000000613', null, '00000000-0000-4000-8000-000000000601', 'expiry',
   ((current_date + 23) + time '09:00') at time zone 'Asia/Bangkok',
   'doc:00000000-0000-4000-8000-000000000601:expiry:' || to_char(current_date + 23, 'YYYY-MM-DD'))
on conflict do nothing;

-- MARK: route_plans (booked case)
insert into public.route_plans (id, case_id, office_id, travel_mode, arrive_by, depart_at, duration_s,
  distance_m, buffer_min, summary_th) values
  ('00000000-0000-4000-8000-000000000701', '00000000-0000-4000-8000-000000000302', 'dlt-chatuchak', 'TRANSIT',
   ((current_date + 1) + time '09:00') at time zone 'Asia/Bangkok',
   ((current_date + 1) + time '07:45') at time zone 'Asia/Bangkok',
   2700, 9500, 15, 'ตัวอย่าง: รถไฟฟ้าไป MRT กำแพงเพชร แล้วเดินต่อ')
on conflict do nothing;

-- MARK: events (K-01 chat_started -> plan_ready 90 s, K-02/K-04 case_created)
insert into public.events (name, session_id, case_id, props, created_at)
select v.name, '00000000-0000-4000-8000-000000000401'::uuid, v.case_id, v.props, v.created_at
from (values
  ('chat_started', null::uuid, '{}'::jsonb, now() - interval '10 minutes'),
  ('plan_ready', null, '{}', now() - interval '10 minutes' + interval '90 seconds'),
  ('case_created', '00000000-0000-4000-8000-000000000301', '{"service_id":"police-report-property","online_only":false}', now() - interval '9 minutes'),
  ('case_created', '00000000-0000-4000-8000-000000000302', '{"service_id":"driving-licence-renewal","online_only":false}', now() - interval '9 minutes'),
  ('case_created', '00000000-0000-4000-8000-000000000303', '{"service_id":"id-card-new","online_only":false}', now() - interval '9 minutes'),
  ('case_created', '00000000-0000-4000-8000-000000000304', '{"service_id":"change-of-address","online_only":false}', now() - interval '9 minutes'),
  ('case_created', '00000000-0000-4000-8000-000000000305', '{"service_id":"id-card-new","online_only":false}', now() - interval '9 minutes'),
  ('case_created', '00000000-0000-4000-8000-000000000306', '{"service_id":"driving-licence-renewal","online_only":false}', now() - interval '9 minutes'),
  ('case_created', '00000000-0000-4000-8000-000000000307', '{"service_id":"online-fraud-report","online_only":true}', now() - interval '9 minutes')
) as v(name, case_id, props, created_at)
where not exists (select 1 from public.events e where e.session_id = '00000000-0000-4000-8000-000000000401');

-- MARK: pass_products (Phase 2)
insert into public.pass_products (id, name_th, passes, price_satang) values
  ('pass-1', 'Smart Pass 1 ครั้ง (ตัวอย่าง)', 1, 4900),
  ('pass-3', 'Smart Pass 3 ครั้ง (ตัวอย่าง)', 3, 12900)
on conflict do nothing;

-- MARK: pass_wallets and pass_ledger (BP-04 free first pass)
insert into public.pass_wallets (id, line_user_id) values
  ('00000000-0000-4000-8000-000000000801', '00000000-0000-4000-8000-000000000501')
on conflict do nothing;

insert into public.pass_ledger (wallet_id, delta, reason, expires_at)
select '00000000-0000-4000-8000-000000000801', 1, 'free_first', now() + interval '12 months'
where not exists (select 1 from public.pass_ledger l
  where l.wallet_id = '00000000-0000-4000-8000-000000000801' and l.reason = 'free_first');
