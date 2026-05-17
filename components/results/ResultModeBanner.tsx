import type { ResultMode } from '@/lib/types'

const banners: Record<string, { bg: string; text: string; message: string }> = {
  'DATA-ONLY': {
    bg: 'border-yellow-800 bg-yellow-950',
    text: 'text-yellow-300',
    message: 'AI insights temporarily unavailable — showing evidence-based results from USCIS data and community submissions.',
  },
  'PARTIAL': {
    bg: 'border-orange-800 bg-orange-950',
    text: 'text-orange-300',
    message: 'USCIS data may be stale — showing community data only. Results may not reflect latest processing times.',
  },
}

export function ResultModeBanner({ mode }: { mode: ResultMode }) {
  if (mode === 'FULL') return null
  const b = banners[mode]
  if (!b) return null
  return (
    <div className={`rounded border px-4 py-3 text-sm ${b.bg} ${b.text}`}>
      ⚠️ {b.message}
    </div>
  )
}
