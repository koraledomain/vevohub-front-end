## Feature Flags (Copy-Paste Guide)

Goal: Turn features on/off without editing lots of code. You only need `src/config/featureFlags.ts` and `useFeatureFlag(name)`.

TL;DR
- Add a flag in `src/config/featureFlags.ts`.
- Gate the route with a redirect when OFF.
- Disable or hide buttons/links when OFF.

---

1) Add a new flag

Before (no flag):
```ts
// src/config/featureFlags.ts
export const featureFlags = {
  login: false,
  profilesPage: false,
} as const;
```

After (add a new flag `awesomePage`):
```ts
// src/config/featureFlags.ts
export const featureFlags = {
  login: false,
  profilesPage: false,
  awesomePage: false, // NEW
} as const;
```

Use it:
```ts
import { useFeatureFlag } from 'src/hooks/use-feature-flag';
const isAwesomeEnabled = useFeatureFlag('awesomePage');
```

---

2) Gate a route (hard-block access when OFF)

Before (route always renders):
```tsx
// src/routes/sections/auth.tsx
<AuthClassicLayout>
  <JwtLoginPage />
</AuthClassicLayout>
```

After (redirect when flag is OFF):
```tsx
// src/routes/sections/auth.tsx
import { Navigate } from 'react-router-dom';
import { useFeatureFlag } from 'src/hooks/use-feature-flag';

function LoginGate() {
  const enabled = useFeatureFlag('login');
  if (!enabled) return <Navigate to="/" replace />; // blocks access
  return (
    <AuthClassicLayout>
      <JwtLoginPage />
    </AuthClassicLayout>
  );
}
```

Result: When `login` is false, users can’t open the page (redirected to `/`).

---

3) Disable a button/link (soft-block access from UI)

Before (button always enabled):
```tsx
// src/layouts/common/login-button.tsx
<Button href={PATH_AFTER_LOGIN}>Login</Button>
```

After (disabled when OFF and no navigation):
```tsx
// src/layouts/common/login-button.tsx
const enabled = useFeatureFlag('login');
<Button
  href={enabled ? PATH_AFTER_LOGIN : '#'}
  disabled={!enabled}
>
  Login
</Button>
```

Result: Button is visibly disabled and can’t navigate when the feature is OFF.

---

4) Hide or disable a nav item

Option A: Hide when OFF
```tsx
// src/layouts/main/config-navigation.tsx
import { useFeatureFlag } from 'src/hooks/use-feature-flag';

export const navConfig = (() => {
  const loginEnabled = useFeatureFlag('login');
  return [
    { title: 'Home', path: '/' },
    ...(loginEnabled ? [{ title: 'Log In', path: paths.auth.jwt.login }] : []),
  ];
})();
```

Option B: Show but disable link
```tsx
// If your nav item is rendered as a Button/Link, use the same pattern:
const loginEnabled = useFeatureFlag('login');
<Link href={loginEnabled ? paths.auth.jwt.login : '#'} aria-disabled={!loginEnabled}>
  Log In
</Link>
```

Result: Users can’t click into disabled features from the navbar.

---

5) Flip a flag ON/OFF
```ts
// src/config/featureFlags.ts
export const featureFlags = {
  login: true, // turn feature ON (set false to turn OFF)
  profilesPage: false,
} as const;
```

That’s it. Use: `const enabled = useFeatureFlag('yourFlag')` and then either redirect (hard gate) or disable/hide UI (soft gate).


