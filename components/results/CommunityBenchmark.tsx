export function CommunityBenchmark({ data, status, country }: { data: { n: number; median_approval_months?: number }; status: string; country: string }) {
  if (data.n < 10) {
    return (
      <div className="rounded-lg border border-gray-800 bg-[#0c1a2e] p-4 text-sm text-gray-500">
        📊 Not enough community data for your exact profile yet. Be among the first to contribute.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-blue-900 bg-[#0c1a2e] p-4">
      <div className="mb-2 text-xs uppercase tracking-widest text-blue-400">📊 Community Benchmark</div>
      <p className="text-sm text-blue-200">
        <strong className="text-white">{data.n} people</strong> with your profile ({country} · {status.replace(/_/g, ' ').toUpperCase()}) reported
        {data.median_approval_months
          ? <> a median approval of <strong className="text-white">{data.median_approval_months} months</strong>.</>
          : <> data — more results expected soon.</>
        }
      </p>
      <p className="mt-1 text-xs text-gray-600">Based on anonymized community submissions · Updated in real-time</p>
    </div>
  )
}
