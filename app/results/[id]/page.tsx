import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { getCommunityBenchmark } from '@/lib/community'
import { PulseScore } from '@/components/results/PulseScore'
import { SubScoreCard } from '@/components/results/SubScoreCard'
import { CommunityBenchmark } from '@/components/results/CommunityBenchmark'
import { AIInsight } from '@/components/results/AIInsight'
import { TransparencyPanel } from '@/components/results/TransparencyPanel'
import { ShareButton } from '@/components/results/ShareButton'
import { ResultModeBanner } from '@/components/results/ResultModeBanner'
import type { Scores, AnalyzeResult, ResultMode, AnalyzeInput } from '@/lib/types'
import type { Metadata } from 'next'

async function getResult(id: string): Promise<AnalyzeResult | null> {
  const { data, error } = await supabaseAdmin
    .from('submissions')
    .select('id, status, country_of_birth, service_center, degree_level, scores, result_mode, created_at')
    .eq('id', id)
    .single()

  if (error || !data) return null

  const communityInput = {
    status: data.status,
    country_of_birth: data.country_of_birth,
    service_center: data.service_center,
    degree_level: data.degree_level,
  } as AnalyzeInput
  const community = await getCommunityBenchmark(communityInput).catch(() => ({ n: 0 }))

  const scores = data.scores as Scores
  return {
    id: data.id,
    scores,
    mode: data.result_mode as ResultMode,
    sources: {
      community_n: community.n,
      median_approval_months: community.median_approval_months,
      ai_provider: scores.ai_provider ?? null,
    },
    input_summary: {
      status: data.status,
      country_of_birth: data.country_of_birth,
      service_center: data.service_center,
    },
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const result = await getResult(id)
  if (!result) return { title: 'VisaPulse' }
  return {
    title: `Visa Pulse: ${result.scores.pulse_score}/100 — VisaPulse`,
    description: `Travel: ${result.scores.travel_risk?.toUpperCase()} · ${result.input_summary.status.replace(/_/g, ' ').toUpperCase()} · ${result.input_summary.country_of_birth}`,
  }
}

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getResult(id)
  if (!result) notFound()

  const { scores, mode } = result

  return (
    <main className="mx-auto max-w-xl px-4 py-12 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Visa<span className="text-amber-400">Pulse</span></h1>
        <span className="text-xs text-gray-600 uppercase tracking-widest">
          {result.input_summary.status.replace(/_/g, ' ')} · {result.input_summary.country_of_birth}
        </span>
      </div>

      <ResultModeBanner mode={mode} />

      <PulseScore score={scores.pulse_score} reasoning={scores.pulse_score_reasoning} />

      {(scores.sub_scores ?? []).length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {scores.sub_scores.map((s) => <SubScoreCard key={s.label} score={s} />)}
        </div>
      )}

      <CommunityBenchmark
        data={{ n: result.sources.community_n, median_approval_months: result.sources.median_approval_months }}
        status={result.input_summary.status}
        country={result.input_summary.country_of_birth}
      />

      {scores.ai_insight && result.sources.ai_provider && (
        <AIInsight insight={scores.ai_insight} provider={result.sources.ai_provider} />
      )}

      <TransparencyPanel result={result} />

      <ShareButton
        id={result.id}
        score={scores.pulse_score}
        travelRisk={scores.travel_risk}
        approvalMonths={scores.approval_months}
      />

      <div className="text-center">
        <a href="/" className="text-xs text-gray-600 hover:text-gray-400 underline">← Check another profile</a>
      </div>
    </main>
  )
}
