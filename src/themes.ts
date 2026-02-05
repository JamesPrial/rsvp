export interface ThemeColors {
  bg: string
  bgSecondary: string
  text: string
  textSecondary: string
  primary: string
  primaryHover: string
  border: string
  shadow: string
}

export interface Theme {
  name: string
  fontHeading?: string
  light: ThemeColors
  dark: ThemeColors
}

export const themes: Record<string, Theme> = {
  elegant: {
    name: 'Elegant',
    fontHeading: 'Georgia, serif',
    light: {
      bg: '#fafafa',
      bgSecondary: '#f0f0f0',
      text: '#2d2d2d',
      textSecondary: '#6b6b6b',
      primary: '#8b7355',
      primaryHover: '#6d5a44',
      border: '#d4d4d4',
      shadow: 'rgba(0, 0, 0, 0.08)',
    },
    dark: {
      bg: '#1f1f1f',
      bgSecondary: '#2a2a2a',
      text: '#e8e8e8',
      textSecondary: '#a0a0a0',
      primary: '#c9a87c',
      primaryHover: '#d4b88e',
      border: '#3d3d3d',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
  },
  festive: {
    name: 'Festive',
    light: {
      bg: '#fffbf5',
      bgSecondary: '#fff5eb',
      text: '#3d2c1e',
      textSecondary: '#7d6b5d',
      primary: '#e85d04',
      primaryHover: '#d45203',
      border: '#f0d9c4',
      shadow: 'rgba(232, 93, 4, 0.1)',
    },
    dark: {
      bg: '#1a1512',
      bgSecondary: '#2a211a',
      text: '#f5ebe0',
      textSecondary: '#c4a98a',
      primary: '#ff8534',
      primaryHover: '#ff9a52',
      border: '#3d3329',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
  },
  modern: {
    name: 'Modern',
    light: {
      bg: '#ffffff',
      bgSecondary: '#f1f5f9',
      text: '#0f172a',
      textSecondary: '#64748b',
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      border: '#e2e8f0',
      shadow: 'rgba(59, 130, 246, 0.1)',
    },
    dark: {
      bg: '#0f172a',
      bgSecondary: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      primary: '#60a5fa',
      primaryHover: '#93c5fd',
      border: '#334155',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
  },
  garden: {
    name: 'Garden',
    light: {
      bg: '#f8fdf5',
      bgSecondary: '#ecf7e4',
      text: '#1a2e1a',
      textSecondary: '#4a6b4a',
      primary: '#2d6a4f',
      primaryHover: '#1b4332',
      border: '#c8e6c9',
      shadow: 'rgba(45, 106, 79, 0.1)',
    },
    dark: {
      bg: '#121a12',
      bgSecondary: '#1a261a',
      text: '#e8f5e9',
      textSecondary: '#a5d6a7',
      primary: '#4caf50',
      primaryHover: '#66bb6a',
      border: '#2e4a2e',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
  },
}

export function applyTheme(themeName: string, isDark: boolean): void {
  const theme = themes[themeName] || themes.modern
  const colors = isDark ? theme.dark : theme.light

  const root = document.documentElement
  root.style.setProperty('--color-bg', colors.bg)
  root.style.setProperty('--color-bg-secondary', colors.bgSecondary)
  root.style.setProperty('--color-text', colors.text)
  root.style.setProperty('--color-text-secondary', colors.textSecondary)
  root.style.setProperty('--color-primary', colors.primary)
  root.style.setProperty('--color-primary-hover', colors.primaryHover)
  root.style.setProperty('--color-border', colors.border)
  root.style.setProperty('--color-shadow', colors.shadow)

  if (theme.fontHeading) {
    root.style.setProperty('--font-family-heading', theme.fontHeading)
  } else {
    root.style.removeProperty('--font-family-heading')
  }

  root.setAttribute('data-theme', isDark ? 'dark' : 'light')
}
