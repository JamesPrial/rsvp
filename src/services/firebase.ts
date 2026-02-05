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

export class DuplicateRSVPError extends Error {
  constructor() {
    super('An RSVP has already been submitted with this email or name')
    this.name = 'DuplicateRSVPError'
  }
}

function normalizeEmailForDocId(email: string): string {
  return email.trim().toLowerCase()
}

function normalizeNameForDocId(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
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
  const normalizedName = normalizeNameForDocId(data.name)
  const rsvpDocRef = doc(firestore, 'rsvps', normalizedEmail)
  const nameDocRef = doc(firestore, 'rsvp-names', normalizedName)

  try {
    await runTransaction(firestore, async (transaction) => {
      transaction.set(rsvpDocRef, {
        ...data,
        email: normalizedEmail,
        submittedAt: Timestamp.now(),
      })

      transaction.set(nameDocRef, {
        email: normalizedEmail,
        name: data.name,
        createdAt: Timestamp.now(),
      })
    })
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code: string }).code === 'permission-denied'
    ) {
      throw new DuplicateRSVPError()
    }
    throw error
  }

  return normalizedEmail
}
