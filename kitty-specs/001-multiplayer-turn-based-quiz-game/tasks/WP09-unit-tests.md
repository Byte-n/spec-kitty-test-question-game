---
work_package_id: WP09
title: Unit Tests
lane: "for_review"
dependencies:
- WP02
base_branch: 001-multiplayer-turn-based-quiz-game-WP02
base_commit: 46408e730bf9ffb0663582f383efe6d119610dbd
created_at: '2026-02-25T15:13:15.996638+00:00'
subtasks:
- T044
- T045
- T046
phase: Phase 3 - Polish
assignee: ''
agent: "claude"
shell_pid: "75069"
review_status: ''
reviewed_by: ''
history:
- timestamp: '2026-02-25T00:00:00Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
---

# Work Package Prompt: WP09 – Unit Tests

## ⚠️ IMPORTANT: Review Feedback Status

- **Has review feedback?**: Check the `review_status` field above.

---

## Review Feedback

*[Empty — no feedback yet.]*

---

## Objectives & Success Criteria

- `npx vitest run` exits with 0 failures and 0 errors
- Game engine tests cover: turn advancement, player cycling, scoring, pool building, edge cases (1 player, 12 players, pool too small)
- Leaderboard tests cover: dense ranking, all tied, single player, large score differences
- Bank service tests cover: Fisher-Yates shuffle (length/content invariants), getMergedQuestions, import schema validation (valid + all invalid cases)

## Context & Constraints

- **Implement command**: `spec-kitty implement WP09 --base WP03`
- **Can run alongside WP08** after WP02 and WP03 complete
- **Constitution**: Vitest only; unit tests for pure functions only; no component tests
- Tests live in `src/__tests__/` — create this directory if it doesn't exist
- Vitest is bundled with Vite projects and should auto-detect via `vite.config.ts`; add explicit `test` config if needed

## Subtasks & Detailed Guidance

### Subtask T044 – Write `src/__tests__/gameEngine.test.ts`

**Purpose**: Test all pure functions in `src/services/gameEngine.ts` — derived values, pool building, scoring, turn logic.

