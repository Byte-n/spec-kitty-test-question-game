# Feature Specification: Multiplayer Turn-Based Quiz Game

**Feature Branch**: `001-multiplayer-turn-based-quiz-game`
**Created**: 2026-02-25
**Status**: Draft
**Mission**: software-dev

## Overview

A responsive, single-page quiz game that runs entirely in the browser. 1 to 12 players take turns answering multiple-choice questions on a shared device. The host selects which question banks to use (built-in default bank and/or custom banks), sets up players, and starts the game. After all questions are answered, a final leaderboard is displayed.

No backend or accounts are required. All state lives client-side for the current session. Question banks are persisted locally so custom banks survive page refreshes.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Play a Game with the Built-In Question Bank (Priority: P1)

A group of friends open the web page on a single device. Without any setup, they select the default question bank, enter their names, and play a full round of turn-based quiz questions.

**Why this priority**: This is the core gameplay loop. Everything else builds on top of it.

**Independent Test**: Navigate to the page, select the default bank, add 2+ players, start the game, and complete a full round to see the leaderboard. Delivers a playable game with zero configuration.

**Acceptance Scenarios**:

1. **Given** the home screen is open, **When** the host selects the built-in question bank and starts the game with 2 players, **Then** the game begins and shows the first player's turn with a question and multiple-choice options.
2. **Given** a question is displayed with a countdown timer, **When** the active player selects an answer before time runs out, **Then** the system shows whether the answer is correct, updates the score, and advances to the next player's turn.
3. **Given** the active player does not answer before the timer expires, **Then** the question is marked as unanswered (no score), and the game advances to the next turn.
4. **Given** all questions have been answered, **When** the final question is submitted, **Then** the leaderboard screen is shown with all players ranked by score.
5. **Given** the leaderboard is displayed, **When** the host taps "Play Again", **Then** the game resets to the bank selection / player setup screen.

---

### User Story 2 — Create a Custom Question Bank (Priority: P2)

A teacher wants to run a class quiz. Before the game, they open the question bank manager, create a new bank named "Chapter 3 Review", and add 10 custom questions with multiple-choice options and correct answers.

**Why this priority**: Custom question banks are a core differentiator. Without them, repeat users are limited to the built-in content.

**Independent Test**: Open the question bank manager, create a new bank, add at least 1 question, save, and verify the bank appears in the bank selection list on the game setup screen.

**Acceptance Scenarios**:

1. **Given** the question bank manager is open, **When** the host enters a bank name and saves it, **Then** a new empty bank appears in the list with its name.
2. **Given** a custom bank is selected, **When** the host adds a question with a question text, 2–4 answer options, and marks one as correct, **Then** the question is saved to the bank and appears in the bank's question list.
3. **Given** a question has been saved, **When** the host edits or deletes it, **Then** the changes are reflected immediately and persisted locally.
4. **Given** the page is refreshed, **When** the host reopens the question bank manager, **Then** all previously created custom banks and their questions are still present.
5. **Given** a custom bank exists, **When** the host attempts to delete the entire bank, **Then** a confirmation prompt appears before deletion proceeds.

---

### User Story 3 — Merge Multiple Question Banks for a Game (Priority: P3)

A host wants to run a trivia night that mixes built-in general knowledge questions with a custom "Movies" bank they created. They select both banks before starting the game.

**Why this priority**: Multi-bank merging unlocks flexible game configurations and is a key differentiation from single-bank quiz tools.

**Independent Test**: With at least one custom bank containing questions, select both the default bank and the custom bank on the setup screen, start the game, and verify questions come from both banks.

**Acceptance Scenarios**:

1. **Given** the game setup screen is open, **When** the host checks multiple banks, **Then** all selected banks are highlighted and their combined question count is shown.
2. **Given** two or more banks are selected, **When** the game starts, **Then** questions are drawn from the merged pool of all selected banks and presented in a random order.
3. **Given** a host selects no question banks, **When** they attempt to start the game, **Then** an error message is shown and the game does not start.
4. **Given** a merged bank is in use, **When** the game ends, **Then** the leaderboard correctly reflects scores across all questions regardless of source bank.

---

### User Story 4 — Responsive Multi-Device Experience (Priority: P4)

A family uses the game during a road trip. One person holds the phone and passes it around after each turn. The layout adapts cleanly to a small mobile screen without needing to zoom or scroll during gameplay.

**Why this priority**: Multi-device support is a stated requirement. Without it the game is unusable for mobile users.

**Independent Test**: Open the game on a mobile browser (375px wide), on a tablet (768px wide), and on a desktop browser (1280px wide). Complete a full round on each form factor without layout breakage.

**Acceptance Scenarios**:

1. **Given** a mobile browser (480px or narrower), **When** a question is displayed, **Then** the question text and all answer options are fully visible without horizontal scrolling.
2. **Given** a tablet browser (481–1024px wide), **When** a question is displayed, **Then** the layout uses the available space efficiently.
3. **Given** a desktop browser (wider than 1024px), **Then** the layout centers content in a readable column without stretching awkwardly to full width.
4. **Given** any device, **When** a player taps or clicks an answer option, **Then** the touch target is large enough to interact with comfortably (minimum 44×44px hit area).

