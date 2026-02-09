# Anchor

**Anchor** — Find your anchor.

Modern, clean dating app experience with privacy-first intimacy matching and consent-aware boundaries.

## Features

- Intimacy Preferences with privacy controls (matching only, matches, public)
- Non-negotiables (must-haves + hard no’s) enforced as hard filters
- Discovery feed ranking using server-side filtering and scoring
- Firebase Auth, Firestore, Storage, and Cloud Functions

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set Expo env variables in `.env`:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

3. Start the app:

```bash
npm run start
```

## Firebase Functions

```bash
cd functions
npm install
npm run build
```

### Seed preference library

Deploy the `seedPreferenceLibrary` callable function and run it once from an admin client.

## Firestore Rules

Update Firestore rules with `firestore.rules`.

## Notes

- Intimacy preferences are opt-in and private by default.
- Intimacy preferences are 18+ only.
- Non-negotiables are enforced server-side. Unset preferences fail must-have checks for safety.
- TODO: Admin tooling for managing preference library and content review.
