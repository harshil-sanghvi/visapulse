# VisaPulse UI/UX Redesign + Real-Time Intelligence Design

## Overview

Two independent sub-projects delivered in sequence:

1. **Sub-project 1 — UI/UX Redesign** (this spec): Form wizard, results hierarchy, dark/light mode, attorney-level guidance presentation, citations UI. Pure frontend.
2. **Sub-project 2 — Real-Time Intelligence Layer** (separate spec): Tavily web search before AI synthesis, citations in API response, enhanced AI prompt for attorney-level detail. Backend + frontend integration.

Both sub-projects share the same visual design system defined here.

---

## Design System

### Colors

| Token | Dark mode | Light mode | Usage |
|---|---|---|---|
| Background | `#0d0d0f` | `#f9fafb` | Page background |
| Card | `#111113` | `#ffffff` | Card/panel background |
| Border | `#1f2937` | `#e5e7eb` | Card borders |
| Text primary | `#e2e8f0` | `#111827` | Body text |
| Text muted | `#6b7280` | `#9ca3af` | Labels, hints |
| Amber (accent) | `#f59e0b` | `#f59e0b` | Selected state, CTAs, highlights |
| Green (safe) | `#22c55e` | `#22c55e` | Low risk values |
| Amber (caution) | `#f59e0b` | `#d97706` | Moderate risk values |
| Red (avoid) | `#ef4444` | `#dc2626` | High risk values |

**Rule:** Amber is the only accent color. Blue is eliminated from selection states and buttons. Purple is eliminated from AI Insight section — it uses the standard card style with an "AI · Live data" badge instead.

### Theme toggle

A single `<ThemeToggle>` client component in the header on both pages. Persists via `localStorage` key `vp-theme`. Adds/removes `class="dark"` on `<html>`. Tailwind `dark:` variants handle the rest. Default: system preference via `prefers-color-scheme`.

To prevent flash-of-wrong-theme (FOUC), `app/layout.tsx` includes an inline `<script>` in `<head>` that runs before React hydrates:
```html
<script dangerouslySetInnerHTML={{ __html: `
  (function(){
    var t = localStorage.getItem('vp-theme');
    var d = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', d);
  })()
`}} />
```
`app/layout.tsx` removes the hardcoded `className="dark"` from `<html>` — the inline script handles it.

### Typography

All font sizes use Tailwind's responsive scale. No hardcoded `px` values. Labels remain `text-xs uppercase tracking-widest` but field hints drop to normal case `text-xs text-muted` in parentheses.

---

## Sub-project 1: UI/UX Redesign

### 1A — Form Wizard (two-step)

**Current problem:** Single-page form with no context, blue selected tiles, no guidance per field.

**New design:**

The form becomes a two-step wizard managed in `AnalyzeForm`:
- **Step 1:** Status selection only. Shows a contextual guidance note below the tiles that changes based on which status is hovered/selected. "Continue →" button only active when a status is chosen.
- **Step 2:** Adaptive fields for the selected status, with a "← Back" link to change status. "Analyze My Visa →" submit button.

A two-segment progress bar (`Step 1 of 2` / `Step 2 of 2`) sits above the content on both steps.

**Landing page (`app/page.tsx`) additions:**
- Hero text: "Know your visa risk." (h1) + "Free, anonymous, based on official USCIS data and live policy updates — not guesswork." (subtitle)
- Trust strip: four pills — "USCIS live data", "AI-powered", "No account needed", "~5s results"
- The form card retains `bg-[#111113]` dark / `bg-white` light with `rounded-lg border`

**StatusSelector changes:**
- Selected tile: `border-amber-400 bg-amber-950 dark:bg-[#1c1400]` — eliminates the current `bg-blue-900`
- Hover (unselected): `hover:border-gray-500 hover:bg-[#16161a]`
- Each tile gets a `data-status` attribute; the parent shows a guidance note below the grid matching the hovered/selected status

**Guidance notes per status** (shown below tiles in Step 1):
- `opt`: "Regular OPT gives you 12 months of work authorization. Your main risk is the H1B lottery — if not selected, you must leave or find another status by your OPT expiry."
- `stem_opt`: "STEM OPT extends your authorization up to 3 years. If your H1B was filed before your OPT expires, cap-gap protection covers you through Sept 30."
- `h1b_pending`: "Your H1B petition is filed and awaiting USCIS decision. Do not travel internationally without a valid visa stamp. Premium processing reduces the wait to 15 business days."
- `h1b_approved`: "Your H1B is approved. Key risks are visa stamp expiry (needed for international travel) and employer changes. Make sure your I-94 reflects the correct status."

