export function TransactionStats({ transactions }) {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = income - expenses

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard
        label="Inkomsten"
        value={income}
        color="text-green-600"
        bg="bg-green-50 border-green-200"
        icon="↑"
      />
      <StatCard
        label="Uitgaven"
        value={expenses}
        color="text-red-600"
        bg="bg-red-50 border-red-200"
        icon="↓"
      />
      <StatCard
        label="Balans"
        value={balance}
        color={balance >= 0 ? 'text-indigo-600' : 'text-red-600'}
        bg={balance >= 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-red-50 border-red-200'}
        icon="="
      />
    </div>
  )
}

function StatCard({ label, value, color, bg, icon }) {
  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <div className={`text-xl font-bold ${color}`}>
        {icon} €{Math.abs(value).toFixed(2)}
      </div>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  )
}
