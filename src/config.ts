/**
 * Event Configuration
 *
 * Configuration is loaded from config.yaml at build time.
 * Edit config.yaml to customize your event (not this file).
 */

declare const __EVENT_CONFIG__: {
  event: {
    title: string
    date: string
    location: string
    description: string
  }
  firebase: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
  }
  theme: string
  darkModeDefault: boolean
}

const config = __EVENT_CONFIG__

export const eventConfig = {
  title: config.event.title,
  date: config.event.date,
  location: config.event.location,
  description: config.event.description.trim(),
  theme: config.theme as 'elegant' | 'festive' | 'modern' | 'garden',
  darkModeDefault: config.darkModeDefault,
}

export const firebaseConfig = config.firebase
