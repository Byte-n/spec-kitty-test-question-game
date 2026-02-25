---
work_package_id: WP03
title: Game Engine & Game Store
lane: "for_review"
dependencies: [WP01]
base_branch: 001-multiplayer-turn-based-quiz-game-WP01
base_commit: a059aa63f7b6540bd41ed1b98581e728c44e777e
created_at: '2026-02-25T10:25:39.503042+00:00'
subtasks:
- T012
- T013
- T014
- T015
- T016
- T017
phase: Phase 0 - Foundation
assignee: ''
agent: "claude"
shell_pid: "70337"
review_status: ''
reviewed_by: ''
history:
- timestamp: '2026-02-25T00:00:00Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
---

# Work Package Prompt: WP03 – Game Engine & Game Store

## ⚠️ IMPORTANT: Review Feedback Status

- **Has review feedback?**: Check the `review_status` field above.

---

## Review Feedback

*[Empty — no feedback yet.]*

---

## Objectives & Success Criteria

- `startGame(config)` initialises a `GameSession` with shuffled question pool and transitions `phase` to `'question'`
- `submitAnswer(optionId)` with the correct option → player score +1; `submitAnswer(null)` (timer expired) → score unchanged; both → phase becomes `'result'`
- `continueToNext()` from result → `phase` becomes `'question'` (next player) or `'finished'` (no more turns)
- `getLeaderboard()` returns players sorted descending by score with dense ranking (ties share same rank)
- `resetGame()` clears session and sets phase back to `'idle'`
- All pure functions in `gameEngine.ts` are exported and importable for unit testing (WP09)

## Context & Constraints

- **Implement command**: `spec-kitty implement WP03 --base WP01`
- **Can run in parallel with WP02** (both depend only on WP01)
- **Spec**: FR-006 through FR-011, FR-018, FR-019; clarification: post-answer result shown, then Continue button advances
- **Data model**: `kitty-specs/001-multiplayer-turn-based-quiz-game/data-model.md`
- Game session is **in-memory only** — no Zustand `persist` middleware
- `submitAnswer` must be idempotent: if `phase !== 'question'`, ignore the call (timer auto-submit + manual tap race condition)

## Subtasks & Detailed Guidance

### Subtask T012 – Create `src/services/gameEngine.ts` (core helpers)

**Purpose**: Pure functions for derived game values and pool management. No side effects; easily testable.

**Steps**:
1. Create `src/services/gameEngine.ts`:
   ```typescript
   import type { GameConfig, GameSession, Player, Question } from '../types'

   /** Build and cap the question pool to available questions (warn if insufficient) */
   export function buildQuestionPool(
     mergedQuestions: Question[],
     config: GameConfig
   ): { pool: Question[]; capped: boolean } {
     const totalNeeded = config.roundCount * config.players.length
     const shuffled = mergedQuestions  // Already shuffled by bankService.getMergedQuestions
     const capped = shuffled.length < totalNeeded
     const pool = capped ? shuffled : shuffled.slice(0, totalNeeded)
     return { pool, capped }
   }

   /** Derive the active player for a given turn index */
   export function getCurrentPlayer(session: GameSession): Player {
     return session.config.players[session.currentTurnIndex % session.config.players.length]
   }

   /** Derive the current round number (1-indexed) */
   export function getCurrentRound(session: GameSession): number {
     return Math.floor(session.currentTurnIndex / session.config.players.length) + 1
   }

   /** Get the question for the current turn */
   export function getCurrentQuestion(session: GameSession): Question | null {
     return session.questionPool[session.currentTurnIndex] ?? null
   }

   /** Total number of turns in this game */
   export function getTotalTurns(session: GameSession): number {
     return session.questionPool.length
   }

   /** Is this the last turn? */
   export function isLastTurn(session: GameSession): boolean {
     return session.currentTurnIndex >= session.questionPool.length - 1
   }

   /** Apply a score delta to the scores map (immutable) */
   export function applyScore(
     scores: Record<string, number>,
     playerId: string,
     delta: number
   ): Record<string, number> {
     return { ...scores, [playerId]: (scores[playerId] ?? 0) + delta }
   }
   ```

