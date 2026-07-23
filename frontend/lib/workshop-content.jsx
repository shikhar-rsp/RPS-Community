'use client';
import React from 'react';
import { css } from '@/lib/dc';

// ---------------------------------------------------------------------------
// Single source of truth for the workshop copy, type scale and shared bits of
// UI, used by BOTH the public landing page (app/page.jsx) and the authenticated
// workshop page (app/workshop/WorkshopClient.jsx).
//
// The two pages previously carried independent copies of all of this and drifted
// apart — the authenticated page kept showing the old date, old bios and the old
// section order long after the public page was rewritten. Change content here
// and both pages move together.
// ---------------------------------------------------------------------------

// Session facts. Referenced by copy below and by the countdown target in
// lib/logic/workshop.js — update all of them together when the date moves.
export const SESSION = {
  dateLong: 'Saturday, August 1, 2026',
  dateShort: 'Saturday, August 1',
  dateBadge: '1 August, 2026',
  dateCompact: 'Aug 1',
  time: '3:00 PM',
  duration: '90 min',
  // ISO local time; the workshop and dashboard countdowns both count down to this.
  startsAt: '2026-08-01T15:00:00',
};

// The workshop as it appears on the dashboard card. Plain title (no accent split)
// so it can be used as a string. The dashboard reads date/time from SESSION.
export const WORKSHOP = {
  title: 'Ship client-ready websites in hours, not months',
  blurb: 'netpulse-sol.com is proof — it was built this way in 9 hours flat. In 90 minutes we run the method live and build a B2B SaaS landing page with you.',
  cover: '/assets/hero-16x9.png',
  href: '/workshop',
};

export const TYPE = {
  displayXL: `font-weight:800;font-size:clamp(36px,4.4vw,56px);line-height:1.02;letter-spacing:-0.03em`,
  displayL: `font-weight:800;font-size:clamp(30px,3.4vw,44px);line-height:1.05;letter-spacing:-0.025em`,
  displayM: `font-weight:800;font-size:clamp(22px,2vw,26px);line-height:1.15;letter-spacing:-0.02em`,
  headingS: `font-weight:700;font-size:clamp(19px,1.6vw,22px);line-height:1.3;letter-spacing:-0.02em`,
  headingXS: `font-weight:700;font-size:17px;line-height:1.35;letter-spacing:-0.01em`,
  bodyL: `font-size:clamp(16px,1.15vw,18px);line-height:1.6`,
  bodyM: `font-size:15px;line-height:1.6`,
  bodyS: `font-size:13.5px;line-height:1.5`,
  label: `font-weight:600;font-size:12.5px;letter-spacing:0.18em;text-transform:uppercase`,
  badge: `font-weight:700;font-size:11px;letter-spacing:0.08em;text-transform:uppercase`,
};

// The one emphasis treatment for headings. Keep the wrapped phrase short — a
// gradient that breaks across two lines restarts per line and reads as a bug.
export function Accent({ children }) {
  return (
    <span style={css(`background:linear-gradient(115deg,#FF6A3D,#F5330A);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent`)}>{children}</span>
  );
}

// Hero subhead, shared so the netpulse-sol.com link can't fall out of sync
// between the public and authenticated pages the way the plain-text copy did.
export function HeroBlurb() {
  return (
    <>
      A 90-minute live workshop on how to build interactive, client-ready websites with AI.{' '}
      <a href="https://netpulse-sol.com" target="_blank" rel="noopener" style={css(`color:var(--text);font-weight:600;text-decoration:underline;text-underline-offset:2px;text-decoration-color:var(--border)`)}>netpulse-sol.com</a>
      {' '}is proof — it was built this way in 9 hours flat, not because anyone prompted harder, but because there's a method. In this session, we build a B2B SaaS landing page the same way, live, with you.
    </>
  );
}

