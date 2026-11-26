# Implementation Plan: 13-case-tracker

## Overview

Wave 1, executor machine-a, Jira KAN-5. Builds the anonymous case page `/c/[token]`, the `POST /api/case` write API and the `.ics` download, as described in `design.md`. Every task edits only `src/app/c/**`, `src/app/api/case/**` and `src/features/case-tracker/**`. Demo quality: no automated tests. Code has no explanatory comments (`// MARK:` is allowed).

## Tasks

- [ ] 1. Replace the placeholder with a read-only case page
  - [ ] 1.1 Build the loader and header
    - `server/load.ts`: `loadCasePage(token)` calling `getCaseByToken`, `getService` per service, `getAgency`; returns `{ view, services, isPolice }` or null
    - `server/index.ts` re-exports `loadCasePage`
    - `components/CaseHeader.tsx`: `h1` from service names, status `Chip` with `CASE_STATUS_LABEL_TH`, appointment and leave-home time in Thai
    - `src/app/c/[token]/page.tsx`: replace `SlicePlaceholder`; `getSessionId`, `rateLimit('case_read', sid)`, `notFound()` on null, `robots` noindex, police `Alert` with `NOT_POLICE_CHANNEL_TH`; `trackEvent('case_viewed')`
    - Files: `src/features/case-tracker/server/{load.ts,index.ts}`, `src/features/case-tracker/components/CaseHeader.tsx`, `src/app/c/[token]/page.tsx`
    - _Requirements: W-12_

  - [ ] 1.2 Show the checklist, office and online channel read-only
    - `labels.ts` with kind headings; `ChecklistPanel` rendering grouped items, "ถ้า…" labels, one `SourceBadge` + `StaleBadge` per service, "ข้อมูลนี้ไม่ตรง" links via `routes.report`
    - `OfficePanel` (address, phone, station, today's hours, "นำทางใน Google Maps" via `directionsUrl` + `ExternalLink`); `OnlinePanel` for `onlineOnly` cases (`ExternalLink`, `HotlineLink`)
    - Files: `src/features/case-tracker/labels.ts`, `src/features/case-tracker/components/{ChecklistPanel,OfficePanel,OnlinePanel}.tsx`, `src/app/c/[token]/page.tsx`
    - _Requirements: W-12_

- [ ] 2. Write API and ticking
  - [ ] 2.1 Add `CaseActionSchema` and `POST /api/case`
    - Discriminated union `tick | book | transition | calendar` from design; server checks `appointmentAt` is in the future and < 365 days
    - Route: parse, `getSessionId`, `rateLimit('case_write', sid)`, dispatch to `setChecklistItem` / `transitionCase`, map `TransitionResult` reasons to 404/409/400, `trackEvent('checklist_ticked' | 'calendar_added')`, `toSafeResponse` on errors
    - Files: `src/features/case-tracker/schemas.ts`, `src/app/api/case/route.ts`
    - _Requirements: W-12_

  - [ ] 2.2 Make the checklist tickable
    - Turn `ChecklistPanel` into a client component with `Checkbox`, optimistic update, revert on error, progress line "เตรียมแล้ว x/y"
    - Files: `src/features/case-tracker/components/ChecklistPanel.tsx`
    - _Requirements: W-12_

- [ ] 3. Status actions
  - [ ] 3.1 Build `StatusActions`
    - Buttons from `CASE_TRANSITIONS[status]` filtered by `canTransition` and excluding `due`; `datetime-local` booking form converting to `+07:00` ISO; confirm step for cancel; `router.refresh()` after success; 409 message "สถานะเปลี่ยนไปแล้ว"
    - Files: `src/features/case-tracker/components/StatusActions.tsx`, `src/app/c/[token]/page.tsx`
    - _Requirements: W-12_

- [ ] 4. Time saved
  - [ ] 4.1 Implement `estimateTimeSaved` and `TimeSavedCard`
    - Formula and Thai basis lines from design; `loadCasePage` persists `timeSavedMin` with `updateCase` only when it changed
    - Files: `src/features/case-tracker/timeSaved.ts`, `src/features/case-tracker/components/TimeSavedCard.tsx`, `src/features/case-tracker/server/load.ts`, `src/app/c/[token]/page.tsx`
    - _Requirements: W-10_

- [ ] 5. Add to calendar
  - [ ] 5.1 Implement `buildIcs` and `googleCalendarUrl`
    - Start at `departAt ?? appointmentAt`, end at appointment + duration, description with leave-home time, directions link, checklist and case link, `VALARM TRIGGER:-P1D`; RFC 5545 escaping, 75-octet folding, CRLF; Google `details` capped at 1,500 chars
    - Files: `src/features/case-tracker/calendar.ts`
    - _Requirements: W-17_

  - [ ] 5.2 Add the `.ics` route and `CalendarButtons`
    - `GET /api/case/[token]/ics`: 404 unknown token, 409 without appointment, `text/calendar` attachment, `no-store`, `calendar_added { kind: 'ics' }`
    - `CalendarButtons`: Google link (posts `calendar` action for the event) and `.ics` download via `api.caseIcs(token)`; disabled with a hint before booking
    - Files: `src/app/api/case/[token]/ics/route.ts`, `src/features/case-tracker/components/CalendarButtons.tsx`, `src/app/c/[token]/page.tsx`
    - _Requirements: W-17_

- [ ] 6. Return to the case later
  - [ ] 6.1 Add `NextLinks` and `RecentCases`
    - `NextLinks`: plan, trip, "ส่งเข้า LINE" (`routes.lineLink`, hidden when bound), copy link and `navigator.share` with the no-sign-up note
    - `RecentCases`: `localStorage['bf_cases']` list (max 10, validated with `isCaseToken`), links to other cases, remove button
    - Files: `src/features/case-tracker/components/{NextLinks,RecentCases}.tsx`, `src/app/c/[token]/page.tsx`
    - _Requirements: W-12_

- [ ] 7. Checkpoint: demo walk-through
  - Run `npm run lint`, `npm run typecheck`, `npm run build`
  - After `npm run db:reset`, open each demo token from design "Testing Strategy" on a phone-sized viewport at font scale 150; tick an item, book a date, download the `.ics` and import it into a calendar app, confirm the 1-day alarm
  - Ask the user if anything fails

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "4.1", "5.1"] },
    { "id": 2, "tasks": ["2.2", "3.1", "5.2", "6.1"] },
    { "id": 3, "tasks": ["7"] }
  ]
}
```

## Notes

- Uses only foundation contracts; no shared file changes are needed.
- Leave-home time comes from 22-route-timing through `cases.depart_at`; this slice only displays it.
