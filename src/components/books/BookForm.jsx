import { useState } from 'react'
import { Input, Textarea } from '../common/Input'
import { Button } from '../common/Button'
import { createBook, updateBook } from '../../services/bookService'
import { useAuthContext } from '../../context/AuthContext'

export function BookForm({ book, onClose }) {
  const { user } = useAuthContext()
  const [name, setName] = useState(book?.name ?? '')
  const [description, setDescription] = useState(book?.description ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Naam is verplicht')
      return
    }
    setLoading(true)
    try {
      if (book) {
        await updateBook(book.id, { name, description })
      } else {
        await createBook(user.uid, { name, description })
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Naam *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Gezinsbudget 2025"
        error={error}
      />
      <Textarea
        label="Omschrijving"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Optionele beschrijving..."
      />
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" onClick={onClose}>Annuleren</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Opslaan...' : book ? 'Bijwerken' : 'Aanmaken'}
        </Button>
      </div>
    </form>
  )
}
