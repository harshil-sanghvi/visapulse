export type VisaStatus = 'opt' | 'stem_opt' | 'h1b_pending' | 'h1b_approved'
export type ServiceCenter = 'TSC' | 'NSC' | 'VSC' | 'CSC'
export type DegreeLevel = 'BS' | 'MS' | 'PhD'
export type TravelRisk = 'safe' | 'caution' | 'avoid'
export type RFERisk = 'low' | 'medium' | 'high'
export type ResultMode = 'FULL' | 'DATA-ONLY' | 'PARTIAL'

export interface AnalyzeInput {
  status: VisaStatus
  country_of_birth: string
  employer: string
  job_title: string
  // OPT fields
  opt_expiry?: string       // ISO date string YYYY-MM-DD
  degree_level?: DegreeLevel
  h1b_filed?: boolean
  // STEM OPT fields — same as OPT
  // H1B Pending fields
  service_center?: ServiceCenter
  filing_date?: string      // ISO date string YYYY-MM-DD
  premium_processing?: boolean
  receipt_number?: string   // optional, not stored
  // H1B Approved fields
  approval_date?: string
  visa_stamp_expiry?: string
  traveled_recently?: boolean
  stamp_country?: string
}

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
