# Quickstart: Multiplayer Turn-Based Quiz Game

**Feature**: `001-multiplayer-turn-based-quiz-game`
**Date**: 2026-02-25

---

## Prerequisites

```bash
# Verify existing scaffold
node --version   # ≥ 18
npm --version    # ≥ 9
```

## Install New Dependencies

```bash
cd /Users/xzl/Desktop/test-card-mey

# State management
npm install zustand

# Routing
npm install react-router-dom

# rem adaptation (check if already installed)
npm install postcss-pxtorem --save-dev
```

## Verify Dev Server

```bash
npm run dev
# → http://localhost:5173
```

## Run Tests

```bash
# Unit tests (Vitest)
npx vitest run

# Watch mode during development
npx vitest
```

## Key File Locations

| File | Purpose |
|------|---------|
| `src/types/index.ts` | All shared TypeScript interfaces |
| `src/data/defaultBank.ts` | Built-in question bank (read-only) |
| `src/stores/gameStore.ts` | Game session state (Zustand, in-memory) |
| `src/stores/bankStore.ts` | Bank CRUD state (Zustand + localStorage) |
| `src/services/gameEngine.ts` | Turn logic, scoring, round management |
| `src/services/bankService.ts` | Bank merge, shuffle, import/export |
| `src/router/index.tsx` | React Router route definitions |

## Route Map

| URL | Screen |
|-----|--------|
| `/` | Game setup (bank selection, player config, round/timer config) |
| `/game` | Active question (current player, timer, options) |
| `/result` | Post-answer result + Continue button |
| `/leaderboard` | Final leaderboard |
| `/banks` | Question bank manager (CRUD + import/export) |

## postcss-pxtorem Config

Confirm `postcss.config.js` includes:

```js
'postcss-pxtorem': {
  rootValue: 37.5,   // 750px design base
  propList: ['*'],
  minPixelValue: 2,
}
```

## Implementation Order (Work Packages)

1. **WP-01** — Project setup (install deps, types, default bank, router skeleton)
2. **WP-02** — Bank store + persistence (CRUD, localStorage sync)
3. **WP-03** — Game engine + game store (turn logic, scoring, state machine)
4. **WP-04** — Setup page (bank selector, player config, game config)
5. **WP-05** — Game page + result page (question display, countdown, answer flow)
6. **WP-06** — Leaderboard page (dense ranking, Play Again)
7. **WP-07** — Bank manager page (CRUD UI, import/export)
8. **WP-08** — Responsive design polish + cross-device testing
9. **WP-09** — Unit tests (game engine, bank service, ranking algorithm)
