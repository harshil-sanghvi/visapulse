'use client'
import type { VisaStatus } from '@/lib/types'

const statuses: { value: VisaStatus; label: string; sub: string }[] = [
  { value: 'opt', label: 'F1 (OPT)', sub: 'Regular OPT' },
  { value: 'stem_opt', label: 'F1 (STEM OPT)', sub: 'STEM Extension' },
  { value: 'h1b_pending', label: 'H1B Pending', sub: 'Filed, awaiting' },
  { value: 'h1b_approved', label: 'H1B Approved', sub: 'Approved & working' },
]

export function StatusSelector({ value, onChange }: { value: VisaStatus | null; onChange: (v: VisaStatus) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {statuses.map(s => (
        <button
          key={s.value}
          type="button"
          onClick={() => onChange(s.value)}
          className={`rounded-md border px-3 py-3 text-left transition-colors ${
            value === s.value
              ? 'border-amber-400 bg-blue-900 text-white font-semibold'
              : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500'
          }`}
        >
          <div className="text-sm font-medium">{s.label}</div>
          <div className="text-xs opacity-60">{s.sub}</div>
        </button>
      ))}
    </div>
  )
}
