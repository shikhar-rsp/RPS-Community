'use client';
// TEMPORARY launch gate. Big red button -> 5s countdown -> opens the landing
// page (/) with a warp burst. Not linked from anywhere; reach it at /launch.
// To remove after launch: delete this folder (app/launch), lib/warp.js, and
// the fenced "launch warp" effect in app/page.jsx.
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { css } from '@/lib/dc';
import { TYPE, Accent } from '@/lib/workshop-content';

const SECONDS = 5;
const RING = 2 * Math.PI * 92; // circumference of the r=92 progress ring

export default function LaunchPage() {
  const router = useRouter();
  // null = idle (button showing); a number = counting down from SECONDS.
  const [count, setCount] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    if (count === null) return;
    if (count <= 0) {
      router.push('/?launched=1');
      return;
    }
    timer.current = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer.current);
  }, [count, router]);

  const counting = count !== null;

  return (
    <div style={css(`--bg:#141312;--surface:#1d1c1b;--surface2:#242322;--border:rgba(255,255,255,0.09);--text:#ECEBE9;--muted:#9a9993;--faint:#6e6d6a;--accent:#F5330A;font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif;background:linear-gradient(160deg,#1b1a18 0%,#141312 60%);color:var(--text);min-height:100vh;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:clamp(24px,5vw,48px)`)}>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes lp-pulse { 0%{transform:scale(1);opacity:.55} 70%{transform:scale(1.55);opacity:0} 100%{opacity:0} }
        @keyframes lp-rise { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes lp-pop { 0%{transform:scale(.6);opacity:0} 45%{transform:scale(1.12);opacity:1} 100%{transform:scale(1);opacity:1} }
        .lp-btn{transition:transform .16s cubic-bezier(.2,.8,.3,1),box-shadow .2s ease,filter .2s ease}
        .lp-btn:hover{transform:translateY(-2px) scale(1.02);filter:brightness(1.05)}
        .lp-btn:active{transform:translateY(1px) scale(.99)}
        .lp-btn:focus-visible{outline:none;box-shadow:0 0 0 4px var(--bg),0 0 0 8px rgba(245,60,20,0.7)}
        @media(prefers-reduced-motion:reduce){.lp-ring2,.lp-pulse-ring{animation:none!important}}
      ` }} />

      {/* Grid + glow backdrop, matching the hero. */}
      <div aria-hidden="true" style={css(`position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px);background-size:46px 46px;mask-image:radial-gradient(120% 90% at 50% 40%,#000 30%,transparent 80%);-webkit-mask-image:radial-gradient(120% 90% at 50% 40%,#000 30%,transparent 80%);pointer-events:none`)}></div>
      <div aria-hidden="true" style={css(`position:absolute;top:-25%;left:50%;transform:translateX(-50%);width:70%;height:60%;background:radial-gradient(circle,rgba(245,60,20,0.18),transparent 66%);pointer-events:none`)}></div>

      {!counting && (
        <div style={css(`position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;max-width:640px`)}>
          <h1 style={css(`margin:0 0 16px;${TYPE.displayXL};color:var(--text);animation:lp-rise .6s .06s both`)}>The doors are <Accent>open</Accent>.</h1>
          <p style={css(`margin:0 0 clamp(40px,6vw,60px);max-width:460px;${TYPE.bodyL};color:var(--muted);animation:lp-rise .6s .12s both`)}>Press the button to step inside and open your first workshop.</p>

          <div style={css(`position:relative;animation:lp-pop .5s .2s both`)}>
            <span className="lp-pulse-ring" aria-hidden="true" style={css(`position:absolute;inset:0;border-radius:999px;background:radial-gradient(circle,rgba(245,60,20,0.9),rgba(245,60,20,0.3) 70%);animation:lp-pulse 2.4s ease-out infinite`)}></span>
            <button
              type="button"
              onClick={() => setCount(SECONDS)}
              className="lp-btn"
              style={css(`position:relative;width:clamp(180px,42vw,232px);height:clamp(180px,42vw,232px);border-radius:999px;border:none;cursor:pointer;color:#fff;font-family:inherit;font-weight:800;font-size:clamp(22px,3vw,28px);letter-spacing:0.02em;background:radial-gradient(120% 120% at 50% 30%,#FF5A3C 0%,#F5330A 45%,#C81E0A 100%);box-shadow:inset 0 2px 0 rgba(255,255,255,0.45),inset 0 -4px 10px rgba(120,20,0,0.5),0 20px 50px -12px rgba(245,60,20,0.7),0 0 0 10px rgba(245,60,20,0.08)`)}
            >
              LAUNCH
            </button>
          </div>
        </div>
      )}

      {counting && (
        <div style={css(`position:relative;display:flex;flex-direction:column;align-items:center;text-align:center`)}>
          <div style={css(`${TYPE.label};color:var(--faint);margin-bottom:clamp(28px,4vw,40px)`)}>Opening in</div>
          <div style={css(`position:relative;width:clamp(200px,52vw,240px);height:clamp(200px,52vw,240px);display:flex;align-items:center;justify-content:center`)}>
            <svg width="100%" height="100%" viewBox="0 0 200 200" style={css(`position:absolute;inset:0;transform:rotate(-90deg)`)}>
              <circle cx="100" cy="100" r="92" fill="none" stroke="var(--border)" strokeWidth="6" />
              <circle
                className="lp-ring2"
                cx="100" cy="100" r="92" fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={RING}
                strokeDashoffset={RING * (1 - count / SECONDS)}
                style={css(`transition:stroke-dashoffset 1s linear`)}
              />
            </svg>
            <div key={count} aria-live="assertive" style={css(`font-weight:800;font-size:clamp(72px,16vw,108px);line-height:1;letter-spacing:-0.04em;font-variant-numeric:tabular-nums;color:var(--text);animation:lp-pop .5s both`)}>{count}</div>
          </div>
          <p style={css(`margin:clamp(28px,4vw,40px) 0 0;${TYPE.bodyM};color:var(--muted)`)}>Hold tight — we're opening the doors.</p>
        </div>
      )}
    </div>
  );
}
