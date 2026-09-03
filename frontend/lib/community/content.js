/* =============================================================================
   RPS Cohorts — site content
   Ported from the community website's assets/js/seed.js. This is presentation
   content only: the workshop copy, hosts, testimonials and FAQ that the public
   pages render. Nothing here touches auth or the database — the Supabase
   backend (profiles, submissions, sessions) is untouched and keeps driving
   every gated journey.
   ============================================================================= */

export const CONFIG = {
  siteName: 'RPS Cohorts',
  metaDescription:
    'Free live design workshops. We build real client work in front of you, you build along.',
  footerTagline:
    'By RPS, a design studio that works with Fortune 500 teams and can’t stop teaching.',
  whatsappUrl: 'https://chat.whatsapp.com/DTkop0ZD0FH8oAEpVsFTIP',
  aboutRpsUrl: 'https://rockpaperscissors.studio',
  sayHiUrl: 'mailto:cohorts@rockpaperscissors.studio',

  logoUrl: '/assets/brand/academy-logo-full.png',
  logoDarkUrl: null,
  logoOnDark: true,

  images: {
    team: '/assets/about/team.jpeg',
    studio: null,
  },
  imageAlt: {
    team: 'The whole RPS team, together after a cohort session',
    studio: 'The RPS studio mid-project',
  },
};

export const HOSTS = [
  {
    id: 'host_1',
    name: 'Vineet Chopdekar',
    title: 'Principal Designer, RPS',
    bio: '14+ years on fintech and enterprise SaaS products people actually trust. Leads design at RPS.',
    photoUrl: null,
  },
  {
    id: 'host_2',
    name: 'Vivin Richard',
    title: 'Principal Designer and Manager, RPS',
    bio: 'Has mentored 10,000+ designers and builds AI-native design workflows for enterprise fintech at RPS. Thinks designers who learn to direct AI will outrun the ones who fear it.',
    photoUrl: null,
  },
];

export const WORKSHOPS = [
  /* ---------------- Upcoming ---------------- */
  {
    id: 'w_ai_product',
    slug: 'design-products-with-ai',
    title: 'Design a product with AI. Without it looking like it.',
    summary: 'A real product screen set, built in 90 minutes — specs, states and judgment.',
    description:
      'Everyone’s output looks the same right now. That’s not a prompting problem. In 90 minutes we build a real product screen set — and fix the actual cause.',
    whoItsFor: [
      'Students and freshers who’ve never had a real brief, system or user story',
      'Product designers wondering why this takes four hours with AI and still looks wrong',
      'Designers with a design system AI keeps ignoring',
      'Anyone who opened an agent, got something generic, and closed the tab',
    ],
    curriculum: [
      'Why AI output looks generic, named precisely',
      'User stories with acceptance criteria a machine can actually follow',
      'The states everyone forgets: empty, loading, error, first-run, too-much-data',
      'Your design system wired in as a constraint, not a suggestion',
      'The vocabulary to reject output — name the defect, don’t describe the vibe',
      'A PDF guide and prompt library to run the method on your own brief',
    ],
    bannerUrl: '/assets/workshops/design-products-with-ai.png',
    bannerArt: 'proto',
    dateTime: '2026-09-12T15:00:00+05:30',
    durationMins: 90,
    capacity: 45,
    seededEnrollments: 33,
    meetLink: 'https://meet.google.com/#link-set-by-rps-before-the-session',
    recordingUrl: null,
    hostId: 'host_2',
    resources: [],
    cohortLabel: 'Cohort 02',
  },

  /* ---------------- Past ---------------- */
  {
    id: 'w_landing',
    slug: 'ship-client-ready-websites',
    title: 'Ship client-ready websites in hours, not months.',
    summary: 'One B2B SaaS landing page, built live and shipped to a real URL.',
    description:
      '90 minutes, one B2B SaaS landing page, live. netpulse-sol.com was built this way in 9 hours flat — not by prompting harder, but by following a method.',
    whoItsFor: [
      'Product designers who hand the landing page off and wait a sprint for it',
      'UI and visual designers who want a live responsive page with no dev in the loop',
      'Founders and solo builders who need a marketing site without a team or a month',
      'AI-curious designers who opened an agent, prompted a bit, and drifted',
    ],
    curriculum: [
      'The NetPulse build opened up hour by hour — where the 9 hours actually went',
      'The groundwork that happens before anything gets built',
      'The blueprint: structuring the page before a single prompt is written',
      'Coding agent, shadcn, 21st.dev — where each earns its keep and where it gets in the way',
      'Deployed on Vercel, so the session ended at a URL',
    ],
    bannerUrl: '/assets/workshops/ship-client-ready-websites.png',
    bannerArt: 'landing',
    dateTime: '2026-08-01T18:00:00+05:30',
    durationMins: 90,
    capacity: 45,
    seededEnrollments: 45,
    meetLink: null,
    /* No recording exists for this one, and none is coming — so every recording
       surface (player, "Watch it", the hero CTA, the chips) stays hidden. Set
       `recordingUrl` on a future workshop and they all come back; set
       `recordingComing: true` to show the "still editing" note in the meantime. */
    recordingUrl: null,
    hostId: 'host_1',
    cohortLabel: 'Cohort 01',
    featured: true,
    /* The real thing, not placeholders: the session summary PDF, served from
       /public. The row is always visible; the download is what login gates. */
    resources: [
      {
        id: 'r1',
        title: 'From a client brief to a page you would ship — the workshop summary',
        type: 'pdf',
        fileUrl: '/assets/resources/rps-cohorts-workshop-summary.pdf',
        fileName: 'RPS-Cohorts-Workshop-Summary.pdf',
      },
    ],
  },
];

