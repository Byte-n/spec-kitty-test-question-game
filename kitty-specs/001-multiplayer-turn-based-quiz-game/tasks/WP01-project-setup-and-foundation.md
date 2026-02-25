---
work_package_id: WP01
title: Project Setup & Foundation
lane: "doing"
dependencies: []
base_branch: main
base_commit: fe01bb59b94dfb5f06e99004d632da8bb62e1a36
created_at: '2026-02-25T10:07:31.831060+00:00'
subtasks:
- T001
- T002
- T003
- T004
- T005
- T006
phase: Phase 0 - Foundation
assignee: ''
agent: "claude"
shell_pid: "73628"
review_status: ''
reviewed_by: ''
history:
- timestamp: '2026-02-25T00:00:00Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
---

# Work Package Prompt: WP01 – Project Setup & Foundation

## ⚠️ IMPORTANT: Review Feedback Status

- **Has review feedback?**: Check the `review_status` field above. If it says `has_feedback`, scroll to **Review Feedback** immediately.
- Address all feedback before marking complete.

---

## Review Feedback

*[Empty — no feedback yet.]*

---

## Objectives & Success Criteria

- `npm run dev` starts without errors and the browser renders the App root at `http://localhost:5173/`
- `npx tsc --noEmit` passes with zero errors
- All TypeScript interfaces from `data-model.md` are defined in `src/types/index.ts` and importable
- The built-in question bank (`src/data/defaultBank.ts`) contains ≥20 Chinese general-knowledge questions
- React Router routes for all 5 screens are registered; navigating to `/` renders a placeholder `<SetupPage />`; navigating to `/game` without an active session redirects to `/`
- `postcss-pxtorem` is active: a `750px` value in a Less file compiles to `20rem`

## Context & Constraints

- **Implement command**: `spec-kitty implement WP01` (no dependencies)
- **Spec**: `kitty-specs/001-multiplayer-turn-based-quiz-game/spec.md`
- **Plan**: `kitty-specs/001-multiplayer-turn-based-quiz-game/plan.md`
- **Data model**: `kitty-specs/001-multiplayer-turn-based-quiz-game/data-model.md`
- **Constitution**: `.kittify/memory/constitution.md`
- Existing scaffold: Vite 6 + React 19 + TypeScript 5.8 + Ant Design v6 + Tailwind + Less already installed
- TypeScript strict mode is required; no `any` without justification
- Functional components only; no class components
- Styling: Ant Design layout components first, Tailwind for visual styles, Less Modules for complex styles

## Subtasks & Detailed Guidance

### Subtask T001 – Install Missing npm Packages

**Purpose**: Add Zustand (state management), React Router DOM (navigation), and postcss-pxtorem (rem adaptation) which are not yet in `package.json`.

**Steps**:
1. Run from project root:
   ```bash
   npm install zustand react-router-dom
   npm install --save-dev postcss-pxtorem
   ```
2. Verify installation succeeded:
   ```bash
   cat package.json | grep -E "zustand|react-router-dom|postcss-pxtorem"
   ```
3. Check for peer dependency warnings in npm output; resolve any critical warnings.

**Files**: `package.json`, `package-lock.json` (auto-updated)

**Notes**: Zustand v5+, React Router DOM v7+ are expected. If npm resolves older versions, pin explicitly: `npm install zustand@^5 react-router-dom@^7`.

---

### Subtask T002 – Configure postcss-pxtorem

**Purpose**: Enable automatic px→rem conversion using 750px design base (rootValue 37.5) so that all layout/size values written in px are converted to rem at build time, per H5 style guide.

**Steps**:
1. Read the existing `postcss.config.js` to understand current plugins.
2. Add `postcss-pxtorem` to the plugins list:
   ```js
   // postcss.config.js
   export default {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
       'postcss-pxtorem': {
         rootValue: 37.5,
         propList: ['*'],
         selectorBlackList: [],
         replace: true,
         mediaQuery: false,
         minPixelValue: 2,
       },
     },
   }
   ```
3. `minPixelValue: 2` ensures `1px` borders are NOT converted (kept as `1px` per constitution).
4. Restart dev server and verify: in browser devtools, check that a `font-size: 28px` rule becomes `font-size: 0.747rem`.

