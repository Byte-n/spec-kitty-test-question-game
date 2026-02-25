---
work_package_id: WP05
title: Game Page & Result Page
lane: "done"
dependencies: [WP03]
base_branch: 001-multiplayer-turn-based-quiz-game-WP03
base_commit: e75a04fa26960e77174940543d6f2f6939a38df4
created_at: '2026-02-25T15:02:13.452963+00:00'
subtasks:
- T023
- T024
- T025
- T026
- T027
phase: Phase 1 - Core Game Loop
assignee: ''
agent: "claude"
shell_pid: "80148"
review_status: "approved"
reviewed_by: "xzl"
history:
- timestamp: '2026-02-25T00:00:00Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
---

# Work Package Prompt: WP05 – Game Page & Result Page

## ⚠️ IMPORTANT: Review Feedback Status

- **Has review feedback?**: Check the `review_status` field above.

---

## Review Feedback

*[Empty — no feedback yet.]*

---

## Objectives & Success Criteria

- `/game` shows: current player name at top, round indicator, the current question text, 4 answer option buttons, and a countdown timer
- Selecting an answer before timer expires → navigates to `/result` with the correct/incorrect result revealed
- Timer reaching 0 → navigates to `/result` with "超时" state (no option highlighted as selected, correct option highlighted)
- `/result` shows result + updated score + "继续" button
- "继续" on non-final turn → navigates back to `/game` (next player's question)
- "继续" on final turn → navigates to `/leaderboard`
- Navigating directly to `/game` without an active session → redirects to `/`

## Context & Constraints

- **Implement command**: `spec-kitty implement WP05 --base WP03`
- **Can run in parallel with WP04 and WP06** after WP03 completes
- **Clarification (from spec)**: Post-answer flow = show result → "继续" button (manual advance, no auto-advance)
- **Clarification**: No interstitial "pass the device" screen between players; player name shown on question screen
- **Spec**: FR-006 through FR-011, FR-021, FR-022
- **Constitution**: Ant Design layout first; Tailwind for visual; min 44×44px touch targets on all buttons

## Subtasks & Detailed Guidance

### Subtask T023 – Create `src/components/CountdownTimer/CountdownTimer.tsx`

**Purpose**: Countdown timer component with a `useCountdown` hook. When the timer reaches 0, it calls `onExpire` (which triggers `submitAnswer(null)`). Displays remaining seconds visually.

**Steps**:
1. Create `src/components/CountdownTimer/CountdownTimer.tsx`:
   ```tsx
   import { useEffect, useRef, useState } from 'react'
   import { Progress } from 'antd'

   interface Props {
     totalSeconds: number
     onExpire: () => void
     active: boolean    // false when answer has been submitted (freeze timer)
   }

   function useCountdown(totalSeconds: number, onExpire: () => void, active: boolean) {
     const [remaining, setRemaining] = useState(totalSeconds)
     const onExpireRef = useRef(onExpire)
     onExpireRef.current = onExpire

     useEffect(() => {
       setRemaining(totalSeconds)
     }, [totalSeconds])

     useEffect(() => {
       if (!active) return
       const interval = setInterval(() => {
         setRemaining(prev => {
           if (prev <= 1) {
             clearInterval(interval)
             onExpireRef.current()
             return 0
           }
           return prev - 1
         })
       }, 1000)
       return () => clearInterval(interval)
     }, [active, totalSeconds])

     return remaining
   }

   export default function CountdownTimer({ totalSeconds, onExpire, active }: Props) {
     const remaining = useCountdown(totalSeconds, onExpire, active)
     const percent = Math.round((remaining / totalSeconds) * 100)
     const color = remaining > 10 ? '#52c41a' : remaining > 5 ? '#faad14' : '#ff4d4f'

     return (
       <div className="flex flex-col items-center gap-1">
         <Progress
           type="circle"
           percent={percent}
           size={64}
           strokeColor={color}
           format={() => <span className="text-lg font-bold">{remaining}</span>}
         />
       </div>
     )
   }
   ```
2. `useRef` for `onExpire` ensures the latest callback is always called without re-creating the interval.
3. `active` prop set to `false` after `submitAnswer()` is called to freeze the timer display.

**Files**: `src/components/CountdownTimer/CountdownTimer.tsx` (new file, ~55 lines)

---

### Subtask T024 – Create `src/components/AnswerOption/AnswerOption.tsx`

**Purpose**: A single answer option button with four visual states: default, selected (pending reveal), correct, wrong. At least 44×44px touch target.

**Steps**:
1. Create `src/components/AnswerOption/AnswerOption.tsx`:
   ```tsx
   interface Props {
     text: string
     index: number           // A/B/C/D label
     state: 'default' | 'selected' | 'correct' | 'wrong'
     disabled: boolean
     onClick: () => void
   }

   const LABELS = ['A', 'B', 'C', 'D']

   const STATE_CLASSES: Record<Props['state'], string> = {
     default: 'bg-white border-gray-200 text-gray-800 hover:border-blue-400 hover:bg-blue-50',
     selected: 'bg-blue-50 border-blue-400 text-blue-800',
     correct: 'bg-green-50 border-green-500 text-green-800',
     wrong: 'bg-red-50 border-red-400 text-red-700 line-through',
   }

   export default function AnswerOption({ text, index, state, disabled, onClick }: Props) {
     return (
       <button
         onClick={onClick}
         disabled={disabled}
         className={`
           w-full text-left rounded-xl border-2 px-4 py-3 transition-all
           min-h-[44px] cursor-pointer
           ${STATE_CLASSES[state]}
           ${disabled && state === 'default' ? 'opacity-50 cursor-not-allowed' : ''}
         `}
       >
         <span className="font-bold mr-3">{LABELS[index]}</span>
         {text}
       </button>
     )
   }
   ```
2. The `min-h-[44px]` ensures the 44px minimum touch target (SC-005, FR-022).
3. `disabled` is true after the answer is submitted (no re-selection).

**Files**: `src/components/AnswerOption/AnswerOption.tsx` (new file, ~35 lines)

**Parallel?**: Yes — independent of T025.

---

### Subtask T025 – Create `src/components/PlayerBadge/PlayerBadge.tsx`

**Purpose**: Displays the current player's name and the current round indicator at the top of the game screen.

**Steps**:
1. Create `src/components/PlayerBadge/PlayerBadge.tsx`:
   ```tsx
   import { Flex, Tag, Typography } from 'antd'

   interface Props {
     playerName: string
     currentRound: number
     totalRounds: number
     turnInRound: number         // Which player's turn (1-indexed) in this round
     totalPlayersInRound: number
   }

   export default function PlayerBadge({ playerName, currentRound, totalRounds, turnInRound, totalPlayersInRound }: Props) {
     return (
       <Flex justify="space-between" align="center" className="w-full">
         <Flex align="center" gap={8}>
           <Tag color="blue" className="text-base px-3 py-1">{playerName}</Tag>
           <Typography.Text type="secondary">的回合</Typography.Text>
         </Flex>
         <Typography.Text type="secondary">
           第 {currentRound}/{totalRounds} 轮 · {turnInRound}/{totalPlayersInRound}
         </Typography.Text>
       </Flex>
     )
   }
   ```

**Files**: `src/components/PlayerBadge/PlayerBadge.tsx` (new file, ~25 lines)

**Parallel?**: Yes — independent of T024.

---

### Subtask T026 – Create `src/pages/GamePage/GamePage.tsx`

**Purpose**: The main question screen — assembles PlayerBadge, CountdownTimer, question text, and AnswerOption list. Handles answer submission and timer expiry.

**Steps**:
1. Create `src/pages/GamePage/GamePage.tsx`:
   ```tsx
   import { useState } from 'react'
   import { useNavigate } from 'react-router-dom'
   import { Flex, Typography } from 'antd'
   import { useGameStore } from '../../stores/gameStore'
   import { getCurrentPlayer, getCurrentQuestion, getCurrentRound, getTotalTurns } from '../../services/gameEngine'
   import CountdownTimer from '../../components/CountdownTimer/CountdownTimer'
   import AnswerOption from '../../components/AnswerOption/AnswerOption'
   import PlayerBadge from '../../components/PlayerBadge/PlayerBadge'

   export default function GamePage() {
     const navigate = useNavigate()
     const { session, phase, submitAnswer } = useGameStore()
     const [submitted, setSubmitted] = useState(false)

     // GameGuard in router handles null session redirect
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
   ```
2. Update `src/router/index.tsx`: replace placeholder `GamePage` with real import.
3. `submitted` local state prevents double-submission (tap + timer race condition at the UI level, complementing the store-level guard).

**Files**: `src/pages/GamePage/GamePage.tsx` (new), `src/router/index.tsx` (update import)

---

### Subtask T027 – Create `src/pages/ResultPage/ResultPage.tsx`

**Purpose**: Post-answer result screen. Shows correct/incorrect verdict, which option was correct, score update, and the "继续" button.

**Steps**:
1. Create `src/pages/ResultPage/ResultPage.tsx`:
   ```tsx
   import { useNavigate } from 'react-router-dom'
   import { Button, Flex, Result, Typography } from 'antd'
   import { CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'
   import { useGameStore } from '../../stores/gameStore'
   import { getCurrentPlayer, getCurrentQuestion, isLastTurn } from '../../services/gameEngine'
   import AnswerOption from '../../components/AnswerOption/AnswerOption'

   export default function ResultPage() {
     const navigate = useNavigate()
     const { session, phase, continueToNext } = useGameStore()

     if (!session || phase !== 'result') return null

     const player = getCurrentPlayer(session)
     const question = getCurrentQuestion(session)
     const { lastAnswerCorrect, lastAnsweredOptionId, scores } = session
     const isTimeout = lastAnsweredOptionId === null
     const playerScore = scores[player.id] ?? 0

     function handleContinue() {
       continueToNext()
       if (isLastTurn(session!)) {
         navigate('/leaderboard')
       } else {
         navigate('/game')
       }
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
   ```
2. Update `src/router/index.tsx`: replace placeholder `ResultPage` with real import.
3. **Important**: `handleContinue` calls `continueToNext()` first (which updates the session's `currentTurnIndex`), then uses the *previous* `session` reference to check `isLastTurn` — use the pre-`continueToNext` state for navigation decision:
   ```tsx
   function handleContinue() {
     const wasLastTurn = isLastTurn(session!)  // check BEFORE store update
     continueToNext()
     navigate(wasLastTurn ? '/leaderboard' : '/game')
   }
   ```

**Files**: `src/pages/ResultPage/ResultPage.tsx` (new), `src/router/index.tsx` (update import)

---

## Risks & Mitigations

- **Timer + tap race**: Both `GamePage` local `submitted` state and `gameStore.submitAnswer` phase guard prevent double submission.
- **React StrictMode double-mount**: The `useCountdown` hook uses `useRef` for the `onExpire` callback, and resets `remaining` when `totalSeconds` changes, preventing duplicate intervals.
- **`isLastTurn` called after `continueToNext`**: Resolved by capturing `wasLastTurn` before calling `continueToNext()` (see T027 notes).
- **Phase mismatch on direct URL access**: Both `/game` and `/result` have `GameGuard` wrappers → redirect to `/` if session is null.

## Review Guidance

- [ ] GamePage shows: player name badge, round indicator, countdown timer, question text, 4 option buttons
- [ ] Clicking an option before timer → navigates to `/result`; correct option shown in green, wrong in red
- [ ] Timer reaching 0 → navigates to `/result`; all options shown neutral except correct (green); "超时未作答" message shown
- [ ] ResultPage "继续" on non-final turn → back to `/game` with next player shown
- [ ] ResultPage "继续" on final turn → navigates to `/leaderboard`
- [ ] Direct URL access to `/game` without session → redirects to `/`
- [ ] All buttons ≥44px tall (inspect in browser devtools)

## Activity Log

- 2026-02-25T00:00:00Z – system – lane=planned – Prompt created.
- 2026-02-25T15:02:13Z – claude – shell_pid=74288 – lane=doing – Assigned agent via workflow command
- 2026-02-25T15:05:59Z – claude – shell_pid=74288 – lane=for_review – T023–T027 done: CountdownTimer (useRef stable callback, color stages), AnswerOption (4 states, 44px touch), PlayerBadge (name+round), GamePage (double-submit guard), ResultPage (wasLastTurn before continueToNext, verdict + revealed options)
- 2026-02-25T23:52:17Z – claude – shell_pid=80148 – lane=doing – Started review via workflow command
- 2026-02-25T23:53:33Z – claude – shell_pid=80148 – lane=done – Review passed: CountdownTimer (useRef stable callback, color stages, cleanup), AnswerOption (4 states, min-h-[44px] touch target), PlayerBadge (name + round indicator), GamePage (double-submit guard on answer+expire, phase check, active timer freeze), ResultPage (wasLastTurn captured before continueToNext — critical ordering correct, verdict/reveal/score). All T023–T027 criteria met.