export function Chevron({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={css(`flex:none;transition:transform .25s ease;transform:${open ? 'rotate(180deg)' : 'none'};color:var(--muted)`)}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// Short index-style labels, in the order the sections appear on the page.
// Deliberately terser than the section eyebrows they point at.
export const SUBNAV = [
  ["Who it's for", '#who'],
  ['Takeaways', '#outcomes'],
  ['The session', '#how-it-works'],
  ['Trainers', '#trainers'],
  ['FAQ', '#faq'],
];

export const PERSONAS = [
  {
    title: 'Product Designers',
    body: 'Stop handing the landing page off and waiting a sprint for it.',
  },
  {
    title: 'UI & Visual Designers',
    body: 'Take the layout in your head to a live, responsive page without a front-end dev in the loop.',
  },
  {
    title: 'Founders & solo builders',
    body: 'You need a marketing site, you do not have a team, and you do not have a month.',
  },
  {
    title: 'AI-curious designers',
    body: 'You have opened an AI agent, prompted a bit, and drifted. Leave with a method that holds.',
  },
];

export const OUTCOMES = [
  {
    title: "A page that's actually live",
    body: 'Not a mockup, not a Figma file. Everyone builds the same B2B SaaS landing page brief NetPulse was, and it ships to a real URL before the session ends.',
    icon: <><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z"/></>,
  },
  {
    title: 'The toolkit, and when to stop using it',
    body: 'Your coding agent, shadcn, 21st.dev, and Vercel — what each is for, what you can skip, and the exact moments you take the keyboard back instead of prompting again.',
    icon: <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>,
  },
  {
    title: 'Unstuck in real time',
    body: 'Live Q&A while you build, not feedback a week later.',
    icon: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
  },
  {
    title: 'A method you can run again solo',
    body: 'A PDF guide that walks the same method step by step, so you can rebuild it — or run it on your next client brief — on your own time.',
    icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
  },
];

// Descriptions and "what you need" lines are derived strictly from facts already
// stated elsewhere on this page (the brief, the named toolkit, the deploy target).
// TODO — the definitive per-step setup list (CLI versions, accounts to create
// beforehand) still needs trainer confirmation; same open item as the FAQ
// pre-requisites question, which is intentionally unpublished until then.
export const SESSION_STEPS = [
  {
    time: '0–10 min',
    title: '9 hours: where they actually went',
    body: 'The NetPulse build, opened up hour by hour — which parts took the time, and which parts most people skip entirely.',
    need: null,
  },
  {
    time: '10–25 min',
    title: 'Groundwork, before anything gets built',
    body: 'Most people open a tool and start prompting. We start somewhere else, and that is most of the reason the page ships in a day instead of a fortnight.',
    need: 'The brief — the same B2B SaaS landing page for everyone, handed out on the day.',
  },
  {
    time: '25–45 min',
    title: 'The blueprint',
    body: 'The page gets structured before a single prompt is written — the method, in the order that makes it work.',
    need: 'The brief, plus the templates used on the day.',
  },
  {
    time: '45–75 min',
    title: 'Execute: your coding agent, shadcn, 21st.dev',
    body: 'You build alongside the host — where each tool earns its keep, where it gets in the way, and the moments you take the keyboard back instead of prompting again. Bring whichever agent you already use; the method does not change.',
    need: 'Your own machine and an AI coding agent — Claude Code, Codex, Google Antigravity and Cursor all work. Plus shadcn and 21st.dev.',
  },
  {
    time: '75–90 min',
    title: 'Ship on Vercel, the guide, and Q&A',
    body: 'Deploy, so the page ends at a URL and not on localhost. Then the guide, and live Q&A while everything is still fresh.',
    need: 'Vercel, where the page goes live. The PDF guide and prompt library are yours to keep.',
  },
];

export const TRAINERS = [
  {
    name: 'Vineet Chopdekar',
    role: 'Principal Designer',
    photo: '/assets/vineet.png',
    bio: '14+ years designing fintech, Enterprise SaaS products people actually trust. Leads design at RPS.',
    // TODO: confirm with Vineet before publishing — "in this session" line: runs the
    // live build and the blueprint step, the part where most builds go wrong before
    // a single prompt is typed.
  },
  {
    name: 'Vivin Richard',
    // TODO: conflicts with the bio below, which opens "Principal Designer at RPS
    // Studio". Confirm the correct title before publishing.
    role: 'Design Manager',
    photo: '/assets/vivin.png',
    bio: 'Principal Designer at RPS Studio, building AI-native design workflows for enterprise fintech. Believes designers who learn to direct AI will outrun the ones who fear it.',
    // TODO: confirm with Vivin before publishing — "in this session" line: runs Q&A
    // and the ship-checklist close, the part where you turn a working build into
    // something you can hand to a client.
  },
];

export const FAQS = [
  {
    q: 'Do I need to know how to code?',
    a: "No. If you can read a Figma file, you can follow this session. We pace for people who've never opened a terminal.",
  },
  {
    q: 'What if my machine or AI usage limits run out mid-session?',
    a: 'Totally normal — some attendees finish live, some finish afterward using the recording and guide. Everyone leaves with what they need to complete it solo.',
  },
  {
    q: "Is this recorded if I can't attend live?",
    a: 'Yes. The full 90-minute session is recorded, plus you get the PDF guide, the brief, templates, and the prompt library regardless of whether you attend live.',
  },
  {
    q: 'Is it really free?',
    a: 'Yes, free for Cohorts members. Membership itself is free to join.',
  },
  {
    q: 'What happens after the workshop?',
    a: 'You keep the recording, the PDF guide, the brief, the templates, and the prompt library in your Cohorts account, and you can revisit or rebuild the method anytime.',
  },
];
