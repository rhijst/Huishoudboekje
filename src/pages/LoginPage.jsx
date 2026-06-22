import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'

export function LoginPage() {
  const { user, login, error, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <span className="text-4xl">🏠</span>
          <h1 className="text-2xl font-bold text-slate-800 mt-2">Huishoudboekje</h1>
          <p className="text-slate-500 text-sm mt-1">Inloggen op je account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            placeholder="••••••••"
            required
          />
          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full justify-center">
            {loading ? 'Inloggen...' : 'Inloggen'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Nog geen account?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline font-medium">
            Registreren
          </Link>
        </p>
      </div>
    </div>
  )
}
