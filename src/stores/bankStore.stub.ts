// Stub: real implementation in WP02
// Allows gameStore.ts to import useBankStore without errors in WP03 workspace.
// This file is not shipped — WP02's bankStore.ts replaces it on merge.
import { create } from 'zustand'
import type { Question } from '../types'

interface BankStoreMini {
  getMergedQuestions: (bankIds: string[]) => Question[]
}

export const useBankStore = create<BankStoreMini>()(() => ({
  getMergedQuestions: (_bankIds: string[]) => [],
}))
