---
description: "Work package task list for 001-multiplayer-turn-based-quiz-game"
---

# Work Packages: Multiplayer Turn-Based Quiz Game

**Inputs**: Design documents from `kitty-specs/001-multiplayer-turn-based-quiz-game/`
**Prerequisites**: plan.md ✓ spec.md ✓ research.md ✓ data-model.md ✓ contracts/ ✓ quickstart.md ✓

**Stack**: Vite + React 19 + TypeScript (strict) + Zustand + React Router v7 + Ant Design v6 + Tailwind + Less Modules + Vitest

---

## Work Package WP01: Project Setup & Foundation (Priority: P0) 🏗️

**Goal**: Install missing dependencies, configure postcss-pxtorem, define all shared TypeScript types, create the built-in question bank, scaffold the React Router tree, and wire the App root.
**Independent Test**: `npm run dev` starts without errors; navigating to `/` renders the App root; all TypeScript types are importable with zero `tsc` errors.
**Prompt**: `tasks/WP01-project-setup-and-foundation.md`
**Estimated size**: ~350 lines

### Included Subtasks
- [x] T001 Install missing npm packages: `zustand`, `react-router-dom`, `postcss-pxtorem`
- [ ] T002 Configure `postcss-pxtorem` in `postcss.config.js` (rootValue 37.5, 750px base)
- [ ] T003 [P] Create `src/types/index.ts` with all shared TypeScript interfaces
- [ ] T004 [P] Create `src/data/defaultBank.ts` with ≥20 built-in Chinese questions
- [ ] T005 Create `src/router/index.tsx` — React Router v7 routes + GameGuard redirect
- [ ] T006 Update `src/App.tsx` to integrate Router provider

### Implementation Notes
- Run `npm install zustand react-router-dom` then `npm install --save-dev postcss-pxtorem`
- Types must exactly match `data-model.md` interfaces
- Default bank must have at least 20 questions covering varied Chinese general knowledge topics
- GameGuard: if `session === null`, redirect to `/`

### Parallel Opportunities
- T003 and T004 are fully parallel (different files, no dependencies between them)

### Dependencies
- None (starting package)

### Risks & Mitigations
- `postcss-pxtorem` may conflict with existing Tailwind/PostCSS config → check plugin order (pxtorem after autoprefixer)
- Ant Design v6 peer dependency — verify React 19 compatibility in `npm install` output

---

## Work Package WP02: Bank Store & Persistence (Priority: P0)

**Goal**: Implement the Zustand bank store with localStorage sync, bank service pure functions (merge, shuffle, import schema validation), and file-based export/import.
**Independent Test**: Create a bank in browser devtools via store actions; refresh page; bank persists. Export produces valid JSON; import round-trips without data loss.
**Prompt**: `tasks/WP02-bank-store-and-persistence.md`
**Estimated size**: ~380 lines

### Included Subtasks
- [ ] T007 Create `src/services/persistence.ts` — typed localStorage read/write helpers
- [ ] T008 Create `src/services/bankService.ts` — getMergedQuestions, shuffleArray, validateImportSchema
- [ ] T009 Create `src/stores/bankStore.ts` — Zustand store with persist middleware (CRUD actions)
- [ ] T010 Implement `exportBank()` — Blob + `URL.createObjectURL()` file download
- [ ] T011 Implement `importBank()` — FileReader + JSON parse + schema validation + conflict handling

### Implementation Notes
- Zustand persist key: `"quiz-game-banks"`, version: 1
- `getMergedQuestions` deduplication: not required (include duplicates per spec edge case note)
- `shuffleArray`: Fisher-Yates algorithm for O(n) shuffle
- Import schema: `{ version: "1.0", type: "quiz-bank", name, questions: [{text, options[], correctIndex}] }`
- Convert import schema (correctIndex-based) to internal format (correctOptionId-based) during import

### Parallel Opportunities
- T007 and T008 can proceed in parallel (no dependency between them)

### Dependencies
- Depends on WP01 (for `src/types/index.ts`)

### Risks & Mitigations
- localStorage quota (~5MB): warn user if storage nears limit; catch `QuotaExceededError`
- Import with malformed JSON: wrap `JSON.parse` in try/catch; return user-friendly error string

---

## Work Package WP03: Game Engine & Game Store (Priority: P0)

