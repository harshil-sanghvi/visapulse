import { supabaseAdmin } from './supabase'
import type { AnalyzeInput, CommunityBenchmark } from './types'

export async function getCommunityBenchmark(input: AnalyzeInput): Promise<CommunityBenchmark> {
  const isOptStatus = input.status === 'opt' || input.status === 'stem_opt'

  let query = supabaseAdmin
    .from('submissions')
    .select('scores')
    .eq('status', input.status)
    .eq('country_of_birth', input.country_of_birth)

  if (isOptStatus && input.degree_level) {
    query = query.eq('degree_level', input.degree_level)
  } else if (!isOptStatus && input.service_center) {
    query = query.eq('service_center', input.service_center)
  }

  const { data, error } = await query.limit(500)

  if (error || !data || data.length < 10) {
    return { n: data?.length ?? 0 }
  }

  const approvalMonths = data
    .map(r => (r.scores as { approval_months?: number })?.approval_months)
    .filter((v): v is number => typeof v === 'number')
    .sort((a, b) => a - b)

  const pulseScores = data
    .map(r => (r.scores as { pulse_score?: number })?.pulse_score)
    .filter((v): v is number => typeof v === 'number')
    .sort((a, b) => a - b)

  const median = (arr: number[]) => {
    if (!arr.length) return undefined
    const mid = Math.floor(arr.length / 2)
    return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid]
  }

  return {
    n: data.length,
    median_approval_months: median(approvalMonths),
    median_pulse_score: median(pulseScores),
  }
}
