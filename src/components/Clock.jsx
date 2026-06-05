import { useState, useEffect } from 'react'

function Clock({ settings }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const is24h = settings.clockFormat === '24h'
  let hours = time.getHours()
  const period = hours >= 12 ? 'PM' : 'AM'
  if (!is24h) hours = hours % 12 || 12

  const h = String(hours).padStart(2, '0')
  const m = String(time.getMinutes()).padStart(2, '0')
  const s = String(time.getSeconds()).padStart(2, '0')
  const timeStr = settings.showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`

  const dateStr = time.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <div className="clock">
      <div className="clock-time">
        {timeStr}
        {!is24h && <span className="clock-period">{period}</span>}
      </div>
      {settings.showDate && <div className="clock-date">{dateStr}</div>}
    </div>
  )
}

export default Clock
