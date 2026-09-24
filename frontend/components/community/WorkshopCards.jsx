'use client';
import React from 'react';
import Link from 'next/link';
import Frame from './Frame';
import { artHTML } from '@/lib/community/art';
import {
  workshopUrl, enrollUrl, recordingReady, recordingState, isPast, host,
  dayShort, dateFull, time, durationShort, initialsFrom,
} from '@/lib/community/workshops';

/* The workshop card. One component for every state — upcoming, recorded,
   completed — so the listing reads the same whether it holds two workshops
   or thirty. Top to bottom it answers, in order: what is this (artwork, then
   the title), what do I get (summary), who ran it (host), when and what
   state (the small line), and what can I do (one action).

   The artwork is a hook, not the information: the banners carry the title
   lettered into their left third, so the card shows only the illustration
   on the right (see .wcard .media in community.css) and the title is read
   once, in type. The cohort mark in the banner is cropped out with the rest
   and set again as a small label, so it's the same for every card. */

const STATUS = {
  upcoming: ['up', 'Upcoming'],
  ready: ['ok', 'Recorded'],
  coming: ['ok', 'Completed'],
  none: ['ok', 'Completed'],
};

const SEAT = {
  REGISTERED: ['Registered', 'Been there'],
  ATTENDED: ['Registered', 'Been there'],
  WAITLISTED: ['Waitlisted', 'Waitlisted'],
};

export function WorkshopCard({ w, mine }) {
  const url = workshopUrl(w);
  const h = host(w.hostId);
  const past = isPast(w);
  const state = past ? recordingState(w) : 'upcoming';
  const [statusCls, statusText] = STATUS[state] || STATUS.none;

  // The seat someone holds, in the words My workshops uses for the same seat.
  const seat = mine && SEAT[mine.status] ? SEAT[mine.status][past ? 1 : 0] : null;

  const when = past
    ? `${dateFull(w.dateTime)} · ${w.recordingLength || durationShort(w)}`
    : `${dayShort(w.dateTime)} · ${time(w.dateTime)} · ${durationShort(w)}`;

  // One action, and it follows the state: a seat, the recording, or the page.
  let cta;
  if (!past) {
    cta = mine
      ? [url, mine.status === 'WAITLISTED' ? 'You’re on the list' : 'You’re in']
      : [enrollUrl(w), 'Grab a seat'];
  } else if (recordingReady(w)) {
    cta = [`${url}#recording`, 'Watch recording'];
  } else {
    cta = [url, 'View workshop'];
  }

  return (
    <article className="wcard reveal">
      <div className="media">
        <Link href={url} tabIndex={-1} aria-hidden="true">
          <Frame flat kind={w.bannerArt} src={w.bannerUrl} alt="" />
        </Link>
        {w.cohortLabel && <span className="wc-cohort">{w.cohortLabel}</span>}
      </div>
      <div className="body">
        <div className="wc-state">
          <span className={'wc-status ' + statusCls}>{statusText}</span>
          {state === 'coming' && <span className="wc-tag">Recording on its way</span>}
          {/* The kit is the other thing a past session leaves behind. */}
          {past && !!(w.resources || []).length && <span className="wc-tag">Files up</span>}
          {seat && <span className="wc-seat">{seat}</span>}
        </div>
        <h3>
          <Link href={url}>{w.title}</Link>
        </h3>
        <p className="summary">{w.summary}</p>
        {h && (
          <div className="wc-host">
            {h.photoUrl ? (
              <img className="face" src={h.photoUrl} alt="" loading="lazy" decoding="async" />
            ) : (
              <span className="face" aria-hidden="true">{initialsFrom(h.name)}</span>
            )}
            <span className="wc-host-id">
              <b>{h.name}</b>
              <small>{h.title}</small>
            </span>
          </div>
        )}
        <div className="foot">
          <span className="wc-when">{when}</span>
          <Link className="wc-cta" href={cta[0]}>
            {cta[1]}
          </Link>
        </div>
      </div>
    </article>
  );
}

/* The listing and the homepage still ask for these two by name. They're the
   same card; the state comes from the workshop, not from which one was
   called. `lead` and `wide` no longer do anything — a card alone in a
   .wgrid.one lays out side-by-side on its own (see community.css). */
export function UpcomingCard({ w, mine }) {
  return <WorkshopCard w={w} mine={mine} />;
}

export function PastCard({ w, mine }) {
  return <WorkshopCard w={w} mine={mine} />;
}

/* The homepage's lead: the next session on a tablet screen — one thing to look
   at, one thing to do. The banner already carries the workshop's name, so the
   body only adds when it runs and the way in. */
export function FeatureCard({ w, mine }) {
  const url = workshopUrl(w);

  const cta = mine ? (
    <Link className="btn lg" href={url}>
      You&rsquo;re {mine.status === 'WAITLISTED' ? 'on the list' : 'in'}
    </Link>
  ) : (
    <Link className="btn lg go" href={enrollUrl(w)}>
      Grab a seat
    </Link>
  );

  return (
    <article className="wfeature reveal">
      <div className="device">
        {/* The banner sits straight on the glass — .device-screen styles the
            <img>/<svg> itself, so no .frame wrapper here. */}
        {w.bannerUrl ? (
          <div className="device-screen">
            <img src={w.bannerUrl} alt={w.title} loading="lazy" decoding="async" />
            <span className="device-glare" aria-hidden="true" />
          </div>
        ) : (
          <div
            className="device-screen"
            dangerouslySetInnerHTML={{
              __html: artHTML(w.bannerArt) + '<span class="device-glare" aria-hidden="true"></span>',
            }}
          />
        )}
        <span className="device-cam" aria-hidden="true" />
        <div className="wfeature-body">
          <div className="facts">
            <span className="fact">{w.cohortLabel || 'Next'}</span>
            <span className="fact">
              {dayShort(w.dateTime)} · {time(w.dateTime)}
            </span>
          </div>
          <div className="foot">{cta}</div>
        </div>
      </div>
    </article>
  );
}
