import { describe, it, expect, vi, beforeEach } from 'vitest'
import { findUserByEmail, findUsersByIds } from '../../services/userService'

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(() =>
    Promise.resolve({
      empty: false,
      docs: [
        {
          id: 'user-1',
          data: () => ({ email: 'jan@test.nl', displayName: 'Jan' }),
        },
      ],
    })
  ),
  doc: vi.fn(() => 'mocked-doc-ref'),
  getDoc: vi.fn((ref) =>
    Promise.resolve({
      exists: () => true,
      id: ref === 'mocked-doc-ref' ? 'user-1' : 'user-2',
      data: () => ({ email: 'jan@test.nl', displayName: 'Jan' }),
    })
  ),
}))

vi.mock('../../firebase/firebase', () => ({ db: {} }))

describe('userService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('findUserByEmail — retourneert gebruiker bij bestaand e-mailadres', async () => {
    const user = await findUserByEmail('jan@test.nl')
    expect(user).not.toBeNull()
    expect(user.id).toBe('user-1')
    expect(user.email).toBe('jan@test.nl')
    expect(user.displayName).toBe('Jan')
  })

  it('findUserByEmail — retourneert null als gebruiker niet bestaat', async () => {
    const { getDocs } = await import('firebase/firestore')
    getDocs.mockResolvedValueOnce({ empty: true, docs: [] })

    const user = await findUserByEmail('onbekend@test.nl')
    expect(user).toBeNull()
  })

  it('findUserByEmail — trimt witruimte uit e-mailadres', async () => {
    const { where } = await import('firebase/firestore')
    await findUserByEmail('  jan@test.nl  ')
    expect(where).toHaveBeenCalledWith('email', '==', 'jan@test.nl')
  })

  it('findUsersByIds — retourneert lege object bij lege array', async () => {
    const result = await findUsersByIds([])
    expect(result).toEqual({})
  })

  it('findUsersByIds — retourneert map van id naar gebruikersdata', async () => {
    const { getDoc, doc } = await import('firebase/firestore')
    doc.mockReturnValueOnce('ref-user-1').mockReturnValueOnce('ref-user-2')
    getDoc
      .mockResolvedValueOnce({ exists: () => true, id: 'user-1', data: () => ({ displayName: 'Jan' }) })
      .mockResolvedValueOnce({ exists: () => true, id: 'user-2', data: () => ({ displayName: 'Piet' }) })

    const result = await findUsersByIds(['user-1', 'user-2'])
    expect(Object.keys(result)).toHaveLength(2)
    expect(result['user-1'].displayName).toBe('Jan')
    expect(result['user-2'].displayName).toBe('Piet')
  })

  it('findUsersByIds — slaat niet-bestaande gebruikers over', async () => {
    const { getDoc, doc } = await import('firebase/firestore')
    doc.mockReturnValueOnce('ref-user-1').mockReturnValueOnce('ref-ghost')
    getDoc
      .mockResolvedValueOnce({ exists: () => true, id: 'user-1', data: () => ({ displayName: 'Jan' }) })
      .mockResolvedValueOnce({ exists: () => false, id: 'ghost', data: () => ({}) })

    const result = await findUsersByIds(['user-1', 'ghost'])
    expect(Object.keys(result)).toHaveLength(1)
    expect(result['user-1']).toBeDefined()
    expect(result['ghost']).toBeUndefined()
  })
})
