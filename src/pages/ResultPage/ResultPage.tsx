import { useNavigate } from 'react-router-dom'
import { Button, Flex, Typography } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { useGameStore } from '../../stores/gameStore'
import { getCurrentPlayer, getCurrentQuestion, isLastTurn } from '../../services/gameEngine'
import AnswerOption from '../../components/AnswerOption/AnswerOption'

export default function ResultPage() {
  const navigate = useNavigate()
  const session = useGameStore(s => s.session)
  const phase = useGameStore(s => s.phase)
  const continueToNext = useGameStore(s => s.continueToNext)

  // GameGuard in router handles null-session redirect
  if (!session || phase !== 'result') return null

  const player = getCurrentPlayer(session)
  const question = getCurrentQuestion(session)
  const { lastAnswerCorrect, lastAnsweredOptionId, scores } = session
  const isTimeout = lastAnsweredOptionId === null
  const playerScore = scores[player.id] ?? 0

  function handleContinue() {
    // Capture before store update — continueToNext advances currentTurnIndex
    const wasLastTurn = isLastTurn(session!)
    continueToNext()
    navigate(wasLastTurn ? '/leaderboard' : '/game')
  }

  return (
    <Flex vertical gap={20} className="max-w-lg mx-auto px-4 py-6">
      {/* Verdict */}
      <Flex justify="center">
        {isTimeout ? (
          <Flex vertical align="center" gap={4}>
            <MinusCircleOutlined className="text-5xl text-gray-400" />
            <Typography.Text type="secondary">超时未作答</Typography.Text>
          </Flex>
        ) : lastAnswerCorrect ? (
          <Flex vertical align="center" gap={4}>
            <CheckCircleOutlined className="text-5xl text-green-500" />
            <Typography.Text className="text-green-600 font-medium">回答正确！</Typography.Text>
          </Flex>
        ) : (
          <Flex vertical align="center" gap={4}>
            <CloseCircleOutlined className="text-5xl text-red-400" />
            <Typography.Text className="text-red-500 font-medium">回答错误</Typography.Text>
          </Flex>
        )}
      </Flex>

      {/* Answer options with revealed states */}
      {question && (
        <Flex vertical gap={8}>
          {question.options.map((option, i) => {
            const isCorrect = option.id === question.correctOptionId
            const wasSelected = option.id === lastAnsweredOptionId
            let state: 'default' | 'correct' | 'wrong' = 'default'
            if (isCorrect) state = 'correct'
            else if (wasSelected && !isCorrect) state = 'wrong'
            return (
              <AnswerOption
                key={option.id}
                text={option.text}
                index={i}
                state={state}
                disabled
                onClick={() => {}}
              />
            )
          })}
        </Flex>
      )}

      {/* Score */}
      <Flex justify="center">
        <Typography.Text type="secondary">
          {player.name} 当前得分：<strong>{playerScore}</strong> 分
        </Typography.Text>
      </Flex>

      <Button type="primary" size="large" block onClick={handleContinue}>
        继续
      </Button>
    </Flex>
  )
}
