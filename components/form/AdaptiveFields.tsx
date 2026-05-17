'use client'
import type { VisaStatus } from '@/lib/types'

interface Props {
  status: VisaStatus
  values: Record<string, string | boolean | undefined>
  onChange: (field: string, value: string | boolean) => void
}

function Field({ label, id, children, hint }: { label: string; id: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">
        {label} {hint && <span className="text-gray-600 normal-case">({hint})</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full rounded bg-[#111113] border border-gray-700 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-400"
const selectCls = inputCls + " cursor-pointer"

export function AdaptiveFields({ status, values, onChange }: Props) {
  const isOpt = status === 'opt' || status === 'stem_opt'
  const isH1bPending = status === 'h1b_pending'
  const isH1bApproved = status === 'h1b_approved'

  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Country of Birth" id="country_of_birth">
        <input id="country_of_birth" className={inputCls} placeholder="e.g. India" value={values.country_of_birth as string ?? ''} onChange={e => onChange('country_of_birth', e.target.value)} />
      </Field>

      <Field label="Employer" id="employer">
        <input id="employer" className={inputCls} placeholder="Company name" value={values.employer as string ?? ''} onChange={e => onChange('employer', e.target.value)} />
      </Field>

      <Field label="Job Title" id="job_title" hint="helps determine SOC code">
        <input id="job_title" className={inputCls} placeholder="e.g. Software Engineer" value={values.job_title as string ?? ''} onChange={e => onChange('job_title', e.target.value)} />
      </Field>

      {isOpt && (
        <>
          <Field label={status === 'stem_opt' ? 'STEM OPT Expiry' : 'OPT Expiry'} id="opt_expiry">
            <input id="opt_expiry" type="date" className={inputCls} value={values.opt_expiry as string ?? ''} onChange={e => onChange('opt_expiry', e.target.value)} />
          </Field>
          <Field label="Degree Level" id="degree_level">
            <select id="degree_level" className={selectCls} value={values.degree_level as string ?? ''} onChange={e => onChange('degree_level', e.target.value)}>
              <option value="">Select...</option>
              <option value="BS">Bachelor&apos;s (BS)</option>
              <option value="MS">Master&apos;s (MS)</option>
              <option value="PhD">PhD</option>
            </select>
          </Field>
          <Field label="H1B Filed?" id="h1b_filed">
            <select id="h1b_filed" className={selectCls} value={values.h1b_filed === true ? 'true' : values.h1b_filed === false ? 'false' : ''} onChange={e => onChange('h1b_filed', e.target.value === 'true')}>
              <option value="">Select...</option>
              <option value="true">Yes — filed this cycle</option>
              <option value="false">No / Not yet</option>
            </select>
          </Field>
        </>
      )}

      {isH1bPending && (
        <>
          <Field label="Service Center" id="service_center">
            <select id="service_center" className={selectCls} value={values.service_center as string ?? ''} onChange={e => onChange('service_center', e.target.value)}>
              <option value="">Select...</option>
              <option value="TSC">Texas (TSC)</option>
              <option value="NSC">Nebraska (NSC)</option>
              <option value="VSC">Vermont (VSC)</option>
              <option value="CSC">California (CSC)</option>
            </select>
          </Field>
          <Field label="Filing Date" id="filing_date">
            <input id="filing_date" type="date" className={inputCls} value={values.filing_date as string ?? ''} onChange={e => onChange('filing_date', e.target.value)} />
          </Field>
          <Field label="Premium Processing?" id="premium_processing">
            <select id="premium_processing" className={selectCls} value={values.premium_processing === true ? 'true' : values.premium_processing === false ? 'false' : ''} onChange={e => onChange('premium_processing', e.target.value === 'true')}>
              <option value="">Select...</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </Field>
          <Field label="Receipt Number" id="receipt_number" hint="optional — enables live USCIS lookup">
            <input id="receipt_number" className={inputCls} placeholder="EAC2512345678" value={values.receipt_number as string ?? ''} onChange={e => onChange('receipt_number', e.target.value)} />
          </Field>
        </>
      )}

      {isH1bApproved && (
        <>
          <Field label="Approval Date" id="approval_date">
            <input id="approval_date" type="date" className={inputCls} value={values.approval_date as string ?? ''} onChange={e => onChange('approval_date', e.target.value)} />
          </Field>
          <Field label="Visa Stamp Expiry" id="visa_stamp_expiry">
            <input id="visa_stamp_expiry" type="date" className={inputCls} value={values.visa_stamp_expiry as string ?? ''} onChange={e => onChange('visa_stamp_expiry', e.target.value)} />
          </Field>
          <Field label="Stamp Issued In" id="stamp_country">
            <input id="stamp_country" className={inputCls} placeholder="e.g. India" value={values.stamp_country as string ?? ''} onChange={e => onChange('stamp_country', e.target.value)} />
          </Field>
          <Field label="Traveled Recently?" id="traveled_recently">
            <select id="traveled_recently" className={selectCls} value={values.traveled_recently === true ? 'true' : values.traveled_recently === false ? 'false' : ''} onChange={e => onChange('traveled_recently', e.target.value === 'true')}>
              <option value="">Select...</option>
              <option value="true">Yes, in last 12 months</option>
              <option value="false">No</option>
            </select>
          </Field>
        </>
      )}
    </div>
  )
}
