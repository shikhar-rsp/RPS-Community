'use client';
import { useMemo, useState, useTransition } from 'react';
import SiteShell from '@/components/community/SiteShell';
import { StatusChip } from '@/components/community/Bits';
import styles from './registrations.module.css';
import { setEnrollmentStatus, removeEnrollment } from './actions';

/* The list the team works from. Everything here is a view over rows the server
   already decided this person may see — the filtering is convenience, never a
   permission boundary. */

const IST = 'Asia/Kolkata';
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function istParts(iso) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: IST,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
    .formatToParts(new Date(iso))
    .reduce((a, p) => ((a[p.type] = p.value), a), {});
}

// "14 Sep · 2:42PM"
function whenShort(iso) {
  if (!iso) return '';
  const p = istParts(iso);
  return `${p.day} ${MON[Number(p.month) - 1]} · ${p.hour}:${p.minute}${p.dayPeriod.toUpperCase()}`;
}

// "2026-09-14 14:42" — sorts and reads the same in a spreadsheet.
function whenExact(iso) {
  if (!iso) return '';
  const p = istParts(iso);
  const h24 = (Number(p.hour) % 12) + (p.dayPeriod.toUpperCase() === 'PM' ? 12 : 0);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')} ` +
    `${String(h24).padStart(2, '0')}:${p.minute}`;
}

/* Excel and Sheets both read a leading = + - @ as the start of a formula, so a
   name or note beginning with one would execute on open. Prefixing an
   apostrophe is the standard defusal; the quoting handles the rest. */
