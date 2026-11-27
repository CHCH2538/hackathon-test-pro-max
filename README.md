## Start here

1. Clone
   git clone git@github.com:CHCH2538/hackathon-test-pro-max.git && cd hackathon-test-pro-max
2. Install
   npm install
3. Env
   cp .env.example .env.local
   Ask the lead for the values and paste them into .env.local. Never commit .env.local.
4. Run
   npm run dev        # http://localhost:3000 — open /dev to see every spec and its placeholder
5. Start your work
   Open Claude Code in the repo and paste prompt M1 from PROMPTS.md (replace <a> with your machine letter).

Rules
- Ownership: every path has one owning spec (.kiro/steering/structure.md). Shared paths (package.json, configs,
  src/proxy.ts, src/app/layout.tsx, src/components/**, src/lib/**, supabase/migrations/**, vercel.json,
  .env.example) belong to 00-foundation. Never edit them from a slice branch.
- Need a shared change? (new column, dependency, env var, route constant, cron, event name)
  Open a Jira sub-task under KAN-4 titled "KAN-4 request: <what>" with: the spec asking, the exact change,
  and the requirement ID. The lead (machine-a) makes the change on main; rebase after it merges.
- Pull requests: branch <jira-key>-<short-name>. The PR title must contain your Jira key, e.g. "KAN-6 chat triage buttons".
  Before pushing: npm run lint && npm run typecheck && npm run build.

## Project docs
