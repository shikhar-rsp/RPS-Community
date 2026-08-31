/* =============================================================================
   Placeholder art + workshop banners.
   Ported verbatim from the community website's assets/js/ui.js `A` object.
   Every one of these is a stand-in drawn as inline SVG so it takes the tile's
   ink colour. Where a real image exists (config.images / a workshop bannerUrl)
   the <Frame> component renders that instead and drops the placeholder badge.
   ============================================================================= */

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

export default A;
export const banner = (kind) => A.banner(kind);
export const avatar = (i) => A.avatar(i);
export const qpattern = (i) => A.qpattern(i);

/* The frame carries the artwork's own ground colour, so the edges match
   whatever the banner crops to. */
export const ART_BG = {
  studio: '#F6F3F0',
  team: '#FFE0CC',
  handoff: '#FFEDE0',
  proto: '#0D1117',
  portfolio: '#FFF0E4',
  landing: '#180D07',
};

export function artHTML(kind) {
  return A[kind] ? A[kind]() : A.banner(kind);
}
