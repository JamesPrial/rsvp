import { Layout } from './components/Layout'
import { EventInfo } from './components/EventInfo'
import { RSVPForm } from './components/RSVPForm'
import { ThemeToggle } from './components/ThemeToggle'
import { eventConfig } from './config'

export function App() {
  return (
    <Layout>
      <ThemeToggle />
      <EventInfo
        title={eventConfig.title}
        date={eventConfig.date}
        location={eventConfig.location}
        description={eventConfig.description}
      />
      <RSVPForm />
    </Layout>
  )
}
