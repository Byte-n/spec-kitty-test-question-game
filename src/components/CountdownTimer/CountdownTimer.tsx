import { useEffect, useRef, useState } from 'react'
import { Progress } from 'antd'

interface Props {
  totalSeconds: number
  onExpire: () => void
  active: boolean // false when answer submitted — freezes timer
}

function useCountdown(totalSeconds: number, onExpire: () => void, active: boolean) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    setRemaining(totalSeconds)
  }, [totalSeconds])

  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          onExpireRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [active, totalSeconds])

  return remaining
}

export default function CountdownTimer({ totalSeconds, onExpire, active }: Props) {
  const remaining = useCountdown(totalSeconds, onExpire, active)
  const percent = Math.round((remaining / totalSeconds) * 100)
  const color = remaining > 10 ? '#52c41a' : remaining > 5 ? '#faad14' : '#ff4d4f'

  return (
    <div className="flex flex-col items-center gap-1">
      <Progress
        type="circle"
        percent={percent}
        size={64}
        strokeColor={color}
        format={() => <span className="text-lg font-bold">{remaining}</span>}
      />
    </div>
  )
}
