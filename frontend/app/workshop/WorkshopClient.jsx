'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import SiteShell from '@/components/community/SiteShell';
import Frame from '@/components/community/Frame';
import { SeatMeter, DayBox, QuoteCard, HostCard } from '@/components/community/Bits';
import { CONFIG } from '@/lib/community/content';
import { useReveal, useToasts } from '@/lib/community/hooks';
import {
  upcoming, featuredPast, host, isPast, isFull, recordingReady, testimonials,
  dateFull, dayShort, time, workshopUrl,
} from '@/lib/community/workshops';

/* The member view of the current workshop.

   This route is guarded by middleware and by a getUser() check in
   app/workshop/page.jsx — both untouched — so by the time this renders the
   reader is authenticated. That's why nothing here is behind a gate: the
   recording plays and every file row is unlocked, which is the whole point of
   the members' page as against the public /workshops/[slug] one. */
export default function WorkshopClient({ name, email, avatarUrl, initials }) {
  const { toasts, toast } = useToasts();
  const [playing, setPlaying] = useState(false);

  // The session a member is here for: the next one if there is one, otherwise
  // the last cohort, which is where the recording and the files live.
  const w = upcoming()[0] || featuredPast();
  const h = w ? host(w.hostId) : null;
  const past = w ? isPast(w) : false;
  const ready = w ? recordingReady(w) : false;
  const ts = w ? testimonials(w.id) : [];
  const nextUp = upcoming()[0];

  useReveal([w?.id, playing]);

  if (!w) {
    return (
      <SiteShell active="workshops">
        <div className="wrap page-top" style={{ paddingBottom: 96 }}>
          <div className="callout plain">
            <h2>Nothing scheduled just yet</h2>
            <p>The next one&rsquo;s being cooked. The group chat hears first.</p>
            <div className="cta-row">
              <Link className="btn go" href="/workshops">
                See workshops
              </Link>
            </div>
          </div>
        </div>
      </SiteShell>
    );
  }

  const firstName = (name || '').split(' ')[0] || 'there';

  return (
    <SiteShell active="workshops" toasts={toasts}>
      <div className="wrap page-top">
        <Link className="backlink" href="/workshops">
          ← All workshops
        </Link>
        <div className="whero">
          <div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="eyebrow bare">
                {w.cohortLabel || 'Cohort'} · {past ? 'Done' : 'Coming up'}
              </span>
              <span className="status reg">You&rsquo;re in</span>
            </div>
            <h1>{w.title}</h1>
            <p className="summary">{w.summary}</p>
            <div className="metarow">
              <div className="m">
                <span className="ico">
                  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                    <rect x="2" y="3.2" width="12" height="11" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M2 6.6h12M5.4 1.8v2.6M10.6 1.8v2.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <span>
                  <small>{past ? 'Held' : 'Date'}</small>
                  {past ? dateFull(w.dateTime) : dayShort(w.dateTime)}
                </span>
              </div>
              {!past && (
                <div className="m">
                  <span className="ico">
                    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                      <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 4.6V8l2.4 1.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>
                    <small>Starts</small>
                    {time(w.dateTime)}
                  </span>
                </div>
              )}
              {h && (
                <div className="m">
                  <span className="ico">
                    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                      <circle cx="8" cy="5.4" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M2.8 14a5.2 5.2 0 0 1 10.4 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span>
                    <small>{past ? 'Hosted by' : 'Host'}</small>
                    {h.name}
                  </span>
                </div>
              )}
            </div>
            <div className="cta-row">
              {w.meetLink && !past && (
                <a className="btn go" href={w.meetLink} target="_blank" rel="noopener noreferrer">
                  Join on Meet
                </a>
              )}
              {ready && (
                <a className="btn ghost" href="#recording">
                  Watch the recording
                </a>
              )}
              {!!(w.resources && w.resources.length) && (
                <a className="btn ghost" href="#files">
                  Get the files
                </a>
              )}
            </div>
          </div>
          <div className="whero-media">
            <Frame kind={w.bannerArt} src={w.bannerUrl} alt={w.title} />
          </div>
        </div>
      </div>

      {ready && (
        <div className="wrap" style={{ paddingTop: 'clamp(40px,5vw,60px)' }}>
          <div className="blk" id="recording">
            <div className="player">
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                {playing ? (
                  <div style={{ textAlign: 'center', color: '#fff', padding: 24 }}>
                    <div
                      style={{
                        fontSize: '.78rem',
                        letterSpacing: '.1em',
                        textTransform: 'uppercase',
                        opacity: 0.6,
                      }}
                    >
                      Now playing
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        marginTop: 6,
                      }}
                    >
                      {w.title}
                    </div>
                    <div className="micro" style={{ color: 'rgba(255,255,255,.55)', marginTop: 10 }}>
                      Embed target: {w.recordingUrl}
                    </div>
                  </div>
                ) : (
                  <button
                    className="play"
                    type="button"
                    aria-label="Play the recording"
                    onClick={() => setPlaying(true)}
                  >
                    <svg width="24" height="26" viewBox="0 0 24 26" aria-hidden="true">
                      <path d="M4 2l17 11L4 24z" fill="#C24405" />
                    </svg>
                  </button>
                )}
              </div>
              <span className="frame-note" style={{ left: 'auto', right: 14 }}>
                {w.recordingLength || 'Full session'} · dead air removed
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="wrap" style={{ paddingBottom: 'clamp(64px,8vw,104px)' }}>
        <div className="detail" style={{ paddingTop: ready ? 0 : undefined }}>
          <div>
            <div className="blk">
              <span className="eyebrow">{past ? 'What went down' : 'What we’re building'}</span>
              <p>{w.description}</p>
            </div>

            <div className="blk">
              <span className="eyebrow">This is for you if</span>
              <ul className="ticks arrow">
                {w.whoItsFor.map((i, k) => (
                  <li key={k}>{i}</li>
                ))}
              </ul>
            </div>

            <div className="blk">
              <span className="eyebrow">What you&rsquo;ll walk out with</span>
              <ol className="steps">
                {w.curriculum.map((i, k) => (
                  <li key={k}>{i}</li>
                ))}
              </ol>
            </div>

            {!!(w.resources && w.resources.length) && (
              <div className="blk" id="files">
                <span className="eyebrow">Everything from the session</span>
                <p>The file we built, the brief, the links. Yours — you&rsquo;re signed in.</p>
                <div style={{ marginTop: 20 }}>
                  {w.resources.map((r) => {
                    const icons = { figma: '🎛', pdf: '📄', zip: '🗂', link: '🔗' };
                    const kinds = {
                      figma: 'Figma file', pdf: 'PDF', zip: 'Zip archive', link: 'Link list',
                    };
                    return (
                      <div className="resrow" key={r.id}>
                        <span className="name">
                          <span className="type" aria-hidden="true">{icons[r.type] || '📄'}</span>
                          <span>
                            {r.title}
                            <small>{kinds[r.type] || 'File'}</small>
                          </span>
                        </span>
                        <button
                          className="btn sm"
                          type="button"
                          onClick={() => toast(`Downloading “${r.title}”.`, 'good')}
                        >
                          Download
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!!ts.length && (
              <div className="blk">
                <span className="eyebrow">From people who were there</span>
                <div className="qcards" style={{ marginTop: 24 }}>
                  {ts.map((t, i) => (
                    <QuoteCard key={t.id} t={t} i={i} />
                  ))}
                </div>
              </div>
            )}

            <HostCard host={h} />
          </div>

          <aside className="side">
            <div className="sticky">
              <div className="panel is-registered">
                <span className="status-line">✓ Registered</span>
                <h4>You&rsquo;re in, {firstName}.</h4>
                <DayBox w={w} />
                <p style={{ fontSize: '.95rem', marginTop: 0 }}>
                  {w.meetLink
                    ? 'Meet link’s ready. It’s also in My workshops.'
                    : 'Meet link comes the day before, by email and on WhatsApp.'}
                </p>
                {w.meetLink && (
                  <a
                    className="btn full go"
                    href={w.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginBottom: 10 }}
                  >
                    Join on Meet
                  </a>
                )}
                <Link className="btn quiet full" href="/dashboard">
                  My workshops
                </Link>
              </div>

              {nextUp && nextUp.id !== w.id && (
                <div className="panel">
                  <span className="kicker">Next session</span>
                  <DayBox w={nextUp} />
                  <h4 style={{ marginTop: 0, fontSize: '1.2rem' }}>{nextUp.title}</h4>
                  <SeatMeter w={nextUp} />
                  <Link className="btn full go" href={`${workshopUrl(nextUp)}?action=enroll`}>
                    {isFull(nextUp) ? 'Join the waitlist' : 'Grab a seat'}
                  </Link>
                </div>
              )}

              <div className="panel" style={{ boxShadow: 'none', background: 'var(--paper)' }}>
                <span className="kicker">Between sessions</span>
                <p style={{ fontSize: '.95rem', marginTop: 8 }}>
                  Portfolio questions, links, and the next brief before it goes up here.
                </p>
                <a
                  className="btn ghost full go"
                  href={CONFIG.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join the WhatsApp group
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}
