# 🚀 HANDOUT — 5-Minute Setup

Follow these steps **in order**. If anything breaks, visit `http://localhost:3000/debug` to see what's wrong.

## Step 1 — Create `.env.local` (30 seconds)

In the project root (same folder as `package.json`), create a file called `.env.local` and paste:

```
NEXT_PUBLIC_SUPABASE_URL=https://grnckpjmtrdunhqpifcg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdybmNrcGptdHJkdW5ocXBpZmNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNDczNTUsImV4cCI6MjA5NDcyMzM1NX0.02neuNv01nVSZwDRJ_BHcbJkNV4KR_4vlNw439WJK0c
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

(If you rotated your key, replace the second line with the new one from Supabase Dashboard → Settings → API)

## Step 2 — Run the schema (1 minute)

1. Open https://supabase.com/dashboard/project/grnckpjmtrdunhqpifcg/sql/new
2. Open the file `supabase/schema.sql` in your project
3. Select ALL content (Ctrl+A) → Copy (Ctrl+C)
4. Paste into Supabase SQL Editor → click **RUN** (or Ctrl+Enter)
5. You should see: `✅ Schema created!`

## Step 3 — Turn off email confirmation (20 seconds)

1. Open https://supabase.com/dashboard/project/grnckpjmtrdunhqpifcg/auth/providers
2. Click **Email**
3. Uncheck **"Confirm email"**
4. Click **Save**

Without this, you'll hit Supabase's 2 emails/hour rate limit.

## Step 4 — Install and run (2 minutes)

```powershell
npm install
npm run dev
```

## Step 5 — Test it

1. Open http://localhost:3000/debug — should show 4 green checks
2. Open http://localhost:3000/auth/signup — create an account
3. You'll be redirected to /student/dashboard

---

## If something doesn't work

**Visit `http://localhost:3000/debug`** — it shows exactly what's broken.

Most common issues:
- ❌ "users table doesn't exist" → run schema.sql (Step 2)
- ❌ "Missing env vars" → check `.env.local` exists in the right place (Step 1)
- ❌ "Too many requests" → turn off email confirmation (Step 3)
- ❌ "Login refreshes but doesn't work" → schema not run, restart server after `.env.local`

---

## To make yourself Admin

After signing up, run in Supabase SQL Editor:

```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
```

Then visit http://localhost:3000/admin
