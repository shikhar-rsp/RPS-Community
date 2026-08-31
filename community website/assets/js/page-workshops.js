/* Workshop listing (PRD §8.2)
   Tabs derive from dateTime, never a manual flag. Browsing is never gated —
   the gate fires on the detail page.

   The cards carry everything the decision needs — when, who with, how many
   seats are left, and whether you're already in — so nobody has to open three
   pages to find out the next one is full. The first upcoming session is given
   the dark treatment: on a listing, "which one is next" should be obvious
   before you read a word. */

(function () {
  const S = RPS.store;
  const esc = RPS.esc;

  RPS.boot('workshops');

  const listEl = document.querySelector('[data-list]');
  const tabsEl = document.querySelector('[data-tabs]');

  function seatChip(w) {
    if (S.isPast(w)) {
      return S.recordingReady(w)
        ? '<span class="seat done">Recording + files up</span>'
        : '<span class="seat warn">Recording still being cut</span>';
    }
    return RPS.ui.seatMeter(w);
  }

  function myStatus(w) {
    const e = S.enrollmentFor(w.id);
    if (!e) return '';
    const cls = e.status === 'WAITLISTED' ? 'wait' : 'reg';
    return `<span class="status ${cls}">${esc(S.statusLabel(e.status))}</span>`;
  }

  function metaLine(w) {
    const host = S.host(w.hostId);
    return esc(RPS.fmt.metaLine(w, host));
  }

  function upcomingCard(w, lead) {
    const url = 'workshop.html?w=' + encodeURIComponent(w.slug);
    const full = S.isFull(w);
    const mine = S.enrollmentFor(w.id);
    const btnClass = lead ? 'btn onDark go' : 'btn go';

    const cta = mine
      ? `<a class="${lead ? 'btn onDark' : 'btn quiet'}" href="${url}">You’re ${mine.status === 'WAITLISTED' ? 'on the list' : 'in'} →</a>`
      : `<a class="${btnClass}" href="${url}&action=enroll">${full ? 'Join the waitlist' : 'Grab a seat'}</a>`;

    /* The banner sets the lead card's height and the copy sits inside it, so
       the card carries the title, the summary and the chips. The curriculum
       is one click away on the detail page. */

    return `
    <article class="wcard${lead ? ' dark wide' : ''} reveal">
      <div class="media">
        <a href="${url}" tabindex="-1" aria-hidden="true">
          <div class="frame flat" data-art="${esc(w.bannerArt)}"${w.bannerUrl ? ` data-src="${esc(w.bannerUrl)}" data-alt="${esc(w.title)}"` : ''} style="height:${lead ? 260 : 220}px"></div>
        </a>
      </div>
      <div class="body">
        <h3><a href="${url}">${esc(w.title)}</a></h3>
        <p class="summary">${esc(w.summary)}</p>
        <div class="facts">
          <span class="fact ${lead ? 'mint' : ''}">${esc(w.cohortLabel || 'Upcoming')}${lead ? ' · Next up' : ''}</span>
          <span class="fact">${esc(RPS.fmt.dayShort(w.dateTime))} · ${esc(RPS.fmt.time(w.dateTime))}</span>
          ${S.host(w.hostId) ? `<span class="fact">with ${esc(S.host(w.hostId).name)}</span>` : ''}
        </div>
        <div class="foot">
          ${cta}
          <span class="note">${myStatus(w) || seatChip(w)}</span>
        </div>
      </div>
    </article>`;
  }

  function pastCard(w, wide) {
    const url = 'workshop.html?w=' + encodeURIComponent(w.slug);
    const ready = S.recordingReady(w);
    const files = (w.resources || []).length;

    return `
    <article class="wcard${wide ? ' wide' : ''} reveal">
      <div class="media">
        <a href="${url}" tabindex="-1" aria-hidden="true">
          <div class="frame flat" data-art="${esc(w.bannerArt)}"${w.bannerUrl ? ` data-src="${esc(w.bannerUrl)}" data-alt="${esc(w.title)}"` : ''} style="height:${wide ? 300 : 220}px"></div>
        </a>
        ${ready ? '<span class="playbadge" aria-hidden="true"></span>' : ''}
      </div>
      <div class="body">
        <h3><a href="${url}">${esc(w.title)}</a></h3>
        <p class="summary">${esc(w.summary)}</p>
        <div class="facts">
          <span class="fact">${esc(w.cohortLabel || 'Past')} · Done</span>
          <span class="fact">${metaLine(w)}</span>
          ${w.recordingLength ? `<span class="fact">${esc(w.recordingLength)}</span>` : ''}
          ${files ? `<span class="fact">${files} file${files > 1 ? 's' : ''}</span>` : ''}
        </div>
        <div class="foot">
          <a class="btn ${ready ? 'go' : 'quiet'}" href="${url}#recording">${ready ? 'Watch it' : 'See what happened'}</a>
          <span class="note">${myStatus(w) || seatChip(w)}</span>
        </div>
      </div>
    </article>`;
  }

  const emptyUpcoming = `
    <div class="callout reveal">
      <h2 style="font-size:clamp(1.6rem,2.6vw,2.1rem)">Nothing on the calendar — yet</h2>
      <p>The next one’s being cooked. The WhatsApp group hears about a week before it goes up here.</p>
      <div class="cta-row">
        <a class="btn go" data-wa data-whatsapp target="_blank" rel="noopener" href="#">Join the WhatsApp group</a>
        <button class="btn ghost" data-go-past>See the ones we’ve run</button>
      </div>
    </div>`;

  const emptyPast = `
    <div class="callout plain reveal">
      <h2 style="font-size:clamp(1.6rem,2.6vw,2.1rem)">No recordings yet</h2>
      <p>The first cohort’s recording goes up once it’s cut.</p>
    </div>`;

  function renderTabs(which) {
    const counts = { upcoming: S.upcoming().length, past: S.past().length };
    tabsEl.innerHTML = ['upcoming', 'past']
      .map(
        (k) => `
      <button class="tab" role="tab" id="tab-${k}" aria-controls="panel-list"
              aria-selected="${k === which}" data-tab="${k}">
        ${k === 'upcoming' ? 'Upcoming' : 'Past &amp; recordings'}
        <span class="n">${counts[k]}</span>
      </button>`
      )
      .join('');
    tabsEl.querySelectorAll('[data-tab]').forEach((t) =>
      t.addEventListener('click', () => render(t.dataset.tab))
    );
  }

  function render(which) {
    const items = which === 'past' ? S.past() : S.upcoming();
    renderTabs(which);
    document.getElementById('panel-list').setAttribute('aria-labelledby', 'tab-' + which);

    if (!items.length) {
      listEl.innerHTML = which === 'upcoming' ? emptyUpcoming : emptyPast;
    } else {
      const cards =
        which === 'past'
          ? items.map((x) => pastCard(x, items.length === 1))
          : items.map((x, i) => upcomingCard(x, i === 0));
      // The lead card gets the full width — it's the one most people came for.
      listEl.innerHTML =
        which === 'upcoming' && cards.length > 1
          ? `<div class="wgrid one">${cards[0]}</div><div class="wgrid" style="margin-top:20px">${cards.slice(1).join('')}</div>`
          : `<div class="wgrid${cards.length === 1 ? ' one' : ''}">${cards.join('')}</div>`;
    }

    const goPast = listEl.querySelector('[data-go-past]');
    if (goPast) goPast.addEventListener('click', () => render('past'));

    RPS.ui.mountArt(listEl);
    RPS.ui.mountWhatsapp(listEl);
    RPS.ui.reveal();
    history.replaceState(null, '', '#' + which);
    RPS.track('workshop_list_viewed', { tab: which, count: items.length });
  }

  /* Default to Upcoming. When there's nothing upcoming the empty state does the
     work (WhatsApp CTA, PRD §8.2) with Past one click away. */
  const fromHash = (location.hash || '').replace('#', '');
  render(fromHash === 'past' ? 'past' : 'upcoming');
})();
