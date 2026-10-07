/* =============================================================================
   A message from the team to everyone on a workshop's list — the reminder the
   day before, the recording afterwards, anything else. Written in the admin
   page as plain text; sent in the same frame as the confirmation, with the
   workshop's thumbnail on top.
   ============================================================================= */

import { MUTED, FONT, INK, abs, esc, firstName, emailBanner, textToHtml, p, frame } from '@/lib/emails/layout';
import { workshopUrl } from '@/lib/community/workshops';

/* {name} → the person's first name, everywhere it appears. */
export function personalise(text, name) {
  return String(text || '').replace(/\{name\}/gi, firstName(name));
}

export function buildBroadcastEmail({ name, workshop: w, subject, body }) {
  const text = personalise(body, name);
  const subj = personalise(subject, name);
  const page = abs(workshopUrl(w));

  const html = frame({
    title: subj,
    preview: text.replace(/\s+/g, ' ').slice(0, 140),
    banner: emailBanner(w),
    bannerHref: page,
    body:
      '<p style="margin:0 0 18px;font-family:' + FONT + ';font-size:13px;font-weight:700;' +
      'letter-spacing:.08em;text-transform:uppercase;color:' + INK + ';opacity:.7;">' +
      esc(w.cohortLabel ? 'RPS Cohorts · ' + w.cohortLabel : 'RPS Cohorts') + '</p>' +
      textToHtml(text),
    footer: p(
      'You’re getting this because you registered for <a href="' + esc(page) + '" style="color:' + MUTED + ';">' +
        esc(w.title) + '</a> at RPS Cohorts.',
      { size: 12, color: MUTED, margin: '0' }
    ),
  });

  return {
    subject: subj,
    html,
    text: text + '\n\n—\nYou’re getting this because you registered for "' + w.title + '" at RPS Cohorts.\n' + page,
  };
}
