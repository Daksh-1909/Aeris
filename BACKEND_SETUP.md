# AERIS Supabase setup

The app now supports Supabase email authentication and remote storage for profiles, favorites, viewed history, collections, collection photos, and notifications. When the two Vite environment values are absent, AERIS stays in local demo mode.

## 1. Create and configure a Supabase project

1. Create a Supabase project and copy its project URL and publishable key. The browser app must never receive a `service_role` key.
2. Copy `.env.example` to `.env.local`, then set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. In Supabase **SQL Editor**, run `supabase/migrations/202609260001_member_platform.sql`.
4. In **Authentication → URL Configuration**, add `http://localhost:5173/verify-email` and `http://localhost:5173/reset-password` as redirect URLs. Add the deployed site's equivalent URLs before production.
5. Configure email confirmation and an email sender in Supabase Auth. The app sends the confirmation and reset requests through Supabase Auth.
6. Restart Vite after changing `.env.local`.

## 2. Verify the connection

- Register with an address you can access, follow the confirmation link, then sign in.
- Save a photo, open the dashboard, create a collection, and verify these changes remain after signing in from another browser.
- Set a collection public and verify it is readable while signed out; verify private profiles and collections remain inaccessible.
- Test reset email redirects and follow/unfollow with two accounts.

## Security notes

- All member tables have Row Level Security policies in the migration. Review those policies against the final product before launch.
- Never add a service role key to a `VITE_*` variable or client bundle.
- The public contact form still uses demo confirmation only. Route guest submissions through a rate-limited Supabase Edge Function or trusted server before collecting inquiries.
- Local demo data does not migrate automatically. The `aeris:*` browser storage entries are only fallback data.

The client uses Supabase's persistent browser session and PKCE-compatible email sign-up flow. See the [Supabase JavaScript client setup](https://supabase.com/docs/reference/javascript/initializing), [email sign-up](https://supabase.com/docs/reference/javascript/auth-signup), and [row-level security guide](https://supabase.com/docs/guides/database/postgres/row-level-security).
