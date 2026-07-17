# Browse-first flow (no forced login)

Guests can explore everything. A sign-up only appears when they try to ACT.

## How it works
- `components/auth/AuthGate.tsx` — wraps the whole app (via `app/providers.tsx`),
  tracks the session, and renders the glass modal.
- `useAuthGate()` gives you:
  - `requireAuth(action, reason?)` — runs `action()` if logged in; otherwise opens
    the sign-up modal, and runs `action()` automatically right after they sign up.
  - `openAuth('login' | 'signup', reason?)` — open the modal directly.
  - `user`, `loading`, `signOut()`.

## Public pages (no account)
- `app/page.tsx` — landing (hero + featured roommates + services).
- `app/browse/page.tsx` — marketplace with Roommates / Food / Services tabs.

## Gating an action (example)
```tsx
const { requireAuth } = useAuthGate();

<button onClick={() => requireAuth(
  () => { window.location.href = '/student/roommates'; },
  'Sign up to message this student.'
)}>Message</button>
```
If the guest isn't signed in, the glass card slides up with that reason; after they
sign up, they're taken straight where they were going.

## Auth + sessions
- `lib/supabase/client.ts` — single browser client, session in `localStorage`
  (`storageKey: 'handout-auth'`). Survives navigation; a guest can browse then sign up
  without losing their place.
- `middleware.ts` — passthrough (public site). Dashboards guard themselves with
  `lib/auth/role-guard.ts` (self-healing, loop-safe).

## Validation (lib/validation.ts) — used by the modal
- Phone: digits only, **numeric keyboard** (`inputMode="numeric"`), hard-capped at 10, auto-formats.
- Email: must be a real `name@site.com`.
- Password: 8+ chars, 1 upper, 1 lower, 1 number — live checklist.
- Name: 2–60 letters.
