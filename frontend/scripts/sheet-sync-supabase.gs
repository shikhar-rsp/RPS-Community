/* =============================================================================
   Pull registrations from Supabase into this sheet, on a timer.

   This is the whole integration. It lives inside the spreadsheet, reads the
   enrollments table directly, and needs nothing added to the website and
   nothing deployed. The first run brings across every registration that already
   exists, so there is no separate backfill.

   It replaces the push setup (registrations-sheet.gs + SHEETS_WEBHOOK_URL) for
   anyone who would rather configure one thing than three. Running both is safe
   — they upsert on the same key and converge on the same rows — but there is no
   reason to.

   ---------------------------------------------------------------------------
   INSTALL — about five minutes, once

     1. Open the sheet -> Extensions -> Apps Script.
     2. Paste this whole file into Code.gs, replacing what is there.
     3. Get the two Supabase values: dashboard -> Project Settings -> API.
          Project URL        e.g. https://abcdefgh.supabase.co
          service_role key   the long "eyJ..." one, NOT anon public
     4. In the editor, run  setUp  once. It will ask for the two values through
        a prompt, then store them in Script Properties.

        Paste them into the prompt, not into this file. Script Properties are
        not part of the code, so the key does not travel when this file is
        shared, copied, or committed.

     5. Authorise when Google asks. It warns that the app is unverified, which
        is expected for your own bound script: Advanced -> Go to project.
     6. Run  syncNow  to pull everything across. Check the sheet.
     7. Run  startAutoSync  to keep it current every 15 minutes.

   To stop it later, run  stopAutoSync.

   ---------------------------------------------------------------------------
   WHY service_role AND WHAT THAT MEANS

   The enrollments table is behind row-level security: the anon key can only
   read the caller's own row, which from a script is nobody. The service_role
   key bypasses RLS, which is the only way to read the whole list — and is also
   why it must never end up in a browser, a public sheet, or this file.

   Anyone who can open the Apps Script editor on this sheet can read the key.
   Keep the sheet's edit access to the people who should already have it.
   ============================================================================= */

var PROP_URL = 'SUPABASE_URL';
var PROP_KEY = 'SUPABASE_SERVICE_ROLE_KEY';

var HEADERS = [
  'Registered at (IST)',
  'Name',
  'Email',
  'WhatsApp',
  'Status',
  'Workshop',
  'Synced at (IST)',
];

/* Slug -> the title a human reading this sheet would recognise. A slug that is
   not listed falls through as itself, so a new workshop still syncs. */
var WORKSHOP_TITLES = {
  'design-products-with-ai': 'Designing product journeys with AI. Not just websites.',
  'ship-client-ready-websites': 'Ship client-ready websites in hours, not months.',
};

// ---------------------------------------------------------------- setup

function setUp() {
  var ui = SpreadsheetApp.getUi();

  var urlRes = ui.prompt(
    'Supabase project URL',
    'Dashboard -> Project Settings -> API -> Project URL\n(e.g. https://abcdefgh.supabase.co)',
    ui.ButtonSet.OK_CANCEL
  );
  if (urlRes.getSelectedButton() !== ui.Button.OK) return;

  var keyRes = ui.prompt(
    'Supabase service_role key',
    'Same page, under Project API keys. The long "eyJ..." one.\nNOT the anon public key.',
    ui.ButtonSet.OK_CANCEL
  );
  if (keyRes.getSelectedButton() !== ui.Button.OK) return;

  var url = String(urlRes.getResponseText() || '').trim().replace(/\/+$/, '');
  var key = String(keyRes.getResponseText() || '').trim();

  if (!/^https:\/\/.+\.supabase\.co$/.test(url)) {
    ui.alert('That does not look like a Supabase project URL. Expected https://something.supabase.co');
    return;
  }
  // A Supabase key is a JWT: three dot-separated parts starting "eyJ". This
  // catches the most common mistake, which is pasting the project password or
  // the dashboard login instead.
  if (key.indexOf('eyJ') !== 0 || key.split('.').length !== 3) {
    ui.alert(
      'That does not look like a Supabase API key.\n\n' +
      'It should be a long token beginning "eyJ" with two dots in it — not a ' +
      'password and not a username. Project Settings -> API -> service_role.'
    );
    return;
  }

  PropertiesService.getScriptProperties().setProperties({
    SUPABASE_URL: url,
    SUPABASE_SERVICE_ROLE_KEY: key,
  });

  ui.alert('Saved. Now run syncNow to pull the registrations in.');
}

// ---------------------------------------------------------------- the sync

