# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RSVP/evite webpage hosted on Firebase Hosting. Built with Vite + React + TypeScript + CSS Modules. Uses Firebase Firestore for storing RSVP submissions.

## Commands

```bash
npm run dev          # Start dev server (localhost:5173)
npm run build        # Type check + production build
npm run preview      # Preview production build
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run lint         # ESLint
npm run type-check   # TypeScript check
```

## Configuration

### Event Config (`config.yaml`)

Edit `config.yaml` in the project root:

```yaml
event:
  title: "Your Event Name"
  date: "2026-03-15T18:00:00"    # ISO format
  location: "123 Main Street"
  description: "Event description..."

theme: "elegant"                  # elegant | festive | modern | garden
darkModeDefault: false
```

### Firebase Config (Environment Variables)

Firebase credentials are stored in environment variables for security.

1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase credentials from the Firebase Console

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or select existing)
3. Click "Add app" → Web (`</>`) → Copy the config values to `.env.local`
4. Go to Firestore Database → Create database
5. Set security rules (in `firestore.rules`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rsvps/{rsvpId} {
      allow create: if true;
      allow read, update, delete: if false;
    }
  }
}
```

6. Deploy rules: `firebase deploy --only firestore:rules`

## Architecture

```
config.yaml                       # Event config (title, date, theme)
.env.local                        # Firebase config (local dev, gitignored)
.env.example                      # Environment variable template
firestore.rules                   # Firestore security rules
vite.config.ts                    # Merges YAML + env vars into __EVENT_CONFIG__
src/
├── config.ts                     # Reads __EVENT_CONFIG__ from build
├── themes.ts                     # Theme color definitions
├── index.css                     # CSS variables + global styles
├── types/
│   └── rsvp.ts                   # RSVP form type definitions
├── services/
│   └── firebase.ts               # Firebase init + submitRSVP()
├── context/                      # ThemeContext + useTheme hook
└── components/
    └── RSVPForm/
        ├── index.ts              # Re-export
        ├── RSVPForm.tsx          # Custom RSVP form component
        ├── RSVPForm.module.css
        ├── RSVPForm.test.tsx
        ├── FormField.tsx         # Reusable form field wrapper
        ├── FormField.module.css
        └── useRSVPForm.ts        # Form state + validation hook
```

## RSVP Form Fields

- Name (required)
- Email (required)
- Attending (required, yes/no)
- Number of guests (conditional, shown if attending)
- Expected arrival time (conditional, required if attending, dropdown with 1-hour windows)
- Message/notes (optional)

## Styling

- **CSS Modules** for component styles (`*.module.css`)
- **CSS custom properties** for theming (defined in `index.css`, set by `applyTheme()`)
- Four theme presets in `themes.ts`: elegant, festive, modern, garden (each with light/dark)

## Testing

- **Vitest** + **React Testing Library**
- Tests co-located with components (`Component.test.tsx`)
- Config mock in `src/setupTests.ts` (required for `__EVENT_CONFIG__` global)
- Firebase is mocked in tests via `vi.mock()`

## Build System

- Config injected at build time via `__EVENT_CONFIG__` global (see `vite.config.ts`)
- Base path defaults to `/` for Firebase Hosting (configurable via `VITE_BASE_PATH`)

## Deployment

Deploy to Firebase Hosting:

```bash
npm run build && firebase deploy --only hosting
```

## Known Warnings

- `react-refresh/only-export-components` on ThemeContext.tsx - Expected for context files.
