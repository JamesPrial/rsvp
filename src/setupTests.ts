import '@testing-library/jest-dom'

// Mock __EVENT_CONFIG__ global (injected by Vite from config.yaml)
;(globalThis as Record<string, unknown>).__EVENT_CONFIG__ = {
  event: {
    title: 'Test Event',
    date: '2026-03-15T18:00:00',
    location: '123 Test St',
    description: 'Test description',
  },
  firebase: {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id',
  },
  theme: 'modern',
  darkModeDefault: false,
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.getItem.mockReturnValue(null)
  localStorageMock.setItem.mockClear()
})
