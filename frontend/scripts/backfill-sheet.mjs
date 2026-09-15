/* =============================================================================
   Put the registrations that already exist into the sheet.

   The live sync only fires when somebody registers, so anyone who took a seat
   before it was switched on is in Supabase and not in the spreadsheet. This
   walks the enrollments table and sends each row through the same Apps Script
   endpoint the app uses, so both paths write identical rows.

   Safe to re-run. The script upserts on workshop + email, so a second run
   updates the rows it already wrote rather than duplicating them.

     cd frontend
     SUPABASE_URL=https://xxxx.supabase.co \
     SUPABASE_SERVICE_ROLE_KEY=eyJ... \
     SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfy.../exec \
     SHEETS_WEBHOOK_SECRET=the-same-secret \
     node scripts/backfill-sheet.mjs

   Add --dry-run to see what it would write without touching the sheet.

   The service-role key is needed because enrollments are behind RLS: the anon
   key can only ever read the caller's own row, which is nobody's here. Run this
   from a terminal, never from the app — the key bypasses every access rule.
   ============================================================================= */

import { createClient } from '@supabase/supabase-js';
import { recordRegistration } from '../lib/sheets.js';

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY = process.argv.includes('--dry-run');

const WORKSHOP_TITLES = {
  'design-products-with-ai': 'Designing product journeys with AI. Not just websites.',
  'ship-client-ready-websites': 'Ship client-ready websites in hours, not months.',
};

function fail(msg, hint) {
  console.error('\n  ' + msg);
  if (hint) console.error('  ' + hint);
  console.error('');
  process.exitCode = 1;
}

async function main() {
  console.log('\nBackfilling registrations into the sheet' + (DRY ? ' (dry run)' : '') + '\n');

  if (!URL || !KEY) {
    return fail(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set.',
      'Supabase dashboard -> Project Settings -> API. Use the service_role key.'
    );
  }
  if (!DRY && !process.env.SHEETS_WEBHOOK_URL) {
    return fail(
      'SHEETS_WEBHOOK_URL is not set.',
      'Deploy scripts/registrations-sheet.gs first, then pass its /exec URL.'
    );
  }

  const supabase = createClient(URL, KEY, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from('enrollments')
    .select('workshop_slug, name, email, whatsapp, status, created_at')
    .order('created_at', { ascending: true });

  if (error) return fail('Could not read enrollments: ' + error.message);
  if (!data?.length) {
    console.log('  No registrations in the database yet. Nothing to backfill.\n');
    return;
  }

  console.log(`  ${data.length} registration${data.length === 1 ? '' : 's'} found.\n`);

  let done = 0;
  let failed = 0;

  for (const r of data) {
    const label = `${r.email} · ${r.workshop_slug} · ${r.status}`;

    if (DRY) {
      console.log('  would write  ' + label);
      done++;
      continue;
    }

    const res = await recordRegistration({
      slug: r.workshop_slug,
      workshopTitle: WORKSHOP_TITLES[r.workshop_slug] || r.workshop_slug,
      name: r.name,
      email: r.email,
      whatsapp: r.whatsapp,
      status: r.status,
    });

    if (res.ok) {
      console.log(`  ${String(res.action).padEnd(9)}    ${label}`);
      done++;
    } else {
      console.log(`  FAILED       ${label} — ${res.error}`);
      failed++;
    }

    // Apps Script takes a script-wide lock per request and has a daily quota.
    // Pacing costs nothing on a list this size and avoids tripping either.
    await new Promise((r2) => setTimeout(r2, 250));
  }

  console.log(`\n  ${done} written, ${failed} failed.\n`);
  if (failed) process.exitCode = 1;
}

await main();
