# Spec map

Waves run in order. Specs in the same wave run in parallel. Every slice depends only on `00-foundation`. Folder ownership: see `structure.md`. Requirement IDs: `docs/requirements.md`.

| Spec | Wave | Executor | Depends on | Requirement IDs | Jira |
| --- | --- | --- | --- | --- | --- |
| 00-foundation | 0 | machine-a | — | D-01–D-10, M-01, M-05, N-01, N-02, N-03, N-04, N-05, N-06, N-07, N-09, T-C2, T-C3, RK-04, A01–A10, LLM01, LLM02, LLM05, LLM06, LLM07, LLM09, LLM10 || KAN-4 |
| 13-case-tracker | 1 | machine-a | 00-foundation | W-10, W-12, W-17 || KAN-5 |
| 11-chat-triage | 1 | machine-b | 00-foundation | W-01, W-02, W-03, W-04, W-13, W-14, X-01, RK-03 || KAN-6 |
| 12-office-finder | 1 | machine-c | 00-foundation | W-05, W-06, W-07, T-01, T-04, T-05, T-06, T-10, T-C4, RK-01, K-03 || KAN-7 |
| 90-landing-seo | 1 | kiro-cloud | 00-foundation | X-02 || KAN-8 |
| 91-demo-catalog | 1 | kiro-cloud | 00-foundation | D-11–D-15, M-02, M-04, AG-01–AG-05 || KAN-9 |
| 92-admin-catalog | 1 | kiro-cloud | 00-foundation | N-08, RK-02, K-02, K-04 || KAN-10 |
| 20-journeys-e2e | 2 | machine-a | 00-foundation | J1, J1b, J2, J3, M-03, K-01 || KAN-11 |
| 21-line-oa | 2 | machine-b | 00-foundation | W-11, L-01, L-02, L-03, L-04, L-05, L-06, L-07, L-09, T-09, L-C1, L-C2, L-C3, RK-05 || KAN-12 |
| 22-route-timing | 2 | machine-c | 00-foundation | W-08, W-09, T-02, T-03, T-07, T-C1, T-C5 || KAN-13 |
| 93-docs-pitch | 2 | kiro-cloud | 00-foundation | X-03 || KAN-14 |
| 30-smart-pass | 3 (Phase 2) | unassigned | 00-foundation | B-01–B-06, BP-01–BP-04, T-08, L-08 || KAN-15 |
| 31-phase2-extras | 3 (Phase 2) | unassigned | 00-foundation | P2-01–P2-04, W-15, W-16, K-05, AG-06 || KAN-16 |

Not assigned (decisions, not requirements): OQ-01–OQ-06. The 8-hour plan, tech stack table, and business model table are reference context.
