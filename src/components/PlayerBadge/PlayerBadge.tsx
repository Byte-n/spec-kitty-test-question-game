import { Flex, Tag, Typography } from 'antd'

interface Props {
  playerName: string
  currentRound: number
  totalRounds: number
  turnInRound: number
  totalPlayersInRound: number
}

export default function PlayerBadge({
  playerName,
  currentRound,
  totalRounds,
  turnInRound,
  totalPlayersInRound,
}: Props) {
  return (
    <Flex justify="space-between" align="center" wrap="wrap" gap={4} className="w-full">
      <Flex align="center" gap={8}>
        <Tag color="blue" className="text-base px-3 py-1">
          {playerName}
        </Tag>
        <Typography.Text type="secondary">的回合</Typography.Text>
      </Flex>
      <Typography.Text type="secondary">
        第 {currentRound}/{totalRounds} 轮 · {turnInRound}/{totalPlayersInRound}
      </Typography.Text>
    </Flex>
  )
}
