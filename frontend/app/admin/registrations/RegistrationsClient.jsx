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

export default function RegistrationsClient({ rows, failed, viewer, workshops }) {
  const [q, setQ] = useState('');
  const [workshop, setWorkshop] = useState('all');
  const [status, setStatus] = useState('all');

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (workshop !== 'all' && r.workshop !== workshop) return false;
      if (status !== 'all' && r.status !== status) return false;
      if (!needle) return true;
      return [r.name, r.email, r.whatsapp, r.accountEmail]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(needle));
    });
  }, [rows, q, workshop, status]);

  const counts = useMemo(() => {
    const c = { REGISTERED: 0, WAITLISTED: 0, ATTENDED: 0 };
    rows.forEach((r) => { if (c[r.status] !== undefined) c[r.status] += 1; });
    return c;
  }, [rows]);

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
    a.download = `rps-registrations-${whenExact(new Date().toISOString()).slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <SiteShell active="">
      <div className={'wrap page-top ' + styles.page}>
        <header className={styles.head}>
          <div>
            <span className={styles.eyebrow}>Admin</span>
            <h1 className={styles.title}>Registrations</h1>
            <p className={styles.sub}>
              {rows.length} {rows.length === 1 ? 'person' : 'people'} across all workshops
              {rows.length > 0 && (
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
          {workshops.length > 1 && (
            <select
              id="reg-workshop"
              className={styles.select}
              value={workshop}
              onChange={(e) => setWorkshop(e.target.value)}
              aria-label="Filter by workshop"
            >
              <option value="all">All workshops</option>
              {workshops.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          )}
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
            <h2>{rows.length ? 'Nothing matches that.' : 'No registrations yet.'}</h2>
            <p>
              {rows.length
                ? 'Try a different search, or clear the filters.'
                : 'They appear here the moment someone takes a seat — no import, no sync.'}
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
                  <th scope="col">Workshop</th>
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
                    <td className={styles.workshop}>{r.workshop}</td>
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
