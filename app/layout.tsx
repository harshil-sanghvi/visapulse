import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VisaPulse — Immigration Risk Dashboard',
  description: 'Real data. Honest predictions. Know your visa risk in seconds.',
  openGraph: {
    title: 'VisaPulse',
    description: 'Real data. Honest predictions. Know your visa risk in seconds.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0d0d0f] text-slate-200 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
