import Link from 'next/link'
import { HotlineLink } from '@/components/ui/HotlineLink'
import { NOT_GOV_SITE_TH } from '@/lib/ai/disclaimers'
import { hotlines, routes } from '@/lib/routes'

const FOOTER_LINKS = [
  { href: routes.about, labelTh: 'เกี่ยวกับเรา' },
  { href: routes.privacy, labelTh: 'นโยบายความเป็นส่วนตัว' },
  { href: routes.terms, labelTh: 'ข้อกำหนดการใช้งาน' },
  { href: routes.report(), labelTh: 'ข้อมูลนี้ไม่ตรง' },
] as const

const FOOTER_HOTLINES = [
  { number: hotlines.police, labelTh: 'เหตุด่วนเหตุร้าย' },
  { number: hotlines.ems, labelTh: 'เจ็บป่วยฉุกเฉิน' },
  { number: hotlines.techCrime, labelTh: 'ศูนย์ปราบปรามอาชญากรรมทางเทคโนโลยี' },
  { number: hotlines.govCenter, labelTh: 'ศูนย์บริการข้อมูลภาครัฐ' },
  { number: hotlines.dlt, labelTh: 'กรมการขนส่งทางบก' },
  { number: hotlines.bma, labelTh: 'กรุงเทพมหานคร' },
] as const

const LINK_CLASSES =
  'inline-flex min-h-12 items-center text-blue-800 underline hover:text-blue-950 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-950 focus-visible:outline-solid'

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-300 bg-slate-50 px-4 py-6 text-base text-slate-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <nav aria-label="ลิงก์ท้ายหน้า">
          <ul className="flex flex-wrap gap-x-4">
            {FOOTER_LINKS.map(({ href, labelTh }) => (
              <li key={href}>
                <Link href={href} className={LINK_CLASSES}>
                  {labelTh}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <section aria-labelledby="footer-hotlines">
          <h2 id="footer-hotlines" className="mb-1 text-lg font-bold">
            สายด่วน
          </h2>
          <ul className="grid gap-1 sm:grid-cols-2">
            {FOOTER_HOTLINES.map(({ number, labelTh }) => (
              <li key={number}>
                <HotlineLink number={number} labelTh={labelTh} />
              </li>
            ))}
          </ul>
        </section>
        <p className="font-semibold">{NOT_GOV_SITE_TH}</p>
      </div>
    </footer>
  )
}
