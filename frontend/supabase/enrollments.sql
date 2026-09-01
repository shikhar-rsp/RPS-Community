-- ============================================================================
-- Academy — workshop enrolments
-- Run AFTER schema.sql and security.sql, in the Supabase SQL editor.
-- Safe to re-run.
--
-- This is where the workshop page's "Step 2 of 2" form lands: name, email and
-- WhatsApp number, plus whether the person got a seat or the waitlist.
--
-- Two tables:
--   workshop_seats — ONLY the capacity facts, because the REGISTERED vs
--                    WAITLISTED decision has to be made from data the browser
--                    can't edit. Everything else about a workshop (copy,
--                    banner, curriculum) stays in lib/community/content.js.
--   enrollments    — one row per person per workshop.
--
-- Writes never go through the table directly. Both mutations are SECURITY
-- DEFINER functions so capacity is counted and the row inserted in one
-- transaction — otherwise two people confirming at once could both be handed
-- the same last seat.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. WORKSHOP SEATS (capacity facts)
-- ---------------------------------------------------------------------------
create table if not exists public.workshop_seats (
  slug               text primary key,
  capacity           int  not null check (capacity > 0),
  -- People already in before this app started counting — the numbers the
  -- content module used to carry as `seededEnrollments`.
  seeded_enrollments int  not null default 0 check (seeded_enrollments >= 0),
  updated_at         timestamptz not null default now()
);

comment on table public.workshop_seats is
  'Capacity per workshop slug. Server-authoritative: decides seat vs waitlist.';

-- Seed / re-sync from lib/community/content.js. Re-running updates capacity
-- but never clobbers a slug you have since edited by hand in the dashboard.
insert into public.workshop_seats (slug, capacity, seeded_enrollments) values
  ('design-products-with-ai',    45, 33),
  ('ai-prototyping-sprint',      45, 45),
  ('portfolio-teardown-live',    45, 44),
  ('ship-client-ready-websites', 45, 45)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 2. ENROLLMENTS
-- ---------------------------------------------------------------------------
create table if not exists public.enrollments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  workshop_slug text not null references public.workshop_seats (slug) on delete cascade,
  status        text not null default 'REGISTERED',

  -- What the person typed on the enrolment form. Snapshotted deliberately: a
  -- registration list shouldn't change under RPS after the fact just because
  -- someone later edited their profile.
  name          text not null,
  email         text not null,
  whatsapp      text not null,

  -- Denormalised from the verified session so the team's CSV export is
  -- readable without joins, and so a spoofed form `email` is still auditable
  -- against the account that actually booked.
  user_email    text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- One seat per person per workshop.
  unique (user_id, workshop_slug)
);

comment on table public.enrollments is
  'Workshop seats and waitlist entries; team exports this as the registration list.';

alter table public.enrollments
  drop constraint if exists enrollments_status_check;
alter table public.enrollments
  add constraint enrollments_status_check
  check (status in ('REGISTERED', 'WAITLISTED', 'ATTENDED', 'CANCELLED'));

create index if not exists enrollments_user_id_idx    on public.enrollments (user_id);
create index if not exists enrollments_slug_idx       on public.enrollments (workshop_slug);
create index if not exists enrollments_created_at_idx on public.enrollments (created_at desc);

drop trigger if exists enrollments_touch on public.enrollments;
create trigger enrollments_touch before update on public.enrollments
  for each row execute function public.touch_updated_at();

