import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  addCategory,
  updateCategory,
  deleteCategory,
  subscribeToCategories,
} from '../../services/categoryService'

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(() => 'mocked-cat-ref'),
  addDoc: vi.fn(() => Promise.resolve({ id: 'new-cat-id' })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  onSnapshot: vi.fn((q, callback) => {
    callback({
      docs: [
        {
          id: 'cat-1',
          data: () => ({
            name: 'Boodschappen',
            maxBudget: 500,
            color: '#6366f1',
            endDate: null,
          }),
        },
      ],
    })
    return vi.fn()
  }),
  query: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-ts'),
  Timestamp: { fromDate: vi.fn((d) => ({ seconds: d.getTime() / 1000 })) },
}))

vi.mock('../../firebase/firebase', () => ({ db: {} }))

describe('categoryService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('addCategory — maakt categorie aan met verplichte velden', async () => {
    const { addDoc } = await import('firebase/firestore')
    const id = await addCategory('book-1', {
      name: 'Boodschappen',
      maxBudget: 500,
      color: '#6366f1',
      endDate: null,
    })
    expect(id).toBe('new-cat-id')
    const [, data] = addDoc.mock.calls[0]
    expect(data.name).toBe('Boodschappen')
    expect(data.maxBudget).toBe(500)
    expect(data.color).toBe('#6366f1')
    expect(data.endDate).toBeNull()
  })

  it('addCategory — maxBudget wordt als Number opgeslagen', async () => {
    const { addDoc } = await import('firebase/firestore')
    await addCategory('book-1', { name: 'Test', maxBudget: '300', color: '#fff' })
    const [, data] = addDoc.mock.calls[0]
    expect(typeof data.maxBudget).toBe('number')
    expect(data.maxBudget).toBe(300)
  })

  it('addCategory — endDate wordt omgezet naar Timestamp', async () => {
    const { addDoc, Timestamp } = await import('firebase/firestore')
    await addCategory('book-1', { name: 'Test', maxBudget: 100, endDate: '2025-12-31' })
    expect(Timestamp.fromDate).toHaveBeenCalledOnce()
    const [, data] = addDoc.mock.calls[0]
    expect(data.endDate).toBeDefined()
  })

  it('updateCategory — roept updateDoc aan met nieuwe waarden', async () => {
    const { updateDoc } = await import('firebase/firestore')
    await updateCategory('book-1', 'cat-1', {
      name: 'Gezondheid',
      maxBudget: 200,
      color: '#10b981',
      endDate: null,
    })
    expect(updateDoc).toHaveBeenCalledOnce()
    const [, data] = updateDoc.mock.calls[0]
    expect(data.name).toBe('Gezondheid')
    expect(data.maxBudget).toBe(200)
  })

  it('deleteCategory — roept deleteDoc aan', async () => {
    const { deleteDoc } = await import('firebase/firestore')
    await deleteCategory('book-1', 'cat-1')
    expect(deleteDoc).toHaveBeenCalledOnce()
  })

  it('subscribeToCategories — callback ontvangt gemapte categorieën', () => {
    const cb = vi.fn()
    const unsub = subscribeToCategories('book-1', cb)
    expect(cb).toHaveBeenCalledOnce()
    const [cats] = cb.mock.calls[0]
    expect(cats).toHaveLength(1)
    expect(cats[0].id).toBe('cat-1')
    expect(cats[0].name).toBe('Boodschappen')
    expect(cats[0].endDate).toBeNull()
    expect(typeof unsub).toBe('function')
  })
})
