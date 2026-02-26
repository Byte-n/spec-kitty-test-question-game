import { Flex, Typography } from 'antd'
import type { RankedPlayer } from '../../types'

interface Props {
  players: RankedPlayer[]
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function Leaderboard({ players }: Props) {
  return (
    <Flex vertical gap={12}>
      {players.map((player, i) => (
        <Flex
          key={player.id}
          align="center"
          gap={16}
          className="rounded-xl bg-white border border-gray-100 shadow-sm px-4 py-3"
          style={{
            opacity: 0,
            animation: 'fadeInUp 0.3s ease forwards',
            animationDelay: `${i * 80}ms`,
          }}
        >
          <span className="text-2xl w-8 text-center">
            {MEDALS[player.rank] ?? player.rank}
          </span>
          <Flex vertical gap={0} style={{ flex: 1 }}>
            <Typography.Text strong>{player.name}</Typography.Text>
            {player.rank <= 3 && (
              <Typography.Text type="secondary" className="text-xs">
                第 {player.rank} 名
              </Typography.Text>
            )}
          </Flex>
          <Flex vertical align="flex-end">
            <Typography.Text strong className="text-lg">
              {player.score}
            </Typography.Text>
            <Typography.Text type="secondary" className="text-xs">
              分
            </Typography.Text>
          </Flex>
        </Flex>
      ))}
    </Flex>
  )
}
