'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StatusSelector } from './StatusSelector'
import { AdaptiveFields } from './AdaptiveFields'
import type { VisaStatus } from '@/lib/types'

export function AnalyzeForm() {
  const router = useRouter()
  const [status, setStatus] = useState<VisaStatus | null>(null)
  const [fields, setFields] = useState<Record<string, string | boolean | undefined>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleField = (field: string, value: string | boolean) => {
    setFields(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!status) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...fields }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      router.push(`/results/${data.id}`)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Current Status</label>
        <StatusSelector value={status} onChange={setStatus} />
      </div>

      {status && (
        <AdaptiveFields status={status} values={fields} onChange={handleField} />
      )}

      {error && (
        <div className="rounded border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!status || loading}
        className="w-full rounded-md bg-amber-400 py-3 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Analyzing...' : 'Analyze My Visa →'}
      </button>

      <p className="text-center text-xs text-gray-600">
        No account needed &middot; Results in ~5 seconds &middot; Anonymous
      </p>
    </form>
  )
}