drop trigger if exists workshop_seats_touch on public.workshop_seats;
create trigger workshop_seats_touch before update on public.workshop_seats
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 3. ENROL  (the only write path for taking a seat)
--
--    Counts capacity and inserts inside one transaction, with the capacity row
--    locked FOR UPDATE, so concurrent confirms are serialised and the last seat
--    can only be handed out once. The caller supplies no status and no user id:
--    both come from here.
-- ---------------------------------------------------------------------------
create or replace function public.enroll_in_workshop(
  p_slug     text,
  p_name     text,
  p_email    text,
  p_whatsapp text
)
returns public.enrollments
language plpgsql security definer set search_path = public as $$
declare
  v_user       uuid := auth.uid();
  v_capacity   int;
  v_seeded     int;
  v_taken      int;
  v_status     text;
  v_user_email text;
  v_row        public.enrollments;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  if coalesce(btrim(p_name), '') = ''
     or coalesce(btrim(p_email), '') = ''
     or coalesce(btrim(p_whatsapp), '') = '' then
    raise exception 'Name, email and WhatsApp number are all required'
      using errcode = '22023';
  end if;

  -- Lock this workshop's capacity row for the rest of the transaction.
  select capacity, seeded_enrollments
    into v_capacity, v_seeded
  from public.workshop_seats
  where slug = p_slug
  for update;

  if not found then
    raise exception 'Unknown workshop %', p_slug using errcode = '22023';
  end if;

  -- Already in? Hand back what they have rather than making a second row.
  select * into v_row
  from public.enrollments
  where user_id = v_user and workshop_slug = p_slug;

  if found then
    return v_row;
  end if;

  select count(*) into v_taken
  from public.enrollments
  where workshop_slug = p_slug
    and status in ('REGISTERED', 'ATTENDED');

  v_status := case
                when v_seeded + v_taken >= v_capacity then 'WAITLISTED'
                else 'REGISTERED'
              end;

  select email into v_user_email from auth.users where id = v_user;

  insert into public.enrollments
    (user_id, workshop_slug, status, name, email, whatsapp, user_email)
  values
    (v_user, p_slug, v_status, btrim(p_name), btrim(p_email), btrim(p_whatsapp), v_user_email)
  returning * into v_row;

  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. CANCEL  ("Can't make it?" / "Leave the waitlist")
--    Removes the row so the seat genuinely returns to the pool and the person
--    can enrol again later. No DELETE is granted on the table itself.
-- ---------------------------------------------------------------------------
create or replace function public.cancel_enrollment(p_slug text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_hit  int;
begin
  if v_user is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;

  delete from public.enrollments
  where user_id = v_user and workshop_slug = p_slug;

  get diagnostics v_hit = row_count;
  return v_hit > 0;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. SEAT COUNTS  (public, aggregate only — no personal data leaves this)
--    Lets the listing and the seat meters show real remaining seats to anyone,
--    logged in or not, without exposing who is on the list.
-- ---------------------------------------------------------------------------
create or replace function public.workshop_seat_counts()
returns table (slug text, capacity int, taken int)
language sql security definer set search_path = public stable as $$
  select ws.slug,
         ws.capacity,
         (ws.seeded_enrollments + count(e.id) filter (
            where e.status in ('REGISTERED', 'ATTENDED')
          ))::int as taken
  from public.workshop_seats ws
  left join public.enrollments e on e.workshop_slug = ws.slug
  group by ws.slug, ws.capacity, ws.seeded_enrollments;
$$;

-- ---------------------------------------------------------------------------
-- 6. ROW-LEVEL SECURITY
--    Users may READ their own enrolments and nothing else. Every write goes
--    through the functions above, which is why no insert/update/delete policy
--    exists here at all.
-- ---------------------------------------------------------------------------
alter table public.enrollments    enable row level security;
alter table public.workshop_seats enable row level security;

-- Deliberately ENABLE and not FORCE, unlike profiles/submissions in
-- security.sql. FORCE applies policies to the table owner too, and the three
-- functions above are SECURITY DEFINER: the enrol INSERT, the cancel DELETE and
-- the `FOR UPDATE` capacity lock would all then be judged against policies that
-- don't exist for those operations. Nothing is weakened by leaving it off —
-- anon and authenticated hold no INSERT/UPDATE/DELETE grant on either table, so
-- the functions remain the only write path.

drop policy if exists "own enrollments read" on public.enrollments;
create policy "own enrollments read"
  on public.enrollments for select
  using (auth.uid() = user_id);

-- Capacity is public information — it's on the page.
drop policy if exists "workshop seats readable" on public.workshop_seats;
create policy "workshop seats readable"
  on public.workshop_seats for select
  using (true);

-- ---------------------------------------------------------------------------
-- 7. Least-privilege grants.
-- ---------------------------------------------------------------------------
revoke all on public.enrollments    from anon, authenticated;
revoke all on public.workshop_seats from anon, authenticated;

-- Read your own enrolments; capacity is readable by everyone.
grant select on public.enrollments    to authenticated;
grant select on public.workshop_seats to anon, authenticated;

-- No INSERT/UPDATE/DELETE on either table via the API. Writes go through the
-- functions, which the service role and the dashboard can still bypass.
revoke all on function public.enroll_in_workshop(text, text, text, text) from public;
revoke all on function public.cancel_enrollment(text)                    from public;
grant execute on function public.enroll_in_workshop(text, text, text, text) to authenticated;
grant execute on function public.cancel_enrollment(text)                    to authenticated;
grant execute on function public.workshop_seat_counts()                     to anon, authenticated;
