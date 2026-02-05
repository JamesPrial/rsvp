# RSVP

Event RSVP webpage built with Vite + React + TypeScript. Uses Firebase Firestore for storing submissions and Firebase Hosting for deployment.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your event in `config.yaml`:
   ```yaml
   event:
     title: "Your Event Name"
     date: "2026-03-15T18:00:00"
     location: "123 Main Street"
     description: "Event description..."

   theme: "elegant"  # elegant | festive | modern | garden
   darkModeDefault: false
   ```

3. Set up Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a project and add a web app
   - Copy credentials to `.env.local` (see `.env.example`)
   - Enable Firestore Database

4. Create `.env.local` with your Firebase credentials:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

## Development

```bash
npm run dev
```

## Deploy

```bash
npm run build && firebase deploy --only hosting
```

## Tech Stack

- Vite + React + TypeScript
- CSS Modules with theme support
- Firebase Firestore + Hosting
- Email and name uniqueness enforced via Firestore security rules
