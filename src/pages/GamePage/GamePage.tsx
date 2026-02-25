import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flex, Typography } from 'antd'
import { useGameStore } from '../../stores/gameStore'
import {
  getCurrentPlayer,
  getCurrentQuestion,
  getCurrentRound,
} from '../../services/gameEngine'
import CountdownTimer from '../../components/CountdownTimer/CountdownTimer'
import AnswerOption from '../../components/AnswerOption/AnswerOption'
import PlayerBadge from '../../components/PlayerBadge/PlayerBadge'

export default function GamePage() {
  const navigate = useNavigate()
  const session = useGameStore(s => s.session)
  const phase = useGameStore(s => s.phase)
  const submitAnswer = useGameStore(s => s.submitAnswer)
  const [submitted, setSubmitted] = useState(false)

  // GameGuard in router handles null-session redirect
  if (!session || phase !== 'question') return null

  const player = getCurrentPlayer(session)
  const question = getCurrentQuestion(session)
  const currentRound = getCurrentRound(session)
  const totalRounds = session.config.roundCount
  const playerIndex = session.currentTurnIndex % session.config.players.length

  if (!question) return null

  function handleAnswer(optionId: string) {
    if (submitted) return
    setSubmitted(true)
    submitAnswer(optionId)
    navigate('/result')
  }

  function handleExpire() {
    if (submitted) return
    setSubmitted(true)
    submitAnswer(null)
    navigate('/result')
  }

  return (
    <Flex vertical gap={16} className="max-w-lg mx-auto px-4 py-6 min-h-screen">
      <PlayerBadge
        playerName={player.name}
        currentRound={currentRound}
        totalRounds={totalRounds}
        turnInRound={playerIndex + 1}
        totalPlayersInRound={session.config.players.length}
      />

      <Flex justify="center">
        <CountdownTimer
          totalSeconds={session.config.timeLimitSeconds}
          onExpire={handleExpire}
          active={!submitted}
        />
      </Flex>

      <Typography.Text className="text-lg font-medium leading-snug">
        {question.text}
      </Typography.Text>

      <Flex vertical gap={10}>
        {question.options.map((option, i) => (
          <AnswerOption
            key={option.id}
            text={option.text}
            index={i}
            state="default"
            disabled={submitted}
            onClick={() => handleAnswer(option.id)}
          />
        ))}
      </Flex>
    </Flex>
  )
}
