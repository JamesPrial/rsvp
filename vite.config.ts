import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, existsSync } from 'fs'
import { parse } from 'yaml'

// Load event config from config.yaml (non-sensitive data only)
function loadYamlConfig() {
  const configPath = './config.yaml'
  if (!existsSync(configPath)) {
    console.warn('Warning: config.yaml not found. Copy config.yaml.example to config.yaml')
    return {
      event: {
        title: 'Event Title',
        date: '2026-01-01T12:00:00',
        location: 'Location',
        description: 'Description',
      },
      theme: 'modern',
      darkModeDefault: false,
    }
  }
  const content = readFileSync(configPath, 'utf-8')
  const parsed = parse(content)
  return {
    event: parsed.event,
    theme: parsed.theme,
    darkModeDefault: parsed.darkModeDefault,
  }
}

export default defineConfig(({ mode }) => {
  // Load environment variables (VITE_* prefix)
  const env = loadEnv(mode, process.cwd(), '')
  const yamlConfig = loadYamlConfig()

  // Merge YAML config with Firebase credentials from env vars
  const config = {
    ...yamlConfig,
    firebase: {
      apiKey: env.VITE_FIREBASE_API_KEY || '',
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: env.VITE_FIREBASE_APP_ID || '',
    },
  }

  // Base path: '/' for Firebase Hosting, '/rsvp/' for GitHub Pages
  const basePath = env.VITE_BASE_PATH || '/'

  return {
    plugins: [react()],
    base: basePath,
    define: {
      __EVENT_CONFIG__: JSON.stringify(config),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      css: true,
    },
  }
})
