import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BookCard } from '../../components/books/BookCard'
import * as bookService from '../../services/bookService'

vi.mock('../../services/bookService', () => ({
  archiveBook: vi.fn(() => Promise.resolve()),
  restoreBook: vi.fn(() => Promise.resolve()),
  deleteBook: vi.fn(() => Promise.resolve()),
}))

const mockBook = {
  id: 'book-1',
  name: 'Gezinsbudget',
  description: 'Ons gezinsbudget',
  ownerId: 'user-1',
  memberIds: ['user-1'],
  archived: false,
}

function renderCard(props = {}) {
  return render(
    <MemoryRouter>
      <BookCard book={mockBook} userId="user-1" {...props} />
    </MemoryRouter>
  )
}

describe('BookCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('toont naam en beschrijving', () => {
    renderCard()
    expect(screen.getByText('Gezinsbudget')).toBeInTheDocument()
    expect(screen.getByText('Ons gezinsbudget')).toBeInTheDocument()
  })

  it('toont eigenaar-badge voor de eigenaar', () => {
    renderCard()
    expect(screen.getByText('Eigenaar')).toBeInTheDocument()
  })

  it('toont geen eigenaar-badge voor niet-eigenaar', () => {
    renderCard({ userId: 'user-2' })
    expect(screen.queryByText('Eigenaar')).not.toBeInTheDocument()
  })

  it('toont "Bekijken" link voor niet-gearchiveerd boek', () => {
    renderCard()
    expect(screen.getByRole('link', { name: /bekijken/i })).toBeInTheDocument()
  })

  it('archiveert boek wanneer eigenaar op archiveren klikt', async () => {
    renderCard()
    fireEvent.click(screen.getByRole('button', { name: /archiveren/i }))
    await waitFor(() => {
      expect(bookService.archiveBook).toHaveBeenCalledWith('book-1')
    })
  })

  it('herstelt gearchiveerd boek', async () => {
    renderCard({ archived: true })
    fireEvent.click(screen.getByRole('button', { name: /herstellen/i }))
    await waitFor(() => {
      expect(bookService.restoreBook).toHaveBeenCalledWith('book-1')
    })
  })

  it('verwijdert gearchiveerd boek na bevestiging', async () => {
    renderCard({ archived: true })
    fireEvent.click(screen.getByRole('button', { name: /verwijderen/i }))
    await waitFor(() => {
      expect(bookService.deleteBook).toHaveBeenCalledWith('book-1')
    })
  })

  it('archiveert NIET zonder bevestiging', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderCard()
    fireEvent.click(screen.getByRole('button', { name: /archiveren/i }))
    await waitFor(() => {
      expect(bookService.archiveBook).not.toHaveBeenCalled()
    })
  })

  it('niet-eigenaar ziet geen archiveer-knop', () => {
    renderCard({ userId: 'user-99' })
    expect(screen.queryByRole('button', { name: /archiveren/i })).not.toBeInTheDocument()
  })
})
