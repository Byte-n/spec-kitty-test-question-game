---
work_package_id: WP08
title: Responsive Design & Polish
lane: "doing"
dependencies: [WP04, WP05, WP06, WP07]
base_branch: 001-multiplayer-turn-based-quiz-game-WP07
base_commit: cf9cc4ef3ab1ffffa8bf6420fb48509c97b14e51
created_at: '2026-02-26T00:18:49.844216+00:00'
subtasks:
- T038
- T039
- T040
- T041
- T042
- T043
phase: Phase 3 - Polish
assignee: ''
agent: ''
shell_pid: "80938"
review_status: ''
reviewed_by: ''
history:
- timestamp: '2026-02-25T00:00:00Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
---

# Work Package Prompt: WP08 – Responsive Design & Polish

## ⚠️ IMPORTANT: Review Feedback Status

- **Has review feedback?**: Check the `review_status` field above.

---

## Review Feedback

*[Empty — no feedback yet.]*

---

## Objectives & Success Criteria

- All 5 screens (Setup, Game, Result, Leaderboard, BankManager) render correctly at 320px, 375px, 768px, and 1280px width without horizontal scrolling
- All interactive elements (buttons, answer options, inputs) have ≥44×44px touch targets
- All 6 success criteria (SC-001 to SC-006) are verified and pass
- Error states (import failure, localStorage quota) are handled with user-visible feedback
- Empty states (no banks, empty bank, single-player) display helpful UI

## Context & Constraints

- **Implement command**: `spec-kitty implement WP08 --base WP07`
- **Depends on**: All story WPs (WP04–WP07)
- **Spec**: FR-021, FR-022, SC-001 through SC-006
- **Constitution**: Tailwind responsive prefixes (`sm:`, `md:`, `lg:`); Ant Design layout first; min-h of 44px on interactive elements
- Tailwind breakpoints: `sm` = 640px, `md` = 768px, `lg` = 1024px

## Subtasks & Detailed Guidance

### Subtask T038 – Audit & Fix Mobile Layouts (320–480px)

**Purpose**: Ensure all screens are fully usable on the smallest target device (320px) — no horizontal overflow, no cut-off content, comfortable touch targets.

**Steps**:
1. **SetupPage** (320–480px):
   - Sections stack vertically — already done via `Flex vertical`. Verify no overflow.
   - BankSelector checkboxes: text must wrap, not overflow. Use `break-words`.
   - PlayerConfig: 12-player list scrolls naturally with document flow.
   - GameConfig: InputNumber fields must be wide enough to show values (min-width 80px).
   - "开始游戏" button: full-width block button, ≥44px height. Verify.

2. **GamePage** (320–480px):
   - PlayerBadge: player name + round info in a flex row. On very narrow screens, use `flex-wrap` to prevent overflow.
   - CountdownTimer: centered, 64px Progress circle — fits on 320px.
   - Question text: `text-base` (16px) minimum; allow text to wrap.
   - AnswerOption buttons: full-width, `min-h-[44px]`. On 320px, 4 options stack vertically — must all be visible without scrolling (or with natural document scroll, which is acceptable).
   - Check SC-005: question text + 4 options + timer visible on 375px without scroll. If they don't fit, reduce spacing.

3. **ResultPage** (320–480px):
   - Verdict icon + message: centered, large icon (text-5xl = 48px) — fits.
   - Answer options revealed: same full-width layout as GamePage options.
   - "继续" button: full-width block, ≥44px.

4. **LeaderboardPage** (320–480px):
   - Leaderboard cards: full-width, rank medal on left, score on right. Name truncates with `truncate` class if too long.
   - "再玩一局" button: full-width block.

5. **BankManagerPage** (320–480px):
   - Side-by-side layout (BankList + BankEditor) is too cramped at ≤480px.
   - Switch to stacked layout: BankList on top (full-width), BankEditor below.
   - Use Tailwind responsive: wrap `<div className="flex flex-col md:flex-row">` around the two panels.
   - On mobile, BankList shows as a scrollable horizontal tab-like selector or compact list.

**Fixes to apply** (typical issues found):
```tsx
// BankManagerPage — responsive stacking
<Flex gap={0} className="flex-col md:flex-row" style={{ flex: 1 }}>

// PlayerBadge — wrap on narrow
<Flex justify="space-between" align="center" wrap="wrap" gap={4} className="w-full">

// GamePage options — tighter gap on mobile
<Flex vertical gap={8} className="md:gap-10">
```

