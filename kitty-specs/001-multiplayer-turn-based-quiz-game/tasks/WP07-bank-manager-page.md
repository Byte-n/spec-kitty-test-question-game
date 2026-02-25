---
work_package_id: WP07
title: Bank Manager Page
lane: "doing"
dependencies: [WP02]
base_branch: 001-multiplayer-turn-based-quiz-game-WP02
base_commit: 46408e730bf9ffb0663582f383efe6d119610dbd
created_at: '2026-02-25T15:09:41.827587+00:00'
subtasks:
- T032
- T033
- T034
- T035
- T036
- T037
phase: Phase 2 - Custom Question Banks
assignee: ''
agent: ''
shell_pid: "74812"
review_status: ''
reviewed_by: ''
history:
- timestamp: '2026-02-25T00:00:00Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
---

# Work Package Prompt: WP07 – Bank Manager Page

## ⚠️ IMPORTANT: Review Feedback Status

- **Has review feedback?**: Check the `review_status` field above.

---

## Review Feedback

*[Empty — no feedback yet.]*

---

## Objectives & Success Criteria

- Creating a bank, adding 3 questions, refreshing the page → bank and questions persist (localStorage)
- Editing a question saves changes immediately; deleting a question removes it from the list
- Deleting a bank shows a confirmation modal; bank is removed only after confirmation
- "导出" downloads a valid JSON file that can be re-imported
- "导入" with valid JSON adds the bank to the list; invalid JSON shows a specific error message
- Built-in bank shows "(内置)" badge with no edit/delete buttons

## Context & Constraints

- **Implement command**: `spec-kitty implement WP07 --base WP02`
- **Can run in parallel with WP05 and WP06** after WP02 completes
- **Spec**: FR-013 through FR-017c; US2 (custom bank creation) P2
- **Constitution**: Ant Design layout + Form + Modal first; Tailwind for visual
- Replace the placeholder `BankManagerPage` in `src/router/index.tsx` with the real import

## Subtasks & Detailed Guidance

### Subtask T032 – Create `src/pages/BankManagerPage/BankList.tsx`

**Purpose**: Left panel showing all banks with create/delete/export/import actions. Built-in bank is displayed read-only.

