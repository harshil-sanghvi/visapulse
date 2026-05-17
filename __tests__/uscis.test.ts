import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {},
  supabase: {},
}))

import { isCacheStale, parseUscisResponse } from '@/lib/uscis'

describe('isCacheStale', () => {
  it('returns false for cache fetched 1 hour ago', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    expect(isCacheStale(oneHourAgo, 6)).toBe(false)
  })

  it('returns true for cache fetched 7 hours ago', () => {
    const sevenHoursAgo = new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
    expect(isCacheStale(sevenHoursAgo, 6)).toBe(true)
  })

  it('returns true for null fetched_at', () => {
    expect(isCacheStale(null, 6)).toBe(true)
  })
})

describe('parseUscisResponse', () => {
  it('extracts min/max months from USCIS JSON', () => {
    const mockResponse = {
      data: {
        processing_time: {
          subtypes: [{ subtype_info: { range: [{ unit: 'Months', value: 3.5 }, { unit: 'Months', value: 6 }] } }]
        }
      }
    }
    const result = parseUscisResponse(mockResponse, 'I-129', 'TSC')
    expect(result.min_months).toBe(3.5)
    expect(result.max_months).toBe(6)
    expect(result.form).toBe('I-129')
    expect(result.service_center).toBe('TSC')
  })

  it('returns fallback values on malformed response', () => {
    const result = parseUscisResponse({}, 'I-129', 'TSC')
    expect(result.min_months).toBe(3)
    expect(result.max_months).toBe(9)
  })
})
