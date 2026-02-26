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

// ─── Helpers ───────────────────────────────────────────────────────────────

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
  const questions = [
    makeQuestion('q1'),
    makeQuestion('q2'),
    makeQuestion('q3'),
    makeQuestion('q4'),
  ]
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

// ─── buildQuestionPool ─────────────────────────────────────────────────────

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
    const questions = [makeQuestion('q1'), makeQuestion('q2')]
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

// ─── getCurrentPlayer ──────────────────────────────────────────────────────

describe('getCurrentPlayer', () => {
  it('returns player 1 at turn index 0', () => {
    expect(getCurrentPlayer(makeSession({ currentTurnIndex: 0 })).id).toBe('p1')
  })

  it('returns player 2 at turn index 1', () => {
    expect(getCurrentPlayer(makeSession({ currentTurnIndex: 1 })).id).toBe('p2')
  })

  it('cycles back to player 1 at turn index 2', () => {
    expect(getCurrentPlayer(makeSession({ currentTurnIndex: 2 })).id).toBe('p1')
  })

  it('cycles back to player 2 at turn index 3', () => {
    expect(getCurrentPlayer(makeSession({ currentTurnIndex: 3 })).id).toBe('p2')
  })
})

// ─── getCurrentRound ───────────────────────────────────────────────────────

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

  it('returns round 2 at turn index 3 (2 players)', () => {
    expect(getCurrentRound(makeSession({ currentTurnIndex: 3 }))).toBe(2)
  })
})

// ─── getCurrentQuestion ────────────────────────────────────────────────────

describe('getCurrentQuestion', () => {
  it('returns the question at the current turn index', () => {
    const session = makeSession({ currentTurnIndex: 0 })
    expect(getCurrentQuestion(session)?.id).toBe('q1')
  })

  it('returns the correct question at turn index 3', () => {
    const session = makeSession({ currentTurnIndex: 3 })
    expect(getCurrentQuestion(session)?.id).toBe('q4')
  })

  it('returns null when turn index exceeds pool length', () => {
    const session = makeSession({ currentTurnIndex: 99 })
    expect(getCurrentQuestion(session)).toBeNull()
  })
})

// ─── getTotalTurns ─────────────────────────────────────────────────────────

describe('getTotalTurns', () => {
  it('returns the length of the question pool', () => {
    expect(getTotalTurns(makeSession())).toBe(4)
  })
})

// ─── isLastTurn ────────────────────────────────────────────────────────────

describe('isLastTurn', () => {
  it('returns false for turn index 0 with a 4-question pool', () => {
    expect(isLastTurn(makeSession({ currentTurnIndex: 0 }))).toBe(false)
  })

  it('returns false for turn index 2 with a 4-question pool', () => {
    expect(isLastTurn(makeSession({ currentTurnIndex: 2 }))).toBe(false)
  })

  it('returns true for the last turn index (pool.length - 1)', () => {
    expect(isLastTurn(makeSession({ currentTurnIndex: 3 }))).toBe(true)
  })
})

// ─── applyScore ────────────────────────────────────────────────────────────

describe('applyScore', () => {
  it('adds delta to player existing score', () => {
    const result = applyScore({ p1: 3 }, 'p1', 1)
    expect(result.p1).toBe(4)
  })

  it('initialises score to delta when player has no entry', () => {
    const result = applyScore({}, 'p1', 1)
    expect(result.p1).toBe(1)
  })

  it('does not modify the original scores object (immutable)', () => {
    const original = { p1: 2 }
    applyScore(original, 'p1', 5)
    expect(original.p1).toBe(2)
  })

  it('does not affect other players scores', () => {
    const result = applyScore({ p1: 3, p2: 5 }, 'p1', 2)
    expect(result.p2).toBe(5)
  })
})
