-- Make ONE account the admin (bypasses verification). Replace the email, then run.
UPDATE public.users
SET role = 'admin', is_verified = true, verification_status = 'approved', onboarded = true
WHERE email = 'YOUR_ADMIN_EMAIL@example.com';

SELECT email, role, verification_status FROM public.users WHERE role = 'admin';