**Steps**:
1. Create `src/__tests__/gameEngine.test.ts`:
   ```typescript
   import { describe, it, expect } from 'vitest'
   import {
     buildQuestionPool,
     getCurrentPlayer,
     getCurrentRound,
     getCurrentQuestion,
     getTotalTurns,
     isLastTurn,
     applyScore,
   } from '../services/gameEngine'
   import type { GameConfig, GameSession, Player, Question } from '../types'

   // Helpers
   function makePlayer(id: string, turnOrder: number): Player {
     return { id, name: `Player ${turnOrder + 1}`, turnOrder }
   }

   function makeQuestion(id: string): Question {
     return {
       id,
       text: `Question ${id}`,
       options: [
         { id: `${id}-a`, text: 'A' },
         { id: `${id}-b`, text: 'B' },
       ],
       correctOptionId: `${id}-a`,
     }
   }

   function makeSession(overrides: Partial<GameSession> = {}): GameSession {
     const players = [makePlayer('p1', 0), makePlayer('p2', 1)]
     const questions = [makeQuestion('q1'), makeQuestion('q2'), makeQuestion('q3'), makeQuestion('q4')]
     return {
       config: { selectedBankIds: [], players, roundCount: 2, timeLimitSeconds: 30 },
       questionPool: questions,
       currentTurnIndex: 0,
       scores: { p1: 0, p2: 0 },
       lastAnswerCorrect: null,
       lastAnsweredOptionId: null,
       ...overrides,
     }
   }

   describe('buildQuestionPool', () => {
     it('returns pool capped to roundCount × players when pool is large enough', () => {
       const config: GameConfig = {
         selectedBankIds: [],
         players: [makePlayer('p1', 0), makePlayer('p2', 1)],
         roundCount: 2,
         timeLimitSeconds: 30,
       }
       const questions = Array.from({ length: 10 }, (_, i) => makeQuestion(`q${i}`))
       const { pool, capped } = buildQuestionPool(questions, config)
       expect(pool.length).toBe(4) // 2 rounds × 2 players
       expect(capped).toBe(false)
     })

     it('returns all questions and sets capped=true when pool is too small', () => {
       const config: GameConfig = {
         selectedBankIds: [],
         players: [makePlayer('p1', 0), makePlayer('p2', 1)],
         roundCount: 5, // needs 10 questions
         timeLimitSeconds: 30,
       }
       const questions = [makeQuestion('q1'), makeQuestion('q2')] // only 2
       const { pool, capped } = buildQuestionPool(questions, config)
       expect(pool.length).toBe(2)
       expect(capped).toBe(true)
     })

     it('works with 1 player', () => {
       const config: GameConfig = {
         selectedBankIds: [],
         players: [makePlayer('p1', 0)],
         roundCount: 3,
         timeLimitSeconds: 30,
       }
       const questions = Array.from({ length: 5 }, (_, i) => makeQuestion(`q${i}`))
       const { pool } = buildQuestionPool(questions, config)
       expect(pool.length).toBe(3)
     })

     it('works with 12 players', () => {
       const config: GameConfig = {
         selectedBankIds: [],
         players: Array.from({ length: 12 }, (_, i) => makePlayer(`p${i}`, i)),
         roundCount: 2,
         timeLimitSeconds: 30,
       }
       const questions = Array.from({ length: 30 }, (_, i) => makeQuestion(`q${i}`))
       const { pool } = buildQuestionPool(questions, config)
       expect(pool.length).toBe(24) // 2 × 12
     })
   })

   describe('getCurrentPlayer', () => {
     it('returns the player at turn 0', () => {
       const session = makeSession({ currentTurnIndex: 0 })
       expect(getCurrentPlayer(session).id).toBe('p1')
     })

     it('cycles to player 2 on turn 1', () => {
       const session = makeSession({ currentTurnIndex: 1 })
       expect(getCurrentPlayer(session).id).toBe('p2')
     })

     it('cycles back to player 1 on turn 2', () => {
       const session = makeSession({ currentTurnIndex: 2 })
       expect(getCurrentPlayer(session).id).toBe('p1')
     })
   })

   describe('getCurrentRound', () => {
     it('returns round 1 at turn index 0', () => {
       expect(getCurrentRound(makeSession({ currentTurnIndex: 0 }))).toBe(1)
     })
     it('returns round 1 at turn index 1 (2 players)', () => {
       expect(getCurrentRound(makeSession({ currentTurnIndex: 1 }))).toBe(1)
     })
     it('returns round 2 at turn index 2 (2 players)', () => {
       expect(getCurrentRound(makeSession({ currentTurnIndex: 2 }))).toBe(2)
     })
   })

   describe('isLastTurn', () => {
     it('returns false for first turn of a 4-question pool', () => {
       const session = makeSession({ currentTurnIndex: 0 })
       expect(isLastTurn(session)).toBe(false)
     })
     it('returns true for the last turn', () => {
       const session = makeSession({ currentTurnIndex: 3 }) // pool length = 4
       expect(isLastTurn(session)).toBe(true)
     })
   })

   describe('applyScore', () => {
     it('adds delta to player score', () => {
       const result = applyScore({ p1: 3 }, 'p1', 1)
       expect(result.p1).toBe(4)
     })
     it('initialises score to delta if player has no score', () => {
       const result = applyScore({}, 'p1', 1)
       expect(result.p1).toBe(1)
     })
     it('is immutable — does not modify original object', () => {
       const original = { p1: 2 }
       applyScore(original, 'p1', 5)
       expect(original.p1).toBe(2)
     })
   })
   ```

**Files**: `src/__tests__/gameEngine.test.ts` (new file, ~100 lines)

**Parallel?**: Yes — independent of T045 and T046.

---

### Subtask T045 – Write `src/__tests__/leaderboard.test.ts`

**Purpose**: Exhaustive tests for the dense ranking algorithm covering all edge cases.

