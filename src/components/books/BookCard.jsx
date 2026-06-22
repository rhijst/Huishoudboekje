import { Link } from 'react-router-dom'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { archiveBook, restoreBook, deleteBook } from '../../services/bookService'

export function BookCard({ book, userId, archived = false }) {
  const isOwner = book.ownerId === userId

  async function handleArchive() {
    if (window.confirm(`"${book.name}" archiveren?`)) {
      await archiveBook(book.id)
    }
  }

  async function handleRestore() {
    await restoreBook(book.id)
  }

  async function handleDelete() {
    if (window.confirm(`"${book.name}" permanent verwijderen?`)) {
      await deleteBook(book.id)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-800 text-base">{book.name}</h3>
          {book.description && (
            <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{book.description}</p>
          )}
        </div>
        {isOwner && (
          <Badge color="indigo">Eigenaar</Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-slate-100">
        {!archived ? (
          <>
            <Link to={`/books/${book.id}`}>
              <Button variant="primary" className="text-xs px-3 py-1.5">Bekijken</Button>
            </Link>
            {isOwner && (
              <Button variant="secondary" className="text-xs px-3 py-1.5" onClick={handleArchive}>
                Archiveren
              </Button>
            )}
          </>
        ) : (
          <>
            {isOwner && (
              <Button variant="success" className="text-xs px-3 py-1.5" onClick={handleRestore}>
                Herstellen
              </Button>
            )}
            {isOwner && (
              <Button variant="danger" className="text-xs px-3 py-1.5" onClick={handleDelete}>
                Verwijderen
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
