---
work_package_id: "WP02"
subtasks:
  - "T007"
  - "T008"
  - "T009"
  - "T010"
  - "T011"
title: "Bank Store & Persistence"
phase: "Phase 0 - Foundation"
lane: "done"
assignee: ""
agent: "claude"
shell_pid: "70636"
review_status: "approved"
reviewed_by: "xzl"
dependencies: ["WP01"]
history:
  - timestamp: "2026-02-25T00:00:00Z"
    lane: "planned"
    agent: "system"
    shell_pid: ""
    action: "Prompt generated via /spec-kitty.tasks"
---

# Work Package Prompt: WP02 – Bank Store & Persistence

## ⚠️ IMPORTANT: Review Feedback Status

- **Has review feedback?**: Check the `review_status` field above.

---

## Review Feedback

*[Empty — no feedback yet.]*

---

## Objectives & Success Criteria

- `bankStore.getAllBanks()` returns the built-in bank + any custom banks from localStorage
- Creating a bank, refreshing the page, and calling `getAllBanks()` again shows the bank persists
- `exportBank(id)` triggers a file download with valid JSON matching the `BankExportSchema`
- `importBank(file)` with valid JSON adds the bank to the store; import of invalid JSON returns an error string without crashing
- `getMergedQuestions(['builtin', 'custom-id'])` returns combined + shuffled questions from both banks

## Context & Constraints

- **Implement command**: `spec-kitty implement WP02 --base WP01`
- **Depends on**: WP01 (types in `src/types/index.ts`, default bank in `src/data/defaultBank.ts`)
- **Spec**: FR-012 through FR-017c
- **Data model**: `kitty-specs/001-multiplayer-turn-based-quiz-game/data-model.md`
- **Contracts**: `kitty-specs/001-multiplayer-turn-based-quiz-game/contracts/storage-schema.json`
- localStorage key: `"quiz-game-banks"`, Zustand persist version: `1`
- Built-in bank is NOT stored in localStorage; it is merged at runtime from `defaultBank.ts`

## Subtasks & Detailed Guidance

### Subtask T007 – Create `src/services/persistence.ts`

**Purpose**: Provide typed localStorage helpers to centralise all read/write logic and handle `QuotaExceededError` gracefully.

**Steps**:
1. Create `src/services/persistence.ts`:
   ```typescript
   export function loadFromStorage<T>(key: string, fallback: T): T {
     try {
       const raw = localStorage.getItem(key)
       if (!raw) return fallback
       return JSON.parse(raw) as T
     } catch {
       return fallback
     }
   }

   export function saveToStorage<T>(key: string, value: T): void {
     try {
       localStorage.setItem(key, JSON.stringify(value))
     } catch (e) {
       if (e instanceof DOMException && e.name === 'QuotaExceededError') {
         console.warn('[Quiz] localStorage quota exceeded. Some data may not be saved.')
         // Bubble up so UI can show a warning (handled in WP08)
         throw e
       }
     }
   }
   ```
2. Note: Zustand's `persist` middleware handles actual localStorage sync automatically. This file provides lower-level utilities for manual reads and error handling.

**Files**: `src/services/persistence.ts` (new file, ~25 lines)

**Parallel?**: Yes — independent of T008.

---

### Subtask T008 – Create `src/services/bankService.ts`

**Purpose**: Pure functions for bank operations that have no side effects — these are easy to unit-test (WP09) and keep the Zustand store thin.

**Steps**:
1. Create `src/services/bankService.ts`:
   ```typescript
   import type { Question, QuestionBank, BankExportSchema } from '../types'

   /** Fisher-Yates shuffle — returns a new shuffled array */
   export function shuffleArray<T>(arr: T[]): T[] {
     const result = [...arr]
     for (let i = result.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1))
       ;[result[i], result[j]] = [result[j], result[i]]
     }
     return result
   }

   /** Merge questions from multiple banks and shuffle the combined pool */
   export function getMergedQuestions(banks: QuestionBank[], bankIds: string[]): Question[] {
     const merged: Question[] = []
     for (const id of bankIds) {
       const bank = banks.find(b => b.id === id)
       if (bank) merged.push(...bank.questions)
     }
     return shuffleArray(merged)
   }

   /** Validate an imported JSON object against BankExportSchema rules */
   export function validateImportSchema(data: unknown): { valid: true; schema: BankExportSchema } | { valid: false; error: string } {
     if (typeof data !== 'object' || data === null) return { valid: false, error: '无效的 JSON 格式' }
     const d = data as Record<string, unknown>
     if (d.type !== 'quiz-bank') return { valid: false, error: '文件类型不是题库文件' }
     if (typeof d.name !== 'string' || !d.name.trim()) return { valid: false, error: '题库名称不能为空' }
     if (!Array.isArray(d.questions) || d.questions.length === 0) return { valid: false, error: '题库必须包含至少一道题目' }
     for (let i = 0; i < d.questions.length; i++) {
       const q = d.questions[i] as Record<string, unknown>
       if (typeof q.text !== 'string' || !q.text.trim()) return { valid: false, error: `第 ${i + 1} 题缺少题目文本` }
       if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4) return { valid: false, error: `第 ${i + 1} 题选项数量必须为 2–4 个` }
       if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= q.options.length) return { valid: false, error: `第 ${i + 1} 题正确答案索引无效` }
     }
     return { valid: true, schema: data as BankExportSchema }
   }

   /** Convert BankExportSchema format to internal QuestionBank format */
   export function importSchemaToBank(schema: BankExportSchema): Omit<QuestionBank, 'id' | 'createdAt'> {
     return {
       name: schema.name.trim(),
       type: 'custom',
       questions: schema.questions.map((q, qi) => {
         const optionIds = q.options.map((_, oi) => `imported-q${qi}-o${oi}`)
         return {
           id: `imported-q${qi}-${crypto.randomUUID().slice(0, 8)}`,
           text: q.text,
           options: q.options.map((text, oi) => ({ id: optionIds[oi], text })),
           correctOptionId: optionIds[q.correctIndex],
         }
       }),
     }
   }
   ```
