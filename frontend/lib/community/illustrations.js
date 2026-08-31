/* =============================================================================
   Homepage illustrations — extracted verbatim from the community website's
   index.html. Hand-drawn inline SVG: the line work takes the tile's ink colour
   via `currentColor` and the accent marks use the brand orange, so both flip
   with the theme. Kept as markup strings rather than transcribed into JSX so
   the drawings can't drift from the originals.
   ============================================================================= */

/* Six things stop new designers, and none of them are about talent. */
export const GAP_TILES = [
  {
    tint: "a",
    title: "A portfolio of briefs you set yourself",
    svg: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3.4"
                 stroke-linecap="round" stroke-linejoin="round" role="img"
                 aria-label="A portfolio page of work you set yourself, with your own pencil beside it">
              <path d="M16 20c25-3 51-3 76 0 3 22 3 45 0 67-25 3-51 3-76 0-3-22-3-45 0-67z"/>
              <path d="M28 32c17-2 35-2 52 0 1 8 1 16 0 24-17 2-35 2-52 0-1-8-1-16 0-24z"/>
              <path d="M28 66c8-1 15-1 23 0 1 5 1 10 0 15-8 1-15 1-23 0-1-5-1-10 0-15z"/>
              <path class="g-draw" d="M57 66c8-1 15-1 23 0 1 5 1 10 0 15-8 1-15 1-23 0-1-5-1-10 0-15z"/>
              <path class="g-pencil" d="M70 104l3-11 24-24 8 8-24 24z" stroke="var(--brand)"/>
              <path class="g-pencil" d="M94 77l8 8" stroke="var(--brand)"/>
            </svg>`,
  },
  {
    tint: "b",
    title: "Entry-level roles that want three years",
    svg: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3.4"
                 stroke-linecap="round" stroke-linejoin="round" role="img"
                 aria-label="A junior job listing with its door shut">
              <path d="M27 20c16-2 33-2 49 0 3 24 3 49 0 74-16 2-33 2-49 0-3-25-3-49 0-74z"/>
              <path d="M39 38h25"/>
              <path d="M39 50h25"/>
              <path d="M39 62h14"/>
              <circle class="g-ban" cx="80" cy="79" r="18" stroke="var(--brand)"/>
              <path class="g-ban" d="M67 92 93 66" stroke="var(--brand)"/>
            </svg>`,
  },
  {
    tint: "c",
    title: "Tutorials stop before the hard part",
    svg: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3.4"
                 stroke-linecap="round" stroke-linejoin="round" role="img"
                 aria-label="A tutorial that plays, then stops before the hard part">
              <path d="M19 27c27-3 55-3 82 0 3 17 3 34 0 51-27 3-55 3-82 0-3-17-3-34 0-51z"/>
              <path class="g-play" d="M51 42l19 11-19 11z"/>
              <path class="g-progress" d="M23 92h35" stroke-width="5.5"/>
              <path d="M68 92h5M82 92h5M96 92h4" stroke="var(--brand)" stroke-width="5.5"/>
            </svg>`,
  },
  {
    tint: "c",
    title: "\u201cLooks nice\u201d is not feedback",
    svg: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3.4"
                 stroke-linecap="round" stroke-linejoin="round" role="img"
                 aria-label="A cheerful comment and an empty one beside it">
              <path d="M17 25c22-3 44-3 65 0 3 13 3 27 0 39-11 2-22 2-33 2l-15 13 1-13c-7-1-13-1-18-2-3-12-3-26 0-39z"/>
              <circle cx="42" cy="45" r="2.6" fill="currentColor" stroke="none"/>
              <circle cx="60" cy="45" r="2.6" fill="currentColor" stroke="none"/>
              <path d="M40 56c6 6 15 6 22 0"/>
              <path class="g-march" d="M70 71c11-2 22-2 32 0 2 8 2 16 0 23-6 1-11 1-17 1l-9 8 1-8c-3 0-5-1-7-1-2-7-2-16 0-23z"
                    stroke="var(--brand)" stroke-dasharray="7 8"/>
            </svg>`,
  },
  {
    tint: "a",
    title: "AI advice with nothing behind it",
    svg: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3.4"
                 stroke-linecap="round" stroke-linejoin="round" role="img"
                 aria-label="A lot of AI sparkle over an empty frame">
              <path class="g-march" d="M23 52c25-3 51-3 76 0 3 15 3 31 0 46-25 3-51 3-76 0-3-15-3-31 0-46z"
                    stroke-dasharray="8 9"/>
              <path class="g-spark" d="M52 11c3 13 6 16 19 19-13 3-16 6-19 19-3-13-6-16-19-19 13-3 16-6 19-19z"
                    stroke="var(--brand)"/>
              <path class="g-spark2" d="M89 30c1.7 7 3.2 8.4 10 10-6.8 1.6-8.3 3-10 10-1.7-7-3.2-8.4-10-10 6.8-1.6 8.3-3 10-10z"
                    stroke="var(--brand)"/>
            </svg>`,
  },
  {
    tint: "b",
    title: "You\u2019ve never designed with anyone",
    svg: `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3.4"
                 stroke-linecap="round" stroke-linejoin="round" role="img"
                 aria-label="Two people in front of one screen">
              <path d="M31 17c19-2 39-2 58 0 3 14 3 28 0 42-19 2-39 2-58 0-3-14-3-28 0-42z"/>
              <path d="M45 33h28"/>
              <path d="M45 45h17"/>
              <circle cx="38" cy="77" r="9.5"/>
              <path d="M22 103c2-10 8-15 16-15s14 5 16 15"/>
              <circle class="g-join" cx="82" cy="77" r="9.5" stroke="var(--brand)"/>
              <path class="g-join" d="M66 103c2-10 8-15 16-15s14 5 16 15" stroke="var(--brand)"/>
            </svg>`,
  },
];

/* The About us bento: the day job, every few weeks, in the room. */
export const BENTO_ART = [
  `<svg viewBox="0 0 200 120" preserveAspectRatio="xMinYMid meet" fill="none"
                 stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"
                 role="img" aria-label="A Fortune 500 tower, and a startup taking off beside it">
              <!-- the Fortune 500 half: a tower, lit floor by floor -->
              <path d="M20 106V28c13-2 27-2 40 0v78"/>
              <path d="M6 106h188"/>
              <path class="b-floor" d="M28 42h7M45 42h7M28 58h7M45 58h7M28 74h7M45 74h7"/>
              <path d="M33 106V93h14v13"/>
              <!-- the startup half: a rocket, nose to flame -->
              <g class="b-rocket" stroke="var(--brand)">
                <path d="M123 26c12 13 18 31 18 47 0 10-2 17-5 22h-26c-3-5-5-12-5-22 0-16 6-34 18-47z"/>
                <circle cx="123" cy="56" r="7.5"/>
                <path d="M105 72l-14 17 6 14 11-11"/>
                <path d="M141 72l14 17-6 14-11-11"/>
              </g>
              <path class="b-flame" d="M116 95c2 9 4 14 7 17 3-3 5-8 7-17" stroke="var(--brand)"/>
            </svg>`,
  `<svg viewBox="0 0 220 120" preserveAspectRatio="xMidYMid meet" fill="none"
                 stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"
                 role="img" aria-label="A date that comes round again, going out live">
              <!-- a calendar, and one day on it circled -->
              <path d="M26 22c30-3 60-3 90 0 3 25 3 50 0 74-30 3-60 3-90 0-3-24-3-49 0-74z"/>
              <path d="M26 44h90"/>
              <path d="M48 10v20M94 10v20"/>
              <circle cx="48" cy="60" r="3.2" fill="currentColor" stroke="none"/>
              <circle cx="71" cy="60" r="3.2" fill="currentColor" stroke="none"/>
              <circle cx="94" cy="60" r="3.2" fill="currentColor" stroke="none"/>
              <circle cx="48" cy="80" r="3.2" fill="currentColor" stroke="none"/>
              <circle class="b-day" cx="71" cy="80" r="9" stroke="var(--brand)"/>
              <circle cx="94" cy="80" r="3.2" fill="currentColor" stroke="none"/>
              <!-- and it comes round again -->
              <g class="b-repeat">
                <path d="M197 56a33 33 0 1 1-12-28" stroke="var(--brand)"/>
                <path d="M186 12v17h-17" stroke="var(--brand)"/>
              </g>
              <!-- live, while it does -->
              <circle class="b-rec" cx="164" cy="56" r="4.5" fill="var(--brand)" stroke="none"/>
              <path class="b-wave" d="M152 46a17 17 0 0 0 0 20M176 46a17 17 0 0 1 0 20"/>
            </svg>`,
  `<svg viewBox="0 0 220 120" preserveAspectRatio="xMidYMid meet" fill="none"
                 stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"
                 role="img" aria-label="A whiteboard being worked on live, with a marker in hand">
              <!-- the board, on its legs -->
              <path d="M20 16c50-3 100-3 150 0 3 21 3 42 0 63-50 3-100 3-150 0-3-21-3-42 0-63z"/>
              <path d="M56 79 44 110M134 79l12 31"/>
              <!-- what's actually on it: rough, and being changed -->
              <path class="b-scribble" d="M36 31c11-9 19 7 30 0s13-13 24-6"/>
              <path class="b-box" d="M36 45c13-1 26-1 39 0 1 6 1 13 0 19-13 1-26 1-39 0-1-6-1-13 0-19z"/>
              <path class="b-cross" d="M96 43l24 24M120 43l-24 24" stroke="var(--brand)"/>
              <path class="b-note" d="M132 37c9-1 18-1 27 0 1 7 1 14 0 21-9 1-18 1-27 0-1-7-1-14 0-21z" stroke="var(--brand)"/>
            </svg>`,
];