---

### Edge Cases

- What happens when a question bank has fewer questions than expected? → Game uses all available questions and ends early; informs the host before starting.
- What happens when only 1 player is added? → Game runs in solo mode — single player answers all questions in sequence.
- What happens when two banks are merged and contain duplicate question text? → Duplicates are included as-is; deduplication is not required.
- What happens when a custom bank has 0 questions? → The bank appears in the list but cannot be selected alone to start a game; a warning is shown.
- What happens if the browser is refreshed mid-game? → The current game session is lost; the user returns to the setup screen. No session persistence required.
- What happens when a player name is left blank? → Default name assigned (e.g., "Player 1", "Player 2").

---

## Requirements *(mandatory)*

### Functional Requirements

**Game Setup**

- **FR-001**: The system MUST allow the host to select one or more question banks (built-in or custom) before starting a game.
- **FR-002**: The system MUST display the combined question count when multiple banks are selected.
- **FR-003**: The system MUST allow the host to configure between 1 and 12 players and enter a name for each.
- **FR-004**: The system MUST prevent a game from starting if no question banks are selected or the selected banks contain zero questions in total.
- **FR-005**: The system MUST allow the host to configure a per-question time limit with a sensible default of 30 seconds.

**Gameplay**

- **FR-006**: The system MUST display questions one at a time, clearly indicating the current player's name and turn number.
- **FR-007**: Each question MUST present 2–4 answer options in a randomized order.
- **FR-008**: The system MUST show a countdown timer per question and automatically advance the turn when time expires.
- **FR-009**: Upon answer selection or timer expiry, the system MUST reveal whether the answer was correct and update the player's score.
- **FR-010**: The system MUST advance turns in sequential player order (Player 1 → Player 2 → … → Player N → Player 1 → …) until all questions are exhausted.
- **FR-011**: The system MUST randomize the order of questions drawn from the merged question pool at game start.

**Question Bank Management**

- **FR-012**: The system MUST provide a built-in default question bank with at least 20 pre-loaded questions in Chinese.
- **FR-013**: The system MUST allow users to create a new named custom question bank.
- **FR-014**: Each question MUST include: question text, 2–4 answer options, and exactly one correct answer marked.
- **FR-015**: The system MUST allow users to add, edit, and delete questions within a custom bank.
- **FR-016**: The system MUST allow users to delete an entire custom bank after a confirmation prompt.
- **FR-017**: Custom question banks and their questions MUST be persisted locally and survive page refreshes.

**End of Game**

- **FR-018**: After all questions are answered, the system MUST display a leaderboard showing all players ranked by total score (highest first).
- **FR-019**: The leaderboard MUST show each player's name, score, and rank.
- **FR-020**: The system MUST provide a "Play Again" action that returns the host to the setup screen.

**Responsive Design**

- **FR-021**: The game MUST be fully playable on mobile (320px or wider), tablet, and desktop browsers without requiring zoom or horizontal scrolling.
- **FR-022**: All interactive tap/click targets MUST meet a minimum size of 44×44 pixels.

---

### Key Entities

- **QuestionBank**: A named collection of questions. Has a type (built-in or custom), a name, and zero or more questions. Custom banks are user-created and locally persisted.
- **Question**: A single quiz item belonging to a bank. Contains question text, 2–4 answer options (each with text and a correct flag).
- **Player**: A participant in the current game session. Has a name, a turn order index, and a running score.
- **GameSession**: Represents one round of play. References the merged question pool, the player list, current question index, current player index, and each player's score. Exists in memory only (no persistence).
- **Leaderboard**: The end-of-game ranking derived from the GameSession. Ordered by score descending.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A host can go from opening the page to the first question being displayed in under 60 seconds with no prior setup.
- **SC-002**: All game interactions (selecting answers, advancing turns, viewing the leaderboard) respond within 300ms on a mid-range mobile device.
- **SC-003**: The game is fully playable on any screen width from 320px to 2560px without layout breakage or horizontal scrolling.
- **SC-004**: A custom question bank with 10 questions can be created and saved in under 5 minutes.
- **SC-005**: All answer options and the timer are visible simultaneously on a 375px-wide mobile screen without scrolling.
- **SC-006**: Games with 2–12 players complete without scoring errors — each correct answer adds exactly the expected points to the correct player.

---

## Assumptions

- No user accounts or server-side persistence are required; all data is stored in the browser (localStorage).
- The game runs on a single shared device/screen; no networked multiplayer is needed.
- Questions are multiple-choice only (no open-text, drag-and-drop, or image-based questions in v1).
- The built-in default question bank contains general knowledge questions in Chinese.
- Scoring is flat: one point per correct answer. Speed-based bonus scoring is out of scope for v1.
- The built-in question bank is read-only (users cannot edit or delete it).
- No accessibility (WCAG) compliance is mandated, but reasonable contrast and font size should be maintained.
