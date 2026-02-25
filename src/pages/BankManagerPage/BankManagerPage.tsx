import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Flex, Modal, Typography } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useBankStore } from '../../stores/bankStore'
import BankList from './BankList'
import BankEditor from './BankEditor'
import type { QuestionBank } from '../../types'

export default function BankManagerPage() {
  const navigate = useNavigate()
  const banks = useBankStore(s => s.getAllBanks())
  const deleteBank = useBankStore(s => s.deleteBank)
  const deleteQuestion = useBankStore(s => s.deleteQuestion)

  const [selectedBankId, setSelectedBankId] = useState<string | null>(banks[0]?.id ?? null)
  const selectedBank = banks.find(b => b.id === selectedBankId) ?? null

  function handleSelectBank(id: string) {
    setSelectedBankId(id)
  }

  function handleDeleteBankRequest(bank: QuestionBank) {
    Modal.confirm({
      title: '删除题库',
      content: `确定要删除题库「${bank.name}」及其所有题目吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        deleteBank(bank.id)
        // Select the next available bank
        const remaining = banks.filter(b => b.id !== bank.id)
        setSelectedBankId(remaining[0]?.id ?? null)
      },
    })
  }

  function handleDeleteQuestionRequest(bankId: string, questionId: string) {
    Modal.confirm({
      title: '删除题目',
      content: '确定要删除这道题目吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => deleteQuestion(bankId, questionId),
    })
  }

  return (
    <Flex vertical style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Flex
        align="center"
        gap={12}
        className="px-4 py-3 border-b border-gray-200 bg-white"
        style={{ flexShrink: 0 }}
      >
        <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/')} />
        <Typography.Title level={4} style={{ margin: 0 }}>
          管理题库
        </Typography.Title>
      </Flex>

      {/* Content */}
      <Flex style={{ flex: 1, overflow: 'hidden' }}>
        <div
          className="border-r border-gray-200 overflow-y-auto p-4"
          style={{ flexShrink: 0 }}
        >
          <BankList
            selectedBankId={selectedBankId}
            onSelect={handleSelectBank}
            onDeleteRequest={handleDeleteBankRequest}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {selectedBank ? (
            <BankEditor
              bank={selectedBank}
              onDeleteQuestionRequest={handleDeleteQuestionRequest}
            />
          ) : (
            <Typography.Text type="secondary">请选择一个题库</Typography.Text>
          )}
        </div>
      </Flex>
    </Flex>
  )
}
