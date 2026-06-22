import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'
import { nl } from 'date-fns/locale'

export function MonthlyLineChart({ transactions, selectedMonth }) {
  const start = startOfMonth(selectedMonth)
  const end = endOfMonth(selectedMonth)
  const days = eachDayOfInterval({ start, end })

  const data = days.map((day) => {
    const dayStr = format(day, 'd MMM', { locale: nl })
    const dayTransactions = transactions.filter(
      (t) => format(t.date, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    )
    const income = dayTransactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)
    const expense = dayTransactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
    return { day: dayStr, Inkomsten: income, Uitgaven: expense }
  })

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-700 mb-4 text-sm">
        Inkomsten & Uitgaven — {format(selectedMonth, 'MMMM yyyy', { locale: nl })}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={4} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `€${v}`} />
          <Tooltip formatter={(v) => `€${v.toFixed(2)}`} />
          <Legend />
          <Line type="monotone" dataKey="Inkomsten" stroke="#22c55e" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="Uitgaven" stroke="#ef4444" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
