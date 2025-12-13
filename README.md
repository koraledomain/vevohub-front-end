## Feature Flags

See docs/FEATURE_FLAGS.md for copy-paste examples (before/after for routes, buttons, and nav).
## Node.js

- Use Node 20.19.0+ or 22.12.0+ (required for vite@7.1.11)
- Project sets engines ">=18.18" but vite requires "^20.19.0 || >=22.12.0"

## Install & Run

### Using Yarn (recommended)
- yarn install
- yarn dev

### Using npm
- npm install
- npm run dev

## Adding Dependencies to Workspaces

This project uses Yarn workspaces. To add a dependency to a specific workspace, use:

```bash
yarn workspace <workspace-name> add <package-name>
```

**Examples:**
- Add to `langchain-service`: `yarn workspace langchain-service add <package-name>`
- Add to `socket-io-server`: `yarn workspace socket-io-server add <package-name>`
- Add dev dependency: `yarn workspace langchain-service add -D <package-name>`

**Note:** Always run `yarn install` from the root directory after adding dependencies to ensure workspace dependencies are properly linked.

## Useful scripts
- yarn typecheck
- yarn lint
- yarn check (typecheck + lint)
- yarn build

## Feature flags
- Local flags defined in `src/config/featureFlags.ts`.
- Hook: `useFeatureFlag('login')` gates the login route (true to enable).
