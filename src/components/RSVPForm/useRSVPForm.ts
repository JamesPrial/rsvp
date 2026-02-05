import { useState, useCallback } from 'react'
import { RSVPFormData, RSVPFormErrors, SubmitStatus } from '../../types/rsvp'
import { submitRSVP, DuplicateRSVPError } from '../../services/firebase'

const initialFormData: RSVPFormData = {
  name: '',
  email: '',
  attending: '',
  guestCount: 1,
  arrivalTime: '',
  message: '',
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateForm(data: RSVPFormData): RSVPFormErrors {
  const errors: RSVPFormErrors = {}

  if (!data.name.trim()) {
    errors.name = 'Name is required'
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required'
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!data.attending) {
    errors.attending = 'Please indicate if you will be attending'
  }

  if (data.attending === 'yes') {
    if (data.guestCount < 1 || data.guestCount > 10) {
      errors.guestCount = 'Number of guests must be between 1 and 10'
    }
    if (!data.arrivalTime) {
      errors.arrivalTime = 'Please select an arrival time'
    }
  }

  return errors
}

export function useRSVPForm() {
  const [data, setData] = useState<RSVPFormData>(initialFormData)
  const [errors, setErrors] = useState<RSVPFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const updateField = useCallback(
    <K extends keyof RSVPFormData>(field: K, value: RSVPFormData[K]) => {
      setData((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
      if (submitStatus !== 'idle') {
        setSubmitStatus('idle')
        setSubmitError(null)
      }
    },
    [submitStatus]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const validationErrors = validateForm(data)
      setErrors(validationErrors)

      if (Object.keys(validationErrors).length > 0) {
        return
      }

      setIsSubmitting(true)
      setSubmitError(null)

      try {
        await submitRSVP({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          attending: data.attending === 'yes',
          ...(data.attending === 'yes' && {
            guestCount: data.guestCount,
            arrivalTime: data.arrivalTime,
          }),
          ...(data.message.trim() && { message: data.message.trim() }),
        })

        setSubmitStatus('success')
        setData(initialFormData)
      } catch (error) {
        setSubmitStatus('error')
        if (error instanceof DuplicateRSVPError) {
          setSubmitError(
            'This email or name has already been used to RSVP. If you need to update your response, please contact the host.'
          )
        } else {
          setSubmitError(
            error instanceof Error
              ? error.message
              : 'An error occurred while submitting your RSVP'
          )
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [data]
  )

  const resetForm = useCallback(() => {
    setData(initialFormData)
    setErrors({})
    setSubmitStatus('idle')
    setSubmitError(null)
  }, [])

  return {
    data,
    errors,
    isSubmitting,
    submitStatus,
    submitError,
    updateField,
    handleSubmit,
    resetForm,
  }
}
