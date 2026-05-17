import React from 'react'

const AMBER_PATTERNS = [
  /\d+\s?CFR\s?[\d.()–-]+/g,
  /INA\s?§\s?[\d.()\w]+/g,
  /8\s?U\.S\.C\.\s?§?\s?[\d\w]+/g,
  /\[\d+\]/g,
]

const RED_PATTERNS = [
  /\bdo not travel\b/gi,
  /\bavoid travel\b/gi,
  /\bcannot re-enter\b/gi,
  /\bout of status\b/gi,
  /\bdenied\b/gi,
]

const GREEN_PATTERNS = [
  /\bin good standing\b/gi,
  /\bcovered through\b/gi,
  /\bfully authorized\b/gi,
  /\beligible\b/gi,
  /\bapproved\b/gi,
]

function highlightText(text: string): React.ReactNode[] {
  type Segment = { start: number; end: number; cls: string }
  const segments: Segment[] = []

  const applyPatterns = (patterns: RegExp[], cls: string) => {
    for (const re of patterns) {
      const globalRe = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
      let m
      while ((m = globalRe.exec(text)) !== null) {
        if (!segments.some(s => m!.index < s.end && m!.index + m![0].length > s.start)) {
          segments.push({ start: m.index, end: m.index + m[0].length, cls })
        }
      }
    }
  }

  applyPatterns(AMBER_PATTERNS, 'text-amber-600 dark:text-amber-400 font-medium')
  applyPatterns(RED_PATTERNS, 'text-red-600 dark:text-red-400 font-medium')
  applyPatterns(GREEN_PATTERNS, 'text-green-600 dark:text-green-400 font-medium')
  segments.sort((a, b) => a.start - b.start)

  const nodes: React.ReactNode[] = []
  let cursor = 0
  for (const seg of segments) {
    if (seg.start > cursor) nodes.push(text.slice(cursor, seg.start))
    nodes.push(
      <span key={seg.start} className={seg.cls}>
        {text.slice(seg.start, seg.end)}
      </span>
    )
    cursor = seg.end
  }
  if (cursor < text.length) nodes.push(text.slice(cursor))
  return nodes
}

export function GuidancePanel({ insight }: { insight: string }) {
  const paragraphs = insight.split(/\n\n+/).filter(Boolean)
  const displayParagraphs = paragraphs.length > 1 ? paragraphs : insight.match(/[^.!?]+[.!?]+/g) ?? [insight]

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111113] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0d0d0f]">
        <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500 font-semibold">
          What this means for you
        </span>
        <span className="text-xs rounded px-2 py-0.5 bg-amber-100 dark:bg-[#1c1400] text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
          AI · Live data
        </span>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        {displayParagraphs.map((para, i) => (
          <p key={i} className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {highlightText(para.trim())}
          </p>
        ))}
      </div>
    </div>
  )
}
