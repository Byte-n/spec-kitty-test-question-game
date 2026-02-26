import { Alert, Checkbox, Flex, Space, Tag, Typography } from 'antd'
import { useBankStore } from '../../stores/bankStore'

interface Props {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export default function BankSelector({ selectedIds, onChange }: Props) {
  const banks = useBankStore(s => s.getAllBanks())
  const totalQuestions = banks
    .filter(b => selectedIds.includes(b.id))
    .reduce((sum, b) => sum + b.questions.length, 0)

  const allBanksEmpty = banks.every(b => b.questions.length === 0)

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter(x => x !== id)
        : [...selectedIds, id],
    )
  }

  return (
    <Flex vertical gap={12}>
      <Typography.Text strong>选择题库</Typography.Text>
      <Flex vertical gap={8}>
        {banks.map(bank => {
          const isEmpty = bank.questions.length === 0
          return (
            <Checkbox
              key={bank.id}
              checked={selectedIds.includes(bank.id)}
              onChange={() => !isEmpty && toggle(bank.id)}
              disabled={isEmpty}
            >
              <Space>
                <span>{bank.name}</span>
                {bank.type === 'builtin' && <Tag color="blue">内置</Tag>}
                <Typography.Text type="secondary">
                  {isEmpty ? '(空)' : `${bank.questions.length} 题`}
                </Typography.Text>
              </Space>
            </Checkbox>
          )
        })}
      </Flex>
      {allBanksEmpty && (
        <Alert
          type="info"
          message="所有题库为空，请先在题库管理中添加题目"
          showIcon
        />
      )}
      {!allBanksEmpty && selectedIds.length > 0 && (
        <Typography.Text type="secondary">共 {totalQuestions} 道题</Typography.Text>
      )}
    </Flex>
  )
}
