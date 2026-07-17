-- ============================================================================
-- Academy — security hardening (run AFTER schema.sql, in the SQL editor)
-- Safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Constrain `status` to known values (blocks arbitrary strings).
-- ---------------------------------------------------------------------------
alter table public.submissions
  drop constraint if exists submissions_status_check;
alter table public.submissions
  add constraint submissions_status_check
  check (status in ('submitted', 'in_review', 'assessed'));

-- ---------------------------------------------------------------------------
-- 2. Authoritatively stamp owner fields + status on INSERT.
--    Even if a client sends a spoofed user_id / user_email / user_name /
--    status, this trigger overwrites them from the verified auth context.
--    New submissions always start life as 'submitted'.
-- ---------------------------------------------------------------------------
create or replace function public.stamp_submission()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  auth_email text;
  auth_name  text;
begin
  select u.email,
         coalesce(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name')
    into auth_email, auth_name
  from auth.users u
  where u.id = auth.uid();

  new.user_id    := auth.uid();          -- ignore any client-supplied user_id
  new.user_email := auth_email;
  new.user_name  := auth_name;
  new.status     := 'submitted';         -- users can never self-assign a status
  return new;
end;
$$;

drop trigger if exists submissions_stamp on public.submissions;
create trigger submissions_stamp
  before insert on public.submissions
  for each row execute function public.stamp_submission();

-- ---------------------------------------------------------------------------
-- 3. Prevent users from UPDATING status/scoring on their own rows.
--    They may edit their link/note (resubmit) but status stays server-owned.
--    Reviewers/admins use the service-role key, which bypasses RLS.
-- ---------------------------------------------------------------------------
drop policy if exists "own submissions update" on public.submissions;
create policy "own submissions update"
  on public.submissions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and status = 'submitted');

-- ---------------------------------------------------------------------------
-- 4. Least-privilege grants. Revoke the blanket privileges PostgREST roles get
--    and hand back only what the app needs. RLS still applies on top of these.
-- ---------------------------------------------------------------------------
revoke all on public.profiles    from anon, authenticated;
revoke all on public.submissions from anon, authenticated;

-- anon (logged-out) gets nothing on these tables.
-- authenticated users: read/update own profile; read/insert/update own submissions.
grant select, update              on public.profiles    to authenticated;
grant select, insert, update      on public.submissions to authenticated;

-- No DELETE granted to anyone via the API — deletions only via service role.

-- ---------------------------------------------------------------------------
-- 5. Make sure RLS is ON (defensive — schema.sql already does this).
-- ---------------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.submissions enable row level security;
alter table public.profiles    force row level security;
alter table public.submissions force row level security;
