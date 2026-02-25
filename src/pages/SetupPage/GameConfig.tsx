import { Flex, InputNumber, Typography } from 'antd'

interface Props {
  roundCount: number
  timeLimitSeconds: number
  onRoundChange: (v: number) => void
  onTimeChange: (v: number) => void
}

export default function GameConfigForm({
  roundCount,
  timeLimitSeconds,
  onRoundChange,
  onTimeChange,
}: Props) {
  return (
    <Flex vertical gap={12}>
      <Typography.Text strong>游戏设置</Typography.Text>
      <Flex gap={24} wrap="wrap">
        <Flex vertical gap={4}>
          <Typography.Text>轮数</Typography.Text>
          <InputNumber
            min={1}
            max={50}
            value={roundCount}
            onChange={v => v && onRoundChange(v)}
          />
          <Typography.Text type="secondary" className="text-xs">
            每轮每位玩家答一题
          </Typography.Text>
        </Flex>
        <Flex vertical gap={4}>
          <Typography.Text>每题时限（秒）</Typography.Text>
          <InputNumber
            min={5}
            max={300}
            value={timeLimitSeconds}
            onChange={v => v && onTimeChange(v)}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}
