import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { getCommunityBenchmark } from '@/lib/community'
import { PulseScore } from '@/components/results/PulseScore'
import { SubScoreCard } from '@/components/results/SubScoreCard'
import { CommunityBenchmark } from '@/components/results/CommunityBenchmark'
import { GuidancePanel } from '@/components/results/GuidancePanel'
import { CitationsPanel } from '@/components/results/CitationsPanel'
import { DisclaimerBar } from '@/components/results/DisclaimerBar'
import { TransparencyPanel } from '@/components/results/TransparencyPanel'
import { ShareButton } from '@/components/results/ShareButton'
import { ResultModeBanner } from '@/components/results/ResultModeBanner'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
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
  const community = await getCommunityBenchmark(communityInput).catch(
    (): { n: number; median_approval_months?: number } => ({ n: 0 })
  )

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const result = await getResult(id)
  if (!result) return { title: 'VisaPulse' }
  return {
    title: `Visa Pulse: ${result.scores.pulse_score}/100 — VisaPulse`,
    description: `Travel: ${result.scores.travel_risk?.toUpperCase()} · ${result.input_summary.status
      .replace(/_/g, ' ')
      .toUpperCase()} · ${result.input_summary.country_of_birth}`,
  }
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getResult(id)
  if (!result) notFound()

  const { scores, mode } = result

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0f]">
      {/* Nav header */}
      <nav className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0d0d0f]">
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          Visa<span className="text-amber-400">Pulse</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 dark:text-gray-600 uppercase tracking-widest hidden sm:block">
            {result.input_summary.status.replace(/_/g, ' ')} · {result.input_summary.country_of_birth}
          </span>
          <ThemeToggle />
        </div>
      </nav>

      <div className="px-4">
        <ResultModeBanner mode={mode} />
      </div>

      {/* Hero score strip — full width, outside card padding */}
      <PulseScore score={scores.pulse_score} reasoning={scores.pulse_score_reasoning} />

      {/* Body content */}
      <main className="mx-auto max-w-xl px-4 py-5 space-y-4">
        {/* Sub-scores: 3-col on sm+, 2-col on mobile */}
        {(scores.sub_scores ?? []).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {scores.sub_scores.map(s => (
              <SubScoreCard key={s.label} score={s} />
            ))}
          </div>
        )}

        {scores.ai_insight && <GuidancePanel insight={scores.ai_insight} />}

        <CitationsPanel citations={scores.citations} />

        <CommunityBenchmark
          data={{
            n: result.sources.community_n,
            median_approval_months: result.sources.median_approval_months,
          }}
          status={result.input_summary.status}
          country={result.input_summary.country_of_birth}
        />

        <DisclaimerBar />

        <ShareButton
          id={result.id}
          score={scores.pulse_score}
          travelRisk={scores.travel_risk}
          approvalMonths={scores.approval_months}
        />

        <TransparencyPanel result={result} />

        <div className="text-center pb-6">
          <a
            href="/"
            className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 underline transition-colors"
          >
            ← Check another profile
          </a>
        </div>
      </main>
    </div>
  )
}
