# Requirements Document

## Introduction

00-foundation. Wave 0 · executor machine-a · depends on: none

## Requirements

### Functional requirements — วางแผนเดินทาง (Google Maps Platform)

**ข้อกำหนดประกอบ**

- **T-C2 ควบคุมค่าใช้จ่าย:** ใช้ field mask ขอเฉพาะ field ที่ใช้, ตั้ง quota และ budget alert ใน Google Cloud, ปุ่มนำทางใช้ Maps URLs แทนการเรียก API
- **T-C3 ความเป็นส่วนตัว:** จุดต้นทางมักเป็นบ้านผู้ใช้ → เก็บผูกกับ Case เท่านั้น ลบพร้อม Case (N-03) และไม่ส่งพิกัดเข้า LLM

### Functional requirements — LINE OA

**D-10 สถานะ Case:** วางแผนแล้ว → นัดแล้ว → ถึงวันนัด → เสร็จ (หรือ เลื่อน → นัดแล้ว, ยกเลิก ได้ทุกจุด)

### Data model และแหล่งข้อมูล

| ID | Entity | Field หลัก |
| --- | --- | --- |
| D-01 | Agency | id, ชื่อ, ประเภท (เขต / สน. / ขนส่ง / อื่น ๆ), สายด่วน, เว็บไซต์ |
| D-02 | Office | id, agencyId, ชื่อสาขา, lat/lng, ที่อยู่, โทร, เวลาทำการ (รวมเสาร์/พักเที่ยง), สถานีรถไฟฟ้าใกล้สุด, ลิงก์จองคิว |
| D-03 | Jurisdiction | officeId, polygon (GeoJSON), ประเภท (เขตรับผิดชอบ สน. / เขตปกครอง) |
| D-04 | Service | id, ชื่อ, คำพ้อง/ตัวอย่างประโยค, agencyId, กติกาเลือกสาขา (ตามจุดเกิดเหตุ / ทะเบียนบ้าน / ที่ใดก็ได้), ช่องทางออนไลน์, ค่าธรรมเนียม, เวลาที่ใช้โดยประมาณ, sourceUrl, lastVerified |
| D-05 | Requirement | serviceId, เงื่อนไข (เช่น เฉพาะกรณีมอบอำนาจ), เอกสาร/ขั้นตอน, ต้องใช้ฉบับจริง/สำเนา |
| D-06 | ServiceLink | fromServiceId, toServiceId, เงื่อนไข (แจ้งความบัตรหาย → ทำบัตรใหม่) |
| D-07 | Case | id, sessionId, lineUserId?, serviceIds, คำตอบ slot, officeId ที่เลือก, วันนัด, สถานะ, สถานะติ๊ก checklist, expiresAt |
| D-08 | Reminder | caseId, ประเภท, sendAt, สถานะ (รอส่ง / ส่งแล้ว / ยกเลิก) |
| D-09 | Holiday | วันที่, ชื่อ, หน่วยงานที่ปิด |

### Non-functional requirements

| ID | ด้าน | Requirement |
| --- | --- | --- |
| N-01 | ความถูกต้อง | ทุก Checklist แสดงแหล่งอ้างอิง + lastVerified; ข้อมูลเกิน 90 วันติดป้าย "ควรโทรยืนยัน" |
| N-02 | AI guardrail | LLM ตอบจาก catalog เท่านั้น (grounded) ไม่ให้คำปรึกษาทางกฎหมาย ไม่ฟันธงว่าเป็นคดีอะไร มี test set คำถามจริง วัดอัตราตอบผิด |
| N-03 | PDPA | เก็บเท่าที่จำเป็น: ไม่เก็บเลขบัตรประชาชน รูปเอกสาร หรือรายละเอียดคดีเกินจำเป็น; ขอความยินยอมก่อนผูก LINE; Case หมดอายุและลบอัตโนมัติ (เช่น 30 วันหลังเสร็จ) |
| N-04 | ข้อมูลอ่อนไหว | ข้อความแชทที่ส่งเข้า LLM ผ่านการปิดบัง PII (เลข 13 หลัก เบอร์โทร เลขบัญชี) ก่อนเก็บ log |
| N-05 | ความน่าเชื่อถือ | แสดงชัดว่าไม่ใช่เว็บราชการ ลิงก์ออกไปเฉพาะโดเมน .go.th / โดเมนทางการที่อยู่ใน allowlist ไม่ขอเงินหรือรหัสผ่าน |
| N-06 | ประสิทธิภาพ | คำตอบแรกภายใน 3 วินาที (streaming); แจ้งเตือนคลาดเคลื่อนไม่เกิน 5 นาที |
| N-07 | การเข้าถึง | mobile-first, ตัวอักษรปรับใหญ่ได้, ปุ่มใหญ่ สำหรับผู้สูงอายุ, WCAG 2.1 AA, พิมพ์คำผิด/ภาษาพูดก็เข้าใจ |
| N-09 | ต้นทุน | จำกัด token/คำตอบ, จำกัด push ต่อ Case, cache คำตอบบริการยอดนิยม |

### Architecture, MVP และ KPI

**Scope MVP สำหรับ demo**

- **M-01** พื้นที่: กรุงเทพฯ เท่านั้น
- **M-05** MVP = Phase 1 (ดู Roadmap) ย้ายไป Phase 2: OCR, หลายภาษา, แจ้งเตือนฝน/รถติด

### Tech stack และ Security

