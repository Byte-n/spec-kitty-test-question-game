import { create } from 'zustand'
import type { GameConfig, GamePhase, GameSession, RankedPlayer } from '../types'
import { useBankStore } from './bankStore.stub'
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

  startGame: (config) => {
    const mergedQuestions = useBankStore.getState().getMergedQuestions(config.selectedBankIds)
    const { pool, capped } = buildQuestionPool(mergedQuestions, config)

    if (capped) {
      console.warn(
        `[Quiz] Question pool (${mergedQuestions.length}) smaller than required turns (${config.roundCount * config.players.length}). Game will end early.`,
      )
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
}))
