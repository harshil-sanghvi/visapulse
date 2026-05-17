function scoreColor(score: number) {
  if (score >= 71) return { label: 'Low Risk', textColor: 'text-green-400' }
  if (score >= 41) return { label: 'Moderate Risk', textColor: 'text-amber-400' }
  return { label: 'High Risk', textColor: 'text-red-400' }
}

export function PulseScore({ score, reasoning }: { score: number; reasoning?: string }) {
  const { textColor, label } = scoreColor(score)
  const barWidth = `${score}%`

  return (
    <div className="rounded-lg border border-gray-800 bg-[#111113] p-5 text-center">
      <div className="mb-1 text-xs uppercase tracking-widest text-gray-500">Visa Pulse Score</div>
      <div className={`text-7xl font-bold leading-none ${textColor}`}>{score}</div>
      <div className="mt-1 text-sm text-gray-400">{label}</div>
      <div className="mt-3 h-1.5 rounded-full bg-gray-800">
        <div className="h-1.5 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-green-400" style={{ width: barWidth }} />
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-600">
        <span>High Risk</span><span>Low Risk</span>
      </div>
      {reasoning && <p className="mt-3 text-xs text-gray-500 italic">{reasoning}</p>}
    </div>
  )
}
