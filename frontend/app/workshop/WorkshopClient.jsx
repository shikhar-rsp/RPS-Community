'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDcLogic, css } from '@/lib/dc';
import Logic from '@/lib/logic/workshop';
import { createClient } from '@/lib/supabase/client';
import {
  SESSION, TYPE, Accent, Chevron, HeroBlurb, SUBNAV, PERSONAS, OUTCOMES, SESSION_STEPS, TRAINERS, FAQS,
} from '@/lib/workshop-content';

// The enrolled-member view of the workshop. Structurally identical to the public
// landing page (app/page.jsx) — both read their copy from lib/workshop-content —
// with three deliberate differences:
//   1. authenticated nav (profile menu + sign out) instead of an Enroll CTA
//   2. the hero and repeat CTAs are "Join Meet" + countdown, since the reader has
//      already enrolled and "Enroll now" would be a dead end
//   3. the footer Account column links to the dashboard instead of enrolment
export default function WorkshopClient({ name, email, avatarUrl, initials }) {
  const router = useRouter();
  const supabase = createClient();

  const onSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
    router.refresh();
  };

  const v = useDcLogic(Logic, { name, email, avatarUrl, initials, onSignOut });

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

  // Join Meet + countdown, used in the hero and again after the outcomes cards.
  const JoinMeet = ({ size = 'lg' }) => (
    <div style={css(`display:inline-flex;align-items:stretch;gap:10px;flex-wrap:wrap;justify-content:center`)}>
      <a href="https://meet.google.com/landing" target="_blank" rel="noopener" className={`btn btn--primary btn--${size}`}>
        <img src="/assets/google-meet-logo.png" alt="" style={css(`width:18px;height:18px;object-fit:contain;flex:none`)} />
        Join Meet
      </a>
      <span title="Time until the workshop starts" style={css(`flex:none;display:inline-flex;align-items:center;gap:7px;padding:0 16px;border-radius:12px;background:var(--surface);border:1px solid var(--border);color:var(--text);font-weight:700;${TYPE.bodyM};font-variant-numeric:tabular-nums;white-space:nowrap`)}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="8"/><polyline points="12 9 12 13 14.5 14.5"/><line x1="9" y1="1.5" x2="15" y2="1.5"/><line x1="12" y1="1.5" x2="12" y2="4"/></svg>
        {v.countdown}
      </span>
    </div>
  );

  return (
<div ref={v.setRoot} data-screen-label="Cohorts — Workshop" style={css(`--bg:#141312;--surface:#1d1c1b;--surface2:#242322;--border:rgba(255,255,255,0.09);--text:#ECEBE9;--muted:#9a9993;--faint:#6e6d6a;--accent:#F5330A;--glow:rgba(150,55,25,0.26);--navbg:rgba(20,19,18,0.82);--footerbg:#0a0a0a;background:var(--bg);color:var(--text);font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif;min-height:100vh`)}>


  <nav style={css(`position:sticky;top:0;z-index:50;background:var(--navbg);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--border)`)}>
    <div style={css(`max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,24px);height:68px;display:flex;align-items:center;gap:clamp(16px,3vw,32px)`)}>
      <a href="/dashboard" style={css(`display:flex;align-items:center;gap:10px;color:var(--text);flex:none`)}>
        <img src="/assets/academy-logo-full.png" alt="Cohorts" style={css(`height:36px;width:auto;object-fit:contain;display:block`)} />
        <span style={css(`font-weight:700;font-size:18px;letter-spacing:-0.02em`)}>Cohorts</span>
      </a>
      <div className="db-search" style={css(`flex:1 1 auto;min-width:0`)}></div>
      <div style={css(`display:flex;align-items:center;gap:14px;flex:none`)}>
      <div ref={v.setMenuWrap} style={css(`position:relative;flex:none`)}>
        <button type="button" onClick={v.toggleMenu} aria-haspopup="true" aria-label="Open profile menu" style={css(`display:block;width:34px;height:34px;border-radius:999px;overflow:hidden;padding:0;border:1px solid var(--border);background:var(--surface2);cursor:pointer;transition:box-shadow .2s,border-color .2s`)} data-h="workshop-0">
          {v.navAvatar}
        </button>

        {v.menuOpen && (<>
          <div className="pf-menu" style={css(`position:absolute;top:calc(100% + 12px);right:0;width:292px;z-index:200;background:var(--surface);border:1px solid var(--border);border-radius:20px;box-shadow:0 30px 70px -24px rgba(0,0,0,0.85),0 2px 0 rgba(255,255,255,0.04),inset 0 1px 0 rgba(255,255,255,0.06)`)}>
            <div style={css(`position:relative;height:72px;border-radius:20px 20px 0 0;overflow:hidden;background:linear-gradient(120deg,#2a1308 0%,#180c06 62%)`)}>
              <div aria-hidden="true" style={css(`position:absolute;inset:0;background:radial-gradient(130% 160% at 80% -35%,rgba(245,60,20,0.6),transparent 58%)`)}></div>
              <div aria-hidden="true" style={css(`position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px);background-size:22px 22px;mask-image:linear-gradient(180deg,#000,transparent);-webkit-mask-image:linear-gradient(180deg,#000,transparent)`)}></div>
            </div>
            <div style={css(`position:relative;margin-top:-44px;padding:0 24px 24px;text-align:center`)}>
              <div className="pf-pic" style={css(`position:relative;width:86px;height:86px;margin:0 auto 15px;border-radius:999px;overflow:hidden;border:3px solid var(--surface);box-shadow:0 0 0 1px var(--border),0 14px 30px -10px rgba(0,0,0,0.75);background:var(--surface2)`)}>
                {v.cardAvatar}
                <div className="pf-overlay" style={css(`position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:11px;background:rgba(10,7,5,0.58);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)`)}>
                  <button type="button" onClick={v.onEdit} aria-label="Change photo" title="Change photo" style={css(`width:32px;height:32px;border-radius:999px;border:1px solid rgba(255,255,255,0.28);background:rgba(255,255,255,0.14);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s`)} data-h="workshop-1"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></button>
                  <button type="button" onClick={v.onDelete} aria-label="Remove photo" title="Remove photo" style={css(`width:32px;height:32px;border-radius:999px;border:1px solid rgba(255,255,255,0.28);background:rgba(255,255,255,0.14);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s`)} data-h="workshop-2"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
                </div>
              </div>
              <div style={css(`font-weight:700;font-size:17px;letter-spacing:-0.015em;color:var(--text)`)}>{v.name}</div>
              <div style={css(`font-size:13px;color:var(--muted);margin-top:4px;display:flex;align-items:center;justify-content:center;gap:6px`)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={css(`opacity:.75`)}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>{v.email}</div>
              <div style={css(`height:1px;background:var(--border);margin:16px -24px 16px`)}></div>
              <span style={css(`display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;letter-spacing:0.02em;color:var(--accent);background:rgba(245,60,20,0.12);border:1px solid rgba(245,60,20,0.24);padding:5px 12px;border-radius:999px`)}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/></svg>Design Beginner</span>
            </div>
          </div>
        </>)}
        <input ref={v.setFileInput} type="file" accept="image/*" onChange={v.onFile} style={css(`display:none`)} />
      </div>
        <button type="button" onClick={v.onSignOut} className="btn btn--tertiary btn--sm">Sign out</button>
      </div>
    </div>
  </nav>


  {/* Backdrop mirrors the sign-in panel: a diagonal base gradient, the 46px grid,
      then two warm radial glows layered over it. */}
  <section style={css(`position:relative;overflow:hidden;background:linear-gradient(160deg,#1b1a18 0%,#141312 60%);padding:clamp(28px,4vw,44px) 0 clamp(56px,7vw,88px)`)}>
    <div aria-hidden="true" style={css(`position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px);background-size:46px 46px;mask-image:radial-gradient(110% 85% at 50% 22%,#000 28%,transparent 78%);-webkit-mask-image:radial-gradient(110% 85% at 50% 22%,#000 28%,transparent 78%);pointer-events:none`)}></div>
    <div aria-hidden="true" style={css(`position:absolute;top:-30%;left:-8%;width:46%;height:70%;background:radial-gradient(circle,rgba(245,60,20,0.16),transparent 66%);pointer-events:none`)}></div>
    <div aria-hidden="true" style={css(`position:absolute;bottom:-28%;right:-8%;width:44%;height:64%;background:radial-gradient(circle,rgba(245,60,20,0.09),transparent 66%);pointer-events:none`)}></div>
    <div style={css(`position:relative;max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,24px)`)}>
      <div style={css(`display:flex;flex-direction:column;align-items:center;text-align:center`)}>

        <div data-reveal style={css(`display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:22px`)}>
          <span style={css(`background:var(--accent);color:#1a0803;${TYPE.badge};padding:5px 11px;border-radius:999px`)}>LIVE</span>
          <span style={css(`color:var(--faint);${TYPE.label}`)}>{SESSION.dateBadge}</span>
        </div>

        <h1 data-reveal data-reveal-delay="60" style={css(`margin:0 0 22px;max-width:900px;${TYPE.displayXL};color:var(--text)`)}>Ship client-ready websites in <Accent>hours, not months</Accent>.</h1>

        <p data-reveal data-reveal-delay="120" style={css(`margin:0 0 30px;max-width:760px;${TYPE.bodyL};color:var(--muted)`)}><HeroBlurb /></p>

        <div data-reveal data-reveal-delay="160" style={css(`display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-bottom:34px`)}>
          <span style={css(`background:var(--surface2);border:1px solid var(--border);border-radius:999px;padding:8px 14px;font-weight:600;${TYPE.bodyS};color:var(--text)`)}>90 minutes</span>
          <span style={css(`background:var(--surface2);border:1px solid var(--border);border-radius:999px;padding:8px 14px;font-weight:600;${TYPE.bodyS};color:var(--text)`)}>Live cohort build</span>
          <span style={css(`background:var(--surface2);border:1px solid var(--border);border-radius:999px;padding:8px 14px;font-weight:600;${TYPE.bodyS};color:var(--text)`)}>Recorded + PDF guide</span>
          <span style={css(`background:var(--surface2);border:1px solid var(--border);border-radius:999px;padding:8px 14px;font-weight:600;${TYPE.bodyS};color:var(--text)`)}>You're enrolled</span>
        </div>

        {/* Replaces the public page's "Enroll now" — this reader is already in. */}
        <div data-reveal data-reveal-delay="200" style={css(`display:flex;flex-direction:column;align-items:center;gap:12px`)}>
          <JoinMeet size="lg" />
          <p style={css(`margin:0;${TYPE.bodyS};color:var(--muted)`)}>Joining opens when the workshop starts · {SESSION.dateShort}, {SESSION.time}</p>
        </div>

        <div data-reveal data-reveal-delay="80" style={css(`width:100%;max-width:1040px;margin-top:clamp(60px,7vw,80px);position:relative;aspect-ratio:4/3;border-radius:18px;overflow:hidden;border:1px solid var(--border)`)}>
          <img src="/assets/hero-16x9.png" alt="netpulse-sol.com — the B2B SaaS landing page built with this method in 9 hours" style={css(`position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block`)} />
        </div>
      </div>
    </div>
  </section>


  <div style={css(`position:sticky;top:68px;z-index:40;background:var(--navbg);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--border)`)}>
    <div style={css(`max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,24px);overflow-x:auto`)}>
      <div style={css(`height:52px;display:flex;align-items:center;justify-content:center;gap:clamp(16px,2.4vw,28px);width:max-content;min-width:100%`)}>
        {SUBNAV.map(([label, href]) => (
          <a key={href} href={href} style={css(`flex:none;color:var(--muted);font-weight:600;${TYPE.bodyS};transition:color .2s`)} data-h="workshop-3">{label}</a>
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
              data-h={`workshop-${i + 4}`}
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
        <JoinMeet size="md" />
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
        <div style={css(`color:var(--faint);${TYPE.label}`)}>{SESSION.duration}</div>
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
        {TRAINERS.map((t, i) => (
          <div key={t.name} data-reveal data-reveal-delay={i * 100} style={css(`text-align:center`)}>
            <div style={css(`aspect-ratio:4/5;border-radius:18px;overflow:hidden;border:1px solid var(--border);margin-bottom:20px`)}><img src={t.photo} alt={t.name} style={css(`width:100%;height:100%;object-fit:cover;display:block`)} /></div>
            <div style={css(`color:var(--faint);${TYPE.label};margin-bottom:10px`)}>{t.role}</div>
            <h3 style={css(`margin:0 0 10px;${TYPE.headingS};color:var(--text)`)}>{t.name}</h3>
            <p style={css(`margin:0 auto;${TYPE.bodyM};color:var(--muted);max-width:420px`)}>{t.bio}</p>
          </div>
        ))}
      </div>
    </div>
  </section>


  <section id="faq" style={css(`border-top:1px solid var(--border);padding:clamp(64px,9vw,104px) 0;scroll-margin-top:140px`)}>
    <div style={css(`max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,24px)`)}>
      <div data-reveal style={css(`max-width:640px;margin:0 auto clamp(32px,4vw,44px);text-align:center`)}>
        <div style={css(`color:var(--faint);${TYPE.label};margin-bottom:18px`)}>Good to know</div>
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
                data-h="workshop-8"
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

  {v.pdfOpen && (<>
    <div className="asg-modal" onClick={v.closePdf} style={css(`position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;padding:clamp(16px,3vw,40px);background:rgba(8,6,5,0.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)`)}>
      <div className="asg-panel" onClick={v.stop} style={css(`position:relative;width:100%;max-width:860px;height:min(88vh,1000px);display:flex;flex-direction:column;background:var(--surface);border:1px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:0 44px 110px -30px rgba(0,0,0,0.88)`)}>
        <div style={css(`display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid var(--border)`)}>
          <div style={css(`display:flex;align-items:center;gap:12px;min-width:0`)}>
            <span style={css(`flex:none;width:38px;height:38px;border-radius:10px;background:rgba(245,60,20,0.12);border:1px solid rgba(245,60,20,0.24);display:flex;align-items:center;justify-content:center`)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6M9 18h4"/></svg></span>
            <div style={css(`min-width:0`)}><div style={css(`font-weight:700;font-size:15px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis`)}>Design handoff that sticks</div><div style={css(`font-size:12.5px;color:var(--faint)`)}>Assignment brief · PDF</div></div>
          </div>
          <div style={css(`display:flex;align-items:center;gap:10px;flex:none`)}>
            <button type="button" onClick={v.onDownload} className="btn btn--primary btn--sm"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><polyline points="7 11 12 16 17 11"/><path d="M4 20h16"/></svg>Download</button>
            <button type="button" onClick={v.closePdf} aria-label="Close" style={css(`width:38px;height:38px;border-radius:10px;background:var(--surface2);border:1px solid var(--border);color:var(--muted);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:color .2s,border-color .2s`)} data-h="workshop-13"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></button>
          </div>
        </div>
        <div style={css(`flex:1;min-height:0;background:var(--surface2);display:flex;align-items:center;justify-content:center;padding:24px`)}>
          <div style={css(`text-align:center;color:var(--faint)`)}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={css(`opacity:.6`)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><div style={css(`margin-top:14px;font-size:13.5px`)}>PDF preview loads here</div></div>
        </div>
      </div>
    </div>
  </>)}


  <footer style={css(`background:var(--footerbg);border-top:1px solid var(--border);padding:clamp(56px,7vw,88px) 0 40px`)}>
    <div style={css(`max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,24px)`)}>
      <div className="oc-footgrid" style={css(`display:grid;grid-template-columns:1.5fr 0.8fr 1.2fr 0.8fr;gap:40px;margin-bottom:clamp(48px,6vw,72px)`)} data-reveal>
        <div style={css(`min-width:240px`)}>
          <h3 style={css(`margin:0 0 14px;${TYPE.displayM};color:#f2f1ef`)}>Where designers learn to ship.</h3>
          <p style={css(`margin:0;${TYPE.bodyM};color:#8f8e8a;max-width:340px`)}>We teach design in the open. The goal is a next generation of designers who ship real work with AI.</p>
        </div>
        <div>
          <div style={css(`color:#6e6d6a;${TYPE.label};margin-bottom:20px`)}>Cohorts</div>
          <a href="/workshop" style={css(`display:block;color:#dcdbd8;${TYPE.bodyM}`)} data-h="workshop-14">Workshops</a>
        </div>
        <div>
          <div style={css(`color:#6e6d6a;${TYPE.label};margin-bottom:20px`)}>Explore</div>
          {SUBNAV.map(([label, href]) => (
            <a key={href} href={href} style={css(`display:block;color:#dcdbd8;${TYPE.bodyM};margin-bottom:12px`)} data-h="workshop-15">{label}</a>
          ))}
        </div>
        <div>
          <div style={css(`color:#6e6d6a;${TYPE.label};margin-bottom:20px`)}>Account</div>
          <a href="/dashboard" style={css(`display:block;color:#dcdbd8;${TYPE.bodyM};margin-bottom:14px`)} data-h="workshop-16">Dashboard</a>
          <button type="button" onClick={v.onSignOut} style={css(`display:block;color:#dcdbd8;${TYPE.bodyM};background:none;border:none;padding:0;cursor:pointer;font-family:inherit`)} data-h="workshop-17">Sign out</button>
        </div>
      </div>
      <div style={css(`border-top:1px solid var(--border);padding-top:28px;display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;color:#6e6d6a;${TYPE.bodyS}`)}>
        <span>© 2026 RPS Cohorts · Made with love and a lot of procrastination</span>
        <span>@rps.cohorts</span>
      </div>
    </div>
  </footer>

</div>
  );
}
