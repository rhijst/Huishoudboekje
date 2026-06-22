import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionForm } from '../../components/transactions/TransactionForm'
import * as txService from '../../services/transactionService'

vi.mock('../../services/transactionService', () => ({
  addTransaction: vi.fn(() => Promise.resolve('new-id')),
  updateTransaction: vi.fn(() => Promise.resolve()),
}))

const mockCategories = [
  { id: 'cat-1', name: 'Boodschappen', color: '#6366f1' },
]

function renderForm(props = {}) {
  return render(
    <TransactionForm
      bookId="book-1"
      transaction={null}
      categories={mockCategories}
      onClose={vi.fn()}
      {...props}
    />
  )
}

describe('TransactionForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rendert formulier met verplichte velden', () => {
    renderForm()
    expect(screen.getByLabelText(/bedrag/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/datum/i)).toBeInTheDocument()
  })

  it('datum staat standaard op vandaag', () => {
    renderForm()
    const today = new Date().toISOString().split('T')[0]
    expect(screen.getByLabelText(/datum/i)).toHaveValue(today)
  })

  it('toont validatiefout als bedrag leeg is', async () => {
    renderForm()
    fireEvent.click(screen.getByRole('button', { name: /toevoegen/i }))
    await waitFor(() => {
      expect(screen.getByText(/geldig bedrag/i)).toBeInTheDocument()
    })
  })

  it('roept addTransaction aan met juiste data bij nieuwe transactie', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.clear(screen.getByLabelText(/bedrag/i))
    await user.type(screen.getByLabelText(/bedrag/i), '25.50')
    fireEvent.click(screen.getByRole('button', { name: /toevoegen/i }))

    await waitFor(() => {
      expect(txService.addTransaction).toHaveBeenCalledWith(
        'book-1',
        expect.objectContaining({ amount: '25.5', type: 'expense' })
      )
    })
  })

  it('stelt type in op "inkomsten" bij klikken op inkomsten-knop', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: /inkomsten/i }))
    await user.type(screen.getByLabelText(/bedrag/i), '100')
    fireEvent.click(screen.getByRole('button', { name: /toevoegen/i }))
    await waitFor(() => {
      expect(txService.addTransaction).toHaveBeenCalledWith(
        'book-1',
        expect.objectContaining({ type: 'income' })
      )
    })
  })

  it('roept updateTransaction aan bij bestaande transactie', async () => {
    const user = userEvent.setup()
    const existingTx = {
      id: 'tx-1',
      amount: 50,
      description: 'Oud',
      type: 'expense',
      date: new Date('2025-06-01'),
      categoryId: null,
    }
    renderForm({ transaction: existingTx })

    await user.clear(screen.getByLabelText(/bedrag/i))
    await user.type(screen.getByLabelText(/bedrag/i), '75')
    fireEvent.click(screen.getByRole('button', { name: /bijwerken/i }))

    await waitFor(() => {
      expect(txService.updateTransaction).toHaveBeenCalledWith(
        'book-1',
        'tx-1',
        expect.objectContaining({ amount: '75' })
      )
    })
  })

  it('toont categorie-keuze als er categorieën zijn', () => {
    renderForm()
    expect(screen.getByLabelText(/categorie/i)).toBeInTheDocument()
    expect(screen.getByText('Boodschappen')).toBeInTheDocument()
  })

  it('roept onClose aan bij annuleren', async () => {
    const onClose = vi.fn()
    renderForm({ onClose })
    fireEvent.click(screen.getByRole('button', { name: /annuleren/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
