# Requirements Document

## Introduction

22-route-timing. Wave 2 · executor machine-c · depends on: 00-foundation

## Requirements

### Functional requirements — เว็บแชท

P = Priority (M = Must สำหรับ MVP, S = Should, C = Could)

| ID | Requirement | P |
| --- | --- | --- |
| W-08 | เส้นทาง เวลาเดินทาง และเวลาที่ควรออกจากบ้าน ผ่าน Google Maps Platform (รายละเอียดดู T-01 ถึง T-10) | S |
| W-09 | รวมหลายธุระเป็นแผนเดียว (trip chaining) เช่น แจ้งความแล้วไปเขตในวันเดียวกัน เรียงลำดับตามเงื่อนไขก่อนหลัง | S |

### Functional requirements — วางแผนเดินทาง (Google Maps Platform)

| ID | Requirement | Google API | P |
| --- | --- | --- | --- |
| T-02 | คำนวณเส้นทางจากจุดต้นทางไปสำนักงาน 4 โหมด: ขนส่งสาธารณะ, รถยนต์, มอเตอร์ไซค์, เดิน แสดงเวลา ระยะทาง และขั้นตอน (สาย BTS/MRT/รถเมล์ จุดต่อรถ) | Routes API — Compute Routes (TRANSIT / DRIVE / TWO\_WHEELER / WALK) | M |
| T-03 | คำนวณ "เวลาที่ควรออกจากบ้าน" จากเวลานัด: ขนส่งสาธารณะใช้ arrivalTime, รถยนต์ใช้ departureTime + traffic-aware บวก buffer (หาที่จอด / เดินเข้าอาคาร) → ใช้ในแจ้งเตือน L-02 | Routes API — Compute Routes (TRAFFIC\_AWARE) | M |
| T-07 | รวมหลายธุระในวันเดียว (W-09): เส้นทางผ่านหลายจุดตามลำดับที่บังคับ (สน. ก่อน เขตทีหลัง) และเช็กว่าทันเวลาทำการของทุกจุด | Routes API — Compute Routes + intermediates | S |

- **T-C1 ต้นทุน:** Google Maps คิดเงินตาม SKU แต่ละ SKU มีโควตาฟรีรายเดือนของตัวเอง (Essentials 10,000 ครั้ง, Pro 5,000 ครั้ง — [pricing categories](https://developers.google.com/maps/billing-and-pricing/pricing-categories)) คำขอที่ใช้ TRAFFIC\_AWARE ถูกคิดเป็น Pro ([Routes API billing](https://developers.google.com/maps/documentation/routes/usage-and-billing)) → ใช้ traffic-aware เฉพาะตอนคำนวณเวลาออกจากบ้าน (T-03, T-08) ส่วนการเปรียบเทียบสำนักงานใช้ Essentials
- **T-C5 ความครบของข้อมูลขนส่งสาธารณะ:** ต้องทดสอบว่าโหมด TRANSIT ในกรุงเทพฯ ครอบคลุมรถเมล์และเรือแค่ไหน ถ้าไม่พบเส้นทาง ให้แสดงเส้นทางรถยนต์/มอเตอร์ไซค์แทน

## Out of scope here

- T-04, T-06, T-10 office comparison, Maps deep link, API fallback → 12-office-finder (they pick the office and own the fallback view)
- T-08 morning re-route by live traffic → 30-smart-pass (Phase 2 paid feature)
- T-09 static map in LINE Flex → 21-line-oa (LINE message rendering is theirs)
- T-C2, T-C3 Maps cost controls, origin privacy → 00-foundation (shared Maps client and data rules)
