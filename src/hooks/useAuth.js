import { useAuthContext } from '../context/AuthContext'
import { login, logout, register } from '../services/authService'
import { useState } from 'react'

export function useAuth() {
  const { user } = useAuthContext()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleRegister(email, password, displayName) {
    setLoading(true)
    setError(null)
    try {
      await register(email, password, displayName)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(email, password) {
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await logout()
  }

  return { user, error, loading, register: handleRegister, login: handleLogin, logout: handleLogout }
}
