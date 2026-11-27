## Start here

1. Clone and install
   git clone <repo> && cd <repo>
   nvm use            # Node 24
   npm ci
2. Env
   cp .env.example .env.local
   Fill Supabase keys after step 3. Ask the lead for Claude, Maps and LINE keys. Never commit .env.local.
3. Database (Docker must be running)
   npm run db:start   # prints API URL, publishable key and secret key → paste into .env.local
   npm run db:reset   # applies supabase/migrations, then loads supabase/seed/*.sql
4. Run
   npm run dev        # http://localhost:3000 — open /dev to see every spec and its placeholder
5. Find your slice
   Open .kiro/steering/spec-map.md: your spec, wave, executor and Jira key.
   Open .kiro/steering/structure.md: the folders you own. Edit only those.
6. Ownership rule
   Every path has one owning spec. Shared paths (package.json, configs, src/proxy.ts, src/app/layout.tsx,
   src/components/**, src/lib/**, supabase/migrations/**, vercel.json, .env.example) belong to 00-foundation.
   Never edit them from a slice branch.
7. Need a shared change? (new column, dependency, env var, route constant, cron, event name)
   Open a Jira sub-task under KAN-4 titled "KAN-4 request: <what>" with: the spec asking, the exact change,
   and the requirement ID. The lead (machine-a) makes the change on main; rebase after it merges.
8. Pull requests
   Branch: <jira-key>-<short-name>. The PR title must contain your Jira key, e.g. "KAN-6 chat triage buttons".
   Before pushing: npm run lint && npm run typecheck && npm run build.

## Project docs
