# Data Model: Multiplayer Turn-Based Quiz Game

**Feature**: `001-multiplayer-turn-based-quiz-game`
**Date**: 2026-02-25

---

## Core Types

```typescript
// src/types/index.ts

// ─── Question Bank ───────────────────────────────────────────────────────────

export interface Option {
  id: string           // crypto.randomUUID()
  text: string         // Non-empty string
}

export interface Question {
  id: string           // crypto.randomUUID()
  text: string         // Non-empty string
  options: Option[]    // 2–4 items
  correctOptionId: string  // Must match one Option.id in this question
}

export interface QuestionBank {
  id: string           // crypto.randomUUID() for custom; 'builtin' for default bank
  name: string         // Non-empty; unique within localStorage
  type: 'builtin' | 'custom'
  questions: Question[]
  createdAt: string    // ISO 8601 timestamp
}

// ─── Game Session ────────────────────────────────────────────────────────────

export interface Player {
  id: string           // crypto.randomUUID()
  name: string         // Non-empty; defaults to "Player N" if left blank
  turnOrder: number    // 0-indexed position in player array
}

export interface GameConfig {
  selectedBankIds: string[]   // At least 1 valid bank id
  players: Player[]           // 1–12 players
  roundCount: number          // ≥1; total turns = roundCount × players.length
  timeLimitSeconds: number    // ≥5; default 30
}

export type GamePhase = 'idle' | 'question' | 'result' | 'finished'

export interface GameSession {
  config: GameConfig
  questionPool: Question[]    // Merged + shuffled at game start; length ≥ totalTurns (capped if pool smaller)
  currentTurnIndex: number    // 0-indexed; advances on each Continue press
  scores: Record<string, number>  // Player.id → cumulative score
  lastAnswerCorrect: boolean | null  // null = timer expired (no answer)
  lastAnsweredOptionId: string | null  // Which option the player selected
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export interface RankedPlayer extends Player {
  score: number
  rank: number   // Dense ranking: ties share same rank, no gaps
}

// ─── Import/Export ───────────────────────────────────────────────────────────

export interface BankExportSchema {
  version: '1.0'
  type: 'quiz-bank'
  name: string
  questions: Array<{
    text: string
    options: string[]       // Plain text options in order
    correctIndex: number    // 0-indexed into options array
  }>
}
```

---

## State Machines

### Game Phase Transitions

```
idle
  └─[startGame(config)]──→ question
                               │
                    [submitAnswer(optionId | null)]
                               │
                               ▼
                            result
                               │
                    [continueToNext()]
                               │
                    ┌──────────┴──────────┐
                    │ more turns?         │ no more turns?
                    ▼                     ▼
                 question             finished
                                         │
                              [resetGame()]
                                         │
                                         ▼
                                       idle
```

### Question Bank Lifecycle

```
(no bank)
    └─[createBank(name)]──→ empty custom bank
                                  │
                      [addQuestion(bankId, q)]
                                  │
                                  ▼
                         bank with questions
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
   [editQuestion(...)]  [deleteQuestion(...)]  [deleteBank(id)]
              │                   │                   │
           (updated)           (updated)           (removed)
```

---

## Validation Rules

| Field | Rule |
|-------|------|
| `Question.text` | Non-empty string, max 500 chars |
| `Question.options` | 2–4 items; each option text non-empty, max 200 chars |
| `Question.correctOptionId` | Must reference a valid `Option.id` in the same question |
| `QuestionBank.name` | Non-empty, max 50 chars; unique among all banks (built-in + custom) |
| `Player.name` | Auto-filled as "Player N" if blank; max 20 chars |
| `GameConfig.players` | 1–12 items |
| `GameConfig.roundCount` | Integer ≥ 1 |
| `GameConfig.timeLimitSeconds` | Integer ≥ 5; max 300 |
| `GameConfig.selectedBankIds` | At least 1 id; referenced bank must contain ≥ 1 question |
| `BankExportSchema.correctIndex` | 0-indexed; must be < options.length |

---

## localStorage Layout

```
Key: "quiz-game-banks"
Value: Zustand persist envelope
{
  "state": {
    "banks": QuestionBank[]   // custom banks only; builtin loaded from src/data/defaultBank.ts
  },
  "version": 1
}
```

**Built-in bank** is NOT stored in localStorage. It is imported as a static TypeScript module and merged with localStorage banks at runtime.

---

## Derived Values

| Value | Derivation |
|-------|-----------|
| `totalTurns` | `roundCount × players.length` |
| `currentPlayer` | `players[currentTurnIndex % players.length]` |
| `currentRound` | `Math.floor(currentTurnIndex / players.length) + 1` |
| `currentQuestion` | `questionPool[currentTurnIndex]` |
| `isLastTurn` | `currentTurnIndex === Math.min(totalTurns, questionPool.length) - 1` |
| Leaderboard ranks | Dense ranking on `scores` map |