**AdaptiveFields changes:**
- Every field gets an inline hint in `(parentheses)` next to the label explaining why it's collected
- Hints:
  - `country_of_birth`: (affects visa backlog and lottery priority)
  - `employer`: (used for specialty occupation assessment)
  - `job_title`: (used to determine SOC code and RFE risk)
  - `opt_expiry`: (used to calculate cap-gap coverage)
  - `receipt_number`: (enables live USCIS case status lookup)
  - `filing_date`: (used to calculate approval timeline)
  - `visa_stamp_expiry`: (determines international travel safety)
- Field pairs that logically go together display in a `grid grid-cols-2` on screens `sm:` and wider, single column on mobile

### 1B — Results Page

**Current problem:** Flat card hierarchy, no visual weight on the score, mixed colors, share button isolated.

**New layout (top to bottom):**

1. **Header** — `VisaPulse` logo left, `← New check` link + `<ThemeToggle>` right
2. **`ResultModeBanner`** — unchanged (only visible for DATA-ONLY/PARTIAL)
3. **Hero score strip** — full-width colored strip (see below)
4. **Sub-scores grid** — 3-column on `sm:`, 2-column on mobile (was 2-col fixed)
5. **"What this means for you"** — new attorney guidance section
6. **Citations** — new section (populated by Sub-project 2; hidden when empty)
7. **Community benchmark** — unchanged content, updated styling
8. **Disclaimer bar** — always visible, amber "Not legal advice." anchor
9. **Share row** — inline: button left, score summary text right
10. **`TransparencyPanel`** — collapsed by default, chevron icon (replaces ▲▼)

**Hero score strip:**

Full-width panel with a subtle gradient tinted by risk level:
- Score ≥ 71 (Low Risk): `from-green-950 dark:from-[#052e16]` → `bg-background`; border bottom `border-green-900`
- Score 41–70 (Moderate): `from-amber-950 dark:from-[#1c1400]` → `bg-background`; border bottom `border-amber-900`
- Score ≤ 40 (High Risk): `from-red-950 dark:from-[#1a0505]` → `bg-background`; border bottom `border-red-900`

Inside the strip (flex row, wraps on mobile):
- Left: "PULSE SCORE" label (muted xs uppercase), large score number (56px bold, risk color), risk label below
- Right: "WHY THIS SCORE" label + italicized `pulse_score_reasoning` text (from AI)

**Sub-scores grid:**

`grid grid-cols-2 sm:grid-cols-3 gap-3` — collapses to 2-col on mobile. Each `SubScoreCard` unchanged in content but updated colors: source badges use amber for Deterministic (was gray), blue for USCIS, purple for AI-estimated.

**"What this means for you" section:**

New component `GuidancePanel`. Card with header "WHAT THIS MEANS FOR YOU" + "AI · Live data" amber badge.

Body: 2–4 paragraphs of `ai_insight` rendered with inline highlights:
- Text containing regulation citations (e.g. "8 CFR", "INA §") rendered in amber
- Phrases like "do not travel" / "avoid" rendered in red
- Positive phrases like "in good standing" / "covered through" rendered in green

This is a simple regex-based highlight pass over the `ai_insight` string — no markdown parser needed.

**Citations section:**

New component `CitationsPanel`. Only renders when `scores.citations` is non-empty. Card with header "SOURCES & CITATIONS" + "Fetched live" amber badge.

Each citation: numbered `[N]` in amber, title, URL (blue link), fetch date (muted). URLs are real links that open in a new tab.

**Disclaimer bar:**

Always-visible footer card: `"Not legal advice." This analysis uses official USCIS data and AI interpretation of public immigration policy. Immigration law is complex and fact-specific. Consult a licensed immigration attorney before making decisions.`

"Not legal advice." in amber bold. Rest in muted text.

**Share row:**

`flex items-center gap-3` — share button left (`flex-1`), score summary text right. No dedicated section card — just inline at the bottom.

**TransparencyPanel:**

Replace `▲`/`▼` with a Lucide `ChevronDown` / `ChevronUp` icon (already available via shadcn). Header label stays "HOW WE CALCULATED THIS".

---

## Sub-project 2: Real-Time Intelligence Layer

### Overview

Before calling Gemini/Groq, the analyze route searches the web via Tavily for current immigration policy relevant to the user's profile. Search results are injected into the AI prompt and returned as citations.

### New environment variable

```
TAVILY_API_KEY=your-tavily-api-key   # tavily.com — 1000 free searches/month
```

### New file: `lib/search.ts`

Exports `searchImmigrationContext(input: AnalyzeInput): Promise<SearchResult[]>`.

