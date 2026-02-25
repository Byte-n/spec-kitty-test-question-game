// Stub: real implementation in WP03
// This file exists so src/router/index.tsx can import useGameStore without errors.
// It will be replaced entirely in WP03.
import { create } from 'zustand'
import type { GamePhase, GameSession } from '../types'

interface GameStoreState {
  session: GameSession | null
  phase: GamePhase
}

export const useGameStore = create<GameStoreState>()(() => ({
  session: null,
  phase: 'idle' as GamePhase,
}))
