import type { Citation } from '@/lib/types'

export function CitationsPanel({ citations }: { citations?: Citation[] }) {
  if (!citations?.length) return null

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111113] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0d0d0f]">
        <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500 font-semibold">
          Sources &amp; Citations
        </span>
        <span className="text-xs rounded px-2 py-0.5 bg-amber-100 dark:bg-[#1c1400] text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
          Fetched live
        </span>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {citations.map((c, i) => (
          <div key={i} className="flex gap-3 px-4 py-3">
            <span className="flex-shrink-0 text-xs font-bold text-amber-500 dark:text-amber-400 mt-0.5">
              [{i + 1}]
            </span>
            <div className="min-w-0">
              <div className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate">{c.title}</div>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block"
              >
                {c.url}
              </a>
              <div className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                Fetched {new Date(c.fetched_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
