export function CommunityBenchmark({
  data,
  status,
  country,
}: {
  data: { n: number; median_approval_months?: number }
  status: string
  country: string
}) {
  if (data.n < 10) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0c1a2e] p-4 text-sm text-gray-500 dark:text-gray-500">
        📊 Not enough community data for your exact profile yet. Be among the first to contribute.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-[#0c1a2e] p-4">
      <div className="mb-2 text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400">
        📊 Community Benchmark
      </div>
      <p className="text-sm text-blue-800 dark:text-blue-200">
        <strong className="text-gray-900 dark:text-white">{data.n} people</strong> with your profile
        ({country} · {status.replace(/_/g, ' ').toUpperCase()}) reported
        {data.median_approval_months ? (
          <>
            {' '}a median approval of{' '}
            <strong className="text-gray-900 dark:text-white">{data.median_approval_months} months</strong>.
          </>
        ) : (
          <> data — more results expected soon.</>
        )}
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-600">
        Based on anonymized community submissions · Updated in real-time
      </p>
    </div>
  )
}
