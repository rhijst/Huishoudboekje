import { Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { useArchivedBooks } from '../hooks/useBooks'
import { BookCard } from '../components/books/BookCard'
import { Button } from '../components/common/Button'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Layout } from '../components/layout/Layout'

export function ArchivedBooksPage() {
  const { user } = useAuthContext()
  const { books, loading } = useArchivedBooks(user?.uid)

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gearchiveerde boekjes</h1>
          <p className="text-slate-500 text-sm mt-0.5">Herstel of verwijder gearchiveerde boekjes</p>
        </div>
        <Link to="/">
          <Button variant="secondary">← Terug</Button>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : books.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl">📦</span>
          <p className="text-slate-500 mt-4">Geen gearchiveerde boekjes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} userId={user.uid} archived />
          ))}
        </div>
      )}
    </Layout>
  )
}
