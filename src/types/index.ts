// Option within a question
export interface Option {
  id: string
  text: string
}

// A single quiz question
export interface Question {
  id: string
  text: string
  options: Option[]         // 2–4 items
  correctOptionId: string   // Must match one Option.id in this question
}

// A named collection of questions
export interface QuestionBank {
  id: string
  name: string
  type: 'builtin' | 'custom'
  questions: Question[]
  createdAt: string         // ISO 8601 timestamp
}

// A game participant
export interface Player {
  id: string
  name: string
  turnOrder: number         // 0-indexed position in player array
}

// Configuration passed to startGame()
export interface GameConfig {
  selectedBankIds: string[]
  players: Player[]         // 1–12
  roundCount: number        // ≥1; total turns = roundCount × players.length
  timeLimitSeconds: number  // ≥5; default 30
}

export type GamePhase = 'idle' | 'question' | 'result' | 'finished'

// Active game session (in-memory only, not persisted)
export interface GameSession {
  config: GameConfig
  questionPool: Question[]            // merged + shuffled at game start
  currentTurnIndex: number            // 0-indexed; advances on each Continue press
  scores: Record<string, number>      // Player.id → cumulative score
  lastAnswerCorrect: boolean | null   // null = timer expired (no answer)
  lastAnsweredOptionId: string | null // Which option the player selected
}

// Leaderboard entry with dense ranking
export interface RankedPlayer extends Player {
  score: number
  rank: number // Dense ranking: ties share same rank, no gaps
}

// JSON schema for bank export/import files
export interface BankExportSchema {
  version: '1.0'
  type: 'quiz-bank'
  name: string
  questions: Array<{
    text: string
    options: string[]    // Plain text options in order
    correctIndex: number // 0-indexed into options array
  }>
}
