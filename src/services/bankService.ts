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
export function validateImportSchema(
  data: unknown,
): { valid: true; schema: BankExportSchema } | { valid: false; error: string } {
  if (typeof data !== 'object' || data === null) return { valid: false, error: '无效的 JSON 格式' }
  const d = data as Record<string, unknown>
  if (d.type !== 'quiz-bank') return { valid: false, error: '文件类型不是题库文件' }
  if (typeof d.name !== 'string' || !d.name.trim()) return { valid: false, error: '题库名称不能为空' }
  if (!Array.isArray(d.questions) || d.questions.length === 0)
    return { valid: false, error: '题库必须包含至少一道题目' }
  for (let i = 0; i < d.questions.length; i++) {
    const q = d.questions[i] as Record<string, unknown>
    if (typeof q.text !== 'string' || !q.text.trim())
      return { valid: false, error: `第 ${i + 1} 题缺少题目文本` }
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4)
      return { valid: false, error: `第 ${i + 1} 题选项数量必须为 2–4 个` }
    if (
      typeof q.correctIndex !== 'number' ||
      q.correctIndex < 0 ||
      q.correctIndex >= (q.options as unknown[]).length
    )
      return { valid: false, error: `第 ${i + 1} 题正确答案索引无效` }
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
