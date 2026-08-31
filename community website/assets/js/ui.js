/* =============================================================================
   RPS Cohorts — shared UI
   Nav + footer chrome, login modal (with intent preservation), toasts, FAQ
   accordion, scroll reveal, placeholder art, and the prototype demo panel.
   ============================================================================= */

window.RPS = window.RPS || {};

(function () {
  const S = () => RPS.store;
  const esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  RPS.esc = esc;

  const el = (html) => {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };

  /* ========================================================== placeholder art
     Every one of these is a stand-in. PRD §7 asks for real photography —
     the Meet session, the team, real faces. Swap <svg> for <img> and keep
     the .frame wrapper. */
  const A = {
    studio() {
      return `
      <svg viewBox="0 0 720 560" role="img" aria-label="Illustration standing in for a photo of the RPS studio at work">
        <rect width="720" height="560" fill="#F6F3F0"/>
        <rect x="0" y="392" width="720" height="168" fill="#EDE8E3"/>
        <rect x="60" y="352" width="600" height="18" rx="9" fill="#DCD3CB"/>
        <rect x="110" y="368" width="14" height="120" fill="#DCD3CB"/>
        <rect x="596" y="368" width="14" height="120" fill="#DCD3CB"/>
        <rect x="150" y="196" width="230" height="156" rx="12" fill="#241713"/>
        <rect x="168" y="216" width="90" height="10" rx="5" fill="#FF630B"/>
        <rect x="168" y="238" width="194" height="60" rx="8" fill="#FFF8F3" opacity=".9"/>
        <rect x="168" y="308" width="120" height="26" rx="13" fill="#3D5A8A"/>
        <rect x="404" y="228" width="176" height="124" rx="12" fill="#fff" stroke="#DCD3CB"/>
        <rect x="424" y="250" width="70" height="9" rx="4.5" fill="#DCD3CB"/>
        <rect x="424" y="270" width="136" height="9" rx="4.5" fill="#EDE8E3"/>
        <rect x="424" y="290" width="110" height="9" rx="4.5" fill="#EDE8E3"/>
        <rect x="424" y="316" width="62" height="20" rx="10" fill="#FFE0CC"/>
        <circle cx="238" cy="130" r="42" fill="#FF630B"/><circle cx="238" cy="118" r="16" fill="#FFE0CC"/>
        <path d="M212 152a26 26 0 0 1 52 0z" fill="#FFE0CC"/>
        <circle cx="470" cy="150" r="36" fill="#3D5A8A"/><circle cx="470" cy="140" r="14" fill="#2C4368"/>
        <path d="M448 170a22 22 0 0 1 44 0z" fill="#2C4368"/>
        <circle cx="596" cy="168" r="30" fill="#4A3F38"/><circle cx="596" cy="160" r="11" fill="#F6F3F0"/>
        <path d="M578 184a18 18 0 0 1 36 0z" fill="#F6F3F0"/>
        <path d="M80 300 l0-70 40 0" stroke="#FF630B" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M104 216l16 14-16 14" stroke="#FF630B" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
    },

    team() {
      return `
      <svg viewBox="0 0 720 540" role="img" aria-label="Illustration standing in for the RPS team group photo">
        <rect width="720" height="540" fill="#FFE0CC"/>
        <circle cx="360" cy="470" r="260" fill="#FFF8F3"/>
        <g>
          <circle cx="150" cy="292" r="58" fill="#FF630B"/><circle cx="150" cy="274" r="22" fill="#FFE0CC"/>
          <path d="M114 326a36 36 0 0 1 72 0z" fill="#FFE0CC"/>
          <circle cx="272" cy="248" r="66" fill="#3D5A8A"/><circle cx="272" cy="228" r="25" fill="#2C4368"/>
          <path d="M232 286a40 40 0 0 1 80 0z" fill="#2C4368"/>
          <circle cx="404" cy="240" r="70" fill="#241713"/><circle cx="404" cy="219" r="26" fill="#FFF8F3"/>
          <path d="M362 280a42 42 0 0 1 84 0z" fill="#FFF8F3"/>
          <circle cx="536" cy="256" r="62" fill="#4A3F38"/><circle cx="536" cy="237" r="23" fill="#F6F3F0"/>
          <path d="M498 292a38 38 0 0 1 76 0z" fill="#F6F3F0"/>
          <circle cx="628" cy="316" r="50" fill="#7A2F06"/><circle cx="628" cy="301" r="19" fill="#FFE0CC"/>
          <path d="M598 344a30 30 0 0 1 60 0z" fill="#FFE0CC"/>
          <circle cx="66" cy="356" r="44" fill="#DCD3CB"/><circle cx="66" cy="342" r="17" fill="#4A3F38"/>
          <path d="M40 380a26 26 0 0 1 52 0z" fill="#4A3F38"/>
        </g>
        <rect x="212" y="416" width="296" height="16" rx="8" fill="#DCD3CB"/>
        <rect x="268" y="446" width="184" height="12" rx="6" fill="#EDE8E3"/>
      </svg>`;
    },

    /* The face on a feedback ticket. Same three marks as a figure in team() —
       a disc, a head, a shoulder arc — at the scale of an avatar, so the
       testimonials read as part of the same drawn world as About us and the
       problem section rather than as a separate widget. Six colourways off the
       same palette those two use, picked by position so a row never repeats. */
    avatarInks: [
      ['#FF630B', '#FFE0CC'],
      ['#3D5A8A', '#FFF8F3'],
      ['#241713', '#FFE0CC'],
      ['#7A2F06', '#FFE0CC'],
      ['#4A3F38', '#F6F3F0'],
      ['#C24405', '#FFF8F3']
    ],

    /* The block on the end of a feedback bar. Four geometric tiles — burst,
       quarter-circle, chevron, lens — each in its own colourway off the site
       palette, cycling by position so the column alternates warm, dark, cool,
       warm. The tile is the only place the vivid brand appears at this size;
       no text sits on it, which is why it can carry the full #FF630B. */
    qpatternInks: [
      ['#FFE0CC', '#FF630B'],
      ['#5A2204', '#FFB27A'],
      ['#EDF2FA', '#3D5A8A'],
      ['#FFF1E8', '#C24405']
    ],

    qpattern(i) {
      const sets = A.qpatternInks;
      const n = (((i | 0) % sets.length) + sets.length) % sets.length;
      const bg = sets[n][0];
      const ink = sets[n][1];
      // every instance needs its own id, or the first one on the page wins
      const id = 'qp' + n + '_' + (A._qpSeq = (A._qpSeq || 0) + 1);
      /* Tiles are drawn small — roughly a third of the block's height — so the
         motif reads as texture behind the quote rather than as artwork of its
         own. Strokes are kept just heavy enough to hold at that size. */
      const tiles = [
        `<pattern id="${id}" width="22" height="22" patternUnits="userSpaceOnUse">
           <path d="M11 3v16M3 11h16M5.7 5.7l10.6 10.6M16.3 5.7L5.7 16.3" stroke="${ink}" stroke-width="1.7" stroke-linecap="round"/>
           <circle cx="11" cy="11" r="2.8" fill="${bg}" stroke="${ink}" stroke-width="1.7"/>
         </pattern>`,
        `<pattern id="${id}" width="22" height="22" patternUnits="userSpaceOnUse">
           <path d="M0 0a11 11 0 0 1 11 11H0z" fill="${ink}"/>
           <path d="M22 22a11 11 0 0 1-11-11h11z" fill="${ink}"/>
         </pattern>`,
        `<pattern id="${id}" width="22" height="15" patternUnits="userSpaceOnUse">
           <path d="M-2 11L4.5 4l5.5 7L15.5 4l5.5 7 3-3.2" stroke="${ink}" stroke-width="2.6" fill="none" stroke-linejoin="round"/>
         </pattern>`,
        `<pattern id="${id}" width="15" height="22" patternUnits="userSpaceOnUse">
           <ellipse cx="7.5" cy="11" rx="4.6" ry="9.4" fill="${ink}"/>
         </pattern>`
      ];
      return `
      <svg viewBox="0 0 160 130" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>${tiles[n]}</defs>
        <rect width="160" height="130" fill="${bg}"/>
        <rect width="160" height="130" fill="url(#${id})"/>
      </svg>`;
    },

    avatar(i) {
      const set = A.avatarInks;
      const [disc, mark] = set[(((i | 0) % set.length) + set.length) % set.length];
      return `
      <svg viewBox="0 0 80 80" focusable="false">
        <circle cx="40" cy="40" r="38" fill="${disc}"/>
        <circle cx="40" cy="28" r="14" fill="${mark}"/>
        <path d="M16 62a24 24 0 0 1 48 0z" fill="${mark}"/>
      </svg>`;
    },

    /* ------------------------------------------------------ Workshop banners
       One motif per workshop, drawn in the same grammar: a 3:2 stage, a
       gradient ground, a faint grid, two coloured glows, and a scene built out
       of the same UI primitives the site itself uses.

       3:2 is the master ratio (see the banner spec) and every one of them is
       `slice`, so they fill whatever box they land in — 1.29:1 on the workshop
       hero, up to 2.55:1 on a card. Everything that carries meaning sits
       inside the middle 585×360, which survives every crop. */
    banner(kind) {
      const art = {
        proto: A.bannerProto,
        landing: A.bannerLanding,
        handoff: A.bannerHandoff,
        portfolio: A.bannerPortfolio
      };
      return (art[kind] || A.bannerProto)();
    },

    /* Shared ground: gradient, grid, and two glows. `p` prefixes every id so
       two different banners on one page can't fight over a def. */
    bannerGround(p, a, b, c, warm, cool, gridInk, gridOp, warmOp, coolOp) {
      return `
        <defs>
          <linearGradient id="${p}bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/>
          </linearGradient>
          <radialGradient id="${p}warm" cx=".16" cy=".88" r=".62">
            <stop offset="0" stop-color="${warm}" stop-opacity="${warmOp || '.40'}"/><stop offset="1" stop-color="${warm}" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="${p}cool" cx=".86" cy=".10" r=".58">
            <stop offset="0" stop-color="${cool}" stop-opacity="${coolOp || '.32'}"/><stop offset="1" stop-color="${cool}" stop-opacity="0"/>
          </radialGradient>
          <pattern id="${p}grid" width="45" height="45" patternUnits="userSpaceOnUse">
            <path d="M45 0H0V45" fill="none" stroke="${gridInk}" stroke-opacity="${gridOp}" stroke-width="1"/>
          </pattern>
          <filter id="${p}sh" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#5A3418" flood-opacity=".20"/>
          </filter>
        </defs>
        <rect width="900" height="600" fill="url(#${p}bg)"/>
        <rect width="900" height="600" fill="url(#${p}grid)"/>
        <rect width="900" height="600" fill="url(#${p}warm)"/>
        <rect width="900" height="600" fill="url(#${p}cool)"/>`;
    },

    /* Design a product with AI — the same screen twice: the one a lazy prompt
       gives you, and the one a spec and a system give you. */
    bannerProto() {
      return `
      <svg viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" role="img"
           aria-label="Two versions of the same product screen side by side — the generic one and the one built with a spec and a design system">
        ${A.bannerGround('pr', '#161C28', '#0D1117', '#1B140F', '#FF630B', '#5B8CFF', '#FFFFFF', '.05')}
        <defs>
          <linearGradient id="prHot" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#FF7A2B"/><stop offset="1" stop-color="#FF630B" stop-opacity=".45"/>
          </linearGradient>
        </defs>

        <!-- the generic one: three identical blocks, no hierarchy -->
        <rect x="108" y="176" width="292" height="272" rx="18" fill="#1B2230" stroke="#FFFFFF" stroke-opacity=".07"/>
        <rect x="132" y="202" width="104" height="9" rx="4.5" fill="#FFFFFF" fill-opacity=".16"/>
        <circle cx="364" cy="206" r="4" fill="#FFFFFF" fill-opacity=".12"/>
        <circle cx="350" cy="206" r="4" fill="#FFFFFF" fill-opacity=".12"/>
        <circle cx="336" cy="206" r="4" fill="#FFFFFF" fill-opacity=".12"/>
        <rect x="132" y="228" width="244" height="58" rx="9" fill="#FFFFFF" fill-opacity=".055"/>
        <rect x="132" y="296" width="244" height="58" rx="9" fill="#FFFFFF" fill-opacity=".055"/>
        <rect x="132" y="364" width="244" height="58" rx="9" fill="#FFFFFF" fill-opacity=".055"/>

        <!-- the divider, and the spark on it -->
        <path d="M450 150V450" stroke="#FFFFFF" stroke-opacity=".14" stroke-width="2" stroke-dasharray="2 14" stroke-linecap="round"/>
        <circle cx="450" cy="300" r="30" fill="#0D1117"/>
        <circle cx="450" cy="300" r="30" fill="#FF630B" fill-opacity=".14"/>
        <path d="M450 278l6.6 15.4L472 300l-15.4 6.6L450 322l-6.6-15.4L428 300l15.4-6.6z" fill="#FF630B"/>

        <!-- the built one: hierarchy, a system, and the states nobody remembers -->
        <rect x="492" y="140" width="316" height="336" rx="20" fill="#FF630B" fill-opacity=".07"/>
        <rect x="500" y="148" width="300" height="320" rx="18" fill="#0F151E" stroke="#FFFFFF" stroke-opacity=".11"/>
        <rect x="524" y="172" width="14" height="14" rx="4" fill="#FF630B"/>
        <rect x="548" y="176" width="34" height="7" rx="3.5" fill="#FFFFFF" fill-opacity=".22"/>
        <rect x="590" y="176" width="26" height="7" rx="3.5" fill="#FFFFFF" fill-opacity=".14"/>
        <rect x="724" y="170" width="52" height="18" rx="9" fill="#FF630B"/>
        <rect x="524" y="212" width="196" height="13" rx="6.5" fill="#FFFFFF" fill-opacity=".40"/>
        <rect x="524" y="234" width="136" height="13" rx="6.5" fill="#FFFFFF" fill-opacity=".40"/>
        <rect x="524" y="260" width="172" height="8" rx="4" fill="#FFFFFF" fill-opacity=".16"/>
        <rect x="524" y="286" width="76" height="24" rx="7" fill="#FF630B"/>
        <rect x="610" y="286" width="60" height="24" rx="7" fill="#FFFFFF" fill-opacity=".13"/>
        <rect x="524" y="330" width="82" height="58" rx="9" fill="#FFFFFF" fill-opacity=".07"/>
        <rect x="616" y="330" width="82" height="58" rx="9" fill="url(#prHot)"/>
        <rect x="708" y="330" width="68" height="58" rx="9" fill="#FFFFFF" fill-opacity=".07"/>
        <rect x="524" y="404" width="58" height="16" rx="8" fill="#FF630B" fill-opacity=".22" stroke="#FF630B" stroke-opacity=".55"/>
        <rect x="590" y="404" width="58" height="16" rx="8" fill="none" stroke="#FF630B" stroke-opacity=".38"/>
        <rect x="656" y="404" width="58" height="16" rx="8" fill="none" stroke="#FF630B" stroke-opacity=".38"/>
        <rect x="722" y="404" width="54" height="16" rx="8" fill="none" stroke="#FF630B" stroke-opacity=".38"/>
        <circle cx="532" cy="444" r="7" fill="#FF630B"/>
        <circle cx="552" cy="444" r="7" fill="#5B8CFF"/>
        <circle cx="572" cy="444" r="7" fill="#FFE0CC"/>
        <circle cx="592" cy="444" r="7" fill="#FFFFFF" fill-opacity=".22"/>
      </svg>`;
    },

    /* Ship client-ready websites — drafts stacked behind the real thing, and
       the thing itself ending at a live URL. */
    bannerLanding() {
      return `
      <svg viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" role="img"
           aria-label="A landing page being built in a browser and deployed to a live URL">
        ${A.bannerGround('ld', '#2E170B', '#180D07', '#0E0705', '#FF630B', '#FFB27A', '#FFFFFF', '.045', '.42', '.22')}

        <!-- drafts behind -->
        <rect x="214" y="118" width="470" height="300" rx="18" fill="#FFFFFF" fill-opacity=".045"/>
        <rect x="196" y="140" width="470" height="300" rx="18" fill="#FFFFFF" fill-opacity=".07"/>

        <!-- the page that shipped -->
        <rect x="176" y="162" width="470" height="308" rx="18" fill="#150C07" stroke="#FFFFFF" stroke-opacity=".12"/>
        <path d="M176 180a18 18 0 0 1 18-18h434a18 18 0 0 1 18 18v20H176z" fill="#FFFFFF" fill-opacity=".05"/>
        <circle cx="202" cy="181" r="4.5" fill="#FFFFFF" fill-opacity=".18"/>
        <circle cx="218" cy="181" r="4.5" fill="#FFFFFF" fill-opacity=".18"/>
        <circle cx="234" cy="181" r="4.5" fill="#FFFFFF" fill-opacity=".18"/>
        <rect x="254" y="172" width="330" height="18" rx="9" fill="#000000" fill-opacity=".35"/>
        <circle cx="270" cy="181" r="4.5" fill="#34D399"/>
        <rect x="284" y="177" width="126" height="7" rx="3.5" fill="#FFFFFF" fill-opacity=".22"/>

        <rect x="204" y="228" width="14" height="14" rx="4" fill="#FF630B"/>
        <rect x="228" y="232" width="36" height="7" rx="3.5" fill="#FFFFFF" fill-opacity=".22"/>
        <rect x="272" y="232" width="28" height="7" rx="3.5" fill="#FFFFFF" fill-opacity=".14"/>
        <rect x="560" y="226" width="58" height="18" rx="9" fill="#FF630B"/>

        <rect x="204" y="270" width="230" height="15" rx="7.5" fill="#FFFFFF" fill-opacity=".42"/>
        <rect x="204" y="296" width="160" height="15" rx="7.5" fill="#FFFFFF" fill-opacity=".42"/>
        <rect x="204" y="326" width="196" height="8" rx="4" fill="#FFFFFF" fill-opacity=".16"/>
        <rect x="204" y="352" width="88" height="26" rx="8" fill="#FF630B"/>
        <rect x="302" y="352" width="68" height="26" rx="8" fill="#FFFFFF" fill-opacity=".13"/>
        <rect x="452" y="270" width="166" height="108" rx="12" fill="#FF630B" fill-opacity=".16" stroke="#FF630B" stroke-opacity=".28"/>
        <rect x="204" y="400" width="128" height="44" rx="10" fill="#FFFFFF" fill-opacity=".06"/>
        <rect x="344" y="400" width="128" height="44" rx="10" fill="#FFFFFF" fill-opacity=".06"/>
        <rect x="484" y="400" width="134" height="44" rx="10" fill="#FFFFFF" fill-opacity=".06"/>

        <!-- brief to shipped, in one arc -->
        <path d="M660 300c68-8 96-44 104-96" stroke="#FF630B" stroke-width="4" fill="none"
              stroke-linecap="round" stroke-dasharray="1 13"/>
        <path d="M752 206l14-8 2 17" stroke="#FF630B" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="676" y="150" width="164" height="52" rx="26" fill="#1B0E07" stroke="#FF630B" stroke-opacity=".45"/>
        <circle cx="706" cy="176" r="7" fill="#34D399"/>
        <rect x="724" y="167" width="86" height="8" rx="4" fill="#FFFFFF" fill-opacity=".55"/>
        <rect x="724" y="181" width="58" height="7" rx="3.5" fill="#FFFFFF" fill-opacity=".22"/>

        <!-- shipped, not sitting on localhost -->
        <rect x="176" y="498" width="470" height="8" rx="4" fill="#FFFFFF" fill-opacity=".09"/>
        <rect x="176" y="498" width="470" height="8" rx="4" fill="#FF630B"/>
        <circle cx="646" cy="502" r="11" fill="#FF630B"/>
        <circle cx="646" cy="502" r="20" fill="#FF630B" fill-opacity=".18"/>
      </svg>`;
    },

    /* Handoff — a spec on the left, the thing built from it on the right, and
       the states everyone forgets along the bottom. */
    bannerHandoff() {
      return `
      <svg viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" role="img"
           aria-label="An annotated spec on the left, the screen built from it on the right, and a row of interface states below">
        ${A.bannerGround('hd', '#FFF7F0', '#FFEDE0', '#FFE0CC', '#FF630B', '#3D5A8A', '#B08160', '.10', '.26', '.12')}

        <!-- the spec -->
        <rect x="104" y="112" width="300" height="286" rx="18" fill="#FFFFFF" stroke="#EFDFD2" filter="url(#hdsh)"/>
        <rect x="130" y="140" width="96" height="10" rx="5" fill="#241713" fill-opacity=".22"/>
        <rect x="130" y="170" width="248" height="84" rx="10" fill="#FFE0CC"/>
        <rect x="130" y="268" width="118" height="56" rx="10" fill="#F4EBE3"/>
        <rect x="260" y="268" width="118" height="56" rx="10" fill="#F4EBE3"/>
        <rect x="130" y="340" width="160" height="32" rx="10" fill="#241713" fill-opacity=".10"/>
        <path d="M130 160h248" stroke="#3D5A8A" stroke-width="1.5" stroke-dasharray="4 6"/>
        <path d="M414 170v84" stroke="#3D5A8A" stroke-width="1.5" stroke-dasharray="4 6"/>
        <circle cx="130" cy="170" r="12" fill="#FF630B"/><circle cx="130" cy="170" r="4" fill="#FFFFFF"/>
        <circle cx="378" cy="268" r="12" fill="#FF630B"/><circle cx="378" cy="268" r="4" fill="#FFFFFF"/>
        <circle cx="290" cy="356" r="12" fill="#3D5A8A"/><circle cx="290" cy="356" r="4" fill="#FFFFFF"/>

        <!-- built from it, no guessing -->
        <path d="M436 255h56" stroke="#FF630B" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 14"/>
        <path d="M488 245l14 10-14 10" stroke="#FF630B" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="522" y="112" width="284" height="286" rx="18" fill="#241713" filter="url(#hdsh)"/>
        <rect x="548" y="140" width="88" height="10" rx="5" fill="#FFB27A"/>
        <rect x="548" y="170" width="232" height="84" rx="10" fill="#FF630B" fill-opacity=".22"/>
        <rect x="548" y="268" width="110" height="56" rx="10" fill="#FFFFFF" fill-opacity=".08"/>
        <rect x="670" y="268" width="110" height="56" rx="10" fill="#FFFFFF" fill-opacity=".08"/>
        <rect x="548" y="340" width="120" height="32" rx="10" fill="#FF630B"/>
        <path d="M700 352l18 16 34-40" stroke="#34D399" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

        <!-- empty · loading · error · too much text -->
        <rect x="104" y="424" width="164" height="40" rx="12" fill="#FFFFFF" stroke="#EFDFD2"/>
        <rect x="126" y="440" width="60" height="8" rx="4" fill="#241713" fill-opacity=".14"/>
        <rect x="284" y="424" width="164" height="40" rx="12" fill="#FFFFFF" stroke="#EFDFD2"/>
        <rect x="306" y="440" width="34" height="8" rx="4" fill="#FF630B"/>
        <rect x="346" y="440" width="60" height="8" rx="4" fill="#241713" fill-opacity=".10"/>
        <rect x="464" y="424" width="164" height="40" rx="12" fill="#FFFFFF" stroke="#E9A79A"/>
        <circle cx="490" cy="444" r="8" fill="#E2534A"/>
        <rect x="508" y="440" width="76" height="8" rx="4" fill="#241713" fill-opacity=".14"/>
        <rect x="644" y="424" width="162" height="40" rx="12" fill="#FFFFFF" stroke="#EFDFD2"/>
        <rect x="666" y="435" width="118" height="6" rx="3" fill="#241713" fill-opacity=".14"/>
        <rect x="666" y="447" width="96" height="6" rx="3" fill="#241713" fill-opacity=".14"/>
      </svg>`;
    },

    /* Portfolio teardown — the first eight seconds, out loud. */
    bannerPortfolio() {
      return `
      <svg viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" role="img"
           aria-label="A portfolio page with live critique marks over it">
        ${A.bannerGround('pf', '#FFFAF5', '#FFF0E4', '#FFE2CD', '#FF630B', '#7A2F06', '#C08A66', '.10', '.26', '.10')}

        <rect x="150" y="104" width="562" height="392" rx="20" fill="#FFFFFF" stroke="#F0DFD2" filter="url(#pfsh)"/>
        <path d="M150 124a20 20 0 0 1 20-20h522a20 20 0 0 1 20 20v22H150z" fill="#FAF4EF"/>
        <circle cx="176" cy="125" r="4.5" fill="#E3D3C6"/>
        <circle cx="192" cy="125" r="4.5" fill="#E3D3C6"/>
        <circle cx="208" cy="125" r="4.5" fill="#E3D3C6"/>

        <rect x="182" y="182" width="150" height="16" rx="8" fill="#241713" fill-opacity=".72"/>
        <rect x="182" y="212" width="252" height="9" rx="4.5" fill="#241713" fill-opacity=".18"/>
        <rect x="182" y="232" width="190" height="9" rx="4.5" fill="#241713" fill-opacity=".12"/>

        <rect x="182" y="278" width="164" height="122" rx="12" fill="#F2E9E1"/>
        <rect x="364" y="278" width="164" height="122" rx="12" fill="#FFE0CC"/>
        <rect x="546" y="278" width="132" height="122" rx="12" fill="#F2E9E1"/>
        <rect x="182" y="418" width="96" height="8" rx="4" fill="#241713" fill-opacity=".14"/>
        <rect x="364" y="418" width="120" height="8" rx="4" fill="#241713" fill-opacity=".14"/>
        <rect x="546" y="418" width="82" height="8" rx="4" fill="#241713" fill-opacity=".14"/>

        <!-- said out loud, in ink -->
        <ellipse cx="446" cy="340" rx="118" ry="86" fill="none" stroke="#FF630B" stroke-width="5"
                 stroke-linecap="round" stroke-dasharray="330 60" transform="rotate(-6 446 340)"/>
        <path d="M182 190h150" stroke="#FF630B" stroke-width="5" stroke-linecap="round"/>
        <path d="M600 208c34 10 52 30 54 58" stroke="#FF630B" stroke-width="4" fill="none"
              stroke-linecap="round" stroke-dasharray="1 12"/>
        <rect x="556" y="164" width="164" height="46" rx="14" fill="#241713"/>
        <rect x="576" y="180" width="80" height="7" rx="3.5" fill="#FFFFFF" fill-opacity=".62"/>
        <rect x="576" y="193" width="52" height="6" rx="3" fill="#FFFFFF" fill-opacity=".28"/>
        <path d="M470 424l9 32 8-13 14 9z" fill="#241713" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>
      </svg>`;
    }
  };
  RPS.art = A;

  /* =================================================================== theme
     Light or dark. The stored choice wins; with none, the OS decides and keeps
     deciding. A tiny inline script in every <head> sets the attribute before
     first paint so there is no flash — this only keeps it in sync afterwards. */
  const THEME_KEY = 'rps.theme';
  const THEME_META = { light: '#FCFBFA', dark: '#13100E' };

  const systemTheme = () =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  function storedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || systemTheme();
  }

  /* The toggle is re-rendered with the rest of the nav, so its label is synced
     from here *and* from renderNavRight — whichever happens last wins. */
  function syncToggles(t) {
    document.querySelectorAll('[data-theme-toggle]').forEach((b) => {
      b.setAttribute('aria-pressed', String(t === 'dark'));
      b.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_META[t]);
    syncToggles(t);
    // A two-file logo swaps with the theme; a one-file logo just stays put.
    const c = S().config;
    if (c.logoUrl && c.logoDarkUrl) {
      const src = t === 'dark' ? c.logoDarkUrl : c.logoUrl;
      document.querySelectorAll('.logo-img').forEach((img) => { img.src = src; });
    }
  }

  function setTheme(t) {
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    applyTheme(t);
    RPS.track('theme_changed', { theme: t });
  }

  /* The site is dark only. The light palette is still in app.css and the
     helpers below still work, so re-enabling it is a matter of restoring the
     stored/system lookup here and returning the button again. */
  function initTheme() {
    applyTheme('dark');
  }

  function themeToggleHTML() {
    return '';
  }

  /* ================================================================== chrome */

  /* Where "Grab a seat" should go: the next open session, with the enrol flow
     already firing. Nothing upcoming → the listing, which owns the empty state. */
  function seatUrl() {
    const next = S().upcoming()[0];
    return next
      ? 'workshop.html?w=' + encodeURIComponent(next.slug) + '&action=enroll'
      : 'workshops.html';
  }
  RPS.seatUrl = seatUrl;

  /* The wordmark is the fallback. Point config.logoUrl at a file in
     assets/img/brand/ and it takes over everywhere, nav and footer. */
  function logoHTML() {
    const c = S().config;
    const src = currentTheme() === 'dark' && c.logoDarkUrl ? c.logoDarkUrl : c.logoUrl;
    if (!src) return `<a class="logo" href="index.html">RPS <span>Cohorts</span></a>`;
    const img = `<img class="logo-img" src="${esc(src)}" alt="${esc(c.siteName)}">`;
    // Some marks (white line-art, no fill) only read against a dark chip —
    // config.logoOnDark wraps it in one so it survives both themes.
    const inner = c.logoOnDark ? `<span class="logo-badge">${img}</span>` : img;
    return `<a class="logo" href="index.html">${inner}</a>`;
  }

  function navHTML(active) {
    const me = S().session();
    return `
    <a class="skip" href="#main">Skip to content</a>
    <nav class="nav">
      <div class="wrap nav-in">
        ${logoHTML()}
        <div class="nav-links" id="navlinks">
          <a href="index.html"${active === 'home' ? ' aria-current="page"' : ''}>Home</a>
          <a href="workshops.html"${active === 'workshops' ? ' aria-current="page"' : ''}>Workshops</a>
          ${me || /login\.html/.test(location.pathname) ? '' :
            `<a href="login.html?intent=generic&next=${encodeURIComponent(location.href)}">Log in</a>`}
        </div>
        <div class="nav-right" data-nav-right></div>
        <button class="nav-toggle" aria-expanded="false" aria-controls="navlinks" aria-label="Menu">
          <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
            <path d="M0 1h20M0 7h20M0 13h20" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </nav>`;
  }

  function navRightHTML() {
    const me = S().session();
    const cta = `<a class="btn sm go" href="${seatUrl()}">Grab a seat</a>`;
    if (!me) return themeToggleHTML() + cta;
    return `
    ${themeToggleHTML()}
    ${cta}
    <div class="menu-wrap">
      <button class="avatar" data-menu-btn aria-haspopup="true" aria-expanded="false"
              aria-label="Account menu for ${esc(me.name)}">${esc(S().initials(me))}</button>
      <div class="dropdown" data-menu role="menu" data-open="false">
        <div class="hd"><b>${esc(me.name)}</b><small>${esc(me.email)}</small></div>
        <a href="account.html" role="menuitem">My workshops</a>
        <button type="button" data-signout role="menuitem">Sign out</button>
      </div>
    </div>`;
  }

  function footerHTML() {
    const c = S().config;
    return `
    <footer class="site">
      <div class="wrap in">
        <div class="cols">
          <div>
            ${logoHTML()}
            <p class="tagline">Free, and staying free.</p>
            <p class="micro" style="max-width:32ch;margin-top:14px">${esc(c.footerTagline)}</p>
          </div>
          <div>
            <h4>Workshops</h4>
            <div class="links">
              <a href="index.html">Home</a>
              <a href="workshops.html">All workshops</a>
              <a href="workshops.html#upcoming">Upcoming</a>
              <a href="workshops.html#past">Past &amp; recordings</a>
            </div>
          </div>
          <div>
            <h4>Account</h4>
            <div class="links">
              ${S().session() ? '' : '<a href="login.html?intent=generic">Log in</a>'}
              <a href="account.html">My workshops</a>
              <a href="${esc(c.whatsappUrl)}" data-wa target="_blank" rel="noopener">WhatsApp group</a>
            </div>
          </div>
          <div>
            <h4>RPS</h4>
            <div class="links">
              <a href="${esc(c.aboutRpsUrl)}">About RPS</a>
              <a href="${esc(c.sayHiUrl)}">Say hi</a>
              <a href="internal.html">Internal</a>
            </div>
          </div>
          <div>
            <h4>Legal</h4>
            <div class="links">
              <a href="terms.html">Terms &amp; conditions</a>
              <a href="privacy.html">Privacy policy</a>
              <a href="privacy.html#cookies">Cookie policy</a>
            </div>
          </div>
        </div>
        <div class="base">
          <span>© 2026 RPS Cohorts. All rights reserved.</span>
          <a href="#main">Back to top ↑</a>
        </div>
      </div>
    </footer>`;
  }

  function mountChrome(active) {
    const navSlot = document.querySelector('[data-nav]');
    if (navSlot) navSlot.innerHTML = navHTML(active);
    const footSlot = document.querySelector('[data-footer]');
    if (footSlot) footSlot.innerHTML = footerHTML();
    renderNavRight();

    // mobile menu
    document.addEventListener('click', (e) => {
      const t = e.target.closest('.nav-toggle');
      if (t) {
        const links = document.getElementById('navlinks');
        const open = links.classList.toggle('open');
        t.setAttribute('aria-expanded', String(open));
      }
      const wa = e.target.closest('[data-wa]');
      if (wa) RPS.track('whatsapp_cta_clicked', { from: location.pathname });

      const th = e.target.closest('[data-theme-toggle]');
      if (th) setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });

    // Past this point the bar collapses into the centred pill. Well clear of 0
    // so a nudge of the wheel doesn't flip it back and forth.
    const bar = document.querySelector('.nav');
    if (bar) {
      const sync = () => bar.classList.toggle('stuck', window.scrollY > 90);
      sync();
      window.addEventListener('scroll', sync, { passive: true });
    }
  }

  function renderNavRight() {
    const slot = document.querySelector('[data-nav-right]');
    if (!slot) return;
    slot.innerHTML = navRightHTML();
    syncToggles(currentTheme());

    const btn = slot.querySelector('[data-menu-btn]');
    if (btn) {
      const menu = slot.querySelector('[data-menu]');
      const setOpen = (v) => {
        menu.dataset.open = String(v);
        btn.setAttribute('aria-expanded', String(v));
      };
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setOpen(menu.dataset.open !== 'true');
      });
      document.addEventListener('click', () => setOpen(false));
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setOpen(false);
      });
      menu.addEventListener('click', (e) => e.stopPropagation());
      menu.querySelector('[data-signout]').addEventListener('click', () => {
        S().signOut();
        renderNavRight();
        toast('Signed out.');
        if (/account\.html/.test(location.pathname)) {
          location.href = 'login.html?intent=generic&next=' + encodeURIComponent('account.html');
        } else {
          document.dispatchEvent(new CustomEvent('rps:auth'));
        }
      });
    }

  }

  /* ================================================================== login
     Login is its own page, not a modal. Gated actions leave the page, carrying
     their intent and a return URL, and come back to finish the job. */

  const PROVIDER_SVG = {
    google: `<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C36.9 40.2 44 35 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>`
  };
  RPS.providerSvg = PROVIDER_SVG;

  const INTENT_COPY = {
    enroll: 'Saving your seat. Two taps, you’re back here.',
    recording: 'It’s free — we just like knowing who’s watching.',
    files: 'It’s free — we just like knowing who’s watching.',
    generic: 'For seats, recordings, and files.'
  };
  RPS.intentCopy = INTENT_COPY;

  /* Send someone to log in, remembering what they were doing. */
  function goToLogin(intentKey, nextUrl) {
    const next = nextUrl || location.href;
    RPS.intent.set({ intent: intentKey || 'generic', url: next, at: Date.now() });
    RPS.track('login_required', { intent: intentKey || 'generic' });
    location.href =
      'login.html?intent=' + encodeURIComponent(intentKey || 'generic') +
      '&next=' + encodeURIComponent(next);
  }

  /* requireAuth — run the action if they're logged in, otherwise send them to
     the login page with enough context to resume (PRD §11.1–11.2).
     `nextUrl` lets a caller come back to a more specific place than it left. */
  function requireAuth(intentKey, action, nextUrl) {
    if (S().session()) {
      action();
      return;
    }
    goToLogin(intentKey, nextUrl);
  }

  /* ================================================================ toasts */
  function toast(msg, kind) {
    let host = document.getElementById('toasts');
    if (!host) {
      host = el('<div id="toasts" aria-live="polite"></div>');
      document.body.appendChild(host);
    }
    const t = el(`<div class="toast ${kind || ''}">${esc(msg)}</div>`);
    host.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(6px)';
      setTimeout(() => t.remove(), 300);
    }, 3400);
  }

  /* ============================================================ FAQ + reveal */
  function wireFaq(root) {
    (root || document).addEventListener('click', (e) => {
      const q = e.target.closest('.faq-q');
      if (!q) return;
      const item = q.closest('.faq-item');
      const open = item.classList.toggle('open');
      q.setAttribute('aria-expanded', String(open));
      if (open) RPS.track('faq_item_opened', { q: q.textContent.trim() });
    });
  }

  function reveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach((i) => i.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );
    items.forEach((i) => io.observe(i));
  }

  /* ========================================================== demo controls */
  function demoPanel() {
    if (document.getElementById('demo')) return;
    const wrap = el(`
      <div id="demo">
        <div class="dpanel">
          <h5>Prototype controls</h5>
          <p class="micro" style="margin:2px 0 0">Not part of the product. Jump to any state.</p>

          <div class="grp"><b>Session</b>
            <button class="mini" data-d="google">Sign in as Jane (Google)</button>
            <button class="mini" data-d="email">Sign in by email (skip the code)</button>
            <button class="mini" data-d="signout">Sign out</button>
            <button class="mini" data-d="failnext">Make the next Google login fail</button>
          </div>

          <div class="grp"><b>Edge states</b>
            <button class="mini" data-d="empty">Toggle: no upcoming workshops</button>
            <button class="mini" data-d="norec">Toggle: recording not up yet</button>
            <button class="mini" data-d="steal">Fill the last seat (Portfolio teardown)</button>
            <button class="mini" data-d="reset">Reset everything</button>
          </div>

          <div class="grp"><b>Analytics events</b>
            <div class="log" data-log></div>
          </div>
        </div>
        <button class="dbtn" data-toggle>● Prototype controls</button>
      </div>`);
    document.body.appendChild(wrap);

    const logEl = wrap.querySelector('[data-log]');
    const paint = () => {
      const ev = RPS.events().slice(-12).reverse();
      logEl.innerHTML = ev.length
        ? ev.map((e) => `<div>${esc(e.event)}</div>`).join('')
        : '<div>nothing yet</div>';
    };
    paint();
    document.addEventListener('rps:track', paint);

    wrap.querySelector('[data-toggle]').addEventListener('click', () => wrap.classList.toggle('open'));

    wrap.addEventListener('click', (e) => {
      const b = e.target.closest('[data-d]');
      if (!b) return;
      const st = S();
      const act = b.dataset.d;
      if (act === 'google') {
        st.signIn('google');
        toast('Signed in as ' + st.session().name, 'good');
        location.reload();
      } else if (act === 'email') {
        st.startSession({
          name: 'Rohit Iyer', email: 'rohit@email.com', phone: null, authProvider: 'EMAIL'
        });
        toast('Signed in as rohit@email.com', 'good');
        location.reload();
      } else if (act === 'signout') {
        st.signOut();
        location.reload();
      } else if (act === 'failnext') {
        st.flags.failNextLogin = true;
        st.saveFlags();
        toast('Next login attempt will fail.', 'warn');
      } else if (act === 'empty') {
        st.flags.emptyUpcoming = !st.flags.emptyUpcoming;
        st.saveFlags();
        location.reload();
      } else if (act === 'norec') {
        st.flags.recordingNotReady = !st.flags.recordingNotReady;
        st.saveFlags();
        location.reload();
      } else if (act === 'steal') {
        const w = st.bySlug('portfolio-teardown-live');
        if (w) {
          w.seededEnrollments = w.capacity;
          st.save();
          toast('Last seat gone. That workshop is now waitlist-only.', 'warn');
          location.reload();
        }
      } else if (act === 'reset') {
        st.reset();
        location.href = 'index.html';
      }
    });
  }

  /* A workshop's capacity drawn as a filling track plus its label, so "12 of 45
     seats left" is something you can see at a glance rather than read. The bar
     shows seats TAKEN, so it fills as the session sells out. */
  function seatMeter(w) {
    const st = S();
    if (!w || !w.capacity) return `<span class="seat">Open to everyone</span>`;
    const taken = st.enrolledCount(w);
    const left = st.seatsLeft(w);
    const pct = Math.max(0, Math.min(100, Math.round((taken / w.capacity) * 100)));
    const full = left === 0;
    return `
      <div class="seatmeter${full ? ' is-full' : ''}">
        <div class="track" role="img" aria-label="${esc(st.seatLabel(w))}"><i style="width:${pct}%"></i></div>
        <span class="label">${esc(st.seatLabel(w))}</span>
      </div>`;
  }

  /* ------------------------------------------------------- cookie notice
     Shown once, then remembered. It sits at the bottom and does NOT block the
     page: nothing here sets a tracking cookie before consent, so trapping the
     visitor behind a modal would be theatre. Dismissing and accepting are the
     same action, which is why there is one button and a link to the policy. */
  const COOKIE_KEY = 'rps.cookies';

  function cookieNotice() {
    let seen = null;
    try { seen = localStorage.getItem(COOKIE_KEY); } catch (e) { return; }
    if (seen === 'accepted') return;
    if (document.getElementById('cookiebar')) return;

    const bar = el(`
      <div id="cookiebar" role="region" aria-label="Cookie notice">
        <p>
          We keep a little of this site in your browser — your session, your seats,
          and the recordings you've unlocked. Nothing is sold and nothing follows
          you elsewhere. <a href="privacy.html#cookies">Cookie policy</a>
        </p>
        <button class="btn" type="button" data-cookie-ok>Accept</button>
      </div>`);
    document.body.appendChild(bar);
    bar.querySelector('[data-cookie-ok]').addEventListener('click', () => {
      try { localStorage.setItem(COOKIE_KEY, 'accepted'); } catch (e) {}
      bar.classList.add('is-out');
      setTimeout(() => bar.remove(), 300);
      RPS.track('cookies_accepted', {});
    });
    requestAnimationFrame(() => bar.classList.add('is-in'));
  }

  /* ================================================================== boot */
  /* Fill every [data-art="kind"] frame with its placeholder illustration.
     Replace with <img> when RPS supplies photography (PRD §16). */
  /* The frame carries the artwork's own ground colour, so the edges match
     whatever the banner crops to. */
  const ART_BG = {
    studio: '#F6F3F0', team: '#FFE0CC',
    handoff: '#FFEDE0', proto: '#0D1117', portfolio: '#FFF0E4', landing: '#180D07'
  };

  /* A frame renders a real photo when one exists — data-src on the element,
     or config.images[kind] in seed.js — and falls back to the illustration.
     Supplying a photo also drops the "placeholder" badge. */
  function mountArt(root) {
    const c = S().config;
    (root || document).querySelectorAll('[data-art]').forEach((f) => {
      if (f.dataset.artDone) return;
      const kind = f.dataset.art;
      const src = f.dataset.src || (c.images && c.images[kind]) || null;

      if (src) {
        const alt = f.dataset.alt || (c.imageAlt && c.imageAlt[kind]) || '';
        f.insertAdjacentHTML('afterbegin',
          `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">`);
        const note = f.querySelector('.frame-note');
        if (note) note.remove();
        f.style.background = 'transparent';
        // A supplied banner is a composed 16:9 artwork carrying its own title,
        // so the frame holds that ratio instead of cropping to a fixed height.
        // The vector fallbacks keep their designed heights.
        f.classList.add('has-photo');
      } else {
        const svg = A[kind] ? A[kind]() : A.banner(kind);
        f.insertAdjacentHTML('afterbegin', svg);
        // The frame carries the artwork's own background so any letterboxing
        // reads as full-bleed rather than as a gap.
        if (ART_BG[kind]) f.style.background = ART_BG[kind];
      }
      f.dataset.artDone = '1';
    });
  }

  /* Point every WhatsApp CTA at WHATSAPP_GROUP_URL */
  function mountWhatsapp(root) {
    (root || document)
      .querySelectorAll('[data-whatsapp]')
      .forEach((a) => (a.href = S().config.whatsappUrl));
  }

  /* ============================================================ WA chat mock
     A small looping "video" of the group chat for the WhatsApp CTA panel —
     built from CSS + timed DOM updates rather than an actual video file, so it
     stays crisp at any size, costs nothing to load, and follows the site's
     light/dark theme automatically (colors are `var(--token)` strings, which
     resolve live against whichever theme is active).

     Scripted, not sourced from the store: this is decoration standing in for
     a real group chat, the same way the illustrations stand in for
     photography — not a claim about member count or activity. */
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
      return;
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
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
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
  }

  function mountWaMock(root) {
    (root || document).querySelectorAll('[data-wa-mock]').forEach((el) => {
      if (el.dataset.waMockDone) return;
      el.dataset.waMockDone = '1';
      initWaMock(el);
    });
  }

  /* ========================================================== Hero Meet mock
     A laptop mockup of a live cohort call — the hero's proof-of-life visual.
     Built the same way as the WhatsApp mock (CSS + timed DOM updates instead
     of a video file), but everything inside the "screen" keeps fixed colors
     rather than following the site theme: it's standing in for a screenshot,
     and a screenshot doesn't re-theme itself.

     The stage is authored at a fixed 1280×720 and scaled down with a CSS
     transform to fit its box, recomputed on resize — the standard trick for
     crisp fixed-layout UI mockups shown responsively. */
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
                <img src="assets/img/brand/academy-logo-full.png" alt="RPS Cohorts">
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
      return;
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
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
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
  }

  function mountMeetMock(root) {
    (root || document).querySelectorAll('[data-meet-mock]').forEach((el) => {
      if (el.dataset.meetMockDone) return;
      el.dataset.meetMockDone = '1';
      initMeetMock(el);
    });
  }


  RPS.ui = {
    mountChrome, renderNavRight, goToLogin, requireAuth,
    toast, wireFaq, reveal, demoPanel, mountArt, mountWhatsapp, mountWaMock, mountMeetMock, el,
    avatar: (i) => A.avatar(i), qpattern: (i) => A.qpattern(i), seatMeter,
    setTheme, currentTheme
  };

  RPS.boot = function (active) {
    initTheme();
    mountChrome(active);
    mountArt(document);
    mountWhatsapp(document);
    wireFaq(document);
    cookieNotice();
    /* The prototype controls panel is off. demoPanel() is still exported on
       RPS.ui, so a call here (or from the console) brings it back if a state
       needs walking again. */
    document.addEventListener('DOMContentLoaded', reveal);
    if (document.readyState !== 'loading') reveal();
  };
})();
