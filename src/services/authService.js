import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../firebase/firebase'

export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, callback)
}

export async function register(email, password, displayName) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(user, { displayName })
  return user
}

export async function login(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}

export async function logout() {
  await signOut(auth)
}

export function getCurrentUser() {
  return auth.currentUser
}
