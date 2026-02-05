import styles from './EventInfo.module.css'

interface EventInfoProps {
  title: string
  date: string
  location: string
  description: string
}

export function EventInfo({ title, date, location, description }: EventInfoProps) {
  const eventDate = new Date(date)

  const formattedDate = eventDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const formattedTime = eventDate.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <section className={styles.eventInfo}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.details}>
        <div className={styles.detail}>
          <span className={styles.label}>When</span>
          <span className={styles.value}>
            {formattedDate}
            <br />
            {formattedTime}
          </span>
        </div>

        <div className={styles.detail}>
          <span className={styles.label}>Where</span>
          <span className={styles.value}>{location}</span>
        </div>
      </div>

      {description && (
        <p className={styles.description}>{description}</p>
      )}
    </section>
  )
}