function syncNow() {
  var props = PropertiesService.getScriptProperties();
  var url = props.getProperty(PROP_URL);
  var key = props.getProperty(PROP_KEY);

  if (!url || !key) {
    throw new Error('Not configured yet — run setUp first.');
  }

  var res = UrlFetchApp.fetch(
    url + '/rest/v1/enrollments?select=workshop_slug,name,email,whatsapp,status,created_at&order=created_at.asc',
    {
      method: 'get',
      headers: { apikey: key, Authorization: 'Bearer ' + key },
      muteHttpExceptions: true,
    }
  );

  var code = res.getResponseCode();
  var text = res.getContentText();

  if (code === 401 || code === 403) {
    throw new Error(
      'Supabase rejected the key (' + code + '). It must be the service_role key, ' +
      'not anon public — the anon key can only read a signed-in user\'s own row. ' +
      'Run setUp again with the right one.'
    );
  }
  if (code !== 200) {
    throw new Error('Supabase returned ' + code + ': ' + text.slice(0, 300));
  }

  var rows = JSON.parse(text);
  if (!rows.length) {
    Logger.log('No registrations in the database yet. Nothing to sync.');
    return { read: 0, appended: 0, updated: 0 };
  }

  // One lock for the whole sync, so a 15-minute trigger firing while a previous
  // run is still writing cannot interleave with it.
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    return writeAll(rows);
  } finally {
    lock.releaseLock();
  }
}

function writeAll(rows) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  var now = stamp();

  // Read the sheet once and index it, rather than scanning it per row. With a
  // few hundred registrations the per-row scan is what makes a sync time out.
  var index = {};
  var last = sheet.getLastRow();
  var existing = last > 1 ? sheet.getRange(2, 1, last - 1, HEADERS.length).getValues() : [];
  for (var i = 0; i < existing.length; i++) {
    index[keyOf(existing[i][2], existing[i][5])] = i + 2;
  }

  var appended = 0;
  var updated = 0;
  var toAppend = [];

  for (var j = 0; j < rows.length; j++) {
    var r = rows[j];
    var title = WORKSHOP_TITLES[r.workshop_slug] || r.workshop_slug;
    var at = index[keyOf(r.email, title)];

    if (at) {
      // created_at is the truth for when they registered, so it is rewritten
      // too — a row edited by hand in the sheet gets corrected on the next run.
      sheet.getRange(at, 1, 1, HEADERS.length).setValues([
        [istFrom(r.created_at), r.name || '', String(r.email || '').toLowerCase(),
         r.whatsapp || '', r.status || '', title, now],
      ]);
      updated++;
    } else {
      toAppend.push([
        istFrom(r.created_at), r.name || '', String(r.email || '').toLowerCase(),
        r.whatsapp || '', r.status || '', title, now,
      ]);
      appended++;
    }
  }

  // One write for every new row rather than one call each.
  if (toAppend.length) {
    sheet.getRange(sheet.getLastRow() + 1, 1, toAppend.length, HEADERS.length).setValues(toAppend);
  }

  var summary = { read: rows.length, appended: appended, updated: updated };
  Logger.log(JSON.stringify(summary));
  return summary;
}

/* Rows are identified by email + workshop, so one person registering for two
   workshops keeps two rows instead of the second overwriting the first. */
function keyOf(email, workshop) {
  return String(email || '').trim().toLowerCase() + ' ' + String(workshop || '').trim().toLowerCase();
}

function istFrom(iso) {
  if (!iso) return '';
  return Utilities.formatDate(new Date(iso), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
}

function stamp() {
  return Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
}

// ---------------------------------------------------------------- the timer

function startAutoSync() {
  stopAutoSync();
  ScriptApp.newTrigger('syncNow').timeBased().everyMinutes(15).create();
  Logger.log('Syncing every 15 minutes.');
}

function stopAutoSync() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'syncNow') ScriptApp.deleteTrigger(triggers[i]);
  }
}

/* Clears the stored credentials. Run this if the key is ever exposed — then
   rotate it in Supabase as well, because deleting it here does not revoke it. */
function forgetCredentials() {
  PropertiesService.getScriptProperties().deleteAllProperties();
  Logger.log('Credentials cleared from this script. Rotate the key in Supabase too.');
}

/* Puts a menu on the sheet so the team can sync without opening the editor. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Registrations')
    .addItem('Sync now', 'syncNow')
    .addSeparator()
    .addItem('Connect to Supabase…', 'setUp')
    .addItem('Sync every 15 minutes', 'startAutoSync')
    .addItem('Stop syncing', 'stopAutoSync')
    .addToUi();
}
