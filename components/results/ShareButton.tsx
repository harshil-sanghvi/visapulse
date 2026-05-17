'use client'
import { useState } from 'react'

export function ShareButton({
  id,
  score,
  travelRisk,
  approvalMonths,
}: {
  id: string
  score: number
  travelRisk: string
  approvalMonths?: number
}) {
  const [copied, setCopied] = useState(false)

  const url =
    typeof window !== 'undefined' ? `${window.location.origin}/results/${id}` : `/results/${id}`
  const text = `My Visa Pulse: ${score}/100 · Travel: ${travelRisk.toUpperCase()}${
    approvalMonths ? ` · Approval: ~${approvalMonths}mo` : ''
  } · ${url}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleCopy}
        className="flex-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111113] px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        {copied ? '✓ Copied!' : 'Share my Pulse →'}
      </button>
      <span className="text-xs text-gray-400 dark:text-gray-600 whitespace-nowrap">
        {score}/100 · {travelRisk.toUpperCase()}
      </span>
    </div>
  )
}