**Steps**:
1. Create `src/__tests__/leaderboard.test.ts`:
   ```typescript
   import { describe, it, expect } from 'vitest'
   import { computeLeaderboard } from '../services/gameEngine'
   import type { GameSession, Player } from '../types'

   function makePlayer(id: string, turnOrder: number): Player {
     return { id, name: `Player ${turnOrder + 1}`, turnOrder }
   }

   function makeSession(players: Player[], scores: Record<string, number>): GameSession {
     return {
       config: { selectedBankIds: [], players, roundCount: 1, timeLimitSeconds: 30 },
       questionPool: [],
       currentTurnIndex: 0,
       scores,
       lastAnswerCorrect: null,
       lastAnsweredOptionId: null,
     }
   }

   describe('computeLeaderboard — dense ranking', () => {
     it('ranks 4 players with distinct scores [10, 8, 5, 3] as [1, 2, 3, 4]', () => {
       const players = [makePlayer('a', 0), makePlayer('b', 1), makePlayer('c', 2), makePlayer('d', 3)]
       const session = makeSession(players, { a: 10, b: 8, c: 5, d: 3 })
       const ranked = computeLeaderboard(session)
       const ranks = ranked.map(p => p.rank)
       expect(ranks).toEqual([1, 2, 3, 4])
     })

     it('assigns same rank to tied players: [10, 8, 8, 5] → [1, 2, 2, 3]', () => {
       const players = [makePlayer('a', 0), makePlayer('b', 1), makePlayer('c', 2), makePlayer('d', 3)]
       const session = makeSession(players, { a: 10, b: 8, c: 8, d: 5 })
       const ranked = computeLeaderboard(session)
       const ranks = ranked.map(p => p.rank)
       expect(ranks).toEqual([1, 2, 2, 3])
     })

     it('all players tied: all rank 1', () => {
       const players = [makePlayer('a', 0), makePlayer('b', 1), makePlayer('c', 2)]
       const session = makeSession(players, { a: 5, b: 5, c: 5 })
       const ranked = computeLeaderboard(session)
       expect(ranked.every(p => p.rank === 1)).toBe(true)
     })

     it('all players score 0: all rank 1', () => {
       const players = [makePlayer('a', 0), makePlayer('b', 1)]
       const session = makeSession(players, { a: 0, b: 0 })
       const ranked = computeLeaderboard(session)
       expect(ranked.every(p => p.rank === 1)).toBe(true)
     })

     it('single player: rank 1', () => {
       const players = [makePlayer('a', 0)]
       const session = makeSession(players, { a: 7 })
       const ranked = computeLeaderboard(session)
       expect(ranked.length).toBe(1)
       expect(ranked[0].rank).toBe(1)
       expect(ranked[0].score).toBe(7)
     })

     it('players are sorted descending by score', () => {
       const players = [makePlayer('a', 0), makePlayer('b', 1), makePlayer('c', 2)]
       const session = makeSession(players, { a: 3, b: 9, c: 6 })
       const ranked = computeLeaderboard(session)
       const scores = ranked.map(p => p.score)
       expect(scores).toEqual([9, 6, 3])
     })

     it('player with no score entry defaults to 0', () => {
       const players = [makePlayer('a', 0), makePlayer('b', 1)]
       const session = makeSession(players, { a: 5 }) // b has no entry
       const ranked = computeLeaderboard(session)
       const bEntry = ranked.find(p => p.id === 'b')!
       expect(bEntry.score).toBe(0)
     })
   })
   ```

**Files**: `src/__tests__/leaderboard.test.ts` (new file, ~65 lines)

**Parallel?**: Yes — independent of T044 and T046.

---

### Subtask T046 – Write `src/__tests__/bankService.test.ts`

**Purpose**: Test `shuffleArray`, `getMergedQuestions`, and `validateImportSchema` from `bankService.ts`.

