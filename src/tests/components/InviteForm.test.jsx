import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InviteForm } from '../../components/books/InviteForm'
import * as userService from '../../services/userService'
import * as bookService from '../../services/bookService'

vi.mock('../../services/userService', () => ({
  findUserByEmail: vi.fn(),
  findUsersByIds: vi.fn(() => Promise.resolve({ 'user-1': { email: 'eigenaar@test.nl' } })),
}))

vi.mock('../../services/bookService', () => ({
  addMember: vi.fn(() => Promise.resolve()),
  removeMember: vi.fn(() => Promise.resolve()),
}))

const mockBook = {
  id: 'book-1',
  ownerId: 'user-1',
  memberIds: ['user-1'],
}

function renderForm(book = mockBook) {
  return render(<InviteForm book={book} />)
}

describe('InviteForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('toont het e-mailinvoerveld en uitnodig-knop', () => {
    renderForm()
    expect(screen.getByPlaceholderText(/e-mailadres uitnodigen/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /uitnodigen/i })).toBeInTheDocument()
  })

  it('toont de huidige deelnemers', async () => {
    renderForm()
    await waitFor(() => {
      expect(screen.getByText('eigenaar@test.nl')).toBeInTheDocument()
    })
  })

  it('toont foutmelding als gebruiker niet bestaat', async () => {
    userService.findUserByEmail.mockResolvedValueOnce(null)
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByPlaceholderText(/e-mailadres/i), 'onbekend@test.nl')
    fireEvent.click(screen.getByRole('button', { name: /uitnodigen/i }))

    await waitFor(() => {
      expect(screen.getByText(/geen gebruiker gevonden/i)).toBeInTheDocument()
    })
    expect(bookService.addMember).not.toHaveBeenCalled()
  })

  it('toont foutmelding als gebruiker al lid is', async () => {
    userService.findUserByEmail.mockResolvedValueOnce({ id: 'user-1', email: 'eigenaar@test.nl' })
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByPlaceholderText(/e-mailadres/i), 'eigenaar@test.nl')
    fireEvent.click(screen.getByRole('button', { name: /uitnodigen/i }))

    await waitFor(() => {
      expect(screen.getByText(/al lid/i)).toBeInTheDocument()
    })
    expect(bookService.addMember).not.toHaveBeenCalled()
  })

  it('voegt lid toe bij geldig e-mailadres', async () => {
    userService.findUserByEmail.mockResolvedValueOnce({ id: 'user-2', email: 'nieuw@test.nl' })
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByPlaceholderText(/e-mailadres/i), 'nieuw@test.nl')
    fireEvent.click(screen.getByRole('button', { name: /uitnodigen/i }))

    await waitFor(() => {
      expect(bookService.addMember).toHaveBeenCalledWith('book-1', 'user-2')
    })
  })

  it('leegt het invoerveld na succesvolle uitnodiging', async () => {
    userService.findUserByEmail.mockResolvedValueOnce({ id: 'user-2', email: 'nieuw@test.nl' })
    const user = userEvent.setup()
    renderForm()

    const input = screen.getByPlaceholderText(/e-mailadres/i)
    await user.type(input, 'nieuw@test.nl')
    fireEvent.click(screen.getByRole('button', { name: /uitnodigen/i }))

    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('verwijdert een niet-eigenaar deelnemer na bevestiging', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    userService.findUsersByIds.mockResolvedValueOnce({
      'user-1': { email: 'eigenaar@test.nl' },
      'user-2': { email: 'lid@test.nl' },
    })
    const book = { ...mockBook, memberIds: ['user-1', 'user-2'] }
    renderForm(book)

    await waitFor(() => {
      expect(screen.getByText('lid@test.nl')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /verwijderen/i }))
    await waitFor(() => {
      expect(bookService.removeMember).toHaveBeenCalledWith('book-1', 'user-2')
    })
  })
})
