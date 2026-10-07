'use client';
import { useMemo, useState, useTransition } from 'react';
import styles from './registrations.module.css';
import { sendWorkshopEmail, sendConfirmationTest } from './actions';
import { bySlug } from '@/lib/community/workshops';
import { templatesFor, PLACEHOLDER } from '@/lib/emails/templates';

/* "Email everyone on this list" — for the workshop picked at the top of the
   page. Pick a ready-made message (the day-before reminder is the one this is
   mostly for), fill in the [bracketed] bit, send yourself a test, then send it
   to everyone approved. Sending twice never emails anyone twice: see
   sendWorkshopEmail() in ./actions.js. */

const DEFAULT_TEST_TO = 'dheena@rockpaperscissors.studio';

export default function EmailBox({ slug, approved, viewer }) {
  const w = useMemo(() => bySlug(slug), [slug]);
  const templates = useMemo(() => templatesFor(w), [w]);

  const [pick, setPick] = useState(templates[0]?.id || 'blank');
  const [subject, setSubject] = useState(templates[0]?.subject || '');
  const [body, setBody] = useState(templates[0]?.body || '');
  const [testTo, setTestTo] = useState(DEFAULT_TEST_TO || viewer || '');
  const [confirming, setConfirming] = useState(false);
  const [note, setNote] = useState(null); // { kind: 'ok' | 'warn', text }
  const [busy, startTransition] = useTransition();

  if (!w) return null;

  const left = (subject + '\n' + body).match(PLACEHOLDER);

  function choose(id) {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setPick(id);
    setSubject(t.subject);
    setBody(t.body);
    setConfirming(false);
    setNote(null);
  }

  function report(res, label) {
    if (!res?.ok) return setNote({ kind: 'warn', text: res?.error || 'Could not send it.' });
    if (res.to) return setNote({ kind: 'ok', text: `Sent the “you’re in” email to ${res.to}.` });
    const bits = [`${label}: sent to ${res.sent} of ${res.total}.`];
    if (res.failed?.length) bits.push(`Didn’t go to ${res.failed.join(', ')}.`);
    if (res.remaining) bits.push(`${res.remaining} still to go — press Send again to finish. Nobody gets it twice.`);
    setNote({ kind: res.failed?.length || res.remaining ? 'warn' : 'ok', text: bits.join(' ') });
  }

  function sendTest() {
    setNote(null);
    startTransition(async () => {
      const res = await sendWorkshopEmail({ slug, subject, body, test: true, testTo });
      if (res?.ok) setNote({ kind: 'ok', text: `Test sent to ${testTo || viewer}. Check the inbox, then send it to everyone.` });
      else report(res, 'Test');
    });
  }

  function sendConfirmation() {
    setNote(null);
    startTransition(async () => report(await sendConfirmationTest({ slug, testTo }), 'Confirmation'));
  }

  function sendAll() {
    setNote(null);
    setConfirming(false);
    startTransition(async () => report(await sendWorkshopEmail({ slug, subject, body }), 'Done'));
  }

  return (
    <section className={styles.mailBox} aria-labelledby="mail-h">
      <div className={styles.mailHead}>
        <h2 id="mail-h" className={styles.mailTitle}>Email everyone on this list</h2>
        <span className={styles.trashSub}>
          Goes to the {approved} approved {approved === 1 ? 'person' : 'people'} for {w.cohortLabel || w.title},
          from cohorts@rockpaperscissors.studio, with the workshop thumbnail on top.
        </span>
      </div>

      <div className={styles.seg} role="group" aria-label="Start from">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            className={styles.segBtn}
            aria-pressed={pick === t.id}
            onClick={() => choose(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <label className={styles.mailLabel} htmlFor="mail-subject">Subject</label>
      <input
        id="mail-subject"
        className={styles.search}
        value={subject}
        onChange={(e) => { setSubject(e.target.value); setConfirming(false); }}
      />

      <label className={styles.mailLabel} htmlFor="mail-body">Message</label>
      <textarea
        id="mail-body"
        className={styles.mailBody}
        rows={13}
        value={body}
        onChange={(e) => { setBody(e.target.value); setConfirming(false); }}
      />
      <p className={styles.mailHint}>
        <code>{'{name}'}</code> becomes each person’s first name. Links become clickable.
        {left ? <> <b className={styles.mailNeed}>Fill in {left[0]} before sending.</b></> : null}
      </p>

      <div className={styles.mailRow}>
        <label className={styles.mailLabelInline} htmlFor="mail-test">Test to</label>
        <input
          id="mail-test"
          type="email"
          className={styles.search}
          value={testTo}
          onChange={(e) => setTestTo(e.target.value)}
        />
        <button type="button" className={styles.act} disabled={busy || !!left} onClick={sendTest}>
          Send test
        </button>
        <button type="button" className={styles.act} disabled={busy} onClick={sendConfirmation}>
          Send me the “you’re in” email
        </button>
      </div>

      <div className={styles.mailRow}>
        {confirming ? (
          <span className={styles.confirm}>
            <span className={styles.ask}>
              Send “{subject}” to {approved} {approved === 1 ? 'person' : 'people'}?
            </span>
            <button type="button" className="btn go" disabled={busy} onClick={sendAll}>
              Yes, send it
            </button>
            <button type="button" className={styles.act} disabled={busy} onClick={() => setConfirming(false)}>
              Not yet
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="btn go"
            disabled={busy || !!left || !approved || !subject.trim()}
            onClick={() => setConfirming(true)}
          >
            {busy ? 'Sending…' : `Send to ${approved} ${approved === 1 ? 'person' : 'people'}`}
          </button>
        )}
      </div>

      {note && (
        <div className={note.kind === 'ok' ? styles.note2 : styles.warn} role="status">
          {note.text}
        </div>
      )}
    </section>
  );
}
