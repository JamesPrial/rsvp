export interface RSVPFormData {
  name: string
  email: string
  attending: 'yes' | 'no' | ''
  guestCount: number
  arrivalTime: string
  message: string
}

export interface RSVPFormErrors {
  name?: string
  email?: string
  attending?: string
  guestCount?: string
  arrivalTime?: string
  message?: string
}

export type SubmitStatus = 'idle' | 'success' | 'error'
