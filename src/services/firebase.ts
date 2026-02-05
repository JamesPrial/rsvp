import { initializeApp, FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  Firestore,
  collection,
  addDoc,
  Timestamp,
} from 'firebase/firestore'
import { firebaseConfig } from '../config'

let app: FirebaseApp | null = null
let db: Firestore | null = null

export function initializeFirebase(): Firestore | null {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('Firebase not configured. RSVP submissions will not be saved.')
    return null
  }

  if (!app) {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
  }
  return db
}

export interface RSVPSubmission {
  name: string
  email: string
  attending: boolean
  guestCount?: number
  arrivalTime?: string
  message?: string
  submittedAt: Timestamp
}

export async function submitRSVP(
  data: Omit<RSVPSubmission, 'submittedAt'>
): Promise<string> {
  const firestore = initializeFirebase()
  if (!firestore) {
    throw new Error('Firebase is not configured')
  }

  const docRef = await addDoc(collection(firestore, 'rsvps'), {
    ...data,
    submittedAt: Timestamp.now(),
  })

  return docRef.id
}
