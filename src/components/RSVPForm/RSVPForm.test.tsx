import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RSVPForm } from './RSVPForm'
import * as firebase from '../../services/firebase'

// Mock Firebase service
vi.mock('../../services/firebase', () => ({
  submitRSVP: vi.fn(),
  DuplicateRSVPError: class DuplicateRSVPError extends Error {
    constructor() {
      super('An RSVP has already been submitted with this email or name')
      this.name = 'DuplicateRSVPError'
    }
  },
}))

describe('RSVPForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all required form fields', () => {
    render(<RSVPForm />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByText(/will you be attending/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('renders RSVP heading', () => {
    render(<RSVPForm />)

    expect(screen.getByRole('heading', { name: 'RSVP' })).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<RSVPForm />)

    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    expect(
      screen.getByText(/please indicate if you will be attending/i)
    ).toBeInTheDocument()
  })

  it('shows conditional fields when attending is yes', async () => {
    const user = userEvent.setup()
    render(<RSVPForm />)

    expect(screen.queryByLabelText(/number of guests/i)).not.toBeInTheDocument()

    await user.click(screen.getByLabelText(/yes, i'll be there/i))

    expect(screen.getByLabelText(/number of guests/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/expected arrival time/i)).toBeInTheDocument()
  })

  it('hides conditional fields when attending is no', async () => {
    const user = userEvent.setup()
    render(<RSVPForm />)

    await user.click(screen.getByLabelText(/yes, i'll be there/i))
    expect(screen.getByLabelText(/number of guests/i)).toBeInTheDocument()

    await user.click(screen.getByLabelText(/sorry, i can't make it/i))
    expect(screen.queryByLabelText(/number of guests/i)).not.toBeInTheDocument()
  })

  it('submits form successfully', async () => {
    const user = userEvent.setup()
    vi.mocked(firebase.submitRSVP).mockResolvedValue('doc-123')

    render(<RSVPForm />)

    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByLabelText(/yes, i'll be there/i))
    await user.selectOptions(
      screen.getByLabelText(/expected arrival time/i),
      '18:00-19:00'
    )
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.getByText(/thank you for your rsvp/i)).toBeInTheDocument()
    })

    expect(firebase.submitRSVP).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      attending: true,
      guestCount: 1,
      arrivalTime: '18:00-19:00',
    })
  })

  it('shows error message on submission failure', async () => {
    const user = userEvent.setup()
    vi.mocked(firebase.submitRSVP).mockRejectedValue(new Error('Network error'))

    render(<RSVPForm />)

    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByLabelText(/sorry, i can't make it/i))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  it('shows user-friendly error for duplicate RSVP submission', async () => {
    const user = userEvent.setup()
    const { DuplicateRSVPError } = await import('../../services/firebase')
    vi.mocked(firebase.submitRSVP).mockRejectedValue(new DuplicateRSVPError())

    render(<RSVPForm />)

    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByLabelText(/sorry, i can't make it/i))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/this email or name has already been used/i)
      ).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<RSVPForm />)

    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'invalid-email')
    await user.click(screen.getByLabelText(/sorry, i can't make it/i))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(
      await screen.findByText(/valid email address/i)
    ).toBeInTheDocument()
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    let resolveSubmit: (value: string) => void
    vi.mocked(firebase.submitRSVP).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve
        })
    )

    render(<RSVPForm />)

    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByLabelText(/sorry, i can't make it/i))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(screen.getByText(/submitting/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled()

    resolveSubmit!('doc-123')

    await waitFor(() => {
      expect(screen.getByText(/thank you/i)).toBeInTheDocument()
    })
  })

  it('allows submitting another response after success', async () => {
    const user = userEvent.setup()
    vi.mocked(firebase.submitRSVP).mockResolvedValue('doc-123')

    render(<RSVPForm />)

    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByLabelText(/sorry, i can't make it/i))
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.getByText(/thank you/i)).toBeInTheDocument()
    })

    await user.click(screen.getByText(/submit another response/i))

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toHaveValue('')
  })
})
