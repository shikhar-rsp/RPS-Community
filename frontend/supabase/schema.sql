-- ============================================================================
-- Academy — database schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query → Run).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. PROFILES  (1:1 with auth.users — the app-visible user record)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  name       text,
  role       text,                       -- student | switcher | junior | senior | lead
  goals      text[] default '{}',        -- multi-select from onboarding
  tools      text[] default '{}',        -- multi-select from onboarding
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'App profile per auth user; populated at signup + onboarding.';

-- ---------------------------------------------------------------------------
-- 2. SUBMISSIONS  (dashboard "Submit your assignment")
-- ---------------------------------------------------------------------------
create table if not exists public.submissions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  -- denormalised so the team's CSV export is readable without joins:
  user_email  text,
  user_name   text,
  assignment  text not null default 'Design handoff that sticks',
  link        text not null,
  note        text,
  status      text not null default 'submitted',  -- submitted | in_review | assessed
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.submissions is 'Assignment links submitted by users; team exports this as CSV/Excel.';

create index if not exists submissions_user_id_idx on public.submissions (user_id);
create index if not exists submissions_created_at_idx on public.submissions (created_at desc);

-- ---------------------------------------------------------------------------
-- 3. updated_at auto-touch trigger
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists submissions_touch on public.submissions;
create trigger submissions_touch before update on public.submissions
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Auto-create a profile row whenever a new auth user signs up
--    (covers email/password AND Google OAuth signups)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, role, goals, tools, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'role',
    coalesce(
      (select array_agg(value) from jsonb_array_elements_text(new.raw_user_meta_data->'goals')),
      '{}'
    ),
    coalesce(
      (select array_agg(value) from jsonb_array_elements_text(new.raw_user_meta_data->'tools')),
      '{}'
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 5. ROW-LEVEL SECURITY
--    Users can only see/modify their own rows. The service-role key (used
--    server-side and by the Supabase dashboard) bypasses RLS, so the team can
--    still see/export ALL submissions.
-- ---------------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.submissions enable row level security;

-- profiles
drop policy if exists "own profile read"   on public.profiles;
drop policy if exists "own profile update" on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
create policy "own profile read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);

-- submissions
drop policy if exists "own submissions read"   on public.submissions;
drop policy if exists "own submissions insert" on public.submissions;
drop policy if exists "own submissions update" on public.submissions;
create policy "own submissions read"   on public.submissions for select using (auth.uid() = user_id);
create policy "own submissions insert" on public.submissions for insert with check (auth.uid() = user_id);
create policy "own submissions update" on public.submissions for update using (auth.uid() = user_id);
