# Handout — Complete Setup Guide

## What you're setting up
A Next.js 14 app with:
- ✅ Supabase Auth (email + Google OAuth)
- ✅ PostgreSQL database with Row Level Security
- ✅ Real-time messaging
- ✅ All 38 pages working end-to-end
- ✅ Scroll-triggered text reveal animations throughout

---

## Step 1 — Install Node.js

Go to https://nodejs.org and download **Node.js LTS (v20+)**.

Verify: open PowerShell and run:
```
node -v   # should show v20.x.x
npm -v    # should show 10.x.x
```

---

## Step 2 — Install the project

```powershell
cd C:\Users\darsh\Downloads\handout-final\handout
npm install
```

---

## Step 3 — Create your Supabase project (FREE)

1. Go to **https://supabase.com**
2. Click **"Start your project"** → sign in with GitHub
3. Click **"New project"**
4. Fill in:
   - **Name**: `handout`
   - **Database Password**: choose a strong password (save it!)
   - **Region**: pick closest to you (US East for NJ)
5. Click **"Create new project"** — wait ~2 minutes

---

## Step 4 — Run the database schema

1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase/schema.sql` from your project folder
4. Copy ALL the content and paste it into the SQL editor
5. Click **"Run"** (green button)
6. You should see: `Schema created successfully! 🎉`

---

## Step 5 — Get your API keys

1. In Supabase dashboard → **Settings** → **API**
2. Copy these two values:
   - **Project URL** → looks like `https://abcdefgh.supabase.co`
   - **anon public** key → long string starting with `eyJ...`

---

## Step 6 — Create your .env.local file

1. In your project folder (`handout/`), create a new file called `.env.local`
2. Add:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
Replace with your actual values from Step 5.

---

## Step 7 — Enable Google OAuth (optional but recommended)

1. Supabase dashboard → **Authentication** → **Providers**
2. Click **Google** → toggle it ON
3. You need a Google Cloud OAuth app:
   - Go to https://console.cloud.google.com
   - Create project → APIs & Services → Credentials → Create OAuth 2.0 Client
   - Authorized redirect URI: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. Paste Client ID and Secret into Supabase

---

## Step 8 — Configure Auth settings

1. Supabase → **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000`
3. Add to **Redirect URLs**: `http://localhost:3000/auth/callback`

---

## Step 9 — Run the app

```powershell
npm run dev
```

Open browser: **http://localhost:3000**

You'll see the landing page. Click "Sign up free" to create your first account!

---

## Step 10 — Test the full flow

1. **Sign up** with your email → check your inbox for confirmation
2. **Onboarding** → select your university and city
3. **Dashboard** → see your personalized home
4. **Roommates** → browse matches
5. **Food** → subscribe to a tiffin provider
6. **Services** → book an airport ride
7. **Messages** → chat with providers
8. **Community** → post a question

---

## Step 11 — Make yourself admin

After signing up, run this in Supabase SQL Editor:
```sql
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your@email.com';
```

Then visit `/admin` to access the admin panel.

---

## Step 12 — Deploy to Vercel (free)

1. Push your code to GitHub:
```powershell
git init
git add .
git commit -m "Initial commit"
# Create a GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/handout
git push -u origin main
```

2. Go to **https://vercel.com** → sign in with GitHub
3. Click **"New Project"** → import your `handout` repo
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` = `https://your-app.vercel.app`
5. Click **Deploy** → done! 🚀

6. Update Supabase Auth → URL Configuration with your Vercel URL

---

## Common Issues

**"npm install not working"**
→ Make sure you're inside the `handout` folder that has `package.json`

**"Invalid API key"**
→ Check your `.env.local` — make sure there are no spaces around `=`

**"Redirect loop on login"**
→ Check Supabase → Auth → URL Configuration matches your site URL

**"Database error"**
→ Run the schema.sql again — it's safe to run multiple times

---

## File Structure

```
handout/
├── app/                    # All pages (Next.js App Router)
│   ├── auth/               # Login, signup, onboarding
│   ├── student/            # All student pages
│   ├── provider/           # Provider dashboard
│   ├── admin/              # Admin panel
│   └── landing/            # Marketing page
├── components/
│   ├── motion/             # RevealText, ScrollReveal, PageTransition
│   ├── layout/             # Sidebar, Topbar, layouts
│   └── ui/                 # Button, Card, Avatar, etc.
├── lib/
│   ├── supabase/           # client.ts, server.ts, types.ts
│   ├── actions/            # auth.ts (server actions)
│   └── data.ts             # Mock fallback data
├── supabase/
│   └── schema.sql          # ← Run this first!
├── styles/
│   └── globals.css         # Design system + animations
├── middleware.ts            # Auth protection
├── .env.example            # Copy to .env.local
└── SETUP.md                # This file
```

---

## Support

Something broken? Check:
1. Node.js v20+ installed
2. `.env.local` has correct Supabase keys
3. `schema.sql` was run in Supabase SQL Editor
4. Supabase Auth URLs are configured correctly

Good luck! 🎉
