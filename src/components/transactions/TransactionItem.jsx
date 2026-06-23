import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { deleteTransaction } from '../../services/transactionService'

function formatAmount(amount, type) {
  const sign = type === 'income' ? '+' : '-'
  return `${sign} €${Math.abs(amount).toFixed(2)}`
}

export function TransactionItem({ transaction, bookId, onEdit, categories }) {
  const category = categories?.find((c) => c.id === transaction.categoryId)

  async function handleDelete() {
    if (window.confirm('Transactie verwijderen?')) {
      await deleteTransaction(bookId, transaction.id)
    }
  }

  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-slate-50 rounded-lg group">
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: category?.color ?? "#979797" }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">
          {transaction.description || (transaction.type === 'income' ? 'Inkomsten' : 'Uitgave')}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400">
            {format(transaction.date, 'd MMM yyyy', { locale: nl })}
          </span>
          {category && (
            <Badge color="slate" className="text-xs">
              {category.name}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
        >
          {formatAmount(transaction.amount, transaction.type)}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => onEdit(transaction)}>
            ✎
          </Button>
          <Button variant="ghost" className="text-xs px-2 py-1 text-red-500" onClick={handleDelete}>
            ✕
          </Button>
        </div>
      </div>
    </div>
  )
}