**Files**: `postcss.config.js`

**Notes**: Plugin order matters — pxtorem should come after tailwindcss and autoprefixer.

---

### Subtask T003 – Create `src/types/index.ts`

**Purpose**: Define all shared TypeScript interfaces used throughout the application, exactly matching `data-model.md`. Centralising types prevents drift between stores, services, and components.

**Steps**:
1. Create `src/types/index.ts` with the following interfaces:
   ```typescript
   // Option within a question
   export interface Option {
     id: string
     text: string
   }

   // A single quiz question
   export interface Question {
     id: string
     text: string
     options: Option[]          // 2–4 items
     correctOptionId: string    // Must match one Option.id
   }

   // A named collection of questions
   export interface QuestionBank {
     id: string
     name: string
     type: 'builtin' | 'custom'
     questions: Question[]
     createdAt: string          // ISO 8601
   }

   // A game participant
   export interface Player {
     id: string
     name: string
     turnOrder: number          // 0-indexed
   }

   // Configuration passed to startGame()
   export interface GameConfig {
     selectedBankIds: string[]
     players: Player[]          // 1–12
     roundCount: number         // ≥1
     timeLimitSeconds: number   // ≥5, default 30
   }

   export type GamePhase = 'idle' | 'question' | 'result' | 'finished'

   // Active game session (in-memory only)
   export interface GameSession {
     config: GameConfig
     questionPool: Question[]
     currentTurnIndex: number
     scores: Record<string, number>       // Player.id → score
     lastAnswerCorrect: boolean | null
     lastAnsweredOptionId: string | null
   }

   // Leaderboard entry with dense ranking
   export interface RankedPlayer extends Player {
     score: number
     rank: number
   }

   // JSON schema for bank export/import files
   export interface BankExportSchema {
     version: '1.0'
     type: 'quiz-bank'
     name: string
     questions: Array<{
       text: string
       options: string[]
       correctIndex: number
     }>
   }
   ```
2. Run `npx tsc --noEmit` to verify no type errors.

**Files**: `src/types/index.ts` (new file, ~60 lines)

**Parallel?**: Yes — independent of T004, can run alongside it.

---

### Subtask T004 – Create `src/data/defaultBank.ts`

**Purpose**: Provide the built-in read-only question bank bundled at build time. Chinese general-knowledge questions cover history, science, geography, literature, and pop culture.

**Steps**:
1. Create `src/data/defaultBank.ts`:
   ```typescript
   import type { QuestionBank } from '../types'

   export const DEFAULT_BANK: QuestionBank = {
     id: 'builtin',
     name: '通用知识题库',
     type: 'builtin',
     createdAt: '2026-02-25T00:00:00.000Z',
     questions: [
       // Add ≥20 questions using this shape:
       {
         id: 'q001',
         text: '中国的首都是哪里？',
         options: [
           { id: 'q001-a', text: '上海' },
           { id: 'q001-b', text: '北京' },
           { id: 'q001-c', text: '广州' },
           { id: 'q001-d', text: '深圳' },
         ],
         correctOptionId: 'q001-b',
       },
       // ... 19+ more questions
     ],
   }
   ```
2. Include at least 20 questions spanning:
   - Chinese history (3–4 questions)
   - Geography (3–4 questions)
   - Science & nature (3–4 questions)
   - Literature & language (2–3 questions)
   - Pop culture / sports (3–4 questions)
   - General knowledge (remaining)
3. Each question MUST have exactly 4 options and one `correctOptionId`.
4. Use sequential IDs: `q001`, `q002`, ... and `q001-a/b/c/d`, `q002-a/b/c/d`, etc.

**Files**: `src/data/defaultBank.ts` (new file, ~120–150 lines)

**Parallel?**: Yes — independent of T003.

---

### Subtask T005 – Create `src/router/index.tsx`

**Purpose**: Define all React Router v7 routes and the `GameGuard` component that redirects unauthenticated game routes to the setup page.

