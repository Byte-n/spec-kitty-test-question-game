---
work_package_id: WP06
title: Leaderboard Page
lane: "doing"
dependencies: [WP03]
base_branch: 001-multiplayer-turn-based-quiz-game-WP03
base_commit: e75a04fa26960e77174940543d6f2f6939a38df4
created_at: '2026-02-25T15:06:42.097139+00:00'
subtasks:
- T028
- T029
- T030
- T031
phase: Phase 1 - Core Game Loop
assignee: ''
agent: "claude"
shell_pid: "80267"
review_status: ''
reviewed_by: ''
history:
- timestamp: '2026-02-25T00:00:00Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
---

# Work Package Prompt: WP06 – Leaderboard Page

## ⚠️ IMPORTANT: Review Feedback Status

- **Has review feedback?**: Check the `review_status` field above.

---

## Review Feedback

*[Empty — no feedback yet.]*

---

## Objectives & Success Criteria

- `/leaderboard` shows all players ranked by score (highest first) with dense ranking
- Tied players share the same rank number (e.g., two players at rank 2; no rank 3 entry follows)
- Rank 1/2/3 display medal emoji (🥇/🥈/🥉); ranks 4+ show the number
- "再玩一局" resets the game session and navigates to `/`
- Rank entries animate in sequentially (staggered entrance from top)
- Direct URL access to `/leaderboard` without a finished session redirects to `/`

## Context & Constraints

- **Implement command**: `spec-kitty implement WP06 --base WP03`
- **Can run in parallel with WP04 and WP05** after WP03 completes
- **Spec**: FR-018 through FR-020; clarification — dense ranking (tied players share same rank)
- **Constitution**: Ant Design layout first; Tailwind for visual; Less Modules only for animations

## Subtasks & Detailed Guidance

### Subtask T028 – Create `src/components/Leaderboard/Leaderboard.tsx`

**Purpose**: Reusable leaderboard display component that renders a dense-ranked list with medal icons and staggered entrance animations.

**Steps**:
1. Create `src/components/Leaderboard/Leaderboard.tsx`:
   ```tsx
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
               animation: `fadeInUp 0.3s ease forwards`,
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
               <Typography.Text strong className="text-lg">{player.score}</Typography.Text>
               <Typography.Text type="secondary" className="text-xs">分</Typography.Text>
             </Flex>
           </Flex>
         ))}
       </Flex>
     )
   }
   ```
2. The `fadeInUp` animation is defined via a Less Module (see T030).

**Files**: `src/components/Leaderboard/Leaderboard.tsx` (new file, ~50 lines)

---

### Subtask T029 – Create `src/pages/LeaderboardPage/LeaderboardPage.tsx`

**Purpose**: Final game screen that displays the full leaderboard and provides the "再玩一局" action.

**Steps**:
1. Create `src/pages/LeaderboardPage/LeaderboardPage.tsx`:
   ```tsx
   import { useNavigate } from 'react-router-dom'
   import { Button, Flex, Typography } from 'antd'
   import { TrophyOutlined } from '@ant-design/icons'
   import { useGameStore } from '../../stores/gameStore'
   import Leaderboard from '../../components/Leaderboard/Leaderboard'

   export default function LeaderboardPage() {
     const navigate = useNavigate()
     const { phase, getLeaderboard, resetGame } = useGameStore()

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
           <Typography.Title level={2} style={{ margin: 0 }}>最终排行榜</Typography.Title>
         </Flex>

         <Leaderboard players={rankedPlayers} />

         <Button type="primary" size="large" block onClick={handlePlayAgain}>
           再玩一局
         </Button>
       </Flex>
     )
   }
   ```
2. Update `src/router/index.tsx`: replace placeholder `LeaderboardPage` with real import. Also ensure the `FinishedGuard` component is defined (redirects to `/` if `phase !== 'finished'`).

**Files**: `src/pages/LeaderboardPage/LeaderboardPage.tsx` (new), `src/router/index.tsx` (update import)

---

