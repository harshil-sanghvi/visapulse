import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'
import type { AnalyzeInput, Scores, UscisProcessingTime, CommunityBenchmark } from './types'

export function buildAIPrompt(
  input: AnalyzeInput,
  uscis: UscisProcessingTime | null,
  community: CommunityBenchmark
): string {
  return `You are an immigration data analyst. Analyze the following visa profile and return ONLY a JSON object.

VISA PROFILE:
- Status: ${input.status}
- Country of birth: ${input.country_of_birth}
- Employer: ${input.employer}
- Job title: ${input.job_title}
- Degree: ${input.degree_level ?? 'unknown'}
- H1B filed: ${input.h1b_filed ?? 'N/A'}
- OPT expiry: ${input.opt_expiry ?? 'N/A'}
- Service center: ${input.service_center ?? 'N/A'}
- Filing date: ${input.filing_date ?? 'N/A'}
- Premium processing: ${input.premium_processing ?? 'N/A'}
- Visa stamp expiry: ${input.visa_stamp_expiry ?? 'N/A'}
- Traveled recently: ${input.traveled_recently ?? 'N/A'}

USCIS PROCESSING TIMES (official data):
${uscis ? `Form I-129 at ${uscis.service_center}: ${uscis.min_months}–${uscis.max_months} months (as of ${uscis.fetched_at})` : 'Not available'}

COMMUNITY DATA:
${community.n >= 10 ? `${community.n} similar profiles — median approval: ${community.median_approval_months ?? 'unknown'} months` : 'Insufficient community data'}

Return ONLY this JSON (no markdown, no explanation):
{
  "pulse_score": <0-100 integer, higher = safer>,
  "lottery_odds": <% integer for OPT/STEM OPT, null for H1B>,
  "approval_months": <decimal months estimate for H1B pending, null otherwise>,
  "approval_p80_months": <80th percentile months, null if not H1B pending>,
  "travel_risk": <"safe" | "caution" | "avoid">,
  "rfe_risk": <"low" | "medium" | "high" for H1B pending, null otherwise>,
  "cap_gap_days": <integer days of cap-gap coverage for OPT users, null otherwise>,
  "ai_insight": <2-4 sentences: key risks, recommended actions, notable patterns. Be specific and actionable.>,
  "pulse_score_reasoning": <1 sentence explaining the overall score>
}`
}

export function parseAIResponse(raw: string): Partial<Scores> | null {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (typeof parsed.pulse_score !== 'number') return null
    return parsed as Partial<Scores>
  } catch {
    return null
  }
}

export async function callGemini(prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const result = await model.generateContent(prompt)
  return result.response.text()
}

export async function callGroq(prompt: string): Promise<string> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 800,
  })
  return completion.choices[0]?.message?.content ?? ''
}

export async function synthesizeWithAI(
  input: AnalyzeInput,
  uscis: UscisProcessingTime | null,
  community: CommunityBenchmark
): Promise<{ scores: Partial<Scores> | null; provider: 'gemini' | 'groq' | null }> {
  const prompt = buildAIPrompt(input, uscis, community)

  try {
    const raw = await callGemini(prompt)
    const scores = parseAIResponse(raw)
    if (scores) return { scores, provider: 'gemini' }
  } catch {}

  try {
    const raw = await callGroq(prompt)
    const scores = parseAIResponse(raw)
    if (scores) return { scores, provider: 'groq' }
  } catch {}

  return { scores: null, provider: null }
}
