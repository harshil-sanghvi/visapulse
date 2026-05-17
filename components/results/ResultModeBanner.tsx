import type { ResultMode } from '@/lib/types'

export function ResultModeBanner({ mode }: { mode: ResultMode }) {
  if (mode === 'FULL') return null

  if (mode === 'DATA-ONLY') {
    return (
      <div className="rounded border border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950 px-4 py-2.5 text-xs text-yellow-700 dark:text-yellow-300">
        <strong>Data-only mode</strong> — AI synthesis unavailable. Scores are deterministic only.
      </div>
    )
  }

  return (
    <div className="rounded border border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-950 px-4 py-2.5 text-xs text-orange-700 dark:text-orange-300">
      <strong>Partial mode</strong> — USCIS data and AI synthesis unavailable. Results may be less accurate.
    </div>
  )
}
