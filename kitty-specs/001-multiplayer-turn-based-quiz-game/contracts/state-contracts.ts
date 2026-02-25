/**
 * State Contracts: Zustand Store Interfaces
 * Feature: 001-multiplayer-turn-based-quiz-game
 *
 * These interfaces define the shape of all Zustand stores.
 * Actual implementations live in src/stores/.
 */

import type {
  GameConfig,
  GamePhase,
  GameSession,
  Player,
  Question,
  QuestionBank,
  RankedPlayer,
} from '../../../src/types/index'

// ─── Game Store ───────────────────────────────────────────────────────────────
// Location: src/stores/gameStore.ts
// Persistence: IN-MEMORY ONLY (lost on page refresh)

export interface GameStoreState {
  /** Active game session, or null when idle */
  session: GameSession | null

  /** Current phase of the game state machine */
  phase: GamePhase
}

export interface GameStoreActions {
  /**
   * Initialize and start a new game session.
   * Merges selected banks, shuffles the question pool, resets scores.
   * Transitions phase: idle → question
   */
  startGame: (config: GameConfig) => void

  /**
   * Submit the active player's answer (or null if timer expired).
   * Updates scores if correct. Transitions phase: question → result
   */
  submitAnswer: (selectedOptionId: string | null) => void

  /**
   * Advance to the next turn after the result screen.
   * If more turns remain: transitions phase result → question
   * If no turns remain: transitions phase result → finished
   */
  continueToNext: () => void

  /**
   * Reset the game and return to idle state.
   * Transitions phase: finished → idle
   */
  resetGame: () => void

  /**
   * Compute the final leaderboard from the current session.
   * Returns an empty array if session is null.
   */
  getLeaderboard: () => RankedPlayer[]
}

export type GameStore = GameStoreState & GameStoreActions

// ─── Bank Store ───────────────────────────────────────────────────────────────
// Location: src/stores/bankStore.ts
// Persistence: localStorage key "quiz-game-banks" via Zustand persist middleware
//              Built-in bank is NOT persisted; merged at runtime from defaultBank.ts

export interface BankStoreState {
  /** Custom banks only (persisted to localStorage) */
  customBanks: QuestionBank[]
}

export interface BankStoreActions {
  /** Return all banks: built-in bank first, then custom banks sorted by createdAt */
  getAllBanks: () => QuestionBank[]

  /** Create a new empty custom bank with the given name */
  createBank: (name: string) => void

  /** Add a new question to an existing custom bank */
  addQuestion: (bankId: string, question: Omit<Question, 'id'>) => void

  /** Update an existing question in a custom bank */
  updateQuestion: (bankId: string, questionId: string, updates: Partial<Omit<Question, 'id'>>) => void

  /** Delete a question from a custom bank */
  deleteQuestion: (bankId: string, questionId: string) => void

  /** Delete an entire custom bank (requires prior confirmation in UI) */
  deleteBank: (bankId: string) => void

  /**
   * Export a bank (built-in or custom) as a JSON file download.
   * Uses Blob + URL.createObjectURL() for browser compatibility.
   */
  exportBank: (bankId: string) => void

  /**
   * Import a question bank from a JSON File object.
   * Validates schema; resolves name conflicts via callback.
   * Returns error string on validation failure.
   */
  importBank: (file: File, onNameConflict: (name: string) => Promise<'rename' | 'overwrite' | 'cancel'>) => Promise<{ success: boolean; error?: string }>

  /**
   * Merge and shuffle questions from the given bank IDs.
   * Used by gameStore.startGame() to build the question pool.
   */
  getMergedQuestions: (bankIds: string[]) => Question[]
}

export type BankStore = BankStoreState & BankStoreActions