**Files**: `src/pages/SetupPage/SetupPage.tsx`, `src/pages/GamePage/GamePage.tsx`, `src/pages/ResultPage/ResultPage.tsx`, `src/pages/LeaderboardPage/LeaderboardPage.tsx`, `src/pages/BankManagerPage/BankManagerPage.tsx`

**Parallel?**: Yes — T038 (mobile) and T039 (tablet/desktop) can run concurrently.

---

### Subtask T039 – Audit & Fix Tablet/Desktop Layouts (481px+)

**Purpose**: On wider screens, the game should make good use of available space without looking stretched or misaligned.

**Steps**:
1. All content pages use `max-w-lg mx-auto` — this constrains to ~512px and centers on wide screens. Verify this class is applied consistently on all pages.

2. **SetupPage** (768px+):
   - BankSelector + PlayerConfig can be in 2-column layout on md+. Consider `md:grid md:grid-cols-2 md:gap-8`.
   - GameConfig stays as a compact flex row (already done).

3. **GamePage** (768px+):
   - Answer options: on desktop, could be 2×2 grid for 4 options.
   - ```tsx
     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
       {question.options.map(...)}
     </div>
     ```

4. **BankManagerPage** (768px+):
   - Side-by-side layout already set to `md:flex-row` from T038.
   - BankList width: `w-full md:w-60` — fixed width on desktop, full width on mobile.
   - BankEditor: takes remaining flex space.

5. **LeaderboardPage** (768px+):
   - Cards can be slightly wider but still max-w-lg — looks fine.
   - Top 3 players could have slightly larger cards or a subtle highlight.

**Files**: Same as T038 — update respective page files.

---

### Subtask T040 – Enforce 44×44px Minimum Touch Targets

**Purpose**: All buttons, answer options, checkboxes, and interactive list items must meet SC FR-022 (44px minimum).

**Steps**:
1. Audit each interactive element:
   - `AnswerOption` buttons: already `min-h-[44px]` — verify `py-3` renders ≥44px total height.
   - Ant Design `Button` default height: 32px (small), 40px (default), 48px (large). Use `size="large"` or add `className="min-h-[44px]"` to default buttons.
   - PlayerConfig delete button: `type="text"` small — add `className="w-11 h-11"` (44px).
   - BankList action buttons: small icon buttons — add `className="w-11 h-11 flex items-center justify-center"`.
   - Checkboxes in BankSelector: Ant Design Checkbox has ~20px target. Wrap in a tappable label that covers the full row height. The current `List.Item` click handler already covers this.
2. Use browser devtools device emulation to verify touch targets.
3. Add a global utility class if needed:
   ```css
   /* src/styles/global.css */
   .touchTarget {
     min-height: 44px;
     min-width: 44px;
     display: inline-flex;
     align-items: center;
     justify-content: center;
   }
   ```

**Files**: Various component files, `src/styles/global.css`

---

### Subtask T041 – Add Empty/Zero States

**Purpose**: Prevent confusing blank screens when data is missing or in edge case configurations.

**Steps**:
1. **BankSelector — no banks with questions**:
   - If all banks have 0 questions: show `<Alert type="info" message="所有题库为空，请先在题库管理中添加题目" />`

2. **BankEditor — empty bank**:
   - Already handled with Ant Design `<Empty>` in T033 BankEditor.

3. **SetupPage — single player mode**:
   - 1 player is valid (solo mode). Show a subtle `<Tag>单人模式</Tag>` next to the player count when only 1 player is configured. No blocking warning.

4. **LeaderboardPage — 0 scores**:
   - All players score 0 (no correct answers). Leaderboard renders normally with all at rank 1. No special handling needed — already correct with dense ranking.

5. **BankManagerPage — no custom banks, only built-in**:
   - BankEditor for the built-in bank shows questions as read-only list. No empty state needed.

**Files**: `src/pages/SetupPage/SetupPage.tsx`, `src/pages/SetupPage/BankSelector.tsx`, `src/pages/BankManagerPage/BankEditor.tsx`

---

### Subtask T042 – Add Error State Handling

**Purpose**: Surface actionable error messages for import failures and localStorage issues.

**Steps**:
1. **Import failure** (already handled in T032 via `message.error()`): Verify the specific error text from `validateImportSchema` is passed through to the user-visible message.