**Steps**:
1. Create `src/__tests__/bankService.test.ts`:
   ```typescript
   import { describe, it, expect } from 'vitest'
   import { shuffleArray, getMergedQuestions, validateImportSchema } from '../services/bankService'
   import type { QuestionBank } from '../types'

   function makeBank(id: string, questionCount: number): QuestionBank {
     return {
       id,
       name: `Bank ${id}`,
       type: 'custom',
       createdAt: new Date().toISOString(),
       questions: Array.from({ length: questionCount }, (_, i) => ({
         id: `${id}-q${i}`,
         text: `Question ${i}`,
         options: [
           { id: `${id}-q${i}-a`, text: 'A' },
           { id: `${id}-q${i}-b`, text: 'B' },
         ],
         correctOptionId: `${id}-q${i}-a`,
       })),
     }
   }

   describe('shuffleArray', () => {
     it('returns a new array with the same length', () => {
       const arr = [1, 2, 3, 4, 5]
       const shuffled = shuffleArray(arr)
       expect(shuffled.length).toBe(arr.length)
     })

     it('contains the same elements as the original', () => {
       const arr = [1, 2, 3, 4, 5]
       const shuffled = shuffleArray(arr)
       expect(shuffled.sort()).toEqual([...arr].sort())
     })

     it('does not mutate the original array', () => {
       const arr = [1, 2, 3]
       const original = [...arr]
       shuffleArray(arr)
       expect(arr).toEqual(original)
     })

     it('handles empty array', () => {
       expect(shuffleArray([])).toEqual([])
     })

     it('handles single element', () => {
       expect(shuffleArray([42])).toEqual([42])
     })
   })

   describe('getMergedQuestions', () => {
     it('merges questions from two banks', () => {
       const banks = [makeBank('a', 3), makeBank('b', 4)]
       const merged = getMergedQuestions(banks, ['a', 'b'])
       expect(merged.length).toBe(7)
     })

     it('returns questions from only selected banks', () => {
       const banks = [makeBank('a', 3), makeBank('b', 4), makeBank('c', 5)]
       const merged = getMergedQuestions(banks, ['a', 'c'])
       expect(merged.length).toBe(8) // 3 + 5
     })

     it('returns empty array when no banks selected', () => {
       const banks = [makeBank('a', 3)]
       const merged = getMergedQuestions(banks, [])
       expect(merged.length).toBe(0)
     })

     it('ignores unknown bank IDs', () => {
       const banks = [makeBank('a', 3)]
       const merged = getMergedQuestions(banks, ['a', 'nonexistent'])
       expect(merged.length).toBe(3)
     })
   })

   describe('validateImportSchema', () => {
     const validSchema = {
       version: '1.0',
       type: 'quiz-bank',
       name: 'Test Bank',
       questions: [
         { text: 'Q1', options: ['A', 'B', 'C', 'D'], correctIndex: 0 },
       ],
     }

     it('returns valid=true for a correct schema', () => {
       const result = validateImportSchema(validSchema)
       expect(result.valid).toBe(true)
     })

     it('returns valid=false for non-object input', () => {
       expect(validateImportSchema('string').valid).toBe(false)
       expect(validateImportSchema(null).valid).toBe(false)
       expect(validateImportSchema(42).valid).toBe(false)
     })

     it('returns valid=false when type is not quiz-bank', () => {
       const result = validateImportSchema({ ...validSchema, type: 'other' })
       expect(result.valid).toBe(false)
     })

     it('returns valid=false when name is empty', () => {
       const result = validateImportSchema({ ...validSchema, name: '' })
       expect(result.valid).toBe(false)
     })

     it('returns valid=false when questions array is empty', () => {
       const result = validateImportSchema({ ...validSchema, questions: [] })
       expect(result.valid).toBe(false)
     })

     it('returns valid=false when a question has too few options', () => {
       const result = validateImportSchema({
         ...validSchema,
         questions: [{ text: 'Q', options: ['A'], correctIndex: 0 }],
       })
       expect(result.valid).toBe(false)
     })

     it('returns valid=false when correctIndex is out of range', () => {
       const result = validateImportSchema({
         ...validSchema,
         questions: [{ text: 'Q', options: ['A', 'B'], correctIndex: 5 }],
       })
       expect(result.valid).toBe(false)
     })

     it('returns valid=false when question text is empty', () => {
       const result = validateImportSchema({
         ...validSchema,
         questions: [{ text: '', options: ['A', 'B'], correctIndex: 0 }],
       })
       expect(result.valid).toBe(false)
     })
   })
   ```

**Files**: `src/__tests__/bankService.test.ts` (new file, ~100 lines)

**Parallel?**: Yes — independent of T044 and T045.

---

## Test Strategy

**Run tests**:
```bash
npx vitest run           # Single run, CI mode
npx vitest               # Watch mode during development
npx vitest run --reporter=verbose  # Detailed output
```

**If Vitest config needed** (add to `vite.config.ts`):
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

**Note**: `jsdom` environment is needed for `crypto.randomUUID()` in tests. Add `npm install --save-dev @vitest/coverage-v8` if coverage reporting is needed in the future.

## Risks & Mitigations

- **`crypto.randomUUID` in test environment**: Node.js 19+ and jsdom support this natively. If not available, mock it: `vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid' })`.
- **shuffleArray randomness**: The test verifies content invariants (same elements, same length), not ordering — this is the correct approach for non-deterministic functions.
- **Import paths**: Ensure test files use relative imports (`../services/gameEngine`) not absolute paths.

## Review Guidance

- [ ] `npx vitest run` exits with 0 failures
- [ ] All test cases listed above are present and passing
- [ ] Edge cases covered: 1 player, 12 players, all tied, pool too small, empty array inputs
- [ ] No component tests added (spec requirement: pure functions only)

## Activity Log

- 2026-02-25T00:00:00Z – system – lane=planned – Prompt created.
- 2026-02-25T15:13:16Z – claude – shell_pid=75069 – lane=doing – Assigned agent via workflow command
- 2026-02-25T15:21:50Z – claude – shell_pid=75069 – lane=for_review – Ready for review: 57 tests passing across 3 suites (gameEngine 23, bankService 25, leaderboard 9). Fixed computeLeaderboard to use dense ranking (rank += 1 not rank = i + 1).
