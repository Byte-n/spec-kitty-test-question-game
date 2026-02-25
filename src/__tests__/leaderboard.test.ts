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
  it('ranks 4 players with distinct scores [10, 8, 5, 3] as ranks [1, 2, 3, 4]', () => {
    const players = [
      makePlayer('a', 0),
      makePlayer('b', 1),
      makePlayer('c', 2),
      makePlayer('d', 3),
    ]
    const session = makeSession(players, { a: 10, b: 8, c: 5, d: 3 })
    const ranked = computeLeaderboard(session)
    expect(ranked.map(p => p.rank)).toEqual([1, 2, 3, 4])
    expect(ranked.map(p => p.score)).toEqual([10, 8, 5, 3])
  })

  it('assigns same rank to tied players: scores [10, 8, 8, 5] → ranks [1, 2, 2, 3]', () => {
    const players = [
      makePlayer('a', 0),
      makePlayer('b', 1),
      makePlayer('c', 2),
      makePlayer('d', 3),
    ]
    const session = makeSession(players, { a: 10, b: 8, c: 8, d: 5 })
    const ranked = computeLeaderboard(session)
    expect(ranked.map(p => p.rank)).toEqual([1, 2, 2, 3])
  })

  it('three-way tie in the middle: [10, 5, 5, 5, 2] → ranks [1, 2, 2, 2, 3]', () => {
    const players = Array.from({ length: 5 }, (_, i) => makePlayer(`p${i}`, i))
    const session = makeSession(players, { p0: 10, p1: 5, p2: 5, p3: 5, p4: 2 })
    const ranked = computeLeaderboard(session)
    expect(ranked.map(p => p.rank)).toEqual([1, 2, 2, 2, 3])
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

  it('single player: rank 1 with correct score', () => {
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
    expect(ranked.map(p => p.score)).toEqual([9, 6, 3])
  })

  it('player with no score entry defaults to 0', () => {
    const players = [makePlayer('a', 0), makePlayer('b', 1)]
    const session = makeSession(players, { a: 5 }) // b has no entry
    const ranked = computeLeaderboard(session)
    const bEntry = ranked.find(p => p.id === 'b')!
    expect(bEntry.score).toBe(0)
    expect(bEntry.rank).toBe(2)
  })

  it('large score differences are ranked correctly', () => {
    const players = Array.from({ length: 4 }, (_, i) => makePlayer(`p${i}`, i))
    const session = makeSession(players, { p0: 100, p1: 1, p2: 50, p3: 25 })
    const ranked = computeLeaderboard(session)
    expect(ranked[0].score).toBe(100)
    expect(ranked[0].rank).toBe(1)
    expect(ranked[3].score).toBe(1)
    expect(ranked[3].rank).toBe(4)
  })
})
