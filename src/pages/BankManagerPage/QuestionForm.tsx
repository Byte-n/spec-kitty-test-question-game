import { useState } from 'react'
import { Button, Flex, Form, Input, Radio, Typography } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useBankStore } from '../../stores/bankStore'
import type { Question } from '../../types'

interface Props {
  bankId: string
  question: Question | null // null = add mode
  onDone: () => void
}

export default function QuestionForm({ bankId, question, onDone }: Props) {
  const addQuestion = useBankStore(s => s.addQuestion)
  const updateQuestion = useBankStore(s => s.updateQuestion)

  const [text, setText] = useState(question?.text ?? '')
  const [options, setOptions] = useState<string[]>(
    question?.options.map(o => o.text) ?? ['', '', '', ''],
  )
  const [correctIndex, setCorrectIndex] = useState<number>(
    question ? question.options.findIndex(o => o.id === question.correctOptionId) : 0,
  )
  const [error, setError] = useState<string | null>(null)

  function addOption() {
    if (options.length >= 4) return
    setOptions([...options, ''])
  }

  function removeOption(i: number) {
    if (options.length <= 2) return
    const updated = options.filter((_, idx) => idx !== i)
    setOptions(updated)
    if (correctIndex >= updated.length) setCorrectIndex(0)
  }

  function validate(): boolean {
    if (!text.trim()) {
      setError('请输入题目文本')
      return false
    }
    if (options.some(o => !o.trim())) {
      setError('所有选项不能为空')
      return false
    }
    setError(null)
    return true
  }

  function handleSave() {
    if (!validate()) return
    const optionObjects = options.map((optText, i) => ({
      id: question?.options[i]?.id ?? crypto.randomUUID(),
      text: optText.trim(),
    }))
    const correctOptionId = optionObjects[correctIndex].id

    if (question) {
      updateQuestion(bankId, question.id, {
        text: text.trim(),
        options: optionObjects,
        correctOptionId,
      })
    } else {
      addQuestion(bankId, { text: text.trim(), options: optionObjects, correctOptionId })
    }
    onDone()
  }

  return (
    <Flex vertical gap={12} className="rounded-xl bg-gray-50 p-4">
      <Typography.Text strong>{question ? '编辑题目' : '添加题目'}</Typography.Text>
      <Form layout="vertical">
        <Form.Item label="题目">
          <Input.TextArea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={2}
            maxLength={500}
            showCount
          />
        </Form.Item>
        <Form.Item label="选项（单选正确答案）">
          <Flex vertical gap={8}>
            <Radio.Group value={correctIndex} onChange={e => setCorrectIndex(e.target.value)}>
              {options.map((opt, i) => (
                <Flex key={i} gap={8} align="center" className="mb-2">
                  <Radio value={i} title="设为正确答案" />
                  <Input
                    value={opt}
                    onChange={e => {
                      const updated = [...options]
                      updated[i] = e.target.value
                      setOptions(updated)
                    }}
                    placeholder={`选项 ${String.fromCharCode(65 + i)}`}
                    maxLength={200}
                    style={{ flex: 1 }}
                  />
                  {options.length > 2 && (
                    <Button
                      icon={<DeleteOutlined />}
                      type="text"
                      danger
                      size="small"
                      onClick={() => removeOption(i)}
                    />
                  )}
                </Flex>
              ))}
            </Radio.Group>
            {options.length < 4 && (
              <Button icon={<PlusOutlined />} type="dashed" size="small" onClick={addOption}>
                添加选项
              </Button>
            )}
          </Flex>
        </Form.Item>
        {error && <Typography.Text type="danger">{error}</Typography.Text>}
        <Flex gap={8} justify="flex-end">
          <Button onClick={onDone}>取消</Button>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
        </Flex>
      </Form>
    </Flex>
  )
}
