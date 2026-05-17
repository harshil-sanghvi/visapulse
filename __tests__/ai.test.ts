import { describe, it, expect, vi } from 'vitest'

vi.mock('@google/generative-ai', () => ({}))
vi.mock('groq-sdk', () => ({ default: class {} }))

import { parseAIResponse, buildAIPrompt } from '@/lib/ai'
import type { UscisProcessingTime, CommunityBenchmark, AnalyzeInput } from '@/lib/types'

describe('parseAIResponse', () => {
  it('parses valid JSON response from AI', () => {
    const raw = JSON.stringify({
      pulse_score: 72,
      lottery_odds: 55,
      approval_months: 3.4,
      approval_p80_months: 5.1,
      travel_risk: 'caution',
      rfe_risk: 'medium',
      cap_gap_days: 47,
      ai_insight: 'Your STEM OPT cap-gap is safe through Oct 1.',
      pulse_score_reasoning: 'Moderate risk due to travel caution.',
    })
    const result = parseAIResponse(raw)
    expect(result).not.toBeNull()
    expect(result!.pulse_score).toBe(72)
    expect(result!.travel_risk).toBe('caution')
    expect(result!.ai_insight).toContain('STEM OPT')
  })

  it('returns null on invalid JSON', () => {
    expect(parseAIResponse('not json')).toBeNull()
  })

  it('returns null when pulse_score is missing', () => {
    expect(parseAIResponse(JSON.stringify({ travel_risk: 'safe' }))).toBeNull()
  })

  it('strips markdown code fences before parsing', () => {
    const raw = '```json\n{"pulse_score":65,"travel_risk":"caution"}\n```'
    const result = parseAIResponse(raw)
    expect(result).not.toBeNull()
    expect(result!.pulse_score).toBe(65)
  })
})

describe('buildAIPrompt', () => {
  const mockInput: AnalyzeInput = {
    status: 'stem_opt',
    country_of_birth: 'India',
    employer: 'Acme Corp',
    job_title: 'Software Engineer',
    opt_expiry: '2026-08-15',
    degree_level: 'MS',
    h1b_filed: true,
  }
  const mockUscis: UscisProcessingTime = {
    form: 'I-129', service_center: 'TSC', unit: 'Months',
    min_months: 3, max_months: 6, fetched_at: '2026-05-17T00:00:00Z',
  }
  const mockCommunity: CommunityBenchmark = { n: 200, median_approval_months: 3.2 }

  it('includes visa status in prompt', () => {
    const prompt = buildAIPrompt(mockInput, mockUscis, mockCommunity)
    expect(prompt).toContain('stem_opt')
    expect(prompt).toContain('India')
  })

  it('includes USCIS data in prompt', () => {
    const prompt = buildAIPrompt(mockInput, mockUscis, mockCommunity)
    expect(prompt).toContain('TSC')
    expect(prompt).toContain('3')
    expect(prompt).toContain('6')
  })

  it('includes community data when n >= 10', () => {
    const prompt = buildAIPrompt(mockInput, mockUscis, mockCommunity)
    expect(prompt).toContain('200')
    expect(prompt).toContain('3.2')
  })

  it('says insufficient when community n < 10', () => {
    const prompt = buildAIPrompt(mockInput, null, { n: 5 })
    expect(prompt).toContain('Insufficient')
  })

  it('instructs AI to return only JSON', () => {
    const prompt = buildAIPrompt(mockInput, null, { n: 0 })
    expect(prompt).toContain('JSON')
    expect(prompt).toContain('pulse_score')
  })
})
