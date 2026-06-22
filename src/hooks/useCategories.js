import { useEffect, useState } from 'react'
import { subscribeToCategories } from '../services/categoryService'

export function useCategories(bookId) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bookId) {
      setCategories([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeToCategories(bookId, (data) => {
      setCategories(data)
      setLoading(false)
    })
    return unsubscribe
  }, [bookId])

  return { categories, loading }
}
