import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookForm } from '../../components/books/BookForm'
import * as bookService from '../../services/bookService'

vi.mock('../../services/bookService', () => ({
  createBook: vi.fn(() => Promise.resolve('new-book-id')),
  updateBook: vi.fn(() => Promise.resolve()),
}))

vi.mock('../../context/AuthContext', () => ({
  useAuthContext: () => ({ user: { uid: 'user-1' } }),
}))

function renderForm(props = {}) {
  return render(<BookForm book={null} onClose={vi.fn()} {...props} />)
}

describe('BookForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rendert lege velden voor een nieuw boek', () => {
    renderForm()
    expect(screen.getByLabelText(/naam/i)).toHaveValue('')
    expect(screen.getByRole('button', { name: /aanmaken/i })).toBeInTheDocument()
  })

  it('toont validatiefout als naam leeg is', async () => {
    renderForm()
    fireEvent.click(screen.getByRole('button', { name: /aanmaken/i }))
    await waitFor(() => {
      expect(screen.getByText(/naam is verplicht/i)).toBeInTheDocument()
    })
    expect(bookService.createBook).not.toHaveBeenCalled()
  })

  it('maakt nieuw boek aan met naam en beschrijving', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderForm({ onClose })

    await user.type(screen.getByLabelText(/naam/i), 'Gezinsbudget')
    await user.type(screen.getByLabelText(/omschrijving/i), 'Ons gezinsbudget')
    fireEvent.click(screen.getByRole('button', { name: /aanmaken/i }))

    await waitFor(() => {
      expect(bookService.createBook).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({ name: 'Gezinsbudget', description: 'Ons gezinsbudget' })
      )
      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  it('vult bestaande waarden in bij bewerken', () => {
    const book = { id: 'book-1', name: 'Oud boek', description: 'Oude beschrijving' }
    renderForm({ book })
    expect(screen.getByLabelText(/naam/i)).toHaveValue('Oud boek')
    expect(screen.getByRole('button', { name: /bijwerken/i })).toBeInTheDocument()
  })

  it('werkt bestaand boek bij via updateBook', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const book = { id: 'book-1', name: 'Oud boek', description: '' }
    renderForm({ book, onClose })

    await user.clear(screen.getByLabelText(/naam/i))
    await user.type(screen.getByLabelText(/naam/i), 'Nieuw boek')
    fireEvent.click(screen.getByRole('button', { name: /bijwerken/i }))

    await waitFor(() => {
      expect(bookService.updateBook).toHaveBeenCalledWith(
        'book-1',
        expect.objectContaining({ name: 'Nieuw boek' })
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