**Files**: `src/services/gameEngine.ts` (new file, ~55 lines)

**Parallel?**: Yes — T012 and T013 are in the same file but independent functions; implement both in T012/T013 and combine.

---

### Subtask T013 – Implement `computeLeaderboard()` in `gameEngine.ts`

**Purpose**: Dense ranking algorithm — tied players share the same rank, with no gaps.

**Steps**:
1. Add to `src/services/gameEngine.ts`:
   ```typescript
   import type { RankedPlayer } from '../types'

   /**
    * Compute dense-ranked leaderboard from a session.
    * Dense ranking: [10, 8, 8, 5] → ranks [1, 2, 2, 3] (no rank 4)
    */
   export function computeLeaderboard(session: GameSession): RankedPlayer[] {
     const { players, scores } = { players: session.config.players, scores: session.scores }
     const sorted = [...players].sort(
       (a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0)
     )

     let rank = 1
     return sorted.map((player, i) => {
       if (i > 0 && (scores[player.id] ?? 0) < (scores[sorted[i - 1].id] ?? 0)) {
         rank = i + 1
       }
       return {
         ...player,
         score: scores[player.id] ?? 0,
         rank,
       }
     })
   }
   ```

**Files**: `src/services/gameEngine.ts` (add function, ~20 lines)

**Notes**:
- Example: 4 players scores [10, 8, 8, 5] → [rank 1, rank 2, rank 2, rank 3]
- Players with the same rank are ordered alphabetically within that rank group

---

### Subtask T014 – Create `src/stores/gameStore.ts` (state machine skeleton)

**Purpose**: Zustand store holding the active game session and phase. In-memory only — no localStorage persistence.

**Steps**:
1. Create `src/stores/gameStore.ts`:
   ```typescript
   import { create } from 'zustand'
   import type { GameConfig, GamePhase, GameSession, RankedPlayer } from '../types'
   import { useBankStore } from './bankStore'
   import {
     buildQuestionPool,
     getCurrentPlayer,
     getCurrentQuestion,
     isLastTurn,
     applyScore,
     computeLeaderboard,
   } from '../services/gameEngine'

   interface GameStoreState {
     session: GameSession | null
     phase: GamePhase
   }

   interface GameStoreActions {
     startGame: (config: GameConfig) => void
     submitAnswer: (selectedOptionId: string | null) => void
     continueToNext: () => void
     resetGame: () => void
     getLeaderboard: () => RankedPlayer[]
   }

   export const useGameStore = create<GameStoreState & GameStoreActions>()((set, get) => ({
     session: null,
     phase: 'idle',

     startGame: () => {},       // T015
     submitAnswer: () => {},    // T016
     continueToNext: () => {},  // T017
     resetGame: () => {},       // T017
     getLeaderboard: () => [],  // T017
   }))
   ```
2. This skeleton allows WP01 (router) to import `useGameStore` without circular dependency issues.

**Files**: `src/stores/gameStore.ts` (new file, ~40 lines)

---

### Subtask T015 – Implement `startGame(config)`

**Purpose**: Initialises a new `GameSession` from the given config — merges bank questions, builds the pool, initialises scores to 0, sets phase to `'question'`.

**Steps**:
1. Replace `startGame: () => {}` stub with:
   ```typescript
   startGame: (config) => {
     const mergedQuestions = useBankStore.getState().getMergedQuestions(config.selectedBankIds)
     const { pool, capped } = buildQuestionPool(mergedQuestions, config)

     if (capped) {
       console.warn(`[Quiz] Question pool (${mergedQuestions.length}) smaller than required turns (${config.roundCount * config.players.length}). Game will end early.`)
     }

     if (pool.length === 0) {
       console.error('[Quiz] No questions available. Cannot start game.')
       return
     }

     const initialScores: Record<string, number> = {}
     for (const player of config.players) {
       initialScores[player.id] = 0
     }

     const session: GameSession = {
       config,
       questionPool: pool,
       currentTurnIndex: 0,
       scores: initialScores,
       lastAnswerCorrect: null,
       lastAnsweredOptionId: null,
     }

     set({ session, phase: 'question' })
   },
   ```

