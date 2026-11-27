import type { CaseToken, Hotline, OfficeId, ServiceId, SpecId, SpecInfo, Uuid } from './contracts'

export type ReportQuery = { serviceId?: ServiceId; requirementId?: Uuid; officeId?: OfficeId }

export function reportUrl(q?: ReportQuery): string {
  const params = new URLSearchParams()
  if (q?.serviceId !== undefined) params.set('serviceId', q.serviceId)
  if (q?.requirementId !== undefined) params.set('requirementId', q.requirementId)
  if (q?.officeId !== undefined) params.set('officeId', q.officeId)
  const qs = params.toString()
  return qs ? `/report?${qs}` : '/report'
}

export const routes = {
  home: '/',
  about: '/about',
  privacy: '/privacy',
  terms: '/terms',
  dev: '/dev',
  chat: '/chat',
  plan: (t: CaseToken) => `/plan/${t}`,
  case: (t: CaseToken) => `/c/${t}`,
  line: '/line',
  liff: '/line',
  lineLink: (t: CaseToken) => `/line/link/${t}`,
  trip: (t: CaseToken) => `/trip/${t}`,
  pass: '/pass',
  passUpgrade: (t: CaseToken) => `/pass/upgrade/${t}`,
  wallet: '/wallet',
  admin: '/admin',
  report: (q?: ReportQuery): string => reportUrl(q),
} as const

export const api = {
  health: '/api/health',
  chat: '/api/chat',
  chatChecklist: '/api/chat/checklist',
  plan: '/api/plan',
  case: '/api/case',
  caseIcs: (t: CaseToken) => `/api/case/${t}/ics`,
  lineWebhook: '/api/line/webhook',
  lineLoginCallback: '/api/line/login/callback',
  lineCronReminders: '/api/line/cron/reminders',
  trip: '/api/trip',
  passWebhook: '/api/pass/webhook',
  passCronReroute: '/api/pass/cron/reroute',
  wallet: '/api/wallet',
  admin: '/api/admin',
  report: '/api/report',
  cronRetention: '/api/cron/retention',
} as const

export const hotlines = {
  police: '191',
  ems: '1669',
  govCenter: '1111',
  dlt: '1584',
  bma: '1555',
  techCrime: '1441',
} as const

export function tel(n: Hotline): `tel:${string}` {
  return `tel:${n.replace(/[^\d+]/g, '')}`
}

export const DEMO_TOKENS: Readonly<
  Record<'planned' | 'booked' | 'due' | 'done' | 'postponed' | 'cancelled' | 'onlineDone', CaseToken>
> = {
  planned: 'demoPlanned0000000000A' as CaseToken,
  booked: 'demoBooked00000000000A' as CaseToken,
  due: 'demoDue00000000000000A' as CaseToken,
  done: 'demoDone0000000000000A' as CaseToken,
  postponed: 'demoPostponed00000000A' as CaseToken,
  cancelled: 'demoCancelled00000000A' as CaseToken,
  onlineDone: 'demoOnline00000000000A' as CaseToken,
}

