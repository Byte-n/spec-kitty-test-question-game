// Stub: real implementation in WP03
// This file provides the full gameStore interface for WP04 type-checking.
// WP03's gameStore.ts replaces this on merge.
import { create } from 'zustand'
import type { GameConfig, GamePhase, GameSession, RankedPlayer } from '../types'

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

export const useGameStore = create<GameStoreState & GameStoreActions>()(() => ({
  session: null,
  phase: 'idle' as GamePhase,
  startGame: (_config: GameConfig) => {},
  submitAnswer: (_selectedOptionId: string | null) => {},
  continueToNext: () => {},
  resetGame: () => {},
  getLeaderboard: () => [],
}))
