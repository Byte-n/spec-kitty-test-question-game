# Implementation Plan: Multiplayer Turn-Based Quiz Game

**Branch**: `main` | **Date**: 2026-02-25 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `kitty-specs/001-multiplayer-turn-based-quiz-game/spec.md`

---

## Summary

A responsive single-page quiz game for 1–12 players on a shared device. Players take turns answering multiple-choice questions drawn from a merged pool of built-in and custom question banks. The host configures players, round count, and time limit before starting. After each answer, the result is revealed and a "Continue" button advances to the next player's question. A leaderboard with dense ranking is shown at the end.

The implementation uses the existing Vite + React 19 + TypeScript scaffold, adding Zustand for game/bank state, React Router for screen navigation, and the Browser File API for JSON import/export. All data persists in localStorage. No backend is required.

---

## Technical Context

**Language/Version**: TypeScript 5.8 (strict mode), React 19
**Primary Dependencies**: Zustand (state), React Router v7 (navigation), Ant Design v6 (UI), Tailwind CSS (styling), Less Modules (complex styles)
**Storage**: localStorage (custom question banks), in-memory (active game session)
**Testing**: Vitest — unit tests for pure functions (game engine, bank service, ranking). No component tests.
**Target Platform**: Web browser — desktop, tablet, mobile (320px–2560px)
**Project Type**: Single-page web application (Vite + React, existing scaffold)
**Performance Goals**: Page load < 3s; all interactions < 300ms; smooth 60fps
**Constraints**: Fully offline-capable, no backend, no user accounts; localStorage only
**Scale/Scope**: 1–12 players per game, up to N custom question banks in localStorage

---

## Constitution Check

*GATE: Must pass before Phase 0 research.*

| Standard | Status | Notes |
|----------|--------|-------|
| TypeScript strict mode | ✅ Pass | No `any` without justification |
| React functional components only | ✅ Pass | No class components |
| Ant Design layout components for layout | ✅ Pass | Flex, Row/Col, Space used for layout |
| Tailwind for non-layout visual styles | ✅ Pass | Colors, typography, radius via Tailwind |
| Less Modules for complex styles | ✅ Pass | Animations, pseudo-elements only |
| Inline `style` for dynamic values only | ✅ Pass | Timer progress bar width, theme colors |
| camelCase class names | ✅ Pass | All Less classes use camelCase |
| px in source → postcss-pxtorem | ✅ Pass | Design base 750px; decorative stays px |
| Vitest for unit tests | ✅ Pass | Pure function tests only per plan |
| No `!important` except third-party override | ✅ Pass | Standard styling approach |

**Gate result: PASS** — no violations. Proceed to Phase 0.

---

## Project Structure

### Documentation (this feature)

```
kitty-specs/001-multiplayer-turn-based-quiz-game/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── state-contracts.ts       # Zustand store interfaces
│   └── storage-schema.json      # localStorage schema
└── tasks.md             # Phase 2 output (spec-kitty.tasks)
```

### Source Code (repository root)

```
src/
├── types/
│   └── index.ts                  # All shared TypeScript interfaces
├── data/
│   └── defaultBank.ts            # Built-in question bank (read-only)
├── stores/
│   ├── gameStore.ts              # GameSession Zustand store
│   └── bankStore.ts              # QuestionBank Zustand store + localStorage sync
├── services/
│   ├── gameEngine.ts             # Turn logic, scoring, round management
│   ├── bankService.ts            # Bank merge, shuffle, import/export
│   └── persistence.ts            # localStorage read/write helpers
├── components/
│   ├── CountdownTimer/
│   │   └── CountdownTimer.tsx
│   ├── QuestionCard/
│   │   └── QuestionCard.tsx
│   ├── AnswerOption/
│   │   └── AnswerOption.tsx
│   ├── PlayerBadge/
│   │   └── PlayerBadge.tsx
│   └── Leaderboard/
│       └── Leaderboard.tsx
├── pages/
│   ├── SetupPage/
│   │   ├── BankSelector.tsx      # Multi-bank checkbox selection
│   │   ├── PlayerConfig.tsx      # Player name inputs (1–12)
│   │   ├── GameConfig.tsx        # Round count + time limit inputs
│   │   └── SetupPage.tsx         # Combines all setup sections
│   ├── GamePage/
│   │   └── GamePage.tsx          # Active question display
│   ├── ResultPage/
│   │   └── ResultPage.tsx        # Post-answer result + Continue button
│   ├── LeaderboardPage/
│   │   └── LeaderboardPage.tsx   # Final rankings
│   └── BankManagerPage/
│       ├── BankList.tsx          # List of all banks
│       ├── BankEditor.tsx        # Add/edit/delete questions in a bank
│       └── BankManagerPage.tsx   # Combines bank list + editor
├── router/
│   └── index.tsx                 # React Router route definitions
├── App.tsx                       # App root with Router + Zustand providers
├── main.tsx                      # Entry point
└── __tests__/
    ├── gameEngine.test.ts
    ├── bankService.test.ts
    └── leaderboard.test.ts
```

**Structure Decision**: Single web application. No backend. All business logic in `src/services/`. Zustand stores in `src/stores/`. Pages are route-level components under `src/pages/`. Shared primitives in `src/components/`.

---

## Phase 0: Research

*See `research.md` for full findings.*

**Key resolved decisions**:
1. Zustand v5 for state management (lightweight, no boilerplate, React 19 compatible)
2. React Router v7 for navigation; protected redirects guard game routes from direct access
3. Browser File API (`showSaveFilePicker` / `<input type="file">`) for JSON import/export
4. Dense ranking algorithm for leaderboard ties
5. `crypto.randomUUID()` for entity IDs (no external dependency)
6. `postcss-pxtorem` configured with `rootValue: 37.5`, `750px` design base
7. Zustand `persist` middleware for localStorage sync (bank store only; game store is in-memory)

---

## Phase 1: Design & Contracts

*See `data-model.md` and `contracts/` for full details.*

### Screen Flow

```
/ (SetupPage)
  ├── Select question banks (multi-select checkboxes)
  ├── Configure players (1–12, with names)
  ├── Set round count + time limit
  └── [Start Game] → /game

/game (GamePage)
  ├── Shows: current player name, round/turn indicator, question, options, countdown
  ├── On answer selected or timer expired → /result

/result (ResultPage)
  ├── Shows: correct/incorrect, correct answer highlighted, score update
  ├── [Continue] button → /game (next player) or /leaderboard (if finished)

/leaderboard (LeaderboardPage)
  ├── Shows: dense-ranked list with name, score, rank
  └── [Play Again] → / (SetupPage)

/banks (BankManagerPage)
  ├── List all banks (built-in read-only + custom editable)
  ├── Create new bank, add/edit/delete questions
  ├── Export bank as JSON, import bank from JSON file
  └── [Back] → / (SetupPage)
```

### Game Turn State Machine

```
idle → question → result → question (repeat) → finished
```

- `idle`: No active session. SetupPage shown.
- `question`: A question is active with a running timer. GamePage shown.
- `result`: Answer submitted or timer expired. ResultPage shown.
- `question` (loop): Continue button pressed; next player + question loaded.
- `finished`: All turns exhausted. LeaderboardPage shown.

### Ranking Algorithm (Dense Ranking)

```
Sort players by score descending.
Assign rank = 1 to first player.
For each subsequent player:
  if score < previous player's score: rank = position (1-indexed)
  else: rank = same as previous
```

---

## Complexity Tracking

*No constitution violations detected. No entries required.*
