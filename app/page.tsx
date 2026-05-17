import { AnalyzeForm } from '@/components/form/AnalyzeForm'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Visa<span className="text-amber-400">Pulse</span>
        </h1>
        <p className="mt-2 text-sm text-gray-500">Real data. Honest predictions. No fluff.</p>
      </div>
      <div className="rounded-lg border border-gray-800 bg-[#111113] p-6">
        <AnalyzeForm />
      </div>
    </main>
  )
}
