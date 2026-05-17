import { AnalyzeForm } from '@/components/form/AnalyzeForm'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0f]">
      <nav className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          Visa<span className="text-amber-400">Pulse</span>
        </span>
        <ThemeToggle />
      </nav>

      <main className="mx-auto max-w-xl px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Know your visa risk.
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-500 max-w-sm mx-auto leading-relaxed">
            Free, anonymous, based on official USCIS data and live policy updates — not guesswork.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {['USCIS live data', 'AI-powered', 'No account needed', '~5s results'].map(pill => (
              <span
                key={pill}
                className="text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111113] p-6 shadow-sm">
          <AnalyzeForm />
        </div>
      </main>
    </div>
  )
}
