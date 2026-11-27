# data/catalog

Owned by spec `91-demo-catalog` (Jira KAN-9).

Owned paths: `supabase/seed/10_demo_*.sql`, `data/catalog/**`.

Human-verified Service Catalog source data. The seed files upsert over `supabase/seed/00_fixtures.sql` using the same canonical IDs (`on conflict` by `id`, or `(date, name_th)` for holidays).
