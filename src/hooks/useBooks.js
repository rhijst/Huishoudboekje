import { useEffect, useState } from 'react'
import { subscribeToBooks, subscribeToArchivedBooks, subscribeToBook } from '../services/bookService'

export function useBooks(userId) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setBooks([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeToBooks(userId, (data) => {
      setBooks(data)
      setLoading(false)
    })
    return unsubscribe
  }, [userId])

  return { books, loading }
}

export function useArchivedBooks(userId) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setBooks([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeToArchivedBooks(userId, (data) => {
      setBooks(data)
      setLoading(false)
    })
    return unsubscribe
  }, [userId])

  return { books, loading }
}

export function useBook(bookId) {
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bookId) {
      setBook(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeToBook(bookId, (data) => {
      setBook(data)
      setLoading(false)
    })
    return unsubscribe
  }, [bookId])

  return { book, loading }
}
