import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { notification } from 'antd'
import { DEFAULT_BANK } from '../data/defaultBank'
import {
  getMergedQuestions as mergeQuestions,
  validateImportSchema,
  importSchemaToBank,
} from '../services/bankService'
import type { QuestionBank, Question, BankExportSchema } from '../types'

interface BankStoreState {
  customBanks: QuestionBank[]
}

interface BankStoreActions {
  getAllBanks: () => QuestionBank[]
  createBank: (name: string) => void
  addQuestion: (bankId: string, question: Omit<Question, 'id'>) => void
  updateQuestion: (
    bankId: string,
    questionId: string,
    updates: Partial<Omit<Question, 'id'>>,
  ) => void
  deleteQuestion: (bankId: string, questionId: string) => void
  deleteBank: (bankId: string) => void
  getMergedQuestions: (bankIds: string[]) => Question[]
  exportBank: (bankId: string) => void
  importBank: (
    file: File,
    onNameConflict: (name: string) => Promise<'rename' | 'overwrite' | 'cancel'>,
  ) => Promise<{ success: true } | { success: false; error: string }>
}

export const useBankStore = create<BankStoreState & BankStoreActions>()(
  persist(
    (set, get) => ({
      customBanks: [DEFAULT_BANK],

      getAllBanks: () => get().customBanks,

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
            b.id === bankId ? { ...b, questions: [...b.questions, newQuestion] } : b,
          ),
        }))
      },

      updateQuestion: (bankId, questionId, updates) => {
        set(s => ({
          customBanks: s.customBanks.map(b =>
            b.id === bankId
              ? {
                  ...b,
                  questions: b.questions.map(q =>
                    q.id === questionId ? { ...q, ...updates } : q,
                  ),
                }
              : b,
          ),
        }))
      },

      deleteQuestion: (bankId, questionId) => {
        set(s => ({
          customBanks: s.customBanks.map(b =>
            b.id === bankId
              ? { ...b, questions: b.questions.filter(q => q.id !== questionId) }
              : b,
          ),
        }))
      },

      deleteBank: (bankId) => {
        set(s => ({ customBanks: s.customBanks.filter(b => b.id !== bankId) }))
      },

      getMergedQuestions: (bankIds) => mergeQuestions(get().getAllBanks(), bankIds),

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

      importBank: async (file, onNameConflict) => {
        return new Promise(resolve => {
          const reader = new FileReader()
          reader.onload = async e => {
            try {
              const data = JSON.parse(e.target!.result as string)
              const validation = validateImportSchema(data)
              if (!validation.valid) {
                resolve({ success: false, error: validation.error })
                return
              }

              const schema = validation.schema
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
    }),
    {
      name: 'quiz-game-banks',
      version: 1,
      partialize: state => ({ customBanks: state.customBanks }),
      storage: {
        getItem: (name) => localStorage.getItem(name),
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, value)
          } catch (e) {
            if (e instanceof DOMException && e.name === 'QuotaExceededError') {
              notification.error({
                message: '存储空间不足',
                description: '本地存储空间已满，无法保存新的题库数据。请删除部分题库后重试。',
              })
            }
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
)
