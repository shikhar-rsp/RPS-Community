'use client';
import { useMemo, useState } from 'react';
import SiteShell from '@/components/community/SiteShell';
import { StatusChip } from '@/components/community/Bits';
import styles from './registrations.module.css';

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

export default function RegistrationsClient({ rows, failed, viewer, workshops, initialSlug }) {
  const [q, setQ] = useState('');
  // Opens on the most recent session rather than on everything at once: the
  // question this page gets asked is almost always about the next one.
  const [slug, setSlug] = useState(initialSlug);
  const [status, setStatus] = useState('all');

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
      return [r.name, r.email, r.whatsapp, r.accountEmail]
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

  function exportCsv() {
    const header = ['Registered at (IST)', 'Name', 'Email', 'Account email', 'WhatsApp', 'Status', 'Workshop'];
    const body = shown.map((r) => [
      whenExact(r.createdAt), r.name, r.email, r.accountEmail || '', r.whatsapp, r.status, r.workshop,
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
            <span className={styles.eyebrow}>Registrations for</span>

            {/* The heading IS the control. This page's first question is always
                "which workshop am I looking at", so the answer is the biggest
                thing on it and changing it is one click, not a filter to hunt
                for further down. */}
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
              <svg className={styles.chev} width="18" height="18" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                   strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
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
                  {' · '}{counts.REGISTERED} registered
                  {counts.WAITLISTED > 0 && <>{' · '}{counts.WAITLISTED} waitlisted</>}
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
          <select
            id="reg-status"
            className={styles.select}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">Any status</option>
            <option value="REGISTERED">Registered</option>
            <option value="WAITLISTED">Waitlisted</option>
            <option value="ATTENDED">Attended</option>
          </select>
        </div>

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
                </tr>
              </thead>
              <tbody>
                {shown.map((r, i) => (
                  <tr key={`${r.slug}:${r.email}:${i}`}>
                    <td className={styles.num}>{whenShort(r.createdAt)}</td>
                    <td className={styles.strong}>{r.name}</td>
                    <td>
                      <a href={`mailto:${r.email}`}>{r.email}</a>
                      {r.accountEmail && (
                        <span className={styles.note}>signed in as {r.accountEmail}</span>
                      )}
                    </td>
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
                    <td><StatusChip status={r.status} /></td>
                    {slug === 'all' && <td className={styles.workshop}>{r.workshop}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className={styles.foot}>
          Signed in as {viewer}. This list is visible to named addresses only — set
          ADMIN_EMAILS to change who.
        </p>
      </div>
    </SiteShell>
  );
}
