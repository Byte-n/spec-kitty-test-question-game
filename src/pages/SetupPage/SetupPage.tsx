import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Divider, Flex, Typography } from 'antd'
import BankSelector from './BankSelector'
import PlayerConfig from './PlayerConfig'
import GameConfigForm from './GameConfig'
import { useGameStore } from '../../stores/gameStore'
import { useBankStore } from '../../stores/bankStore'
import type { Player } from '../../types'

export default function SetupPage() {
  const navigate = useNavigate()
  const startGame = useGameStore(s => s.startGame)
  const getAllBanks = useBankStore(s => s.getAllBanks)

  const [selectedBankIds, setSelectedBankIds] = useState<string[]>(['builtin'])
  const [playerNames, setPlayerNames] = useState<string[]>(['', ''])
  const [roundCount, setRoundCount] = useState(3)
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(30)
  const [error, setError] = useState<string | null>(null)

  const allBanks = getAllBanks()
  const totalQuestions = selectedBankIds.reduce((sum, id) => {
    const bank = allBanks.find(b => b.id === id)
    return sum + (bank?.questions.length ?? 0)
  }, 0)
  const totalTurns = roundCount * playerNames.length
  const poolInsufficient = totalQuestions > 0 && totalQuestions < totalTurns

  function handleStart() {
    if (selectedBankIds.length === 0) {
      setError('请至少选择一个题库')
      return
    }
    if (totalQuestions === 0) {
      setError('所选题库中没有题目，请先添加题目')
      return
    }
    setError(null)

    const players: Player[] = playerNames.map((name, i) => ({
      id: crypto.randomUUID(),
      name: name.trim() || `玩家 ${i + 1}`,
      turnOrder: i,
    }))

    startGame({ selectedBankIds, players, roundCount, timeLimitSeconds })
    navigate('/game')
  }

  return (
    <Flex vertical gap={24} className="max-w-lg mx-auto px-4 py-8">
      <Flex justify="space-between" align="center">
        <Typography.Title level={2} style={{ margin: 0 }}>
          答题游戏
        </Typography.Title>
        <Button type="link" onClick={() => navigate('/banks')}>
          管理题库
        </Button>
      </Flex>

      <BankSelector selectedIds={selectedBankIds} onChange={setSelectedBankIds} />
      <Divider />
      <PlayerConfig players={playerNames} onChange={setPlayerNames} />
      <Divider />
      <GameConfigForm
        roundCount={roundCount}
        timeLimitSeconds={timeLimitSeconds}
        onRoundChange={setRoundCount}
        onTimeChange={setTimeLimitSeconds}
      />

      {poolInsufficient && (
        <Alert
          type="warning"
          message={`题目数量（${totalQuestions}）少于所需轮次（${totalTurns}），游戏将在题目用完后提前结束`}
          showIcon
        />
      )}
      {error && <Alert type="error" message={error} showIcon />}

      <Button type="primary" size="large" block onClick={handleStart}>
        开始游戏
      </Button>
    </Flex>
  )
}
