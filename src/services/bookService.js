import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore'
import { db } from '../firebase/firebase'

const BOOKS_COLLECTION = 'books'

// Returns unsubscribe function — call it to stop listening
export function subscribeToBooks(userId, callback) {
  const q = query(
    collection(db, BOOKS_COLLECTION),
    where('archived', '==', false),
    where('memberIds', 'array-contains', userId)
  )
  return onSnapshot(q, (snapshot) => {
    const books = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(books)
  })
}

export function subscribeToArchivedBooks(userId, callback) {
  const q = query(
    collection(db, BOOKS_COLLECTION),
    where('archived', '==', true),
    where('memberIds', 'array-contains', userId)
  )
  return onSnapshot(q, (snapshot) => {
    const books = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(books)
  })
}

export function subscribeToBook(bookId, callback) {
  const ref = doc(db, BOOKS_COLLECTION, bookId)
  return onSnapshot(ref, (d) => {
    if (d.exists()) callback({ id: d.id, ...d.data() })
    else callback(null)
  })
}

export async function createBook(userId, data) {
  const ref = await addDoc(collection(db, BOOKS_COLLECTION), {
    name: data.name,
    description: data.description ?? '',
    ownerId: userId,
    memberIds: [userId],
    archived: false,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateBook(bookId, data) {
  await updateDoc(doc(db, BOOKS_COLLECTION, bookId), {
    name: data.name,
    description: data.description ?? '',
  })
}

export async function archiveBook(bookId) {
  await updateDoc(doc(db, BOOKS_COLLECTION, bookId), { archived: true })
}

export async function restoreBook(bookId) {
  await updateDoc(doc(db, BOOKS_COLLECTION, bookId), { archived: false })
}

export async function deleteBook(bookId) {
  await deleteDoc(doc(db, BOOKS_COLLECTION, bookId))
}

// Nice-to-have 1.4 — invite management
export async function addMember(bookId, userId) {
  await updateDoc(doc(db, BOOKS_COLLECTION, bookId), {
    memberIds: arrayUnion(userId),
  })
}

export async function removeMember(bookId, userId) {
  await updateDoc(doc(db, BOOKS_COLLECTION, bookId), {
    memberIds: arrayRemove(userId),
  })
}
