export function ProgressBar({ value, max, className = '' }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const isOver = value > max
  const isNearLimit = !isOver && percentage >= 80

  const barColor = isOver
    ? 'bg-red-500'
    : isNearLimit
    ? 'bg-yellow-500'
    : 'bg-indigo-500'

  return (
    <div className={`w-full bg-slate-200 rounded-full h-2 ${className}`}>
      <div
        className={`h-2 rounded-full transition-all ${barColor}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
