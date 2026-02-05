import { useState, useEffect } from 'react'
import { verifyEmailToken } from '../../services/firebase'
import styles from './VerifyPage.module.css'

type VerifyState = 'verifying' | 'success' | 'error'

export function VerifyPage() {
  const [state, setState] = useState<VerifyState>('verifying')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (!token) {
      setState('error')
      setErrorMessage('No verification token provided.')
      return
    }

    verifyEmailToken(token)
      .then(() => setState('success'))
      .catch((err: unknown) => {
        setState('error')
        const message =
          err instanceof Error ? err.message : 'Verification failed.'
        setErrorMessage(
          message.includes('not-found') || message.includes('expired')
            ? 'This verification link is invalid or has expired. Please submit a new RSVP.'
            : message
        )
      })
  }, [])

  return (
    <section className={styles.verifyPage}>
      <h2 className={styles.title}>Email Verification</h2>

      <div className={styles.content}>
        {state === 'verifying' && (
          <>
            <div className={styles.spinner} aria-label="Verifying" role="status" />
            <h3 className={styles.heading}>Verifying your RSVP...</h3>
            <p className={styles.text}>Please wait a moment.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <svg
              className={styles.successIcon}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              />
            </svg>
            <h3 className={styles.heading}>RSVP Confirmed!</h3>
            <p className={styles.text}>
              Your response has been verified. Thank you!
            </p>
            <a href="/" className={styles.link}>
              Return to event page
            </a>
          </>
        )}

        {state === 'error' && (
          <>
            <svg
              className={styles.errorIcon}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              />
            </svg>
            <h3 className={styles.heading}>Verification Failed</h3>
            <p className={styles.text}>{errorMessage}</p>
            <a href="/" className={styles.link}>
              Return to event page
            </a>
          </>
        )}
      </div>
    </section>
  )
}
