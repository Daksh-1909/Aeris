-- Public inquiries are accepted through the submit-inquiry Edge Function only.
alter table public.profiles add column if not exists role text not null default 'member' check (role in ('member', 'admin'));
revoke update on public.profiles from authenticated;
grant update (display_name, bio, avatar_path, is_public, theme, notifications_enabled) on public.profiles to authenticated;
grant select (id, username, display_name, bio, avatar_path, is_public, theme, notifications_enabled, created_at, updated_at, role) on public.profiles to anon, authenticated;

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 320),
  inquiry_type text not null check (inquiry_type in ('contact', 'print', 'license', 'commission', 'collaboration')),
  message text not null check (char_length(message) between 1 and 5000),
  photo_id text,
  photo_title text,
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
