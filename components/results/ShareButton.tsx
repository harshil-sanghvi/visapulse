'use client'
import { useState } from 'react'

export function ShareButton({ id, score, travelRisk, approvalMonths }: {
  id: string
  score: number
  travelRisk: string
  approvalMonths?: number
}) {
  const [copied, setCopied] = useState(false)

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/results/${id}`
    : `/results/${id}`
  const text = `My Visa Pulse: ${score}/100 · Travel: ${travelRisk.toUpperCase()}${approvalMonths ? ` · Approval: ~${approvalMonths}mo` : ''} · ${url}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="text-center space-y-2">
      <button
        onClick={handleCopy}
        className="rounded-md bg-blue-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        {copied ? '✓ Copied!' : 'Share my Pulse Score →'}
      </button>
      <p className="text-xs text-gray-600">Share the link — no account needed to view</p>
    </div>
  )
}
