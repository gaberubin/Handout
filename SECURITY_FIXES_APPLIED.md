# What's Been Fixed (Security + Login)

## 🔧 LOGIN/SIGNUP BUG — FIXED

### The bug
Login form was "refreshing but not signing in" because the client-side `window.location.href` redirect happened BEFORE the auth cookie was fully written. Middleware then saw no session and bounced you back to /auth/login.

### The fix
All auth now runs as **Next.js Server Actions** in `lib/actions/auth.ts`. The flow:
1. Form submits to server (NOT client-side JS)
2. Server calls Supabase
3. Server sets cookies via `next/headers`
4. Server calls `redirect('/student/dashboard')` — cookies travel with the redirect response
5. Middleware sees the session → lets you through

API keys (Supabase URL/anon key) are still safe — they're `NEXT_PUBLIC_` by design. The actual auth logic now runs server-side.

---

## 🔒 SECURITY FIXES — ALL ADDED

### 1. Rate Limiting (in-memory, no external service needed)
- Signup: **5 per IP per hour**
- Login:  **10 per IP per 15 minutes**
- Send message: **30 per user per minute**
- Create post: **5 per user per 10 minutes**
- Create booking: **10 per user per hour**

### 2. Input Validation (Zod on every server action)
- Name: 2-80 chars, letters/spaces/hyphens only
- Email: valid format, max 120 chars
- Password: 8-128 chars
- Message content: 1-2000 chars
- Post: title 5-150, content 10-5000 chars
- Booking notes: max 500 chars

### 3. Content Sanitization
Every user input is stripped of:
- HTML tags (`<script>`, `<iframe>`, etc.) → can't inject XSS
- Control characters
- Trailing/leading whitespace
- Anything over the max length

### 4. .gitignore
Locks down `.env.local`, `.env.*`, `*.key`, `*.pem`, `secrets/` — even if you `git add .` your keys won't leak.

### 5. Honeypot Field
Invisible `<input name="website">` in signup + login forms. Real humans can't see it (positioned at -9999px). Bots fill every field they see. Zod schema requires `honeypot` to be empty — non-empty = rejected.

### 6. Security Headers (next.config.js)
- `X-Frame-Options: DENY` — can't be embedded in iframes (clickjacking protection)
- `X-Content-Type-Options: nosniff` — browser respects MIME types
- `Strict-Transport-Security` — HTTPS only, 2-year max-age
- `Content-Security-Policy` — scripts/styles/images only from approved origins
- `Permissions-Policy` — camera/mic/geolocation off by default
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## ⚠️ ACTIONS YOU SHOULD STILL TAKE

1. **Rotate your Supabase anon key** — it was shared publicly earlier. Supabase Dashboard → Settings → API → "Rotate anon key"
2. **Confirm email confirmation is OFF** for dev testing only — turn it back on with Resend SMTP before launch
3. **Enable Captcha for production** — Supabase Dashboard → Auth → Settings → enable hCaptcha or Cloudflare Turnstile
4. **Run the schema** if you haven't: open `supabase/schema.sql`, paste into SQL Editor, run

