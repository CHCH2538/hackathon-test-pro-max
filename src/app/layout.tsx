import type { Metadata, Viewport } from 'next'
import { Noto_Sans_Thai } from 'next/font/google'
import { cookies } from 'next/headers'
import { EmergencyBar } from '@/components/shell/EmergencyBar'
import { Footer } from '@/components/shell/Footer'
import { Header } from '@/components/shell/Header'
import { TrustBanner } from '@/components/shell/TrustBanner'
import './globals.css'

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  display: 'swap',
  variable: '--font-noto-sans-thai',
})

const FONT_SCALES = ['100', '125', '150'] as const
type FontScale = (typeof FONT_SCALES)[number]

function toFontScale(v: string | undefined): FontScale {
  return FONT_SCALES.find((s) => s === v) ?? '100'
}

export const metadata: Metadata = {
  title: {
    default: 'Bangkok Flow | ผู้ช่วยบริการรัฐแบบแชท',
    template: '%s | Bangkok Flow',
  },
  description:
    'ผู้ช่วยวางแผนติดต่อหน่วยงานรัฐในกรุงเทพฯ บอกเอกสารที่ต้องเตรียม สำนักงานที่ต้องไป และวันเวลาที่เหมาะสม เว็บไซต์นี้ไม่ใช่เว็บไซต์ของหน่วยงานราชการ',
  applicationName: 'Bangkok Flow',
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const fontScale = toFontScale((await cookies()).get('bf_fs')?.value)
  return (
    <html lang="th" data-font-scale={fontScale} className={notoSansThai.variable}>
      <body className="flex min-h-dvh flex-col bg-white font-sans text-slate-900 antialiased">
        <a
          href="#main"
          className="sr-only rounded-lg bg-blue-800 px-4 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-950 focus-visible:outline-solid"
        >
          ข้ามไปยังเนื้อหาหลัก
        </a>
        <TrustBanner />
        <Header />
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 focus:outline-none">
          {children}
        </main>
        <EmergencyBar variant="bar" />
        <Footer />
      </body>
    </html>
  )
}
