# Requirements Document

## Introduction

30-smart-pass. Wave 4 (Phase 2) · executor unassigned · depends on: 00-foundation

## Requirements

### Functional requirements — วางแผนเดินทาง (Google Maps Platform)

| ID | Requirement | Google API | P |
| --- | --- | --- | --- |
| T-08 | เช้าวันนัด คำนวณเส้นทางใหม่ตามสภาพจราจรจริง ถ้าเวลาเดินทางเพิ่มเกิน 15 นาที ส่ง push บอกให้ออกเร็วขึ้น | Routes API (TRAFFIC\_AWARE) + Scheduler | S |

### Functional requirements — LINE OA

| ID | Requirement | P |
| --- | --- | --- |
| L-08 | แจ้งเหตุการณ์พิเศษตามเส้นทางเช้าวันนัด (ฝนหนัก น้ำท่วมขัง หน่วยงานปิดกรณีพิเศษ) | C |

### Business model: จ่ายเป็นครั้ง ไม่ใช่จ่ายทุกเดือน

- **BP-01** คำแนะนำพื้นฐานที่ช่วยให้ไม่เสียเที่ยว (Checklist, หน่วยงานที่ต้องไป, เส้นทาง, เพิ่มลงปฏิทิน) **ฟรีตลอด** เก็บเงินเฉพาะความสะดวกที่มีต้นทุนจริง → ลดคำตำหนิว่าเก็บเงินค่าบริการรัฐ
- **BP-02** สิ่งที่ได้ใน Plan Pass (โหมด Smart ต่อ 1 Case): push เตือนทุกขั้น (L-02), เวลาออกจากบ้านตามจราจรจริง + คำนวณใหม่เช้าวันนัด (T-03, T-08), ต่อขั้นถัดไปอัตโนมัติ (L-06), รวมหลายธุระ (W-09, T-07), เตือนเหตุพิเศษ (L-08)
- **BP-03** ตั้งราคาจากต้นทุนต่อ Case (จำนวน push × ค่า LINE + จำนวน Routes Pro + token LLM) คูณส่วนเผื่อ และเทียบกับค่าเดินทางเที่ยวเดียวที่ผู้ใช้ประหยัดได้ → ราคา Pass ควรต่ำกว่าค่าเดินทาง 1 เที่ยวชัดเจน (ตัวเลขจริงต้องทดสอบกับผู้ใช้)
- **BP-04** Case แรกของผู้ใช้ใหม่ได้โหมด Smart ฟรี 1 ครั้ง เพื่อให้เห็นความต่างก่อนตัดสินใจซื้อ

| ID | Requirement | P |
| --- | --- | --- |
| B-01 | ปุ่ม "อัปเกรด Case นี้เป็น Smart" แสดงสิ่งที่จะได้เพิ่มและราคาก่อนจ่าย ไม่ตัดฟีเจอร์ฟรีที่ใช้อยู่ | M |
| B-02 | ชำระผ่าน payment gateway (PromptPay QR / บัตร) บนเว็บ ไม่เก็บข้อมูลบัตรเอง ออกใบเสร็จอิเล็กทรอนิกส์ | M |
| B-03 | Wallet เครดิต: ยอดคงเหลือ วันหมดอายุ (12 เดือน) ประวัติการใช้ ดูได้ทั้งเว็บและ LINE | M |
| B-04 | คืนเครดิตอัตโนมัติถ้ายกเลิก Case ก่อนมี push แรก | S |
| B-05 | โอน/ใช้ Pass ให้สมาชิกครอบครัว (คู่กับ P2-02) | S |
| B-06 | โค้ดจากองค์กร/สปอนเซอร์ แลกเป็น Pass ได้ + รายงานการใช้ให้ผู้ซื้อ (ไม่เปิดเผยรายละเอียด Case) | C |

## Out of scope here

- P2-01, P2-02 document wallet, family care → 31-phase2-extras (B-05 and the Family plan depend on them)
- L-02, L-06 base reminders, auto next step → 21-line-oa (Smart mode gates them; LINE slice builds them)
- T-03, W-09, T-07 leave-home time, trip chaining → 22-route-timing (Smart mode gates them; route-timing builds them)
- OQ-06 Pass price and pack size → open decision, unassigned (needs user testing)
