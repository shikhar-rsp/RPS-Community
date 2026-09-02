'use client';
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import SiteShell from '@/components/community/SiteShell';
import Frame from '@/components/community/Frame';
import { StatusChip, DayBox, QuoteCard, HostCard } from '@/components/community/Bits';
import { CONFIG } from '@/lib/community/content';
import { useReveal, useSession, identityFrom, useToasts } from '@/lib/community/hooks';
import { useSeats, validateDetails } from '@/lib/community/enrollment';
import {
  bySlug, host, isPast, recordingReady,
  upcoming, featuredPast, testimonials, dateFull, dayShort, time, workshopUrl,
} from '@/lib/community/workshops';

/* One route, two layouts, branching on derived status. Everything on this page
   is public except three actions: enrolling, watching the recording, and
   downloading a resource — each of which gates on the real Supabase session and
   sends anonymous visitors to /signin with a `next` that brings them back to
   exactly what they were doing. */

export default function Page() {
  return (
    <Suspense fallback={null}>
      <WorkshopDetail />
    </Suspense>
  );
}

const ICON = {
  date: (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <rect x="2" y="3.2" width="12" height="11" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 6.6h12M5.4 1.8v2.6M10.6 1.8v2.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  time: (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4.6V8l2.4 1.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  place: (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M8 14.2S3 10 3 6.6a5 5 0 0 1 10 0C13 10 8 14.2 8 14.2z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="8" cy="6.5" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M4.5 2.6l9 5.4-9 5.4z" fill="currentColor" />
    </svg>
  ),
  host: (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <circle cx="8" cy="5.4" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.8 14a5.2 5.2 0 0 1 10.4 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

function Meta({ icon, label, value }) {
  return (
    <div className="m">
      <span className="ico">{icon}</span>
      <span>
        <small>{label}</small>
        {value}
      </span>
    </div>
  );
}

function WorkshopDetail() {
  const params = useParams();
  const router = useRouter();
  const search = useSearchParams();
  const { user, loading } = useSession();
  const me = identityFrom(user);
  const { seats, enroll, cancel } = useSeats(user?.id);
  const { toasts, toast } = useToasts();

  const slug = String(params?.slug || '');
  const w = useMemo(() => bySlug(slug), [slug]);

  const [panelMode, setPanelMode] = useState('default'); // 'default' | 'confirm'
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState(null);
  const [raceNotice, setRaceNotice] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const [saving, setSaving] = useState(false);

  const mine = w ? seats[w.slug] : null;
  const past = w ? isPast(w) : false;
  const wantsEnroll = search.get('action') === 'enroll';
  const wantedRes = search.get('res');

  useReveal([slug, user?.id, panelMode, mine?.status]);

  /* Arriving with intent — from a listing CTA, or straight back from /signin. */
  useEffect(() => {
    if (!w || past || loading) return;
    if (!wantsEnroll || mine) return;
    if (!user) {
      goSignIn(`${workshopUrl(w)}?action=enroll`);
    } else if (!me?.onboarded) {
      goOnboarding(`${workshopUrl(w)}?action=enroll`);
    } else {
      setPanelMode('confirm');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w?.id, wantsEnroll, user?.id, loading, past]);

  /* Arrived back from login with a file in mind — hand it over. */
  useEffect(() => {
    if (!w || !user || !wantedRes || delivered) return;
    const r = (w.resources || []).find((x) => x.id === wantedRes);
    if (r) {
      setDelivered(true);
      toast(`Downloading “${r.title}”.`, 'good');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w?.id, user?.id, wantedRes, delivered]);

  /* Kept across the login round-trip so the flow can pick up where it left off. */
  const seatsKey = w ? 'rps.seatsAtStart.' + w.slug : null;
  const rememberSeats = () => {
    try {
      if (sessionStorage.getItem(seatsKey) === null) sessionStorage.setItem(seatsKey, '');
    } catch { /* private mode */ }
  };
  const recallSeats = () => {
    try {
      const v = sessionStorage.getItem(seatsKey);
      return v === null ? null : Number(v);
    } catch { return null; }
  };
  const forgetSeats = () => {
    try { sessionStorage.removeItem(seatsKey); } catch { /* private mode */ }
  };

  /* Every gate leaves for the real sign-in page, carrying where to come back to.
     Supabase + the middleware do the rest; nothing about auth is faked here. */
  function goSignIn(next) {
    router.push('/signin?next=' + encodeURIComponent(next));
  }

  /* Signed in, but the profile was never filled in — finish that first and come
     straight back to the seat they were taking. */
  function goOnboarding(next) {
    router.push('/onboarding?mode=complete&next=' + encodeURIComponent(next));
  }

  /* ------------------------------------------------------------- not found */
  if (!w) {
    return (
      <SiteShell active="workshops">
        <div className="wrap page-top" style={{ paddingBottom: 96 }}>
          <div className="callout plain">
            <h2>This one&rsquo;s not here.</h2>
            <p>
              It may have moved, or the link may be older than the site. The listing has everything
              we&rsquo;ve run and everything that&rsquo;s coming.
            </p>
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

  const h = host(w.hostId);
  const ready = recordingReady(w);

  /* ------------------------------------------------------------ enrolment */
  function startEnroll() {
    rememberSeats();
    if (mine) {
      toast('You’re already in. Meet link’s in My workshops.');
      return;
    }
    if (!user) {
      goSignIn(`${workshopUrl(w)}?action=enroll`);
      return;
    }
    if (!me?.onboarded) {
      goOnboarding(`${workshopUrl(w)}?action=enroll`);
      return;
    }
    setForm(null);
    setErrors(null);
    setPanelMode('confirm');
  }

  async function confirmSeat(details) {
    // Marks the field red without a round trip. The same rules run again in
    // lib/validation.js on the server and once more in the database.
    const bad = validateDetails(details);
    if (bad) {
      setErrors(bad);
      setForm(details);
      return;
    }

    setSaving(true);
    // The database decides REGISTERED vs WAITLISTED, with the capacity row
    // locked — so this is the first moment anyone knows which one it is.
    const res = await enroll(w.slug, details);
    setSaving(false);

    if (!res.ok) {
      if (res.needsOnboarding) {
        goOnboarding(`${workshopUrl(w)}?action=enroll`);
        return;
      }
      setForm(details);
      toast(res.error || 'Could not save your seat.', 'warn');
      return;
    }

    // The 150-vs-45 race: seats were open when they started, gone by confirm.
    setRaceNotice(recallSeats() !== 0 && res.status === 'WAITLISTED');
    forgetSeats();
    setErrors(null);
    setForm(null);
    setPanelMode('default');
    toast(
      res.status === 'REGISTERED' ? 'You’re in. See you Saturday.' : 'You’re on the waitlist.',
      res.status === 'REGISTERED' ? 'good' : 'warn'
    );
  }

  /* ------------------------------------------------------------ the hero */
  const chips = past ? (
    <>
      <span className="eyebrow bare">{w.cohortLabel || 'Past cohort'} · Done</span>
      {ready ? (
        <span className="seat done">Recording + files up</span>
      ) : (
        <span className="seat warn">Recording still being cut</span>
      )}
    </>
  ) : (
    <>
      <span className="eyebrow bare">{w.cohortLabel || 'Cohort'} · Coming up</span>
      {mine && <StatusChip status={mine.status} />}
    </>
  );

  const metaItems = past ? (
    <>
      <Meta icon={ICON.date} label="Held" value={dateFull(w.dateTime)} />
      {w.recordingLength && <Meta icon={ICON.play} label="Recording" value={w.recordingLength} />}
      {h && <Meta icon={ICON.host} label="Hosted by" value={h.name} />}
    </>
  ) : (
    <>
      <Meta icon={ICON.date} label="Date" value={dayShort(w.dateTime)} />
      <Meta icon={ICON.time} label="Starts" value={time(w.dateTime)} />
      <Meta icon={ICON.place} label="Where" value="Google Meet" />
      {h && <Meta icon={ICON.host} label="Host" value={h.name} />}
    </>
  );

  const hero = (cta) => (
    <div className="wrap page-top">
      <Link className="backlink" href={past ? '/workshops#past' : '/workshops'}>
        ← All workshops
      </Link>
      <div className="whero">
        <div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {chips}
          </div>
          <h1>{w.title}</h1>
          <p className="summary">{w.summary}</p>
          <div className="metarow">{metaItems}</div>
          {cta && <div className="cta-row">{cta}</div>}
        </div>
        <div className="whero-media">
          <Frame kind={w.bannerArt} src={w.bannerUrl} alt={w.title} />
        </div>
      </div>
    </div>
  );

  /* ---------------------------------------------------- enrolment panel */
  function Panel() {
    if (mine && mine.status === 'REGISTERED') {
      return (
        <div className="panel is-registered">
          <span className="status-line">✓ Registered</span>
          <h4>You&rsquo;re in.</h4>
          <DayBox w={w} />
          <p style={{ fontSize: '.95rem', marginTop: 0 }}>
            {w.meetLink
              ? 'Meet link’s ready. It’s also in My workshops.'
              : 'Meet link comes the day before, by email and on WhatsApp.'}
          </p>
          {mine.whatsapp && (
            <p className="micro" style={{ marginTop: -2 }}>
              Reminder goes to {mine.whatsapp}.
            </p>
          )}
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
          <Link className="btn quiet full" href="/dashboard" style={{ marginBottom: 6 }}>
            My workshops
          </Link>
          <button className="linkish" type="button" onClick={releaseSeat}>
            Can&rsquo;t make it?
          </button>
        </div>
      );
    }

    if (mine && mine.status === 'WAITLISTED') {
      return (
        <div className="panel is-waitlisted">
          {raceNotice && (
            <div className="banner" role="status">
              Someone took the last seat while you were signing in. Rude. You&rsquo;re on the
              waitlist.
            </div>
          )}
          <span className="status-line">◔ Waitlisted</span>
          <h4>You&rsquo;re on the waitlist.</h4>
          <DayBox w={w} note="If a seat frees up, you’re first" />
          <p style={{ fontSize: '.95rem', marginTop: 0 }}>
            Seats open up more than you&rsquo;d think — people&rsquo;s weeks change.
          </p>
          <Link className="btn quiet full" href="/dashboard" style={{ marginBottom: 6 }}>
            My workshops
          </Link>
          <button className="linkish" type="button" onClick={releaseSeat}>
            Leave the waitlist
          </button>
        </div>
      );
    }

    /* Back from login — who's coming. Name and email come pre-filled from the
       account; the WhatsApp number is the one thing we can't already know, and
       it's where the reminder and the Meet link go. */
    if (panelMode === 'confirm' && me) {
      const v = form || { name: me.name || '', email: me.email || '', whatsapp: me.phone || '+91 ' };
      const err = (k) =>
        errors && errors[k] ? (
          <div className="hint err" role="alert">
            {errors[k]}
          </div>
        ) : null;

      return (
        <div className="panel">
          <span className="kicker">Step 2 of 2</span>
          <h4>Nearly in</h4>
          <DayBox w={w} />
          <p className="micro" style={{ marginTop: -8 }}>
            Three things and we&rsquo;ll see you there.
          </p>

          <form
            noValidate
            style={{ marginTop: 16 }}
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              confirmSeat({
                name: fd.get('name'),
                email: fd.get('email'),
                whatsapp: fd.get('whatsapp'),
              });
            }}
            onInput={(e) => {
              const fd = new FormData(e.currentTarget);
              setForm({
                name: fd.get('name'),
                email: fd.get('email'),
                whatsapp: fd.get('whatsapp'),
              });
            }}
          >
            <div className="field">
              <label htmlFor="en-name">Your name</label>
              <input
                id="en-name"
                name="name"
                type="text"
                autoComplete="name"
                defaultValue={v.name}
                aria-invalid={errors?.name ? 'true' : undefined}
              />
              {err('name')}
            </div>
            <div className="field">
              <label htmlFor="en-email">Email</label>
              <input
                id="en-email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={v.email}
                aria-invalid={errors?.email ? 'true' : undefined}
              />
              {err('email')}
            </div>
            <div className="field">
              <label htmlFor="en-wa">WhatsApp number</label>
              <input
                id="en-wa"
                name="whatsapp"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                defaultValue={v.whatsapp}
                aria-invalid={errors?.whatsapp ? 'true' : undefined}
              />
              {err('whatsapp') || (
                <div className="hint">
                  With the country code. Reminders and the Meet link go here.
                </div>
              )}
            </div>
            <button className="btn full go" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Confirm my seat'}
            </button>
          </form>

          <p className="micro" style={{ marginBottom: 0 }}>
            Free. Nothing else lands in your inbox.
          </p>
        </div>
      );
    }

    /* Default */
    return (
      <div className="panel">
        <span className="kicker">Take a seat</span>
        <DayBox w={w} />
        <button className="btn full go" type="button" onClick={startEnroll}>
          Grab a seat
        </button>
        <ul className="reassure">
          <li>Free. No card, no upsell at the end.</li>
          <li>Meet link and a reminder go to your WhatsApp.</li>
          <li>Recording and files afterwards, yours to keep.</li>
        </ul>
      </div>
    );
  }

  async function releaseSeat() {
    const res = await cancel(w.slug);
    if (!res.ok) {
      toast(res.error || 'Could not release your seat.', 'warn');
      return;
    }
    setPanelMode('default');
    setRaceNotice(false);
    toast('Seat released. Someone on the waitlist just got lucky.');
  }

  /* ------------------------------------------------------ UPCOMING layout */
  if (!past) {
    const featured = featuredPast();
    const socialProof = featured ? testimonials(featured.id).slice(0, 1) : [];

    return (
      <SiteShell active="workshops" toasts={toasts}>
        {hero(null)}

        <div className="wrap" style={{ paddingBottom: 'clamp(64px,8vw,104px)' }}>
          <div className="detail">
            <div>
              <div className="blk">
                <span className="eyebrow">What we&rsquo;re building</span>
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

              <HostCard host={h} />

              {!!socialProof.length && (
                <div className="blk">
                  <span className="eyebrow">From the last one</span>
                  <div style={{ marginTop: 24 }}>
                    {socialProof.map((t, i) => (
                      <QuoteCard key={t.id} t={t} i={i} />
                    ))}
                  </div>
                </div>
              )}

              {featured && featured.id !== w.id && (
                <div className="callout plain">
                  <h3>Want to see how one of these actually goes?</h3>
                  <p>Cohort 01 is up in full, dead air removed, with the file we built.</p>
                  <div className="cta-row">
                    <Link className="btn ghost go" href={`${workshopUrl(featured)}#recording`}>
                      Watch the last one
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <aside className="side">
              <div className="sticky">
                {Panel()}
              </div>
            </aside>
          </div>
        </div>
      </SiteShell>
    );
  }

  /* ----------------------------------------------------------- PAST layout */
  const ts = testimonials(w.id);
  const nextUp = upcoming()[0];

  return (
    <SiteShell active="workshops" toasts={toasts}>
      {hero(
        <>
          <a className="btn go" href="#recording">
            {ready ? 'Watch the recording' : 'See what happened'}
          </a>
          {!!(w.resources && w.resources.length) && (
            <a className="btn ghost" href="#files">
              Get the files
            </a>
          )}
        </>
      )}

      <div className="wrap" style={{ paddingTop: 'clamp(40px,5vw,60px)' }}>
        <div className="blk" id="recording">
          {Recording()}
        </div>
      </div>

      <div className="wrap" style={{ paddingBottom: 'clamp(64px,8vw,104px)' }}>
        <div className="detail" style={{ paddingTop: 0 }}>
          <div>
            <div className="blk">
              <span className="eyebrow">What went down</span>
              <p>{w.description}</p>
            </div>

            {!!(w.resources && w.resources.length) && (
              <div className="blk" id="files">
                <span className="eyebrow">Everything from the session</span>
                <p>
                  The file we built, the brief, the links. Log in once and every row unlocks.
                </p>
                <div style={{ marginTop: 20 }}>
                  {Resources()}
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
              {nextUp ? (
                <div className="panel">
                  <span className="kicker">Next session</span>
                  <DayBox w={nextUp} />
                  <h4 style={{ marginTop: 0, fontSize: '1.2rem' }}>{nextUp.title}</h4>
                  <p className="micro" style={{ marginTop: 10 }}>
                    Same room, new brief.
                  </p>
                  <Link className="btn full go" href={`${workshopUrl(nextUp)}?action=enroll`}>
                    Grab a seat
                  </Link>
                </div>
              ) : (
                <div className="panel">
                  <span className="kicker">Next session</span>
                  <h4>Not scheduled yet</h4>
                  <p className="micro">Every few weeks. The group chat finds out first.</p>
                  <a
                    className="btn full go"
                    href={CONFIG.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join the WhatsApp group
                  </a>
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

  /* Recording — gated preview, unlocks in place, player lazy-loads on click. */
  function Recording() {
    if (!ready) {
      return (
        <div className="callout plain">
          <h3>Recording&rsquo;s not up yet</h3>
          <p>Still editing. Few days. We&rsquo;ll email everyone who came.</p>
        </div>
      );
    }

    const player = (interactive) => (
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
              {...(interactive ? { onClick: () => setPlaying(true) } : { tabIndex: -1, 'aria-hidden': true })}
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
    );

    if (!user) {
      return (
        <div className="gate">
          <div className="blurred">{player(false)}</div>
          <div className="overlay">
            <div className="inner">
              <div className="lockicon" aria-hidden="true">🔒</div>
              <h3>Log in to watch</h3>
              <p>
                It&rsquo;s free. Google or your email, ten seconds — and the files unlock at the
                same time.
              </p>
              <button
                className="btn go"
                type="button"
                onClick={() => goSignIn(`${workshopUrl(w)}#recording`)}
              >
                Log in to watch
              </button>
            </div>
          </div>
        </div>
      );
    }

    return player(true);
  }

  /* Resources — rows always visible, the download is what's gated. */
  function Resources() {
    const icons = { figma: '🎛', pdf: '📄', zip: '🗂', link: '🔗' };
    const kinds = { figma: 'Figma file', pdf: 'PDF', zip: 'Zip archive', link: 'Link list' };

    return (
      <>
        {w.resources.map((r) => (
          <div className="resrow" key={r.id}>
            <span className="name">
              <span className="type" aria-hidden="true">{icons[r.type] || '📄'}</span>
              <span>
                {r.title}
                <small>{kinds[r.type] || 'File'}</small>
              </span>
            </span>
            <button
              className={'btn sm ' + (user ? '' : 'is-locked')}
              type="button"
              onClick={() => {
                if (!user) {
                  // Remember which file they wanted; hand it over on the way back.
                  goSignIn(`${workshopUrl(w)}?res=${encodeURIComponent(r.id)}#files`);
                  return;
                }
                toast(`Downloading “${r.title}”.`, 'good');
              }}
            >
              {user ? 'Download' : 'Log in to download'}
            </button>
          </div>
        ))}
      </>
    );
  }
}
