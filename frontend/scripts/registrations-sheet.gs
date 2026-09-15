/* =============================================================================
   Apps Script for the "Cohort Ep2 Registrations" sheet.

   This file does not run in the Next.js app. It is pasted into the spreadsheet
   itself, which is what lets the site write rows without a Google Cloud project
   or a service-account key.

   INSTALL (the sheet's owner has to do this — currently rishi@)

     1. Open the sheet → Extensions → Apps Script.
     2. Delete whatever is in Code.gs and paste this whole file in.
     3. Change SECRET below to a long random string. Keep a copy.
     4. Save, then Deploy → New deployment → type "Web app":
          Execute as:      Me
          Who has access:  Anyone
        "Anyone" is required — the site calls this without a Google login. The
        SECRET is what actually guards it, which is why it must not stay as the
        placeholder.
     5. Authorise when prompted. Google will warn that the app is unverified;
        that is expected for your own bound script — Advanced → Go to project.
     6. Copy the Web app URL (ends in /exec) and give it, with the SECRET, to
        whoever sets the environment variables:
          SHEETS_WEBHOOK_URL    = the /exec URL
          SHEETS_WEBHOOK_SECRET = the SECRET
     7. Redeploy after ANY later edit: Deploy → Manage deployments → the pencil
        icon → Version: New version. Editing the code alone changes nothing that
        is live, which is the usual reason a change appears to do nothing.

   Rows are keyed on workshop + email, so a repeat registration updates the row
   it already has rather than adding a second one, and a cancellation marks the
   existing row rather than leaving a stale name on the list.
   ============================================================================= */

var SECRET = 'CHANGE-ME-TO-SOMETHING-LONG-AND-RANDOM';

var HEADERS = [
  'Registered at (IST)',
  'Name',
  'Email',
  'WhatsApp',
  'Status',
  'Workshop',
  'Updated at (IST)',
];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return reply({ ok: false, error: 'Empty request.' });

    var body = JSON.parse(e.postData.contents);

    if (SECRET === 'CHANGE-ME-TO-SOMETHING-LONG-AND-RANDOM') {
      return reply({ ok: false, error: 'The script SECRET is still the placeholder.' });
    }
    if (String(body.token || '') !== SECRET) {
      return reply({ ok: false, error: 'Bad token.' });
    }
    if (!body.email || !body.slug) {
      return reply({ ok: false, error: 'A row needs at least an email and a workshop.' });
    }

    // Two registrations landing at once would otherwise both read the same last
    // row and one would overwrite the other.
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      return reply(writeRow(body));
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

function writeRow(body) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

  // First write of all: lay the headers down and freeze them.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  var now = stamp();
  var email = String(body.email).trim().toLowerCase();
  var slug = String(body.slug).trim();

  var found = findRow(sheet, slug, body.workshopTitle, email);

  if (found > 0) {
    // Status and number can both change after the fact; the original
    // registration time must not.
    sheet.getRange(found, 2).setValue(body.name || '');
    sheet.getRange(found, 4).setValue(body.whatsapp || '');
    sheet.getRange(found, 5).setValue(body.status || '');
    sheet.getRange(found, 7).setValue(now);
    return { ok: true, action: 'updated', row: found };
  }

  sheet.appendRow([
    now,
    body.name || '',
    email,
    body.whatsapp || '',
    body.status || '',
    body.workshopTitle || slug,
    now,
  ]);
  return { ok: true, action: 'appended', row: sheet.getLastRow() };
}

/* Match on email AND workshop, so one person registering for two workshops gets
   two rows rather than the second overwriting the first. The Workshop column
   holds a human title, so both the title and the slug count as a match — the
   slug covers rows written before a title was being sent, and survives a later
   change of title. */
function findRow(sheet, slug, title, email) {
  var last = sheet.getLastRow();
  if (last < 2) return 0;

  var wanted = [String(slug || ''), String(title || '')]
    .map(function (v) { return v.trim().toLowerCase(); })
    .filter(function (v) { return v; });

  var values = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][2] || '').trim().toLowerCase() !== email) continue;
    var rowWorkshop = String(values[i][5] || '').trim().toLowerCase();
    if (wanted.indexOf(rowWorkshop) === -1) continue;
    return i + 2;
  }
  return 0;
}

function stamp() {
  return Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/* Run this from the Apps Script editor (select testWrite → Run) to check the
   sheet end of things before the site is pointed at it. It writes a row you can
   then delete. */
function testWrite() {
  var out = writeRow({
    name: 'Test Person',
    email: 'test@example.com',
    whatsapp: '+91 90000 00000',
    status: 'REGISTERED',
    slug: 'design-products-with-ai',
    workshopTitle: 'Designing product journeys with AI. Not just websites.',
  });
  Logger.log(JSON.stringify(out));
}
