---
work_package_id: WP04
title: Setup Page
lane: "doing"
dependencies:
- WP02
base_branch: 001-multiplayer-turn-based-quiz-game-WP02
base_commit: 46408e730bf9ffb0663582f383efe6d119610dbd
created_at: '2026-02-25T14:56:24.814845+00:00'
subtasks:
- T018
- T019
- T020
- T021
- T022
phase: Phase 1 - Core Game Loop
assignee: ''
agent: "claude"
shell_pid: "80035"
review_status: ''
reviewed_by: ''
history:
- timestamp: '2026-02-25T00:00:00Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
---

# Work Package Prompt: WP04 – Setup Page

## ⚠️ IMPORTANT: Review Feedback Status

- **Has review feedback?**: Check the `review_status` field above.

---

## Review Feedback

*[Empty — no feedback yet.]*

---

## Objectives & Success Criteria

- Selecting ≥1 bank + ≥2 players + clicking "开始游戏" calls `gameStore.startGame()` and navigates to `/game`
- Selecting 0 banks or banks with 0 total questions → validation error shown; game does not start
- Combined question count updates dynamically as banks are checked/unchecked
- Pool-smaller-than-needed warning shown (non-blocking) when questions < rounds × players
- "管理题库" button navigates to `/banks`
- All inputs are mobile-friendly at 320px–480px

## Context & Constraints

- **Implement command**: `spec-kitty implement WP04 --base WP03`
- **Depends on**: WP02 (bankStore), WP03 (gameStore.startGame)
- **Spec**: FR-001 through FR-005b, FR-021, FR-022
- **Constitution**: Ant Design layout (Flex/Space) first; Tailwind for visual; Less Modules for complex styles; camelCase class names; rem via postcss
- Replace the placeholder `<SetupPage />` in `src/router/index.tsx` with the real import

## Subtasks & Detailed Guidance

### Subtask T018 – Create `src/pages/SetupPage/BankSelector.tsx`

**Purpose**: Multi-select checkbox list for choosing which question banks to include in the game. Shows each bank's name, type badge, and question count. Updates parent with selected bank IDs and combined question total.

**Steps**:
1. Create `src/pages/SetupPage/BankSelector.tsx`:
   ```tsx
   import { Checkbox, Flex, Space, Tag, Typography } from 'antd'
   import { useBankStore } from '../../stores/bankStore'

   interface Props {
     selectedIds: string[]
     onChange: (ids: string[]) => void
   }

   export default function BankSelector({ selectedIds, onChange }: Props) {
     const banks = useBankStore(s => s.getAllBanks())
     const totalQuestions = banks
       .filter(b => selectedIds.includes(b.id))
       .reduce((sum, b) => sum + b.questions.length, 0)

     function toggle(id: string) {
       onChange(
         selectedIds.includes(id)
           ? selectedIds.filter(x => x !== id)
           : [...selectedIds, id]
       )
     }

     return (
       <Flex vertical gap={12}>
         <Typography.Text strong>选择题库</Typography.Text>
         <Flex vertical gap={8}>
           {banks.map(bank => (
             <Checkbox
               key={bank.id}
               checked={selectedIds.includes(bank.id)}
               onChange={() => toggle(bank.id)}
             >
               <Space>
                 <span>{bank.name}</span>
                 {bank.type === 'builtin' && <Tag color="blue">内置</Tag>}
                 <Typography.Text type="secondary">{bank.questions.length} 题</Typography.Text>
               </Space>
             </Checkbox>
           ))}
         </Flex>
         {selectedIds.length > 0 && (
           <Typography.Text type="secondary">共 {totalQuestions} 道题</Typography.Text>
         )}
       </Flex>
     )
   }
   ```
2. Empty-bank warning: banks with 0 questions should show a disabled checkbox with "(空)" label — cannot be the sole selection.

**Files**: `src/pages/SetupPage/BankSelector.tsx` (new file, ~50 lines)

**Parallel?**: Yes — independent of T019 and T020.

---

### Subtask T019 – Create `src/pages/SetupPage/PlayerConfig.tsx`

**Purpose**: Dynamic list of 1–12 player name inputs. Supports adding and removing players. Blank names default to "Player N".

**Steps**:
1. Create `src/pages/SetupPage/PlayerConfig.tsx`:
   ```tsx
   import { Button, Flex, Input, Typography } from 'antd'
   import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

   interface Props {
     players: string[]            // names array
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
   ```

**Files**: `src/pages/SetupPage/PlayerConfig.tsx` (new file, ~55 lines)

**Parallel?**: Yes — independent of T018 and T020.

---

### Subtask T020 – Create `src/pages/SetupPage/GameConfig.tsx`

**Purpose**: Round count and time limit configuration with validated number inputs.

