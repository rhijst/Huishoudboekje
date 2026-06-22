import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../common/Button'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-indigo-600 text-lg">
          <span>🏠</span>
          <span>Huishoudboekje</span>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 hidden sm:block">
              {user.displayName ?? user.email}
            </span>
            <Button variant="secondary" onClick={handleLogout}>
              Uitloggen
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
