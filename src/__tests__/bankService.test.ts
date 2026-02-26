import { describe, it, expect } from 'vitest'
import {
  shuffleArray,
  getMergedQuestions,
  validateImportSchema,
} from '../services/bankService'
import type { QuestionBank } from '../types'

function makeBank(id: string, questionCount: number): QuestionBank {
  return {
    id,
    name: `Bank ${id}`,
    type: 'custom',
    createdAt: new Date().toISOString(),
    questions: Array.from({ length: questionCount }, (_, i) => ({
      id: `${id}-q${i}`,
      text: `Question ${i}`,
      options: [
        { id: `${id}-q${i}-a`, text: 'A' },
        { id: `${id}-q${i}-b`, text: 'B' },
      ],
      correctOptionId: `${id}-q${i}-a`,
    })),
  }
}

// ─── shuffleArray ──────────────────────────────────────────────────────────

describe('shuffleArray', () => {
  it('returns a new array with the same length', () => {
    const arr = [1, 2, 3, 4, 5]
    const shuffled = shuffleArray(arr)
    expect(shuffled.length).toBe(arr.length)
  })

  it('contains the same elements as the original (content invariant)', () => {
    const arr = [1, 2, 3, 4, 5]
    const shuffled = shuffleArray(arr)
    expect([...shuffled].sort((a, b) => a - b)).toEqual([...arr].sort((a, b) => a - b))
  })

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3]
    const original = [...arr]
    shuffleArray(arr)
    expect(arr).toEqual(original)
  })

  it('handles empty array', () => {
    expect(shuffleArray([])).toEqual([])
  })

  it('handles single element', () => {
    expect(shuffleArray([42])).toEqual([42])
  })

  it('returns a different reference than the original', () => {
    const arr = [1, 2, 3]
    const shuffled = shuffleArray(arr)
    expect(shuffled).not.toBe(arr)
  })
})

// ─── getMergedQuestions ────────────────────────────────────────────────────

describe('getMergedQuestions', () => {
  it('merges questions from two banks', () => {
    const banks = [makeBank('a', 3), makeBank('b', 4)]
    const merged = getMergedQuestions(banks, ['a', 'b'])
    expect(merged.length).toBe(7)
  })

  it('returns questions only from selected banks', () => {
    const banks = [makeBank('a', 3), makeBank('b', 4), makeBank('c', 5)]
    const merged = getMergedQuestions(banks, ['a', 'c'])
    expect(merged.length).toBe(8) // 3 + 5
  })

  it('returns empty array when no bank IDs selected', () => {
    const banks = [makeBank('a', 3)]
    expect(getMergedQuestions(banks, []).length).toBe(0)
  })

  it('ignores unknown bank IDs gracefully', () => {
    const banks = [makeBank('a', 3)]
    const merged = getMergedQuestions(banks, ['a', 'nonexistent'])
    expect(merged.length).toBe(3)
  })

  it('returns empty array when banks list is empty', () => {
    expect(getMergedQuestions([], ['a']).length).toBe(0)
  })

  it('returns a shuffled result (same content, possibly different order)', () => {
    const banks = [makeBank('a', 5)]
    const merged = getMergedQuestions(banks, ['a'])
    expect(merged.length).toBe(5)
    const ids = merged.map(q => q.id).sort()
    const expected = banks[0].questions.map(q => q.id).sort()
    expect(ids).toEqual(expected)
  })
})

// ─── validateImportSchema ──────────────────────────────────────────────────

describe('validateImportSchema', () => {
  const validSchema = {
    version: '1.0',
    type: 'quiz-bank',
    name: 'Test Bank',
    questions: [{ text: 'Q1', options: ['A', 'B', 'C', 'D'], correctIndex: 0 }],
  }

  it('returns valid=true for a correct schema', () => {
    const result = validateImportSchema(validSchema)
    expect(result.valid).toBe(true)
  })

  it('returns valid=false for non-object inputs', () => {
    expect(validateImportSchema('string').valid).toBe(false)
    expect(validateImportSchema(null).valid).toBe(false)
    expect(validateImportSchema(42).valid).toBe(false)
    expect(validateImportSchema(undefined).valid).toBe(false)
  })

  it('returns valid=false when type is not quiz-bank', () => {
    expect(validateImportSchema({ ...validSchema, type: 'other' }).valid).toBe(false)
  })

  it('returns valid=false when name is empty string', () => {
    expect(validateImportSchema({ ...validSchema, name: '' }).valid).toBe(false)
  })

  it('returns valid=false when name is only whitespace', () => {
    expect(validateImportSchema({ ...validSchema, name: '   ' }).valid).toBe(false)
  })

  it('returns valid=false when questions array is empty', () => {
    expect(validateImportSchema({ ...validSchema, questions: [] }).valid).toBe(false)
  })

  it('returns valid=false when a question has only 1 option (minimum is 2)', () => {
    const result = validateImportSchema({
      ...validSchema,
      questions: [{ text: 'Q', options: ['A'], correctIndex: 0 }],
    })
    expect(result.valid).toBe(false)
  })

  it('returns valid=false when a question has 5 options (maximum is 4)', () => {
    const result = validateImportSchema({
      ...validSchema,
      questions: [{ text: 'Q', options: ['A', 'B', 'C', 'D', 'E'], correctIndex: 0 }],
    })
    expect(result.valid).toBe(false)
  })

  it('returns valid=false when correctIndex is out of range (negative)', () => {
    const result = validateImportSchema({
      ...validSchema,
      questions: [{ text: 'Q', options: ['A', 'B'], correctIndex: -1 }],
    })
    expect(result.valid).toBe(false)
  })

  it('returns valid=false when correctIndex exceeds options length', () => {
    const result = validateImportSchema({
      ...validSchema,
      questions: [{ text: 'Q', options: ['A', 'B'], correctIndex: 5 }],
    })
    expect(result.valid).toBe(false)
  })

  it('returns valid=false when question text is empty', () => {
    const result = validateImportSchema({
      ...validSchema,
      questions: [{ text: '', options: ['A', 'B'], correctIndex: 0 }],
    })
    expect(result.valid).toBe(false)
  })

  it('accepts a schema with 2 options (minimum)', () => {
    const result = validateImportSchema({
      ...validSchema,
      questions: [{ text: 'Q', options: ['A', 'B'], correctIndex: 1 }],
    })
    expect(result.valid).toBe(true)
  })

  it('accepts a schema with 4 options (maximum)', () => {
    const result = validateImportSchema(validSchema) // validSchema uses 4 options
    expect(result.valid).toBe(true)
  })
})