**Steps**:
1. Create `src/router/index.tsx`:
   ```tsx
   import { createBrowserRouter, Navigate } from 'react-router-dom'
   import { useGameStore } from '../stores/gameStore'

   // Lazy-loaded pages (add after pages are created in later WPs)
   // For now, use placeholder components
   const SetupPage = () => <div>Setup Page</div>
   const GamePage = () => <div>Game Page</div>
   const ResultPage = () => <div>Result Page</div>
   const LeaderboardPage = () => <div>Leaderboard Page</div>
   const BankManagerPage = () => <div>Bank Manager Page</div>

   function GameGuard({ children }: { children: React.ReactNode }) {
     const session = useGameStore(s => s.session)
     if (!session) return <Navigate to="/" replace />
     return <>{children}</>
   }

   function FinishedGuard({ children }: { children: React.ReactNode }) {
     const phase = useGameStore(s => s.phase)
     if (phase !== 'finished') return <Navigate to="/" replace />
     return <>{children}</>
   }

   export const router = createBrowserRouter([
     { path: '/', element: <SetupPage /> },
     {
       path: '/game',
       element: <GameGuard><GamePage /></GameGuard>,
     },
     {
       path: '/result',
       element: <GameGuard><ResultPage /></GameGuard>,
     },
     {
       path: '/leaderboard',
       element: <FinishedGuard><LeaderboardPage /></FinishedGuard>,
     },
     { path: '/banks', element: <BankManagerPage /> },
   ])
   ```
2. Note: placeholder page components will be replaced in WP04–WP07. Import the real pages once they exist.

**Files**: `src/router/index.tsx` (new file, ~45 lines)

**Notes**: `GameGuard` relies on `gameStore`. The store must exist before this file compiles — create gameStore stub in WP03, or temporarily use `null` check from local state. For WP01 only, the router can use placeholder pages; the guards will be wired properly in WP03.

---

### Subtask T006 – Update `src/App.tsx`

**Purpose**: Integrate the React Router provider into the app root so all pages can use routing hooks.

**Steps**:
1. Read the existing `src/App.tsx`.
2. Replace its contents with:
   ```tsx
   import { RouterProvider } from 'react-router-dom'
   import { router } from './router'

   export default function App() {
     return <RouterProvider router={router} />
   }
   ```
3. Verify `src/main.tsx` renders `<App />` (should already do so from the scaffold).
4. Run `npm run dev` and confirm: `http://localhost:5173/` renders "Setup Page" placeholder without errors.

**Files**: `src/App.tsx` (modify existing)

**Notes**: The Zustand stores do not require a Provider wrapper (Zustand is provider-free by design). No changes to `src/main.tsx` should be needed.

---

## Risks & Mitigations

- **postcss-pxtorem + Tailwind conflict**: Tailwind generates utility classes with px values; pxtorem may convert Tailwind's `px-4` (16px) to rem unexpectedly. Mitigation: This is actually fine for rem scaling — Tailwind utilities will correctly scale. If specific Tailwind values should stay fixed (border utilities), use `selectorBlackList` to exclude Tailwind border classes, or rely on `minPixelValue: 2` to protect `1px` values.
- **React Router v7 API changes**: v7 changed some import paths. Use named exports from `react-router-dom` (not `react-router`). `createBrowserRouter` is the v7 standard.
- **TypeScript strict mode + `id: string` in defaultBank**: Ensure all option IDs are unique across the entire bank (not just within each question).

## Review Guidance

- [ ] `npm install` succeeds without critical peer dependency errors
- [ ] `npm run dev` starts and `http://localhost:5173/` loads without console errors
- [ ] `npx tsc --noEmit` passes cleanly
- [ ] `src/types/index.ts` exports all interfaces from data-model.md (spot-check: `GameSession`, `RankedPlayer`, `BankExportSchema`)
- [ ] `src/data/defaultBank.ts` has ≥20 questions; each has exactly 4 options; `correctOptionId` matches an actual option id
- [ ] Navigate to `/game` in browser → redirects to `/` (GameGuard working)
- [ ] postcss-pxtorem is active: verify in browser devtools that a px value in any Less file compiled to rem

## Activity Log

- 2026-02-25T00:00:00Z – system – lane=planned – Prompt created.
- 2026-02-25T10:07:31Z – claude-sonnet-4-6 – shell_pid=69269 – lane=doing – Assigned agent via workflow command
- 2026-02-25T14:42:56Z – claude – shell_pid=73628 – lane=doing – Started review via workflow command
