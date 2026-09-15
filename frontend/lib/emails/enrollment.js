/* =============================================================================
   "You're in" — the mail that goes out the moment a seat is taken.

   Two versions of the same message, because the database decides between a seat
   and the waitlist and the reader has to be told which one they got. One
   cheerful mail for both would mean somebody turns up to a session they have no
   seat at.

   Built as a string rather than with a template library: this is one email, it
   has to survive Gmail and Outlook, and those two want tables and inline styles
   — which is the opposite of what a JSX-to-HTML tool produces.
   ============================================================================= */

import { sendEmail } from '@/lib/mail';
import { siteUrl } from '@/lib/site-url';
import { bySlug, host, dayShort, time, dateFull, calendarUrl } from '@/lib/community/workshops';

const ACCENT = '#FF630B';
const INK = '#13100E';
const MUTED = '#6B6259';
const LINE = '#E8E2DA';
const PAPER = '#FBF8F4';

/* Workshop copy is ours, but the name is typed by the person registering and
   lands in this HTML. Escape everything interpolated, without exception. */
function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* The seed data carries a placeholder Meet URL until RPS sets the real one, and
   a link with "#link-set-by-rps-before-the-session" in it must never go out —
   someone would click it the morning of the session and land nowhere. Only a
   real room code counts. */
function realMeetLink(w) {
  const url = String(w?.meetLink || '');
  return /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/i.test(url) ? url : null;
}

function firstName(name) {
  const first = String(name || '').trim().split(/\s+/)[0];
  return first || 'there';
}

function button(href, label) {
  return (
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">' +
    '<tr><td style="border-radius:8px;background:' + ACCENT + ';">' +
    '<a href="' + esc(href) + '" style="display:inline-block;padding:13px 26px;' +
    'font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#ffffff;' +
    'text-decoration:none;border-radius:8px;">' + esc(label) + '</a>' +
    '</td></tr></table>'
  );
}

function row(label, value) {
  return (
    '<tr>' +
    '<td style="padding:10px 0;border-bottom:1px solid ' + LINE + ';font-family:Helvetica,Arial,sans-serif;' +
    'font-size:13px;color:' + MUTED + ';width:96px;vertical-align:top;">' + esc(label) + '</td>' +
    '<td style="padding:10px 0;border-bottom:1px solid ' + LINE + ';font-family:Helvetica,Arial,sans-serif;' +
    'font-size:15px;color:' + INK + ';font-weight:600;">' + value + '</td>' +
    '</tr>'
  );
}

function sub(textValue) {
  return '<br><span style="font-weight:400;font-size:13px;color:' + MUTED + ';">' + esc(textValue) + '</span>';
}

