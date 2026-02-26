import { Button, Flex, Input, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

interface Props {
  players: string[]
  onChange: (players: string[]) => void
}

export default function PlayerConfig({ players, onChange }: Props) {
  function addPlayer() {
    if (players.length >= 12) return
    onChange([...players, ''])
  }

  function removePlayer(index: number) {
    if (players.length <= 1) return
    onChange(players.filter((_, i) => i !== index))
  }

  function updateName(index: number, value: string) {
    const updated = [...players]
    updated[index] = value
    onChange(updated)
  }

  return (
    <Flex vertical gap={12}>
      <Typography.Text strong>玩家设置（{players.length}/12）</Typography.Text>
      <Flex vertical gap={8}>
        {players.map((name, i) => (
          <Flex key={i} gap={8} align="center">
            <Input
              placeholder={`玩家 ${i + 1}`}
              value={name}
              onChange={e => updateName(i, e.target.value)}
              maxLength={20}
              style={{ flex: 1 }}
            />
            {players.length > 1 && (
              <Button
                icon={<DeleteOutlined />}
                onClick={() => removePlayer(i)}
                type="text"
                danger
                className="w-11 h-11 flex items-center justify-center"
              />
            )}
          </Flex>
        ))}
      </Flex>
      {players.length < 12 && (
        <Button icon={<PlusOutlined />} onClick={addPlayer} type="dashed">
          添加玩家
        </Button>
      )}
    </Flex>
  )
}
