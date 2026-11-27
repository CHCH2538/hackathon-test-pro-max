import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const slices = {
  chat: ['src/app/chat', 'src/app/api/chat'],
  'office-finder': ['src/app/plan', 'src/app/api/plan'],
  'case-tracker': ['src/app/c', 'src/app/api/case'],
  line: ['src/app/line', 'src/app/api/line'],
  'route-timing': ['src/app/trip', 'src/app/api/trip'],
  'smart-pass': ['src/app/pass', 'src/app/api/pass'],
  phase2: ['src/app/wallet', 'src/app/api/wallet'],
  admin: ['src/app/admin', 'src/app/api/admin', 'src/app/report'],
}

const ALL_FEATURES = '^@/features(/|$)'

function restrict(featureRegex, blockDbServer) {
  return {
    'no-restricted-imports': [
      'error',
      {
        paths: blockDbServer
          ? [{ name: '@/lib/db/server', message: 'Server-only DB client; not allowed in client files.' }]
          : [],
        patterns: [
          {
            regex: featureRegex,
            message: 'Slices meet only through DB tables, src/lib/routes.ts and shared libs.',
          },
        ],
      },
    ],
  }
}

const sliceConfigs = Object.entries(slices).flatMap(([feature, appDirs]) => {
  const roots = [`src/features/${feature}`, ...appDirs]
  const own = `^@/features/(?!${feature}(/|$))`
  return [
    { files: roots.map((r) => `${r}/**`), rules: restrict(own, false) },
    { files: roots.map((r) => `${r}/**/*.client.tsx`), rules: restrict(own, true) },
  ]
})

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'node_modules/**',
    'src/lib/db/database.types.ts',
    'playwright-report/**',
    'test-results/**',
    'supabase/**',
    'next-env.d.ts',
  ]),
  { files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'], rules: restrict(ALL_FEATURES, false) },
  { files: ['src/components/**', '**/*.client.tsx'], rules: restrict(ALL_FEATURES, true) },
  ...sliceConfigs,
])
