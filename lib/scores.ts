import type { AnalyzeInput, TravelRisk, RFERisk, SubScore } from './types'

export function computeLotteryOdds(degree: string | undefined): number {
  // Based on FY2025 USCIS H1B cap lottery statistics
  if (degree === 'MS' || degree === 'PhD') return 55  // master's cap eligible
  return 26  // cap-subject only
}

export function computeTravelRisk(input: Partial<AnalyzeInput>): TravelRisk {
  const { status, h1b_filed, visa_stamp_expiry } = input

  if (status === 'stem_opt') {
    if (!h1b_filed) return 'avoid'
    return 'caution'
  }

  if (status === 'opt') {
    return 'caution'
  }

  if (status === 'h1b_pending') {
    return 'caution'
  }

  if (status === 'h1b_approved' && visa_stamp_expiry) {
    const daysUntilExpiry = (new Date(visa_stamp_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    if (daysUntilExpiry < 0) return 'avoid'
    if (daysUntilExpiry < 90) return 'caution'
    return 'safe'
  }

  return 'caution'
}

export function computeCapGapDays(optExpiry: string): number {
  // Cap-gap: OPT is extended until Oct 1 if H1B was filed before OPT expired
  const expiryDate = new Date(optExpiry)
  const oct1 = new Date(`${expiryDate.getFullYear()}-10-01`)
  if (oct1 <= expiryDate) return 0
  return Math.ceil((oct1.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24))
}

export function computeDeterministicPulseScore(factors: {
  travel_risk: TravelRisk
  rfe_risk?: RFERisk
  lottery_odds?: number
  approval_months?: number
  uscis_min_months?: number
  uscis_max_months?: number
}): number {
  let score = 80

  if (factors.travel_risk === 'caution') score -= 15
  if (factors.travel_risk === 'avoid') score -= 35

  if (factors.rfe_risk === 'medium') score -= 10
  if (factors.rfe_risk === 'high') score -= 25

  if (factors.lottery_odds !== undefined) {
    if (factors.lottery_odds < 20) score -= 20
    else if (factors.lottery_odds < 35) score -= 10
  }

  if (factors.uscis_max_months !== undefined && factors.uscis_max_months > 8) score -= 10

  return Math.max(0, Math.min(100, Math.round(score)))
}

export function buildSubScores(input: AnalyzeInput, uscisMonths?: { min: number; max: number }): SubScore[] {
  const scores: SubScore[] = []
  const isOpt = input.status === 'opt' || input.status === 'stem_opt'
  const isH1bPending = input.status === 'h1b_pending'

  if (isOpt) {
    scores.push({
      label: 'Lottery Odds',
      value: `~${computeLotteryOdds(input.degree_level)}%`,
      source: 'Deterministic',
      shown: true,
    })
    if (input.opt_expiry && input.h1b_filed) {
      scores.push({
        label: 'Cap-Gap Safety',
        value: `${computeCapGapDays(input.opt_expiry)} days`,
        source: 'Deterministic',
        shown: true,
      })
    }
  }

  if (isH1bPending && uscisMonths) {
    scores.push({
      label: 'Approval Timeline',
      value: `${uscisMonths.min}–${uscisMonths.max} mo`,
      source: 'USCIS',
      shown: true,
    })
  }

  scores.push({
    label: 'Travel Risk',
    value: computeTravelRisk(input).toUpperCase(),
    source: 'Deterministic',
    shown: true,
  })

  return scores
}
