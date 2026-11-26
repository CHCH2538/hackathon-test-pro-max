# Requirements Document

## Introduction

13-case-tracker. Wave 1 · executor machine-a · depends on: 00-foundation

## Requirements

### Functional requirements — เว็บแชท

P = Priority (M = Must สำหรับ MVP, S = Should, C = Could)

| ID | Requirement | P |
| --- | --- | --- |
| W-10 | แสดง "เวลาที่ประหยัดได้" ต่อแผน (เช่น เลี่ยงการไปซ้ำ 1 เที่ยว) สำหรับ KPI และ pitch | S |
| W-12 | เก็บ Case ได้โดยไม่ต้องสมัคร (anonymous session) และเปิดกลับมาดูได้ผ่านลิงก์ | S |

### Roadmap: Phase 1 และ Phase 2

- **W-17 เพิ่มลงปฏิทิน:** ปุ่มสร้างนัดใน Google Calendar (ลิงก์) หรือไฟล์ .ics สำหรับ iPhone/Outlook ใส่เวลาออกจากบ้าน ที่อยู่ ลิงก์นำทาง และ Checklist ในรายละเอียดนัด ตั้งเตือนล่วงหน้า 1 วัน → ผู้ใช้ได้แจ้งเตือนจากปฏิทินของตัวเองโดยระบบไม่มีต้นทุน (M)

## Out of scope here

- W-11 send to LINE → 21-line-oa (LINE binding runs in their slice)
- L-02, L-03 push reminders → 21-line-oa (scheduled LINE pushes are theirs; case-tracker only offers calendar)
- W-03 checklist creation → 11-chat-triage (chat writes `case_checklist_items`; case page reads and ticks them)
- T-03 leave-home time → 22-route-timing (case page shows the value they compute)
- N-03, T-C3 retention and expiry → 00-foundation (retention cron is shared)
- K-01 time from question to plan → 20-journeys-e2e (measured across the whole journey)
- K-02, K-04 online-only and LINE-bound case reports → 92-admin-catalog (admin reporting)