**Steps**:
1. Create `src/pages/SetupPage/GameConfig.tsx`:
   ```tsx
   import { Flex, InputNumber, Typography } from 'antd'

   interface Props {
     roundCount: number
     timeLimitSeconds: number
     onRoundChange: (v: number) => void
     onTimeChange: (v: number) => void
   }

   export default function GameConfig({ roundCount, timeLimitSeconds, onRoundChange, onTimeChange }: Props) {
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
             <Typography.Text type="secondary" className="text-xs">每轮每位玩家答一题</Typography.Text>
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
   ```

**Files**: `src/pages/SetupPage/GameConfig.tsx` (new file, ~40 lines)

**Parallel?**: Yes — independent of T018 and T019.

---

### Subtask T021 – Create `src/pages/SetupPage/SetupPage.tsx`

**Purpose**: Compose BankSelector, PlayerConfig, and GameConfig. Validate game config before calling `startGame()` and navigating to `/game`.

**Steps**:
1. Create `src/pages/SetupPage/SetupPage.tsx`:
   ```tsx
   import { useState } from 'react'
   import { useNavigate } from 'react-router-dom'
   import { Alert, Button, Divider, Flex, Typography } from 'antd'
   import BankSelector from './BankSelector'
   import PlayerConfig from './PlayerConfig'
   import GameConfig from './GameConfig'
   import { useGameStore } from '../../stores/gameStore'
   import { useBankStore } from '../../stores/bankStore'
   import type { Player } from '../../types'

   export default function SetupPage() {
     const navigate = useNavigate()
     const startGame = useGameStore(s => s.startGame)
     const getAllBanks = useBankStore(s => s.getAllBanks)
     const getMergedQuestions = useBankStore(s => s.getMergedQuestions)

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
         <Typography.Title level={2}>答题游戏</Typography.Title>

         <BankSelector selectedIds={selectedBankIds} onChange={setSelectedBankIds} />
         <Divider />
         <PlayerConfig players={playerNames} onChange={setPlayerNames} />
         <Divider />
         <GameConfig
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
   ```
2. Update `src/router/index.tsx`: replace `const SetupPage = () => <div>Setup Page</div>` with `import SetupPage from '../pages/SetupPage/SetupPage'`.

**Files**: `src/pages/SetupPage/SetupPage.tsx` (new), `src/router/index.tsx` (update import)

---

### Subtask T022 – Add "管理题库" Navigation Link

**Purpose**: Give users a visible path from the setup screen to the bank manager without needing to know the `/banks` URL.

**Steps**:
1. In `SetupPage.tsx`, add a link in the header area:
   ```tsx
   import { useNavigate } from 'react-router-dom'
   // In the JSX, add to the title row:
   <Flex justify="space-between" align="center">
     <Typography.Title level={2} style={{ margin: 0 }}>答题游戏</Typography.Title>
     <Button type="link" onClick={() => navigate('/banks')}>管理题库</Button>
   </Flex>
   ```
2. The button should be visible but unobtrusive (Ant Design `type="link"`).

**Files**: `src/pages/SetupPage/SetupPage.tsx` (modify)

---

## Risks & Mitigations

- **12-player scroll on mobile**: PlayerConfig with 12 inputs may overflow the viewport. Use Ant Design `Flex vertical` with natural document scroll — no fixed-height containers that cause inner scroll.
- **Bank selection defaulting to built-in**: Pre-selecting the built-in bank on mount (`useState(['builtin'])`) gives a usable out-of-the-box experience.
- **Empty pool edge case**: If user deselects all banks after loading, `totalQuestions` drops to 0; the validation error catches this.

## Review Guidance

- [ ] Selecting 0 banks → "请至少选择一个题库" error, no navigation
- [ ] Selecting a bank with 0 questions as the only bank → "没有题目" error, no navigation
- [ ] Selecting built-in bank + 2 players + 3 rounds → `startGame()` called, navigate to `/game`
- [ ] Pool insufficient warning appears (non-blocking) when questions < rounds × players
- [ ] "管理题库" button navigates to `/banks`
- [ ] At 375px width: all three sections visible without horizontal scrolling
- [ ] Player name blank → defaults to "玩家 N" in the game session

## Activity Log

- 2026-02-25T00:00:00Z – system – lane=planned – Prompt created.
- 2026-02-25T14:56:24Z – claude – shell_pid=73999 – lane=doing – Assigned agent via workflow command
- 2026-02-25T15:01:28Z – claude – shell_pid=73999 – lane=for_review – T018–T022 done: BankSelector with empty-bank disabled, PlayerConfig 1–12, GameConfigForm round/time, SetupPage with validation + pool warning + 管理题库 nav; gameStore stub for workspace; router updated
- 2026-02-25T23:50:06Z – claude – shell_pid=80035 – lane=doing – Started review via workflow command
