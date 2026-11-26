# Requirements Document

## Introduction

31-phase2-extras. Wave 3 (Phase 2) · executor unassigned · depends on: 00-foundation

## Requirements

### หน่วยงานและบริการที่ครอบคลุม

**AG-06 ระยะต่อไป:** สำนักงานที่ดิน (จดทะเบียนต่างสำนักงาน) ประกันสังคม กรมการกงสุล (พาสปอร์ต) สรรพากร การไฟฟ้านครหลวง การประปานครหลวง

### Functional requirements — เว็บแชท

P = Priority (M = Must สำหรับ MVP, S = Should, C = Could)

| ID | Requirement | P |
| --- | --- | --- |
| W-15 | อ่านรูปเอกสาร (OCR) เช่น ถ่ายใบขับขี่เพื่ออ่านวันหมดอายุ โดยไม่เก็บรูป | C |
| W-16 | หลายภาษา (อังกฤษ พม่า กัมพูชา) | C |

### Architecture, MVP และ KPI

| ID | KPI | วิธีวัด | เป้า demo |
| --- | --- | --- | --- |
| K-05 | เที่ยวที่ประหยัดได้ (ไม่ต้องไปซ้ำเพราะเอกสารไม่ครบ) | แบบสอบถามหลังวันนัดผ่าน LINE | รายงานจริง |

### Roadmap: Phase 1 และ Phase 2

- **P2-01 กระเป๋าเอกสาร:** ผู้ใช้บันทึกวันหมดอายุเอกสารหลายรายการไว้ที่เดียว (บัตรประชาชน ใบขับขี่ ภาษีรถ พาสปอร์ต) เก็บแค่ประเภทกับวันที่ ไม่เก็บเลขเอกสาร
- **P2-02 ดูแลแทนครอบครัว:** ลูกหลานตั้ง Case และรับแจ้งเตือนแทนผู้สูงอายุ พร้อม Checklist กรณีมอบอำนาจ
- **P2-03 คาดการณ์ช่วงคนน้อย:** ให้ผู้ใช้รายงานเวลารอจริงหลังเสร็จธุระ (1 คำถาม) แล้วนำมาแนะนำวันและช่วงเวลาใน W-07
- **P2-04 เชื่อมระบบรัฐ:** ถ้าได้ความร่วมมือ ดึงคิวว่างจาก BMA Q / DLT มาแสดงตรง แทนการลิงก์ออก

## Out of scope here

- B-01, B-02, B-03, B-04, B-05, B-06 Smart upgrade, payment, wallet credits → 30-smart-pass (billing is theirs)
- L-03 expiry reminders → 21-line-oa (LINE pushes are theirs; the wallet only stores type and date)
- W-07 planner day/time suggestion → 12-office-finder (P2-03 wait-time data feeds their planner)
