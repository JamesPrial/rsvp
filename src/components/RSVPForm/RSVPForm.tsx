import { useRSVPForm } from './useRSVPForm'
import { FormField } from './FormField'
import styles from './RSVPForm.module.css'

export function RSVPForm() {
  const {
    data,
    errors,
    isSubmitting,
    submitStatus,
    submitError,
    updateField,
    handleSubmit,
    resetForm,
  } = useRSVPForm()

  if (submitStatus === 'success') {
    return (
      <section className={styles.rsvpForm}>
        <h2 className={styles.title}>RSVP</h2>
        <div className={styles.successMessage} role="status">
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
          <h3 className={styles.successTitle}>Thank you for your RSVP!</h3>
          <p className={styles.successText}>
            We've received your response and look forward to seeing you!
          </p>
          <button type="button" onClick={resetForm} className={styles.button}>
            Submit another response
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.rsvpForm}>
      <h2 className={styles.title}>RSVP</h2>

      {submitStatus === 'error' && (
        <div className={styles.errorBanner} role="alert">
          <p>{submitError || 'An error occurred. Please try again.'}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <FormField label="Name" htmlFor="name" error={errors.name} required>
          <input
            type="text"
            id="name"
            name="name"
            value={data.name}
            onChange={(e) => updateField('name', e.target.value)}
            className={styles.input}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            disabled={isSubmitting}
            autoComplete="name"
          />
        </FormField>

        <FormField label="Email" htmlFor="email" error={errors.email} required>
          <input
            type="email"
            id="email"
            name="email"
            value={data.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={styles.input}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            disabled={isSubmitting}
            autoComplete="email"
          />
        </FormField>

        <FormField
          label="Will you be attending?"
          htmlFor="attending"
          error={errors.attending}
          required
        >
          <div
            className={styles.radioGroup}
            role="radiogroup"
            aria-labelledby="attending-label"
          >
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="attending"
                value="yes"
                checked={data.attending === 'yes'}
                onChange={(e) =>
                  updateField('attending', e.target.value as 'yes')
                }
                className={styles.radio}
                disabled={isSubmitting}
              />
              <span className={styles.radioText}>Yes, I'll be there!</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="attending"
                value="no"
                checked={data.attending === 'no'}
                onChange={(e) =>
                  updateField('attending', e.target.value as 'no')
                }
                className={styles.radio}
                disabled={isSubmitting}
              />
              <span className={styles.radioText}>Sorry, I can't make it</span>
            </label>
          </div>
        </FormField>

        {data.attending === 'yes' && (
          <>
            <FormField
              label="Number of guests (including yourself)"
              htmlFor="guestCount"
              error={errors.guestCount}
            >
              <input
                type="number"
                id="guestCount"
                name="guestCount"
                value={data.guestCount}
                onChange={(e) =>
                  updateField('guestCount', parseInt(e.target.value, 10) || 1)
                }
                className={styles.input}
                min={1}
                max={10}
                aria-invalid={!!errors.guestCount}
                aria-describedby={
                  errors.guestCount ? 'guestCount-error' : undefined
                }
                disabled={isSubmitting}
              />
            </FormField>

            <FormField
              label="Expected arrival time"
              htmlFor="arrivalTime"
              error={errors.arrivalTime}
              required
            >
              <select
                id="arrivalTime"
                name="arrivalTime"
                value={data.arrivalTime}
                onChange={(e) => updateField('arrivalTime', e.target.value)}
                className={styles.input}
                aria-invalid={!!errors.arrivalTime}
                aria-describedby={
                  errors.arrivalTime ? 'arrivalTime-error' : undefined
                }
                disabled={isSubmitting}
              >
                <option value="">Select arrival time</option>
                <option value="00:00-01:00">12:00 AM - 1:00 AM</option>
                <option value="01:00-02:00">1:00 AM - 2:00 AM</option>
                <option value="02:00-03:00">2:00 AM - 3:00 AM</option>
                <option value="03:00-04:00">3:00 AM - 4:00 AM</option>
                <option value="04:00-05:00">4:00 AM - 5:00 AM</option>
                <option value="05:00-06:00">5:00 AM - 6:00 AM</option>
                <option value="06:00-07:00">6:00 AM - 7:00 AM</option>
                <option value="07:00-08:00">7:00 AM - 8:00 AM</option>
                <option value="08:00-09:00">8:00 AM - 9:00 AM</option>
                <option value="09:00-10:00">9:00 AM - 10:00 AM</option>
                <option value="10:00-11:00">10:00 AM - 11:00 AM</option>
                <option value="11:00-12:00">11:00 AM - 12:00 PM</option>
                <option value="12:00-13:00">12:00 PM - 1:00 PM</option>
                <option value="13:00-14:00">1:00 PM - 2:00 PM</option>
                <option value="14:00-15:00">2:00 PM - 3:00 PM</option>
                <option value="15:00-16:00">3:00 PM - 4:00 PM</option>
                <option value="16:00-17:00">4:00 PM - 5:00 PM</option>
                <option value="17:00-18:00">5:00 PM - 6:00 PM</option>
                <option value="18:00-19:00">6:00 PM - 7:00 PM</option>
                <option value="19:00-20:00">7:00 PM - 8:00 PM</option>
                <option value="20:00-21:00">8:00 PM - 9:00 PM</option>
                <option value="21:00-22:00">9:00 PM - 10:00 PM</option>
                <option value="22:00-23:00">10:00 PM - 11:00 PM</option>
                <option value="23:00-00:00">11:00 PM - 12:00 AM</option>
              </select>
            </FormField>
          </>
        )}

        <FormField label="Message or special notes" htmlFor="message">
          <textarea
            id="message"
            name="message"
            value={data.message}
            onChange={(e) => updateField('message', e.target.value)}
            className={styles.textarea}
            rows={4}
            disabled={isSubmitting}
            placeholder="Dietary restrictions, accessibility needs, questions..."
          />
        </FormField>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Submitting...
            </>
          ) : (
            'Submit RSVP'
          )}
        </button>
      </form>
    </section>
  )
}
