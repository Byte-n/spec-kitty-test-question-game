import type { GameConfig, GameSession, Player, Question, RankedPlayer } from '../types'

/** Build and cap the question pool to available questions (warn if insufficient) */
export function buildQuestionPool(
  mergedQuestions: Question[],
  config: GameConfig,
): { pool: Question[]; capped: boolean } {
  const totalNeeded = config.roundCount * config.players.length
  // mergedQuestions already shuffled by bankService.getMergedQuestions
  const capped = mergedQuestions.length < totalNeeded
  const pool = capped ? mergedQuestions : mergedQuestions.slice(0, totalNeeded)
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
  delta: number,
): Record<string, number> {
  return { ...scores, [playerId]: (scores[playerId] ?? 0) + delta }
}

/**
 * Compute dense-ranked leaderboard from a session.
 * Dense ranking: [10, 8, 8, 5] → ranks [1, 2, 2, 3] (no rank 4)
 */
export function computeLeaderboard(session: GameSession): RankedPlayer[] {
  const { players, scores } = { players: session.config.players, scores: session.scores }
  const sorted = [...players].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))

  let rank = 1
  return sorted.map((player, i) => {
    if (i > 0 && (scores[player.id] ?? 0) < (scores[sorted[i - 1].id] ?? 0)) {
      rank += 1
    }
    return {
      ...player,
      score: scores[player.id] ?? 0,
      rank,
    }
  })
}
