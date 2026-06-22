import { useDroppable } from '@dnd-kit/core'
import { ProgressBar } from '../common/ProgressBar'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import { deleteCategory } from '../../services/categoryService'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

export function CategoryCard({ category, bookId, spent, onEdit }) {
  const remaining = category.maxBudget - spent
  const isOver = spent > category.maxBudget
  const isNear = !isOver && category.maxBudget > 0 && (spent / category.maxBudget) >= 0.8

  // Nice-to-have 3.4: droppable area
  const { setNodeRef, isOver: isDragOver } = useDroppable({ id: category.id })

  async function handleDelete() {
    if (window.confirm(`Categorie "${category.name}" verwijderen?`)) {
      await deleteCategory(bookId, category.id)
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-xl border p-4 flex flex-col gap-3 transition-all ${isDragOver ? 'border-indigo-400 shadow-md bg-indigo-50' : 'border-slate-200'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <span className="font-semibold text-slate-800 text-sm">{category.name}</span>
        </div>
        <div className="flex items-center gap-1">
          {isOver && <Badge color="red">Over budget!</Badge>}
          {isNear && !isOver && <Badge color="yellow">Bijna op!</Badge>}
          <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => onEdit(category)}>✎</Button>
          <Button variant="ghost" className="text-xs px-2 py-1 text-red-500" onClick={handleDelete}>✕</Button>
        </div>
      </div>

      <ProgressBar value={spent} max={category.maxBudget} />

      <div className="flex justify-between text-xs text-slate-500">
        <span>Besteed: <strong className={isOver ? 'text-red-600' : 'text-slate-700'}>€{spent.toFixed(2)}</strong></span>
        <span>Budget: <strong>€{category.maxBudget.toFixed(2)}</strong></span>
        <span className={remaining < 0 ? 'text-red-600' : 'text-green-600'}>
          {remaining < 0 ? `€${Math.abs(remaining).toFixed(2)} over` : `€${remaining.toFixed(2)} over`}
        </span>
      </div>

      {category.endDate && (
        <p className="text-xs text-slate-400">
          Einddatum: {format(category.endDate, 'd MMMM yyyy', { locale: nl })}
        </p>
      )}

      {isDragOver && (
        <p className="text-xs text-indigo-600 font-medium text-center">Laat los om te koppelen</p>
      )}
    </div>
  )
}