**Goal**: Implement all pure game logic functions and the in-memory Zustand game store state machine (idle → question → result → finished).
**Independent Test**: Calling `startGame(config)` initialises session; `submitAnswer()` updates score; `continueToNext()` cycles players; after final turn `phase === 'finished'`; `getLeaderboard()` returns dense-ranked array.
**Prompt**: `tasks/WP03-game-engine-and-store.md`
**Estimated size**: ~400 lines

### Included Subtasks
- [ ] T012 Create `src/services/gameEngine.ts` — buildQuestionPool, getCurrentPlayer, isLastTurn, applyScore
- [ ] T013 Implement `computeLeaderboard()` — dense ranking algorithm in `src/services/gameEngine.ts`
- [ ] T014 Create `src/stores/gameStore.ts` — Zustand store (GamePhase state machine, no persistence)
- [ ] T015 Implement `startGame(config)` action — pool build + shuffle + session init + phase → question
- [ ] T016 Implement `submitAnswer(optionId | null)` — correct check, score update, phase → result
- [ ] T017 Implement `continueToNext()` + `resetGame()` + `getLeaderboard()` selector

### Implementation Notes
- Derived values: `currentPlayer = players[currentTurnIndex % players.length]`
- Derived values: `currentRound = Math.floor(currentTurnIndex / players.length) + 1`
- Pool capped at `min(roundCount × players.length, questionPool.length)`; warn host if pool < required turns
- Dense ranking: iterate sorted scores; assign rank = i+1 only when score < previous player's score
- gameStore is pure in-memory (no Zustand persist middleware)

### Parallel Opportunities
- T012 and T013 are fully parallel within the same file
- WP03 can run in parallel with WP02 after WP01 completes

### Dependencies
- Depends on WP01 (for types); can start concurrently with WP02

### Risks & Mitigations
- Off-by-one in player cycle: test with 1 player and 3 players separately
- Timer auto-submit race condition: ensure `submitAnswer(null)` is idempotent (ignore if phase ≠ 'question')

---

## Work Package WP04: Setup Page (Priority: P1) 🎯 MVP

**Goal**: Build the game setup screen — bank multi-selector, player configuration (1–12), round/timer settings, and the "Start Game" validation gate.
**Independent Test**: Select ≥1 bank, add 2 players, set round count, click Start → navigates to `/game` with active session. Selecting 0 banks or 0 questions → error shown, no navigation.
**Prompt**: `tasks/WP04-setup-page.md`
**Estimated size**: ~370 lines

### Included Subtasks
- [ ] T018 [P] Create `src/pages/SetupPage/BankSelector.tsx` — multi-checkbox with combined question count display
- [ ] T019 [P] Create `src/pages/SetupPage/PlayerConfig.tsx` — dynamic list of 1–12 player name inputs
- [ ] T020 [P] Create `src/pages/SetupPage/GameConfig.tsx` — round count input (min 1) + time limit input (default 30s)
- [ ] T021 Create `src/pages/SetupPage/SetupPage.tsx` — composes all sub-components; validates & calls `startGame()`
- [ ] T022 Add "管理题库" navigation link to `/banks` from setup page header

### Implementation Notes
- BankSelector: uses `bankStore.getAllBanks()`; show bank name + question count; built-in bank shown first (read-only badge)
- PlayerConfig: Ant Design `Input` for names; "添加玩家" button; Ant Design Space for layout
- GameConfig: Ant Design `InputNumber` components; round count ≥ 1; time limit 5–300s
- SetupPage validation: at least 1 bank selected + total questions ≥ 1 (show Ant Design `Alert` on error)
- Styling: Ant Design `Flex`/`Space` for layout; Tailwind for visual styling per constitution

### Parallel Opportunities
- T018, T019, T020 are fully parallel (independent components)

### Dependencies
- Depends on WP02 (bankStore), WP03 (gameStore + startGame)

### Risks & Mitigations
- Pool smaller than needed: SetupPage shows warning "题目数量不足，游戏将提前结束" (non-blocking, game still starts)
- 12-player input list on mobile: test scroll behaviour on 375px screen

---

## Work Package WP05: Game Page & Result Page (Priority: P1) 🎯 MVP

**Goal**: Build the active question screen with countdown timer and the post-answer result screen with "继续" button.
**Independent Test**: With active session, `/game` shows current player, question, timer, and 4 options. Selecting an option → `/result` reveals correct/incorrect. Timer expiry → `/result` with "超时" state. "继续" → next question or leaderboard.
**Prompt**: `tasks/WP05-game-page-and-result-page.md`
**Estimated size**: ~420 lines

