export function DisclaimerBar() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0d0d0f] px-4 py-3 text-xs leading-relaxed text-gray-500 dark:text-gray-500">
      <span className="font-semibold text-amber-600 dark:text-amber-400">Not legal advice.</span>{' '}
      This analysis uses official USCIS data and AI interpretation of public immigration policy.
      Immigration law is complex and fact-specific. Consult a licensed immigration attorney before
      making any decisions about your status.
    </div>
  )
}
