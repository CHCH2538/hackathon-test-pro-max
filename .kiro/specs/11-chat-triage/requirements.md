# Requirements Document

## Introduction

11-chat-triage. Wave 1 · executor machine-b · depends on: 00-foundation

## Requirements

### หน่วยงานและบริการที่ครอบคลุม

**X-01 ข้อสำคัญ:** สตช. ยืนยันว่า[รับแจ้งความออนไลน์ผ่าน thaipoliceonline.go.th ช่องทางเดียว ไม่รับผ่านแชทหรือโซเชียล](https://www.thairath.co.th/news/society/2751820) ระบบจึงต้องแสดงชัดเจนว่าเป็นผู้ช่วยวางแผน ไม่ใช่ช่องทางรับแจ้งความ มิฉะนั้นจะถูกมองเป็นเพจปลอม

### Functional requirements — เว็บแชท

P = Priority (M = Must สำหรับ MVP, S = Should, C = Could)

| ID | Requirement | P |
| --- | --- | --- |
| W-01 | รับข้อความภาษาไทยแบบพูดทั่วไป แยก intent เป็น "บริการ" ใน Service Catalog (หนึ่งข้อความอาจได้หลายบริการ เช่น แจ้งความ + ทำบัตรใหม่) | M |
| W-02 | ถามคำถามคัดแยก (slot filling) เท่าที่จำเป็น ไม่เกิน 3–4 คำถาม แสดงเป็นปุ่มตัวเลือกเมื่อทำได้ | M |
| W-03 | สร้าง Checklist เอกสารและสิ่งที่ต้องทำก่อนไป จาก Service Catalog เท่านั้น (ห้าม LLM แต่งเอกสารเอง) ติ๊กได้ แสดงแหล่งอ้างอิงและวันที่อัปเดตข้อมูล | M |
| W-04 | บอกว่าเรื่องนี้ทำออนไลน์จบได้ไหม ถ้าได้ ให้ลิงก์ไปช่องทางทางการ (ทางรัฐ, thaipoliceonline, DLT) แทนการเดินทาง | M |
| W-13 | ถ้าไม่มั่นใจ (ไม่มีบริการใน catalog หรือความมั่นใจต่ำ) ต้องบอกตรง ๆ และให้เบอร์สายด่วนหน่วยงาน (1111, 1584, 1555, 1441) | M |
| W-14 | เหตุฉุกเฉิน (มีคนบาดเจ็บ กำลังเกิดเหตุ) → หยุด flow และแสดง 191 / 1669 ทันที | M |

### ความเสี่ยงและคำถามเปิด

| ID | ความเสี่ยง | ผลกระทบ | ทางรับมือ |
| --- | --- | --- | --- |
| RK-03 | LLM แต่งข้อมูล | คำแนะนำผิดทางกฎหมาย | Checklist/สถานที่มาจาก DB เท่านั้น LLM ทำแค่เลือก serviceId และสรุปภาษา |

## Out of scope here

- W-05, W-06, W-07 jurisdiction, location input, planner → 12-office-finder (chat skips `location` questions and hands off via `routes.plan(t)`)
- W-08, W-09 routes and trip chaining → 22-route-timing (chat only sets `parent_case_id` order; routing and timing are theirs)
- W-10, W-12, W-17 time saved, case page, calendar → 13-case-tracker (chat links to `routes.case(t)`)
- W-11, L-07 send to LINE, ask in LINE → 21-line-oa (LINE binding and LINE chat run in their slice)
- W-15, W-16 OCR, multi-language → 31-phase2-extras (Phase 2 per M-05)
- N-01, N-02, N-04, N-05, LLM01–LLM10 guardrails, PII masking, allowlist (shared libs) → 00-foundation (chat calls `lib/ai`, `lib/security`, `staleness`, badges)
- N-08 "ข้อมูลนี้ไม่ตรง" report page → 92-admin-catalog (chat only links to its route)
- J1, J1b, J3 end-to-end journeys → 20-journeys-e2e (chat provides the turns; e2e owns the journey tests)
- M-02 verified content for the 5 services → 91-demo-catalog (chat reads whatever catalog rows are published)
