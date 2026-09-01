-- ============================================================================
-- Academy — profile repair
-- Run in the Supabase SQL editor, after schema.sql and security.sql.
-- Safe to re-run.
--
-- THE PROBLEM
-- `profiles` rows are normally created by the on_auth_user_created trigger.
-- If that row is ever missing — the user predates the trigger, the row was
-- deleted, or the insert didn't land — the app could never rebuild it:
--
--   * schema.sql defines an "own profile insert" policy, but
--   * security.sql grants authenticated only SELECT and UPDATE.
--
-- With no INSERT privilege the policy is dead, so onboarding's write matched
-- zero rows, returned no error, and reported success. The account ended up with
-- `role` in user_metadata but no profiles row — signed in, invisible to every
-- server-side check, and permanently stuck at the onboarding gate.
--
-- Section 1 makes the existing policy usable. Section 2 rebuilds rows that are
-- already missing.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Let a user create their OWN profile row.
--    No new capability: the "own profile insert" policy already restricts this
--    to auth.uid() = id, and they can already UPDATE every one of these
--    columns. This only makes onboarding self-healing.
-- ---------------------------------------------------------------------------
grant insert on public.profiles to authenticated;

drop policy if exists "own profile insert" on public.profiles;
create policy "own profile insert"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Belt and braces, mirroring stamp_submission() in security.sql: even with the
-- policy, force `id` and `email` from the verified auth context so a client
-- can't insert a row for anyone but themselves or fake the address on it.
-- The signup trigger runs with no JWT in context (auth.uid() is null) and is
-- deliberately left alone.
create or replace function public.stamp_profile()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_email text;
begin
  if v_uid is null then
    return new;                       -- the on_auth_user_created path
  end if;
  new.id := v_uid;                    -- ignore any client-supplied id
  select u.email into v_email from auth.users u where u.id = v_uid;
  new.email := v_email;
  return new;
end;
$$;

drop trigger if exists profiles_stamp on public.profiles;
create trigger profiles_stamp
  before insert on public.profiles
  for each row execute function public.stamp_profile();

-- ---------------------------------------------------------------------------
-- 2. Rebuild any profile rows that are already missing.
--    role/goals/tools are recovered from user_metadata, so anyone who did fill
--    the form in but lost the write does NOT have to do it again.
-- ---------------------------------------------------------------------------
insert into public.profiles (id, email, name, role, goals, tools, avatar_url)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name'),
  u.raw_user_meta_data->>'role',
  coalesce(
    (select array_agg(value) from jsonb_array_elements_text(u.raw_user_meta_data->'goals')),
    '{}'
  ),
  coalesce(
    (select array_agg(value) from jsonb_array_elements_text(u.raw_user_meta_data->'tools')),
    '{}'
  ),
  u.raw_user_meta_data->>'avatar_url'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- Same recovery for rows that exist but lost their answers, where the account's
-- own metadata still remembers them. Never overwrites an answer already saved.
update public.profiles p
set role = u.raw_user_meta_data->>'role'
from auth.users u
where u.id = p.id
  and p.role is null
  and u.raw_user_meta_data->>'role' is not null;

-- ---------------------------------------------------------------------------
-- 3. What's left. Anyone still listed here genuinely never filled the form in;
--    the onboarding gate will now catch them on their next visit.
-- ---------------------------------------------------------------------------
select
  (select count(*) from auth.users)                                as auth_users,
  (select count(*) from public.profiles)                           as profiles,
  (select count(*) from auth.users u
     left join public.profiles p on p.id = u.id
    where p.id is null)                                            as still_missing,
  (select count(*) from public.profiles where role is null)        as never_onboarded;
