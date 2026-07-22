'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useDcLogic, css } from '@/lib/dc';
import Logic from '@/lib/logic/home';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Type scale. Every heading, paragraph and label on this page pulls from here —
// interpolate the token into a css() string rather than restating sizes inline,
// so the scale stays changeable in one place.
// ---------------------------------------------------------------------------
const TYPE = {
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
function Accent({ children }) {
  return (
    <span style={css(`background:linear-gradient(115deg,#FF6A3D,#F5330A);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent`)}>{children}</span>
  );
}

// Short index-style labels, listed in the order the sections appear on the page.
// Deliberately terser than the section eyebrows they point at
// ("Who this is for", "What you'll walk away with", "How the session works",
// "Your trainers") — keep the order in sync when sections move.
const SUBNAV = [
  ["Who it's for", '#who'],
  ['Takeaways', '#outcomes'],
  ['The session', '#how-it-works'],
  ['Trainers', '#trainers'],
  ['FAQ', '#faq'],
];

const PERSONAS = [
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

const OUTCOMES = [
  {
    title: "A page that's actually live",
    body: 'Not a mockup, not a Figma file. Everyone builds the same B2B SaaS landing page brief NetPulse was, and it ships to a real URL before the session ends.',
    icon: <><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z"/></>,
  },
  {
    title: 'The toolkit, and when to stop using it',
    body: 'Claude Code, shadcn, 21st.dev, and Vercel — what each is for, what you can skip, and the exact moments you take the keyboard back instead of prompting again.',
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
const SESSION_STEPS = [
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

const FAQS = [
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
    a: 'Yes, free for Academy members. Membership itself is free to join.',
  },
  {
    q: 'What happens after the workshop?',
    a: 'You keep the recording, the PDF guide, the brief, the templates, and the prompt library in your Academy account, and you can revisit or rebuild the method anytime.',
  },
];

function Chevron({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={css(`flex:none;transition:transform .25s ease;transform:${open ? 'rotate(180deg)' : 'none'};color:var(--muted)`)}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function Page() {
  const v = useDcLogic(Logic);
  const [openFaq, setOpenFaq] = useState(null);

  // Progress rail: the step sitting in the middle of the viewport becomes the
  // active one, and every step above it reads as already covered.
  const [activeStep, setActiveStep] = useState(-1);
  const stepRefs = useRef([]);
  useEffect(() => {
    const els = stepRefs.current.filter(Boolean);
    if (!els.length || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveStep(Number(e.target.dataset.step));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
<div ref={v.setRoot} data-screen-label="Opencanvas — Ship with Claude" style={css(`--bg:#141312;--surface:#1d1c1b;--surface2:#242322;--border:rgba(255,255,255,0.09);--text:#ECEBE9;--muted:#9a9993;--faint:#6e6d6a;--accent:#F5330A;--glow:rgba(150,55,25,0.26);--navbg:rgba(20,19,18,0.82);--footerbg:#0a0a0a;background:var(--bg);color:var(--text);font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif;min-height:100vh`)}>


  <nav style={css(`position:sticky;top:0;z-index:50;background:var(--navbg);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--border)`)}>
    <div style={css(`max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,24px);height:68px;display:flex;align-items:center;justify-content:space-between`)}>
      <a href="#" style={css(`display:flex;align-items:center;gap:12px`)}>
        <img src="/assets/academy-logo-full.png" alt="Academy" style={css(`height:40px;width:auto;object-fit:contain;display:block`)} />
        <span style={css(`font-weight:700;font-size:20px;letter-spacing:-0.02em;color:var(--text)`)}>Academy</span>
      </a>
      <div style={css(`display:flex;align-items:center;gap:16px`)}>
        <button onClick={v.toggle} aria-label="Toggle theme" style={css(`display:none;width:40px;height:40px;border-radius:999px;border:1px solid var(--border);background:transparent;color:var(--muted);align-items:center;justify-content:center;cursor:pointer;transition:color .2s,border-color .2s`)} data-h="home-0">
          {v.dark && (<>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4.2"/><line x1="12" y1="2" x2="12" y2="4.5"/><line x1="12" y1="19.5" x2="12" y2="22"/><line x1="2" y1="12" x2="4.5" y2="12"/><line x1="19.5" y1="12" x2="22" y2="12"/><line x1="4.9" y1="4.9" x2="6.6" y2="6.6"/><line x1="17.4" y1="17.4" x2="19.1" y2="19.1"/><line x1="4.9" y1="19.1" x2="6.6" y2="17.4"/><line x1="17.4" y1="6.6" x2="19.1" y2="4.9"/></svg>
          </>)}
          {v.light && (<>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
          </>)}
        </button>
        <Link href="/signin" className="btn btn--primary btn--sm">Enroll now</Link>
      </div>
    </div>
  </nav>


  {/* Backdrop mirrors the sign-in panel: a diagonal base gradient, the 46px grid,
      then two warm radial glows layered over it. Opacities are pulled back from
      the sign-in values because the hero is far wider and carries a bright image. */}
  <section style={css(`position:relative;overflow:hidden;background:linear-gradient(160deg,#1b1a18 0%,#141312 60%);padding:clamp(28px,4vw,44px) 0 clamp(56px,7vw,88px)`)}>
    <div aria-hidden="true" style={css(`position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px);background-size:46px 46px;mask-image:radial-gradient(110% 85% at 50% 22%,#000 28%,transparent 78%);-webkit-mask-image:radial-gradient(110% 85% at 50% 22%,#000 28%,transparent 78%);pointer-events:none`)}></div>
    <div aria-hidden="true" style={css(`position:absolute;top:-30%;left:-8%;width:46%;height:70%;background:radial-gradient(circle,rgba(245,60,20,0.16),transparent 66%);pointer-events:none`)}></div>
    <div aria-hidden="true" style={css(`position:absolute;bottom:-28%;right:-8%;width:44%;height:64%;background:radial-gradient(circle,rgba(245,60,20,0.09),transparent 66%);pointer-events:none`)}></div>
    <div style={css(`position:relative;max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,24px)`)}>
      <a href="#" data-reveal style={css(`display:none;align-items:center;gap:9px;color:var(--muted);${TYPE.bodyM};margin-bottom:28px;transition:color .2s`)} data-h="home-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="6" y2="12"/><polyline points="11 6 5 12 11 18"/></svg>
        All workshops
      </a>
      <div style={css(`display:flex;flex-direction:column;align-items:center;text-align:center`)}>

        <div data-reveal style={css(`display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:22px`)}>
          <span style={css(`background:var(--accent);color:#1a0803;${TYPE.badge};padding:5px 11px;border-radius:999px`)}>LIVE</span>
          <span style={css(`color:var(--faint);${TYPE.label}`)}>1 August, 2026</span>
        </div>

        <h1 data-reveal data-reveal-delay="60" style={css(`margin:0 0 22px;max-width:900px;${TYPE.displayXL};color:var(--text)`)}>Ship client-ready websites in <Accent>hours, not months</Accent>.</h1>

        <p data-reveal data-reveal-delay="120" style={css(`margin:0 0 30px;max-width:760px;${TYPE.bodyL};color:var(--muted)`)}>A 90-minute live workshop on how to build interactive, client-ready websites with AI. netpulse-sol.com is proof — it was built this way in 9 hours flat, not because anyone prompted harder, but because there's a method. In this session, we build a B2B SaaS landing page the same way, live, with you.</p>

        <div data-reveal data-reveal-delay="160" style={css(`display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-bottom:34px`)}>
          <span style={css(`background:var(--surface2);border:1px solid var(--border);border-radius:999px;padding:8px 14px;font-weight:600;${TYPE.bodyS};color:var(--text)`)}>90 minutes</span>
          <span style={css(`background:var(--surface2);border:1px solid var(--border);border-radius:999px;padding:8px 14px;font-weight:600;${TYPE.bodyS};color:var(--text)`)}>Live cohort build</span>
          <span style={css(`background:var(--surface2);border:1px solid var(--border);border-radius:999px;padding:8px 14px;font-weight:600;${TYPE.bodyS};color:var(--text)`)}>Recorded + PDF guide</span>
          <span style={css(`background:var(--surface2);border:1px solid var(--border);border-radius:999px;padding:8px 14px;font-weight:600;${TYPE.bodyS};color:var(--text)`)}>Free for members</span>
        </div>

        <div data-reveal data-reveal-delay="200">
          <Link href="/signin" className="btn btn--primary btn--lg">
            Enroll now
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="18" y2="12"/><polyline points="12 6 18 12 12 18"/></svg>
          </Link>
        </div>

        {/* aspect-ratio matches the source image (1920x1440) so object-fit:cover
            has nothing to crop. Update both together if the asset is re-exported. */}
        <div data-reveal data-reveal-delay="80" style={css(`width:100%;max-width:1040px;margin-top:clamp(60px,7vw,80px);position:relative;aspect-ratio:4/3;border-radius:18px;overflow:hidden;border:1px solid var(--border)`)}>
          <img src="/assets/hero-16x9.png" alt="netpulse-sol.com — the B2B SaaS landing page built with this method in 9 hours" style={css(`position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block`)} />
        </div>
      </div>
    </div>
  </section>


  <div style={css(`position:sticky;top:68px;z-index:40;background:var(--navbg);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--border)`)}>
    <div style={css(`max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,24px);overflow-x:auto`)}>
      {/* width:max-content + min-width:100% keeps the links centred when they fit,
          and lets the row scroll from its true start when they do not. */}
      <div style={css(`height:52px;display:flex;align-items:center;justify-content:center;gap:clamp(16px,2.4vw,28px);width:max-content;min-width:100%`)}>
        {SUBNAV.map(([label, href]) => (
          <a key={href} href={href} style={css(`flex:none;color:var(--muted);font-weight:600;${TYPE.bodyS};transition:color .2s`)} data-h="home-14">{label}</a>
        ))}
      </div>
    </div>
  </div>


  <section id="who" style={css(`border-top:1px solid var(--border);padding:clamp(64px,9vw,104px) 0;scroll-margin-top:140px`)}>
    <div style={css(`max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,24px)`)}>
      <div style={css(`background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:clamp(32px,4.5vw,72px) clamp(20px,3vw,56px)`)}>

        <div data-reveal style={css(`display:flex;flex-direction:column;align-items:center;text-align:center;margin-bottom:clamp(32px,4vw,48px)`)}>
          <span style={css(`background:var(--surface2);border:1px solid var(--border);border-radius:999px;padding:8px 16px;color:var(--faint);${TYPE.label};margin-bottom:22px`)}>Who this is for</span>
          <h2 style={css(`margin:0;max-width:820px;${TYPE.displayL}`)}>Built for designers who want to <Accent>ship, not just spec</Accent>.</h2>
        </div>

        <div className="oc-grid4" style={css(`display:grid;grid-template-columns:repeat(4,1fr);gap:18px`)}>
          {PERSONAS.map((p, i) => (
            <div
              key={p.title}
              data-reveal
              data-reveal-delay={i * 80}
              style={css(`display:flex;flex-direction:column;gap:14px;background:transparent;border:1px solid var(--border);border-radius:18px;padding:clamp(22px,2vw,28px);transition:border-color .25s,transform .25s`)}
              data-h={`home-${i + 2}`}
            >
              <span style={css(`width:38px;height:38px;flex:none;border-radius:10px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-weight:700;${TYPE.bodyS};color:var(--muted)`)}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 style={css(`margin:0 0 6px;${TYPE.headingXS};color:var(--text)`)}>{p.title}</h3>
                <p style={css(`margin:0;${TYPE.bodyM};color:var(--muted)`)}>{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>


  <section id="outcomes" style={css(`border-top:1px solid var(--border);padding:clamp(64px,9vw,104px) 0;scroll-margin-top:140px`)}>
    <div style={css(`max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,24px)`)}>
      <div data-reveal style={css(`display:flex;flex-direction:column;align-items:center;text-align:center;margin-bottom:clamp(40px,5vw,60px)`)}>
        <span style={css(`background:var(--surface2);border:1px solid var(--border);border-radius:999px;padding:8px 16px;color:var(--faint);${TYPE.label};margin-bottom:22px`)}>What you'll walk away with</span>
        <h2 style={css(`margin:0;max-width:820px;${TYPE.displayL}`)}>One brief, one method, <Accent>a live URL</Accent> by the end.</h2>
      </div>

      <div data-reveal style={css(`margin-bottom:clamp(36px,4vw,48px)`)}>
        <div className="oc-fan">
          {OUTCOMES.map((o) => (
            <div key={o.title} className="oc-fancard" style={css(`display:flex;flex-direction:column;min-height:clamp(280px,25vw,360px);background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:clamp(22px,2vw,28px)`)}>
              <span style={css(`width:44px;height:44px;flex:none;border-radius:12px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center`)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{o.icon}</svg>
              </span>
              <div style={css(`margin-top:auto;padding-top:28px`)}>
                <h3 style={css(`margin:0 0 10px;${TYPE.headingXS};color:var(--text)`)}>{o.title}</h3>
                <p style={css(`margin:0;${TYPE.bodyM};color:var(--muted)`)}>{o.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div data-reveal style={css(`display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:18px`)}>
        <Link href="/signin" className="btn btn--primary btn--md">
          Enroll now
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="18" y2="12"/><polyline points="12 6 18 12 12 18"/></svg>
        </Link>
        <span style={css(`color:var(--faint);${TYPE.bodyS}`)}>Saturday, August 1 · 3:00 PM</span>
      </div>
    </div>
  </section>


  <section id="how-it-works" style={css(`border-top:1px solid var(--border);padding:clamp(64px,9vw,104px) 0;scroll-margin-top:140px`)}>
    <div style={css(`max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,24px)`)}>
     <div style={css(`background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:clamp(32px,4.5vw,72px) clamp(20px,3vw,56px)`)}>
      <div data-reveal style={css(`max-width:640px;margin-bottom:clamp(32px,4vw,44px)`)}>
        <span style={css(`display:inline-block;background:var(--surface2);border:1px solid var(--border);border-radius:999px;padding:8px 16px;color:var(--faint);${TYPE.label};margin-bottom:22px`)}>How the session works</span>
        <h2 style={css(`margin:0 0 18px;${TYPE.displayL}`)}><Accent>90 minutes</Accent>, brief to browser.</h2>
        <p style={css(`margin:0;${TYPE.bodyL};color:var(--muted)`)}>One focused session, run as a single continuous build on a shared brief. It is recorded, so you can revisit it, catch up if you miss it live, or replay a step while you finish your own page.</p>
      </div>

      <div data-reveal data-reveal-delay="40" style={css(`background:var(--surface2);border:1px solid var(--border);border-radius:16px;padding:22px 24px;margin-bottom:clamp(32px,4vw,44px)`)}>
        <p style={css(`margin:0;${TYPE.bodyM};color:var(--muted)`)}>This room will be mixed. Some of you live in a terminal, some have never opened one. We pace for the middle and nothing is assumed out loud. If you can read a Figma file you can follow this.</p>
      </div>

      <div style={css(`display:flex;align-items:center;justify-content:space-between;margin-bottom:20px`)}>
        <div style={css(`${TYPE.headingXS};color:var(--text)`)}>The build, live</div>
        <div style={css(`color:var(--faint);${TYPE.label}`)}>90 min</div>
      </div>

      <div>
        {SESSION_STEPS.map((s, i) => {
          const done = i <= activeStep;
          return (
            <div
              key={s.title}
              ref={(el) => { stepRefs.current[i] = el; }}
              data-step={i}
              style={css(`border-left:2px solid ${done ? 'var(--accent)' : 'var(--border)'};padding:4px 0 clamp(28px,3vw,40px) clamp(20px,2vw,28px);transition:border-color .45s ease`)}
            >
              <div style={css(`color:${done ? 'var(--accent)' : 'var(--faint)'};${TYPE.label};margin-bottom:10px;transition:color .45s ease`)}>
                Step {i + 1} <span style={css(`color:var(--faint);letter-spacing:0`)}>· {s.time}</span>
              </div>
              <h3 style={css(`margin:0 0 10px;${TYPE.headingS};color:var(--text)`)}>{s.title}</h3>
              <p style={css(`margin:0;max-width:660px;${TYPE.bodyM};color:var(--muted)`)}>{s.body}</p>
              {s.need && (
                <div style={css(`display:flex;gap:10px;margin-top:16px;max-width:660px`)}>
                  <span style={css(`flex:none;color:var(--faint);${TYPE.label};padding-top:3px`)}>Need</span>
                  <span style={css(`${TYPE.bodyM};color:var(--text)`)}>{s.need}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div data-reveal style={css(`margin-top:28px;position:relative;overflow:hidden;display:flex;gap:16px;background:linear-gradient(135deg,rgba(245,60,20,0.09),var(--surface2) 55%);border:1px solid rgba(255,120,60,0.22);border-radius:16px;padding:22px 24px`)}>
        <span style={css(`flex:none;width:36px;height:36px;border-radius:10px;background:rgba(245,60,20,0.14);border:1px solid rgba(255,120,60,0.3);display:flex;align-items:center;justify-content:center`)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="8" x2="12" y2="13"/><circle cx="12" cy="16.3" r="0.6" fill="var(--accent)" stroke="none"/><circle cx="12" cy="12" r="9"/></svg></span>
        <p style={css(`margin:0;${TYPE.bodyM};color:var(--muted)`)}><span style={css(`color:var(--text);font-weight:700`)}>Honest note</span> — Different machines, different agents, different usage limits. Some of you will finish in the room, some will be halfway. Both are fine. The method is the thing you came for, and you leave with everything you need to finish on your own time.</p>
      </div>
     </div>
    </div>
  </section>


  <section id="trainers" style={css(`position:relative;border-top:1px solid var(--border);padding:clamp(64px,9vw,104px) 0;overflow:hidden;scroll-margin-top:140px`)}>
    {v.warmGlow && (<><div style={css(`position:absolute;inset:0;background:radial-gradient(85% 130% at 10% -5%,var(--glow),transparent 52%);pointer-events:none`)}></div></>)}
    <div style={css(`position:relative;max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,24px)`)}>
      <div data-reveal style={css(`text-align:center;color:var(--faint);${TYPE.label};margin-bottom:18px`)}>Your trainers</div>
      <h2 data-reveal data-reveal-delay="60" style={css(`margin:0 auto clamp(40px,5vw,56px);text-align:center;${TYPE.displayL};max-width:720px`)}>Learn from the people who <Accent>do this daily</Accent>.</h2>
      <div style={css(`display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:clamp(24px,3vw,40px);max-width:820px;margin:0 auto`)}>
        <div data-reveal style={css(`text-align:center`)}>
          <div style={css(`aspect-ratio:4/5;border-radius:18px;overflow:hidden;border:1px solid var(--border);margin-bottom:20px`)}><img src="/assets/vineet.png" alt="Vineet Chopdekar" style={css(`width:100%;height:100%;object-fit:cover;display:block`)} /></div>
          <div style={css(`color:var(--faint);${TYPE.label};margin-bottom:10px`)}>Principal Designer</div>
          <h3 style={css(`margin:0 0 10px;${TYPE.headingS};color:var(--text)`)}>Vineet Chopdekar</h3>
          <p style={css(`margin:0 auto;${TYPE.bodyM};color:var(--muted);max-width:420px`)}>14+ years designing fintech, Enterprise SaaS products people actually trust. Leads design at RPS.</p>
          {/* TODO: confirm with Vineet before publishing — "in this session" line: runs the live build and the blueprint step, the part where most builds go wrong before a single prompt is typed. */}
        </div>
        <div data-reveal data-reveal-delay="100" style={css(`text-align:center`)}>
          <div style={css(`aspect-ratio:4/5;border-radius:18px;overflow:hidden;border:1px solid var(--border);margin-bottom:20px`)}><img src="/assets/vivin.png" alt="Vivin Richard" style={css(`width:100%;height:100%;object-fit:cover;display:block`)} /></div>
          <div style={css(`color:var(--faint);${TYPE.label};margin-bottom:10px`)}>Design Manager</div>
          <h3 style={css(`margin:0 0 10px;${TYPE.headingS};color:var(--text)`)}>Vivin Richard</h3>
          <p style={css(`margin:0 auto;${TYPE.bodyM};color:var(--muted);max-width:420px`)}>Principal Designer at RPS Studio, building AI-native design workflows for enterprise fintech. Believes designers who learn to direct AI will outrun the ones who fear it.</p>
          {/* TODO: confirm with Vivin before publishing — "in this session" line: runs Q&A and the ship-checklist close, the part where you turn a working build into something you can hand to a client. */}
        </div>
      </div>
    </div>
  </section>


  <section id="faq" style={css(`border-top:1px solid var(--border);padding:clamp(64px,9vw,104px) 0;scroll-margin-top:140px`)}>
    <div style={css(`max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,24px)`)}>
      <div data-reveal style={css(`max-width:640px;margin:0 auto clamp(32px,4vw,44px);text-align:center`)}>
        <div style={css(`color:var(--faint);${TYPE.label};margin-bottom:18px`)}>Before you enroll</div>
        <h2 style={css(`margin:0;${TYPE.displayL}`)}><Accent>Questions</Accent>, answered.</h2>
      </div>
      <div style={css(`display:flex;flex-direction:column;gap:12px;max-width:760px;margin:0 auto`)}>
        {FAQS.map((f, i) => {
          const open = openFaq === i;
          return (
            <div key={f.q} data-reveal data-reveal-delay={i * 40} style={css(`border:1px solid var(--border);border-radius:14px;overflow:hidden`)}>
              <div
                onClick={() => setOpenFaq(open ? null : i)}
                style={css(`cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;background:var(--surface)`)}
                data-h="home-16"
              >
                <span style={css(`font-weight:600;${TYPE.bodyM};color:var(--text)`)}>{f.q}</span>
                <Chevron open={open} />
              </div>
              {open && (
                <div style={css(`padding:0 20px 18px;background:var(--surface)`)}>
                  <p style={css(`margin:0;${TYPE.bodyM};color:var(--muted)`)}>{f.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </section>


  <footer style={css(`background:var(--footerbg);border-top:1px solid var(--border);padding:clamp(56px,7vw,88px) 0 40px`)}>
    <div style={css(`max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,24px)`)}>
      <div className="oc-footgrid" style={css(`display:grid;grid-template-columns:1.5fr 0.8fr 1.2fr 0.8fr;gap:40px;margin-bottom:clamp(48px,6vw,72px)`)} data-reveal>
        <div style={css(`min-width:240px`)}>
          <h3 style={css(`margin:0 0 14px;${TYPE.displayM};color:#f2f1ef`)}>Where designers learn to ship.</h3>
          <p style={css(`margin:0;${TYPE.bodyM};color:#8f8e8a;max-width:340px`)}>We teach design in the open. The goal is a next generation of designers who ship real work with AI.</p>
        </div>
        <div>
          <div style={css(`color:#6e6d6a;${TYPE.label};margin-bottom:20px`)}>Cohorts</div>
          <a href="#" style={css(`display:block;color:#dcdbd8;${TYPE.bodyM}`)} data-h="home-11">Workshops</a>
        </div>
        <div>
          <div style={css(`color:#6e6d6a;${TYPE.label};margin-bottom:20px`)}>Explore</div>
          {SUBNAV.map(([label, href]) => (
            <a key={href} href={href} style={css(`display:block;color:#dcdbd8;${TYPE.bodyM};margin-bottom:12px`)} data-h="home-15">{label}</a>
          ))}
        </div>
        <div>
          <div style={css(`color:#6e6d6a;${TYPE.label};margin-bottom:20px`)}>Account</div>
          <Link href="/signin" style={css(`display:block;color:#dcdbd8;${TYPE.bodyM}`)} data-h="home-12">Enroll now</Link>
        </div>
      </div>
      <div style={css(`border-top:1px solid var(--border);padding-top:28px;display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;color:#6e6d6a;${TYPE.bodyS}`)}>
        <span>© 2026 RPS Academy · Made with love and a lot of procrastination</span>
        <span>@rps.academy</span>
      </div>
    </div>
  </footer>

</div>
  );
}
