'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useDcLogic, css } from '@/lib/dc';
import Logic from '@/lib/logic/workshop';
import { createClient } from '@/lib/supabase/client';

export default function WorkshopClient({ name, email, avatarUrl, initials }) {
  const router = useRouter();
  const supabase = createClient();

  const onSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
    router.refresh();
  };

  const v = useDcLogic(Logic, { name, email, avatarUrl, initials, onSignOut });
  return (
<div ref={v.setRoot} data-screen-label="Opencanvas — Ship with Claude" style={css(`--bg:#141312;--surface:#1d1c1b;--surface2:#242322;--border:rgba(255,255,255,0.09);--text:#ECEBE9;--muted:#9a9993;--faint:#6e6d6a;--accent:#F5330A;--glow:rgba(150,55,25,0.26);--navbg:rgba(20,19,18,0.82);--footerbg:#0a0a0a;background:var(--bg);color:var(--text);font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif;min-height:100vh`)}>


  <nav style={css(`position:sticky;top:0;z-index:50;background:rgba(19,18,17,0.82);backdrop-filter:blur(16px);border-bottom:1px solid var(--border)`)}>
    <div style={css(`max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,24px);height:68px;display:flex;align-items:center;gap:clamp(16px,3vw,32px)`)}>
      <a href="/dashboard" style={css(`display:flex;align-items:center;gap:10px;color:var(--text);flex:none`)}>
        <img src="/assets/academy-logo-full.png" alt="Academy" style={css(`height:36px;width:auto;object-fit:contain;display:block`)} />
        <span style={css(`font-weight:700;font-size:18px;letter-spacing:-0.02em`)}>Academy</span>
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


  <section style={css(`padding:clamp(28px,4vw,44px) 0 clamp(56px,7vw,88px)`)}>
    <div style={css(`max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,24px)`)}>
      <a href="#" data-reveal style={css(`display:none;align-items:center;gap:9px;color:var(--muted);font-size:15px;margin-bottom:28px;transition:color .2s`)} data-h="workshop-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="6" y2="12"/><polyline points="11 6 5 12 11 18"/></svg>
        All workshops
      </a>
      <div className="oc-hero" style={css(`display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(32px,5vw,64px);align-items:start`)}>

        <div className="oc-hero-text" style={css(`min-width:0`)}>
          <div data-reveal style={css(`display:flex;align-items:center;gap:14px;margin-bottom:22px`)}>
              <span style={css(`background:var(--accent);color:#1a0803;font-weight:700;font-size:11px;letter-spacing:0.08em;padding:5px 11px;border-radius:999px`)}>LIVE</span>
              <span style={css(`color:var(--faint);font-weight:600;font-size:12.5px;letter-spacing:0.2em;text-transform:uppercase`)}>Upcoming workshop</span>
            </div>
            <h1 data-reveal data-reveal-delay="60" style={css(`margin:0 0 22px;font-weight:600;font-size:clamp(32px,3.6vw,48px);line-height:1.05;letter-spacing:-0.03em;color:var(--text)`)}>The method behind building stunning landing pages in short time</h1>
            <p data-reveal data-reveal-delay="120" style={css(`margin:0;font-size:clamp(16px,1.3vw,18px);line-height:1.62;color:var(--muted)`)}>netpulse-sol.com is live. It was designed, built and shipped in a single working day, and not because anyone prompted harder. There is a method, worked in a fixed order, and it front-loads the parts most people skip. In 90 minutes we take you through it and build a B2B SaaS landing page with you.</p>
          </div>

        <div data-reveal data-reveal-delay="120" className="oc-hero-card" style={css(`grid-column:1;grid-row:2;background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:clamp(26px,2.4vw,32px)`)}>
          <div style={css(`color:var(--faint);font-weight:600;font-size:11.5px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:12px`)}>When</div>
          <div style={css(`display:flex;align-items:center;gap:11px;color:var(--text);font-weight:600;font-size:16px;margin-bottom:9px`)}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8"><rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><line x1="3" y1="9.5" x2="21" y2="9.5"/><line x1="8" y1="2.5" x2="8" y2="6.5"/><line x1="16" y1="2.5" x2="16" y2="6.5"/></svg>
            Saturday, July 25, 2026
          </div>
          <div style={css(`display:flex;align-items:center;gap:11px;color:var(--text);font-weight:600;font-size:16px`)}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>
            3:00 PM · 90 min
          </div>

          <div style={css(`color:var(--faint);font-weight:600;font-size:11.5px;letter-spacing:0.2em;text-transform:uppercase;margin:26px 0 15px`)}>Trainers</div>
          <div style={css(`display:flex;align-items:center;gap:13px;margin-bottom:14px`)}>
            <span style={css(`width:44px;height:44px;border-radius:999px;overflow:hidden;flex:none;border:1px solid var(--border)`)}><img src="/assets/vineet-avatar.png" alt="Vineet Chopdekar" style={css(`width:100%;height:100%;object-fit:cover;display:block`)} /></span>
            <span><span style={css(`display:block;font-weight:700;font-size:15px;color:var(--text)`)}>Vineet Chopdekar</span><span style={css(`display:block;font-size:13.5px;color:var(--muted)`)}>Principal Designer</span></span>
          </div>
          <div style={css(`display:flex;align-items:center;gap:13px`)}>
            <span style={css(`width:44px;height:44px;border-radius:999px;overflow:hidden;flex:none;border:1px solid var(--border)`)}><img src="/assets/vivin-avatar.png" alt="Vivin Richard" style={css(`width:100%;height:100%;object-fit:cover;display:block`)} /></span>
            <span><span style={css(`display:block;font-weight:700;font-size:15px;color:var(--text)`)}>Vivin Richard</span><span style={css(`display:block;font-size:13.5px;color:var(--muted)`)}>Design Manager</span></span>
          </div>

          <div style={css(`color:var(--faint);font-weight:600;font-size:11.5px;letter-spacing:0.2em;text-transform:uppercase;margin:26px 0 12px`)}>You'll walk away with</div>
          <p style={css(`margin:0;font-size:14.5px;line-height:1.6;color:var(--muted)`)}>A method you can run on any landing page, and a PDF guide to run it again next week.</p>

          <div style={css(`height:1px;background:var(--border);margin:26px 0`)}></div>
          <div style={css(`background:var(--surface2);border:1px solid var(--border);border-radius:16px;padding:18px 18px 20px`)}>
            <div style={css(`display:flex;align-items:center;gap:11px;margin-bottom:10px`)}>
              <img src="/assets/google-meet-logo.png" alt="Google Meet" style={css(`width:26px;height:26px;object-fit:contain;flex:none`)} />
              <span style={css(`font-weight:700;font-size:14.5px;color:var(--text)`)}>Google Meet</span>
            </div>
            <p style={css(`margin:0 0 16px;font-size:13.5px;line-height:1.55;color:var(--muted)`)}>Joining opens when the workshop starts, Jul 31.</p>
            <div style={css(`display:flex;align-items:stretch;gap:10px`)}>
              <a href="https://meet.google.com/landing" target="_blank" rel="noopener" className="btn btn--secondary btn--lg" style={css(`flex:1;min-width:0`)}>
                <img src="/assets/google-meet-logo.png" alt="" style={css(`width:18px;height:18px;object-fit:contain;flex:none`)} />
                Join Meet
              </a>
              <span title="Time until the workshop starts" style={css(`flex:none;display:inline-flex;align-items:center;gap:7px;padding:0 14px;border-radius:12px;background:var(--surface);border:1px solid var(--border);color:var(--text);font-weight:700;font-size:14px;font-variant-numeric:tabular-nums;white-space:nowrap`)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="8"/><polyline points="12 9 12 13 14.5 14.5"/><line x1="9" y1="1.5" x2="15" y2="1.5"/><line x1="12" y1="1.5" x2="12" y2="4"/></svg>
                {v.countdown}
              </span>
            </div>
          </div>
        </div>

        <div data-reveal data-reveal-delay="80" className="oc-hero-img" style={css(`grid-column:2;grid-row:1 / span 2;align-self:stretch;position:relative;border-radius:18px;overflow:hidden;border:1px solid var(--border);min-height:440px`)}>
                    <picture>
            <source media="(max-width:820px)" srcSet="/assets/hero-16x9.png" />
            <img src="/assets/hero-9hours.png" alt="We built a complete live website in 9 hours" style={css(`position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block`)} />
          </picture>
        </div>
      </div>
    </div>
  </section>


  <div className="oc-rail" style={css(`max-width:960px;margin:0 auto;padding:0 clamp(16px,3vw,24px)`)}>
    <div style={css(`min-width:0`)}>

  <section style={css(`padding:clamp(52px,7vw,84px) 0 0`)}>

      <div style={css(`min-width:0`)}>
        <div data-reveal style={css(`color:var(--faint);font-weight:600;font-size:12.5px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:18px`)}>What you'll do</div>
        <h2 data-reveal data-reveal-delay="60" style={css(`margin:0 0 22px;font-weight:800;font-size:clamp(30px,3.6vw,46px);line-height:1.04;letter-spacing:-0.025em`)}>One brief, one method, 90 minutes.</h2>
        <p data-reveal data-reveal-delay="120" style={css(`margin:0 0 clamp(32px,4vw,44px);font-size:clamp(16px,1.25vw,18px);line-height:1.65;color:var(--muted);max-width:600px`)}>Everyone gets the same brief, a B2B SaaS product landing page, the same kind of job NetPulse was. We run the method end to end in front of you, in the order it has to happen, and you build alongside us. Most people open a tool and start prompting. We start somewhere else, and that is most of the reason the page ships in a day instead of a fortnight.</p>


        <div style={css(`display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:22px;margin-bottom:clamp(36px,4vw,48px)`)}>
          <div data-reveal style={css(`display:flex;flex-direction:column;gap:10px`)}>
            <span style={css(`width:38px;height:38px;border-radius:11px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center`)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg></span>
            <span style={css(`font-weight:700;font-size:15.5px;color:var(--text)`)}>Live build</span>
            <span style={css(`font-size:14px;line-height:1.5;color:var(--muted)`)}>Real time, alongside the host, on your own machine.</span>
          </div>
          <div data-reveal data-reveal-delay="80" style={css(`display:flex;flex-direction:column;gap:10px`)}>
            <span style={css(`width:38px;height:38px;border-radius:11px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center`)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>
            <span style={css(`font-weight:700;font-size:15.5px;color:var(--text)`)}>The toolkit</span>
            <span style={css(`font-size:14px;line-height:1.5;color:var(--muted)`)}>Claude Code, shadcn and 21st.dev, Vercel. What each is for, and what you can skip.</span>
          </div>
          <div data-reveal data-reveal-delay="160" style={css(`display:flex;flex-direction:column;gap:10px`)}>
            <span style={css(`width:38px;height:38px;border-radius:11px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center`)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
            <span style={css(`font-weight:700;font-size:15.5px;color:var(--text)`)}>Live Q&amp;A</span>
            <span style={css(`font-size:14px;line-height:1.5;color:var(--muted)`)}>Get unstuck while you build, not a week later.</span>
          </div>
        </div>


        <div data-reveal style={css(`display:flex;gap:16px;padding:20px 0;border-top:1px solid var(--border)`)}><span style={css(`width:26px;height:26px;flex:none;border-radius:999px;background:var(--accent);display:flex;align-items:center;justify-content:center`)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 13 10 18 19 6"/></svg></span><span style={css(`font-size:clamp(15px,1.2vw,17px);color:var(--text);line-height:1.45`)}>The method, in the order that makes it work.</span></div>
        <div data-reveal data-reveal-delay="70" style={css(`display:flex;gap:16px;padding:20px 0;border-top:1px solid var(--border)`)}><span style={css(`width:26px;height:26px;flex:none;border-radius:999px;background:var(--accent);display:flex;align-items:center;justify-content:center`)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 13 10 18 19 6"/></svg></span><span style={css(`font-size:clamp(15px,1.2vw,17px);color:var(--text);line-height:1.45`)}>Where the tools earn their keep, and where they get in the way.</span></div>
        <div data-reveal data-reveal-delay="140" style={css(`display:flex;gap:16px;padding:20px 0;border-top:1px solid var(--border)`)}><span style={css(`width:26px;height:26px;flex:none;border-radius:999px;background:var(--accent);display:flex;align-items:center;justify-content:center`)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 13 10 18 19 6"/></svg></span><span style={css(`font-size:clamp(15px,1.2vw,17px);color:var(--text);line-height:1.45`)}>Prompts that hold up, and the moments you take the keyboard back.</span></div>
        <div data-reveal data-reveal-delay="210" style={css(`display:flex;gap:16px;padding:20px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)`)}><span style={css(`width:26px;height:26px;flex:none;border-radius:999px;background:var(--accent);display:flex;align-items:center;justify-content:center`)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 13 10 18 19 6"/></svg></span><span style={css(`font-size:clamp(15px,1.2vw,17px);color:var(--text);line-height:1.45`)}>Deploy, so the page ends at a URL and not on localhost.</span></div>

        <p data-reveal style={css(`margin:28px 0 0;font-size:clamp(15px,1.2vw,17px);line-height:1.65;color:var(--muted);max-width:640px`)}>This room will be mixed. Some of you live in a terminal, some have never opened one. We pace for the middle and nothing is assumed out loud. If you can read a Figma file you can follow this.</p>

        <div data-reveal style={css(`margin-top:28px;position:relative;overflow:hidden;display:flex;gap:16px;background:linear-gradient(135deg,rgba(245,60,20,0.09),var(--surface) 55%);border:1px solid rgba(255,120,60,0.22);border-radius:16px;padding:22px 24px`)}>
          <span style={css(`flex:none;width:36px;height:36px;border-radius:10px;background:rgba(245,60,20,0.14);border:1px solid rgba(255,120,60,0.3);display:flex;align-items:center;justify-content:center`)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="8" x2="12" y2="13"/><circle cx="12" cy="16.3" r="0.6" fill="var(--accent)" stroke="none"/><circle cx="12" cy="12" r="9"/></svg></span>
          <p style={css(`margin:0;font-size:14.5px;line-height:1.6;color:var(--muted)`)}><span style={css(`color:var(--text);font-weight:700`)}>Honest note</span> — Different machines, different agents, different usage limits. Some of you will finish in the room, some will be halfway. Both are fine. The method is the thing you came for, and you leave with everything you need to finish on your own time.</p>
        </div>
      </div>
  </section>


  <section style={css(`position:relative;border-top:1px solid var(--border);padding:clamp(64px,9vw,104px) 0;overflow:hidden`)}>
    <div style={css(`position:relative;display:flex;flex-direction:column;gap:clamp(32px,4vw,48px)`)}>
      <div data-reveal style={css(`max-width:640px`)}>
        <div style={css(`color:var(--faint);font-weight:600;font-size:12.5px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:18px`)}>Who this is for</div>
        <h2 style={css(`margin:0;font-weight:800;font-size:clamp(30px,3.6vw,46px);line-height:1.04;letter-spacing:-0.025em`)}>Built for designers who want to ship, not just spec.</h2>
      </div>
      <div className="oc-whogrid" style={css(`display:grid;grid-template-columns:repeat(2,1fr);gap:18px`)}>
        <div data-reveal style={css(`display:flex;flex-direction:column;gap:14px;background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:clamp(22px,2vw,28px);transition:border-color .25s,transform .25s`)} data-h="workshop-4">
          <span style={css(`width:44px;height:44px;flex:none;border-radius:12px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center`)}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h7l-1 8 11-13h-7z"/></svg></span>
          <div>
            <h3 style={css(`margin:0 0 6px;font-weight:700;font-size:17px;color:var(--text)`)}>Product Designers</h3>
            <p style={css(`margin:0;font-size:14.5px;line-height:1.55;color:var(--muted)`)}>Stop handing the landing page off and waiting a sprint for it.</p>
          </div>
        </div>
        <div data-reveal data-reveal-delay="80" style={css(`display:flex;flex-direction:column;gap:14px;background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:clamp(22px,2vw,28px);transition:border-color .25s,transform .25s`)} data-h="workshop-5">
          <span style={css(`width:44px;height:44px;flex:none;border-radius:12px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center`)}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg></span>
          <div>
            <h3 style={css(`margin:0 0 6px;font-weight:700;font-size:17px;color:var(--text)`)}>UI &amp; Visual Designers</h3>
            <p style={css(`margin:0;font-size:14.5px;line-height:1.55;color:var(--muted)`)}>Take the layout in your head to a live, responsive page without a front-end dev in the loop.</p>
          </div>
        </div>
        <div data-reveal data-reveal-delay="160" style={css(`display:flex;flex-direction:column;gap:14px;background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:clamp(22px,2vw,28px);transition:border-color .25s,transform .25s`)} data-h="workshop-6">
          <span style={css(`width:44px;height:44px;flex:none;border-radius:12px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center`)}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/></svg></span>
          <div>
            <h3 style={css(`margin:0 0 6px;font-weight:700;font-size:17px;color:var(--text)`)}>Founders &amp; solo builders</h3>
            <p style={css(`margin:0;font-size:14.5px;line-height:1.55;color:var(--muted)`)}>You need a marketing site, you do not have a team, and you do not have a month.</p>
          </div>
        </div>
        <div data-reveal data-reveal-delay="240" style={css(`display:flex;flex-direction:column;gap:14px;background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:clamp(22px,2vw,28px);transition:border-color .25s,transform .25s`)} data-h="workshop-7">
          <span style={css(`width:44px;height:44px;flex:none;border-radius:12px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center`)}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/></svg></span>
          <div>
            <h3 style={css(`margin:0 0 6px;font-weight:700;font-size:17px;color:var(--text)`)}>AI-curious designers</h3>
            <p style={css(`margin:0;font-size:14.5px;line-height:1.55;color:var(--muted)`)}>You have opened an AI agent, prompted a bit, and drifted. Leave with a method that holds.</p>
          </div>
        </div>
      </div>
    </div>
  </section>


  <section style={css(`border-top:1px solid var(--border);padding:clamp(64px,9vw,104px) 0`)}>
    <div data-reveal style={css(`max-width:640px;margin-bottom:clamp(32px,4vw,44px)`)}>
      <div style={css(`color:var(--faint);font-weight:600;font-size:12.5px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:18px`)}>Agenda</div>
      <h2 style={css(`margin:0 0 18px;font-weight:800;font-size:clamp(30px,3.6vw,46px);line-height:1.04;letter-spacing:-0.025em`)}>90 minutes, brief to browser.</h2>
      <p style={css(`margin:0;font-size:clamp(15px,1.2vw,17px);line-height:1.6;color:var(--muted)`)}>One focused session, run as a single continuous build on a shared brief. It is recorded, so you can revisit it, catch up if you miss it live, or replay a step while you finish your own page.</p>
    </div>

    <div data-reveal data-reveal-delay="80" style={css(`border:1px solid var(--border);border-radius:20px;padding:clamp(22px,2.4vw,30px)`)}>
      <div style={css(`font-weight:700;font-size:17px;color:var(--text);margin-bottom:20px`)}>Next live session</div>
      <div style={css(`display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:28px`)}>
        <div style={css(`padding:18px 22px;border-right:1px solid var(--border)`)}><div style={css(`color:var(--faint);font-size:13px;margin-bottom:6px`)}>Date</div><div style={css(`font-weight:700;font-size:17px;color:var(--text)`)}>Jul 25</div></div>
        <div style={css(`padding:18px 22px;border-right:1px solid var(--border)`)}><div style={css(`color:var(--faint);font-size:13px;margin-bottom:6px`)}>Live class</div><div style={css(`font-size:17px;color:var(--text)`)}><span style={css(`font-weight:700`)}>Sat</span> 3:00 PM</div></div>
        <div style={css(`padding:18px 22px`)}><div style={css(`color:var(--faint);font-size:13px;margin-bottom:6px`)}>Duration</div><div style={css(`font-size:17px;color:var(--text)`)}><span style={css(`font-weight:700`)}>90</span> min</div></div>
      </div>

      <div style={css(`display:flex;align-items:center;justify-content:space-between;margin-bottom:16px`)}>
        <div style={css(`font-weight:700;font-size:16px;color:var(--text)`)}>The build, live</div>
        <div style={css(`color:var(--faint);font-weight:600;font-size:12.5px;letter-spacing:0.14em;text-transform:uppercase`)}>90 min</div>
      </div>
      <div style={css(`display:flex;flex-direction:column;gap:12px`)}>
        <div data-reveal className="oc-arow" style={css(`display:flex;align-items:center;gap:16px;border:1px solid var(--border);border-radius:14px;padding:16px 18px;transition:border-color .2s`)} data-h="workshop-8">
          <span style={css(`width:34px;height:34px;flex:none;border-radius:9px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:var(--muted)`)}>01</span>
          <span style={css(`flex:none;color:var(--accent)`)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>
          <span className="oc-atitle" style={css(`flex:1 1 auto;min-width:0;font-weight:600;font-size:16px;color:var(--text)`)}>9 hours: where they actually went</span>
          <span className="oc-ameta" style={css(`display:inline-flex;align-items:center;gap:12px;flex:none`)}><span className="oc-atime" style={css(`flex:none;color:var(--faint);font-size:13.5px`)}>0–10 min</span>
          <span style={css(`flex:none;display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--faint);background:var(--surface2);border:1px solid var(--border);padding:4px 10px;border-radius:999px`)}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/></svg>Segment</span></span>
        </div>
        <div data-reveal data-reveal-delay="60" className="oc-arow" style={css(`display:flex;align-items:center;gap:16px;border:1px solid var(--border);border-radius:14px;padding:16px 18px;transition:border-color .2s`)} data-h="workshop-9">
          <span style={css(`width:34px;height:34px;flex:none;border-radius:9px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:var(--muted)`)}>02</span>
          <span style={css(`flex:none;color:var(--accent)`)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span>
          <span className="oc-atitle" style={css(`flex:1 1 auto;min-width:0;font-weight:600;font-size:16px;color:var(--text)`)}>Groundwork, before anything gets built</span>
          <span className="oc-ameta" style={css(`display:inline-flex;align-items:center;gap:12px;flex:none`)}><span className="oc-atime" style={css(`flex:none;color:var(--faint);font-size:13.5px`)}>10–25 min</span>
          <span style={css(`flex:none;display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--faint);background:var(--surface2);border:1px solid var(--border);padding:4px 10px;border-radius:999px`)}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/></svg>Segment</span></span>
        </div>
        <div data-reveal data-reveal-delay="120" className="oc-arow" style={css(`display:flex;align-items:center;gap:16px;border:1px solid var(--border);border-radius:14px;padding:16px 18px;transition:border-color .2s`)} data-h="workshop-10">
          <span style={css(`width:34px;height:34px;flex:none;border-radius:9px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:var(--muted)`)}>03</span>
          <span style={css(`flex:none;color:var(--accent)`)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg></span>
          <span className="oc-atitle" style={css(`flex:1 1 auto;min-width:0;font-weight:600;font-size:16px;color:var(--text)`)}>The blueprint</span>
          <span className="oc-ameta" style={css(`display:inline-flex;align-items:center;gap:12px;flex:none`)}><span className="oc-atime" style={css(`flex:none;color:var(--faint);font-size:13.5px`)}>25–45 min</span>
          <span style={css(`flex:none;display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--faint);background:var(--surface2);border:1px solid var(--border);padding:4px 10px;border-radius:999px`)}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/></svg>Segment</span></span>
        </div>
        <div data-reveal data-reveal-delay="180" className="oc-arow" style={css(`display:flex;align-items:center;gap:16px;border:1px solid var(--border);border-radius:14px;padding:16px 18px;transition:border-color .2s`)} data-h="workshop-11">
          <span style={css(`width:34px;height:34px;flex:none;border-radius:9px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:var(--muted)`)}>04</span>
          <span style={css(`flex:none;color:var(--accent)`)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17l6-6-6-6"/><line x1="12" y1="19" x2="20" y2="19"/></svg></span>
          <span className="oc-atitle" style={css(`flex:1 1 auto;min-width:0;font-weight:600;font-size:16px;color:var(--text)`)}>Execute: Claude Code, shadcn, 21st.dev</span>
          <span className="oc-ameta" style={css(`display:inline-flex;align-items:center;gap:12px;flex:none`)}><span className="oc-atime" style={css(`flex:none;color:var(--faint);font-size:13.5px`)}>45–75 min</span><span style={css(`flex:none;display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--faint);background:var(--surface2);border:1px solid var(--border);padding:4px 10px;border-radius:999px`)}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/></svg>Segment</span></span>
        </div>
        <div data-reveal data-reveal-delay="240" className="oc-arow" style={css(`display:flex;align-items:center;gap:16px;border:1px solid var(--border);border-radius:14px;padding:16px 18px;transition:border-color .2s`)} data-h="workshop-12">
          <span style={css(`width:34px;height:34px;flex:none;border-radius:9px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:var(--muted)`)}>05</span>
          <span style={css(`flex:none;color:var(--accent)`)}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
          <span className="oc-atitle" style={css(`flex:1 1 auto;min-width:0;font-weight:600;font-size:16px;color:var(--text)`)}>Ship on Vercel, the guide, and Q&amp;A</span>
          <span className="oc-ameta" style={css(`display:inline-flex;align-items:center;gap:12px;flex:none`)}><span className="oc-atime" style={css(`flex:none;color:var(--faint);font-size:13.5px`)}>75–90 min</span>
          <span style={css(`flex:none;display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--faint);background:var(--surface2);border:1px solid var(--border);padding:4px 10px;border-radius:999px`)}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/></svg>Segment</span></span>
        </div>
      </div>
    </div>
  </section>
    </div>

  </div>


  <section style={css(`position:relative;border-top:1px solid var(--border);padding:clamp(64px,9vw,104px) 0;overflow:hidden`)}>
    {v.warmGlow && (<><div style={css(`position:absolute;inset:0;background:radial-gradient(85% 130% at 10% -5%,var(--glow),transparent 52%);pointer-events:none`)}></div></>)}
    <div style={css(`position:relative;max-width:1280px;margin:0 auto;padding:0 clamp(16px,3vw,24px)`)}>
      <div data-reveal style={css(`color:var(--faint);font-weight:600;font-size:12.5px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:18px`)}>Your trainers</div>
      <h2 data-reveal data-reveal-delay="60" style={css(`margin:0 0 clamp(40px,5vw,56px);font-weight:800;font-size:clamp(30px,4vw,52px);line-height:1.04;letter-spacing:-0.025em;max-width:720px`)}>Learn from the people who <span style={css(`background:linear-gradient(115deg,#FF6A3D,#F5330A);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent`)}>do this daily</span>.</h2>
      <div style={css(`display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:clamp(24px,3vw,40px);max-width:820px`)}>
        <div data-reveal>
          <div style={css(`aspect-ratio:4/5;border-radius:18px;overflow:hidden;border:1px solid var(--border);margin-bottom:20px`)}><img src="/assets/vineet.png" alt="Vineet Chopdekar" style={css(`width:100%;height:100%;object-fit:cover;display:block`)} /></div>
          <div style={css(`color:var(--faint);font-weight:600;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:10px`)}>Principal Designer</div>
          <h3 style={css(`margin:0 0 10px;font-weight:700;font-size:24px;letter-spacing:-0.02em;color:var(--text)`)}>Vineet Chopdekar</h3>
          <p style={css(`margin:0;font-size:15.5px;line-height:1.6;color:var(--muted);max-width:420px`)}>15+ years shipping product &amp; brand work; leads craft at RPS Studio.</p>
        </div>
        <div data-reveal data-reveal-delay="100">
          <div style={css(`aspect-ratio:4/5;border-radius:18px;overflow:hidden;border:1px solid var(--border);margin-bottom:20px`)}><img src="/assets/vivin.png" alt="Vivin Richard" style={css(`width:100%;height:100%;object-fit:cover;display:block`)} /></div>
          <div style={css(`color:var(--faint);font-weight:600;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:10px`)}>Design Manager</div>
          <h3 style={css(`margin:0 0 10px;font-weight:700;font-size:24px;letter-spacing:-0.02em;color:var(--text)`)}>Vivin Richard</h3>
          <p style={css(`margin:0;font-size:15.5px;line-height:1.6;color:var(--muted);max-width:420px`)}>Runs the community program and mentors early-career designers.</p>
        </div>
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
      <div className="oc-footgrid" style={css(`display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:40px;margin-bottom:clamp(48px,6vw,72px)`)} data-reveal>
        <div style={css(`min-width:240px`)}>
          <h3 style={css(`margin:0 0 14px;font-weight:800;font-size:clamp(22px,2vw,26px);letter-spacing:-0.02em;color:#f2f1ef`)}>Follow what we're building.</h3>
          <p style={css(`margin:0 0 26px;font-size:15px;line-height:1.55;color:#8f8e8a;max-width:340px`)}>Quiet weekly notes — new workshops, assignments, and what the community shipped.</p>
          <a href="#" className="btn btn--secondary btn--md">Become a member</a>
        </div>
        <div>
          <div style={css(`color:#6e6d6a;font-weight:600;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:20px`)}>Community</div>
          <a href="#" style={css(`display:block;color:#dcdbd8;font-size:15.5px`)} data-h="workshop-14">Workshops</a>
        </div>
        <div>
          <div style={css(`color:#6e6d6a;font-weight:600;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:20px`)}>Account</div>
          <a href="/dashboard" style={css(`display:block;color:#dcdbd8;font-size:15.5px;margin-bottom:14px`)} data-h="workshop-15">Dashboard</a>
          <button type="button" onClick={v.onSignOut} style={css(`display:block;color:#dcdbd8;font-size:15.5px;background:none;border:none;padding:0;cursor:pointer;font-family:inherit`)} data-h="workshop-16">Sign out</button>
        </div>
      </div>
      <div style={css(`border-top:1px solid var(--border);padding-top:28px;display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;color:#6e6d6a;font-size:14px`)}>
        <span>© 2026 Academy · Made with care, in public.</span>
        <span>@academy.community</span>
      </div>
    </div>
  </footer>

</div>
  );
}
