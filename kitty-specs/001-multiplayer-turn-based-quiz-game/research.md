# Research: Multiplayer Turn-Based Quiz Game

**Feature**: `001-multiplayer-turn-based-quiz-game`
**Date**: 2026-02-25
**Phase**: 0 — Pre-design research

---

## Decision 1: State Management — Zustand v5

**Decision**: Use Zustand v5 for all global state (game session + question banks).

**Rationale**:
- Lightweight (~1KB); no boilerplate reducers or actions
- React 19 compatible; works with concurrent features
- `persist` middleware handles localStorage sync declaratively for bank store
- Game store can be pure in-memory (no persistence middleware needed)
- Simple API: `create()` + `set()` + `get()`; easy to test by calling store actions directly

**Alternatives considered**:
- Redux Toolkit — more structured but significantly more boilerplate for this scope; rejected
- React Context + useReducer — no external dep but verbose for nested state updates; rejected

---

## Decision 2: Navigation — React Router v7

**Decision**: Use React Router v7 with `createBrowserRouter`.

**Rationale**:
- URL-based navigation gives each screen a stable address (bookmarkable, browser back/forward)
- Protected route wrapper redirects to `/` if no active game session, preventing blank GamePage on direct URL access
- React Router v7 is the current stable version (React 19 compatible)

**Route guard pattern**:
```tsx
// Redirect to setup if no active session
function GameGuard({ children }: { children: ReactNode }) {
  const session = useGameStore(s => s.session)
  return session ? <>{children}</> : <Navigate to="/" replace />
}
```

**Alternatives considered**:
- Conditional rendering only — simpler but loses URL semantics, no back-button support; rejected per user choice

---

## Decision 3: Entity IDs — `crypto.randomUUID()`

**Decision**: Use `crypto.randomUUID()` (native browser API) for generating IDs for banks, questions, options, and players.

**Rationale**:
- Zero external dependency
- Available in all modern browsers (Chrome 92+, Firefox 95+, Safari 15.4+)
- Collision probability negligible for this scale

**Alternatives considered**:
- `nanoid` — smaller output but adds a dependency; rejected
- Incremental integers — collision-prone when importing banks from other devices; rejected

---

## Decision 4: localStorage Schema — Zustand Persist Middleware

**Decision**: Use Zustand's `persist` middleware with `localStorage` adapter for the bank store only. Game session state is in-memory only (lost on refresh, per spec).

**Schema key**: `quiz-game-banks` (versioned via Zustand persist `version` field)

**Migration strategy**: Zustand persist supports `migrate()` function for schema upgrades. Start at version `1`.

**Size limit awareness**: localStorage is limited to ~5MB per origin. A bank with 100 questions at ~500 bytes each = ~50KB. For practical scale (hundreds of questions), localStorage is sufficient.

---

## Decision 5: Import/Export Format — JSON

**Decision**: Export/import question banks as JSON files using the Browser File API.

**Export**: `Blob` + `URL.createObjectURL()` + programmatic `<a>` click (works in all browsers without `showSaveFilePicker` which requires HTTPS and user gesture).

**Import**: `<input type="file" accept=".json">` + `FileReader.readAsText()` + JSON.parse + schema validation.

**JSON schema**:
```json
{
  "version": "1.0",
  "type": "quiz-bank",
  "name": "Bank Name",
  "questions": [
    {
      "text": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    }
  ]
}
```

**Validation rules on import**:
- `type` must equal `"quiz-bank"`
- `name` must be a non-empty string
- `questions` must be an array with ≥1 items
- Each question: `text` non-empty, `options` array 2–4 items, `correctIndex` in range

**Name conflict resolution**: If imported bank name matches an existing custom bank, prompt user to rename or overwrite.

---

## Decision 6: Dense Ranking Algorithm

**Decision**: Implement dense ranking (also called "1224" ranking — no gaps in rank sequence).

**Algorithm**:
```typescript
function computeRanking(players: Player[], scores: Record<string, number>): RankedPlayer[] {
  const sorted = [...players].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))
  let rank = 1
  return sorted.map((player, i) => {
    if (i > 0 && (scores[player.id] ?? 0) < (scores[sorted[i - 1].id] ?? 0)) {
      rank = i + 1
    }
    return { ...player, score: scores[player.id] ?? 0, rank }
  })
}
```

**Example**: Scores [10, 8, 8, 5] → Ranks [1, 2, 2, 3] (no rank 4 skipped).

---

## Decision 7: Timer Implementation

**Decision**: Use `setInterval` (1-second tick) inside a custom `useCountdown` hook. Store remaining seconds in component state (not in Zustand) since it's UI-local state.

**Auto-advance on expiry**: When countdown reaches 0, the hook calls `submitAnswer(null)` via the game store, which records no score and transitions to `result` phase.

**Cleanup**: `clearInterval` on component unmount to prevent memory leaks (standard React pattern).

---

## Decision 8: postcss-pxtorem Configuration

**Decision**: Configure `postcss-pxtorem` with `rootValue: 37.5` (750px design base ÷ 20rem = 37.5px per rem).

**Configuration** (`postcss.config.js`):
```js
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 37.5,
      propList: ['*'],
      selectorBlackList: [],
      replace: true,
      mediaQuery: false,
      minPixelValue: 2,
    }
  }
}
```

**Note**: `postcss-pxtorem` may not be installed yet. Check `package.json` and add if missing.

---

## Decision 9: Built-In Question Bank — Static Import

**Decision**: Ship the built-in question bank as a static TypeScript file (`src/data/defaultBank.ts`) bundled at build time. No API call needed.

**Rationale**: Fully offline, zero latency, no fetch waterfall. Content is read-only so no CRUD overhead.

**Initial content**: ≥20 general knowledge questions in Chinese, covering history, science, geography, pop culture.

---

## Outstanding Items (Deferred to Implementation)

- `postcss-pxtorem` package: verify it is already installed or add it during WP-01
- Zustand version: confirm v5 is available or install during WP-01
- React Router version: confirm v7 is available or install during WP-01
- Tailwind responsive breakpoints: confirm `sm/md/lg` match 480/768/1024px targets from spec
