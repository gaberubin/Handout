# FIX LOGIN — Run This Now

If your login/signup isn't working, **99% of the time it's because the database trigger isn't set up correctly**.

## Step 1 — Nuclear reset (run in Supabase SQL Editor)

```sql
-- Wipe everything clean
DROP TABLE IF EXISTS public.notifications, public.subscriptions, public.comments,
  public.post_likes, public.community_posts, public.reviews, public.messages,
  public.bookings, public.food_plans, public.services, public.roommate_preferences,
  public.provider_profiles, public.student_profiles, public.users CASCADE;

DROP TYPE IF EXISTS user_role, user_plan, booking_status, sub_status CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user(), update_updated_at(), is_admin() CASCADE;
DELETE FROM auth.users;

SELECT 'Wiped clean ✅' AS status;
```

## Step 2 — Run the full schema
Open `supabase/schema.sql`, copy ALL of it, paste in SQL Editor, click Run.

You should see: `Schema created successfully! 🎉`

## Step 3 — Turn OFF email confirmation
**Supabase Dashboard → Authentication → Providers → Email**
Turn OFF "Confirm email" → Save

Without this, you'll hit the 2 emails/hour limit.

## Step 4 — Verify your `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://grnckpjmtrdunhqpifcg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 5 — Restart server
```powershell
Ctrl+C
npm run dev
```

## Step 6 — Sign up
Go to `http://localhost:3000/auth/signup`, fill the form, click Create.

It will automatically:
- Create your `auth.users` row
- Trigger inserts into `public.users`
- Log you in
- Redirect to dashboard

## Verify it worked
Run in SQL Editor:
```sql
SELECT u.id, u.email, u.full_name, u.role FROM public.users u;
```
You should see your account.

---

## Stats on landing page

The hardcoded numbers (4,800+ students, etc.) are now **gone**. Replaced with `<LiveStats />` component that:
- Counts real users from `public.users WHERE role = 'student'`
- Counts real providers
- Counts completed bookings
- Calculates average rating from reviews
- Shows `000` when no data
- Auto-refreshes every 30 seconds

So the moment 1 person signs up → it shows 1+ on the landing page.
When 100 sign up → 100+.

No fake numbers anywhere.
