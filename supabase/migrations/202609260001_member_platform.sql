-- AERIS member platform schema.
-- Run with `supabase db push` after linking this project to a Supabase project.

create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  display_name text not null default '' check (char_length(display_name) <= 80),
  bio text not null default '' check (char_length(bio) <= 500),
  avatar_path text,
  is_public boolean not null default false,
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  photo_id text not null check (char_length(photo_id) <= 80),
  created_at timestamptz not null default now(),
  primary key (user_id, photo_id)
);

create table public.view_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  photo_id text not null check (char_length(photo_id) <= 80),
  viewed_at timestamptz not null default now()
);
create index view_history_user_recent_idx on public.view_history (user_id, viewed_at desc);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index collections_user_updated_idx on public.collections (user_id, updated_at desc);
create index collections_public_updated_idx on public.collections (updated_at desc) where is_public;

create table public.collection_photos (
  collection_id uuid not null references public.collections (id) on delete cascade,
  photo_id text not null check (char_length(photo_id) <= 80),
  added_at timestamptz not null default now(),
  primary key (collection_id, photo_id)
);

create table public.follows (
  follower_id uuid not null references auth.users (id) on delete cascade,
  followed_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followed_id),
  check (follower_id <> followed_id)
);
create index follows_followed_idx on public.follows (followed_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  kind text not null check (kind in ('welcome', 'new_collection', 'new_follower', 'password_changed')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index notifications_recipient_recent_idx on public.notifications (recipient_id, created_at desc);

-- Inquiries are accepted only from signed-in owners here. Public contact forms
-- should submit through a rate-limited Edge Function, never a wide-open table policy.
create table public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) <= 320),
  inquiry_type text not null check (inquiry_type in ('commission', 'collaboration', 'licensing')),
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default now()
);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger collections_set_updated_at before update on public.collections
for each row execute function public.set_updated_at();

create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  preferred_username text;
  display_name text;
begin
  display_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1));
  preferred_username := lower(regexp_replace(coalesce(nullif(new.raw_user_meta_data ->> 'username', ''), split_part(new.email, '@', 1)), '[^a-zA-Z0-9_]', '', 'g'));
  if char_length(preferred_username) < 3 then
    preferred_username := 'aeris_' || left(replace(new.id::text, '-', ''), 12);
  end if;
  if exists (select 1 from public.profiles p where p.username = left(preferred_username, 30)) then
    preferred_username := left(preferred_username, 17) || '_' || left(replace(new.id::text, '-', ''), 12);
  end if;
  insert into public.profiles (id, username, display_name)
  values (new.id, left(preferred_username, 30), left(display_name, 80));
  insert into public.notifications (recipient_id, kind, payload)
  values (new.id, 'welcome', jsonb_build_object('message', 'Welcome to AERIS. Your photo journal is ready.'));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_auth_user();

create function public.notify_followers_of_public_collection()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  should_notify boolean;
begin
  if tg_op = 'INSERT' then
    should_notify := new.is_public;
  else
    should_notify := new.is_public and not old.is_public;
  end if;
  if should_notify then
    insert into public.notifications (recipient_id, actor_id, kind, payload)
    select f.follower_id, new.user_id, 'new_collection', jsonb_build_object('collection_id', new.id, 'title', new.title)
    from public.follows f
    where f.followed_id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger public_collection_notifications after insert or update of is_public on public.collections
for each row execute function public.notify_followers_of_public_collection();

create function public.notify_on_new_follow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (recipient_id, actor_id, kind, payload)
  values (new.followed_id, new.follower_id, 'new_follower', '{}'::jsonb);
  return new;
end;
$$;

create trigger new_follower_notification after insert on public.follows
for each row execute function public.notify_on_new_follow();

alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.view_history enable row level security;
alter table public.collections enable row level security;
alter table public.collection_photos enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.contact_inquiries enable row level security;

create policy "Public profiles are visible; private profiles belong to their owner"
on public.profiles for select to anon, authenticated
using (is_public or (select auth.uid()) = id);
create policy "Users update their own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Users manage their own favorites"
on public.favorites for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users manage their own view history"
on public.view_history for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Owners and everyone can read public collections"
on public.collections for select to anon, authenticated
using (is_public or (select auth.uid()) = user_id);
create policy "Owners manage their collections"
on public.collections for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Owners and everyone can read photos in public collections"
on public.collection_photos for select to anon, authenticated
using (exists (
  select 1 from public.collections c
  where c.id = collection_id and (c.is_public or c.user_id = (select auth.uid()))
));
create policy "Owners manage photos in their collections"
on public.collection_photos for all to authenticated
using (exists (
  select 1 from public.collections c
  where c.id = collection_id and c.user_id = (select auth.uid())
)) with check (exists (
  select 1 from public.collections c
  where c.id = collection_id and c.user_id = (select auth.uid())
));

create policy "Follow graph is public"
on public.follows for select to anon, authenticated using (true);
create policy "Users follow from their own account"
on public.follows for insert to authenticated
with check ((select auth.uid()) = follower_id);
create policy "Users unfollow from their own account"
on public.follows for delete to authenticated
using ((select auth.uid()) = follower_id);

create policy "Users read their own notifications"
on public.notifications for select to authenticated
using ((select auth.uid()) = recipient_id);
create policy "Users mark their own notifications read"
on public.notifications for update to authenticated
using ((select auth.uid()) = recipient_id) with check ((select auth.uid()) = recipient_id);

create policy "Users submit and read their own inquiries"
on public.contact_inquiries for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.profiles, public.favorites, public.view_history, public.collections,
  public.collection_photos, public.follows, public.notifications, public.contact_inquiries
from anon, authenticated;
grant select on public.profiles, public.collections, public.collection_photos, public.follows to anon;
grant select on public.profiles, public.collections, public.collection_photos, public.follows to authenticated;
grant insert, update on public.profiles to authenticated;
grant select, insert, delete on public.favorites, public.view_history, public.follows to authenticated;
grant insert, update, delete on public.collections, public.collection_photos to authenticated;
grant select, update on public.notifications to authenticated;
grant select, insert on public.contact_inquiries to authenticated;
