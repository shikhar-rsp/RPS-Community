'use client';
import React from 'react';
import Link from 'next/link';
import Frame from './Frame';
import { artHTML } from '@/lib/community/art';
import { StatusChip, seatChipFor } from './Bits';
import {
  workshopUrl, recordingReady, dayShort, time, host, metaLine,
} from '@/lib/community/workshops';

/* The cards carry everything the decision needs — when, who with, and whether
   you're already in. The first upcoming session gets the dark treatment: on a
   listing, "which one is next" should be obvious before you read a word. */

export function UpcomingCard({ w, lead, mine }) {
  const url = workshopUrl(w);
  const h = host(w.hostId);

  const cta = mine ? (
    <Link className={lead ? 'btn onDark' : 'btn quiet'} href={url}>
      You&rsquo;re {mine.status === 'WAITLISTED' ? 'on the list' : 'in'} →
    </Link>
  ) : (
    <Link className={lead ? 'btn onDark go' : 'btn go'} href={`${url}?action=enroll`}>
      Grab a seat
    </Link>
  );

  return (
    <article className={'wcard reveal' + (lead ? ' dark wide' : '')}>
      <div className="media">
        <Link href={url} tabIndex={-1} aria-hidden="true">
          <Frame
            flat
            kind={w.bannerArt}
            src={w.bannerUrl}
            alt={w.title}
            style={{ height: lead ? 260 : 220 }}
          />
        </Link>
      </div>
      <div className="body">
        <h3>
          <Link href={url}>{w.title}</Link>
        </h3>
        <p className="summary">{w.summary}</p>
        <div className="facts">
          <span className={'fact ' + (lead ? 'mint' : '')}>
            {w.cohortLabel || 'Upcoming'}
            {lead ? ' · Next up' : ''}
          </span>
          <span className="fact">
            {dayShort(w.dateTime)} · {time(w.dateTime)}
          </span>
          {h && <span className="fact">with {h.name}</span>}
        </div>
        <div className="foot">
          {cta}
          {mine && (
            <span className="note">
              <StatusChip status={mine.status} />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function PastCard({ w, wide, mine }) {
  const url = workshopUrl(w);
  const ready = recordingReady(w);
  const files = (w.resources || []).length;

  return (
    <article className={'wcard reveal' + (wide ? ' wide' : '')}>
      <div className="media">
        <Link href={url} tabIndex={-1} aria-hidden="true">
          <Frame
            flat
            kind={w.bannerArt}
            src={w.bannerUrl}
            alt={w.title}
            style={{ height: wide ? 300 : 220 }}
          />
        </Link>
        {ready && <span className="playbadge" aria-hidden="true" />}
      </div>
      <div className="body">
        <h3>
          <Link href={url}>{w.title}</Link>
        </h3>
        <p className="summary">{w.summary}</p>
        <div className="facts">
          <span className="fact">{w.cohortLabel || 'Past'} · Done</span>
          <span className="fact">{metaLine(w, host(w.hostId))}</span>
          {w.recordingLength && <span className="fact">{w.recordingLength}</span>}
          {!!files && (
            <span className="fact">
              {files} file{files > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="foot">
          <Link className={'btn ' + (ready ? 'go' : 'quiet')} href={`${url}#recording`}>
            {ready ? 'Watch it' : 'See what happened'}
          </Link>
          <span className="note">
            {mine ? <StatusChip status={mine.status} /> : seatChipFor(w, true, ready)}
          </span>
        </div>
      </div>
    </article>
  );
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
    <Link className="btn lg go" href={`${url}?action=enroll`}>
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