```typescript
interface SearchResult {
  title: string
  url: string
  content: string   // snippet returned by Tavily
  fetched_at: string
}
```

Tavily query is constructed from the input:
- Base: `"USCIS {status} {country_of_birth} {year} rules requirements"`
- For H1B pending: adds `"H1B processing time {service_center} {year}"`
- For OPT/STEM OPT: adds `"cap gap OPT STEM H1B {year}"`
- For H1B approved: adds `"H1B visa stamp expiry international travel {year}"`

Calls `https://api.tavily.com/search` with `max_results: 5`, `search_depth: "basic"`, `include_domains: ["uscis.gov", "travel.state.gov", "dol.gov", "federalregister.gov"]`.

Returns up to 5 results. On error (network, rate limit, invalid key), returns `[]` — search failure must never block the analyze route.

### Changes to `lib/ai.ts`

`buildAIPrompt` gains a `searchResults: SearchResult[]` parameter. When results are non-empty, a new section is appended to the prompt:

```
LIVE POLICY CONTEXT (fetched from official sources today):
[1] {title} — {url}
    {content}
[2] ...

Use these sources to inform your analysis. Reference them by number (e.g. [1]) in your ai_insight when citing specific rules or data. Be specific and actionable — write as if you are an experienced immigration attorney explaining this to a client.
```

The `ai_insight` prompt instruction changes from "2-4 sentences" to:

```
"ai_insight": <3-5 sentences of attorney-level guidance. Be specific: name the regulation, the risk, and the action. Reference sources by number where relevant. Example: 'Under 8 CFR 214.2(f)(5)(vi) [1], your cap-gap coverage runs through Sept 30...'>
```

### New type: `Citation`

Added to `lib/types.ts`:

```typescript
export interface Citation {
  title: string
  url: string
  fetched_at: string
}
```

### Changes to `Scores` interface

```typescript
citations?: Citation[]
```

### Changes to `app/api/analyze/route.ts`

1. Call `searchImmigrationContext(input)` before AI synthesis — result passed to `synthesizeWithAI`
2. `synthesizeWithAI` passes search results to `buildAIPrompt`
3. Citations (title + url + fetched_at, stripped of content) stored in `scores.citations`
4. Search failure (empty array) gracefully degrades — AI runs without live context

### Changes to `app/results/[id]/page.tsx`

Read `(data.scores as Scores).citations` from the stored JSONB and pass to `CitationsPanel`.

### New component: `components/results/CitationsPanel.tsx`

Renders when `citations` array is non-empty. Hidden otherwise.

---

## New & Modified Files

### Sub-project 1

| File | Change |
|---|---|
| `app/page.tsx` | Add hero text + trust strip |
| `app/layout.tsx` | Dark/light mode class init from localStorage |
| `app/globals.css` | Add `light` variant overrides |
| `components/ui/ThemeToggle.tsx` | New — client component, localStorage persistence |
| `components/form/AnalyzeForm.tsx` | Two-step wizard with progress bar + Back button |
| `components/form/StatusSelector.tsx` | Amber selected state, hover states |
| `components/form/AdaptiveFields.tsx` | Inline hints, responsive grid for field pairs |
| `components/results/PulseScore.tsx` | Replace with hero strip (score + reasoning side by side) |
| `components/results/SubScoreCard.tsx` | Responsive 3→2 col, updated source badge colors |
| `components/results/GuidancePanel.tsx` | New — attorney-level guidance with inline highlights |
| `components/results/CitationsPanel.tsx` | New — numbered citations list (used by both sub-projects) |
| `components/results/DisclaimerBar.tsx` | New — always-visible disclaimer |
| `components/results/ShareButton.tsx` | Inline row with score summary |
| `components/results/TransparencyPanel.tsx` | Chevron icon, dark/light aware |
| `components/results/AIInsight.tsx` | Remove — merged into GuidancePanel |
| `app/results/[id]/page.tsx` | New layout order, pass citations to CitationsPanel |

### Sub-project 2

| File | Change |
|---|---|
| `lib/search.ts` | New — Tavily search wrapper |
| `lib/ai.ts` | Accept search results, updated prompt |
| `lib/types.ts` | Add `Citation` type, `citations` to `Scores` |
| `app/api/analyze/route.ts` | Call search before AI, store citations in scores |
| `.env.local.example` | Add `TAVILY_API_KEY` |

---

## What Is Not In Scope

- User accounts or saved results history
- Email notifications
- Mobile app
- Custom domain configuration
- Attorney directory or referral links
- Paid tiers or rate limiting
- I-485, green card, or any status beyond OPT/STEM OPT/H1B