2. **localStorage quota exceeded**:
   - In `bankStore.ts`, wrap all `set()` calls that write to localStorage with a try/catch on the `QuotaExceededError`:
   ```tsx
   // In bankStore.ts — add error notification
   import { notification } from 'antd'

   // After catching QuotaExceededError:
   notification.error({
     message: '存储空间不足',
     description: '本地存储空间已满，无法保存新的题库数据。请删除部分题库后重试。',
   })
   ```
   - Zustand persist may internally suppress the error — add a custom `storage` implementation that catches and notifies:
   ```typescript
   // In bankStore.ts persist config:
   storage: {
     getItem: (name) => localStorage.getItem(name),
     setItem: (name, value) => {
       try {
         localStorage.setItem(name, value)
       } catch (e) {
         if (e instanceof DOMException && e.name === 'QuotaExceededError') {
           notification.error({ message: '存储空间不足', description: '...' })
         }
       }
     },
     removeItem: (name) => localStorage.removeItem(name),
   },
   ```

3. **TypeScript errors** (`tsc --noEmit`): run once more and fix any remaining type errors from WP04–WP07 implementations.

**Files**: `src/stores/bankStore.ts`, `src/pages/BankManagerPage/BankList.tsx`

---

### Subtask T043 – Manual Verification of SC-001 through SC-006

**Purpose**: Validate all success criteria before the feature is considered complete.

**Steps**:
1. **SC-001** — Host can reach first question in <60 seconds:
   - Time from page open → select built-in bank → add 2 players → click Start → first question displayed.
   - Expected: <30 seconds in practice (all interactions are instant).

2. **SC-002** — All game interactions respond within 300ms:
   - Select an answer → result page transition should feel instant.
   - Click "继续" → next question should appear immediately.
   - Check browser performance tab for any long tasks.

3. **SC-003** — Playable from 320px to 2560px:
   - Test at 320px (no horizontal scroll), 375px (iPhone SE), 768px (iPad), 1280px (desktop), 2560px (wide monitor, check max-w-lg centering).

4. **SC-004** — Custom bank with 10 questions created in <5 minutes:
   - Time creating a bank + adding 10 questions using the BankEditor.
   - Expected: ~3 minutes with the form UI.

5. **SC-005** — Question + 4 options + timer visible on 375px without scroll:
   - Open GamePage on a 375px emulation. Verify the viewport shows: PlayerBadge, timer, question text, and all 4 answer buttons without scrolling.
   - If content overflows: reduce padding, font size, or timer size.

6. **SC-006** — Scoring correctness across 2–12 players:
   - Play a game with 3 players, 2 rounds (6 turns total). Track expected scores manually and compare to leaderboard.
   - Verify correct answers increment only the active player's score.

**Output**: Document each SC with Pass/Fail status and any issues found. Fix any failures before marking WP08 complete.

**Files**: No code changes (unless SC violations require fixes). Document results in this activity log.

---

## Risks & Mitigations

- **postcss-pxtorem converting Tailwind's px-4**: Tailwind utility classes use px values that pxtorem will convert. This is expected behaviour and correct for rem scaling. If Tailwind's `border` utilities (like `border`) are converted incorrectly, add them to `selectorBlackList`.
- **Ant Design component heights**: Ant Design v6 components have their own CSS variables for sizing. They may not respect postcss-pxtorem. Verify Ant Design button heights separately.
- **SC-005 failure (content overflow on 375px)**: If the 4 answer options + timer + question push below the viewport, reduce `gap` values from `gap-10` to `gap-6` on the GamePage vertical flex. Also consider reducing the CountdownTimer circle from 64px to 48px on mobile (`md:size-64`).

## Review Guidance

- [ ] 320px: no horizontal scrollbar on any screen
- [ ] 375px: GamePage shows question + 4 options + timer without scrolling (SC-005)
- [ ] 768px: BankManagerPage shows side-by-side layout (BankList left, BankEditor right)
- [ ] 1280px: all pages centered with `max-w-lg` — no full-width stretching
- [ ] All buttons ≥44px tall (verify in devtools)
- [ ] Import failure → specific error message shown
- [ ] localStorage quota error → notification shown (may be hard to trigger manually; check code path)
- [ ] SC-001 through SC-006: all documented as Pass in activity log

## Activity Log

- 2026-02-25T00:00:00Z – system – lane=planned – Prompt created.
