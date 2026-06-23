import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Modal } from '../common/Modal'
import { BookForm } from './BookForm'
import { archiveBook, restoreBook, deleteBook } from '../../services/bookService'

export function BookCard({ book, userId, archived = false }) {
  const isOwner = book.ownerId === userId
  const [showEdit, setShowEdit] = useState(false)

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
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-800 text-base">{book.name}</h3>
            {book.description && (
              <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{book.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isOwner && <Badge color="indigo">Eigenaar</Badge>}
            {isOwner && (
              <button
                onClick={() => setShowEdit(true)}
                className="text-slate-400 hover:text-slate-600 transition-colors text-sm px-1"
                title="Bewerken"
              >
                ✎
              </button>
            )}
          </div>
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

      {isOwner && (
        <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Boekje bewerken">
          <BookForm book={book} onClose={() => setShowEdit(false)} />
        </Modal>
      )}
    </>
  )
}