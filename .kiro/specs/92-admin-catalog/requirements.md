# Requirements Document

## Introduction

92-admin-catalog. Wave 1 · executor kiro-cloud · depends on: 00-foundation

## Requirements

### Non-functional requirements

| ID | ด้าน | Requirement |
| --- | --- | --- |
| N-08 | ดูแลข้อมูล | หน้า admin ให้คนแก้ catalog ได้โดยไม่ต้อง deploy; ปุ่ม "ข้อมูลนี้ไม่ตรง" ให้ผู้ใช้แจ้งกลับ |

### Architecture, MVP และ KPI

| ID | KPI | วิธีวัด | เป้า demo |
| --- | --- | --- | --- |
| K-02 | % เรื่องที่จบออนไลน์โดยไม่ต้องเดินทาง | Case ที่ระบบชี้ไปช่องทางออนไลน์ | รายงานจริง |
| K-04 | % Case ที่ผูก LINE | Case ที่มี lineUserId | รายงานจริง |

### ความเสี่ยงและคำถามเปิด

| ID | ความเสี่ยง | ผลกระทบ | ทางรับมือ |
| --- | --- | --- | --- |
| RK-02 | เอกสาร/ขั้นตอนเปลี่ยนแต่ catalog ไม่อัปเดต | Checklist ผิด | lastVerified + ปุ่มแจ้งข้อมูลผิด + รอบตรวจทานรายเดือน |

## Out of scope here

- N-01 source and stale badges → 00-foundation (shared `SourceBadge`/`StaleBadge`)
- Catalog content for the 5 services → 91-demo-catalog (seed data, admin only edits it)
- K-01 time from question to plan → 20-journeys-e2e (measured across the journey)
- K-03 office selection accuracy → 12-office-finder (owns the jurisdiction test set)
- K-05 trips saved survey → 31-phase2-extras (Phase 2 survey)
