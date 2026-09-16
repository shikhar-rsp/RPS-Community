-- ============================================================================
-- Approve / reject / remove, and a trash you can undo from.
-- Run in the Supabase SQL editor. Safe to re-run.
--
-- The admin list works without this. Approve and Remove already do, and Reject
-- falls back to the same state as Remove; the trash shows what was taken off
-- the list but cannot say who did it. Running this is what separates a rejected
-- registration from a removed one, and puts a name against each removal.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. REJECTED — a decision about a person, not housekeeping
--
-- CANCELLED already means "not coming", but it is what a registrant does to
-- their own seat and what an admin does to tidy the list. Turning somebody down
-- is a third thing, and a list that cannot tell them apart cannot tell you why
-- a name is missing.
-- ---------------------------------------------------------------------------
alter table public.enrollments
  drop constraint if exists enrollments_status_check;

alter table public.enrollments
  add constraint enrollments_status_check
  check (status in ('REGISTERED', 'WAITLISTED', 'ATTENDED', 'CANCELLED', 'REJECTED'));

-- ---------------------------------------------------------------------------
-- 2. Who took this off the list, and when
--
-- Not an audit trail in any serious sense — it is one name and one timestamp,
-- so that "who deleted this?" has an answer when three people share the page.
-- ---------------------------------------------------------------------------
alter table public.enrollments
  add column if not exists removed_by text;

alter table public.enrollments
  add column if not exists removed_at timestamptz;

comment on column public.enrollments.removed_by is
  'Email of the admin who rejected or removed this registration. Null if it was never removed, or if the registrant released the seat themselves.';

-- The trash view reads these together, newest first.
create index if not exists enrollments_removed_at_idx
  on public.enrollments (removed_at desc)
  where removed_at is not null;

-- ---------------------------------------------------------------------------
-- Nothing here changes who can read or write the table. Both admin actions go
-- through the service-role client in app/admin/registrations/actions.js, which
-- bypasses RLS; `enrollments` still has no update policy for normal sessions,
-- so a registrant cannot set their own status to REGISTERED.
-- ---------------------------------------------------------------------------
