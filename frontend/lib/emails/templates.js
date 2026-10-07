/* =============================================================================
   Ready-made messages for the "Email everyone" box in Admin → Registrations.

   Plain text with one placeholder, {name}, which becomes each person's first
   name. Anything in [square brackets] is for the admin to fill in — the
   server refuses to send while one is left, so a reminder can never go out
   still saying "[paste the Google Meet link here]".

   Client-safe: only formatting helpers, no server imports.
   ============================================================================= */

import { dayShort, time, durationLabel, dateFull } from '@/lib/community/workshops';

export const PLACEHOLDER = /\[[^\]\n]{2,80}\]/;

function title(w) {
  return String(w.title || '').replace(/[.\s]+$/, '');
}

const MEET_RE = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/i;

export function templatesFor(w) {
  if (!w) return [];
  const meet = MEET_RE.test(String(w.meetLink || '')) ? w.meetLink : '[paste the Google Meet link here]';
  const when = `${dayShort(w.dateTime)} at ${time(w.dateTime)}`;

  return [
    {
      id: 'day-before',
      label: 'Day-before reminder',
      subject: `Tomorrow: ${title(w)} · ${time(w.dateTime)}`,
      body: [
        'Hi {name},',
        `Quick reminder — “${title(w)}” is tomorrow, ${when} (${durationLabel(w)}), live on Google Meet.`,
        `Join here: ${meet}`,
        'To get the most out of it, have these ready:\n- Your current portfolio, or whatever you have so far\n- The AI tool you already use\n- Your questions for the live Q&A',
        'Join a few minutes early so we can start on time.',
        'See you there,\nThe RPS Cohorts team',
      ].join('\n\n'),
    },
    {
      id: 'starting-soon',
      label: 'Starting in 1 hour',
      subject: `Starting in 1 hour: ${title(w)}`,
      body: [
        'Hi {name},',
        `We start in an hour — ${time(w.dateTime)} today.`,
        `Join here: ${meet}`,
        'See you in the room,\nThe RPS Cohorts team',
      ].join('\n\n'),
    },
    {
      id: 'recording',
      label: 'Recording is up',
      subject: `The recording is up: ${title(w)}`,
      body: [
        'Hi {name},',
        `Thank you for joining “${title(w)}” on ${dateFull(w.dateTime)}.`,
        'The full recording and the workshop files are here: [paste the link here]',
        'The RPS Cohorts team',
      ].join('\n\n'),
    },
    { id: 'blank', label: 'Write my own', subject: '', body: 'Hi {name},\n\n' },
  ];
}