**Files**: `src/stores/gameStore.ts` (replace stub)

---

### Subtask T016 – Implement `submitAnswer(selectedOptionId | null)`

**Purpose**: Process a player's answer (or timer expiry). Updates score if correct, records result, transitions phase to `'result'`.

**Steps**:
1. Replace `submitAnswer: () => {}` stub with:
   ```typescript
   submitAnswer: (selectedOptionId) => {
     const { session, phase } = get()
     // Idempotency guard — ignore if not in question phase
     if (phase !== 'question' || !session) return

     const question = getCurrentQuestion(session)
     if (!question) return

     const isCorrect = selectedOptionId !== null && selectedOptionId === question.correctOptionId
     const player = getCurrentPlayer(session)
     const newScores = isCorrect ? applyScore(session.scores, player.id, 1) : session.scores

     set({
       session: {
         ...session,
         scores: newScores,
         lastAnswerCorrect: isCorrect,
         lastAnsweredOptionId: selectedOptionId,
       },
       phase: 'result',
     })
   },
   ```

**Files**: `src/stores/gameStore.ts` (replace stub)

**Notes**: Flat scoring — 1 point per correct answer. `null` selectedOptionId = timer expired, no score.

---

### Subtask T017 – Implement `continueToNext()`, `resetGame()`, and `getLeaderboard()`

**Purpose**: Complete the state machine — advance to next turn or finish, reset to idle, and compute final leaderboard.

**Steps**:
1. Replace stubs with:
   ```typescript
   continueToNext: () => {
     const { session, phase } = get()
     if (phase !== 'result' || !session) return

     if (isLastTurn(session)) {
       set({ phase: 'finished' })
     } else {
       set({
         session: { ...session, currentTurnIndex: session.currentTurnIndex + 1 },
         phase: 'question',
       })
     }
   },

   resetGame: () => {
     set({ session: null, phase: 'idle' })
   },

   getLeaderboard: () => {
     const { session } = get()
     if (!session) return []
     return computeLeaderboard(session)
   },
   ```

**Files**: `src/stores/gameStore.ts` (replace stubs)

---

## Risks & Mitigations

- **Race condition (timer + tap)**: `submitAnswer` guards `phase !== 'question'` → if timer fires after tap, second call is a no-op.
- **Empty pool**: `startGame` returns early if `pool.length === 0`; upstream validation in SetupPage (WP04) prevents reaching this state.
- **Cross-store dependency** (`gameStore` → `bankStore`): Use `useBankStore.getState()` (not hook) inside `startGame` to avoid React hook rules violation in store actions.
- **React StrictMode double-invocation**: Zustand actions are not affected by StrictMode since they don't use lifecycle hooks.

## Review Guidance

- [ ] After `startGame({ selectedBankIds: ['builtin'], players: [p1, p2], roundCount: 2, timeLimitSeconds: 30 })`, `phase === 'question'` and `session.questionPool.length === 4` (2 rounds × 2 players)
- [ ] `submitAnswer('correct-option-id')` → `phase === 'result'`, `session.lastAnswerCorrect === true`, player score +1
- [ ] `submitAnswer(null)` → `phase === 'result'`, `session.lastAnswerCorrect === false`, score unchanged
- [ ] `submitAnswer()` called twice → second call is ignored (idempotency)
- [ ] `continueToNext()` on last turn → `phase === 'finished'`
- [ ] `getLeaderboard()` with tied scores → tied players share same rank (dense ranking)
- [ ] `resetGame()` → `session === null`, `phase === 'idle'`

## Activity Log

- 2026-02-25T00:00:00Z – system – lane=planned – Prompt created.
- 2026-02-25T10:25:39Z – claude – shell_pid=70337 – lane=doing – Assigned agent via workflow command
- 2026-02-25T10:28:41Z – claude – shell_pid=70337 – lane=for_review – T012–T017 done: gameEngine pure functions (pool builder, player/round/question helpers, dense leaderboard), gameStore state machine (startGame/submitAnswer/continueToNext/resetGame/getLeaderboard), router updated to use real store
