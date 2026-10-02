-- Public inquiries are accepted through the submit-inquiry Edge Function only.
alter table public.profiles add column if not exists role text not null default 'member' check (role in ('member', 'admin'));
alter table public.profiles add column if not exists interests text[] not null default '{}';
alter table public.profiles add column if not exists home_location text not null default '' check (char_length(home_location) <= 120);
alter table public.profiles add column if not exists onboarding_complete boolean not null default false;
alter table public.profiles add column if not exists starter_collection_followed boolean not null default false;
revoke update on public.profiles from authenticated;
grant update (display_name, bio, avatar_path, is_public, theme, notifications_enabled, interests, home_location, onboarding_complete, starter_collection_followed) on public.profiles to authenticated;
grant select (id, username, display_name, bio, avatar_path, is_public, theme, notifications_enabled, created_at, updated_at, role, interests, home_location, onboarding_complete, starter_collection_followed) on public.profiles to anon, authenticated;

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 320),
  inquiry_type text not null check (inquiry_type in ('contact', 'print', 'license', 'commission', 'collaboration')),
  message text not null check (char_length(message) between 1 and 5000),
  photo_id text,
  photo_title text,
  purpose text not null default 'personal' check (purpose in ('personal', 'commercial', 'editorial', 'other')),
  usage text not null default '' check (char_length(usage) <= 300),
  status text not null default 'new' check (status in ('new', 'replied', 'closed')),
  created_at timestamptz not null default now()
);
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
alter table public.inquiries enable row level security;
revoke all on public.inquiries from anon, authenticated;
grant select, update on public.inquiries to authenticated;
create policy "Only admins read inquiries" on public.inquiries for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));
create policy "Only admins update inquiries" on public.inquiries for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

create table if not exists public.shoot_spots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  timezone text not null default 'UTC',
  notes text not null default '' check (char_length(notes) <= 1000),
  reminder_enabled boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists shoot_spots_user_created_idx on public.shoot_spots (user_id, created_at desc);
alter table public.shoot_spots enable row level security;
revoke all on public.shoot_spots from anon, authenticated;
grant select, insert, update, delete on public.shoot_spots to authenticated;
create policy "Users manage their own shoot spots" on public.shoot_spots for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
