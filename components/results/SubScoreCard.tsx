import type { SubScore } from '@/lib/types'

const sourceColors: Record<string, string> = {
  'USCIS': 'bg-blue-900 text-blue-300',
  'Community': 'bg-green-900 text-green-300',
  'AI-estimated': 'bg-purple-900 text-purple-300',
  'Deterministic': 'bg-gray-800 text-gray-400',
}

function riskColor(value: string) {
  const v = value.toLowerCase()
  if (v === 'safe' || v === 'low') return 'text-green-400'
  if (v === 'caution' || v === 'medium') return 'text-amber-400'
  if (v === 'avoid' || v === 'high') return 'text-red-400'
  return 'text-slate-200'
}

export function SubScoreCard({ score }: { score: SubScore }) {
  const isRiskValue = ['safe','caution','avoid','low','medium','high'].includes(String(score.value).toLowerCase())
  const valueClass = isRiskValue ? riskColor(String(score.value)) : 'text-blue-300'

  return (
    <div className="rounded-lg border border-gray-800 bg-[#111113] p-4">
      <div className="mb-2 text-xs uppercase tracking-widest text-gray-500">{score.label}</div>
      <div className={`text-2xl font-bold ${valueClass}`}>{score.value}</div>
      <div className={`mt-2 inline-block rounded px-1.5 py-0.5 text-xs ${sourceColors[score.source] ?? 'bg-gray-800 text-gray-400'}`}>
        {score.source}
      </div>
    </div>
  )
}
