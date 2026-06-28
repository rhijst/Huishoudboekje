import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register, login, logout, subscribeToAuthState } from '../../services/authService'

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(() =>
    Promise.resolve({ user: { uid: 'user-1', email: 'test@test.nl' } })
  ),
  signInWithEmailAndPassword: vi.fn(() =>
    Promise.resolve({ user: { uid: 'user-1', email: 'test@test.nl' } })
  ),
  signOut: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn((auth, cb) => {
    cb({ uid: 'user-1', email: 'test@test.nl' })
    return vi.fn()
  }),
  updateProfile: vi.fn(() => Promise.resolve()),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => 'mocked-doc-ref'),
  setDoc: vi.fn(() => Promise.resolve()),
}))

vi.mock('../../firebase/firebase', () => ({
  auth: {},
  db: {},
}))

describe('authService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('register — maakt gebruiker aan en slaat profiel op in Firestore', async () => {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
    const { setDoc } = await import('firebase/firestore')

    const user = await register('test@test.nl', 'wachtwoord', 'Test Gebruiker')

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@test.nl',
      'wachtwoord'
    )
    expect(updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ uid: 'user-1' }),
      { displayName: 'Test Gebruiker' }
    )
    expect(setDoc).toHaveBeenCalledOnce()
    expect(user.uid).toBe('user-1')
  })

  it('login — retourneert user bij juiste credentials', async () => {
    const { signInWithEmailAndPassword } = await import('firebase/auth')

    const user = await login('test@test.nl', 'wachtwoord')

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'test@test.nl',
      'wachtwoord'
    )
    expect(user.uid).toBe('user-1')
    expect(user.email).toBe('test@test.nl')
  })

  it('logout — roept signOut aan', async () => {
    const { signOut } = await import('firebase/auth')
    await logout()
    expect(signOut).toHaveBeenCalledOnce()
  })

  it('subscribeToAuthState — callback ontvangt ingelogde gebruiker', () => {
    const cb = vi.fn()
    const unsub = subscribeToAuthState(cb)
    expect(cb).toHaveBeenCalledWith(expect.objectContaining({ uid: 'user-1' }))
    expect(typeof unsub).toBe('function')
  })
})
