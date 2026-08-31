/* /account — "My workshops" (PRD §8.6). Auth required; anonymous visits go to
   /login and come straight back here. */

(function () {
  const S = RPS.store;
  const esc = RPS.esc;

  RPS.boot('account');

  const root = document.querySelector('[data-page]');
  const me = S.session();

  if (!me) {
    location.replace('login.html?intent=generic&next=' + encodeURIComponent('account.html'));
    return;
  }

  function row(e) {
    const w = e.workshop;
    const url = 'workshop.html?w=' + encodeURIComponent(w.slug);
    const past = S.isPast(w);

    // Status label is always text, never colour alone (PRD §7 accessibility)
    let statusCls = 'reg';
    let statusText = 'Registered';
    let sub = `${RPS.fmt.dayShort(w.dateTime)} · ${RPS.fmt.time(w.dateTime)} · Meet link lands the day before`;
    let action = '';

    if (past) {
      statusCls = 'att';
      statusText = e.status === 'WAITLISTED' ? 'Waitlisted — didn’t make it' : 'Been there';
      sub = RPS.fmt.dateFull(w.dateTime);
      action = S.recordingReady(w)
        ? `<a class="linkish" href="${url}#recording">Watch it again</a>`
        : `<span class="micro">Recording still being cut</span>`;
    } else if (e.status === 'WAITLISTED') {
      statusCls = 'wait';
      statusText = 'Waitlisted';
      sub = `${RPS.fmt.dayShort(w.dateTime)} · ${RPS.fmt.time(w.dateTime)} · We’ll message if a seat frees up`;
    } else if (w.meetLink) {
      action = `<a class="btn sm" href="${esc(w.meetLink)}" target="_blank" rel="noopener">Join on Meet</a>`;
      sub = `${RPS.fmt.dayShort(w.dateTime)} · ${RPS.fmt.time(w.dateTime)} · Meet link’s ready`;
    }
    if (!past && e.status === 'REGISTERED' && e.whatsapp) sub += ` · Reminder to ${e.whatsapp}`;

    return `
    <div class="arow">
      <div>
        <div class="t"><a href="${url}">${esc(w.title)}</a></div>
        <div class="s">${esc(sub)}</div>
      </div>
      <div class="right">
        <span class="status ${statusCls}">${esc(statusText)}</span>
        ${action}
      </div>
    </div>`;
  }

  const mine = S.myEnrollments();
  const coming = mine
    .filter((e) => !S.isPast(e.workshop))
    .sort((a, b) => new Date(a.workshop.dateTime) - new Date(b.workshop.dateTime));
  const been = mine
    .filter((e) => S.isPast(e.workshop))
    .sort((a, b) => new Date(b.workshop.dateTime) - new Date(a.workshop.dateTime));

  const empty = `
    <div class="callout plain" style="margin-top:36px">
      <h3>Nothing here yet</h3>
      <p>Grab a seat and it’ll show up here with your Meet link.</p>
      <div class="cta-row"><a class="btn" href="workshops.html">See workshops</a></div>
    </div>`;

  root.innerHTML = `
    <div class="wrap page-top" style="padding-bottom:clamp(56px,8vw,96px)">
      <header class="sec-head">
        <div class="main">
          <span class="eyebrow">Your account</span>
          <h1 style="margin-top:20px;font-size:clamp(2.3rem,4.6vw,3.4rem)">My workshops</h1>
        </div>
        <p class="aside">Every seat you’ve taken, the Meet links, and every recording you can watch again.</p>
      </header>
      <div class="facts" style="margin-top:22px">
        <span class="fact mint">${esc(me.name)}</span>
        <span class="fact">${esc(me.email)}</span>
        ${me.phone ? `<span class="fact">${esc(me.phone)}</span>` : ''}
      </div>

      ${!mine.length ? empty : `
        ${coming.length ? `
          <h2 class="group-h">Coming up <span class="count">${coming.length}</span></h2>
          ${coming.map(row).join('')}` : ''}

        ${been.length ? `
          <h2 class="group-h">Been to <span class="count">${been.length}</span></h2>
          ${been.map(row).join('')}` : ''}

        ${!coming.length ? `
          <div class="banner info" style="margin-top:28px">
            <span>Nothing coming up. <a href="workshops.html">Grab a seat</a> for the next one.</span>
          </div>` : ''}
      `}
    </div>`;

  RPS.track('account_viewed', { enrollments: mine.length });
})();
