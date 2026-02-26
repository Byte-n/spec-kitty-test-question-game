import { useState } from 'react'
import { Button, Empty, Flex, List, Typography } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import QuestionForm from './QuestionForm'
import type { Question, QuestionBank } from '../../types'

interface Props {
  bank: QuestionBank
  onDeleteQuestionRequest: (bankId: string, questionId: string) => void
}

export default function BankEditor({ bank, onDeleteQuestionRequest }: Props) {
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [adding, setAdding] = useState(false)

  const isBuiltin = bank.type === 'builtin'

  return (
    <Flex vertical gap={16} style={{ flex: 1, minWidth: 0 }}>
      <Flex justify="space-between" align="center">
        <Typography.Title level={4} style={{ margin: 0 }}>
          {bank.name}
        </Typography.Title>
        {!isBuiltin && (
          <Button
            icon={<PlusOutlined />}
            onClick={() => {
              setAdding(true)
              setEditingQuestion(null)
            }}
          >
            添加题目
          </Button>
        )}
      </Flex>

      {(adding || editingQuestion) && !isBuiltin && (
        <QuestionForm
          bankId={bank.id}
          question={editingQuestion}
          onDone={() => {
            setAdding(false)
            setEditingQuestion(null)
          }}
        />
      )}

      {bank.questions.length === 0 ? (
        <Empty description={isBuiltin ? '内置题库' : '暂无题目，点击「添加题目」开始创建'} />
      ) : (
        <List
          dataSource={bank.questions}
          renderItem={(q, i) => (
            <List.Item
              actions={
                isBuiltin
                  ? []
                  : [
                      <Button
                        key="edit"
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditingQuestion(q)
                          setAdding(false)
                        }}
                      />,
                      <Button
                        key="del"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDeleteQuestionRequest(bank.id, q.id)}
                      />,
                    ]
              }
            >
              <Typography.Text>
                <span className="text-gray-400 mr-2">{i + 1}.</span>
                {q.text}
              </Typography.Text>
            </List.Item>
          )}
        />
      )}
    </Flex>
  )
}