### Included Subtasks
- [ ] T023 Create `src/components/CountdownTimer/CountdownTimer.tsx` — `useCountdown` hook + visual ring/bar display
- [ ] T024 [P] Create `src/components/AnswerOption/AnswerOption.tsx` — option button (normal / selected / correct / wrong states)
- [ ] T025 [P] Create `src/components/PlayerBadge/PlayerBadge.tsx` — current player name + round indicator
- [ ] T026 Create `src/pages/GamePage/GamePage.tsx` — wires PlayerBadge + CountdownTimer + AnswerOption list
- [ ] T027 Create `src/pages/ResultPage/ResultPage.tsx` — answer reveal + score delta + "继续" button

### Implementation Notes
- `useCountdown(seconds, onExpire)`: uses `setInterval` 1s tick; calls `submitAnswer(null)` on expiry; clears interval on unmount
- AnswerOption states: default → green if correct, red if wrong (revealed after submit)
- Options displayed in randomized order (shuffled at pool build time, NOT at render time)
- ResultPage: show ✓/✗, which option was correct, player's new total score; "继续" calls `continueToNext()`; GamePage guard: if `session === null`, redirect to `/`
- Visual: large readable text for mobile; Tailwind `text-xl`/`text-2xl`; min touch target 44×44px

### Parallel Opportunities
- T024 and T025 are fully parallel (independent components)

### Dependencies
- Depends on WP03 (gameStore, submitAnswer, continueToNext)

### Risks & Mitigations
- Double-submit (tap + timer fires simultaneously): make `submitAnswer` guard phase (`if phase !== 'question' return`)
- React StrictMode double-mount: use `useRef` for interval ID, guard duplicate interval creation

---

## Work Package WP06: Leaderboard Page (Priority: P1) 🎯 MVP

**Goal**: Build the end-of-game leaderboard screen with dense ranking, medal styling for top 3, and "再玩一局" reset flow.
**Independent Test**: After final turn, `/leaderboard` shows all players ranked highest score first. Equal scores share same rank (e.g., two players at rank 2, no rank 3). "再玩一局" calls `resetGame()` and navigates to `/`.
**Prompt**: `tasks/WP06-leaderboard-page.md`
**Estimated size**: ~280 lines

### Included Subtasks
- [ ] T028 Create `src/components/Leaderboard/Leaderboard.tsx` — ranked list with medal icons for rank 1/2/3
- [ ] T029 Create `src/pages/LeaderboardPage/LeaderboardPage.tsx` — full leaderboard screen + "再玩一局" button
- [ ] T030 Add rank reveal animation (staggered entrance, bottom-up) using CSS transition
- [ ] T031 Implement "再玩一局" flow: `resetGame()` → navigate to `/`

### Implementation Notes
- Dense ranking: rendered from `gameStore.getLeaderboard()` (already computed in store)
- Medal: 🥇 rank 1, 🥈 rank 2, 🥉 rank 3, plain number for rank 4+
- Tied players: same medal/rank badge; list them alphabetically within same rank
- Animation: `transition-all duration-300` with staggered `transitionDelay` via inline style (dynamic value → allowed inline style)
- Leaderboard guard: if `phase !== 'finished'`, redirect to `/`

### Parallel Opportunities
- T028 and T029 can be developed in parallel after WP03 (Leaderboard component + Page wrapper)

### Dependencies
- Depends on WP03 (getLeaderboard selector)

### Risks & Mitigations
- Phase guard: direct URL access to `/leaderboard` with no active session → redirect to `/`

---

## Work Package WP07: Bank Manager Page (Priority: P2)

**Goal**: Build the complete question bank management UI — bank list, question CRUD editor, delete confirmations, and JSON import/export.
**Independent Test**: Create a new bank, add 3 questions (with 4 options each, mark 1 correct), edit one, delete one. Export bank → valid JSON file. Import same JSON → bank reappears after page refresh. Delete bank with confirmation → bank removed.
**Prompt**: `tasks/WP07-bank-manager-page.md`
**Estimated size**: ~450 lines

### Included Subtasks
- [ ] T032 [P] Create `src/pages/BankManagerPage/BankList.tsx` — list banks with create/delete/export/import actions
- [ ] T033 [P] Create `src/pages/BankManagerPage/BankEditor.tsx` — question list + inline add/edit form
- [ ] T034 Create `src/pages/BankManagerPage/BankManagerPage.tsx` — composes BankList + BankEditor with selected bank state
- [ ] T035 Implement question form — text field, 2-4 option inputs (dynamic add/remove), correct-answer radio
- [ ] T036 Implement delete confirmation modal (Ant Design `Modal.confirm`) for both bank and question deletion
- [ ] T037 Wire export button (call `bankStore.exportBank`) + import file input (`<input type="file" accept=".json">`)

