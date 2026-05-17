'use client'
import { useState } from 'react'
import type { VisaStatus } from '@/lib/types'

const statuses: { value: VisaStatus; label: string; sub: string }[] = [
  { value: 'opt', label: 'F1 (OPT)', sub: 'Regular OPT' },
  { value: 'stem_opt', label: 'F1 (STEM OPT)', sub: 'STEM Extension' },
  { value: 'h1b_pending', label: 'H1B Pending', sub: 'Filed, awaiting' },
  { value: 'h1b_approved', label: 'H1B Approved', sub: 'Approved & working' },
]

const guidanceNotes: Record<VisaStatus, string> = {
  opt: 'Regular OPT gives you 12 months of work authorization. Your main risk is the H1B lottery — if not selected, you must leave or change status by your OPT expiry date.',
  stem_opt: 'STEM OPT extends your authorization up to 3 years. If your H1B was filed before your OPT expires, cap-gap protection automatically covers you through Sept 30.',
  h1b_pending: 'Your H1B petition is filed and awaiting USCIS decision. Do not travel internationally without a valid H1B visa stamp. Premium processing ($2,805) reduces the wait to 15 business days.',
  h1b_approved: 'Your H1B is approved. Key risks are visa stamp expiry (required for international re-entry) and employer changes. Verify your I-94 reflects H1B status.',
}

export function StatusSelector({
  value,
  onChange,
}: {
  value: VisaStatus | null
  onChange: (v: VisaStatus) => void
}) {
  const [hovered, setHovered] = useState<VisaStatus | null>(null)
  const activeNote = hovered ?? value

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {statuses.map(s => (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange(s.value)}
            onMouseEnter={() => setHovered(s.value)}
            onMouseLeave={() => setHovered(null)}
            className={`rounded-md border px-3 py-3 text-left transition-colors ${
              value === s.value
                ? 'border-amber-400 bg-amber-950 dark:bg-[#1c1400] text-white'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-white dark:hover:bg-[#16161a]'
            }`}
          >
            <div className="text-sm font-medium">{s.label}</div>
            <div className={`text-xs mt-0.5 ${value === s.value ? 'text-amber-400' : 'opacity-60'}`}>{s.sub}</div>
          </button>
        ))}
      </div>

      {activeNote && (
        <div className="rounded-md border border-green-200 dark:border-green-900 bg-green-50 dark:bg-[#0c1a0c] px-3 py-2.5 text-xs text-green-700 dark:text-green-300 leading-relaxed">
          {guidanceNotes[activeNote]}
        </div>
      )}
    </div>
  )
}
