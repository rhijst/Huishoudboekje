import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryForm } from '../../components/categories/CategoryForm'
import * as catService from '../../services/categoryService'

vi.mock('../../services/categoryService', () => ({
  addCategory: vi.fn(() => Promise.resolve('new-cat-id')),
  updateCategory: vi.fn(() => Promise.resolve()),
}))

function renderForm(props = {}) {
  return render(
    <CategoryForm bookId="book-1" category={null} onClose={vi.fn()} {...props} />
  )
}

describe('CategoryForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rendert verplichte velden voor nieuwe categorie', () => {
    renderForm()
    expect(screen.getByLabelText(/naam/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/maximaal budget/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /aanmaken/i })).toBeInTheDocument()
  })

  it('toont validatiefout als naam leeg is', async () => {
    renderForm()
    fireEvent.click(screen.getByRole('button', { name: /aanmaken/i }))
    await waitFor(() => {
      expect(screen.getByText(/naam is verplicht/i)).toBeInTheDocument()
    })
    expect(catService.addCategory).not.toHaveBeenCalled()
  })

  it('toont validatiefout als budget ongeldig is', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByLabelText(/naam/i), 'Boodschappen')
    fireEvent.click(screen.getByRole('button', { name: /aanmaken/i }))
    await waitFor(() => {
      expect(screen.getByText(/geldig budget/i)).toBeInTheDocument()
    })
  })

  it('maakt nieuwe categorie aan met naam en budget', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderForm({ onClose })

    await user.type(screen.getByLabelText(/naam/i), 'Boodschappen')
    await user.type(screen.getByLabelText(/maximaal budget/i), '500')
    fireEvent.click(screen.getByRole('button', { name: /aanmaken/i }))

    await waitFor(() => {
      expect(catService.addCategory).toHaveBeenCalledWith(
        'book-1',
        expect.objectContaining({ name: 'Boodschappen', maxBudget: 500 })
      )
      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  it('vult bestaande waarden in bij bewerken', () => {
    const category = { id: 'cat-1', name: 'Sport', maxBudget: 100, color: '#10b981', endDate: null }
    renderForm({ category })
    expect(screen.getByLabelText(/naam/i)).toHaveValue('Sport')
    expect(screen.getByLabelText(/maximaal budget/i)).toHaveValue(100)
    expect(screen.getByRole('button', { name: /bijwerken/i })).toBeInTheDocument()
  })

  it('werkt bestaande categorie bij via updateCategory', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const category = { id: 'cat-1', name: 'Sport', maxBudget: 100, color: '#10b981', endDate: null }
    renderForm({ category, onClose })

    await user.clear(screen.getByLabelText(/naam/i))
    await user.type(screen.getByLabelText(/naam/i), 'Gezondheid')
    fireEvent.click(screen.getByRole('button', { name: /bijwerken/i }))

    await waitFor(() => {
      expect(catService.updateCategory).toHaveBeenCalledWith(
        'book-1',
        'cat-1',
        expect.objectContaining({ name: 'Gezondheid', maxBudget: 100 })
      )
      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  it('roept onClose aan bij annuleren', () => {
    const onClose = vi.fn()
    renderForm({ onClose })
    fireEvent.click(screen.getByRole('button', { name: /annuleren/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