### Implementation Notes
- BankList: built-in bank shows "(内置)" badge, no delete/edit buttons; custom banks fully editable
- BankEditor: blank bank shows empty state illustration + "添加第一道题" prompt
- Question form: Ant Design `Form` + `Input`; option count: 2–4 (show "+" button to add option, "×" to remove when count > 2)
- Import conflict modal: "题库 '[name]' 已存在，是否覆盖？" with Rename / Overwrite / Cancel options
- Hidden file input triggered by visible Ant Design `Button`

### Parallel Opportunities
- T032 and T033 are fully parallel (independent components)

### Dependencies
- Depends on WP02 (bankStore with all CRUD + import/export actions)

### Risks & Mitigations
- Import of invalid JSON: display Ant Design `message.error()` with specific validation failure reason
- Bank name uniqueness: validate on bank creation; Ant Design `Form.Item` inline error

---

## Work Package WP08: Responsive Design & Polish (Priority: P3)

**Goal**: Audit and fix responsive layouts across all 5 screens for 320px–2560px widths, ensure 44px touch targets, add all loading/empty/error states, and verify all 6 success criteria.
**Independent Test**: All 6 SC-001 to SC-006 metrics pass on a 375px mobile browser and a 1280px desktop browser. All interactive elements meet 44px touch target. No horizontal scrolling on any screen at 320px.
**Prompt**: `tasks/WP08-responsive-design-and-polish.md`
**Estimated size**: ~380 lines

### Included Subtasks
- [ ] T038 Audit + fix mobile layouts (320–480px) for SetupPage, GamePage, ResultPage, LeaderboardPage, BankManagerPage
- [ ] T039 Audit + fix tablet/desktop layouts (481px+) — efficient use of wider screens
- [ ] T040 Enforce 44×44px minimum touch targets on all buttons and answer options
- [ ] T041 Add empty/zero-state UI (no banks selected, empty bank, single-player mode notice)
- [ ] T042 Add error state handling (import failure toast, localStorage quota warning)
- [ ] T043 Manual verification of SC-001 through SC-006 acceptance criteria

### Implementation Notes
- Use Tailwind responsive prefixes: `sm:` (640px), `md:` (768px), `lg:` (1024px)
- Answer options on mobile: full-width stacked; on desktop: 2-column grid
- GamePage header (player + round info): compact on mobile, expanded on desktop
- SC-001: time from page open to first question must be demonstrably < 60s
- SC-005: question text + 4 options + timer must all be visible on iPhone SE (375px) without scroll

### Parallel Opportunities
- T038 and T039 audits can run in parallel (different viewport ranges, different files if needed)

### Dependencies
- Depends on WP04, WP05, WP06, WP07 (all screens must exist before audit)

### Risks & Mitigations
- Ant Design component defaults may override rem scaling — inspect computed styles to verify postcss-pxtorem is active
- Long question text overflow on mobile — add `overflow-wrap: break-word` via Tailwind `break-words`

---

## Work Package WP09: Unit Tests (Priority: P1)

**Goal**: Write Vitest unit tests for all pure functions in `src/services/` — game engine (turn logic, scoring, pool building), dense ranking, and bank service (merge, shuffle, import schema validation).
**Independent Test**: `npx vitest run` exits with 0 failures. All edge cases from the spec Edge Cases section are covered.
**Prompt**: `tasks/WP09-unit-tests.md`
**Estimated size**: ~300 lines

### Included Subtasks
- [ ] T044 Write `src/__tests__/gameEngine.test.ts` — turn advancement, scoring, pool capping, player cycling
- [ ] T045 Write `src/__tests__/leaderboard.test.ts` — dense ranking with ties, single player, all tied
- [ ] T046 Write `src/__tests__/bankService.test.ts` — merge, shuffle randomness, import validation, conflict detection

