"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { createClient } from "@/lib/supabase/client";

const ROLES = [
  { id: "student", title: "Design student", desc: "Learning the craft." },
  { id: "switcher", title: "Career switcher", desc: "Coming from graphic, web, or another field." },
  { id: "junior", title: "Junior designer", desc: "0–2 years in product design." },
  { id: "senior", title: "Mid-level / senior", desc: "3+ years, leveling up." },
  { id: "lead", title: "Lead / mentor", desc: "Want to teach and contribute." },
];
const GOALS = [
  "Become industry-ready",
  "Ship faster with AI",
  "Get better at Figma",
  "Learn design systems",
  "Switch from graphic design",
  "Sharpen design critique",
  "Build a stronger portfolio",
  "Teach what I know",
];
const TOOLS = ["Figma", "Framer", "Webflow", "Notion", "Midjourney", "ChatGPT", "Maze", "Zeplin"];

// static per-role icons (verbatim SVGs, camelCased attributes)
const ROLE_ICON = {
  student: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10L12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
    </svg>
  ),
  switcher: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  junior: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12" />
      <path d="M12 12C12 8 9 5 5 5c0 4 3 7 7 7z" />
      <path d="M12 10c0-3.3 2.7-6 6-6 0 3.3-2.7 6-6 6z" />
    </svg>
  ),
  senior: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  lead: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

const ArrowRight = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="18" y2="12" />
    <polyline points="12 6 18 12 12 18" />
  </svg>
);
const ArrowLeft = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="6" y2="12" />
    <polyline points="11 6 5 12 11 18" />
  </svg>
);

const CARD_BASE =
  "text-align:left;font-family:inherit;cursor:pointer;border-radius:16px;padding:18px 20px;transition:border-color .22s,background .22s,transform .18s,box-shadow .22s";
const CHIP_BASE =
  "font-family:inherit;cursor:pointer;font-weight:600;font-size:14.5px;padding:11px 18px;border-radius:999px;transition:border-color .2s,background .2s,color .2s,transform .18s";
