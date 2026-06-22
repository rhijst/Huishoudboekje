import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createBook,
  updateBook,
  archiveBook,
  restoreBook,
  deleteBook,
  addMember,
  removeMember,
  subscribeToBooks,
} from '../../services/bookService'

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(() => 'mocked-doc-ref'),
  addDoc: vi.fn(() => Promise.resolve({ id: 'new-book-id' })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  onSnapshot: vi.fn((q, callback) => {
    callback({
      docs: [
        {
          id: 'book-1',
          data: () => ({
            name: 'Gezinsbudget',
            description: 'Test boek',
            ownerId: 'user-1',
            memberIds: ['user-1'],
            archived: false,
          }),
        },
      ],
    })
    return vi.fn() // unsubscribe
  }),
  query: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-ts'),
  arrayUnion: vi.fn((v) => `union:${v}`),
  arrayRemove: vi.fn((v) => `remove:${v}`),
}))

vi.mock('../../firebase/firebase', () => ({
  db: {},
}))

describe('bookService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createBook — voegt boek toe met juiste data', async () => {
    const { addDoc } = await import('firebase/firestore')
    const id = await createBook('user-1', { name: 'Mijn budget', description: 'Test' })
    expect(id).toBe('new-book-id')
    expect(addDoc).toHaveBeenCalledOnce()
    const [, docData] = addDoc.mock.calls[0]
    expect(docData.name).toBe('Mijn budget')
    expect(docData.ownerId).toBe('user-1')
    expect(docData.memberIds).toContain('user-1')
    expect(docData.archived).toBe(false)
  })

  it('updateBook — roept updateDoc aan met naam en beschrijving', async () => {
    const { updateDoc } = await import('firebase/firestore')
    await updateBook('book-1', { name: 'Nieuw naam', description: 'Nieuwe beschrijving' })
    expect(updateDoc).toHaveBeenCalledOnce()
    const [, data] = updateDoc.mock.calls[0]
    expect(data.name).toBe('Nieuw naam')
    expect(data.description).toBe('Nieuwe beschrijving')
  })

  it('archiveBook — zet archived op true', async () => {
    const { updateDoc } = await import('firebase/firestore')
    await archiveBook('book-1')
    expect(updateDoc).toHaveBeenCalledOnce()
    const [, data] = updateDoc.mock.calls[0]
    expect(data.archived).toBe(true)
  })

  it('restoreBook — zet archived op false', async () => {
    const { updateDoc } = await import('firebase/firestore')
    await restoreBook('book-1')
    const [, data] = updateDoc.mock.calls[0]
    expect(data.archived).toBe(false)
  })

  it('deleteBook — roept deleteDoc aan', async () => {
    const { deleteDoc } = await import('firebase/firestore')
    await deleteBook('book-1')
    expect(deleteDoc).toHaveBeenCalledOnce()
  })

  it('addMember — voegt userId toe via arrayUnion', async () => {
    const { updateDoc, arrayUnion } = await import('firebase/firestore')
    await addMember('book-1', 'user-2')
    expect(arrayUnion).toHaveBeenCalledWith('user-2')
    expect(updateDoc).toHaveBeenCalledOnce()
  })

  it('removeMember — verwijdert userId via arrayRemove', async () => {
    const { updateDoc, arrayRemove } = await import('firebase/firestore')
    await removeMember('book-1', 'user-2')
    expect(arrayRemove).toHaveBeenCalledWith('user-2')
    expect(updateDoc).toHaveBeenCalledOnce()
  })

  it('subscribeToBooks — roept callback aan met gemapt boek', () => {
    const callback = vi.fn()
    const unsubscribe = subscribeToBooks('user-1', callback)
    expect(callback).toHaveBeenCalledOnce()
    const [books] = callback.mock.calls[0]
    expect(books).toHaveLength(1)
    expect(books[0].id).toBe('book-1')
    expect(books[0].name).toBe('Gezinsbudget')
    expect(typeof unsubscribe).toBe('function')
  })
})
