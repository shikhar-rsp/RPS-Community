/* =============================================================================
   The two looping mocks — the WhatsApp group chat and the hero's Google Meet
   call. Ported verbatim from the community website's assets/js/ui.js.

   Both are built from CSS + timed DOM updates rather than a video file, so they
   stay crisp at any size and cost nothing to load. Both pause offscreen, and
   both collapse to one settled frame under prefers-reduced-motion.

   Each export takes a DOM node and returns a teardown function, so a React
   component can drive it from a ref (see components/community/Mocks.jsx).
   ============================================================================= */

import { CONFIG } from './content';

const esc = (s) =>
  String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

// The vanilla build read these off the live store; here they come from the
// content module, which is the same data.
const S = () => ({ config: CONFIG });

  const WA_SCRIPT = [
    { name: 'Priya', color: '--brand', text: 'portfolio reviews this week — who wants the hot seat?' },
    { mine: true, text: 'me. dragging my case study in' },
    { system: true, text: 'Aarav joined via invite link' },
    { name: 'Kabir', color: '--hold', text: 'cohort 02 files are up' },
    { name: 'Kabir', color: '--hold', link: true, text: 'Design handoff — Figma file', sub: 'figma.com' },
    { name: 'Anya', color: '--ink', text: 'the states walkthrough alone is worth it' },
    { mine: true, text: 'saving that' }
  ];

  const WA_TYPING_HTML = `
    <div class="wa-mock__typing">
      <span class="wa-mock__typing-face"></span>
      <span class="wa-mock__typing-bubble"><i></i><i></i><i></i></span>
    </div>`;

  function waMsgHTML(m) {
    if (m.system) {
      return `<div class="wa-mock__msg"><div class="wa-mock__sys"><span>${esc(m.text)}</span></div></div>`;
    }
    if (m.mine) {
      return `
        <div class="wa-mock__msg">
          <div class="wa-mock__row mine">
            <div class="wa-mock__bubble--mine">
              <span class="wa-mock__text">${esc(m.text)}</span>
              <span class="wa-mock__ticks">✓✓</span>
            </div>
          </div>
        </div>`;
    }
    const inner = m.link
      ? `<div class="wa-mock__link">
           <div class="wa-mock__link-thumb"><i></i></div>
           <span class="wa-mock__link-title">${esc(m.text)}</span>
           <span class="wa-mock__link-sub">${esc(m.sub || '')}</span>
         </div>`
      : `<span class="wa-mock__text">${esc(m.text)}</span>`;
    return `
      <div class="wa-mock__msg">
        <div class="wa-mock__row">
          <span class="wa-mock__face" style="background:var(${m.color})">${esc(m.initial)}</span>
          <div class="wa-mock__bubble">
            ${m.showName ? `<span class="wa-mock__name" style="color:var(${m.color})">${esc(m.name)}</span>` : ''}
            ${inner}
          </div>
        </div>
      </div>`;
  }

  function initWaMock(el) {
    el.innerHTML = `
      <div class="wa-mock__head">
        <span class="wa-mock__avatar">${
          S().config.logoUrl
            ? `<img src="${esc(S().config.logoUrl)}" alt="">`
            : 'RC'
        }</span>
        <span class="wa-mock__who">
          <span class="wa-mock__title">RPS Cohorts</span>
          <span class="wa-mock__meta">Free · always open</span>
        </span>
        <span class="wa-mock__unread" data-unread>1</span>
      </div>
      <div class="wa-mock__body" data-body></div>
      <div class="wa-mock__composer">
        <span class="wa-mock__input">Message</span>
        <span class="wa-mock__send">↑</span>
      </div>`;

    const body = el.querySelector('[data-body]');
    const unreadEl = el.querySelector('[data-unread]');

    function paint(count, typing) {
      const shown = WA_SCRIPT.slice(0, count).map((m, i, arr) => ({
        ...m,
        initial: m.name ? m.name[0] : '',
        showName: !!m.name && (i === 0 || arr[i - 1].name !== m.name)
      }));
      body.innerHTML =
        shown.map(waMsgHTML).join('') + (typing ? `<div class="wa-mock__msg">${WA_TYPING_HTML}</div>` : '');
      if (unreadEl) {
        const unread = Math.max(1, shown.filter((m) => !m.mine && !m.system).length);
        unreadEl.textContent = String(unread);
      }
    }

    // Anyone who's asked for less motion gets the conversation already
    // sitting there, fully written out — no typing dots, no loop.
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      paint(WA_SCRIPT.length, false);
      return () => {};
    }

    let alive = false; // flips true once the observer confirms it's on screen
    let timer;
    const wait = (ms, fn) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (alive) fn();
      }, ms);
    };

    function run(i) {
      if (i >= WA_SCRIPT.length) {
        wait(2800, () => {
          body.style.opacity = '0';
          wait(700, () => {
            body.style.opacity = '';
            run(0);
          });
        });
        return;
      }
      const m = WA_SCRIPT[i];
      const reveal = () => {
        paint(i + 1, false);
        wait(m.mine ? 950 : m.link ? 1500 : 1250, () => run(i + 1));
      };
      if (m.mine || m.system) {
        wait(m.mine ? 650 : 500, reveal);
      } else {
        paint(i, true);
        wait(950, reveal);
      }
    }

    // Pause offscreen — no point animating a chat nobody's looking at. The
    // observer's first callback (whichever way it fires) is what starts the
    // loop; browsers without it just start immediately.
    let io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const wasAlive = alive;
          alive = entry.isIntersecting;
          if (alive && !wasAlive) run(0);
          else if (!alive) clearTimeout(timer);
        });
      });
      io.observe(el);
    } else {
      alive = true;
      run(0);
    }

    return () => {
      alive = false;
      clearTimeout(timer);
      if (io) io.disconnect();
    };
  }

  const MEET_PEOPLE = [
    { name: 'Vineet Chopdekar', initial: 'V', avatarBg: '#4285F4' },
    { name: 'Vivin Richard', initial: 'V', avatarBg: '#DB4437' },
    { name: 'Nikhil Gadkar', initial: 'N', avatarBg: '#00897B' },
    { name: '42 others', initial: '+', avatarBg: '#5F6368' }
  ];

  const MEET_REACTIONS = [
    { color: '#EA4335', path: 'M12 20.5S3.5 15 3.5 9.4A4.4 4.4 0 0 1 12 7.3a4.4 4.4 0 0 1 8.5 2.1c0 5.6-8.5 11.1-8.5 11.1z' },
    { color: '#FBBC04', path: 'M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 17.1l-5.7 3.1 1.2-6.3L2.8 9.5l6.4-.8L12 2.8z' },
    { color: '#8AB4F8', path: 'M12 2l1.7 5.4a2 2 0 0 0 1.3 1.3L20.4 10l-5.4 1.3a2 2 0 0 0-1.3 1.3L12 18l-1.7-5.4a2 2 0 0 0-1.3-1.3L3.6 10 9 8.7A2 2 0 0 0 10.3 7.4L12 2z' }
  ];

  const MEET_CAPTIONS = [
    'nothing was decided before the prompt — that’s the whole problem',
    'Vineet: name the defect, don’t describe the vibe',
    'AI only builds the happy path unless you make it',
    'question in chat: what if I hit my usage limit mid-session?'
  ];

  const MEET_PROMPTS = [
    'user story + acceptance criteria, not a standup line',
    'every state: empty, loading, error, first-run',
    'our tokens and components — not default shadcn'
  ];

  /* The shared screen builds a website out of exploded 3D layers: each section
     flies into place while the prompt types, then the whole stack snaps flat
     into a finished page and ships. Positions are in the fixed 1280×720 stage's
     own pixels — see the .meet-mock__layer rules. */
  const MEET_LAYERS = [
    {
      top: 0, h: 38, z: 112, cls: '',
      html:
        '<div class="row"><i class="dot"></i><i class="b" style="width:74px"></i>' +
        '<i class="b dim" style="width:56px"></i><i class="b dim" style="width:48px"></i>' +
        '<span class="sp"></span><i class="pill"></i></div>'
    },
    {
      top: 48, h: 124, z: 88, cls: ' is-hero',
      html:
        '<i class="b lg" style="width:58%"></i><i class="b lg" style="width:40%"></i>' +
        '<i class="b dim" style="width:48%"></i>' +
        '<div class="row" style="margin-top:6px"><i class="btn"></i><i class="btn ghost"></i></div>'
    },
    {
      top: 182, h: 76, z: 64, cls: '',
      html:
        '<div class="row" style="height:100%"><span class="card"></span>' +
        '<span class="card hot"></span><span class="card"></span><span class="card"></span></div>'
    },
    {
      top: 268, h: 70, z: 40, cls: '',
      html: '<i class="strip"></i><i class="strip" style="width:64%"></i>'
    },
    {
      top: 348, h: 30, z: 14, cls: '',
      html:
        '<div class="row"><i class="b dim" style="width:66px"></i><i class="b dim" style="width:52px"></i>' +
        '<i class="b dim" style="width:60px"></i><span class="sp"></span>' +
        '<i class="b dim" style="width:88px"></i></div>'
    }
  ];

  const MEET_ICON = {
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"></path>',
    cam: '<rect x="2.5" y="6.5" width="13" height="11" rx="3"></rect><path d="M15.5 12l5-3.2v6.4l-5-3.2z"></path>',
    hand: '<path d="M8 12V5.5a1.6 1.6 0 0 1 3.2 0V11m0-.6V4.4a1.6 1.6 0 0 1 3.2 0V11m0-.4V6.4a1.6 1.6 0 0 1 3.2 0V14a6.4 6.4 0 0 1-6.4 6.4h-.6A5.6 5.6 0 0 1 5 14.8V12a1.5 1.5 0 0 1 3 0"></path>',
    cc: '<rect x="2.5" y="4" width="19" height="13" rx="2.5"></rect><path d="M12 13.5V7.5m0 0L9.4 10M12 7.5l2.6 2.5M8.5 20.5h7"></path>',
    muteSlash: '<rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"></path><path d="M3.5 3.5l17 17" stroke="#E2837A"></path>',
    leave: 'M6.6 10.8c1.5 2.9 3.7 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2.2 2.3z'
  };

  function meetMockHTML() {
    const layers = MEET_LAYERS.map(
      (l) => `
        <div class="meet-mock__layer${l.cls}" data-mm-layer
             style="--top:${l.top}px;--h:${l.h}px;--z:${l.z}px">${l.html}</div>`
    ).join('');

    const tiles = MEET_PEOPLE.map(
      (p) => `
        <div class="meet-mock__tile" data-mm-tile>
          <div class="meet-mock__tile-avatar" style="background:${p.avatarBg}">${esc(p.initial)}</div>
          <div class="meet-mock__tile-ring"></div>
          <span class="meet-mock__tile-name">${esc(p.name)}</span>
          <div class="meet-mock__tile-speaking"><i></i><i></i><i></i></div>
          <div class="meet-mock__tile-muted"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--mm-ink-2)" stroke-width="1.9" stroke-linecap="round">${MEET_ICON.muteSlash}</svg></div>
        </div>`
    ).join('');

    const reactionSlots = MEET_REACTIONS.map(
      (r) => `
        <i data-mm-reaction><svg viewBox="0 0 24 24" width="15" height="15" fill="${r.color}"><path d="${r.path}"></path></svg></i>`
    ).join('');

    const risingBubbles = MEET_REACTIONS.map(
      (r, i) => `<i><svg viewBox="0 0 24 24" width="${21 - i * 3}" height="${21 - i * 3}" fill="${r.color}"><path d="${r.path}"></path></svg></i>`
    ).join('');

    const waveBars = Array.from({ length: 26 }, (_, i) => `<i style="animation-delay:${(i * 0.055).toFixed(3)}s"></i>`).join('');

    return `
    <div class="meet-mock__float">
    <div class="meet-mock__tilt" data-mm-tilt>
      <div class="meet-mock__lid">
      <div class="meet-mock__bezel">
        <div class="meet-mock__cam"></div>
        <div class="meet-mock__box" data-mm-box>
          <div class="meet-mock__glass" aria-hidden="true"></div>
          <div class="meet-mock__stage" data-mm-stage>

            <div class="meet-mock__topbar">
              <span class="meet-mock__clock">9:39 AM</span>
              <span class="meet-mock__div"></span>
              <span class="meet-mock__code">rps-coho-rts</span>
              <span class="meet-mock__info">i</span>
              <span class="meet-mock__spacer"></span>
              <span class="meet-mock__rec"><i></i><span>REC</span></span>
              <span class="meet-mock__brand">
                <img src="/assets/brand/academy-logo-full.png" alt="RPS Cohorts">
                <span>rockpaperscissors</span>
              </span>
            </div>

            <div class="meet-mock__main">
              <div class="meet-mock__stagecol">
                <div class="meet-mock__sharewrap">
                  <div class="meet-mock__share">
                    <div class="meet-mock__panel">
                      <div class="meet-mock__build" data-mm-build>
                        <div class="meet-mock__stage3d">
                          <div class="meet-mock__scene" data-mm-scene>
                            <div class="meet-mock__pane">
                              <div class="meet-mock__pane-head"><i></i><i></i><i></i><b></b></div>
                              <div class="meet-mock__pane-body">${layers}</div>
                            </div>
                          </div>
                          <span class="meet-mock__cursor" aria-hidden="true"><svg viewBox="0 0 16 16" width="18" height="18"><path d="M2 1.6l11 5.6-4.7 1.3-1.9 4.6z" fill="var(--mm-ink)" stroke="var(--mm-canvas)" stroke-width="1" stroke-linejoin="round"></path></svg></span>
                          <span class="meet-mock__shipped">Deployed · netpulse-sol.com</span>
                        </div>
                      </div>
                      <div class="meet-mock__prompt">
                        <span class="meet-mock__prompt-ico"></span>
                        <span class="meet-mock__prompt-text" data-mm-prompt></span>
                        <span class="meet-mock__caret" data-mm-caret></span>
                      </div>
                    </div>
                  </div>
                  <div class="meet-mock__reactions">${reactionSlots}</div>
                  <div class="meet-mock__rising">${risingBubbles}</div>
                </div>
                <div class="meet-mock__presentbar">
                  <span class="meet-mock__presenting"><i></i>rockpaperscissors is presenting</span>
                  <span class="meet-mock__caption" data-mm-caption></span>
                </div>
              </div>

              <div class="meet-mock__sidebar">
                ${tiles}
                <div class="meet-mock__notetaker">
                  <div class="meet-mock__notetaker-head">
                    <span class="meet-mock__notetaker-ai">AI</span>
                    <span>RPS Notetaker</span>
                  </div>
                  <div class="meet-mock__wave">${waveBars}</div>
                  <span class="meet-mock__notetaker-note">Recording and taking notes</span>
                </div>
              </div>
            </div>

            <div class="meet-mock__controlbar">
              <div class="meet-mock__ctl"><svg viewBox="0 0 24 24" fill="none" stroke="var(--mm-ink)" stroke-width="1.9" stroke-linecap="round">${MEET_ICON.mic}</svg></div>
              <div class="meet-mock__ctl"><svg viewBox="0 0 24 24" fill="none" stroke="var(--mm-ink)" stroke-width="1.9" stroke-linecap="round">${MEET_ICON.cam}</svg></div>
              <div class="meet-mock__ctl meet-mock__hand"><svg viewBox="0 0 24 24" fill="none" stroke="var(--mm-blue)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${MEET_ICON.hand}</svg></div>
              <div class="meet-mock__ctl is-on"><svg viewBox="0 0 24 24" fill="none" stroke="var(--mm-blue)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${MEET_ICON.cc}</svg></div>
              <div class="meet-mock__ctl meet-mock__dots"><i></i><i></i><i></i></div>
              <div class="meet-mock__ctl-div"></div>
              <div class="meet-mock__leave"><svg viewBox="0 0 24 24" fill="#fff"><path d="${MEET_ICON.leave}"></path></svg>Leave</div>
            </div>

          </div>
        </div>
      </div>
      </div>
      <div class="meet-mock__base"></div>
    </div>
    <div class="meet-mock__shadow" aria-hidden="true"></div>
    </div>`;
  }

  function initMeetMock(el) {
    el.innerHTML = meetMockHTML();

    const box = el.querySelector('[data-mm-box]');
    const stage = el.querySelector('[data-mm-stage]');
    const promptEl = el.querySelector('[data-mm-prompt]');
    const caretEl = el.querySelector('[data-mm-caret]');
    const captionEl = el.querySelector('[data-mm-caption]');
    const sceneEl = el.querySelector('[data-mm-scene]');
    const buildEl = el.querySelector('[data-mm-build]');
    const layerEls = Array.from(el.querySelectorAll('[data-mm-layer]'));
    const tileEls = Array.from(el.querySelectorAll('[data-mm-tile]'));
    const reactionEls = Array.from(el.querySelectorAll('[data-mm-reaction]'));

    function fit() {
      if (!box || !stage) return;
      const w = box.clientWidth;
      if (w) stage.style.transform = 'scale(' + w / 1280 + ')';
    }
    fit();
    if ('ResizeObserver' in window) {
      new ResizeObserver(fit).observe(box);
    } else {
      window.addEventListener('resize', fit);
    }

    const state = { active: 0, cap: 0, capOn: true, react: 0, typed: 0, pi: 0, built: 0, caret: 1 };

    const paintTiles = () =>
      tileEls.forEach((t, i) => {
        t.classList.toggle('is-active', i === state.active);
        t.classList.toggle('is-speaking', i === state.active);
        t.classList.toggle('is-muted', i !== state.active && i !== 3);
      });
    const paintCaption = () => {
      captionEl.textContent = MEET_CAPTIONS[state.cap];
      captionEl.style.opacity = state.capOn ? '1' : '0';
    };
    const paintPrompt = () => {
      promptEl.textContent = MEET_PROMPTS[state.pi].slice(0, state.typed);
      caretEl.style.opacity = state.caret ? '1' : '0';
    };
    const paintLayers = () =>
      layerEls.forEach((l, i) => l.classList.toggle('is-in', i < state.built));
    const paintReactions = () =>
      reactionEls.forEach((wrap, i) => {
        const on = state.react === i;
        wrap.style.transform = 'scale(' + (on ? 1.14 : 1) + ')';
        const svg = wrap.querySelector('svg');
        if (svg) svg.style.opacity = on ? '1' : '.34';
      });

    paintTiles();
    paintCaption();
    paintPrompt();
    paintLayers();
    paintReactions();

    // Anyone who's asked for less motion gets one settled frame: the first
    // person mid-sentence, the prompt fully typed, the page already assembled
    // and shipped, nothing cycling.
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      state.built = MEET_LAYERS.length;
      state.typed = MEET_PROMPTS[0].length;
      state.caret = 0;
      paintPrompt();
      paintLayers();
      if (sceneEl) sceneEl.classList.add('is-flat');
      if (buildEl) buildEl.classList.add('is-shipped');
      return () => {};
    }

    /* The lid is shut until the mock scrolls into view, then opens once and
       the screen comes up with it. Pointer tilt (fine pointers only — a
       finger would just fight the page scroll) keeps it reading as an object
       on a desk rather than a flat screenshot. */
    const tiltEl = el.querySelector('[data-mm-tilt]');
    el.classList.add('is-shut');

    if (tiltEl && window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      const aim = { x: 0, y: 0 };
      let raf = 0;
      const apply = () => {
        raf = 0;
        tiltEl.style.transform =
          'rotateX(' + (1.5 - aim.y * 2).toFixed(2) + 'deg) rotateY(' + (aim.x * 3).toFixed(2) + 'deg)';
      };
      el.addEventListener('pointerenter', () => {
        tiltEl.style.transition = 'transform .22s ease-out';
      });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        aim.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        aim.y = ((e.clientY - r.top) / r.height) * 2 - 1;
        if (!raf) raf = requestAnimationFrame(apply);
      });
      el.addEventListener('pointerleave', () => {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        tiltEl.style.transition = '';
        tiltEl.style.transform = '';
      });
    }

    let alive = false;
    const timers = [];
    const intervals = [];
    const wait = (ms, fn) => {
      timers.push(
        setTimeout(() => {
          if (alive) fn();
        }, ms)
      );
    };
    const clearTimers = () => timers.splice(0).forEach(clearTimeout);
    const stopIntervals = () => intervals.splice(0).forEach(clearInterval);

    function tick() {
      wait(3400, () => {
        state.active = (state.active + 1) % 3;
        paintTiles();
        tick();
      });
    }
    function cycleCaption() {
      wait(4400, () => {
        state.capOn = false;
        paintCaption();
        wait(320, () => {
          state.cap = (state.cap + 1) % MEET_CAPTIONS.length;
          state.capOn = true;
          paintCaption();
          cycleCaption();
        });
      });
    }
    function typeLoop() {
      const full = MEET_PROMPTS[state.pi];
      if (state.typed < full.length) {
        wait(26, () => {
          state.typed++;
          paintPrompt();
          /* Sections land while the prompt is still being typed, so the canvas
             is never sitting there empty. The last one waits for the full
             prompt — that's the one that completes the page. */
          const due = Math.floor((state.typed / full.length) * (MEET_LAYERS.length - 1));
          if (due > state.built) {
            state.built = due;
            paintLayers();
          }
          typeLoop();
        });
        return;
      }
      wait(300, () => {
        state.built = Math.min(MEET_LAYERS.length, state.built + 1);
        paintLayers();

        if (state.built < MEET_LAYERS.length) {
          typeLoop();
          return;
        }

        /* Every section is in — snap the exploded stack flat into a finished
           page, ship it, hold on the result, then explode out for the next
           prompt. */
        wait(650, () => {
          if (sceneEl) sceneEl.classList.add('is-flat');
          wait(850, () => {
            if (buildEl) buildEl.classList.add('is-shipped');
          });
          wait(3400, () => {
            if (sceneEl) sceneEl.classList.remove('is-flat');
            if (buildEl) buildEl.classList.remove('is-shipped');
            state.typed = 0;
            state.built = 0;
            state.pi = (state.pi + 1) % MEET_PROMPTS.length;
            paintPrompt();
            paintLayers();
            wait(700, typeLoop);
          });
        });
      });
    }
    function startIntervals() {
      intervals.push(
        setInterval(() => {
          state.caret = state.caret ? 0 : 1;
          paintPrompt();
        }, 520)
      );
      intervals.push(
        setInterval(() => {
          state.react = (state.react + 1) % 4;
          paintReactions();
        }, 2400)
      );
    }

    // Pause offscreen — same reasoning as the WhatsApp mock: no point
    // animating a call nobody's looking at.
    let io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const wasAlive = alive;
          alive = entry.isIntersecting;
          if (alive && !wasAlive) {
            el.classList.remove('is-shut');
            tick();
            cycleCaption();
            typeLoop();
            startIntervals();
          } else if (!alive) {
            clearTimers();
            stopIntervals();
          }
        });
      });
      io.observe(el);
    } else {
      alive = true;
      el.classList.remove('is-shut');
      tick();
      cycleCaption();
      typeLoop();
      startIntervals();
    }

    return () => {
      alive = false;
      clearTimers();
      stopIntervals();
      if (io) io.disconnect();
    };
  }

export { initWaMock, initMeetMock };
