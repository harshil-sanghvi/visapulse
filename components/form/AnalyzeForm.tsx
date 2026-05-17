'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StatusSelector } from './StatusSelector'
import { AdaptiveFields } from './AdaptiveFields'
import type { VisaStatus } from '@/lib/types'

function ProgressBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-6">
      <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-2">
        Step {step} of 2 — {step === 1 ? 'Select your status' : 'Your details'}
      </p>
      <div className="flex gap-1.5">
        <div className="h-0.5 flex-1 rounded-full bg-amber-400" />
        <div className={`h-0.5 flex-1 rounded-full ${step === 2 ? 'bg-amber-400' : 'bg-gray-200 dark:bg-gray-800'}`} />
      </div>
    </div>
  )
}

export function AnalyzeForm() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [status, setStatus] = useState<VisaStatus | null>(null)
  const [fields, setFields] = useState<Record<string, string | boolean | undefined>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleField = (field: string, value: string | boolean) => {
    setFields(prev => ({ ...prev, [field]: value }))
  }

  const handleContinue = () => {
    if (status) setStep(2)
  }

  const handleBack = () => {
    setStep(1)
    setError(null)
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <ProgressBar step={step} />

      {step === 1 && (
        <>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500 mb-2">
              Current Status
            </label>
            <StatusSelector value={status} onChange={setStatus} />
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!status}
            className="w-full rounded-md bg-amber-400 py-3 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </>
      )}

      {step === 2 && status && (
        <>
          <AdaptiveFields status={status} values={fields} onChange={handleField} />

          {error && (
            <div className="rounded border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-red-600 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-amber-400 py-3 text-sm font-bold uppercase tracking-widest text-black transition hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze My Visa →'}
          </button>

          <button
            type="button"
            onClick={handleBack}
            className="w-full text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-1"
          >
            ← Back
          </button>
        </>
      )}

      <p className="text-center text-xs text-gray-400 dark:text-gray-600">
        Anonymous · No PII stored · Not legal advice
      </p>
    </form>
  )
}