/* ---------------------------------------------------------------- the email */
export function buildEnrollmentEmail({ name, workshop, status }) {
  const w = workshop;
  const waitlisted = status === 'WAITLISTED';
  const h = host(w.hostId);
  const meet = realMeetLink(w);
  // Only offered alongside a real room — a PIN for a placeholder link is worse
  // than no PIN, because someone would sit on hold in an empty meeting.
  const dialIn = meet && w.meetPhone?.number && w.meetPhone?.pin ? w.meetPhone : null;
  const when = dayShort(w.dateTime) + ' · ' + time(w.dateTime);
  const mins = String(w.durationMins || 90);

  // Every workshop title is a full sentence ending in a full stop, so anything
  // appended to it reads as a new one ("...looking like it. on Sat 19 Sep").
  const titleLine = w.title.replace(/[.\s]+$/, '');

  const subject = waitlisted
    ? "You're on the waitlist — " + titleLine
    : "You're in — " + titleLine + ' · ' + dayShort(w.dateTime);

  const headline = waitlisted ? 'You’re on the waitlist.' : 'You’re in.';

  const opener = waitlisted
    ? 'This one filled up before your registration landed, so you’re first in line rather than in the room. ' +
      'Seats do come free — people’s weeks change — and if one does it’s yours automatically, ' +
      'and we’ll email you straight away.'
    : 'Your seat at <strong>' + esc(w.title) + '</strong> is confirmed. Here’s everything you need.';

  const facts =
    row('When', esc(when) + sub(dateFull(w.dateTime) + ' · ' + mins + ' minutes')) +
    row(
      'Where',
      meet
        ? '<a href="' + esc(meet) + '" style="color:' + ACCENT + ';text-decoration:none;">' +
          esc(meet.replace(/^https:\/\//, '')) + '</a>' +
          (dialIn ? sub('Or dial ' + dialIn.number + ' (' + dialIn.country + '), PIN ' + dialIn.pin) : '')
        : 'Google Meet' + sub('The link goes to your WhatsApp before the session.')
    ) +
    (h ? row('With', esc(h.name) + sub(h.title)) : '') +
    row('Cost', 'Free' + sub('No card, no upsell at the end.'));

  // calendarUrl() takes the workshop's meetLink at face value and writes it
  // into the entry's location. Hand it the checked one so a placeholder never
  // ends up saved in somebody's calendar.
  const calUrl = calendarUrl({ ...w, meetLink: meet });

  const cta = waitlisted
    ? button(siteUrl('/dashboard'), 'My workshops')
    : button(calUrl, 'Add to calendar');

  const closing = waitlisted
    ? 'Nothing to do for now. We’ll write the moment a seat opens.'
    : 'Bring the tool you already use — the method holds whichever it is. A recording and the files ' +
      'follow afterwards, whether or not you make it live.';

  // The preview line every inbox shows next to the subject. Hidden in the body.
  const preview = waitlisted
    ? 'First in line for ' + w.title
    : when + ' on Google Meet. Everything you need is inside.';

  const html =
    '<!doctype html>\n<html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(subject) + '</title></head>' +
    '<body style="margin:0;padding:0;background:' + PAPER + ';">' +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">' + esc(preview) + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
    'style="background:' + PAPER + ';padding:32px 16px;"><tr><td align="center">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
    'style="max-width:560px;background:#ffffff;border:1px solid ' + LINE + ';border-radius:14px;">' +

    '<tr><td style="padding:32px 32px 0;">' +
    '<p style="margin:0 0 24px;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;' +
    'letter-spacing:.08em;text-transform:uppercase;color:' + ACCENT + ';">RPS Cohorts</p>' +
    '<h1 style="margin:0 0 14px;font-family:Helvetica,Arial,sans-serif;font-size:27px;line-height:1.25;' +
    'color:' + INK + ';">' + esc(headline) + '</h1>' +
    '<p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;' +
    'color:' + INK + ';">Hi ' + esc(firstName(name)) + ',</p>' +
    '<p style="margin:0 0 24px;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;' +
    'color:' + INK + ';">' + opener + '</p>' +
    '</td></tr>' +

    '<tr><td style="padding:0 32px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
    'style="border-top:1px solid ' + LINE + ';">' + facts + '</table>' +
    '</td></tr>' +

    '<tr><td style="padding:26px 32px 0;">' + cta + '</td></tr>' +

    '<tr><td style="padding:22px 32px 32px;">' +
    '<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.65;' +
    'color:' + MUTED + ';">' + esc(closing) + '</p></td></tr>' +

    '<tr><td style="padding:20px 32px;border-top:1px solid ' + LINE + ';background:' + PAPER + ';' +
    'border-radius:0 0 14px 14px;">' +
    (waitlisted
      ? ''
      : '<p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;' +
        'color:' + MUTED + ';">Can’t make it? <a href="' + esc(siteUrl('/dashboard')) + '" ' +
        'style="color:' + MUTED + ';">Release your seat</a> so someone on the waitlist can have it.</p>') +
    '<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;' +
    'color:' + MUTED + ';">You’re getting this because you registered for a workshop at RPS Cohorts.</p>' +
    '</td></tr>' +

    '</table></td></tr></table></body></html>';

  /* A real alternative, not a stripped copy — every link that matters is spelled
     out, because nothing here is clickable. */
  const lines = [
    headline,
    '',
    'Hi ' + firstName(name) + ',',
    '',
    waitlisted
      ? '"' + w.title + '" filled up before your registration landed, so you’re first in line ' +
        'rather than in the room. Seats do come free, and if one does it’s yours automatically ' +
        '— we’ll email you straight away.'
      : 'Your seat at "' + w.title + '" is confirmed.',
    '',
    'When:  ' + when + ' (' + dateFull(w.dateTime) + ', ' + mins + ' minutes)',
    'Where: ' + (meet || 'Google Meet — the link goes to your WhatsApp before the session.'),
    dialIn
      ? '       Or dial ' + dialIn.number + ' (' + dialIn.country + '), PIN ' + dialIn.pin
      : null,
    h ? 'With:  ' + h.name + ', ' + h.title : null,
    'Cost:  Free. No card, no upsell at the end.',
    '',
    waitlisted
      ? 'Your workshops: ' + siteUrl('/dashboard')
      : 'Add to calendar: ' + calUrl,
    '',
    closing,
    '',
    waitlisted
      ? null
      // Trailing newline rather than a separate '' entry, so dropping this
      // whole line on the waitlist mail doesn't leave a double gap behind it.
      : 'Can’t make it? Release your seat so someone on the waitlist can have it: ' +
        siteUrl('/dashboard') + '\n',
    'You’re getting this because you registered for a workshop at RPS Cohorts.',
  ];

  return { subject, html, text: lines.filter((l) => l !== null).join('\n') };
}

/* Fire the confirmation for one enrolment. Resolves to the send result and
   never throws — the caller has already saved the seat by the time this runs,
   and a mail problem must not turn that into a failure. */
export async function sendEnrollmentEmail({ to, name, slug, status }) {
  const workshop = bySlug(slug);
  if (!workshop) {
    console.error('[mail] No workshop content for "' + slug + '" — confirmation not sent.');
    return { ok: false, error: 'Unknown workshop.' };
  }
  const { subject, html, text } = buildEnrollmentEmail({ name, workshop, status });
  return sendEmail({ to, subject, html, text });
}
