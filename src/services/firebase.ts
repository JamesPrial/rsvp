import { initializeApp, FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  Firestore,
  doc,
  runTransaction,
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

export class DuplicateEmailError extends Error {
  constructor() {
    super('An RSVP has already been submitted with this email address')
    this.name = 'DuplicateEmailError'
  }
}

function normalizeEmailForDocId(email: string): string {
  return email.trim().toLowerCase()
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

  const normalizedEmail = normalizeEmailForDocId(data.email)
  const docRef = doc(firestore, 'rsvps', normalizedEmail)

  await runTransaction(firestore, async (transaction) => {
    const docSnapshot = await transaction.get(docRef)

    if (docSnapshot.exists()) {
      throw new DuplicateEmailError()
    }

    transaction.set(docRef, {
      ...data,
      email: normalizedEmail,
      submittedAt: Timestamp.now(),
    })
  })

  return normalizedEmail
}
