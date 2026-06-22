import { useEffect, useState } from 'react'
import { subscribeToTransactions } from '../services/transactionService'

export function useTransactions(bookId) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!bookId) {
      setTransactions([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsubscribe = subscribeToTransactions(bookId, (data) => {
      setTransactions(data)
      setLoading(false)
    })
    return unsubscribe
  }, [bookId])

  return { transactions, loading }
}
