import { createContext, useState, useEffect, ReactNode } from 'react'
import { applyTheme, themes } from '../themes'
import { eventConfig } from '../config'

export interface ThemeContextValue {
  isDark: boolean
  toggleTheme: () => void
  themeName: string
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'rsvp-dark-mode'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return eventConfig.darkModeDefault

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      return stored === 'true'
    }
    return eventConfig.darkModeDefault
  })

  const themeName = eventConfig.theme in themes ? eventConfig.theme : 'modern'

  useEffect(() => {
    applyTheme(themeName, isDark)
    localStorage.setItem(STORAGE_KEY, String(isDark))
  }, [isDark, themeName])

  const toggleTheme = () => setIsDark((prev) => !prev)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, themeName }}>
      {children}
    </ThemeContext.Provider>
  )
}
