-- If you rebuilt the schema after accounts were already created, those
-- accounts exist in auth.users but lost their public.users row.
-- This recreates a row for every auth account that's missing one.
-- Run once in Supabase → SQL Editor. Safe to re-run.

INSERT INTO public.users (id, email, full_name, role)
SELECT au.id, au.email,
       COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email,'@',1)),
       -- Never backfill as admin via metadata — clamp to student/provider only.
       CASE WHEN au.raw_user_meta_data->>'role' = 'provider' THEN 'provider'::user_role
            ELSE 'student'::user_role END
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

SELECT count(*) AS total_users FROM public.users;
