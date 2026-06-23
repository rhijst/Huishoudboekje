import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts'

export function CategoryBarChart({ transactions, categories }) {
  const data = categories.map((cat) => {
    const spent = transactions
      .filter((tx) => tx.categoryId === cat.id && tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0)
    return {
      name: cat.name,
      Besteed: spent,
      Budget: cat.maxBudget,
      color: cat.color,
    }
  }).filter((d) => d.Besteed > 0 || d.Budget > 0)

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 text-center text-slate-400 text-sm">
        Nog geen categoriegegevens beschikbaar
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-700 mb-4 text-sm">Uitgaven per categorie</h3>
      <ResponsiveContainer width="100%" height={250}>
        {console.log(data)} 
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `€${value}`} />
          <Tooltip formatter={(value) => `€${value.toFixed(2)}`} />
          <Bar dataKey="Besteed" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
          <Bar dataKey="Budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