### Implementation Notes
- No component tests (per user's selection of option B during planning)
- Test edge cases: 1 player, 12 players, all tied scores, pool smaller than required turns
- `shuffleArray` randomness: test that output length = input length and contains same elements (not ordering)
- Import validation tests: valid JSON, missing `type` field, invalid `correctIndex`, empty questions array

### Parallel Opportunities
- T044, T045, T046 are fully parallel (independent test files)

### Dependencies
- Depends on WP02 (bankService), WP03 (gameEngine) — tests can be written alongside or after implementation

### Risks & Mitigations
- Vitest may need `vitest.config.ts` — verify it's auto-detected via Vite config or add explicit config

---

## Dependency & Execution Summary

**Sequence**:
```
WP01 (foundation)
 ├── WP02 (bank store) ─┬── WP04 (setup page) ─┐
 └── WP03 (game store) ─┤                        ├── WP08 (responsive polish)
                        ├── WP05 (game + result) ─┤
                        ├── WP06 (leaderboard) ───┤
                        └── WP07 (bank manager) ──┘
                                                   └── WP09 (unit tests, can run alongside WP08)
```

**Parallelization opportunities**:
- After WP01: WP02 and WP03 can run in parallel
- After WP02 + WP03: WP04, WP05, WP06 can all run in parallel
- After WP02: WP07 can run in parallel with WP05/WP06
- WP09 can run alongside WP08

**MVP Scope**: WP01 + WP02 + WP03 + WP04 + WP05 + WP06 → playable game with default question bank

---

## Subtask Index (Reference)

| Subtask | Summary | Work Package | Priority | Parallel? |
|---------|---------|--------------|----------|-----------|
| T001 | Install npm packages | WP01 | P0 | No |
| T002 | Configure postcss-pxtorem | WP01 | P0 | No |
| T003 | Create src/types/index.ts | WP01 | P0 | Yes |
| T004 | Create src/data/defaultBank.ts | WP01 | P0 | Yes |
| T005 | Create src/router/index.tsx | WP01 | P0 | No |
| T006 | Update src/App.tsx | WP01 | P0 | No |
| T007 | Create persistence.ts | WP02 | P0 | Yes |
| T008 | Create bankService.ts | WP02 | P0 | Yes |
| T009 | Create bankStore.ts | WP02 | P0 | No |
| T010 | Implement exportBank() | WP02 | P0 | No |
| T011 | Implement importBank() | WP02 | P0 | No |
| T012 | Create gameEngine.ts | WP03 | P0 | Yes |
| T013 | Implement computeLeaderboard() | WP03 | P0 | Yes |
| T014 | Create gameStore.ts | WP03 | P0 | No |
| T015 | Implement startGame() | WP03 | P0 | No |
| T016 | Implement submitAnswer() | WP03 | P0 | No |
| T017 | Implement continueToNext() + resetGame() | WP03 | P0 | No |
| T018 | BankSelector component | WP04 | P1 | Yes |
| T019 | PlayerConfig component | WP04 | P1 | Yes |
| T020 | GameConfig component | WP04 | P1 | Yes |
| T021 | SetupPage composition | WP04 | P1 | No |
| T022 | Bank manager navigation link | WP04 | P1 | No |
| T023 | CountdownTimer component | WP05 | P1 | No |
| T024 | AnswerOption component | WP05 | P1 | Yes |
| T025 | PlayerBadge component | WP05 | P1 | Yes |
| T026 | GamePage | WP05 | P1 | No |
| T027 | ResultPage | WP05 | P1 | No |
| T028 | Leaderboard component | WP06 | P1 | Yes |
| T029 | LeaderboardPage | WP06 | P1 | Yes |
| T030 | Rank reveal animation | WP06 | P1 | No |
| T031 | Play Again flow | WP06 | P1 | No |
| T032 | BankList component | WP07 | P2 | Yes |
| T033 | BankEditor component | WP07 | P2 | Yes |
| T034 | BankManagerPage composition | WP07 | P2 | No |
| T035 | Question form | WP07 | P2 | No |
| T036 | Delete confirmation modal | WP07 | P2 | No |
| T037 | Export + import wiring | WP07 | P2 | No |
| T038 | Mobile layout audit | WP08 | P3 | Yes |
| T039 | Tablet/desktop layout audit | WP08 | P3 | Yes |
| T040 | Touch target enforcement | WP08 | P3 | No |
| T041 | Empty/zero states | WP08 | P3 | No |
| T042 | Error state handling | WP08 | P3 | No |
| T043 | SC-001–SC-006 verification | WP08 | P3 | No |
| T044 | gameEngine.test.ts | WP09 | P1 | Yes |
| T045 | leaderboard.test.ts | WP09 | P1 | Yes |
| T046 | bankService.test.ts | WP09 | P1 | Yes |
