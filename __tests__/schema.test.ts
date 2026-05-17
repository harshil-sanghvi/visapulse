import { describe, it, expect } from 'vitest'
import { analyzeInputSchema } from '@/lib/schema'

describe('analyzeInputSchema', () => {
  const validOpt = {
    status: 'opt' as const,
    country_of_birth: 'India',
    employer: 'Acme Corp',
    job_title: 'Software Engineer',
    opt_expiry: '2026-09-15',
    degree_level: 'MS' as const,
    h1b_filed: true,
  }

  const validH1bPending = {
    status: 'h1b_pending' as const,
    country_of_birth: 'India',
    employer: 'Acme Corp',
    job_title: 'Software Engineer',
    service_center: 'TSC' as const,
    filing_date: '2026-04-01',
    premium_processing: false,
  }

  it('accepts valid OPT input', () => {
    expect(() => analyzeInputSchema.parse(validOpt)).not.toThrow()
  })

  it('accepts valid H1B pending input', () => {
    expect(() => analyzeInputSchema.parse(validH1bPending)).not.toThrow()
  })

  it('rejects OPT input missing opt_expiry', () => {
    const result = analyzeInputSchema.safeParse({ ...validOpt, opt_expiry: undefined })
    expect(result.success).toBe(false)
    expect(JSON.stringify(result)).toContain('opt_expiry')
  })

  it('rejects H1B pending input missing service_center', () => {
    const result = analyzeInputSchema.safeParse({ ...validH1bPending, service_center: undefined })
    expect(result.success).toBe(false)
    expect(JSON.stringify(result)).toContain('service_center')
  })

  it('rejects invalid receipt number format', () => {
    const result = analyzeInputSchema.safeParse({ ...validH1bPending, receipt_number: 'INVALID' })
    expect(result.success).toBe(false)
  })

  it('accepts valid receipt number format', () => {
    const result = analyzeInputSchema.safeParse({ ...validH1bPending, receipt_number: 'EAC2512345678' })
    expect(result.success).toBe(true)
  })
})
