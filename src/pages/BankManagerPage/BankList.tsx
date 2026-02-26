import { useRef } from 'react'
import { Button, Flex, List, Tag, Typography, message } from 'antd'
import { PlusOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons'
import { useBankStore } from '../../stores/bankStore'
import type { QuestionBank } from '../../types'

interface Props {
  selectedBankId: string | null
  onSelect: (id: string) => void
  onDeleteRequest: (bank: QuestionBank) => void
}

export default function BankList({ selectedBankId, onSelect, onDeleteRequest }: Props) {
  const banks = useBankStore(s => s.getAllBanks())
  const exportBank = useBankStore(s => s.exportBank)
  const importBank = useBankStore(s => s.importBank)
  const createBank = useBankStore(s => s.createBank)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleCreate() {
    const name = window.prompt('请输入题库名称：')
    if (!name?.trim()) return
    createBank(name.trim())
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await importBank(file, async name => {
      const choice = window.confirm(`题库"${name}"已存在，点击确定覆盖，点击取消放弃导入`)
      return choice ? 'overwrite' : 'cancel'
    })
    if (result.success) {
      message.success('题库导入成功')
    } else {
      message.error(result.error ?? '导入失败')
    }
    // Reset so the same file can be imported again
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <Flex vertical gap={12}>
      <Flex justify="space-between" align="center">
        <Typography.Text strong>题库列表</Typography.Text>
        <Button icon={<PlusOutlined />} size="small" onClick={handleCreate}>
          新建
        </Button>
      </Flex>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />
      <Button
        icon={<ImportOutlined />}
        size="small"
        onClick={() => fileInputRef.current?.click()}
      >
        导入题库
      </Button>

      <List
        dataSource={banks}
        renderItem={bank => (
          <List.Item
            onClick={() => onSelect(bank.id)}
            className={`cursor-pointer rounded-lg px-3 py-2 ${
              selectedBankId === bank.id ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
            actions={
              bank.type === 'custom'
                ? [
                    <Button
                      key="export"
                      type="text"
                      size="small"
                      icon={<ExportOutlined />}
                      className="w-11 h-11 flex items-center justify-center"
                      onClick={e => {
                        e.stopPropagation()
                        exportBank(bank.id)
                      }}
                    />,
                    <Button
                      key="delete"
                      type="text"
                      size="small"
                      danger
                      className="min-h-[44px] px-2"
                      onClick={e => {
                        e.stopPropagation()
                        onDeleteRequest(bank)
                      }}
                    >
                      删除
                    </Button>,
                  ]
                : [
                    <Button
                      key="export"
                      type="text"
                      size="small"
                      icon={<ExportOutlined />}
                      className="w-11 h-11 flex items-center justify-center"
                      onClick={e => {
                        e.stopPropagation()
                        exportBank(bank.id)
                      }}
                    />,
                  ]
            }
          >
            <Flex vertical gap={0}>
              <Typography.Text ellipsis style={{ maxWidth: 100 }}>
                {bank.name}
              </Typography.Text>
              <Flex gap={4} align="center">
                {bank.type === 'builtin' && (
                  <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>
                    内置
                  </Tag>
                )}
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {bank.questions.length} 题
                </Typography.Text>
              </Flex>
            </Flex>
          </List.Item>
        )}
      />
    </Flex>
  )
}
