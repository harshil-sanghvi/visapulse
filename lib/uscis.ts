import { supabaseAdmin } from './supabase'
import type { UscisProcessingTime } from './types'

const CACHE_TTL_HOURS = 6
const USCIS_API_BASE = 'https://egov.uscis.gov/processing-times/api/processingtime'

export function isCacheStale(fetchedAt: string | null, ttlHours: number): boolean {
  if (!fetchedAt) return true
  const age = Date.now() - new Date(fetchedAt).getTime()
  return age > ttlHours * 60 * 60 * 1000
}

export function parseUscisResponse(data: unknown, form: string, serviceCenter: string): UscisProcessingTime {
  try {
    const d = data as Record<string, unknown>
    const subtypes = (d?.data as Record<string, unknown>)?.processing_time as Record<string, unknown>
    const range = ((subtypes?.subtypes as unknown[])?.[0] as Record<string, unknown>)
      ?.subtype_info as Record<string, unknown>
    const rangeArr = range?.range as Array<{ unit: string; value: number }>
    const months = rangeArr?.filter(r => r.unit === 'Months').map(r => r.value) ?? []
    if (months.length >= 2) {
      return { form, service_center: serviceCenter, unit: 'Months', min_months: months[0], max_months: months[1], fetched_at: new Date().toISOString() }
    }
  } catch {}
  // Fallback values if USCIS changes their API structure
  return { form, service_center: serviceCenter, unit: 'Months', min_months: 3, max_months: 9, fetched_at: new Date().toISOString() }
}

export async function getUscisProcessingTime(form: string, serviceCenter: string): Promise<UscisProcessingTime> {
  const cacheKey = `${form}:${serviceCenter}`

  // Check cache
  const { data: cached } = await supabaseAdmin
    .from('uscis_cache')
    .select('data, fetched_at')
    .eq('cache_key', cacheKey)
    .single()

  if (cached && !isCacheStale(cached.fetched_at, CACHE_TTL_HOURS)) {
    return cached.data as UscisProcessingTime
  }

  // Fetch from USCIS
  let fresh: UscisProcessingTime
  try {
    const res = await fetch(`${USCIS_API_BASE}/${form}/${serviceCenter}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error(`USCIS returned ${res.status}`)
    const json = await res.json()
    fresh = parseUscisResponse(json, form, serviceCenter)
  } catch {
    // If fetch fails and we have stale cache, use it
    if (cached) {
      return { ...(cached.data as UscisProcessingTime), fetched_at: cached.fetched_at }
    }
    // No cache at all — use fallback
    fresh = parseUscisResponse({}, form, serviceCenter)
  }

  // Update cache
  await supabaseAdmin.from('uscis_cache').upsert({ cache_key: cacheKey, data: fresh, fetched_at: new Date().toISOString() })

  return fresh
}
