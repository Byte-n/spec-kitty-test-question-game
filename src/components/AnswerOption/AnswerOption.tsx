interface Props {
  text: string
  index: number // 0–3 → A/B/C/D label
  state: 'default' | 'selected' | 'correct' | 'wrong'
  disabled: boolean
  onClick: () => void
}

const LABELS = ['A', 'B', 'C', 'D']

const STATE_CLASSES: Record<Props['state'], string> = {
  default: 'bg-white border-gray-200 text-gray-800 hover:border-blue-400 hover:bg-blue-50',
  selected: 'bg-blue-50 border-blue-400 text-blue-800',
  correct: 'bg-green-50 border-green-500 text-green-800',
  wrong: 'bg-red-50 border-red-400 text-red-700 line-through',
}

export default function AnswerOption({ text, index, state, disabled, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full text-left rounded-xl border-2 px-4 py-3 transition-all
        min-h-[44px] cursor-pointer
        ${STATE_CLASSES[state]}
        ${disabled && state === 'default' ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span className="font-bold mr-3">{LABELS[index]}</span>
      {text}
    </button>
  )
}
