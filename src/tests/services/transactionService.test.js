import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
  assignCategory,
  subscribeToTransactions,
} from '../../services/transactionService'

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(() => 'mocked-tx-ref'),
  addDoc: vi.fn(() => Promise.resolve({ id: 'new-tx-id' })),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  onSnapshot: vi.fn((q, callback) => {
    callback({
      docs: [
        {
          id: 'tx-1',
          data: () => ({
            amount: 25.5,
            description: 'Boodschappen',
            type: 'expense',
            categoryId: 'cat-1',
            date: { toDate: () => new Date('2025-06-01') },
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

describe('transactionService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('addTransaction — voegt expense toe met juiste velden', async () => {
    const { addDoc } = await import('firebase/firestore')
    const id = await addTransaction('book-1', {
      amount: '50',
      description: 'Lunch',
      type: 'expense',
      date: '2025-06-15',
      categoryId: 'cat-1',
    })
    expect(id).toBe('new-tx-id')
    expect(addDoc).toHaveBeenCalledOnce()
    const [, data] = addDoc.mock.calls[0]
    expect(data.amount).toBe(50)
    expect(data.type).toBe('expense')
    expect(data.categoryId).toBe('cat-1')
  })

  it('addTransaction — amount wordt als Number opgeslagen', async () => {
    const { addDoc } = await import('firebase/firestore')
    await addTransaction('book-1', { amount: '99.99', type: 'income', date: '2025-06-01' })
    const [, data] = addDoc.mock.calls[0]
    expect(typeof data.amount).toBe('number')
    expect(data.amount).toBe(99.99)
  })

  it('updateTransaction — roept updateDoc aan met bijgewerkte data', async () => {
    const { updateDoc } = await import('firebase/firestore')
    await updateTransaction('book-1', 'tx-1', {
      amount: '30',
      description: 'Updated',
      type: 'expense',
      date: '2025-06-20',
    })
    expect(updateDoc).toHaveBeenCalledOnce()
    const [, data] = updateDoc.mock.calls[0]
    expect(data.amount).toBe(30)
    expect(data.description).toBe('Updated')
  })

  it('deleteTransaction — roept deleteDoc aan', async () => {
    const { deleteDoc } = await import('firebase/firestore')
    await deleteTransaction('book-1', 'tx-1')
    expect(deleteDoc).toHaveBeenCalledOnce()
  })

  it('assignCategory — wijzigt categoryId van transactie', async () => {
    const { updateDoc } = await import('firebase/firestore')
    await assignCategory('book-1', 'tx-1', 'cat-2')
    expect(updateDoc).toHaveBeenCalledOnce()
    const [, data] = updateDoc.mock.calls[0]
    expect(data.categoryId).toBe('cat-2')
  })

  it('assignCategory — null verwijdert categorie-koppeling', async () => {
    const { updateDoc } = await import('firebase/firestore')
    await assignCategory('book-1', 'tx-1', null)
    const [, data] = updateDoc.mock.calls[0]
    expect(data.categoryId).toBeNull()
  })

  it('subscribeToTransactions — callback ontvangt gemapte transacties', () => {
    const cb = vi.fn()
    const unsub = subscribeToTransactions('book-1', cb)
    expect(cb).toHaveBeenCalledOnce()
    const [txs] = cb.mock.calls[0]
    expect(txs).toHaveLength(1)
    expect(txs[0].id).toBe('tx-1')
    expect(txs[0].amount).toBe(25.5)
    expect(txs[0].date).toBeInstanceOf(Date)
    expect(typeof unsub).toBe('function')
  })
})