2. Run `npx tsc --noEmit` to verify no type errors.

**Files**: `src/services/bankService.ts` (new file, ~65 lines)

**Parallel?**: Yes — independent of T007.

---

### Subtask T009 – Create `src/stores/bankStore.ts`

**Purpose**: The central Zustand store for question bank state. Uses `persist` middleware to sync custom banks to localStorage automatically. Provides all CRUD actions and the `getAllBanks()` / `getMergedQuestions()` selectors.

**Steps**:
1. Create `src/stores/bankStore.ts`:
   ```typescript
   import { create } from 'zustand'
   import { persist } from 'zustand/middleware'
   import { DEFAULT_BANK } from '../data/defaultBank'
   import { getMergedQuestions as mergeQuestions } from '../services/bankService'
   import type { QuestionBank, Question } from '../types'

   interface BankStoreState {
     customBanks: QuestionBank[]
   }

   interface BankStoreActions {
     getAllBanks: () => QuestionBank[]
     createBank: (name: string) => void
     addQuestion: (bankId: string, question: Omit<Question, 'id'>) => void
     updateQuestion: (bankId: string, questionId: string, updates: Partial<Omit<Question, 'id'>>) => void
     deleteQuestion: (bankId: string, questionId: string) => void
     deleteBank: (bankId: string) => void
     getMergedQuestions: (bankIds: string[]) => Question[]
   }

   export const useBankStore = create<BankStoreState & BankStoreActions>()(
     persist(
       (set, get) => ({
         customBanks: [],

         getAllBanks: () => [DEFAULT_BANK, ...get().customBanks],

         createBank: (name) => {
           const newBank: QuestionBank = {
             id: crypto.randomUUID(),
             name: name.trim(),
             type: 'custom',
             questions: [],
             createdAt: new Date().toISOString(),
           }
           set(s => ({ customBanks: [...s.customBanks, newBank] }))
         },

         addQuestion: (bankId, question) => {
           const newQuestion: Question = {
             id: crypto.randomUUID(),
             ...question,
           }
           set(s => ({
             customBanks: s.customBanks.map(b =>
               b.id === bankId ? { ...b, questions: [...b.questions, newQuestion] } : b
             ),
           }))
         },

         updateQuestion: (bankId, questionId, updates) => {
           set(s => ({
             customBanks: s.customBanks.map(b =>
               b.id === bankId
                 ? { ...b, questions: b.questions.map(q => q.id === questionId ? { ...q, ...updates } : q) }
                 : b
             ),
           }))
         },

         deleteQuestion: (bankId, questionId) => {
           set(s => ({
             customBanks: s.customBanks.map(b =>
               b.id === bankId ? { ...b, questions: b.questions.filter(q => q.id !== questionId) } : b
             ),
           }))
         },

         deleteBank: (bankId) => {
           set(s => ({ customBanks: s.customBanks.filter(b => b.id !== bankId) }))
         },

         getMergedQuestions: (bankIds) => mergeQuestions(get().getAllBanks(), bankIds),
       }),
       {
         name: 'quiz-game-banks',
         version: 1,
         // Persist only customBanks (not actions)
         partialize: (state) => ({ customBanks: state.customBanks }),
       }
     )
   )
   ```
2. Verify by running `npm run dev`, opening browser console, and calling:
   ```js
   // Open browser console and test
   // (store is accessible via window during dev)
   ```

**Files**: `src/stores/bankStore.ts` (new file, ~70 lines)

---

### Subtask T010 – Implement `exportBank()`

**Purpose**: Allow users to download a custom (or built-in) bank as a JSON file for backup and cross-device sharing.

