import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAuth } from '../hooks/useAuth'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'

export function RegisterPage() {
  const { user, register, error, loading } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [localError, setLocalError] = useState('')

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) {
      setLocalError('Wachtwoorden komen niet overeen')
      return
    }
    setLocalError('')
    const newUser = await register(email, password, displayName)
    // Store user profile so invite lookup works
    if (newUser) {
      await setDoc(doc(db, 'users', newUser.uid), {
        email: newUser.email,
        displayName: displayName,
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <span className="text-4xl">🏠</span>
          <h1 className="text-2xl font-bold text-slate-800 mt-2">Account aanmaken</h1>
          <p className="text-slate-500 text-sm mt-1">Gratis registreren</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Naam"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Jan Janssen"
            required
          />
          <Input
            label="E-mailadres"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jij@voorbeeld.nl"
            required
          />
          <Input
            label="Wachtwoord"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimaal 6 tekens"
            minLength={6}
            required
          />
          <Input
            label="Wachtwoord bevestigen"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
          />
          {(error || localError) && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {localError || error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full justify-center">
            {loading ? 'Registreren...' : 'Registreren'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Al een account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  )
}
