# AERIS Supabase setup

The app now supports Supabase email authentication and remote storage for profiles, favorites, viewed history, collections, collection photos, and notifications. When the two Vite environment values are absent, AERIS stays in local demo mode.

## 1. Create and configure a Supabase project

1. Create a Supabase project and copy its project URL and publishable key. The browser app must never receive a `service_role` key.
2. Copy `.env.example` to `.env.local`, then set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. In Supabase **SQL Editor**, run `supabase/migrations/202609260001_member_platform.sql`, then `supabase/migrations/202610020001_inquiries.sql`. The second migration also adds onboarding profile fields and the Planner's `shoot_spots` table with owner-only RLS.
4. In **Authentication → URL Configuration**, add `http://localhost:5173/verify-email` and `http://localhost:5173/reset-password` as redirect URLs. Add the deployed site's equivalent URLs before production.
5. Configure email confirmation and an email sender in Supabase Auth. The app sends the confirmation and reset requests through Supabase Auth.
6. Restart Vite after changing `.env.local`.

## 2. Public inquiries and email notification

Deploy `supabase/functions/submit-inquiry` with `supabase functions deploy submit-inquiry --no-verify-jwt`, then set these **Edge Function secrets** (never Vite variables):

```sh
supabase secrets set RESEND_API_KEY=... INQUIRY_NOTIFY_EMAIL=studio@example.com INQUIRY_FROM_EMAIL="AERIS <inquiries@example.com>" SITE_ORIGIN=https://your-domain.example
```

Use a sender domain verified with Resend. The function validates and bounds input, rejects the honeypot, limits each email to three submissions per hour, stores contact and photo requests, and sends a notification. If email is not configured, the inquiry is stored and the UI says so. The service-role key stays inside the Supabase Edge Function runtime. Only users with `profiles.role = 'admin'` can read/update inquiry rows; browser clients cannot change roles. Assign the first admin role from the trusted Supabase SQL editor, for example `update public.profiles set role = 'admin' where id = 'YOUR_AUTH_USER_UUID';`. The same second migration creates `shoot_spots` with owner-only RLS for the Planner.

## 3. Verify the connection

- Register with an address you can access, follow the confirmation link, then sign in.
- Save a photo, open the dashboard, create a collection, and verify these changes remain after signing in from another browser.
- Set a collection public and verify it is readable while signed out; verify private profiles and collections remain inaccessible.
- Test reset email redirects and follow/unfollow with two accounts.

## Security notes

- All member tables have Row Level Security policies in the migration. Review those policies against the final product before launch.
- Never add a service role key to a `VITE_*` variable or client bundle.
- The public contact form requires the inquiry migration and Edge Function above. Demo Mode does not send or store inquiries.
- Local demo data does not migrate automatically. The `aeris:*` browser storage entries are only fallback data.

The client uses Supabase's persistent browser session and PKCE-compatible email sign-up flow. See the [Supabase JavaScript client setup](https://supabase.com/docs/reference/javascript/initializing), [email sign-up](https://supabase.com/docs/reference/javascript/auth-signup), and [row-level security guide](https://supabase.com/docs/guides/database/postgres/row-level-security).
