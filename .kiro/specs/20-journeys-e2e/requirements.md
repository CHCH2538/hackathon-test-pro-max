# Requirements Document

## Introduction

20-journeys-e2e. Wave 3 · executor machine-a · depends on: 00-foundation

## Requirements

### User journey ตัวอย่าง

**J1 — แจ้งความ (กระเป๋าถูกขโมยที่สยาม)**

1. ผู้ใช้พิมพ์ "กระเป๋าตังค์หายแถวสยาม บัตรประชาชนอยู่ข้างใน"
2. ระบบถามคำถามคัดแยก: หายหรือถูกขโมย? เกิดตรงไหน (ปักหมุดบนแผนที่)? มีบัตรเครดิต/บัตร ATM หายด้วยไหม?
3. ระบบตอบ: คดีนี้ไม่ใช่อาชญากรรมทางเทคโนโลยี ต้องไป สน. ท้องที่ + ชื่อ สน. จากจุดที่ปัก + เบอร์โทร + เส้นทาง
4. Checklist: สิ่งที่ต้องทำก่อนไป (อายัดบัตรธนาคาร) + เอกสารที่ต้องเตรียม + ข้อมูลที่ต้องจำ (เวลา สถานที่ รายการของหาย)
5. แผนต่อ: หลังได้บันทึกแจ้งความ → ทำบัตรประชาชนใหม่ที่เขต (ต่อเป็น J3 อัตโนมัติ)
6. ส่ง Case เข้า LINE OA → เตือนขั้นต่อไปตามวันที่เลือก

**J1b — โดนหลอกโอนเงินออนไลน์:** ระบบพาไป thaipoliceonline.go.th / สายด่วน 1441 พร้อม Checklist หลักฐาน (สลิป แชท เลขบัญชีปลายทาง) ไม่ต้องเดินทาง

**J2 — ต่อใบขับขี่**

1. "ใบขับขี่หมดเดือนหน้า ต้องทำไง"
2. ระบบถาม: ประเภทใบขับขี่? หมดอายุเกินกี่ปี? สะดวกสำนักงานขนส่งไหน?
3. แผนเป็นลำดับ: อบรมออนไลน์ → ยืนยันตัวตน ThaID → จองคิว DLT Smart Queue (ลิงก์ไประบบจริง) → ไปสำนักงานตามนัด
4. ผู้ใช้กรอกวันที่จองได้กลับมาในแชท → LINE OA เตือนก่อนวันนัด 1 วัน และเช้าวันนัด พร้อม Checklist และเวลาออกจากบ้าน

**J3 — ทำบัตรประชาชนใหม่ (บัตรหาย)**

1. ระบบถาม: อยู่ใกล้ที่ไหน? สะดวกวันไหน/ช่วงเวลาไหน? มีบันทึกแจ้งความแล้วหรือยัง?
2. เสนอ 2–3 เขตที่เดินทางสะดวก (ใกล้ BTS/MRT) พร้อมช่วงเวลาที่คนน้อย → ลิงก์จอง BMA Q
3. LINE OA เตือนวันนัด + เตือนเมื่อฝนหนัก/รถติดผิดปกติในเส้นทาง (ระยะต่อไป)

### Architecture, MVP และ KPI

- **M-03** Demo 3 flow: J1 (แจ้งความ → บัตรใหม่ ต่อกันอัตโนมัติ), J2 (ใบขับขี่ + แจ้งเตือน D-1), J1b (เรื่องที่จบออนไลน์ ไม่ต้องเดินทาง)

| ID | KPI | วิธีวัด | เป้า demo |
| --- | --- | --- | --- |
| K-01 | เวลาจากพิมพ์คำถามถึงได้แผน | log timestamp | < 2 นาที |

## Out of scope here

- W-*, T-*, L-* individual features → 11-chat-triage, 12-office-finder, 13-case-tracker, 21-line-oa, 22-route-timing (e2e tests the journeys, slices build the features)
- K-02, K-04 online-only and LINE-bound case reports → 92-admin-catalog (admin reporting)
- K-03 office selection accuracy → 12-office-finder (owns the jurisdiction test set)
- K-05 trips saved survey → 31-phase2-extras (Phase 2 post-appointment survey)
- J3 step 3 rain/traffic alert (ระยะต่อไป) → 30-smart-pass via L-08 (Phase 2, not tested in MVP journeys)
