import type { ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useGameStore } from '../stores/gameStore'
import SetupPage from '../pages/SetupPage/SetupPage'
import GamePage from '../pages/GamePage/GamePage'
import ResultPage from '../pages/ResultPage/ResultPage'
import LeaderboardPage from '../pages/LeaderboardPage/LeaderboardPage'
import BankManagerPage from '../pages/BankManagerPage/BankManagerPage'

/** Redirects to / if no active game session */
function GameGuard({ children }: { children: ReactNode }) {
  const session = useGameStore(s => s.session)
  if (!session) return <Navigate to="/" replace />
  return <>{children}</>
}

/** Redirects to / if game is not in finished phase */
function FinishedGuard({ children }: { children: ReactNode }) {
  const phase = useGameStore(s => s.phase)
  if (phase !== 'finished') return <Navigate to="/" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SetupPage />,
  },
  {
    path: '/game',
    element: (
      <GameGuard>
        <GamePage />
      </GameGuard>
    ),
  },
  {
    path: '/result',
    element: (
      <GameGuard>
        <ResultPage />
      </GameGuard>
    ),
  },
  {
    path: '/leaderboard',
    element: (
      <FinishedGuard>
        <LeaderboardPage />
      </FinishedGuard>
    ),
  },
  {
    path: '/banks',
    element: <BankManagerPage />,
  },
])
