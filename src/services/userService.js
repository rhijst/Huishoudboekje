import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/firebase'

/**
 * Finds a registered user by their email address.
 * Returns the user's document id (= Firebase Auth uid) and data, or null if not found.
 */
export async function findUserByEmail(email) {
    const q = query(collection(db, 'users'), where('email', '==', email.trim()))
    const snap = await getDocs(q)
    if (snap.empty) return null
    const doc = snap.docs[0]
    return { id: doc.id, ...doc.data() }
}