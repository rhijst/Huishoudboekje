import { useState } from 'react'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { addCategory, updateCategory } from '../../services/categoryService'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

export function CategoryForm({ bookId, category, onClose }) {
  const [name, setName] = useState(category?.name ?? '')
  const [maxBudget, setMaxBudget] = useState(category?.maxBudget?.toString() ?? '')
  const [color, setColor] = useState(category?.color ?? COLORS[0])
  const [endDate, setEndDate] = useState(
    category?.endDate ? category.endDate.toISOString().split('T')[0] : ''
  )
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Naam is verplicht'); return }
    if (!maxBudget || Number(maxBudget) <= 0) { setError('Voer een geldig budget in'); return }
    setLoading(true)
    try {
      const data = { name, maxBudget: Number(maxBudget), color, endDate: endDate || null }
      if (category) {
        await updateCategory(bookId, category.id, data)
      } else {
        await addCategory(bookId, data)
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
      <Input
        label="Naam *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Boodschappen"
        error={error}
      />
      <Input
        label="Maximaal budget (€) *"
        type="number"
        min="0.01"
        step="0.01"
        value={maxBudget}
        onChange={(e) => setMaxBudget(e.target.value)}
        placeholder="500.00"
      />
      <Input
        label="Einddatum (optioneel)"
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Kleur</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full border-2 transition-all"
              style={{
                backgroundColor: c,
                borderColor: color === c ? '#1e293b' : 'transparent',
                transform: color === c ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" onClick={onClose}>Annuleren</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Opslaan...' : category ? 'Bijwerken' : 'Aanmaken'}
        </Button>
      </div>
    </form>
  )
}