function csvCell(value) {
  const s = String(value ?? '');
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export default function RegistrationsClient({ rows, failed, viewer, workshops, initialSlug, since }) {
  const [q, setQ] = useState('');
  // Opens on the most recent session rather than on everything at once: the
  // question this page gets asked is almost always about the next one.
  const [slug, setSlug] = useState(initialSlug);
  const [status, setStatus] = useState('all');
  const [busyId, setBusyId] = useState(null);
  // Which row is asking "remove?" — one at a time, so a second click elsewhere
  // puts the question away rather than arming two of them.
  const [confirmId, setConfirmId] = useState(null);
  const [problem, setProblem] = useState('');
  const [removed, setRemoved] = useState('');
  const [, startTransition] = useTransition();

  const selected = workshops.find((w) => w.slug === slug) || null;

  // Filtered by workshop only — what the counts below are counting, and what
  // the status filter then narrows.
  const inWorkshop = useMemo(
    () => (slug === 'all' ? rows : rows.filter((r) => r.slug === slug)),
    [rows, slug]
  );

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return inWorkshop.filter((r) => {
      if (status !== 'all' && r.status !== status) return false;
      if (!needle) return true;
      return [r.name, r.email, r.whatsapp]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(needle));
    });
  }, [inWorkshop, q, status]);

  /* Counts describe the selected workshop, not the database. A number next to a
     name that is filtered out would be answering a question nobody asked. */
  const counts = useMemo(() => {
    const c = { REGISTERED: 0, WAITLISTED: 0, ATTENDED: 0 };
    inWorkshop.forEach((r) => { if (c[r.status] !== undefined) c[r.status] += 1; });
    return c;
  }, [inWorkshop]);

  /* Approve or waitlist one person. The server re-checks who is asking and
     revalidates the page, so the table redraws from the database rather than
     from an optimistic guess here — the number of seats is not this component's
     to decide. */
  function move(row, next) {
    if (row.status === next || busyId) return;
    setProblem('');
    setBusyId(row.id);
    startTransition(async () => {
      const res = await setEnrollmentStatus(row.id, next);
      setBusyId(null);
      if (!res.ok) setProblem(res.error || 'Could not save that.');
    });
  }

  function remove(row) {
    if (busyId) return;
    setProblem('');
    setBusyId(row.id);
    startTransition(async () => {
      const res = await removeEnrollment(row.id);
      setBusyId(null);
      setConfirmId(null);
      if (res.ok) setRemoved(`${res.name || 'That registration'} is off the list.`);
      else setProblem(res.error || 'Could not remove that.');
    });
  }

  function exportCsv() {
    const header = ['Registered at (IST)', 'Name', 'Email', 'WhatsApp', 'Status', 'Workshop'];
    const body = shown.map((r) => [
      whenExact(r.createdAt), r.name, r.email, r.whatsapp, r.status, r.workshop,
    ]);
    // The BOM is what makes Excel open UTF-8 correctly — without it a name with
    // an accent in it arrives mangled.
    const csv = '﻿' + [header, ...body].map((row) => row.map(csvCell).join(',')).join('\r\n');

    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    const which = selected ? selected.slug : 'all-workshops';
    a.download = `rps-registrations-${which}-${whenExact(new Date().toISOString()).slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <SiteShell active="">
      <div className={'wrap page-top ' + styles.page}>
        <header className={styles.head}>
          <div className={styles.picked}>
            <span className={styles.eyebrow}>Admin</span>
            <h1 className={styles.title}>Registrations</h1>

            {/* Small on purpose. It says which session is on screen and swaps
                it; it is not the headline. */}
            <div className={styles.pickWrap}>
              <select
                id="reg-workshop"
                className={styles.pick}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                aria-label="Which workshop"
              >
                {workshops.map((w) => (
                  <option key={w.slug} value={w.slug}>
                    {w.cohort ? w.cohort + ' · ' : ''}{w.title}
                  </option>
                ))}
                <option value="all">All workshops</option>
              </select>
            </div>

            <p className={styles.sub}>
              {selected && (
                <>
                  <span className={selected.past ? styles.tagPast : styles.tagNext}>
                    {selected.past ? 'Held' : 'Coming up'} {selected.date}
                  </span>
                  {' · '}
                </>
              )}
              {inWorkshop.length} {inWorkshop.length === 1 ? 'person' : 'people'}
              {inWorkshop.length > 0 && (
                <>
                  {/* "Approved", matching the button that sets it — one word
                      for one state, wherever it appears. */}
                  {' · '}{counts.REGISTERED} approved
                  {counts.WAITLISTED > 0 && <>{' · '}{counts.WAITLISTED} on the waitlist</>}
                  {counts.ATTENDED > 0 && <>{' · '}{counts.ATTENDED} attended</>}
                </>
              )}
            </p>
          </div>
          <button className="btn go" type="button" onClick={exportCsv} disabled={!shown.length}>
            Export CSV
          </button>
        </header>

        {failed && (
          <div className={styles.warn} role="alert">
            The registration list could not be read. The page is fine — the database call
            failed. If this persists, check that SUPABASE_SERVICE_ROLE_KEY is set on the server.
          </div>
        )}

        <div className={styles.controls}>
          <input
            id="reg-search"
            className={styles.search}
            type="search"
            placeholder="Search name, email or number"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search registrations"
          />
          <div className={styles.seg} role="group" aria-label="Filter by status">
            {[
              ['all', 'Everyone', inWorkshop.length],
              ['REGISTERED', 'Approved', counts.REGISTERED],
              ['WAITLISTED', 'Waitlist', counts.WAITLISTED],
            ].map(([value, label, n]) => (
              <button
                key={value}
                type="button"
                className={styles.segBtn}
                aria-pressed={status === value}
                onClick={() => setStatus(value)}
              >
                {label}
                <span className={styles.segN}>{n}</span>
              </button>
            ))}
          </div>
        </div>

        {problem && (
          <div className={styles.warn} role="alert">{problem}</div>
        )}
        {removed && !problem && (
          <div className={styles.note2} role="status">
            {removed} Their seat is free again, and the row is kept in the database
            if you need it back.
          </div>
        )}

        {shown.length === 0 ? (
          <div className={styles.empty}>
            <h2>
              {inWorkshop.length
                ? 'Nothing matches that.'
                : 'Nobody has registered for this one yet.'}
            </h2>
            <p>
              {inWorkshop.length
                ? 'Try a different search, or set the status back to any.'
                : 'Registrations appear here the moment someone takes a seat — no import, no sync.'}
            </p>
          </div>
        ) : (
          <div className={styles.scroller}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Registered</th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">WhatsApp</th>
                  <th scope="col">Status</th>
                  {slug === 'all' && <th scope="col">Workshop</th>}
                  <th scope="col"><span className={styles.sr}>Remove</span></th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r, i) => (
                  <tr key={`${r.slug}:${r.email}:${i}`}>
                    <td className={styles.num}>{whenShort(r.createdAt)}</td>
                    <td className={styles.strong}>{r.name}</td>
                    <td><a href={`mailto:${r.email}`}>{r.email}</a></td>
                    <td className={styles.num}>
                      {/* wa.me wants digits only — no +, spaces or dashes. */}
                      <a
                        href={`https://wa.me/${r.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {r.whatsapp}
                      </a>
                    </td>
                    <td>
                      <div className={styles.statusCell}>
                        <StatusChip status={r.status} />
                        {/* Only the state it is not in is offered — a button
                            that re-applies the current status is a no-op
                            dressed up as a choice. */}
                        {r.status === 'REGISTERED' || r.status === 'WAITLISTED' ? (
                          <button
                            type="button"
                            className={styles.act}
                            disabled={busyId === r.id}
                            onClick={() =>
                              move(r, r.status === 'REGISTERED' ? 'WAITLISTED' : 'REGISTERED')
                            }
                          >
                            {busyId === r.id
                              ? 'Saving…'
                              : r.status === 'REGISTERED'
                                ? 'Move to waitlist'
                                : 'Approve'}
                          </button>
                        ) : null}
                      </div>
                    </td>
                    {slug === 'all' && <td className={styles.workshop}>{r.workshop}</td>}
                    <td className={styles.removeCell}>
                      {confirmId === r.id ? (
                        <span className={styles.confirm}>
                          <span className={styles.ask}>Remove?</span>
                          <button
                            type="button"
                            className={styles.danger}
                            disabled={busyId === r.id}
                            onClick={() => remove(r)}
                          >
                            {busyId === r.id ? 'Removing…' : 'Yes'}
                          </button>
                          <button
                            type="button"
                            className={styles.act}
                            disabled={busyId === r.id}
                            onClick={() => setConfirmId(null)}
                          >
                            Keep
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className={styles.remove}
                          disabled={!!busyId}
                          onClick={() => { setRemoved(''); setConfirmId(r.id); }}
                          aria-label={`Remove ${r.name} from the list`}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className={styles.foot}>
          Everyone who registered through a workshop link since {since}. Signing up for
          an account does not appear here.
          <br />
          Signed in as {viewer} · visible to named addresses only.
        </p>
      </div>
    </SiteShell>
  );
}
