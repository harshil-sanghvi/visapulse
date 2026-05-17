export function AIInsight({ insight, provider }: { insight: string; provider: string }) {
  return (
    <div className="rounded-lg border border-purple-900 bg-[#0f0a1e] p-4">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-purple-400">
        ⚡ AI Insight
        <span className="rounded bg-purple-900 px-1.5 py-0.5 text-xs text-purple-300 capitalize">{provider}</span>
      </div>
      <p className="text-sm leading-relaxed text-purple-100">{insight}</p>
      <p className="mt-2 text-xs text-gray-600">AI-generated · may contain errors · verify with an immigration attorney</p>
    </div>
  )
}
