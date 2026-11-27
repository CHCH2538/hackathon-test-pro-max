import { LinkButton } from '@/components/ui'
import { routes } from '@/lib/routes'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">ไม่พบหน้านี้</h1>
      <p>ลิงก์อาจหมดอายุหรือไม่ถูกต้อง</p>
      <div>
        <LinkButton href={routes.home}>กลับหน้าแรก</LinkButton>
      </div>
    </div>
  )
}
