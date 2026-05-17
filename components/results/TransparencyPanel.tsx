'use client'
import { useState } from 'react'
import type { AnalyzeResult } from '@/lib/types'

export function TransparencyPanel({ result }: { result: AnalyzeResult }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border border-gray-800">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        <span className="uppercase tracking-widest">How we calculated this</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="border-t border-gray-800 px-4 py-3 text-xs text-gray-500 space-y-2">
          <div>Result mode: <span className="text-gray-300 font-medium">{result.mode}</span></div>
          <div>AI provider: <span className="text-gray-300">{result.sources.ai_provider ?? 'None (data-only)'}</span></div>
          <div>Community sample: <span className="text-gray-300">{result.sources.community_n} submissions</span></div>
          {result.sources.uscis_fetched_at && (
            <div>USCIS data as of: <span className="text-gray-300">{new Date(result.sources.uscis_fetched_at).toLocaleString()}</span></div>
          )}
          <a
            href="https://egov.uscis.gov/processing-times/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-blue-500 hover:underline"
          >
            → View official USCIS processing times
          </a>
        </div>
      )}
    </div>
  )
}
