export type SpinnerProps = {
  labelTh?: string
}

export function Spinner({ labelTh = 'กำลังโหลด…' }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-base text-gray-800">
      <span
        aria-hidden="true"
        className="size-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-700 motion-reduce:animate-none"
      />
      <span>{labelTh}</span>
    </span>
  )
}
