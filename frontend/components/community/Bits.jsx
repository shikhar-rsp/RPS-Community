'use client';
import React, { useState } from 'react';
import { Avatar } from './Frame';
import { calParts, dayShort, time } from '@/lib/community/workshops';

/* Status label is always text, never colour alone. */
export function StatusChip({ status }) {
  const map = { REGISTERED: 'Registered', WAITLISTED: 'Waitlisted', ATTENDED: 'Been there' };
  const cls = status === 'WAITLISTED' ? 'wait' : status === 'ATTENDED' ? 'att' : 'reg';
  return <span className={'status ' + cls}>{map[status] || status}</span>;
}

export function DayBox({ w, note }) {
  const c = calParts(w.dateTime);
  return (
    <div className="daybox">
      <span className="cal" aria-hidden="true">
        <span className="mo">{c.mo}</span>
        <span className="dy">{c.dy}</span>
      </span>
      <span className="txt">
        <b>
          {dayShort(w.dateTime)} · {time(w.dateTime)}
        </b>
        <small>{note || '90 minutes, live on Google Meet'}</small>
      </span>
    </div>
  );
}

/* Same bubble on the homepage and the workshop page. */
export function QuoteCard({ t, i }) {
  return (
    <figure className="qcard reveal">
      <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
      <figcaption>
        <b>{t.name}</b>
        <small>{t.role}</small>
      </figcaption>
      <Avatar i={i} />
    </figure>
  );
}

/* The accordion. First item open by default. */
export function Faq({ items, className = 'faq' }) {
  const [open, setOpen] = useState(items?.[0]?.id ?? null);
  return (
    <div className={className}>
      {(items || []).map((f, i) => {
        const isOpen = open === f.id;
        return (
          <div key={f.id} className={'faq-item reveal' + (isOpen ? ' open' : '')}>
            <h3 style={{ fontSize: 'inherit', margin: 0 }}>
              <button
                type="button"
                className="faq-q"
                aria-expanded={isOpen}
                aria-controls={`faq-a-${f.id}`}
                onClick={() => setOpen(isOpen ? null : f.id)}
              >
                {/* Numbered, not a row of identical question marks: the tile
                    now says where you are in the list. */}
                <span className="mark" aria-hidden="true">{i + 1}</span>
                <span className="qt">{f.question}</span>
                <span className="sign" aria-hidden="true" />
              </button>
            </h3>
            <div className="faq-a" id={`faq-a-${f.id}`}>
              <p>{f.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* The host block on a workshop page. */
export function HostCard({ host }) {
  if (!host) return null;
  const initials = host.name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
  return (
    <div className="blk">
      <span className="eyebrow">Your host</span>
      <div className="hostcard">
        <span className="face" aria-hidden="true">{initials}</span>
        <div>
          <b>{host.name}</b>
          <div className="micro">{host.title}</div>
          <p>{host.bio}</p>
        </div>
      </div>
    </div>
  );
}

/* Past sessions still say where the recording is up to. Upcoming ones say
   nothing — the seat counter and its meter are deliberately gone. */
export function seatChipFor(w, past, ready) {
  if (!past) return null;
  if (ready) return <span className="seat done">Recording + files up</span>;
  // Don't promise an edit that isn't happening. A session with no recording
  // coming is described by what it does have.
  if (w && w.recordingComing) return <span className="seat warn">Recording still being cut</span>;
  if (w && w.resources && w.resources.length) return <span className="seat done">Files up</span>;
  return null;
}
