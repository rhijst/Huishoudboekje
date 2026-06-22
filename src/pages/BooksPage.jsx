import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import { useBooks } from '../hooks/useBooks'
import { BookCard } from '../components/books/BookCard'
import { BookForm } from '../components/books/BookForm'
import { Modal } from '../components/common/Modal'
import { Button } from '../components/common/Button'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Layout } from '../components/layout/Layout'

export function BooksPage() {
  const { user } = useAuthContext()
  const { books, loading } = useBooks(user?.uid)
  const [showForm, setShowForm] = useState(false)

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mijn Huishoudboekjes</h1>
          <p className="text-slate-500 text-sm mt-0.5">Beheer al je budgetboekjes op één plek</p>
        </div>
        <div className="flex gap-2">
          <Link to="/archived">
            <Button variant="secondary">Archief</Button>
          </Link>
          <Button onClick={() => setShowForm(true)}>+ Nieuw boekje</Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : books.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl">📒</span>
          <p className="text-slate-500 mt-4 text-lg">Je hebt nog geen huishoudboekjes</p>
          <p className="text-slate-400 text-sm mt-1">Maak je eerste boekje aan om te beginnen</p>
          <Button className="mt-4" onClick={() => setShowForm(true)}>
            Eerste boekje aanmaken
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} userId={user.uid} />
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nieuw huishoudboekje">
        <BookForm onClose={() => setShowForm(false)} />
      </Modal>
    </Layout>
  )
}
