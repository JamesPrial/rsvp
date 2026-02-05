import { Layout } from './components/Layout'
import { EventInfo } from './components/EventInfo'
import { RSVPForm } from './components/RSVPForm'
import { ThemeToggle } from './components/ThemeToggle'
import { VerifyPage } from './components/VerifyPage'
import { eventConfig } from './config'

export function App() {
  const isVerifyPage = window.location.pathname.endsWith('/verify')

  if (isVerifyPage) {
    return (
      <Layout>
        <ThemeToggle />
        <VerifyPage />
      </Layout>
    )
  }

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
