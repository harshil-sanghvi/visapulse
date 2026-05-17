import { describe, it, expect } from 'vitest'
import { computeLotteryOdds, computeTravelRisk, computeCapGapDays, computeDeterministicPulseScore } from '@/lib/scores'

describe('computeLotteryOdds', () => {
  it('returns 55 for MS degree (master cap eligible)', () => {
    expect(computeLotteryOdds('MS')).toBe(55)
  })

  it('returns 55 for PhD degree', () => {
    expect(computeLotteryOdds('PhD')).toBe(55)
  })

  it('returns 26 for BS degree', () => {
    expect(computeLotteryOdds('BS')).toBe(26)
  })

  it('returns 26 for undefined degree', () => {
    expect(computeLotteryOdds(undefined)).toBe(26)
  })
})

describe('computeTravelRisk', () => {
  it('returns caution for OPT user with H1B filed', () => {
    expect(computeTravelRisk({ status: 'opt', h1b_filed: true })).toBe('caution')
  })

  it('returns caution for OPT user without H1B filed', () => {
    expect(computeTravelRisk({ status: 'opt', h1b_filed: false })).toBe('caution')
  })

  it('returns avoid for STEM OPT user without H1B filed', () => {
    expect(computeTravelRisk({ status: 'stem_opt', h1b_filed: false })).toBe('avoid')
  })

  it('returns caution for STEM OPT user with H1B filed', () => {
    expect(computeTravelRisk({ status: 'stem_opt', h1b_filed: true })).toBe('caution')
  })

  it('returns caution for H1B pending', () => {
    expect(computeTravelRisk({ status: 'h1b_pending' })).toBe('caution')
  })

  it('returns safe for H1B approved with valid stamp expiring in 400 days', () => {
    const futureDate = new Date(Date.now() + 400 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    expect(computeTravelRisk({ status: 'h1b_approved', visa_stamp_expiry: futureDate })).toBe('safe')
  })

  it('returns caution for H1B approved with stamp expiring in 60 days', () => {
    const soon = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    expect(computeTravelRisk({ status: 'h1b_approved', visa_stamp_expiry: soon })).toBe('caution')
  })

  it('returns avoid for H1B approved with expired stamp', () => {
    const past = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    expect(computeTravelRisk({ status: 'h1b_approved', visa_stamp_expiry: past })).toBe('avoid')
  })
})

describe('computeCapGapDays', () => {
  it('returns positive days when OPT expires before Oct 1 of same year', () => {
    const days = computeCapGapDays('2026-08-15')
    expect(typeof days).toBe('number')
    expect(days).toBeGreaterThan(0)
  })

  it('returns 0 when OPT expires on or after Oct 1', () => {
    expect(computeCapGapDays('2026-10-01')).toBe(0)
    expect(computeCapGapDays('2026-11-15')).toBe(0)
  })
})

describe('computeDeterministicPulseScore', () => {
  it('returns a number between 0 and 100', () => {
    const score = computeDeterministicPulseScore({
      travel_risk: 'safe',
      rfe_risk: 'low',
      lottery_odds: 55,
    })
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('returns lower score for high risk profile than low risk profile', () => {
    const high = computeDeterministicPulseScore({ travel_risk: 'avoid', rfe_risk: 'high', lottery_odds: 10 })
    const low = computeDeterministicPulseScore({ travel_risk: 'safe', rfe_risk: 'low', lottery_odds: 55 })
    expect(high).toBeLessThan(low)
  })
})
