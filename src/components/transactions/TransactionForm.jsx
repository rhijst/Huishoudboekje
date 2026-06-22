import { useState } from 'react'
import { format } from 'date-fns'
import { Input, Select, Textarea } from '../common/Input'
import { Button } from '../common/Button'
import { addTransaction, updateTransaction } from '../../services/transactionService'

export function TransactionForm({ bookId, transaction, categories, onClose }) {
  const today = format(new Date(), 'yyyy-MM-dd')

  const [type, setType] = useState(transaction?.type ?? 'expense')
  const [amount, setAmount] = useState(transaction?.amount?.toString() ?? '')
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [date, setDate] = useState(
    transaction?.date ? format(transaction.date, 'yyyy-MM-dd') : today
  )
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Voer een geldig bedrag in')
      return
    }
    setLoading(true)
    try {
      const data = { amount, description, type, date, categoryId: categoryId || null }
      if (transaction) {
        await updateTransaction(bookId, transaction.id, data)
      } else {
        await addTransaction(bookId, data)
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${type === 'expense' ? 'bg-red-50 border-red-300 text-red-700' : 'border-slate-200 text-slate-500'}`}
        >
          Uitgave
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${type === 'income' ? 'bg-green-50 border-green-300 text-green-700' : 'border-slate-200 text-slate-500'}`}
        >
          Inkomsten
        </button>
      </div>

      <Input
        label="Bedrag (€) *"
        type="number"
        min="0.01"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.00"
        error={error}
      />
      <Input
        label="Datum"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <Textarea
        label="Omschrijving"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Omschrijving..."
        rows={2}
      />
      {categories?.length > 0 && (
        <Select
          label="Categorie"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Geen categorie</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      )}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" onClick={onClose}>Annuleren</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Opslaan...' : transaction ? 'Bijwerken' : 'Toevoegen'}
        </Button>
      </div>
    </form>
  )
}
