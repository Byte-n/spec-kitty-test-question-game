import { useNavigate } from 'react-router-dom'
import { Button, Flex, Typography } from 'antd'
import { TrophyOutlined } from '@ant-design/icons'
import { useGameStore } from '../../stores/gameStore'
import Leaderboard from '../../components/Leaderboard/Leaderboard'

export default function LeaderboardPage() {
  const navigate = useNavigate()
  const phase = useGameStore(s => s.phase)
  const getLeaderboard = useGameStore(s => s.getLeaderboard)
  const resetGame = useGameStore(s => s.resetGame)

  // FinishedGuard in router handles non-finished state redirect
  if (phase !== 'finished') return null

  const rankedPlayers = getLeaderboard()

  function handlePlayAgain() {
    resetGame()
    navigate('/')
  }

  return (
    <Flex vertical gap={24} className="max-w-lg mx-auto px-4 py-8">
      <Flex vertical align="center" gap={8}>
        <TrophyOutlined className="text-5xl text-yellow-500" />
        <Typography.Title level={2} style={{ margin: 0 }}>
          最终排行榜
        </Typography.Title>
      </Flex>

      <Leaderboard players={rankedPlayers} />

      <Button type="primary" size="large" block onClick={handlePlayAgain}>
        再玩一局
      </Button>
    </Flex>
  )
}
