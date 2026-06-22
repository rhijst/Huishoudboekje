import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'
import { LoadingSpinner } from '../common/LoadingSpinner'

export function ProtectedRoute({ children }) {
  const { user } = useAuthContext()

  if (user === undefined) return <LoadingSpinner size="lg" />
  if (!user) return <Navigate to="/login" replace />

  return children
}
