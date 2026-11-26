# Requirements Document

## Introduction

12-office-finder. Wave 1 · executor machine-c · depends on: 00-foundation

## Requirements

### Functional requirements — เว็บแชท

P = Priority (M = Must สำหรับ MVP, S = Should, C = Could)

| ID | Requirement | P |
| --- | --- | --- |
| W-05 | หาหน่วยงานตามกฎเขตอำนาจ: คดีอาญา → สน. ที่รับผิดชอบจุดเกิดเหตุ (point-in-polygon), งานทะเบียน → เขตใดก็ได้หรือเฉพาะเขตที่มีทะเบียนบ้าน ตามกติกาใน catalog | M |
| W-06 | รับตำแหน่ง 3 แบบ: GPS เครื่อง, ปักหมุดบนแผนที่, พิมพ์ชื่อสถานที่ (geocode) และให้ผู้ใช้ยืนยันก่อนสรุป สน. | M |
| W-07 | Planner: เสนอสถานที่ + วัน/ช่วงเวลาที่เหมาะ โดยดูเวลาทำการ วันหยุดราชการ ช่วงพักเที่ยง และวันที่ผู้ใช้สะดวก | M |

### Functional requirements — วางแผนเดินทาง (Google Maps Platform)

| ID | Requirement | Google API | P |
| --- | --- | --- | --- |
| T-01 | แปลงชื่อสถานที่ที่พิมพ์ (จุดเกิดเหตุ, จุดต้นทาง) เป็นพิกัด ด้วย autocomplete ที่จำกัดพื้นที่กรุงเทพฯ | Places API (New) Autocomplete + Place Details, Geocoding API | M |
| T-04 | เปรียบเทียบสำนักงานที่เลือกได้หลายแห่ง (เช่น 3 เขต, 2 สำนักงานขนส่ง) เรียงตามเวลาเดินทางจริง ไม่ใช่ระยะทางตรง → ใช้ใน W-07 | Routes API — Compute Route Matrix | M |
| T-05 | แสดงแผนที่บนเว็บ: หมุดสำนักงานที่แนะนำ จุดต้นทาง และเส้นทาง (polyline) ปักหมุดจุดเกิดเหตุได้บนแผนที่เดียวกัน (W-06) | Maps JavaScript API | M |
| T-06 | ปุ่ม "นำทางใน Google Maps" ทั้งบนเว็บและใน Flex Message ของ LINE เปิดแอป Google Maps พร้อมปลายทางและโหมดเดินทาง | Maps URLs (deep link) | M |
| T-10 | ถ้า API ล้มหรือเกินโควตา แสดงที่อยู่ เบอร์โทร สถานีรถไฟฟ้าใกล้สุด (จาก catalog) + ลิงก์ Maps URLs แทน แผนไม่ล้มทั้ง flow | — | M |

- **T-C4 เงื่อนไขการใช้งาน:** แสดง attribution ของ Google ตามที่กำหนด และตรวจเงื่อนไขการ cache ผลลัพธ์ใน Google Maps Platform Terms ก่อน cache เส้นทาง

### Architecture, MVP และ KPI

| ID | KPI | วิธีวัด | เป้า demo |
| --- | --- | --- | --- |
| K-03 | ความแม่นยำการเลือก สน./สำนักงาน | test set จุดเกิดเหตุ | ≥ 95% |

### ความเสี่ยงและคำถามเปิด

| ID | ความเสี่ยง | ผลกระทบ | ทางรับมือ |
| --- | --- | --- | --- |
| RK-01 | บอก สน. ผิดท้องที่ | ผู้ใช้เสียเที่ยว เสียความเชื่อถือ | แสดงความมั่นใจ + เบอร์ สน. ให้โทรยืนยัน; จุดใกล้เส้นแบ่งเขตแสดง 2 สน. |

## Out of scope here

- W-08, W-09, T-02, T-03, T-07, T-C1, T-C5 routes, leave-home time, trip chaining, transit coverage → 22-route-timing (office-finder picks the office; route-timing computes routes and timing)
- T-08, L-08 morning re-route and special-event alerts → 30-smart-pass (Phase 2 paid features)
- T-09 static map in LINE Flex → 21-line-oa (LINE message rendering is theirs)
- T-C2, T-C3, D-03 Maps cost controls, origin privacy, jurisdiction schema → 00-foundation (shared Maps client and schema)
- W-01, W-02, W-03, W-04 intent, triage questions, checklist, online check → 11-chat-triage (chat hands off via `routes.plan(t)`)
- W-12, W-17 anonymous case page, calendar → 13-case-tracker (case page and .ics are theirs)
- D-12, D-13, D-14, M-04 office coordinates, district and police polygons → 91-demo-catalog (seed data, office-finder only queries it)
- RK-02 stale catalog content → 92-admin-catalog (catalog upkeep and error reports)
