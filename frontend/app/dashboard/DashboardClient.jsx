'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useDcLogic, css } from '@/lib/dc';
import Logic from '@/lib/logic/dashboard';
import { createClient } from '@/lib/supabase/client';
import { TYPE, SESSION, WORKSHOP } from '@/lib/workshop-content';

export default function DashboardClient({ name, email, avatarUrl, initials, firstName }) {
  const router = useRouter();
  const supabase = createClient();

  const onSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
    router.refresh();
  };

  const v = useDcLogic(Logic, { name, email, avatarUrl, initials, firstName, onSignOut });
  return (
<div data-screen-label="Dashboard" style={css(`--bg:#131211;--surface:#1c1b1a;--surface2:#232220;--border:rgba(255,255,255,0.09);--text:#ECEBE9;--muted:#9a9993;--faint:#6e6d6a;--accent:#F5330A;--green:#3ecf8e;font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif;background:var(--bg);color:var(--text);min-height:100vh`)}>


  <nav style={css(`position:sticky;top:0;z-index:50;background:rgba(19,18,17,0.82);backdrop-filter:blur(16px);border-bottom:1px solid var(--border)`)}>
    <div style={css(`max-width:1160px;margin:0 auto;padding:0 clamp(16px,3vw,24px);height:68px;display:flex;align-items:center;gap:clamp(16px,3vw,32px)`)}>
      <a href="/" style={css(`display:flex;align-items:center;gap:10px;color:var(--text);flex:none`)}>
        <img src="/assets/academy-logo-full.png" alt="Cohorts" style={css(`height:36px;width:auto;object-fit:contain;display:block`)} />
        <span style={css(`font-weight:700;font-size:18px;letter-spacing:-0.02em`)}>Cohorts</span>
      </a>
      <div style={css(`flex:1 1 auto`)}></div>
      <div style={css(`display:flex;align-items:center;gap:12px;flex:none`)}>
        <button type="button" aria-label="Theme" style={css(`display:none;width:38px;height:38px;border-radius:999px;background:var(--surface);border:1px solid var(--border);color:var(--muted);align-items:center;justify-content:center;cursor:pointer;transition:border-color .2s,color .2s`)} data-h="dashboard-0"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.2" y1="19.8" x2="5.6" y2="18.4"/><line x1="18.4" y1="5.6" x2="19.8" y2="4.2"/></svg></button>
      <div ref={v.setMenuWrap} style={css(`position:relative;flex:none`)}>
        <button type="button" onClick={v.toggleMenu} aria-haspopup="true" aria-label="Open profile menu" style={css(`display:block;width:34px;height:34px;border-radius:999px;overflow:hidden;padding:0;border:1px solid var(--border);background:var(--surface2);cursor:pointer;transition:box-shadow .2s,border-color .2s`)} data-h="dashboard-1">
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
                  <button type="button" onClick={v.onEdit} aria-label="Change photo" title="Change photo" style={css(`width:32px;height:32px;border-radius:999px;border:1px solid rgba(255,255,255,0.28);background:rgba(255,255,255,0.14);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s`)} data-h="dashboard-2"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></button>
                  <button type="button" onClick={v.onDelete} aria-label="Remove photo" title="Remove photo" style={css(`width:32px;height:32px;border-radius:999px;border:1px solid rgba(255,255,255,0.28);background:rgba(255,255,255,0.14);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s`)} data-h="dashboard-3"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
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

  <div style={css(`max-width:1160px;margin:0 auto;padding:clamp(32px,5vw,52px) clamp(16px,3vw,24px) 80px`)}>


    <div className="db-rise" style={css(`margin-bottom:clamp(36px,4.5vw,52px)`)}>
      <div style={css(`color:var(--faint);font-weight:600;font-size:12.5px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:14px`)}>Dashboard</div>
      <h1 style={css(`margin:0 0 12px;font-weight:800;font-size:clamp(34px,5vw,60px);line-height:1.0;letter-spacing:-0.035em`)}>Welcome back, <span style={css(`background:linear-gradient(100deg,#FF6A38,#F5330A);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent`)}>{v.firstName}</span>.</h1>
      <p style={css(`margin:0;font-size:clamp(16px,1.3vw,18px);color:var(--muted)`)}>Your enrolled workshops, assignments, and assessment status — all in one place.</p>
    </div>


    {/* Tabs: Upcoming | Past. Past is empty until a session wraps and its
        recording is added — see the empty state below. */}
    <div className="db-rise" style={css(`animation-delay:.05s;display:flex;align-items:center;gap:8px;margin-bottom:24px`)}>
      {[['upcoming', 'Upcoming'], ['past', 'Past']].map(([key, label]) => {
        const active = v.tab === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => v.setTab(key)}
            style={css(`display:inline-flex;align-items:center;gap:8px;padding:9px 18px;border-radius:999px;font-weight:600;${TYPE.bodyS};cursor:pointer;font-family:inherit;transition:color .2s,background .2s,border-color .2s;border:1px solid ${active ? 'var(--border)' : 'transparent'};background:${active ? 'var(--surface2)' : 'transparent'};color:${active ? 'var(--text)' : 'var(--muted)'}`)}
            data-h="dashboard-8"
          >
            {label}
          </button>
        );
      })}
    </div>

    {v.tab === 'upcoming' && (
    <div style={css(`display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-bottom:clamp(40px,5vw,60px)`)}>
      <a href={WORKSHOP.href} className="db-rise wcard" style={css(`display:block;color:inherit;text-decoration:none;animation-delay:.1s;background:var(--surface);border:1px solid var(--border);border-radius:20px;overflow:hidden;transition:border-color .25s,transform .25s,box-shadow .25s`)} data-h="dashboard-4">
        <div className="wcover" style={css(`position:relative;aspect-ratio:16/9;background:linear-gradient(135deg,#2a1109,#140b07);border-bottom:1px solid var(--border)`)}><img src={WORKSHOP.cover} alt="" style={css(`position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.9`)} />
          <span style={css(`position:absolute;top:14px;right:14px;z-index:2;display:inline-flex;align-items:center;gap:6px;background:rgba(10,6,4,0.62);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.14);color:#fff;${TYPE.bodyS};font-weight:600;padding:6px 12px;border-radius:999px`)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="13" r="8"/><polyline points="12 9 12 13 14.5 14.5"/><line x1="9" y1="1.5" x2="15" y2="1.5"/><line x1="12" y1="1.5" x2="12" y2="4"/></svg>{v.countdown}</span>
        </div>
        <div style={css(`padding:24px`)}>
          <div style={css(`display:flex;align-items:center;gap:14px;margin-bottom:14px`)}>
            <span style={css(`background:var(--accent);color:#1a0803;font-weight:700;font-size:10.5px;letter-spacing:0.08em;padding:4px 10px;border-radius:999px`)}>UPCOMING</span>
            <span style={css(`display:inline-flex;align-items:center;gap:6px;color:var(--muted);${TYPE.bodyS};font-weight:500`)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><line x1="3" y1="9.5" x2="21" y2="9.5"/></svg>{SESSION.dateCompact}</span>
            <span style={css(`display:inline-flex;align-items:center;gap:6px;color:var(--muted);${TYPE.bodyS};font-weight:500`)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>{SESSION.time}</span>
          </div>
          <h3 style={css(`margin:0 0 10px;${TYPE.headingXS};color:var(--text)`)}>{WORKSHOP.title}</h3>
          <p style={css(`margin:0;${TYPE.bodyM};color:var(--muted)`)}>{WORKSHOP.blurb}</p>
        </div>
      </a>
      <div className="db-rise wcard" style={css(`animation-delay:.16s;position:relative;overflow:hidden;background:linear-gradient(150deg,rgba(245,60,20,0.10),var(--surface) 55%);border:1px solid rgba(255,120,60,0.22);border-radius:20px;display:flex;flex-direction:column;align-items:flex-start;text-align:left;justify-content:center;padding:36px 28px;min-height:100%`)}>
        <div aria-hidden="true" style={css(`position:absolute;top:-30%;right:-20%;width:70%;height:70%;background:radial-gradient(circle,rgba(245,60,20,0.20),transparent 65%);pointer-events:none`)}></div>
        <div aria-hidden="true" style={css(`position:absolute;bottom:-25%;left:-15%;width:55%;height:55%;background:radial-gradient(circle,rgba(245,60,20,0.10),transparent 65%);pointer-events:none`)}></div>
        <span style={css(`position:relative;width:56px;height:56px;border-radius:16px;background:rgba(245,60,20,0.14);border:1px solid rgba(255,120,60,0.32);display:flex;align-items:center;justify-content:center;margin-bottom:20px`)}><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.2 4.9 5.3.5-4 3.6 1.2 5.2L12 15l-4.7 2.7 1.2-5.2-4-3.6 5.3-.5z"/></svg></span>
        <span style={css(`position:relative;display:inline-block;color:var(--accent);${TYPE.label};font-size:11px;letter-spacing:0.16em;margin-bottom:12px`)}>Coming soon</span>
        <h3 style={css(`position:relative;margin:0 0 10px;${TYPE.headingS};color:var(--text)`)}>More workshops on the way</h3>
        <p style={css(`position:relative;margin:0 0 20px;${TYPE.bodyM};color:var(--muted);max-width:320px`)}>New live sessions with industry experts are being lined up. Check back soon — or get notified when the next one drops.</p>
        <span style={css(`position:relative;display:inline-flex;align-items:center;gap:7px;${TYPE.bodyS};font-weight:600;color:var(--text);background:var(--surface2);border:1px solid var(--border);padding:9px 16px;border-radius:999px`)}><span style={css(`width:7px;height:7px;border-radius:999px;background:var(--accent)`)}></span>Notify me</span>
      </div>
    </div>
    )}

    {v.tab === 'past' && (
    <div className="db-rise" style={css(`margin-bottom:clamp(40px,5vw,60px)`)}>
      <div style={css(`display:flex;flex-direction:column;align-items:flex-start;text-align:left;background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:clamp(32px,4vw,48px)`)}>
        <span style={css(`width:52px;height:52px;border-radius:14px;background:var(--surface2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;margin-bottom:20px`)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2.5"/><polygon points="10 9 15 12 10 15 10 9" fill="var(--muted)" stroke="none"/></svg></span>
        <h3 style={css(`margin:0 0 10px;${TYPE.headingS};color:var(--text)`)}>No past workshops yet</h3>
        <p style={css(`margin:0;${TYPE.bodyM};color:var(--muted);max-width:440px`)}>Once a session wraps, its recording lands here so you can rewatch any step, anytime.</p>
      </div>
    </div>
    )}

    {/*
      NOTE: The assignment submit-link form is intentionally not rendered in this
      design. Its Supabase backend is preserved and dormant:
      app/dashboard/actions.js (submitAssignment server action) + the `submissions`
      table. To re-enable, render a form here and call submitAssignment({ link, note }).
      The logic class still exposes v.link / v.note / v.onLink / v.onNote /
      v.onSubmit / v.onReset / v.submitClass / v.submitDisabled.
    */}
  </div>


  <footer style={css(`background:var(--footerbg,#0a0a0a);border-top:1px solid var(--border);padding:clamp(56px,7vw,88px) 0 40px;margin-top:clamp(40px,5vw,64px)`)}>
    <div style={css(`max-width:1160px;margin:0 auto;padding:0 clamp(16px,3vw,24px)`)}>
      <div className="db-footgrid" style={css(`display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:40px;margin-bottom:clamp(48px,6vw,72px)`)}>
        <div style={css(`min-width:240px`)}>
          <h3 style={css(`margin:0 0 14px;${TYPE.displayM};color:#f2f1ef`)}>Where designers learn to ship.</h3>
          <p style={css(`margin:0;${TYPE.bodyM};color:#8f8e8a;max-width:340px`)}>We teach design in the open. The goal is a next generation of designers who ship real work with AI.</p>
        </div>
        <div>
          <div style={css(`color:#6e6d6a;${TYPE.label};margin-bottom:20px`)}>Cohorts</div>
          <a href="/workshop" style={css(`display:block;color:#dcdbd8;${TYPE.bodyM}`)} data-h="dashboard-5">Workshops</a>
        </div>
        <div>
          <div style={css(`color:#6e6d6a;${TYPE.label};margin-bottom:20px`)}>Account</div>
          <a href="/dashboard" style={css(`display:block;color:#dcdbd8;${TYPE.bodyM};margin-bottom:14px`)} data-h="dashboard-6">Dashboard</a>
          <button type="button" onClick={v.onSignOut} style={css(`display:block;color:#dcdbd8;${TYPE.bodyM};background:none;border:none;padding:0;cursor:pointer;font-family:inherit`)} data-h="dashboard-7">Sign out</button>
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
