export type { AnalyzeInput } from './schema'

export type VisaStatus = 'opt' | 'stem_opt' | 'h1b_pending' | 'h1b_approved'
export type ServiceCenter = 'TSC' | 'NSC' | 'VSC' | 'CSC'
export type DegreeLevel = 'BS' | 'MS' | 'PhD'
export type TravelRisk = 'safe' | 'caution' | 'avoid'
export type RFERisk = 'low' | 'medium' | 'high'
export type ResultMode = 'FULL' | 'DATA-ONLY' | 'PARTIAL'

export interface SubScore {
  value: string | number
  label: string
  source: 'USCIS' | 'Community' | 'AI-estimated' | 'Deterministic'
  shown: boolean
}

export interface Scores {
  pulse_score: number
  lottery_odds?: number           // % — OPT/STEM OPT only
  approval_months?: number        // H1B Pending only
  approval_p80_months?: number
  travel_risk: TravelRisk
  rfe_risk?: RFERisk             // H1B Pending only
  cap_gap_days?: number          // OPT/STEM OPT only
  ai_insight?: string
  pulse_score_reasoning?: string
  sub_scores: SubScore[]
}

export interface AnalyzeResult {
  id: string
  scores: Scores
  mode: ResultMode
  sources: {
    uscis_fetched_at?: string
    community_n: number
    median_approval_months?: number
    ai_provider?: 'gemini' | 'groq' | null
  }
  input_summary: {
    status: VisaStatus
    country_of_birth: string
    service_center?: ServiceCenter
  }
}

export interface CommunityBenchmark {
  n: number
  median_approval_months?: number
  median_pulse_score?: number
}

export interface UscisProcessingTime {
  form: string
  service_center: string
  unit: string
  min_months: number
  max_months: number
  fetched_at: string
}