export const TESTIMONIALS = [
  {
    id: 't1',
    workshopId: 'w_landing',
    name: 'Ritika',
    role: 'Cohort 01',
    quote: 'Claude’s design methods, broken down step by step. That’s what made it click.',
    featured: true,
  },
  {
    id: 't2',
    workshopId: 'w_landing',
    name: 'Anushka Bennur',
    role: 'Cohort 01',
    quote: 'Better prompting and better references. That’s what gets you a refined output.',
    featured: true,
  },
  {
    id: 't3',
    workshopId: 'w_landing',
    name: 'Dheena Dhayalan R',
    role: 'Student · Cohort 01',
    quote: 'I finally learned how to use prompts the right way.',
    featured: true,
  },
  {
    id: 't4',
    workshopId: 'w_landing',
    name: 'Abdul Baseer',
    role: 'Cohort 01',
    quote: 'Real examples. Not toy ones.',
    featured: true,
  },
  {
    id: 't5',
    workshopId: 'w_landing',
    name: 'Harshit',
    role: 'Student · Cohort 01',
    quote: 'Prompt writing for good UI. That’s the thing I took away.',
    featured: false,
  },
  {
    id: 't6',
    workshopId: 'w_landing',
    name: 'Hemalatha R',
    role: 'Self-employed · Cohort 01',
    quote: 'Applying 3D layers to our design was the part I didn’t expect.',
    featured: false,
  },
  {
    id: 't7',
    workshopId: 'w_landing',
    name: 'Saeeta Vishant Govekar',
    role: 'Student · Cohort 01',
    quote: 'Every part of it was worth it. Thank you for running this.',
    featured: false,
  },
];

/* `home: true` marks the six the homepage shows. */
export const FAQS = [
  { id: 'f1', order: 1, home: true, question: 'Who’s this for?', answer: 'Students, freshers, first-jobbers, and product designers whose AI output keeps coming out beige. Nothing here assumes a job, a client, or a system you already own.' },
  { id: 'f2', order: 2, home: true, question: 'Do I need to know how to code?', answer: 'No. If you can read a Figma file, you can follow this.' },
  { id: 'f3', order: 3, home: true, question: 'It’s actually free?', answer: 'Actually free. No paid tier, no pitch at the end. Not a funnel.' },
  { id: 'f4', order: 4, home: true, question: 'What happens in a session?', answer: '90 minutes on Google Meet. We design out loud, you build along in your own file, and you ask anything in the chat.' },
  { id: 'f5', order: 5, question: 'Do I need my own design system?', answer: 'No. Bring one if you have it, use ours if not.' },
  { id: 'f6', order: 6, home: true, question: 'Which AI tool?', answer: 'Whichever you already use. Claude, Cursor, Codex, Antigravity — the method holds. Hit your usage limit mid-session? Keep watching and finish on the recording.' },
  { id: 'f7', order: 7, question: 'Will this replace learning design?', answer: 'No. It removes the drawing, not the deciding. The deciding is design.' },
  { id: 'f8', order: 8, home: true, question: 'Do I get the recording?', answer: 'Yes, with all the files. Log in and it’s yours.' },
  { id: 'f9', order: 9, question: 'What if it’s full?', answer: 'Waitlist. 150 people wanted 45 seats last time, so — likely. Seats do open up.' },
  { id: 'f10', order: 10, question: 'When’s the next one?', answer: 'Every few weeks. The WhatsApp group finds out first.' },
];
