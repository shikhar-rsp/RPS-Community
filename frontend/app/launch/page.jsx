'use client';
// TEMPORARY launch gate. Big button -> 5s countdown -> opens the landing page.
// Not linked from anywhere; reach it at /launch.
// To remove after launch: delete this folder (app/launch).
//
// Re-skinned onto the community design tokens so it doesn't read as a different
// product than the site it opens. The old warp burst went with the old homepage
// hero it was written against — the new hero has the Meet mock instead.
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
      router.push('/');
      return;
    }
    timer.current = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer.current);
  }, [count, router]);

  const counting = count !== null;

  return (
    <div className="launch">
      <style>{`
        .launch{
          position:relative; overflow:hidden; min-height:100vh;
          display:flex; align-items:center; justify-content:center;
          padding:clamp(24px,5vw,48px); text-align:center;
          background:var(--paper); color:var(--ink);
          font-family:var(--font-body);
        }
        .launch::before{
          content:""; position:absolute; inset:0; pointer-events:none;
          background:
            radial-gradient(60% 50% at 50% 0%, var(--glow-a), transparent 70%),
            radial-gradient(50% 40% at 80% 10%, var(--glow-b), transparent 70%);
        }
        .launch__in{ position:relative; max-width:640px; }
        .launch__btn{
          position:relative; width:clamp(180px,42vw,232px); height:clamp(180px,42vw,232px);
          border-radius:999px; border:none; cursor:pointer; color:var(--btn-ink);
          font-family:var(--font-display); font-weight:800;
          font-size:clamp(22px,3vw,28px); letter-spacing:.02em;
          background:radial-gradient(120% 120% at 50% 30%, var(--brand-2) 0%, var(--brand) 45%, var(--btn-fill-2) 100%);
          box-shadow:
            inset 0 2px 0 rgba(255,255,255,.35),
            inset 0 -4px 10px rgba(90,34,4,.45),
            0 20px 50px -12px rgba(255,99,11,.55),
            0 0 0 10px rgba(255,99,11,.10);
          transition:transform .16s var(--ease), filter .2s var(--ease);
        }
        .launch__btn:hover{ transform:translateY(-2px) scale(1.02); filter:brightness(1.05); }
        .launch__btn:active{ transform:translateY(1px) scale(.99); }
        .launch__btn:focus-visible{ outline:none; box-shadow:0 0 0 4px var(--paper), 0 0 0 8px var(--brand); }
        .launch__pulse{
          position:absolute; inset:0; border-radius:999px; pointer-events:none;
          background:radial-gradient(circle, rgba(255,99,11,.8), rgba(255,99,11,.25) 70%);
          animation:launchPulse 2.4s ease-out infinite;
        }
        @keyframes launchPulse{ 0%{transform:scale(1);opacity:.55} 70%{transform:scale(1.55);opacity:0} 100%{opacity:0} }
        .launch__dial{
          position:relative; width:clamp(200px,52vw,240px); height:clamp(200px,52vw,240px);
          display:flex; align-items:center; justify-content:center; margin:0 auto;
        }
        .launch__n{
          font-family:var(--font-display); font-weight:800;
          font-size:clamp(72px,16vw,108px); line-height:1; letter-spacing:-.04em;
          font-variant-numeric:tabular-nums; color:var(--heading);
        }
        @media(prefers-reduced-motion:reduce){ .launch__pulse{ animation:none } }
      `}</style>

      {!counting && (
        <div className="launch__in">
          <h1 style={{ margin: '0 0 16px' }}>
            The doors are <span className="soft">open</span>.
          </h1>
          <p className="lede" style={{ marginInline: 'auto', marginBottom: 'clamp(40px,6vw,60px)' }}>
            Press the button to step inside and open your first workshop.
          </p>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <span className="launch__pulse" aria-hidden="true" />
            <button className="launch__btn" type="button" onClick={() => setCount(SECONDS)}>
              LAUNCH
            </button>
          </div>
        </div>
      )}

      {counting && (
        <div className="launch__in">
          <div className="eyebrow bare" style={{ marginBottom: 'clamp(28px,4vw,40px)' }}>
            Opening in
          </div>
          <div className="launch__dial">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 200 200"
              style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
              aria-hidden="true"
            >
              <circle cx="100" cy="100" r="92" fill="none" stroke="var(--line)" strokeWidth="6" />
              <circle
                cx="100"
                cy="100"
                r="92"
                fill="none"
                stroke="var(--brand)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={RING}
                strokeDashoffset={RING * (1 - count / SECONDS)}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div key={count} aria-live="assertive" className="launch__n">
              {count}
            </div>
          </div>
          <p className="micro" style={{ marginTop: 'clamp(28px,4vw,40px)' }}>
            Hold tight — we&rsquo;re opening the doors.
          </p>
        </div>
      )}
    </div>
  );
}
