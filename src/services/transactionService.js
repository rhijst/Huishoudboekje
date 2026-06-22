import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase/firebase'

function transactionsRef(bookId) {
  return collection(db, 'books', bookId, 'transactions')
}

export function subscribeToTransactions(bookId, callback) {
  const q = query(transactionsRef(bookId), orderBy('date', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      date: d.data().date?.toDate() ?? new Date(),
    }))
    callback(transactions)
  })
}

export async function addTransaction(bookId, data) {
  const ref = await addDoc(transactionsRef(bookId), {
    amount: Number(data.amount),
    description: data.description ?? '',
    type: data.type, // 'income' | 'expense'
    categoryId: data.categoryId ?? null,
    date: data.date ? Timestamp.fromDate(new Date(data.date)) : serverTimestamp(),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateTransaction(bookId, transactionId, data) {
  await updateDoc(doc(db, 'books', bookId, 'transactions', transactionId), {
    amount: Number(data.amount),
    description: data.description ?? '',
    type: data.type,
    categoryId: data.categoryId ?? null,
    date: data.date ? Timestamp.fromDate(new Date(data.date)) : serverTimestamp(),
  })
}

export async function deleteTransaction(bookId, transactionId) {
  await deleteDoc(doc(db, 'books', bookId, 'transactions', transactionId))
}

export async function assignCategory(bookId, transactionId, categoryId) {
  await updateDoc(doc(db, 'books', bookId, 'transactions', transactionId), {
    categoryId: categoryId ?? null,
  })
}
