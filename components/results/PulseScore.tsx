function riskConfig(score: number): {
  label: string
  textColor: string
  stripClass: string
} {
  if (score >= 71)
    return {
      label: 'Low Risk',
      textColor: 'text-green-500 dark:text-green-400',
      stripClass:
        'bg-gradient-to-r from-green-50 dark:from-green-950 to-transparent border-b border-green-200 dark:border-green-900',
    }
  if (score >= 41)
    return {
      label: 'Moderate Risk',
      textColor: 'text-amber-500 dark:text-amber-400',
      stripClass:
        'bg-gradient-to-r from-amber-50 dark:from-amber-950 to-transparent border-b border-amber-200 dark:border-amber-900',
    }
  return {
    label: 'High Risk',
    textColor: 'text-red-500 dark:text-red-400',
    stripClass:
      'bg-gradient-to-r from-red-50 dark:from-red-950 to-transparent border-b border-red-200 dark:border-red-900',
  }
}

export function PulseScore({ score, reasoning }: { score: number; reasoning?: string }) {
  const { label, textColor, stripClass } = riskConfig(score)

  return (
    <div className={`${stripClass} px-5 py-5 flex flex-wrap gap-6 items-start`}>
      <div className="flex-shrink-0">
        <div className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-1">
          Pulse Score
        </div>
        <div className={`text-6xl font-bold leading-none ${textColor}`}>{score}</div>
        <div className={`text-sm font-semibold mt-1.5 ${textColor}`}>{label}</div>
      </div>

      {reasoning && (
        <div className="flex-1 min-w-[200px] pt-1">
          <div className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-2">
            Why this score
          </div>
          <p className="text-sm italic leading-relaxed text-gray-600 dark:text-gray-300">
            &ldquo;{reasoning}&rdquo;
          </p>
        </div>
      )}
    </div>
  )
}