**OWASP Top 10:2025 — สิ่งที่ต้องมีตั้งแต่ prototype** ([OWASP](https://owasp.org/Top10/2025/))

| หมวด | ความเสี่ยงในระบบนี้ | Prototype (วัน hackathon) | เพิ่มใน Production |
| --- | --- | --- | --- |
| A01 Broken Access Control | เดา caseId แล้วดู Case คนอื่น (IDOR), SSRF | caseToken สุ่ม 128-bit, RLS ทุกตาราง, server ไม่ fetch URL ที่ผู้ใช้ส่งมา | ทดสอบ authorization อัตโนมัติใน CI |
| A02 Security Misconfiguration | คีย์หลุดฝั่ง client, RLS ลืมเปิด | Claude/LINE secret อยู่ server เท่านั้น, Maps key ฝั่ง browser จำกัด referrer + API, ส่ง CSP/HSTS/X-Frame-Options | IaC + config review, หมุนเวียน key |
| A03 Software Supply Chain Failures | package ปลอม/มีช่องโหว่ | lockfile, dependency น้อยที่สุด, npm audit | Dependabot, SBOM, secret scanning |
| A04 Cryptographic Failures | ข้อมูลรั่วระหว่างทาง | HTTPS ทุกที่, ไม่เก็บเลขบัตรประชาชน/เอกสาร, token สร้างด้วย crypto RNG | Encryption at rest + KMS |
| A05 Injection | SQL injection, XSS จากข้อความผู้ใช้หรือ LLM | query แบบ parameterized, validate input ด้วย schema (zod), ไม่ใช้ dangerouslySetInnerHTML กับผล LLM | SAST (CodeQL) |
| A06 Insecure Design | AI แต่งข้อมูลราชการ | LLM เลือกได้แค่ serviceId จาก catalog, rate limit ต่อ session/IP | Threat modeling ทุก feature ใหม่ |
| A07 Authentication Failures | ปลอมตัวเป็นผู้ใช้ LINE | ไม่ทำระบบรหัสผ่านเอง, LINE Login ตรวจ ID token ฝั่ง server, cookie HttpOnly + Secure + SameSite | MFA สำหรับหน้า admin |
| A08 Software or Data Integrity Failures | webhook ปลอมส่งเข้า LINE route | ตรวจ X-Line-Signature (HMAC-SHA256) ทุก request | ตรวจ signature webhook การจ่ายเงิน, deploy จาก CI เท่านั้น |
| A09 Logging & Alerting Failures | โดนโจมตีแล้วไม่รู้ หรือ log มี PII | log แบบไม่มี PII: signature fail, rate-limit hit, error | SIEM + แจ้งเตือนทีม |
| A10 Mishandling of Exceptional Conditions | error เผย stack trace, พังแบบเปิดช่อง | fail closed, ข้อความ error ทั่วไป, timeout + fallback (T-10) | Chaos/resilience test |

**OWASP Top 10 for LLM Applications 2025 — ข้อที่เกี่ยวกับระบบนี้** ([OWASP GenAI](https://genai.owasp.org/llm-top-10/))

| หมวด | Control ใน prototype |
| --- | --- |
| LLM01 Prompt Injection | แยกข้อความผู้ใช้ออกจากคำสั่ง, ให้ tool แค่อ่าน catalog, ตรวจผลด้วย schema ก่อนใช้ |
| LLM02 Sensitive Information Disclosure | ปิดบัง PII ก่อนส่ง (N-04), ไม่ส่งพิกัดบ้านเข้า LLM |
| LLM05 Improper Output Handling | ถือผล LLM เป็นข้อมูลไม่น่าเชื่อ, ลิงก์ต้องอยู่ใน allowlist .go.th (N-05) |
| LLM06 Excessive Agency | AI ไม่มี tool ที่ส่งข้อความ จ่ายเงิน หรือยื่นเรื่องแทนผู้ใช้ |
| LLM07 System Prompt Leakage | ไม่ใส่ secret หรือกติกาสิทธิ์ใน prompt |
| LLM09 Misinformation | Checklist มาจาก DB พร้อมแหล่งอ้างอิง (N-01) |
| LLM10 Unbounded Consumption | จำกัดความยาวข้อความ, max\_tokens, rate limit, budget alert |

### ความเสี่ยงและคำถามเปิด

| ID | ความเสี่ยง | ผลกระทบ | ทางรับมือ |
| --- | --- | --- | --- |
| RK-04 | ถูกมองเป็นเพจปลอม (มิจฉาชีพชอบแอบอ้างรัฐใน LINE) | คนไม่กล้าใช้ | ชื่อ OA ไม่เลียนแบบหน่วยงาน ไม่ขอเงิน/รหัส/เลขบัญชี ประกาศชัดในทุกข้อความ หาพันธมิตรรัฐในระยะต่อไป |

## Out of scope here

- W-03 Checklist generation → 11-chat-triage (foundation only provides catalog queries, SourceBadge/StaleBadge for N-01)
- X-01 police-report disclaimer in chat → 11-chat-triage
- W-12 anonymous case page → 13-case-tracker (foundation provides session cookie + lib/case)
- W-11, L-01–L-09, L-C3 LINE features → 21-line-oa (foundation pre-declares cron + env)
- T-C1 traffic-aware usage policy → 22-route-timing
- T-C4 Google attribution / cache terms → 12-office-finder
- N-08 admin catalog editing + report button → 92-admin-catalog (foundation provides admin auth stub + catalog_reports table)
- D-11–D-15, M-02, M-04 real verified catalog content and pilot polygons → 91-demo-catalog (foundation seeds only minimal fixtures)
- M-03 demo flows → 20-journeys-e2e
- K-01–K-05 KPIs → 20-journeys-e2e / 12-office-finder / 92-admin-catalog / 31-phase2-extras (foundation provides the event log table)
