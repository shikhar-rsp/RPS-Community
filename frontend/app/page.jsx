'use client';
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useDcLogic, css } from '@/lib/dc';
import Logic from '@/lib/logic/home';
import Link from 'next/link';
import {
  SESSION, TYPE, Accent, Chevron, HeroBlurb, SUBNAV, PERSONAS, OUTCOMES, SESSION_STEPS, TRAINERS, FAQS,
} from '@/lib/workshop-content';
// TEMPORARY (launch): static import so the warp burst has zero chunk-fetch lag —
// see the effect below for why that lag caused a flash of bare content.
import { fireWarp } from '@/lib/warp';

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

  // TEMPORARY (launch): fire a warp burst when a visitor arrives from the
  // /launch gate (/?launched=1), then strip the param so a refresh won't re-fire.
  // useLayoutEffect (not useEffect) so the canvas mounts and paints before the
  // browser's first paint of this page — otherwise the bare page is visible for
  // a frame before the burst covers it. Combined with the static import above
  // (no chunk-fetch lag) and warp.js's own opaque first-frame fill, this closes
  // every gap that could let the page flash through.
  // Remove this effect, lib/warp.js and app/launch after launch.
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('launched') !== '1') return;
    fireWarp();
    const url = new URL(window.location.href);
    url.searchParams.delete('launched');
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);
  }, []);
  return (
<div ref={v.setRoot} data-screen-label="Opencanvas — Ship with Claude" style={css(`--bg:#141312;--surface:#1d1c1b;--surface2:#242322;--border:rgba(255,255,255,0.09);--text:#ECEBE9;--muted:#9a9993;--faint:#6e6d6a;--accent:#F5330A;--glow:rgba(150,55,25,0.26);--navbg:rgba(20,19,18,0.82);--footerbg:#0a0a0a;background:var(--bg);color:var(--text);font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif;min-height:100vh`)}>


  <nav style={css(`position:sticky;top:0;z-index:50;background:var(--navbg);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--border)`)}>
    <div style={css(`max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,24px);height:68px;display:flex;align-items:center;justify-content:space-between`)}>
      <a href="#" style={css(`display:flex;align-items:center;gap:12px`)}>
        <img src="/assets/academy-logo-full.png" alt="Cohorts" style={css(`height:40px;width:auto;object-fit:contain;display:block`)} />
        <span style={css(`font-weight:700;font-size:20px;letter-spacing:-0.02em;color:var(--text)`)}>Cohorts</span>
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
          <span style={css(`color:var(--faint);${TYPE.label}`)}>{SESSION.dateBadge}</span>
        </div>

        <h1 data-reveal data-reveal-delay="60" style={css(`margin:0 0 22px;max-width:900px;${TYPE.displayXL};color:var(--text)`)}>Ship client-ready websites in <Accent>hours, not months</Accent>.</h1>

        <p data-reveal data-reveal-delay="120" style={css(`margin:0 0 30px;max-width:760px;${TYPE.bodyL};color:var(--muted)`)}><HeroBlurb /></p>

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
        <span style={css(`color:var(--faint);${TYPE.bodyS}`)}>{SESSION.dateShort} · {SESSION.time}</span>
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
        <span>© 2026 RPS Cohorts · Made with love and a lot of procrastination</span>
        <span>@rps.cohorts</span>
      </div>
    </div>
  </footer>

</div>
  );
}
