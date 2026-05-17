import { NextRequest, NextResponse } from 'next/server'
import { analyzeInputSchema } from '@/lib/schema'
import { getUscisProcessingTime } from '@/lib/uscis'
import { getCommunityBenchmark } from '@/lib/community'
import { synthesizeWithAI } from '@/lib/ai'
import { computeTravelRisk, computeLotteryOdds, computeCapGapDays, computeDeterministicPulseScore, buildSubScores } from '@/lib/scores'
import { supabaseAdmin } from '@/lib/supabase'
import type { AnalyzeInput, AnalyzeResult, ResultMode, Scores, CommunityBenchmark } from '@/lib/types'

export async function POST(req: NextRequest) {
  // 1. Validate input
  let input: AnalyzeInput
  try {
    const body = await req.json()
    input = analyzeInputSchema.parse(body) as AnalyzeInput
  } catch (e: unknown) {
    return NextResponse.json({ error: 'Invalid input', details: (e as Error).message }, { status: 400 })
  }

  // 2. Fetch USCIS processing times (with cache)
  let uscis = null
  if (input.status === 'h1b_pending' && input.service_center) {
    try {
      uscis = await getUscisProcessingTime('I-129', input.service_center)
    } catch (e) {
      console.error('USCIS fetch failed:', e)
    }
  }

  // 3. Community benchmarks
  let community: CommunityBenchmark = { n: 0 }
  try {
    community = await getCommunityBenchmark(input)
  } catch (e) {
    console.error('Community benchmark failed:', e)
  }

  // 4. AI synthesis with fallback
  let aiScores: Partial<Scores> | null = null
  let provider: 'gemini' | 'groq' | null = null
  try {
    const result = await synthesizeWithAI(input, uscis, community)
    aiScores = result.scores
    provider = result.provider
  } catch (e) {
    console.error('AI synthesis threw unexpectedly:', e)
  }

  // 5. Determine result mode
  let mode: ResultMode = 'FULL'
  if (!provider) mode = 'DATA-ONLY'
  if (!provider && !uscis) mode = 'PARTIAL'

  // 6. Build final scores — AI where available, deterministic fallback
  const travelRisk = aiScores?.travel_risk ?? computeTravelRisk(input)
  const rfeRisk = aiScores?.rfe_risk ?? undefined
  const lotteryOdds = aiScores?.lottery_odds ?? (
    (input.status === 'opt' || input.status === 'stem_opt') ? computeLotteryOdds(input.degree_level) : undefined
  )
  const capGapDays = aiScores?.cap_gap_days ?? (
    (input.status === 'opt' || input.status === 'stem_opt') && input.opt_expiry && input.h1b_filed
      ? computeCapGapDays(input.opt_expiry) : undefined
  )
  const approvalMonths = aiScores?.approval_months ?? uscis?.min_months
  const pulseScore = aiScores?.pulse_score ?? computeDeterministicPulseScore({
    travel_risk: travelRisk,
    rfe_risk: rfeRisk,
    lottery_odds: lotteryOdds,
    uscis_min_months: uscis?.min_months,
    uscis_max_months: uscis?.max_months,
  })

  const baseSubScores = buildSubScores(input, uscis ? { min: uscis.min_months, max: uscis.max_months } : undefined)

  // Append RFE risk to sub_scores for H1B pending (AI-sourced when available, else omitted)
  if (input.status === 'h1b_pending' && rfeRisk) {
    baseSubScores.push({
      label: 'RFE Risk',
      value: rfeRisk.toUpperCase(),
      source: provider ? 'AI-estimated' : 'Deterministic',
      shown: true,
    })
  }

  const scores: Scores = {
    pulse_score: pulseScore,
    lottery_odds: lotteryOdds,
    approval_months: approvalMonths,
    approval_p80_months: aiScores?.approval_p80_months ?? uscis?.max_months,
    travel_risk: travelRisk,
    rfe_risk: rfeRisk,
    cap_gap_days: capGapDays,
    ai_insight: aiScores?.ai_insight,
    pulse_score_reasoning: aiScores?.pulse_score_reasoning,
    sub_scores: baseSubScores,
    ai_provider: provider,
  }

  // 7. Store anonymized submission (no PII — receipt_number excluded)
  const { data: submission, error: insertError } = await supabaseAdmin
    .from('submissions')
    .insert({
      status: input.status,
      country_of_birth: input.country_of_birth,
      service_center: input.service_center ?? null,
      degree_level: input.degree_level ?? null,
      filing_date: input.filing_date ?? null,
      scores,
      result_mode: mode,
    })
    .select('id')
    .single()

  if (!submission) {
    console.error('Supabase insert failed:', insertError)
    return NextResponse.json({ error: 'Failed to store result' }, { status: 500 })
  }

  const result: AnalyzeResult = {
    id: submission.id,
    scores,
    mode,
    sources: {
      uscis_fetched_at: uscis?.fetched_at,
      community_n: community.n,
      ai_provider: provider,
    },
    input_summary: {
      status: input.status,
      country_of_birth: input.country_of_birth,
      service_center: input.service_center,
    },
  }

  return NextResponse.json(result)
}
