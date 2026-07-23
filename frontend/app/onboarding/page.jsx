'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDcLogic, css } from '@/lib/dc';
import Logic from '@/lib/logic/onboarding';
import { createClient } from '@/lib/supabase/client';

export default function Page() {
  const router = useRouter();
  const supabase = createClient();

  // Create the Supabase account from the wizard's collected data. Returns
  // { ok, needsConfirm?, error? } for the logic class to render the final step.
  const onFinish = async ({ email, password, name, role, goals, tools }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, goals, tools },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return { ok: false, error: error.message };
    if (data.session) {
      // Email confirmation disabled: sync the trigger-created profile row.
      await supabase.from('profiles').update({ name, role, goals, tools }).eq('id', data.user.id);
      return { ok: true, needsConfirm: false };
    }
    return { ok: true, needsConfirm: true };
  };

  const goDashboard = () => {
    router.push('/dashboard');
    router.refresh();
  };

  const v = useDcLogic(Logic, { onFinish, goDashboard });

  return (
<div data-screen-label="Onboarding" style={css(`--bg:#131211;--surface:#1c1b1a;--surface2:#232220;--border:rgba(255,255,255,0.09);--text:#ECEBE9;--muted:#9a9993;--faint:#6e6d6a;--accent:#F5330A;font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;padding:clamp(28px,5vh,64px) 20px 64px`)}>

  <div aria-hidden="true" style={css(`position:absolute;top:-20%;left:50%;transform:translateX(-50%);width:900px;height:600px;background:radial-gradient(circle,rgba(245,60,20,0.18),transparent 62%);pointer-events:none;filter:blur(8px)`)}></div>
  <div aria-hidden="true" style={css(`position:absolute;bottom:-25%;right:-10%;width:600px;height:600px;background:radial-gradient(circle,rgba(245,60,20,0.10),transparent 65%);pointer-events:none`)}></div>


  <div style={css(`position:relative;width:100%;max-width:600px;margin-bottom:clamp(24px,4vh,40px)`)}>
    <div style={css(`display:flex;align-items:center;gap:10px;margin-bottom:26px`)}>
      <img src="/assets/academy-logo-full.png" alt="Cohorts" style={css(`height:38px;width:auto;object-fit:contain;display:block`)} />
      <span style={css(`font-weight:700;font-size:18px;letter-spacing:-0.02em`)}>Cohorts</span>
    </div>
    <div style={css(`display:flex;gap:8px`)}>
      <div style={css(`flex:1;height:4px;border-radius:999px;background:var(--surface2);overflow:hidden`)}><div style={css(`height:100%;border-radius:999px;background:linear-gradient(90deg,#FF6A38,#F5330A);width:${v.seg1};transition:width .5s cubic-bezier(.22,.9,.3,1)`)}></div></div>
      <div style={css(`flex:1;height:4px;border-radius:999px;background:var(--surface2);overflow:hidden`)}><div style={css(`height:100%;border-radius:999px;background:linear-gradient(90deg,#FF6A38,#F5330A);width:${v.seg2};transition:width .5s cubic-bezier(.22,.9,.3,1)`)}></div></div>
      <div style={css(`flex:1;height:4px;border-radius:999px;background:var(--surface2);overflow:hidden`)}><div style={css(`height:100%;border-radius:999px;background:linear-gradient(90deg,#FF6A38,#F5330A);width:${v.seg3};transition:width .5s cubic-bezier(.22,.9,.3,1)`)}></div></div>
      <div style={css(`flex:1;height:4px;border-radius:999px;background:var(--surface2);overflow:hidden`)}><div style={css(`height:100%;border-radius:999px;background:linear-gradient(90deg,#FF6A38,#F5330A);width:${v.seg4};transition:width .5s cubic-bezier(.22,.9,.3,1)`)}></div></div>
    </div>
  </div>


  {v.isStep1 && (<>
    <div className="ob-card" style={css(`position:relative;width:100%;max-width:600px;background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:clamp(28px,3.5vw,40px);box-shadow:0 30px 80px -30px rgba(0,0,0,0.7)`)}>
      <h1 style={css(`margin:0 0 8px;font-weight:800;font-size:clamp(26px,3vw,34px);letter-spacing:-0.03em`)}>Welcome 👋</h1>
      <p style={css(`margin:0 0 26px;font-size:16px;color:var(--muted)`)}>First, tell us where you are in your design journey.</p>

      <div style={css(`color:var(--faint);font-weight:600;font-size:11.5px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:10px`)}>Your name</div>
      <input type="text" value={v.name} onChange={v.onName} placeholder="What should we call you?" style={css(`width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);font-size:16px;font-family:inherit;padding:15px 16px;border-radius:14px;transition:border-color .2s,box-shadow .2s;margin-bottom:20px`)} />

      <div style={css(`display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-bottom:28px`)}>
        <div>
          <div style={css(`color:var(--faint);font-weight:600;font-size:11.5px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:10px`)}>Email</div>
          <input type="email" value={v.email} onChange={v.onEmail} placeholder="you@studio.com" style={css(`width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);font-size:16px;font-family:inherit;padding:15px 16px;border-radius:14px;transition:border-color .2s,box-shadow .2s`)} />
        </div>
        <div>
          <div style={css(`color:var(--faint);font-weight:600;font-size:11.5px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:10px`)}>Password</div>
          <input type="password" value={v.password} onChange={v.onPassword} placeholder="At least 8 characters" style={css(`width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);font-size:16px;font-family:inherit;padding:15px 16px;border-radius:14px;transition:border-color .2s,box-shadow .2s`)} />
        </div>
      </div>

      <div style={css(`color:var(--faint);font-weight:600;font-size:11.5px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:12px`)}>I am a…</div>
      <div style={css(`display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px`)}>
        <button type="button" onClick={v.selStudent} style={css(`${v.rStudent}`)}>
          <span style={css(`display:flex;align-items:flex-start;gap:14px`)}>
            <span style={css(`${v.iStudent}`)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5"/></svg></span>
            <span><span style={css(`display:block;font-weight:700;font-size:16.5px;color:var(--text);margin-bottom:4px`)}>Design student</span><span style={css(`display:block;font-size:13.5px;line-height:1.45;color:var(--muted)`)}>Learning the craft.</span></span>
          </span>
        </button>
        <button type="button" onClick={v.selSwitcher} style={css(`${v.rSwitcher}`)}>
          <span style={css(`display:flex;align-items:flex-start;gap:14px`)}>
            <span style={css(`${v.iSwitcher}`)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></span>
            <span><span style={css(`display:block;font-weight:700;font-size:16.5px;color:var(--text);margin-bottom:4px`)}>Career switcher</span><span style={css(`display:block;font-size:13.5px;line-height:1.45;color:var(--muted)`)}>Coming from graphic, web, or another field.</span></span>
          </span>
        </button>
        <button type="button" onClick={v.selJunior} style={css(`${v.rJunior}`)}>
          <span style={css(`display:flex;align-items:flex-start;gap:14px`)}>
            <span style={css(`${v.iJunior}`)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12"/><path d="M12 12C12 8 9 5 5 5c0 4 3 7 7 7z"/><path d="M12 10c0-3.3 2.7-6 6-6 0 3.3-2.7 6-6 6z"/></svg></span>
            <span><span style={css(`display:block;font-weight:700;font-size:16.5px;color:var(--text);margin-bottom:4px`)}>Junior designer</span><span style={css(`display:block;font-size:13.5px;line-height:1.45;color:var(--muted)`)}>0–2 years in product design.</span></span>
          </span>
        </button>
        <button type="button" onClick={v.selSenior} style={css(`${v.rSenior}`)}>
          <span style={css(`display:flex;align-items:flex-start;gap:14px`)}>
            <span style={css(`${v.iSenior}`)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></span>
            <span><span style={css(`display:block;font-weight:700;font-size:16.5px;color:var(--text);margin-bottom:4px`)}>Mid-level / senior</span><span style={css(`display:block;font-size:13.5px;line-height:1.45;color:var(--muted)`)}>3+ years, leveling up.</span></span>
          </span>
        </button>
        <button type="button" onClick={v.selLead} style={css(`${v.rLead}`)}>
          <span style={css(`display:flex;align-items:flex-start;gap:14px`)}>
            <span style={css(`${v.iLead}`)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
            <span><span style={css(`display:block;font-weight:700;font-size:16.5px;color:var(--text);margin-bottom:4px`)}>Lead / mentor</span><span style={css(`display:block;font-size:13.5px;line-height:1.45;color:var(--muted)`)}>Want to teach and contribute.</span></span>
          </span>
        </button>
      </div>

      {v.error && <div style={css(`margin-top:18px;font-size:13.5px;color:#ff8a5f;line-height:1.4`)}>{v.error}</div>}
      <div style={css(`height:1px;background:var(--border);margin:28px 0 22px`)}></div>
      <div style={css(`display:flex;justify-content:flex-end`)}>
        <button type="button" onClick={v.onNext} className="btn btn--primary btn--md" disabled={v.continueDisabled}>Continue
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="18" y2="12"/><polyline points="12 6 18 12 12 18"/></svg>
        </button>
      </div>
    </div>
  </>)}


  {v.isStep2 && (<>
    <div className="ob-card" style={css(`position:relative;width:100%;max-width:600px;background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:clamp(28px,3.5vw,40px);box-shadow:0 30px 80px -30px rgba(0,0,0,0.7)`)}>
      <h1 style={css(`margin:0 0 8px;font-weight:800;font-size:clamp(26px,3vw,34px);letter-spacing:-0.03em`)}>What are you here for?</h1>
      <p style={css(`margin:0 0 26px;font-size:16px;color:var(--muted)`)}>Pick all that apply — we'll personalize your home.</p>
      <div style={css(`display:flex;flex-wrap:wrap;gap:12px`)}>
        {(v.goalChips||[]).map((g, $index) => (<React.Fragment key={$index}>
          <button type="button" onClick={g.onSelect} style={css(`${g.style}`)}>{g.label}</button>
        </React.Fragment>))}
      </div>
      <div style={css(`height:1px;background:var(--border);margin:28px 0 22px`)}></div>
      <div style={css(`display:flex;justify-content:space-between;align-items:center`)}>
        <button type="button" onClick={v.onBack} className="btn btn--tertiary btn--md"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="6" y2="12"/><polyline points="11 6 5 12 11 18"/></svg>Back</button>
        <button type="button" onClick={v.onNext} className="btn btn--primary btn--md" disabled={v.continueDisabled}>Continue
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="18" y2="12"/><polyline points="12 6 18 12 12 18"/></svg>
        </button>
      </div>
    </div>
  </>)}


  {v.isStep3 && (<>
    <div className="ob-card" style={css(`position:relative;width:100%;max-width:600px;background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:clamp(28px,3.5vw,40px);box-shadow:0 30px 80px -30px rgba(0,0,0,0.7)`)}>
      <h1 style={css(`margin:0 0 8px;font-weight:800;font-size:clamp(26px,3vw,34px);letter-spacing:-0.03em`)}>Which tools do you use?</h1>
      <p style={css(`margin:0 0 26px;font-size:16px;color:var(--muted)`)}>We'll surface guides and posts for these first.</p>
      <div style={css(`display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px`)}>
        {(v.toolCards||[]).map((t, $index) => (<React.Fragment key={$index}>
          <button type="button" onClick={t.onSelect} style={css(`${t.style}`)}>{t.label}</button>
        </React.Fragment>))}
      </div>
      {v.error && <div style={css(`margin-top:18px;font-size:13.5px;color:#ff8a5f;line-height:1.4`)}>{v.error}</div>}
      <div style={css(`height:1px;background:var(--border);margin:28px 0 22px`)}></div>
      <div style={css(`display:flex;justify-content:space-between;align-items:center`)}>
        <button type="button" onClick={v.onBack} className="btn btn--tertiary btn--md"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="6" y2="12"/><polyline points="11 6 5 12 11 18"/></svg>Back</button>
        <button type="button" onClick={v.onNext} className={"btn btn--primary btn--md" + (v.submitting ? " btn--loading" : "")} disabled={v.continueDisabled}>Create account
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="18" y2="12"/><polyline points="12 6 18 12 12 18"/></svg>
        </button>
      </div>
    </div>
  </>)}


  {v.isStep4 && (<>
    <div className="ob-card" style={css(`position:relative;width:100%;max-width:600px;background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:clamp(36px,4vw,52px);text-align:center;box-shadow:0 30px 80px -30px rgba(0,0,0,0.7)`)}>
      <div style={css(`width:68px;height:68px;margin:0 auto 24px;border-radius:999px;background:rgba(31,138,91,0.18);border:1px solid rgba(31,138,91,0.4);display:flex;align-items:center;justify-content:center;animation:ob-pop .5s cubic-bezier(.22,.9,.3,1) both`)}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#3ecf8e" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      {v.needsEmailConfirm ? (<>
        <h1 style={css(`margin:0 0 10px;font-weight:800;font-size:clamp(28px,3.2vw,36px);letter-spacing:-0.03em`)}>Check your email{v.nameSuffix}.</h1>
        <p style={css(`margin:0 0 30px;font-size:16px;color:var(--muted)`)}>We sent a confirmation link. Click it to activate your account, then sign in.</p>
        <Link href="/signin" className="btn btn--primary btn--lg btn--block">Go to sign in
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="18" y2="12"/><polyline points="12 6 18 12 12 18"/></svg>
        </Link>
      </>) : (<>
        <h1 style={css(`margin:0 0 10px;font-weight:800;font-size:clamp(28px,3.2vw,36px);letter-spacing:-0.03em`)}>You're in{v.nameSuffix}.</h1>
        <p style={css(`margin:0 0 30px;font-size:16px;color:var(--muted)`)}>{v.summary}</p>
        <button type="button" onClick={v.goDashboard} className="btn btn--primary btn--lg btn--block">Go to my dashboard
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="18" y2="12"/><polyline points="12 6 18 12 12 18"/></svg>
        </button>
      </>)}
    </div>
  </>)}

</div>
  );
}
