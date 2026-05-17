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
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('vp-theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)})()` }} />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-[#0d0d0f] text-gray-900 dark:text-slate-200 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
