import { SlicePlaceholder } from '@/components/shell/SlicePlaceholder'
import { LinkButton } from '@/components/ui'
import { routes } from '@/lib/routes'

export default function HomePage() {
  return (
    <>
      <SlicePlaceholder spec="90-landing-seo" />
      <div className="mx-auto max-w-3xl px-4 pb-4">
        <LinkButton href={routes.chat}>เริ่มแชทถามบริการ</LinkButton>
      </div>
    </>
  )
}
