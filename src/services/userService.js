import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'

export async function findUserByEmail(email) {
    const q = query(collection(db, 'users'), where('email', '==', email.trim()))
    const snap = await getDocs(q)
    if (snap.empty) return null
    const d = snap.docs[0]
    return { id: d.id, ...d.data() }
}

export async function findUsersByIds(ids) {
    if (!ids.length) return {}
    const results = await Promise.all(ids.map((id) => getDoc(doc(db, 'users', id))))
    return Object.fromEntries(
        results.filter((d) => d.exists()).map((d) => [d.id, d.data()])
    )
}