export const SPECS: readonly SpecInfo[] = [
  {
    id: '00-foundation',
    jira: 'KAN-4',
    wave: 0,
    executor: 'machine-a',
    owns: [
      'package.json',
      'vercel.json',
      '.env.example',
      'src/proxy.ts',
      'src/app/layout.tsx',
      'src/app/globals.css',
      'src/app/dev/**',
      'src/app/api/health/**',
      'src/app/api/cron/retention/**',
      'src/components/ui/**',
      'src/components/shell/**',
      'src/lib/**',
      'supabase/config.toml',
      'supabase/migrations/**',
      'supabase/seed/00_fixtures.sql',
    ],
    href: routes.dev,
    phase2: false,
  },
  {
    id: '13-case-tracker',
    jira: 'KAN-5',
    wave: 1,
    executor: 'machine-a',
    owns: ['src/app/c/**', 'src/app/api/case/**', 'src/features/case-tracker/**'],
    href: routes.case(DEMO_TOKENS.planned),
    phase2: false,
  },
  {
    id: '11-chat-triage',
    jira: 'KAN-6',
    wave: 1,
    executor: 'machine-b',
    owns: ['src/app/chat/**', 'src/app/api/chat/**', 'src/features/chat/**'],
    href: routes.chat,
    phase2: false,
  },
  {
    id: '12-office-finder',
    jira: 'KAN-7',
    wave: 1,
    executor: 'machine-c',
    owns: ['src/app/plan/**', 'src/app/api/plan/**', 'src/features/office-finder/**'],
    href: routes.plan(DEMO_TOKENS.planned),
    phase2: false,
  },
  {
    id: '90-landing-seo',
    jira: 'KAN-8',
    wave: 1,
    executor: 'kiro-cloud',
    owns: [
      'src/app/(marketing)/**',
      'src/app/not-found.tsx',
      'src/app/robots.ts',
      'src/app/sitemap.ts',
      'public/og/**',
    ],
    href: routes.home,
    phase2: false,
  },
  {
    id: '91-demo-catalog',
    jira: 'KAN-9',
    wave: 1,
    executor: 'kiro-cloud',
    owns: ['supabase/seed/10_demo_*.sql', 'data/catalog/**'],
    href: null,
    phase2: false,
  },
  {
    id: '92-admin-catalog',
    jira: 'KAN-10',
    wave: 1,
    executor: 'kiro-cloud',
    owns: [
      'src/app/admin/**',
      'src/app/api/admin/**',
      'src/app/report/**',
      'src/app/api/report/**',
      'src/features/admin/**',
    ],
    href: routes.admin,
    phase2: false,
  },
  {
    id: '21-line-oa',
    jira: 'KAN-12',
    wave: 2,
    executor: 'machine-b',
    owns: ['src/app/line/**', 'src/app/api/line/**', 'src/features/line/**'],
    href: routes.line,
    phase2: false,
  },
  {
    id: '22-route-timing',
    jira: 'KAN-13',
    wave: 2,
    executor: 'machine-c',
    owns: ['src/app/trip/**', 'src/app/api/trip/**', 'src/features/route-timing/**'],
    href: routes.trip(DEMO_TOKENS.planned),
    phase2: false,
  },
  {
    id: '93-docs-pitch',
    jira: 'KAN-14',
    wave: 2,
    executor: 'kiro-cloud',
    owns: ['docs/** (except docs/requirements.md)', 'README.md (except "Start here")'],
    href: null,
    phase2: false,
  },
  {
    id: '20-journeys-e2e',
    jira: 'KAN-11',
    wave: 3,
    executor: 'machine-a',
    owns: ['e2e/**', 'playwright.config.ts'],
    href: null,
    phase2: false,
  },
  {
    id: '30-smart-pass',
    jira: 'KAN-15',
    wave: 4,
    executor: 'unassigned',
    owns: ['src/app/pass/**', 'src/app/api/pass/**', 'src/features/smart-pass/**'],
    href: routes.pass,
    phase2: true,
  },
  {
    id: '31-phase2-extras',
    jira: 'KAN-16',
    wave: 4,
    executor: 'unassigned',
    owns: ['src/app/wallet/**', 'src/app/api/wallet/**', 'src/features/phase2/**'],
    href: routes.wallet,
    phase2: true,
  },
]

export const NAV_ITEMS: readonly { labelTh: string; href: string; spec: SpecId; wave: number }[] = [
  { labelTh: 'หน้าแรก', href: routes.home, spec: '90-landing-seo', wave: 1 },
  { labelTh: 'แชทถามบริการ', href: routes.chat, spec: '11-chat-triage', wave: 1 },
  { labelTh: 'แผนการเดินทาง (ตัวอย่าง)', href: routes.plan(DEMO_TOKENS.planned), spec: '12-office-finder', wave: 1 },
  { labelTh: 'ติดตาม Case (ตัวอย่าง)', href: routes.case(DEMO_TOKENS.planned), spec: '13-case-tracker', wave: 1 },
  { labelTh: 'ผู้ดูแลข้อมูล', href: routes.admin, spec: '92-admin-catalog', wave: 1 },
  { labelTh: 'แจ้งข้อมูลไม่ตรง', href: routes.report(), spec: '92-admin-catalog', wave: 1 },
  { labelTh: 'เชื่อมต่อ LINE', href: routes.line, spec: '21-line-oa', wave: 2 },
  { labelTh: 'เวลาออกเดินทาง (ตัวอย่าง)', href: routes.trip(DEMO_TOKENS.planned), spec: '22-route-timing', wave: 2 },
  { labelTh: 'Smart Pass', href: routes.pass, spec: '30-smart-pass', wave: 4 },
  { labelTh: 'กระเป๋าเอกสาร', href: routes.wallet, spec: '31-phase2-extras', wave: 4 },
  { labelTh: 'สถานะสเปก (dev)', href: routes.dev, spec: '00-foundation', wave: 0 },
]
