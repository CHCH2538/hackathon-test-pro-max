# Product: ผู้ช่วยบริการรัฐแบบแชท (Bangkok Flow)

Source of truth: `docs/requirements.md` (IDs are canonical).

## What it is
A Thai web chat: the user says what they want to do, and gets back a document Checklist, a plan (which office, which day, how to get there), and a "ส่งเข้า LINE" button. LINE OA handles what the web can't: reminders and case follow-up. Covers 5 agencies: สำนักงานเขต, สน., กรมการขนส่งทางบก, ทางรัฐ, Traffy Fondue.

## Problem and goal
People waste trips because they go to the wrong office (jurisdiction), bring incomplete documents, arrive on the wrong day/time, or don't know it can be done online. Goal: fewer unnecessary trips, measured in hours returned to citizens.

## Users
Bangkok residents who rarely deal with government; elderly people and relatives acting for them (power of attorney); people from other provinces working in Bangkok. Foreigners later.

## Non-negotiables
- Planner only: never files requests, stores document copies, gives legal advice, or acts as a police report channel (X-01, X-02).
- Checklists and offices come from the human-verified Service Catalog only; the LLM only picks serviceIds and phrases answers (W-03, N-02).
- Shows source + lastVerified; >90 days shows "ควรโทรยืนยัน" (N-01).
- Clearly not a government site; outbound links only to .go.th / allowlisted official domains; never asks for money or passwords (N-05).
- PDPA: no ID numbers or document photos, PII masked before LLM, home location never sent to LLM, cases auto-expire (N-03, N-04, T-C3).
- Mobile-first, large text/buttons, WCAG 2.1 AA (N-07).

## MVP scope
Bangkok only. 5 verified services: lost/stolen property report, online transfer fraud, driver's licence renewal, new ID card, change of address. 5–10 pilot police-station polygons. Phase 2: OCR, multi-language, rain/traffic alerts, Smart Pass billing.

## 3-minute demo script
1. 0:00–0:20 Problem: one lost wallet costs 3 trips today. Point at the "ไม่ใช่ช่องทางราชการ / ไม่ใช่ช่องทางรับแจ้งความ" banner.
2. 0:20–1:20 J1: type "กระเป๋าตังค์หายแถวสยาม บัตรประชาชนอยู่ข้างใน". Answer triage buttons (ถูกขโมย, ปักหมุดสยาม, บัตร ATM หายด้วย). Show: not a tech crime → สน. ท้องที่ from the pin, phone, route, "นำทางใน Google Maps". Checklist (อายัดบัตรก่อน) with source + date. The plan chains J3: new ID card at a district near BTS with a BMA Q link.
3. 1:20–2:10 J2: "ใบขับขี่หมดเดือนหน้า ต้องทำไง". Ordered steps: อบรมออนไลน์ → ThaID → DLT Smart Queue link. Enter the booked date, add to calendar (.ics), press "ส่งเข้า LINE", show the Flex summary and the D-1 reminder.
4. 2:10–2:40 J1b: "โดนหลอกโอนเงินออนไลน์" → thaipoliceonline.go.th + 1441 + evidence checklist, no trip needed. Show "เวลาที่ประหยัดได้".
5. 2:40–3:00 Trust: emergency input ("มีคนบาดเจ็บ") shows 191/1669 immediately; one slide with the OWASP table and ZAP result.