**Steps**:
1. Add `exportBank` action to `bankStore.ts`:
   ```typescript
   exportBank: (bankId) => {
     const bank = get().getAllBanks().find(b => b.id === bankId)
     if (!bank) return

     const schema: BankExportSchema = {
       version: '1.0',
       type: 'quiz-bank',
       name: bank.name,
       questions: bank.questions.map(q => ({
         text: q.text,
         options: q.options.map(o => o.text),
         correctIndex: q.options.findIndex(o => o.id === q.correctOptionId),
       })),
     }

     const json = JSON.stringify(schema, null, 2)
     const blob = new Blob([json], { type: 'application/json' })
     const url = URL.createObjectURL(blob)
     const a = document.createElement('a')
     a.href = url
     a.download = `${bank.name.replace(/\s+/g, '-')}.json`
     document.body.appendChild(a)
     a.click()
     document.body.removeChild(a)
     URL.revokeObjectURL(url)
   },
   ```
2. Also add `BankExportSchema` to the import at the top of `bankStore.ts`.

**Files**: `src/stores/bankStore.ts` (add method)

**Notes**: `URL.createObjectURL()` works without HTTPS and without user gesture restrictions (unlike `showSaveFilePicker`), ensuring compatibility on all target browsers.

---

### Subtask T011 – Implement `importBank()`

**Purpose**: Allow users to import a bank from a JSON file, with full schema validation and name-conflict resolution.

**Steps**:
1. Add `importBank` action to `bankStore.ts`:
   ```typescript
   importBank: async (file, onNameConflict) => {
     return new Promise((resolve) => {
       const reader = new FileReader()
       reader.onload = async (e) => {
         try {
           const data = JSON.parse(e.target!.result as string)
           const validation = validateImportSchema(data)
           if (!validation.valid) {
             resolve({ success: false, error: validation.error })
             return
           }

           const schema = validation.schema
           const allBanks = get().getAllBanks()
           const existingCustom = get().customBanks.find(b => b.name === schema.name)

           let finalName = schema.name
           if (existingCustom) {
             const action = await onNameConflict(schema.name)
             if (action === 'cancel') {
               resolve({ success: false, error: '已取消导入' })
               return
             }
             if (action === 'overwrite') {
               get().deleteBank(existingCustom.id)
             }
             // 'rename' case: caller will have modified schema.name via a prompt
             // For simplicity, treat 'rename' as adding a suffix
             if (action === 'rename') {
               finalName = `${schema.name} (导入)`
             }
           }

           const bankData = importSchemaToBank({ ...schema, name: finalName })
           const newBank: QuestionBank = {
             id: crypto.randomUUID(),
             createdAt: new Date().toISOString(),
             ...bankData,
           }
           set(s => ({ customBanks: [...s.customBanks, newBank] }))
           resolve({ success: true })
         } catch {
           resolve({ success: false, error: '文件解析失败，请确认为有效的 JSON 文件' })
         }
       }
       reader.onerror = () => resolve({ success: false, error: '文件读取失败' })
       reader.readAsText(file)
     })
   },
   ```
2. Add imports for `validateImportSchema`, `importSchemaToBank` from `bankService.ts` at the top of `bankStore.ts`.

**Files**: `src/stores/bankStore.ts` (add method + imports)

---

## Risks & Mitigations

- **Zustand persist + hydration**: On first load, customBanks may be empty for a frame before hydration. The `getAllBanks()` function should gracefully handle this by returning just the DEFAULT_BANK.
- **localStorage QuotaExceededError**: Catch in `persistence.ts` (T007); surface to UI in WP08 (T042).
- **Import name conflict UX**: The `onNameConflict` callback pattern allows the UI (BankManagerPage in WP07) to show a modal without the store knowing about React or Ant Design.

## Review Guidance

- [ ] `useBankStore.getState().getAllBanks()` returns the built-in bank (id: 'builtin') as first item
- [ ] `useBankStore.getState().createBank('Test')` → refresh page → bank still in localStorage
- [ ] `exportBank('builtin')` triggers a file download named `通用知识题库.json`
- [ ] Exported JSON is valid and matches `BankExportSchema` structure
- [ ] Import the exported file back → bank appears in `getAllBanks()` without error
- [ ] Import a malformed JSON → returns `{ success: false, error: '...' }`, no crash
- [ ] `getMergedQuestions(['builtin'])` returns shuffled array of ≥20 questions

## Activity Log

- 2026-02-25T00:00:00Z – system – lane=planned – Prompt created.
- 2026-02-25T10:24:41Z – unknown – lane=for_review – T007–T011 done: persistence helpers, bankService pure functions, bankStore with persist middleware, exportBank (Blob download), importBank (FileReader + schema validation)
- 2026-02-25T10:29:04Z – claude – shell_pid=70636 – lane=doing – Started review via workflow command
- 2026-02-25T10:32:07Z – claude – shell_pid=70636 – lane=done – Review passed: persistence helpers correct, bankService pure functions clean (Fisher-Yates, validation, import conversion), bankStore persist config matches spec (key/version/partialize), export/import fully implemented with proper cleanup and conflict resolution
