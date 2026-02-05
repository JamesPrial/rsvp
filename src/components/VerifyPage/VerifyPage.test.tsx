import { render, screen, waitFor } from '@testing-library/react'
import { VerifyPage } from './VerifyPage'
import * as firebase from '../../services/firebase'

vi.mock('../../services/firebase', () => ({
  verifyEmailToken: vi.fn(),
  submitRSVP: vi.fn(),
  generateVerificationToken: vi.fn(() => 'a'.repeat(64)),
  DuplicateRSVPError: class DuplicateRSVPError extends Error {
    constructor() {
      super('An RSVP has already been submitted with this email or name')
      this.name = 'DuplicateRSVPError'
    }
  },
}))

describe('VerifyPage', () => {
  const originalLocation = window.location

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, search: '', pathname: '/verify' },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    })
  })

  it('shows verifying state initially', () => {
    window.location.search = '?token=abc123'
    vi.mocked(firebase.verifyEmailToken).mockImplementation(
      () => new Promise(() => {})
    )

    render(<VerifyPage />)

    expect(screen.getByText(/verifying your rsvp/i)).toBeInTheDocument()
  })

  it('shows success state after verification', async () => {
    window.location.search = '?token=abc123'
    vi.mocked(firebase.verifyEmailToken).mockResolvedValue({ success: true })

    render(<VerifyPage />)

    await waitFor(() => {
      expect(screen.getByText(/rsvp confirmed/i)).toBeInTheDocument()
    })
  })

  it('shows error state when token is missing', async () => {
    window.location.search = ''

    render(<VerifyPage />)

    await waitFor(() => {
      expect(screen.getByText(/verification failed/i)).toBeInTheDocument()
      expect(
        screen.getByText(/no verification token provided/i)
      ).toBeInTheDocument()
    })
  })

  it('shows error state when verification fails', async () => {
    window.location.search = '?token=expired-token'
    vi.mocked(firebase.verifyEmailToken).mockRejectedValue(
      new Error('not-found: Invalid or expired verification link.')
    )

    render(<VerifyPage />)

    await waitFor(() => {
      expect(screen.getByText(/verification failed/i)).toBeInTheDocument()
      expect(
        screen.getByText(/invalid or has expired/i)
      ).toBeInTheDocument()
    })
  })

  it('includes a link back to the event page on success', async () => {
    window.location.search = '?token=valid-token'
    vi.mocked(firebase.verifyEmailToken).mockResolvedValue({ success: true })

    render(<VerifyPage />)

    await waitFor(() => {
      expect(screen.getByText(/return to event page/i)).toBeInTheDocument()
    })

    const link = screen.getByText(/return to event page/i)
    expect(link).toHaveAttribute('href', '/')
  })
})
