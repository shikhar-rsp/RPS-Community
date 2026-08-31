/* Workshop detail (PRD §8.3 upcoming / §8.4 past)
   One route, two layouts, branching on derived status. Everything on this page
   is public and indexable except three actions: enrolling, watching the
   recording, downloading a resource.

   Layout note: the old build opened with a full-bleed banner and pushed the
   title, the date and the seat count below the fold, so the two questions
   people actually arrive with — what is this, and can I still get in — were
   the last things they saw. Both layouts now lead with a two-column hero that
   answers them in the first screen, and the past page keeps the next session
   in the rail so the recording isn't a dead end. */

(function () {
  const S = RPS.store;
  const esc = RPS.esc;

  RPS.boot('workshops');

  const root = document.querySelector('[data-page]');
  const params = new URLSearchParams(location.search);
  const slug = params.get('w');
  const wantsEnroll = params.get('action') === 'enroll';
  const w = slug ? S.bySlug(slug) : null;

  /* ------------------------------------------------------------ not found */
  if (!w) {
    root.innerHTML = `
      <div class="wrap page-top" style="padding-bottom:96px">
        <div class="callout plain">
          <h2>This one’s not here.</h2>
          <p>It may have moved, or the link may be older than the site. The listing has everything we’ve run and everything that’s coming.</p>
          <div class="cta-row"><a class="btn go" href="workshops.html">See workshops</a></div>
        </div>
      </div>`;
    return;
  }

  const host = S.host(w.hostId);
  const isPast = S.isPast(w);

  /* SEO / LinkedIn sharing (PRD §10). In the Next.js build this is
     generateMetadata() on the server, with the banner as the OG image. */
  document.title = `${w.title} — RPS Cohorts`;
  const setMeta = (sel, val) => {
    const m = document.querySelector(sel);
    if (m) m.setAttribute('content', val);
  };
  setMeta('meta[name="description"]', w.summary);
  setMeta('meta[property="og:title"]', `${w.title} — RPS Cohorts`);
  setMeta('meta[property="og:description"]', w.summary);

  /* ================================================================ bits */
  const ICON = {
    date: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="2" y="3.2" width="12" height="11" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2 6.6h12M5.4 1.8v2.6M10.6 1.8v2.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    time: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 4.6V8l2.4 1.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    place: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M8 14.2S3 10 3 6.6a5 5 0 0 1 10 0C13 10 8 14.2 8 14.2z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="8" cy="6.5" r="1.8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    play: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M4.5 2.6l9 5.4-9 5.4z" fill="currentColor"/></svg>',
    host: '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="5.4" r="2.8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2.8 14a5.2 5.2 0 0 1 10.4 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
  };

  const meta = (icon, label, value) => `
    <div class="m"><span class="ico">${icon}</span><span><small>${esc(label)}</small>${esc(value)}</span></div>`;

  /* "12 Jul 2026" → { dy:'12', mo:'JUL' } for the little calendar tile */
  function calParts(iso) {
    const bits = RPS.fmt.dateFull(iso).split(' ');
    return { dy: bits[0], mo: (bits[1] || '').toUpperCase() };
  }

  const heroHTML = (opts) => {
    const full = S.isFull(w);
    const mine = S.enrollmentFor(w.id);
    const ready = S.recordingReady(w);

    const chips = isPast
      ? `<span class="eyebrow bare">${esc(w.cohortLabel || 'Past cohort')} · Done</span>
         ${ready ? '<span class="seat done">Recording + files up</span>' : '<span class="seat warn">Recording still being cut</span>'}`
      : `<span class="eyebrow bare">${esc(w.cohortLabel || 'Cohort')} · Coming up</span>
         ${RPS.ui.seatMeter(w)}
         ${mine ? `<span class="status ${mine.status === 'WAITLISTED' ? 'wait' : 'reg'}">${esc(S.statusLabel(mine.status))}</span>` : ''}`;

    const metaItems = isPast
      ? meta(ICON.date, 'Held', RPS.fmt.dateFull(w.dateTime)) +
        (w.recordingLength ? meta(ICON.play, 'Recording', w.recordingLength) : '') +
        (host ? meta(ICON.host, 'Hosted by', host.name) : '')
      : meta(ICON.date, 'Date', RPS.fmt.dayShort(w.dateTime)) +
        meta(ICON.time, 'Starts', RPS.fmt.time(w.dateTime)) +
        meta(ICON.place, 'Where', 'Google Meet') +
        (host ? meta(ICON.host, 'Host', host.name) : '');

    return `
    <div class="wrap page-top">
      <a class="backlink" href="workshops.html${isPast ? '#past' : ''}">← All workshops</a>
      <div class="whero">
        <div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${chips}</div>
          <h1>${esc(w.title)}</h1>
          <p class="summary">${esc(w.summary)}</p>
          <div class="metarow">${metaItems}</div>
          ${opts && opts.cta ? `<div class="cta-row">${opts.cta}</div>` : ''}
        </div>
        <div class="whero-media">
          <!-- The vector banner is the designed default; set bannerUrl to put
               real photography over it. -->
          <div class="frame" data-art="${esc(w.bannerArt)}"${w.bannerUrl ? ` data-src="${esc(w.bannerUrl)}" data-alt="${esc(w.title)}"` : ''}></div>
          ${opts && opts.float ? opts.float : ''}
        </div>
      </div>
    </div>`;
  };

  const hostHTML = () => !host ? '' : `
    <div class="blk">
      <span class="eyebrow">Your host</span>
      <div class="hostcard">
        <span class="face" aria-hidden="true">${esc(S.initials({ name: host.name }))}</span>
        <div>
          <b>${esc(host.name)}</b>
          <div class="micro">${esc(host.title)}</div>
          <p>${esc(host.bio)}</p>
        </div>
      </div>
    </div>`;

  /* Drawn figure + cohort, no name — see the note on the homepage testimonials. */
  /* Same bubble as the homepage. */
  const quoteHTML = (t, i) => `
    <figure class="qcard">
      <blockquote>“${esc(t.quote)}”</blockquote>
      <figcaption>
        <b>${esc(t.name)}</b>
        <small>${esc(t.role)}</small>
      </figcaption>
      <span class="face" aria-hidden="true">${RPS.ui.avatar(i)}</span>
    </figure>`;

  /* ======================================================= UPCOMING layout */
  function renderUpcoming() {
    const featured = S.featuredPast();
    const socialProof = featured ? S.testimonials(featured.id).slice(0, 1) : [];

    root.innerHTML = `
      ${heroHTML({})}

      <div class="wrap" style="padding-bottom:clamp(64px,8vw,104px)">
        <div class="detail">
          <div>
            <div class="blk">
              <span class="eyebrow">What we’re building</span>
              <p>${esc(w.description)}</p>
            </div>

            <div class="blk">
              <span class="eyebrow">This is for you if</span>
              <ul class="ticks arrow">${w.whoItsFor.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
            </div>

            <div class="blk">
              <span class="eyebrow">What you’ll walk out with</span>
              <ol class="steps">${w.curriculum.map((i) => `<li>${esc(i)}</li>`).join('')}</ol>
            </div>

            ${hostHTML()}

            ${socialProof.length ? `
            <div class="blk">
              <span class="eyebrow">From the last one</span>
              <div style="margin-top:24px">${socialProof.map(quoteHTML).join('')}</div>
            </div>` : ''}

            ${featured && featured.id !== w.id ? `
            <div class="callout plain">
              <h3>Want to see how one of these actually goes?</h3>
              <p>Cohort 01 is up in full, dead air removed, with the file we built.</p>
              <div class="cta-row">
                <a class="btn ghost go" href="workshop.html?w=${encodeURIComponent(featured.slug)}#recording">Watch the last one</a>
              </div>
            </div>` : ''}
          </div>

          <aside class="side">
            <div class="sticky" data-panel></div>
          </aside>
        </div>
      </div>`;

    RPS.ui.mountArt(root);
    renderPanel();
  }

  /* ------------------------------------------------------- enrolment panel */
  let panelMode = 'default'; // 'default' | 'confirm'
  let raceNotice = false;    // "seat taken mid-login"
  let seatsAtStart = null;   // seats free when they started — the race check
  let formValues = null;     // what's typed in the enrollment form
  let formErrors = null;     // {field: message}
  let focusField = null;     // which field to put the cursor back in
  let deliveredRes = false;  // guard the post-login auto-download

  function dayboxHTML(workshop, note) {
    const c = calParts(workshop.dateTime);
    return `
      <div class="daybox">
        <span class="cal" aria-hidden="true"><span class="mo">${esc(c.mo)}</span><span class="dy">${esc(c.dy)}</span></span>
        <span class="txt">
          <b>${esc(RPS.fmt.dayShort(workshop.dateTime))} · ${esc(RPS.fmt.time(workshop.dateTime))}</b>
          <small>${esc(note || '90 minutes, live on Google Meet')}</small>
        </span>
      </div>`;
  }

  function panelHTML() {
    const me = S.session();
    const mine = S.enrollmentFor(w.id);
    const left = S.seatsLeft(w);
    const full = S.isFull(w);
    const pct = w.capacity ? Math.min(100, (S.enrolledCount(w) / w.capacity) * 100) : 0;

    /* Registered */
    if (mine && mine.status === 'REGISTERED') {
      return `
      <div class="panel is-registered">
        <span class="status-line">✓ Registered</span>
        <h4>You’re in.</h4>
        ${dayboxHTML(w)}
        <p style="font-size:.95rem;margin-top:0">${w.meetLink
          ? 'Meet link’s ready. It’s also in My workshops.'
          : 'Meet link comes the day before, by email and on WhatsApp.'}</p>
        ${mine.whatsapp ? `<p class="micro" style="margin-top:-2px">Reminder goes to ${esc(mine.whatsapp)}.</p>` : ''}
        ${w.meetLink ? `<a class="btn full go" href="${esc(w.meetLink)}" target="_blank" rel="noopener" style="margin-bottom:10px">Join on Meet</a>` : ''}
        <a class="btn quiet full" href="account.html" style="margin-bottom:6px">My workshops</a>
        <button class="linkish" data-cancel>Can’t make it?</button>
      </div>`;
    }

    /* Waitlisted */
    if (mine && mine.status === 'WAITLISTED') {
      return `
      <div class="panel is-waitlisted">
        ${raceNotice ? '<div class="banner" role="status" style="background:#fff">Someone took the last seat while you were signing in. Rude. You’re on the waitlist.</div>' : ''}
        <span class="status-line">◔ Waitlisted</span>
        <h4>You’re on the waitlist.</h4>
        ${dayboxHTML(w, 'If a seat frees up, you’re first')}
        <p style="font-size:.95rem;margin-top:0">Seats open up more than you’d think — people’s weeks change.</p>
        <a class="btn quiet full" href="account.html" style="margin-bottom:6px">My workshops</a>
        <button class="linkish" data-cancel>Leave the waitlist</button>
      </div>`;
    }

    /* Back from login — who's coming (PRD §8.3 step 2).
       Name and email come pre-filled from the account; the WhatsApp number is
       the one thing we can't know, and it's where the reminder goes. */
    if (panelMode === 'confirm' && me) {
      const v = formValues || {
        name: me.name || '',
        email: me.email || '',
        whatsapp: me.phone || '+91 '
      };
      const err = (k) =>
        formErrors && formErrors[k]
          ? `<div class="hint err" role="alert">${esc(formErrors[k])}</div>`
          : '';
      const bad = (k) => (formErrors && formErrors[k] ? ' aria-invalid="true"' : '');

      return `
      <div class="panel">
        <span class="kicker">Step 2 of 2</span>
        <h4>${full ? 'Nearly on the list' : 'Nearly in'}</h4>
        ${dayboxHTML(w)}
        <p class="micro" style="margin-top:-8px">Three things and we’ll see you there.</p>

        <form data-enroll-form novalidate style="margin-top:16px">
          <div class="field">
            <label for="en-name">Your name</label>
            <input id="en-name" name="name" type="text" autocomplete="name"
                   value="${esc(v.name)}"${bad('name')}>
            ${err('name')}
          </div>
          <div class="field">
            <label for="en-email">Email</label>
            <input id="en-email" name="email" type="email" autocomplete="email"
                   value="${esc(v.email)}"${bad('email')}>
            ${err('email')}
          </div>
          <div class="field">
            <label for="en-wa">WhatsApp number</label>
            <input id="en-wa" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel"
                   placeholder="+91 98765 43210" value="${esc(v.whatsapp)}"${bad('whatsapp')}>
            ${err('whatsapp') || '<div class="hint">With the country code. Reminders and the Meet link go here.</div>'}
          </div>
          <button class="btn full go" type="submit">${full ? 'Join the waitlist' : 'Confirm my seat'}</button>
        </form>

        <p class="micro" style="margin-bottom:0">Free. Nothing else lands in your inbox.</p>
      </div>`;
    }

    /* Default — open or full */
    return `
    <div class="panel">
      <span class="kicker">${full ? 'Waitlist open' : 'Take a seat'}</span>
      ${dayboxHTML(w)}
      <h4 style="margin-top:0">${esc(S.seatLabel(w))}</h4>
      ${w.capacity ? `<div class="meter${full ? ' full' : ''}"><i style="width:${pct}%"></i></div>` : ''}
      <p class="micro" style="margin-top:0">${full
        ? `${esc(String(w.capacity))} seats, every time. The waitlist moves.`
        : `${esc(String(S.enrolledCount(w)))} already in${left !== null ? `, ${esc(String(left))} to go` : ''}.`}</p>
      <button class="btn full go" data-enroll>${full ? 'Join the waitlist' : 'Grab a seat'}</button>
      <ul class="reassure">
        <li>Free. No card, no upsell at the end.</li>
        <li>${full
          ? 'We’ll message you the moment a seat frees up.'
          : 'Meet link and a reminder go to your WhatsApp.'}</li>
        <li>Recording and files afterwards, yours to keep.</li>
      </ul>
    </div>`;
  }

  function renderPanel() {
    const slot = root.querySelector('[data-panel]');
    if (!slot) return;
    slot.innerHTML = panelHTML();

    const enrollBtn = slot.querySelector('[data-enroll]');
    if (enrollBtn) {
      enrollBtn.addEventListener('click', () => {
        RPS.track('enroll_clicked', { workshop: w.slug, full: S.isFull(w) });
        startEnroll();
      });
    }

    const form = slot.querySelector('[data-enroll-form]');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        confirmSeat({
          name: fd.get('name'),
          email: fd.get('email'),
          whatsapp: fd.get('whatsapp')
        });
      });
      // keep what's typed if a re-render happens
      form.addEventListener('input', () => {
        const fd = new FormData(form);
        formValues = {
          name: fd.get('name'), email: fd.get('email'), whatsapp: fd.get('whatsapp')
        };
      });
      if (focusField) {
        const f = slot.querySelector('#en-' + focusField);
        if (f) f.focus();
        focusField = null;
      }
    }

    const cancelBtn = slot.querySelector('[data-cancel]');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        S.cancel(w.id);
        panelMode = 'default';
        raceNotice = false;
        renderPanel();
        RPS.ui.toast('Seat released. Someone on the waitlist just got lucky.');
      });
    }
  }

  /* Anonymous → the login page, intent preserved, and back here with
     ?action=enroll so the form opens straight away. */
  /* Seats free at the moment they set off. Kept across the login round-trip so
     "someone took the last seat while you were signing in" means exactly that. */
  const SEATS_KEY = 'rps.seatsAtStart.' + w.slug;
  function rememberSeats(n) {
    seatsAtStart = n;
    try { sessionStorage.setItem(SEATS_KEY, String(n)); } catch (e) {}
  }
  function recallSeats() {
    if (seatsAtStart !== null) return seatsAtStart;
    try {
      const v = sessionStorage.getItem(SEATS_KEY);
      return v === null ? null : Number(v);
    } catch (e) { return null; }
  }
  function forgetSeats() {
    seatsAtStart = null;
    try { sessionStorage.removeItem(SEATS_KEY); } catch (e) {}
  }

  function startEnroll() {
    if (recallSeats() === null) rememberSeats(S.seatsLeft(w));
    const mine = S.enrollmentFor(w.id);
    if (mine) {
      RPS.ui.toast('You’re already in. Meet link’s in My workshops.');
      renderPanel();
      return;
    }
    RPS.ui.requireAuth(
      'enroll',
      () => {
        const again = S.enrollmentFor(w.id);
        if (again) {
          RPS.ui.toast('You’re already in. Meet link’s in My workshops.');
          renderPanel();
          return;
        }
        panelMode = 'confirm';
        formValues = null;
        formErrors = null;
        renderPanel();
        const p = root.querySelector('[data-panel]');
        if (p) p.scrollIntoView({ block: 'center', behavior: 'smooth' });
      },
      enrollReturnUrl()
    );
  }

  function enrollReturnUrl() {
    const u = new URL(location.href);
    u.searchParams.set('action', 'enroll');
    return u.pathname + u.search;
  }

  function confirmSeat(details) {
    const res = S.enroll(w.id, details);

    if (res.error === 'invalid') {
      formErrors = res.fields;
      formValues = details;
      focusField = Object.keys(res.fields)[0] === 'whatsapp' ? 'wa' : Object.keys(res.fields)[0];
      renderPanel();
      return;
    }
    if (res.error) {
      RPS.ui.toast('Log in first.', 'warn');
      return;
    }

    // The 150-vs-45 race: seats were open when they started, gone by confirm.
    raceNotice = recallSeats() !== 0 && res.status === 'WAITLISTED';
    forgetSeats();
    formErrors = null;
    formValues = null;
    panelMode = 'default';
    renderPanel();
    RPS.ui.renderNavRight(); // the name may have just changed
    RPS.ui.toast(
      res.status === 'REGISTERED' ? 'You’re in. See you Saturday.' : 'You’re on the waitlist.',
      res.status === 'REGISTERED' ? 'good' : 'warn'
    );
  }

  /* =========================================================== PAST layout */
  function renderPast() {
    const ts = S.testimonials(w.id);
    const nextUp = S.upcoming()[0];
    const ready = S.recordingReady(w);

    root.innerHTML = `
      ${heroHTML({
        cta: `
          <a class="btn go" href="#recording">${ready ? 'Watch the recording' : 'See what happened'}</a>
          ${w.resources && w.resources.length ? '<a class="btn ghost" href="#files">Get the files</a>' : ''}`
      })}

      <div class="wrap" style="padding-top:clamp(40px,5vw,60px)">
        <div class="blk" id="recording" data-recording></div>
      </div>

      <div class="wrap" style="padding-bottom:clamp(64px,8vw,104px)">
        <div class="detail" style="padding-top:0">
          <div>
            <div class="blk">
              <span class="eyebrow">What went down</span>
              <p>${esc(w.description)}</p>
            </div>

            ${w.resources && w.resources.length ? `
            <div class="blk" id="files">
              <span class="eyebrow">Everything from the session</span>
              <p>The file we built, the brief, the links. Log in once and every row unlocks.</p>
              <div data-resources style="margin-top:20px"></div>
            </div>` : ''}

            ${ts.length ? `
            <div class="blk">
              <span class="eyebrow">From people who were there</span>
              <div class="qcards" style="margin-top:24px">${ts.map(quoteHTML).join('')}</div>
            </div>` : ''}

            ${hostHTML()}
          </div>

          <aside class="side">
            <div class="sticky">
              ${nextUp ? `
              <div class="panel">
                <span class="kicker">Next session</span>
                ${dayboxHTML(nextUp)}
                <h4 style="margin-top:0;font-size:1.2rem">${esc(nextUp.title)}</h4>
                ${RPS.ui.seatMeter(nextUp)}
                <p class="micro" style="margin-top:10px">Same room, new brief.</p>
                <a class="btn full go" href="workshop.html?w=${encodeURIComponent(nextUp.slug)}&action=enroll">${S.isFull(nextUp) ? 'Join the waitlist' : 'Grab a seat'}</a>
              </div>` : `
              <div class="panel">
                <span class="kicker">Next session</span>
                <h4>Not scheduled yet</h4>
                <p class="micro">Every few weeks. The group chat finds out first.</p>
                <a class="btn full go" data-wa data-whatsapp target="_blank" rel="noopener" href="#">Join the WhatsApp group</a>
              </div>`}
              <div class="panel" style="box-shadow:none;background:var(--paper)">
                <span class="kicker">Between sessions</span>
                <p style="font-size:.95rem;margin-top:8px">Portfolio questions, links, and the next brief before it goes up here.</p>
                <a class="btn ghost full go" data-wa data-whatsapp target="_blank" rel="noopener" href="#">Join the WhatsApp group</a>
              </div>
            </div>
          </aside>
        </div>
      </div>`;

    RPS.ui.mountArt(root);
    RPS.ui.mountWhatsapp(root);
    renderRecording();
    renderResources();
  }

  /* Recording — gated preview, unlocks in place, player lazy-loads on click */
  function renderRecording() {
    const slot = root.querySelector('[data-recording]');
    if (!slot) return;
    const me = S.session();

    if (!S.recordingReady(w)) {
      slot.innerHTML = `
        <div class="callout plain">
          <h3>Recording’s not up yet</h3>
          <p>Still editing. Few days. We’ll email everyone who came.</p>
        </div>`;
      return;
    }

    if (!me) {
      slot.innerHTML = `
        <div class="gate">
          <div class="blurred">${playerHTML(false)}</div>
          <div class="overlay">
            <div class="inner">
              <div class="lockicon" aria-hidden="true">🔒</div>
              <h3>Log in to watch</h3>
              <p>It’s free. Google or your email, ten seconds — and the files unlock at the same time.</p>
              <button class="btn go" data-unlock>Log in to watch</button>
            </div>
          </div>
        </div>`;
      slot.querySelector('[data-unlock]').addEventListener('click', () => {
        RPS.track('recording_unlock_clicked', { workshop: w.slug });
        RPS.ui.requireAuth(
          'recording',
          () => {
            renderRecording();
            RPS.ui.toast('Unlocked. Enjoy.', 'good');
          },
          location.pathname + location.search + '#recording'
        );
      });
      return;
    }

    slot.innerHTML = playerHTML(true);
    const play = slot.querySelector('[data-play]');
    if (play) {
      play.addEventListener('click', () => {
        RPS.track('recording_played', { workshop: w.slug });
        // Real build swaps this surface for the embed iframe on click, so the
        // player script is never loaded until someone actually wants it (§10).
        slot.querySelector('[data-stage]').innerHTML = `
          <div style="text-align:center;color:#fff;padding:24px">
            <div style="font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;opacity:.6">Now playing</div>
            <div style="font-family:var(--font-display);font-size:1.25rem;font-weight:700;margin-top:6px">${esc(w.title)}</div>
            <div class="micro" style="color:rgba(255,255,255,.55);margin-top:10px">Embed target: ${esc(w.recordingUrl)}</div>
          </div>`;
      });
    }
  }

  function playerHTML(interactive) {
    return `
      <div class="player">
        <div data-stage style="position:absolute;inset:0;display:grid;place-items:center">
          <button class="play" ${interactive ? 'data-play' : 'tabindex="-1" aria-hidden="true"'} aria-label="Play the recording">
            <svg width="24" height="26" viewBox="0 0 24 26" aria-hidden="true"><path d="M4 2l17 11L4 24z" fill="#C24405"/></svg>
          </button>
        </div>
        <span class="frame-note" style="left:auto;right:14px">${esc(w.recordingLength || 'Full session')} · dead air removed</span>
      </div>`;
  }

  /* Resources — rows always visible, the download is what's gated (§8.4) */
  function renderResources() {
    const slot = root.querySelector('[data-resources]');
    if (!slot) return;
    const me = S.session();
    const icons = { figma: '🎛', pdf: '📄', zip: '🗂', link: '🔗' };
    const kinds = { figma: 'Figma file', pdf: 'PDF', zip: 'Zip archive', link: 'Link list' };

    slot.innerHTML = w.resources
      .map(
        (r) => `
      <div class="resrow">
        <span class="name">
          <span class="type" aria-hidden="true">${icons[r.type] || '📄'}</span>
          <span>${esc(r.title)}<small>${esc(kinds[r.type] || 'File')}</small></span>
        </span>
        <button class="btn sm ${me ? '' : 'is-locked'}" data-res="${esc(r.id)}">
          ${me ? 'Download' : 'Log in to download'}
        </button>
      </div>`
      )
      .join('');

    slot.querySelectorAll('[data-res]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const r = w.resources.find((x) => x.id === btn.dataset.res);
        // Logged out: leave for the login page, remembering which file they
        // wanted, and hand it over the moment they're back.
        const back = new URL(location.href);
        back.searchParams.set('res', r.id);
        RPS.ui.requireAuth(
          'files',
          () => {
            renderResources(); // unlock every row in place, no reload
            deliver(r);
          },
          back.pathname + back.search + '#files'
        );
      });
    });

    // Arrived back from login with a file in mind
    const wanted = deliveredRes ? null : params.get('res');
    if (wanted && S.session()) {
      deliveredRes = true;
      const r = w.resources.find((x) => x.id === wanted);
      if (r) {
        deliver(r);
        const clean = new URL(location.href);
        clean.searchParams.delete('res');
        history.replaceState(null, '', clean.pathname + clean.search + '#files');
      }
    }
  }

  function deliver(r) {
    RPS.track('resource_downloaded', { workshop: w.slug, resource: r.title });
    RPS.ui.toast(`Downloading “${r.title}”.`, 'good');
  }

  /* ================================================================= boot */
  if (isPast) renderPast();
  else renderUpcoming();

  RPS.ui.reveal();
  RPS.track('workshop_viewed', { workshop: w.slug, status: isPast ? 'past' : 'upcoming' });

  /* Arriving with intent — from the listing CTA, or back from /login */
  if (!isPast && wantsEnroll) startEnroll();

  /* Re-render gated areas when auth changes anywhere on the page */
  document.addEventListener('rps:auth', () => {
    if (isPast) {
      renderRecording();
      renderResources();
    } else {
      renderPanel();
    }
  });
})();
