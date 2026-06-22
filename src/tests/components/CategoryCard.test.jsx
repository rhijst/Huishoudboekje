import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CategoryCard } from '../../components/categories/CategoryCard'
import * as catService from '../../services/categoryService'

// Mock dnd-kit
vi.mock('@dnd-kit/core', async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...mod,
    useDroppable: vi.fn(() => ({ setNodeRef: vi.fn(), isOver: false })),
  }
})

vi.mock('../../services/categoryService', () => ({
  deleteCategory: vi.fn(() => Promise.resolve()),
}))

const mockCategory = {
  id: 'cat-1',
  name: 'Boodschappen',
  maxBudget: 500,
  color: '#6366f1',
  endDate: null,
}

function renderCard(spent = 0, onEdit = vi.fn()) {
  return render(
    <CategoryCard
      category={mockCategory}
      bookId="book-1"
      spent={spent}
      onEdit={onEdit}
    />
  )
}

describe('CategoryCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('toont categorienaam en budget', () => {
    renderCard(200)
    expect(screen.getByText('Boodschappen')).toBeInTheDocument()
    expect(screen.getByText(/500/)).toBeInTheDocument()
    expect(screen.getByText(/200/)).toBeInTheDocument()
  })

  it('toont resterend budget (€300.00 over)', () => {
    renderCard(200)
    expect(screen.getByText(/€300\.00 over/)).toBeInTheDocument()
  })

  it('toont "Over budget!" badge als overschreden', () => {
    renderCard(600)
    expect(screen.getByText('Over budget!')).toBeInTheDocument()
  })

  it('toont "Bijna op!" badge bij 80%+ gebruik', () => {
    renderCard(420)
    expect(screen.getByText('Bijna op!')).toBeInTheDocument()
  })

  it('toont geen waarschuwing bij normaal gebruik', () => {
    renderCard(100)
    expect(screen.queryByText('Over budget!')).not.toBeInTheDocument()
    expect(screen.queryByText('Bijna op!')).not.toBeInTheDocument()
  })

  it('verwijdert categorie na bevestiging', async () => {
    renderCard(0)
    fireEvent.click(screen.getByRole('button', { name: /✕/i }))
    await waitFor(() => {
      expect(catService.deleteCategory).toHaveBeenCalledWith('book-1', 'cat-1')
    })
  })

  it('roept onEdit aan bij klikken op bewerken', () => {
    const onEdit = vi.fn()
    renderCard(0, onEdit)
    fireEvent.click(screen.getByRole('button', { name: /✎/i }))
    expect(onEdit).toHaveBeenCalledWith(mockCategory)
  })

  it('toont einddatum als aanwezig', () => {
    render(
      <CategoryCard
        category={{ ...mockCategory, endDate: new Date('2025-12-31') }}
        bookId="book-1"
        spent={0}
        onEdit={vi.fn()}
      />
    )
    expect(screen.getByText(/31 december 2025/i)).toBeInTheDocument()
  })
})