**Steps**:
1. Create `src/pages/BankManagerPage/BankList.tsx`:
   ```tsx
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
       const result = await importBank(file, async (name) => {
         const choice = window.confirm(`题库 "${name}" 已存在，点击确定覆盖，点击取消跳过`)
         return choice ? 'overwrite' : 'cancel'
       })
       if (result.success) {
         message.success('题库导入成功')
       } else {
         message.error(result.error ?? '导入失败')
       }
       // Reset file input so the same file can be imported again
       if (fileInputRef.current) fileInputRef.current.value = ''
     }

     return (
       <Flex vertical gap={12} style={{ width: 240, flexShrink: 0 }}>
         <Flex justify="space-between" align="center">
           <Typography.Text strong>题库列表</Typography.Text>
           <Button icon={<PlusOutlined />} size="small" onClick={handleCreate}>新建</Button>
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
               className={`cursor-pointer rounded-lg px-3 py-2 ${selectedBankId === bank.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
               actions={bank.type === 'custom' ? [
                 <Button key="export" type="text" size="small" icon={<ExportOutlined />} onClick={e => { e.stopPropagation(); exportBank(bank.id) }} />,
                 <Button key="delete" type="text" size="small" danger onClick={e => { e.stopPropagation(); onDeleteRequest(bank) }} >删除</Button>,
               ] : [
                 <Button key="export" type="text" size="small" icon={<ExportOutlined />} onClick={e => { e.stopPropagation(); exportBank(bank.id) }} />,
               ]}
             >
               <Flex vertical gap={0}>
                 <Typography.Text>{bank.name}</Typography.Text>
                 <Flex gap={4} align="center">
                   {bank.type === 'builtin' && <Tag color="blue" style={{ fontSize: 10 }}>内置</Tag>}
                   <Typography.Text type="secondary" style={{ fontSize: 12 }}>{bank.questions.length} 题</Typography.Text>
                 </Flex>
               </Flex>
             </List.Item>
           )}
         />
       </Flex>
     )
   }
   ```

**Files**: `src/pages/BankManagerPage/BankList.tsx` (new file, ~75 lines)

**Parallel?**: Yes — independent of T033.

---

### Subtask T033 – Create `src/pages/BankManagerPage/BankEditor.tsx`

**Purpose**: Right panel showing the question list for the selected bank and the form to add/edit questions. Includes empty state for banks with no questions.

**Steps**:
1. Create `src/pages/BankManagerPage/BankEditor.tsx`:
   ```tsx
   import { useState } from 'react'
   import { Button, Empty, Flex, List, Typography } from 'antd'
   import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
   import { useBankStore } from '../../stores/bankStore'
   import QuestionForm from './QuestionForm'  // created in T035
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
           <Typography.Title level={4} style={{ margin: 0 }}>{bank.name}</Typography.Title>
           {!isBuiltin && (
             <Button icon={<PlusOutlined />} onClick={() => { setAdding(true); setEditingQuestion(null) }}>
               添加题目
             </Button>
           )}
         </Flex>

         {(adding || editingQuestion) && !isBuiltin && (
           <QuestionForm
             bankId={bank.id}
             question={editingQuestion}
             onDone={() => { setAdding(false); setEditingQuestion(null) }}
           />
         )}

         {bank.questions.length === 0 ? (
           <Empty description="暂无题目，点击「添加题目」开始创建" />
         ) : (
           <List
             dataSource={bank.questions}
             renderItem={(q, i) => (
               <List.Item
                 actions={isBuiltin ? [] : [
                   <Button key="edit" type="text" icon={<EditOutlined />} onClick={() => { setEditingQuestion(q); setAdding(false) }} />,
                   <Button key="del" type="text" danger icon={<DeleteOutlined />} onClick={() => onDeleteQuestionRequest(bank.id, q.id)} />,
                 ]}
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
   ```

**Files**: `src/pages/BankManagerPage/BankEditor.tsx` (new file, ~60 lines)

**Parallel?**: Yes — independent of T032.

---

### Subtask T034 – Create `src/pages/BankManagerPage/BankManagerPage.tsx`

**Purpose**: Top-level page that owns the selected bank state, composes BankList and BankEditor, and handles delete confirmation modals.

**Steps**:
1. Create `src/pages/BankManagerPage/BankManagerPage.tsx`:
   ```tsx
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

     function handleDeleteBankRequest(bank: QuestionBank) {
       Modal.confirm({
         title: '删除题库',
         content: `确定要删除题库「${bank.name}」及其所有题目吗？此操作不可恢复。`,
         okText: '删除',
         okType: 'danger',
         cancelText: '取消',
         onOk: () => {
           deleteBank(bank.id)
           setSelectedBankId(banks.find(b => b.id !== bank.id)?.id ?? null)
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
       <Flex vertical gap={0} className="min-h-screen">
         {/* Header */}
         <Flex align="center" gap={12} className="px-4 py-3 border-b border-gray-200 bg-white">
           <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/')} />
           <Typography.Title level={4} style={{ margin: 0 }}>管理题库</Typography.Title>
         </Flex>

         {/* Content */}
         <Flex gap={0} style={{ flex: 1, overflow: 'hidden' }}>
           <div className="border-r border-gray-200 overflow-y-auto p-4">
             <BankList
               selectedBankId={selectedBankId}
               onSelect={setSelectedBankId}
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
   ```
2. Update `src/router/index.tsx`: replace placeholder `BankManagerPage` with real import.

**Files**: `src/pages/BankManagerPage/BankManagerPage.tsx` (new), `src/router/index.tsx` (update import)

---

### Subtask T035 – Implement Question Form (`QuestionForm`)

**Purpose**: Inline form for adding and editing questions: text field, 2–4 option inputs (dynamic add/remove), and correct-answer radio group.

**Steps**:
1. Create `src/pages/BankManagerPage/QuestionForm.tsx`:
   ```tsx
   import { useState } from 'react'
   import { Button, Flex, Form, Input, Radio, Typography } from 'antd'
   import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
   import { useBankStore } from '../../stores/bankStore'
   import type { Question } from '../../types'

   interface Props {
     bankId: string
     question: Question | null   // null = add mode, non-null = edit mode
     onDone: () => void
   }

   export default function QuestionForm({ bankId, question, onDone }: Props) {
     const addQuestion = useBankStore(s => s.addQuestion)
     const updateQuestion = useBankStore(s => s.updateQuestion)

     const [text, setText] = useState(question?.text ?? '')
     const [options, setOptions] = useState<string[]>(
       question?.options.map(o => o.text) ?? ['', '', '', '']
     )
     const [correctIndex, setCorrectIndex] = useState<number>(
       question ? question.options.findIndex(o => o.id === question.correctOptionId) : 0
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
       if (!text.trim()) { setError('请输入题目文本'); return false }
       if (options.some(o => !o.trim())) { setError('所有选项不能为空'); return false }
       return true
     }

     function handleSave() {
       if (!validate()) return
       const optionObjects = options.map((text, i) => ({
         id: question?.options[i]?.id ?? crypto.randomUUID(),
         text: text.trim(),
       }))
       const correctOptionId = optionObjects[correctIndex].id

       if (question) {
         updateQuestion(bankId, question.id, { text: text.trim(), options: optionObjects, correctOptionId })
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
             <Input.TextArea value={text} onChange={e => setText(e.target.value)} rows={2} maxLength={500} showCount />
           </Form.Item>
           <Form.Item label="选项">
             <Flex vertical gap={8}>
               <Radio.Group value={correctIndex} onChange={e => setCorrectIndex(e.target.value)}>
                 {options.map((opt, i) => (
                   <Flex key={i} gap={8} align="center" className="mb-2">
                     <Radio value={i} title="选为正确答案" />
                     <Input
                       value={opt}
                       onChange={e => { const updated = [...options]; updated[i] = e.target.value; setOptions(updated) }}
                       placeholder={`选项 ${String.fromCharCode(65 + i)}`}
                       maxLength={200}
                       style={{ flex: 1 }}
                     />
                     {options.length > 2 && (
                       <Button icon={<DeleteOutlined />} type="text" danger size="small" onClick={() => removeOption(i)} />
                     )}
                   </Flex>
                 ))}
               </Radio.Group>
               {options.length < 4 && (
                 <Button icon={<PlusOutlined />} type="dashed" size="small" onClick={addOption}>添加选项</Button>
               )}
             </Flex>
           </Form.Item>
           {error && <Typography.Text type="danger">{error}</Typography.Text>}
           <Flex gap={8} justify="flex-end">
             <Button onClick={onDone}>取消</Button>
             <Button type="primary" onClick={handleSave}>保存</Button>
           </Flex>
         </Form>
       </Flex>
     )
   }
   ```

**Files**: `src/pages/BankManagerPage/QuestionForm.tsx` (new file, ~80 lines)

---

### Subtask T036 – Implement Delete Confirmation Modals

**Purpose**: Prevent accidental deletion of banks and questions with Ant Design `Modal.confirm` dialogs.

**Steps**:
1. Both delete confirmations are already wired in `BankManagerPage.tsx` (T034) using `Modal.confirm({ ... })`.
2. Verify the confirmation text:
   - Bank deletion: `"确定要删除题库「${bank.name}」及其所有题目吗？此操作不可恢复。"`
   - Question deletion: `"确定要删除这道题目吗？"`
3. Both use `okType: 'danger'` for the red confirm button.
4. After bank deletion, `selectedBankId` updates to the next available bank (or null if none remain).

**Files**: No additional files — already in `BankManagerPage.tsx`

---

### Subtask T037 – Wire Export and Import Buttons

**Purpose**: Connect the export/import UI actions to the store methods.

**Steps**:
1. Export is already wired in `BankList.tsx` (T032): clicking the export icon calls `exportBank(bank.id)`.
2. Import is already wired in `BankList.tsx` (T032): hidden `<input type="file">` triggered by visible button, calls `importBank(file, onNameConflict)`.
3. Verify end-to-end:
   a. Click "导出" on any bank → browser downloads a `<name>.json` file
   b. Open the JSON file → validate it matches `BankExportSchema` structure
   c. Click "导入题库" → select the downloaded file → bank appears in list
   d. Import a file with name conflict → `window.confirm` appears → overwrite or cancel
   e. Import a non-JSON file → error toast shown via `message.error()`
4. Ensure the hidden file input's `ref.value` is cleared after each import so the same file can be re-imported.

**Files**: Verification only — code already in T032/T033 implementations

---

## Risks & Mitigations

- **Built-in bank not in localStorage**: `getAllBanks()` merges `DEFAULT_BANK` at runtime; ensure `BankList` renders it correctly as read-only.
- **Two-column layout on mobile**: On narrow screens (<480px), the side-by-side `BankList` + `BankEditor` layout will be too cramped. Address in WP08 (T038) — switch to stacked layout on mobile.
- **QuestionForm correctIndex after option removal**: When removing an option that was the correct one, reset `correctIndex` to 0. This is handled in `removeOption()`.
- **Bank name uniqueness**: Not enforced at the store level — `createBank` does not check for duplicates. If duplicate names cause UX confusion, add a validation check before `createBank()` call.

## Review Guidance

- [ ] Creating a bank → appears in list immediately; persists after page refresh
- [ ] Adding a question with text + 4 options + correct answer radio → question appears in list
- [ ] Editing a question → updated text and options saved
- [ ] Deleting a question → confirmation modal; question removed after confirm
- [ ] Deleting a bank → confirmation modal; bank + all questions removed after confirm
- [ ] Export bank → JSON file downloaded; contents match schema structure
- [ ] Import valid JSON → bank added to list
- [ ] Import invalid JSON → error message shown, no crash
- [ ] Built-in bank shows "(内置)" tag; no delete/edit question buttons visible

## Activity Log

- 2026-02-25T00:00:00Z – system – lane=planned – Prompt created.
