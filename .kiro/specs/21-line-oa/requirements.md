# Requirements Document

## Introduction

21-line-oa. Wave 2 · executor machine-b · depends on: 00-foundation

## Requirements

### Functional requirements — เว็บแชท

P = Priority (M = Must สำหรับ MVP, S = Should, C = Could)

| ID | Requirement | P |
| --- | --- | --- |
| W-11 | สรุปแผนเป็น Case และปุ่ม "ส่งเข้า LINE" (QR / LINE Login) ผูก Case กับ LINE userId | M |

### Functional requirements — วางแผนเดินทาง (Google Maps Platform)

| ID | Requirement | Google API | P |
| --- | --- | --- | --- |
| T-09 | แผนที่ใน LINE เป็นรูปภาพนิ่งใน Flex Message (หมุดสำนักงาน + เส้นทาง) | Maps Static API | C |

### Functional requirements — LINE OA

| ID | Requirement | P |
| --- | --- | --- |
| L-01 | รับ Case จากเว็บ (deep link / QR ที่มี caseToken) แล้วตอบกลับด้วย Flex Message สรุปแผน + Checklist | M |
| L-02 | แจ้งเตือนตามเวลา (push): ก่อนวันนัด 1 วัน, เช้าวันนัด (เวลาที่ควรออกจากบ้าน), เตือนเอกสารที่ยังไม่ติ๊ก | M |
| L-03 | แจ้งเตือนวันหมดอายุล่วงหน้า (ใบขับขี่ ภาษีรถ บัตรประชาชน พาสปอร์ต) เช่น 60 / 30 / 7 วัน จากวันที่ผู้ใช้กรอกเอง | M |
| L-04 | Rich menu: "Case ของฉัน", "เริ่มเรื่องใหม่" (เปิดเว็บแชทผ่าน LIFF), "สายด่วน" | M |
| L-05 | อัปเดตสถานะ Case เองในแชท (quick reply): จองคิวแล้ว + วันที่, เลื่อนนัด, เสร็จแล้ว, ยกเลิก → ระบบปรับตารางแจ้งเตือนตาม | M |
| L-06 | ต่อขั้นถัดไปอัตโนมัติเมื่อ Case เสร็จ (แจ้งความเสร็จ → เสนอแผนทำบัตรประชาชน) | S |
| L-07 | ถามต่อใน LINE ได้ (ใช้ AI เดียวกับเว็บ มี context ของ Case) | S |
| L-09 | ปิดแจ้งเตือนได้ทุก Case และลบข้อมูลตัวเองทั้งหมดด้วยคำสั่งเดียว | M |

- **L-C1** LINE นับ push message เป็นโควตารายเดือน ส่วน reply message ไม่นับ ([LINE Developers](https://developers.line.biz/en/tips/2026/05/28/how-to-count-messages/)) แต่ LINE ประเทศไทยจะเริ่ม[คิดเงิน Reply API เกิน 25,000 ข้อความ/เดือน ตั้งแต่ ก.พ. 2027](https://www.relevantaudience.com/social-media-marketing/line-reply-api-25000-free-messages-agency-global-platform/) → รวมแจ้งเตือนหลายเรื่องเป็นข้อความเดียว และตั้งเพดานจำนวน push ต่อ Case
- **L-C2** push ได้เฉพาะผู้ใช้ที่เพิ่ม OA เป็นเพื่อน → W-11 ต้องพาผู้ใช้กดเพิ่มเพื่อนก่อนผูก Case
- **L-C3** LINE OA ห้ามรับแจ้งความหรือเอกสารทางการ ทุกข้อความที่เกี่ยวกับคดีต้องมีประโยค "ระบบนี้ไม่ใช่ช่องทางรับแจ้งความ"

### ความเสี่ยงและคำถามเปิด

| ID | ความเสี่ยง | ผลกระทบ | ทางรับมือ |
| --- | --- | --- | --- |
| RK-05 | ค่า LINE สูงเมื่อผู้ใช้เยอะ | ต้นทุนต่อเดือน | รวมแจ้งเตือน, ผู้ใช้เลือกความถี่ได้ |

## Out of scope here

- L-08, T-08 route-event alerts and morning re-route → 30-smart-pass (Phase 2 paid features)
- D-10, N-03, A08 case states, consent and retention, signature check lib → 00-foundation (shared schema, policy and security libs)
- T-03 leave-home time → 22-route-timing (LINE reminders read the value they compute)
- W-17 add to calendar → 13-case-tracker (calendar is the free web reminder path)
