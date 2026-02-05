import { generateVerificationToken } from './firebase'

// Mock firebase/app and firebase/firestore to prevent initialization errors
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  runTransaction: vi.fn(),
  Timestamp: {
    now: vi.fn(() => ({ toMillis: () => Date.now() })),
    fromMillis: vi.fn((ms: number) => ({ toMillis: () => ms })),
  },
}))

vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(),
  httpsCallable: vi.fn(),
}))

describe('generateVerificationToken', () => {
  it('returns a 64-character hex string', () => {
    const token = generateVerificationToken()
    expect(token).toHaveLength(64)
    expect(token).toMatch(/^[0-9a-f]{64}$/)
  })

  it('generates unique tokens', () => {
    const token1 = generateVerificationToken()
    const token2 = generateVerificationToken()
    expect(token1).not.toBe(token2)
  })
})
