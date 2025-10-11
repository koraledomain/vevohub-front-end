## Feature Flags

See docs/FEATURE_FLAGS.md for copy-paste examples (before/after for routes, buttons, and nav).
## Node.js

- Use Node 18.x or newer (project sets engines ">=18.18").

## Install & Run

### Using Yarn (recommended)
- yarn install
- yarn dev

### Using npm
- npm install
- npm run dev

## Useful scripts
- yarn typecheck
- yarn lint
- yarn check (typecheck + lint)
- yarn build

## Feature flags
- Local flags defined in `src/config/featureFlags.ts`.
- Hook: `useFeatureFlag('login')` gates the login route (true to enable).
