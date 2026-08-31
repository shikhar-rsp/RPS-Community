/* =============================================================================
   RPS Cohorts — seed content
   Mirrors the Prisma models in PRD §9 (Host, Workshop, Resource, Testimonial, Faq).
   Every user-facing string here comes from RPS-Cohorts-Copy-Deck.md.
   Anything invented because the deck does not cover it is marked  needsCopy:true
   and listed in README.md under "Content still needed".
   ============================================================================= */

window.RPS_SEED = {
  version: 7,

  config: {
    siteName: 'RPS Cohorts',
    metaDescription:
      'Free live design workshops. We build real client work in front of you, you build along.',
    footerTagline:
      'By RPS, a design studio that works with Fortune 500 teams and can’t stop teaching.',
    // WHATSAPP_GROUP_URL in the real build (PRD §15)
    whatsappUrl: 'https://chat.whatsapp.com/#replace-with-real-invite',
    aboutRpsUrl: '#',
    sayHiUrl: 'mailto:hello@rps.design',

    /* ---- Brand + photography -------------------------------------------
       Drop the file into the directory named beside each key and set the
       path. Anything left null keeps the placeholder: the wordmark for the
       logo, the illustration for a photo. See assets/img/README.md. */

    // assets/img/brand/  — replaces the "RPS Cohorts" wordmark in nav + footer
    logoUrl: 'assets/img/brand/academy-logo-full.png',
    logoDarkUrl: null,  // one asset covers both themes — see logoOnDark below
    logoOnDark: true,   // this mark is white line-art with no fill: give it a dark chip so it reads on the light theme too

    images: {
      // assets/img/about/    — the About us section. Highest-value image on the site.
      team: 'assets/img/about/fb4310e4-412e-45d9-8f58-7edd7e54567f.jpeg',
      // assets/img/sessions/ — the WhatsApp panel. (The hero has its own
      // built-in Meet mock — see .meet-mock in ui.js — so there's no "meet"
      // photo slot to fill.)
      studio: null    // e.g. 'assets/img/sessions/studio.jpg'
    },
    imageAlt: {
      team: 'The whole RPS team, together after a cohort session',
      studio: 'The RPS studio mid-project'
    }
  },

  hosts: [
    {
      id: 'host_1',
      name: 'Vineet Chopdekar',
      title: 'Principal Designer, RPS',
      bio: '14+ years on fintech and enterprise SaaS products people actually trust. Leads design at RPS.',
      photoUrl: null,
      needsCopy: true // photo still pending
    },
    {
      id: 'host_2',
      name: 'Vivin Richard',
      title: 'Design technologist, RPS',
      bio: 'Builds AI-native design workflows for enterprise fintech at RPS. Thinks designers who learn to direct AI will outrun the ones who fear it.',
      photoUrl: null,
      // Both workshop files leave Vivin's title as {ROLE} and flag that it
      // appears two different ways on the old site. Pick one and set it here.
      needsCopy: true
    }
  ],

  workshops: [
    /* ---------------- Upcoming ---------------- */
    {
      // Workshop-Upcoming-Design-Products-With-AI.md
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
        'Anyone who opened an agent, got something generic, and closed the tab'
      ],
      curriculum: [
        'Why AI output looks generic, named precisely',
        'User stories with acceptance criteria a machine can actually follow',
        'The states everyone forgets: empty, loading, error, first-run, too-much-data',
        'Your design system wired in as a constraint, not a suggestion',
        'The vocabulary to reject output — name the defect, don’t describe the vibe',
        'A PDF guide and prompt library to run the method on your own brief'
      ],
      bannerUrl: 'assets/img/workshops/design-products-with-ai.png',
      bannerArt: 'proto', // the vector fallback if the file ever goes missing
      // The copy file leaves this as {DATE} · {TIME} IST — confirm before launch.
      dateTime: '2026-09-12T18:00:00+05:30',
      durationMins: 90,
      capacity: 45,
      seededEnrollments: 33, // people already in, before this browser's user
      meetLink: 'https://meet.google.com/#link-set-by-rps-before-the-session',
      recordingUrl: null,
      hostId: 'host_1',
      resources: [],
      cohortLabel: 'Cohort 02'
    },
    {
      id: 'w_ai_proto',
      slug: 'ai-prototyping-sprint',
      title: 'AI prototyping sprint',
      summary: 'One brief, two hours, a clickable thing at the end.',
      description:
        'One brief in the morning, a clickable prototype by the end of the session. We use AI where it pulls its weight and switch it off where it doesn’t.',
      whoItsFor: [
        'You keep hearing "just prototype it" and nobody says how',
        'You’ve tried the AI tools and got something that looks fine and does nothing',
        'You want to test an idea before you spend a week on it'
      ],
      curriculum: [
        'Turning a vague brief into something testable in an hour',
        'The prompt patterns that actually save time',
        'Where the AI output falls apart, and what to do then',
        'Putting it in front of a person before you fall in love with it'
      ],
      bannerUrl: 'assets/img/workshops/ai-prototyping-sprint.png',
      bannerArt: 'handoff', // the vector fallback if the file ever goes missing
      dateTime: '2026-09-26T18:00:00+05:30',
      capacity: 45,
      seededEnrollments: 45, // full — demonstrates the waitlist path
      meetLink: null,
      recordingUrl: null,
      hostId: 'host_2',
      resources: [],
      cohortLabel: 'Cohort 03',
      needsCopy: true // not covered by the copy deck — RPS to replace
    },
    {
      id: 'w_portfolio',
      slug: 'portfolio-teardown-live',
      title: 'Portfolio teardown, live',
      summary: 'We open real portfolios and say the quiet part out loud.',
      description:
        'Real portfolios on screen, real reactions. Not "looks nice". What a hiring designer actually thinks in the first eight seconds, said out loud.',
      whoItsFor: [
        'Your portfolio gets views and no replies',
        'You’ve rewritten the same case study four times',
        'You want the feedback nobody gives you politely'
      ],
      curriculum: [
        'The first eight seconds, and what wins them',
        'Case studies that show thinking, not screenshots',
        'What to cut when everything feels important',
        'A pass you can run on your own site tonight'
      ],
      bannerUrl: 'assets/img/workshops/portfolio-teardown-live.png',
      bannerArt: 'portfolio', // the vector fallback if the file ever goes missing
      dateTime: '2026-10-10T18:00:00+05:30',
      capacity: 45,
      seededEnrollments: 44, // 1 seat left — demonstrates the mid-login race
      meetLink: null,
      recordingUrl: null,
      hostId: 'host_1',
      resources: [],
      cohortLabel: 'Cohort 04',
      needsCopy: true
    },

    /* ---------------- Past ---------------- */
    {
      // Workshop-Past-Ship-Client-Ready-Websites.md
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
        'AI-curious designers who opened an agent, prompted a bit, and drifted'
      ],
      curriculum: [
        'The NetPulse build opened up hour by hour — where the 9 hours actually went',
        'The groundwork that happens before anything gets built',
        'The blueprint: structuring the page before a single prompt is written',
        'Coding agent, shadcn, 21st.dev — where each earns its keep and where it gets in the way',
        'Deployed on Vercel, so the session ended at a URL'
      ],
      bannerUrl: 'assets/img/workshops/ship-client-ready-websites.png',
      bannerArt: 'landing', // the vector fallback if the file ever goes missing
      dateTime: '2026-08-01T18:00:00+05:30',
      durationMins: 90,
      capacity: 45,
      seededEnrollments: 45,
      meetLink: null,
      // A real build embeds an unlisted YouTube / Loom here (PRD §13)
      recordingUrl: 'https://www.youtube-nocookie.com/embed/RPS-COHORT-01',
      recordingLength: '90 min',
      hostId: 'host_1',
      cohortLabel: 'Cohort 01',
      featured: true,
      resources: [
        { id: 'r1', title: 'The PDF guide — the full method, step by step', type: 'pdf', fileUrl: '#' },
        { id: 'r2', title: 'The prompt library', type: 'link', fileUrl: '#' },
        { id: 'r3', title: 'The B2B SaaS landing page brief', type: 'pdf', fileUrl: '#' },
        { id: 'r4', title: 'Links and tools we used', type: 'link', fileUrl: '#' }
      ]
    }
  ],

  /* Testimonials — real cohort 01 feedback, lightly tightened, from
     Homepage-Testimonials.md. Two things are still owed before this goes live:
       1. Written permission from each person to use their name.
       2. Their actual title — the feedback form only captured
          "Student / Working Professional", which is dead weight on a card.
     Both are tracked by needsCopy below. The `featured` four are tier 1
     (specific, strongest signal); the rest are tier 2, for the workshop page. */
  testimonials: [
    {
      id: 't1',
      workshopId: 'w_landing',
      name: 'Ritika',
      role: 'Cohort 01',
      quote: 'Claude’s design methods, broken down step by step. That’s what made it click.',
      featured: true,
      needsCopy: true // real title + permission
    },
    {
      id: 't2',
      workshopId: 'w_landing',
      name: 'Anushka Bennur',
      role: 'Cohort 01',
      quote: 'Better prompting and better references. That’s what gets you a refined output.',
      featured: true,
      needsCopy: true
    },
    {
      id: 't3',
      workshopId: 'w_landing',
      name: 'Dheena Dhayalan R',
      role: 'Student · Cohort 01',
      quote: 'I finally learned how to use prompts the right way.',
      featured: true,
      needsCopy: true
    },
    {
      id: 't4',
      workshopId: 'w_landing',
      name: 'Abdul Baseer',
      role: 'Cohort 01',
      quote: 'Real examples. Not toy ones.',
      featured: true,
      // The second sentence is an addition for rhythm — check with him, or
      // run it as just "Real examples."
      needsCopy: true
    },
    {
      id: 't5',
      workshopId: 'w_landing',
      name: 'Harshit',
      role: 'Student · Cohort 01',
      quote: 'Prompt writing for good UI. That’s the thing I took away.',
      featured: false,
      needsCopy: true
    },
    {
      id: 't6',
      workshopId: 'w_landing',
      name: 'Hemalatha R',
      role: 'Self-employed · Cohort 01',
      quote: 'Applying 3D layers to our design was the part I didn’t expect.',
      featured: false,
      needsCopy: true
    },
    {
      id: 't7',
      workshopId: 'w_landing',
      name: 'Saeeta Vishant Govekar',
      role: 'Student · Cohort 01',
      quote: 'Every part of it was worth it. Thank you for running this.',
      featured: false,
      needsCopy: true
    }
  ],

  /* FAQ — the workshop copy files answer most of these better than the old
     generic set did, so these are lifted from
     Workshop-Upcoming-Design-Products-With-AI.md and kept in that voice. */
  /* `home: true` marks the six the homepage shows. The others stay here and in
     the internal console — they're answers worth having, just not the first
     six questions a visitor arrives with. */
  faqs: [
    { id: 'f1', order: 1, home: true, question: 'Who’s this for?', answer: 'Students, freshers, first-jobbers, and product designers whose AI output keeps coming out beige. Nothing here assumes a job, a client, or a system you already own.' },
    { id: 'f2', order: 2, home: true, question: 'Do I need to know how to code?', answer: 'No. If you can read a Figma file, you can follow this.' },
    { id: 'f3', order: 3, home: true, question: 'It’s actually free?', answer: 'Actually free. No paid tier, no pitch at the end. Not a funnel.' },
    { id: 'f4', order: 4, home: true, question: 'What happens in a session?', answer: '90 minutes on Google Meet. We design out loud, you build along in your own file, and you ask anything in the chat.' },
    { id: 'f5', order: 5, question: 'Do I need my own design system?', answer: 'No. Bring one if you have it, use ours if not.' },
    { id: 'f6', order: 6, home: true, question: 'Which AI tool?', answer: 'Whichever you already use. Claude, Cursor, Codex, Antigravity — the method holds. Hit your usage limit mid-session? Keep watching and finish on the recording.' },
    { id: 'f7', order: 7, question: 'Will this replace learning design?', answer: 'No. It removes the drawing, not the deciding. The deciding is design.' },
    { id: 'f8', order: 8, home: true, question: 'Do I get the recording?', answer: 'Yes, with all the files. Log in and it’s yours.' },
    { id: 'f9', order: 9, question: 'What if it’s full?', answer: 'Waitlist. 150 people wanted 45 seats last time, so — likely. Seats do open up.' },
    { id: 'f10', order: 10, question: 'When’s the next one?', answer: 'Every few weeks. The WhatsApp group finds out first.' }
  ],

  /* Stands in for the Google OAuth round-trip. Email login needs no demo
     account — any address works, and the code is shown on screen. */
  demoAccounts: {
    google: { name: 'Jane Smith', email: 'jane@email.com', authProvider: 'GOOGLE' }
  }
};