const TOOL_BASE =
  "font-family:inherit;cursor:pointer;font-weight:600;font-size:15px;padding:16px;border-radius:14px;text-align:center;transition:border-color .2s,background .2s,color .2s,transform .18s";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(null);
  const [goals, setGoals] = useState([]);
  const [tools, setTools] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const canNext = () => {
    if (step === 1)
      return name.trim().length > 0 && !!role && emailValid && password.length >= 8;
    if (step === 2) return goals.length > 0;
    if (step === 3) return tools.length > 0;
    return true;
  };
  const enabled = canNext();
  const next = () => { if (enabled) setStep((s) => Math.min(4, s + 1)); };
  const back = () => setStep((s) => Math.max(1, s - 1));

  // Final step: create the account, persist profile data, then advance to the
  // success screen. Called from step 3's "Continue".
  const finish = async () => {
    if (!enabled || submitting) return;
    setError("");
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim(), role, goals, tools },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setSubmitting(false);
      setError(error.message);
      return;
    }
    // If email confirmation is disabled, a session exists now — make sure the
    // profile row (created by the DB trigger) reflects the latest selections.
    if (data.session) {
      await supabase
        .from("profiles")
        .update({ name: name.trim(), role, goals, tools })
        .eq("id", data.user.id);
    } else {
      setNeedsEmailConfirm(true);
    }
    setSubmitting(false);
    setStep(4);
  };

  const goDashboard = () => {
    router.push("/dashboard");
    router.refresh();
  };

  const seg = (n) => (step >= n ? "100%" : "0%");

  const roleStyle = (id) =>
    CARD_BASE + ";" + (role === id
      ? "background:rgba(245,60,20,0.10);border:1px solid rgba(255,120,60,0.6);box-shadow:0 0 0 1px rgba(255,120,60,0.35),0 16px 44px -16px rgba(245,60,20,0.6);transform:translateY(-3px)"
      : "background:var(--surface2);border:1px solid var(--border)");
  const iconWrap = (id) =>
    "width:40px;height:40px;flex:none;border-radius:11px;display:flex;align-items:center;justify-content:center;transition:background .22s,color .22s;" +
    (role === id
      ? "background:rgba(245,60,20,0.16);color:#ff8a5f"
      : "background:var(--bg);border:1px solid var(--border);color:var(--muted)");
  const chipStyle = (sel) =>
    CHIP_BASE + ";" + (sel
      ? "background:rgba(245,60,20,0.14);border:1px solid rgba(255,120,60,0.6);color:#ff8a5f"
      : "background:var(--surface2);border:1px solid var(--border);color:var(--text)");
  const toolStyle = (sel) =>
    TOOL_BASE + ";" + (sel
      ? "background:rgba(245,60,20,0.12);border:1px solid rgba(255,120,60,0.6);color:#ff8a5f;transform:translateY(-2px)"
      : "background:var(--surface2);border:1px solid var(--border);color:var(--text)");

  const roleLabel = (ROLES.find((r) => r.id === role) || {}).title || "your path";
  const summary =
    "We'll set up your home around " + roleLabel.toLowerCase() + " · " + goals.length + " goal" +
    (goals.length === 1 ? "" : "s") + " · " + tools.length + " tool" + (tools.length === 1 ? "" : "s") + ".";
  const nameSuffix = name.trim() ? ", " + name.trim() : "";

  const cardStyle =
    "position:relative;width:100%;max-width:600px;background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:clamp(28px,3.5vw,40px);box-shadow:0 30px 80px -30px rgba(0,0,0,0.7)";

  return (
    <div
      className="pg-onboard"
      data-screen-label="Onboarding"
      style={css(
        "--bg:#131211;--surface:#1c1b1a;--surface2:#232220;--border:rgba(255,255,255,0.09);--text:#ECEBE9;--muted:#9a9993;--faint:#6e6d6a;--accent:#F5330A;font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;padding:clamp(28px,5vh,64px) 20px 64px"
      )}
    >
      <div aria-hidden="true" style={css("position:absolute;top:-20%;left:50%;transform:translateX(-50%);width:900px;height:600px;background:radial-gradient(circle,rgba(245,60,20,0.18),transparent 62%);pointer-events:none;filter:blur(8px)")}></div>
      <div aria-hidden="true" style={css("position:absolute;bottom:-25%;right:-10%;width:600px;height:600px;background:radial-gradient(circle,rgba(245,60,20,0.10),transparent 65%);pointer-events:none")}></div>

      {/* brand + progress */}
      <div style={css("position:relative;width:100%;max-width:600px;margin-bottom:clamp(24px,4vh,40px)")}>
        <div style={css("display:flex;align-items:center;gap:10px;margin-bottom:26px")}>
          <img src="/assets/academy-logo-full.png" alt="Academy" style={css("height:38px;width:auto;object-fit:contain;display:block")} />
          <span style={css("font-weight:700;font-size:18px;letter-spacing:-0.02em")}>Academy</span>
        </div>
        <div style={css("display:flex;gap:8px")}>
          {[seg(1), seg(2), seg(3), seg(4)].map((w, i) => (
            <div key={i} style={css("flex:1;height:4px;border-radius:999px;background:var(--surface2);overflow:hidden")}>
              <div style={css("height:100%;border-radius:999px;background:linear-gradient(90deg,#FF6A38,#F5330A);width:" + w + ";transition:width .5s cubic-bezier(.22,.9,.3,1)")}></div>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="ob-card" style={css(cardStyle)}>
          <h1 style={css("margin:0 0 8px;font-weight:800;font-size:clamp(26px,3vw,34px);letter-spacing:-0.03em")}>Welcome 👋</h1>
          <p style={css("margin:0 0 26px;font-size:16px;color:var(--muted)")}>First, tell us where you are in your design journey.</p>

          <div style={css("color:var(--faint);font-weight:600;font-size:11.5px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:10px")}>Your name</div>
          <input
            type="text"
            value={name}
            onInput={(e) => setName(e.target.value)}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should we call you?"
            style={css("width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);font-size:16px;font-family:inherit;padding:15px 16px;border-radius:14px;transition:border-color .2s,box-shadow .2s;margin-bottom:24px")}
          />

          <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:28px")}>
            <div>
              <div style={css("color:var(--faint);font-weight:600;font-size:11.5px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:10px")}>Email</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                style={css("width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);font-size:16px;font-family:inherit;padding:15px 16px;border-radius:14px;transition:border-color .2s,box-shadow .2s")}
              />
            </div>
            <div>
              <div style={css("color:var(--faint);font-weight:600;font-size:11.5px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:10px")}>Password</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters"
                style={css("width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);font-size:16px;font-family:inherit;padding:15px 16px;border-radius:14px;transition:border-color .2s,box-shadow .2s")}
              />
            </div>
          </div>

          <div style={css("color:var(--faint);font-weight:600;font-size:11.5px;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:12px")}>I am a…</div>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px")}>
            {ROLES.map((r) => (
              <button key={r.id} type="button" onClick={() => setRole(r.id)} style={css(roleStyle(r.id))}>
                <span style={css("display:flex;align-items:flex-start;gap:14px")}>
                  <span style={css(iconWrap(r.id))}>{ROLE_ICON[r.id]}</span>
                  <span>
                    <span style={css("display:block;font-weight:700;font-size:16.5px;color:var(--text);margin-bottom:4px")}>{r.title}</span>
                    <span style={css("display:block;font-size:13.5px;line-height:1.45;color:var(--muted)")}>{r.desc}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div style={css("height:1px;background:var(--border);margin:28px 0 22px")}></div>
          <div style={css("display:flex;justify-content:flex-end")}>
            <button type="button" onClick={next} className="btn btn--primary btn--md" disabled={!enabled}>
              Continue
              <ArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="ob-card" style={css(cardStyle)}>
          <h1 style={css("margin:0 0 8px;font-weight:800;font-size:clamp(26px,3vw,34px);letter-spacing:-0.03em")}>What are you here for?</h1>
          <p style={css("margin:0 0 26px;font-size:16px;color:var(--muted)")}>Pick all that apply — we'll personalize your home.</p>
          <div style={css("display:flex;flex-wrap:wrap;gap:12px")}>
            {GOALS.map((g) => (
              <button key={g} type="button" onClick={() => toggle(goals, setGoals, g)} style={css(chipStyle(goals.includes(g)))}>{g}</button>
            ))}
          </div>
          <div style={css("height:1px;background:var(--border);margin:28px 0 22px")}></div>
          <div style={css("display:flex;justify-content:space-between;align-items:center")}>
            <button type="button" onClick={back} className="btn btn--tertiary btn--md"><ArrowLeft />Back</button>
            <button type="button" onClick={next} className="btn btn--primary btn--md" disabled={!enabled}>Continue<ArrowRight /></button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="ob-card" style={css(cardStyle)}>
          <h1 style={css("margin:0 0 8px;font-weight:800;font-size:clamp(26px,3vw,34px);letter-spacing:-0.03em")}>Which tools do you use?</h1>
          <p style={css("margin:0 0 26px;font-size:16px;color:var(--muted)")}>We'll surface guides and posts for these first.</p>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px")}>
            {TOOLS.map((t) => (
              <button key={t} type="button" onClick={() => toggle(tools, setTools, t)} style={css(toolStyle(tools.includes(t)))}>{t}</button>
            ))}
          </div>
          {error ? (
            <div style={css("margin-top:22px;background:rgba(245,60,20,0.10);border:1px solid rgba(245,60,20,0.35);color:#ff9d7a;font-size:13.5px;padding:11px 13px;border-radius:12px")}>{error}</div>
          ) : null}
          <div style={css("height:1px;background:var(--border);margin:22px 0 22px")}></div>
          <div style={css("display:flex;justify-content:space-between;align-items:center")}>
            <button type="button" onClick={back} className="btn btn--tertiary btn--md"><ArrowLeft />Back</button>
            <button
              type="button"
              onClick={finish}
              className={"btn btn--primary btn--md" + (submitting ? " btn--loading" : "")}
              disabled={!enabled || submitting}
            >
              Create account<ArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="ob-card" style={css("position:relative;width:100%;max-width:600px;background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:clamp(36px,4vw,52px);text-align:center;box-shadow:0 30px 80px -30px rgba(0,0,0,0.7)")}>
          <div style={css("width:68px;height:68px;margin:0 auto 24px;border-radius:999px;background:rgba(31,138,91,0.18);border:1px solid rgba(31,138,91,0.4);display:flex;align-items:center;justify-content:center;animation:ob-pop .5s cubic-bezier(.22,.9,.3,1) both")}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#3ecf8e" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 style={css("margin:0 0 10px;font-weight:800;font-size:clamp(28px,3.2vw,36px);letter-spacing:-0.03em")}>You're in{nameSuffix}.</h1>
          <p style={css("margin:0 0 30px;font-size:16px;color:var(--muted)")}>{summary}</p>
          {needsEmailConfirm ? (
            <>
              <div style={css("margin:0 0 22px;background:rgba(62,207,142,0.10);border:1px solid rgba(62,207,142,0.35);color:#7ce0b3;font-size:14px;padding:13px 15px;border-radius:12px;text-align:left")}>
                We sent a confirmation link to <strong>{email}</strong>. Confirm your email, then sign in to reach your dashboard.
              </div>
              <Link href="/signin" className="btn btn--primary btn--lg btn--block">
                Go to sign in
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="18" y2="12" /><polyline points="12 6 18 12 12 18" /></svg>
              </Link>
            </>
          ) : (
            <button type="button" onClick={goDashboard} className="btn btn--primary btn--lg btn--block">
              Go to my dashboard
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="18" y2="12" /><polyline points="12 6 18 12 12 18" /></svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
