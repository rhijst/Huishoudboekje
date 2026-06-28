import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TransactionItem } from '../../components/transactions/TransactionItem'
import * as txService from '../../services/transactionService'

vi.mock('../../services/transactionService', () => ({
  deleteTransaction: vi.fn(() => Promise.resolve()),
}))

const mockCategories = [{ id: 'cat-1', name: 'Boodschappen', color: '#6366f1' }]

const expenseTransaction = {
  id: 'tx-1',
  amount: 42.5,
  description: 'Albert Heijn',
  type: 'expense',
  date: new Date('2025-06-15'),
  categoryId: 'cat-1',
}

const incomeTransaction = {
  id: 'tx-2',
  amount: 1500,
  description: 'Salaris',
  type: 'income',
  date: new Date('2025-06-01'),
  categoryId: null,
}

function renderItem(transaction = expenseTransaction, props = {}) {
  return render(
    <TransactionItem
      transaction={transaction}
      bookId="book-1"
      onEdit={vi.fn()}
      categories={mockCategories}
      {...props}
    />
  )
}

describe('TransactionItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('toont beschrijving en bedrag van een uitgave', () => {
    renderItem()
    expect(screen.getByText('Albert Heijn')).toBeInTheDocument()
    expect(screen.getByText('- €42.50')).toBeInTheDocument()
  })

  it('toont bedrag met plus-teken voor inkomsten', () => {
    renderItem(incomeTransaction)
    expect(screen.getByText('+ €1500.00')).toBeInTheDocument()
  })

  it('toont categorienaam als badge', () => {
    renderItem()
    expect(screen.getByText('Boodschappen')).toBeInTheDocument()
  })

  it('toont de datum van de transactie', () => {
    renderItem()
    expect(screen.getByText(/15 jun\.? 2025/i)).toBeInTheDocument()
  })

  it('toont fallback beschrijving als description leeg is', () => {
    renderItem({ ...expenseTransaction, description: '' })
    expect(screen.getByText('Uitgave')).toBeInTheDocument()
  })

  it('verwijdert transactie na bevestiging', async () => {
    renderItem()
    fireEvent.click(screen.getByRole('button', { name: /✕/i }))
    await waitFor(() => {
      expect(txService.deleteTransaction).toHaveBeenCalledWith('book-1', 'tx-1')
    })
  })

  it('verwijdert NIET zonder bevestiging', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderItem()
    fireEvent.click(screen.getByRole('button', { name: /✕/i }))
    await waitFor(() => {
      expect(txService.deleteTransaction).not.toHaveBeenCalled()
    })
  })

  it('roept onEdit aan met de transactie bij klikken op bewerken', () => {
    const onEdit = vi.fn()
    renderItem(expenseTransaction, { onEdit })
    fireEvent.click(screen.getByRole('button', { name: /✎/i }))
    expect(onEdit).toHaveBeenCalledWith(expenseTransaction)
  })
})
