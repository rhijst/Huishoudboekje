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

function categoriesRef(bookId) {
  return collection(db, 'books', bookId, 'categories')
}

export function subscribeToCategories(bookId, callback) {
  const q = query(categoriesRef(bookId), orderBy('name', 'asc'))
  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      endDate: d.data().endDate?.toDate() ?? null,
    }))
    callback(categories)
  })
}

export async function addCategory(bookId, data) {
  const ref = await addDoc(categoriesRef(bookId), {
    name: data.name,
    maxBudget: Number(data.maxBudget),
    color: data.color ?? '#6366f1',
    endDate: data.endDate ? Timestamp.fromDate(new Date(data.endDate)) : null,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateCategory(bookId, categoryId, data) {
  await updateDoc(doc(db, 'books', bookId, 'categories', categoryId), {
    name: data.name,
    maxBudget: Number(data.maxBudget),
    color: data.color ?? '#6366f1',
    endDate: data.endDate ? Timestamp.fromDate(new Date(data.endDate)) : null,
  })
}

export async function deleteCategory(bookId, categoryId) {
  await deleteDoc(doc(db, 'books', bookId, 'categories', categoryId))
}
