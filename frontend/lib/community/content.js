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
  // Where every recording lives. The workshop page links here to subscribe.
  youtubeChannelUrl: 'https://www.youtube.com/@rockpaperscissors.studio',
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
    photoUrl: '/assets/vineet-avatar.png',
  },
  {
    id: 'host_2',
    name: 'Vivin Richard',
    title: 'Principal Designer and Manager, RPS',
    bio: 'Has mentored 10,000+ designers and builds AI-native design workflows for enterprise fintech at RPS. Thinks designers who learn to direct AI will outrun the ones who fear it.',
    photoUrl: '/assets/vivin-avatar.png',
  },
];

export const WORKSHOPS = [
  /* ---------------- Upcoming ---------------- */
  {
    id: 'w_ai_product',
    slug: 'design-products-with-ai',
    title: 'Designing product journeys with AI. Not just websites.',
    summary:
      'Build a real product design system, user flows and production-ready screens — all with AI understanding. See how design consistency happens at scale, from journeys to code.',
    /* Several paragraphs, not one: the section opens on the gap, names the
       problem, then lays out the pipeline. Rendered through paragraphs() in
       lib/community/workshops.js. */
    description: [
      'Building a website with AI is easy. Building a consistent product flow with AI is not. This session is about the gap between design intent and what actually ships — a complete pipeline where AI understands a design system and generates consistent, production-ready screens, turning weeks in design tools into minutes without losing design system integrity or the real-world edge cases.',
      'The problem: design output today looks generic. Design systems are documented, but never truly understood by the tools we use. Designers spend weeks in Figma on screens, components, variants and states — and even with the best system, scaling that work is slow, inconsistent and error-prone.',
      'The solution: an AI-native design pipeline. Instead of describing a design system through documentation, you feed the AI the actual artifacts: user journey maps, screenshots, user flows, the real UX patterns already in your product, and your design system’s constraints and tokens.',
      'What happens next: the AI understands your design language at a semantic level. It generates screens that carry your design system automatically. You get production-ready output in minutes, not weeks.',
    ],
    /* Written after the session, for its page as a past workshop: a one-line
       headline and a short recap of what actually happened in the room (a
       string, or an array for several paragraphs). Leave them null and the
       page falls back to `description`, which was written before it ran. */
    recapHeadline: null,
    recap: [
      'Building a website with AI is easy. Building a consistent product flow with AI is not. This session closed that gap: a pipeline where AI understands a design system and generates consistent, production-ready screens.',
      'The solution: stop describing the system in documentation and feed the AI the real artifacts — journey maps, user flows, the UX patterns already in your product, its tokens and constraints. Output that carries your design system, in minutes, not weeks.',
    ],
    whoItsFor: [
      'You’re a student or fresher who’s never had a real design brief, system or user story — and you want to see how real products are actually built',
      'You’re a product designer wondering why AI design tools spit out generic UIs that don’t match your brand or system',
      'You have a design system AI keeps ignoring, because the tool doesn’t understand constraints the way a designer does',
      'You got generic output from an AI agent, closed the tab, and want to know what actually went wrong',
    ],
    curriculum: [
      'Why AI output looks generic — and how to name design defects, not vibes',
      'How to write user stories that machines can actually follow',
      'How to use your design system as a hard constraint, not just a suggestion',
      'The vocabulary to reject output — precise defect names, not “it doesn’t feel right”',
      'The AI-to-code pipeline: from Figma to design tokens, to AI generation, to HTML handoff',
      'A PDF guide and prompt library to run the method on your own brief',
    ],
    bannerUrl: '/assets/workshops/design-products-with-ai.png',
    bannerArt: 'proto',
    dateTime: '2026-09-19T15:00:00+05:30',
    durationMins: 120,
    capacity: 45,
    seededEnrollments: 33,
    meetLink: 'https://meet.google.com/dfb-caiq-ciq',
    /* Dial-in for anyone whose connection gives out mid-session. Google issues
       these per room, so they change whenever meetLink does — replace both
       together or the number rings into a meeting nobody is in. */
    meetPhone: { number: '+1 470-268-2152', pin: '411 984 325#', country: 'US' },
    meetPhoneUrl: 'https://tel.meet/dfb-caiq-ciq?pin=9417822559100',
    /* The full session on YouTube. It plays at the top of the workshop page
       (YouTube, Vimeo, Drive or an .mp4 all work — see recordingEmbed()). */
    recordingUrl: 'https://youtu.be/WytaYAW3lPE',
    hostId: 'host_2',
    /* The watch-along notes, served from /public. As on Cohort 01, the row is
       always visible; the download is what login gates. */
    resources: [
      {
        id: 'notes',
        title: 'The workshop notes',
        // One line on what's inside, under the title in the kit.
        description: 'The three-layer design system and the live Figma-to-screen build',
        type: 'pdf',
        fileUrl: '/assets/resources/rps-cohort-02-workshop-notes.pdf',
        fileName: 'RPS-Cohort-02-Workshop-Notes.pdf',
        // Shown beside the download. Update both if the file is replaced.
        pages: 18,
        size: '3.7 MB',
      },
    ],
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
    /* Written after the session, for its page as a past workshop: a one-line
       headline and a short recap of what actually happened in the room (a
       string, or an array for several paragraphs). Leave them null and the
       page falls back to `description`, which was written before it ran. */
    recapHeadline: null,
    recap: null,
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
    /* The full session on YouTube. Leave recordingUrl null on a past workshop
       and the page says the recording is on its way; `false` says it wasn't
       recorded — see recordingState() in lib/community/workshops.js. */
    recordingUrl: 'https://youtu.be/yzfwgVn4_Xc',
    hostId: 'host_1',
    cohortLabel: 'Cohort 01',
    /* No `featured` flag: "the last one" on the homepage is simply the most
       recent past workshop. Set `featured: true` on one to pin it instead. */
    /* The real thing, not placeholders: the session summary PDF, served from
       /public. The row is always visible; the download is what login gates. */
    resources: [
      {
        id: 'r1',
        title: 'The workshop summary',
        // One line on what's inside, under the title in the kit.
        description: 'From a client brief to a page you would ship',
        type: 'pdf',
        fileUrl: '/assets/resources/rps-cohorts-workshop-summary.pdf',
        fileName: 'RPS-Cohorts-Workshop-Summary.pdf',
        // Shown beside the download. Update both if the file is replaced.
        pages: 44,
        size: '4.9 MB',
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