### Subtask T030 – Add Rank Reveal Animation

**Purpose**: Staggered entrance animation for leaderboard entries (each card fades in from below with a delay) using a Less Module keyframe.

**Steps**:
1. Create `src/components/Leaderboard/Leaderboard.module.less`:
   ```less
   @keyframes fadeInUp {
     from {
       opacity: 0;
       transform: translateY(16px);
     }
     to {
       opacity: 1;
       transform: translateY(0);
     }
   }
   ```
2. The keyframe name `fadeInUp` is referenced in the inline `animation` style in `Leaderboard.tsx` (T028). Since keyframes must be defined globally (or in a `:global` scope) to be referenced by inline styles, add a global keyframe injection:
   ```tsx
   // Alternative approach: inject via a <style> tag in LeaderboardPage
   // Or use a global CSS file — add to src/styles/global.css:
   ```
   Add to `src/styles/global.css`:
   ```css
   @keyframes fadeInUp {
     from { opacity: 0; transform: translateY(16px); }
     to { opacity: 1; transform: translateY(0); }
   }
   ```
3. This is simpler than a Less Module keyframe since it's needed globally. Use the global CSS approach.

**Files**: `src/styles/global.css` (add keyframe), optionally `src/components/Leaderboard/Leaderboard.module.less` (can be skipped if using global CSS)

**Notes**: Inline `style` for `animationDelay` is allowed by the constitution (dynamic values computed from `i * 80ms`). The `opacity: 0` initial state is set inline to ensure the card starts invisible before animation fires.

---

### Subtask T031 – Implement "再玩一局" Flow

**Purpose**: Clean reset that returns the user to setup without stale session data.

**Steps**:
1. The flow is already implemented in `handlePlayAgain` in T029:
   - `resetGame()` → `session = null`, `phase = 'idle'`
   - `navigate('/')` → SetupPage renders fresh
2. Verify that after reset:
   - `useGameStore.getState().session === null`
   - `useGameStore.getState().phase === 'idle'`
   - SetupPage shows default selections (built-in bank pre-selected, 2 players, 3 rounds, 30s)
3. The SetupPage component initialises its local state from `useState` defaults, so it will always show fresh defaults after navigation.

**Files**: No additional files — logic is in `LeaderboardPage.tsx` (T029)

---

## Risks & Mitigations

- **FinishedGuard direct URL access**: If user navigates to `/leaderboard` with `phase !== 'finished'`, the `FinishedGuard` in the router redirects to `/` — ensure this guard is implemented in `src/router/index.tsx`.
- **Animation + accessibility**: The staggered animation uses CSS `animation` (not JavaScript), so it's lightweight and won't affect interaction. Total animation duration is `players.length × 80ms + 300ms` ≈ 1.3s for 12 players — acceptable.
- **Dense ranking with all tied**: If all players score 0 (no correct answers), all show rank 1 with 🥇. This is correct behaviour.

## Review Guidance

- [ ] `/leaderboard` shows all players sorted by score descending
- [ ] Two players with same score → both show same rank number and medal
- [ ] `getLeaderboard()` with scores [5, 3, 3, 1] → ranks [1, 2, 2, 3]
- [ ] Cards animate in sequentially (each ≈80ms after previous)
- [ ] "再玩一局" → `session === null`, navigates to `/`, SetupPage renders cleanly
- [ ] Direct URL `/leaderboard` with no finished session → redirects to `/`

## Activity Log

- 2026-02-25T00:00:00Z – system – lane=planned – Prompt created.
- 2026-02-25T15:06:42Z – claude – shell_pid=74552 – lane=doing – Assigned agent via workflow command
- 2026-02-25T15:09:29Z – claude – shell_pid=74552 – lane=for_review – T028–T031 done: Leaderboard component with medals+staggered animation, LeaderboardPage with trophy + 再玩一局 reset flow, fadeInUp keyframe in global.css, router updated
- 2026-02-25T23:53:40Z – claude – shell_pid=80267 – lane=doing – Started review via workflow command
