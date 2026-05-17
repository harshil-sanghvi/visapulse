import { z } from 'zod'

export const analyzeInputSchema = z.object({
  status: z.enum(['opt', 'stem_opt', 'h1b_pending', 'h1b_approved']),
  country_of_birth: z.string().trim().min(2).max(100),
  employer: z.string().min(1).max(200),
  job_title: z.string().min(1).max(200),
  // OPT / STEM OPT
  opt_expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  degree_level: z.enum(['BS', 'MS', 'PhD']).optional(),
  h1b_filed: z.boolean().optional(),
  // H1B Pending
  service_center: z.enum(['TSC', 'NSC', 'VSC', 'CSC']).optional(),
  filing_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  premium_processing: z.boolean().optional(),
  receipt_number: z.string().regex(/^[A-Z]{3}\d{10}$/).optional(),
  // H1B Approved
  approval_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  visa_stamp_expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  traveled_recently: z.boolean().optional(),
  stamp_country: z.string().max(100).optional(),
}).superRefine((data, ctx) => {
  if ((data.status === 'opt' || data.status === 'stem_opt') && !data.opt_expiry) {
    ctx.addIssue({ code: 'custom', path: ['opt_expiry'], message: 'OPT expiry required for this status' })
  }
  if (data.status === 'h1b_pending' && !data.service_center) {
    ctx.addIssue({ code: 'custom', path: ['service_center'], message: 'Service center required for H1B Pending' })
  }
  if (data.status === 'h1b_pending' && !data.filing_date) {
    ctx.addIssue({ code: 'custom', path: ['filing_date'], message: 'Filing date required for H1B Pending' })
  }
  if (data.status === 'h1b_approved' && !data.approval_date) {
    ctx.addIssue({ code: 'custom', path: ['approval_date'], message: 'Approval date required for H1B Approved' })
  }
  // Validate all date fields are real dates
  const dateFields = ['opt_expiry', 'filing_date', 'approval_date', 'visa_stamp_expiry'] as const
  for (const field of dateFields) {
    const val = data[field]
    if (val && isNaN(Date.parse(val))) {
      ctx.addIssue({ code: 'custom', path: [field], message: `${field} must be a valid date` })
    }
  }
})

export type AnalyzeInput = z.infer<typeof analyzeInputSchema>
