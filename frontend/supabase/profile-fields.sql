-- ============================================================================
-- Academy — extra signup fields
-- Run in the Supabase SQL editor, after schema.sql / security.sql /
-- profile-repair.sql. Safe to re-run.
--
-- Every column is NULLABLE on purpose. The 20 existing accounts predate this
-- form and must keep working untouched — no backfill, no NOT NULL, no
-- destructive migration. They can be prompted to fill these in later.
--
-- DELIBERATELY NOT ADDED: an `occupation` column for the spec's
-- Student / Working professional / Faculty / Other dropdown. `profiles.role`
-- already exists with a DIFFERENT meaning (Design student / Career switcher /
-- Junior / Senior / Lead) and the onboarding gate keys off it being non-null.
-- Adding the new concept is pending that decision.
-- ============================================================================

alter table public.profiles add column if not exists mobile            text;
alter table public.profiles add column if not exists organisation      text;
alter table public.profiles add column if not exists year_of_study     text;
alter table public.profiles add column if not exists department        text;
alter table public.profiles add column if not exists how_heard         text;
alter table public.profiles add column if not exists terms_accepted_at timestamptz;

comment on column public.profiles.mobile is
  'E.164-ish mobile with country code, captured at signup. Nullable: pre-existing accounts have none.';
comment on column public.profiles.organisation is
  'College or organisation, captured at signup.';
comment on column public.profiles.terms_accepted_at is
  'When the Terms & Privacy box was ticked. Null for accounts created before the box existed.';

-- The stamp trigger from profile-repair.sql already forces id and email from
-- the verified auth context on insert, so these new columns need no extra
-- protection: a user may only ever write their own row.

-- Sanity check.
select
  (select count(*) from public.profiles)                             as profiles,
  (select count(*) from public.profiles where mobile is null)        as without_mobile,
  (select count(*) from public.profiles where terms_accepted_at is null) as without_terms;
