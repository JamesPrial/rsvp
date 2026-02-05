import { initializeApp, FirebaseApp } from 'firebase/app'
import {
  getFirestore,
  Firestore,
  doc,
  runTransaction,
  Timestamp,
} from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
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

export function generateVerificationToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export interface RSVPSubmission {
  name: string
  email: string
  attending: boolean
  guestCount?: number
  arrivalTime?: string
  message?: string
  submittedAt: Timestamp
  status: 'pending' | 'verified'
  verificationToken: string
  verificationTokenExpiry: Timestamp
  verifiedAt?: Timestamp
}

export async function submitRSVP(
  data: Omit<RSVPSubmission, 'submittedAt' | 'status' | 'verificationToken' | 'verificationTokenExpiry' | 'verifiedAt'>
): Promise<string> {
  const firestore = initializeFirebase()
  if (!firestore) {
    throw new Error('Firebase is not configured')
  }

  const normalizedEmail = normalizeEmailForDocId(data.email)
  const normalizedName = normalizeNameForDocId(data.name)
  const rsvpDocRef = doc(firestore, 'rsvps', normalizedEmail)
  const nameDocRef = doc(firestore, 'rsvp-names', normalizedName)

  const verificationToken = generateVerificationToken()
  const now = Timestamp.now()
  const expiry = Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000)

  try {
    await runTransaction(firestore, async (transaction) => {
      transaction.set(rsvpDocRef, {
        ...data,
        email: normalizedEmail,
        submittedAt: Timestamp.now(),
        status: 'pending',
        verificationToken,
        verificationTokenExpiry: expiry,
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

export async function verifyEmailToken(
  token: string
): Promise<{ success: boolean }> {
  if (!app) {
    initializeFirebase()
  }
  if (!app) {
    throw new Error('Firebase is not configured')
  }

  const functions = getFunctions(app)
  const verify = httpsCallable<{ token: string }, { success: boolean }>(
    functions,
    'verifyEmail'
  )
  const result = await verify({ token })
  return result.data
}
