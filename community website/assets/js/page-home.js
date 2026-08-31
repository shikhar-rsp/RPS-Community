/* Homepage — the data-driven sections (PRD §8.1 acceptance criteria:
   the workshop cards, testimonials and FAQ come from the store, not hardcoded
   markup, so /internal can change them without a redeploy).

   Structural note: the homepage leads with the session you can still get into.
   The old build only ever featured the last one, which meant the single thing a
   visitor came to do — take a seat — lived a click away. */

(function () {
  const S = RPS.store;
  const esc = RPS.esc;

  RPS.boot('home');

  const next = S.upcoming()[0];
  const last = S.featuredPast();

  /* ---- hero CTAs point at real workshops ---- */
  const seatBtn = document.querySelector('[data-hero-seat]');
  const watchBtn = document.querySelector('[data-hero-watch]');
  if (seatBtn) seatBtn.href = RPS.seatUrl();
  if (watchBtn && last) watchBtn.href = 'workshop.html?w=' + encodeURIComponent(last.slug) + '#recording';

  /* ---- the two workshops: what's next, and what we've already run ---- */
  function upcomingCard(w) {
    const host = S.host(w.hostId);
    const url = 'workshop.html?w=' + encodeURIComponent(w.slug);
    const full = S.isFull(w);
    const mine = S.enrollmentFor(w.id);

    const cta = mine
      ? `<a class="btn onDark go" href="${url}">You’re ${mine.status === 'WAITLISTED' ? 'on the list' : 'in'}</a>`
      : `<a class="btn onDark go" href="${url}&action=enroll">${full ? 'Join the waitlist' : 'Grab a seat'}</a>`;

    return `
    <article class="wcard dark reveal">
      <div class="media">
        <div class="frame flat" data-art="${esc(w.bannerArt)}"${w.bannerUrl ? ` data-src="${esc(w.bannerUrl)}" data-alt="${esc(w.title)}"` : ''} style="height:260px"></div>
      </div>
      <div class="body">
        <h3><a href="${url}">${esc(w.title)}</a></h3>
        <!-- Intro only. The curriculum lives on the detail page, where it has
             room; three bullets here made the card twice the height it needed. -->
        <p class="summary">${esc(w.description)}</p>
        <div class="facts">
          <span class="fact mint">${esc(w.cohortLabel || 'Next')} · Next up</span>
          <span class="fact">${esc(RPS.fmt.dayShort(w.dateTime))} · ${esc(RPS.fmt.time(w.dateTime))}</span>
        </div>
        <div class="foot">
          ${cta}
          ${RPS.ui.seatMeter(w)}
        </div>
      </div>
    </article>`;
  }

  function pastCard(w) {
    const url = 'workshop.html?w=' + encodeURIComponent(w.slug);
    const ready = S.recordingReady(w);

    return `
    <article class="wcard reveal">
      <div class="media">
        <div class="frame flat" data-art="${esc(w.bannerArt)}"${w.bannerUrl ? ` data-src="${esc(w.bannerUrl)}" data-alt="${esc(w.title)}"` : ''} style="height:260px"></div>
        ${ready ? '<span class="playbadge" aria-hidden="true"></span>' : ''}
      </div>
      <div class="body">
        <h3><a href="${url}">${esc(w.title)}</a></h3>
        <p class="summary">${esc(w.description)}</p>
        <div class="facts">
          <span class="fact">${esc(w.cohortLabel || 'Past')} · Done</span>
          ${w.recordingLength ? `<span class="fact deep">${esc(w.recordingLength)}</span>` : ''}
        </div>
        <div class="foot">
          <a class="btn go" href="${url}#recording">${ready ? 'Watch the recording' : 'See what happened'}</a>
        </div>
      </div>
    </article>`;
  }

  /* The section leads with the next session on a tablet screen — one thing to
     look at, one thing to do. The past cohort isn't shown here; it lives on
     the workshops page, which the section's own link goes to. */
  function featureCard(w) {
    const url = 'workshop.html?w=' + encodeURIComponent(w.slug);
    const full = S.isFull(w);
    const mine = S.enrollmentFor(w.id);
    const cta = mine
      ? `<a class="btn lg" href="${url}">You’re ${mine.status === 'WAITLISTED' ? 'on the list' : 'in'}</a>`
      : `<a class="btn lg go" href="${url}&action=enroll">${full ? 'Join the waitlist' : 'Grab a seat'}</a>`;

    return `
    <article class="wfeature reveal">
      <div class="device">
        <div class="device-screen" data-art="${esc(w.bannerArt)}"${w.bannerUrl ? ` data-src="${esc(w.bannerUrl)}" data-alt="${esc(w.title)}"` : ''}>
          <span class="device-glare" aria-hidden="true"></span>
        </div>
        <span class="device-cam" aria-hidden="true"></span>
        <!-- Sits on the screen itself, bottom-left, on a wide viewport — the
             banner already carries the workshop's name, so this only adds when
             it runs and the way in. A sibling of the screen rather than a child
             of it so that on a phone or tablet, where the banner is too short
             to hold them clear of its own title, CSS can drop them out of the
             glass and onto the bezel below. -->
        <div class="wfeature-body">
          <div class="facts">
            <span class="fact">${esc(w.cohortLabel || 'Next')}</span>
            <span class="fact">${esc(RPS.fmt.dayShort(w.dateTime))} · ${esc(RPS.fmt.time(w.dateTime))}</span>
          </div>
          <div class="foot">${cta}</div>
        </div>
      </div>
    </article>`;
  }

  const wSlot = document.querySelector('[data-workshops]');
  if (wSlot && (next || last)) {
    wSlot.innerHTML = `
      <div class="wrap">
        <header class="sec-head">
          <div class="main">
            <span class="eyebrow reveal">Workshops</span>
            <h2 class="reveal">${esc(next ? 'Here’s what’s next.' : 'Here’s what we’ve run.')}</h2>
          </div>
          <a class="btn ghost go reveal" href="workshops.html">All workshops</a>
        </header>
        ${next ? featureCard(next) : `<div class="wgrid one">${pastCard(last)}</div>`}
      </div>`;
  } else if (wSlot) {
    wSlot.remove();
  }

  /* ---- testimonials ---- */
  const tSlot = document.querySelector('[data-testimonials]');
  if (tSlot) {
    /* Names are back on. They're the real cohort 01 respondents — see
       Homepage-Testimonials.md — and every one is still flagged needsCopy in
       seed.js until permission and a real job title come back. */
    tSlot.innerHTML = S.testimonials()
      .map(
        (t, i) => `
      <figure class="qcard reveal">
        <blockquote>“${esc(t.quote)}”</blockquote>
        <figcaption>
          <b>${esc(t.name)}</b>
          <small>${esc(t.role)}</small>
        </figcaption>
        <span class="face" aria-hidden="true">${RPS.ui.avatar(i)}</span>
      </figure>`
      )
      .join('');
  }

  /* ---- FAQ (first item open, PRD §8.1.7) ---- */
  const fSlot = document.querySelector('[data-faq]');
  if (fSlot) {
    /* The homepage carries the six marked `home` in seed.js — audience,
       barrier, price, format, tooling, takeaway. The rest stay in the data and
       in the internal console; they're just not on this page. */
    const allFaqs = S.faqs();
    const shortlist = allFaqs.filter((f) => f.home);
    fSlot.innerHTML = (shortlist.length ? shortlist : allFaqs)
      .map(
        (f, i) => `
      <div class="faq-item${i === 0 ? ' open' : ''} reveal">
        <h3 style="font-size:inherit;margin:0">
          <button class="faq-q" aria-expanded="${i === 0}" aria-controls="faq-a-${esc(f.id)}">
            <span class="mark" aria-hidden="true">?</span>
            <span class="qt">${esc(f.question)}</span>
            <span class="sign" aria-hidden="true"></span>
          </button>
        </h3>
        <div class="faq-a" id="faq-a-${esc(f.id)}"><p>${esc(f.answer)}</p></div>
      </div>`
      )
      .join('');
  }

  RPS.ui.mountArt(document);
  RPS.ui.mountWhatsapp(document);
  RPS.ui.mountWaMock(document);
  RPS.ui.mountMeetMock(document);
  RPS.ui.reveal();
  RPS.track('page_viewed', { page: 'home' });
})();
