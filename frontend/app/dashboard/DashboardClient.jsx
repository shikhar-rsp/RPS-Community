"use client";

import { useState } from "react";
import Link from "next/link";
import { css } from "@/lib/css";
import { Box } from "@/components/Box";
import { TopBar } from "@/components/TopBar";
import { submitAssignment } from "./actions";

const STAR_PATH = "M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.3l6.5-.9z";

function Stars({ filled }) {
  return (
    <div style={css("display:flex;gap:5px")}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < filled ? "#FF8A5F" : "rgba(255,255,255,0.14)"} stroke="none" style={css("display:block")}>
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

function Criterion({ label, score }) {
  return (
    <div style={css("background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:15px 17px")}>
      <div style={css("display:flex;align-items:center;justify-content:space-between;margin-bottom:11px")}>
        <span style={css("font-size:14px;font-weight:600;color:var(--text)")}>{label}</span>
        <span style={css("font-size:13px;color:var(--muted)")}>
          <strong style={css("color:var(--text);font-weight:700")}>{score}</strong> / 5
        </span>
      </div>
      <Stars filled={score} />
    </div>
  );
}

// Interactive dashboard shell. All user/profile/submission data is fetched on the
// SERVER (see page.jsx) and passed in as props — so the raw user object never
// appears in the browser's network tab. Only the minimal fields below cross the
// wire, embedded in the server-rendered HTML.
export default function DashboardClient({ firstName, initialLink, initialNote, initialSubmitted }) {
  const [link, setLink] = useState(initialLink || "");
  const [note, setNote] = useState(initialNote || "");
  const [submitted, setSubmitted] = useState(!!initialSubmitted);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const enabled = link.trim().length > 0;
  const submitDisabled = !enabled || submitting;
  const submitClass = "btn btn--primary btn--lg btn--block" + (submitting ? " btn--loading" : "");

  const onSubmit = async () => {
    if (!link.trim() || submitting) return;
    setError("");
    setSubmitting(true);
    // Validated + persisted server-side; identity/status can't be spoofed here.
    const res = await submitAssignment({ link, note });
    setSubmitting(false);
    if (!res?.ok) {
      setError(res?.error || "Something went wrong.");
      return;
    }
    setSubmitted(true);
  };
  const onReset = () => {
    setLink("");
    setNote("");
    setSubmitted(false);
    setSubmitting(false);
    setError("");
  };

  return (
    <div
      className="pg-dash"
      data-screen-label="Dashboard"
      style={css(
        "--bg:#131211;--surface:#1c1b1a;--surface2:#232220;--border:rgba(255,255,255,0.09);--text:#ECEBE9;--muted:#9a9993;--faint:#6e6d6a;--accent:#F5330A;--green:#3ecf8e;font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif;background:var(--bg);color:var(--text);min-height:100vh"
      )}
    >
      {/* NAV */}
      <TopBar active="dashboard" />

      <div style={css("max-width:1160px;margin:0 auto;padding:clamp(32px,5vw,52px) clamp(16px,3vw,24px) 80px")}>
        {/* GREETING */}
        <div className="db-rise" style={css("margin-bottom:clamp(36px,4.5vw,52px)")}>
          <div style={css("color:var(--faint);font-weight:600;font-size:12.5px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:14px")}>Dashboard</div>
          <h1 style={css("margin:0 0 12px;font-weight:800;font-size:clamp(34px,5vw,60px);line-height:1.0;letter-spacing:-0.035em")}>
            Welcome back, <span style={css("background:linear-gradient(100deg,#FF6A38,#F5330A);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent")}>{firstName || "there"}</span>.
          </h1>
          <p style={css("margin:0;font-size:clamp(16px,1.3vw,18px);color:var(--muted)")}>Your enrolled workshops, assignments, and assessment status — all in one place.</p>
        </div>

        {/* SECTION 1: MY WORKSHOPS */}
        <div className="db-rise" style={css("animation-delay:.05s;display:flex;align-items:baseline;justify-content:space-between;margin-bottom:20px")}>
          <h2 style={css("margin:0;color:var(--faint);font-weight:600;font-size:12.5px;letter-spacing:0.2em;text-transform:uppercase")}>My workshops</h2>
          <Link href="/" className="btn btn--tertiary btn--sm">Browse all</Link>
        </div>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;max-width:800px;margin:0 auto clamp(40px,5vw,60px)")}>
          <Box className="db-rise wcard" style="animation-delay:.1s;background:var(--surface);border:1px solid var(--border);border-radius:20px;overflow:hidden;transition:border-color .25s,transform .25s,box-shadow .25s" hover="border-color:rgba(255,255,255,0.18);transform:translateY(-4px);box-shadow:0 24px 60px -28px rgba(0,0,0,0.8)">
            <div className="wcover" style={css("position:relative;aspect-ratio:16/9;background:linear-gradient(135deg,#2a1109,#140b07);border-bottom:1px solid var(--border)")}>
              <img src="/assets/hero.png" alt="" style={css("position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.9")} />
            </div>
            <div style={css("padding:24px")}>
              <div style={css("display:flex;align-items:center;gap:14px;margin-bottom:14px")}>
                <span style={css("background:var(--accent);color:#1a0803;font-weight:700;font-size:10.5px;letter-spacing:0.08em;padding:4px 10px;border-radius:999px")}>UPCOMING</span>
                <span style={css("display:inline-flex;align-items:center;gap:6px;color:var(--muted);font-size:13px;font-weight:500")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4.5" width="18" height="16.5" rx="2.5" /><line x1="3" y1="9.5" x2="21" y2="9.5" /></svg>Jul 15
                </span>
                <span style={css("display:inline-flex;align-items:center;gap:6px;color:var(--muted);font-size:13px;font-weight:500")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" /></svg>3:00 PM
                </span>
              </div>
              <h3 style={css("margin:0 0 10px;font-weight:700;font-size:19px;letter-spacing:-0.015em")}>netpulse-sol.com took 9 hours. Here is how</h3>
              <p style={css("margin:0;font-size:14.5px;line-height:1.55;color:var(--muted)")}>One continuous live build on a shared brief — the method, the toolkit, and shipping to a real URL in 90 minutes.</p>
            </div>
          </Box>
          <div className="db-rise wcard" style={css("animation-delay:.16s;position:relative;overflow:hidden;background:linear-gradient(150deg,rgba(245,60,20,0.10),var(--surface) 55%);border:1px solid rgba(255,120,60,0.22);border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:36px 28px;min-height:100%")}>
            <div aria-hidden="true" style={css("position:absolute;top:-30%;right:-20%;width:70%;height:70%;background:radial-gradient(circle,rgba(245,60,20,0.20),transparent 65%);pointer-events:none")}></div>
            <div aria-hidden="true" style={css("position:absolute;bottom:-25%;left:-15%;width:55%;height:55%;background:radial-gradient(circle,rgba(245,60,20,0.10),transparent 65%);pointer-events:none")}></div>
            <span style={css("position:relative;width:56px;height:56px;border-radius:16px;background:rgba(245,60,20,0.14);border:1px solid rgba(255,120,60,0.32);display:flex;align-items:center;justify-content:center;margin-bottom:20px")}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.2 4.9 5.3.5-4 3.6 1.2 5.2L12 15l-4.7 2.7 1.2-5.2-4-3.6 5.3-.5z" /></svg>
            </span>
            <span style={css("position:relative;display:inline-block;color:var(--accent);font-weight:600;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:12px")}>Coming soon</span>
            <h3 style={css("position:relative;margin:0 0 10px;font-weight:800;font-size:21px;letter-spacing:-0.02em")}>More workshops on the way</h3>
            <p style={css("position:relative;margin:0 0 20px;font-size:14.5px;line-height:1.55;color:var(--muted);max-width:280px")}>New live sessions with industry experts are being lined up. Check back soon — or get notified when the next one drops.</p>
            <span style={css("position:relative;display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:var(--text);background:var(--surface2);border:1px solid var(--border);padding:9px 16px;border-radius:999px")}>
              <span style={css("width:7px;height:7px;border-radius:999px;background:var(--accent)")}></span>Notify me
            </span>
          </div>
        </div>

        {/* SECTION 2 + 3 */}
        <div style={css("display:flex;flex-direction:column;gap:clamp(40px,5vw,60px)")}>
          {/* SUBMIT ASSIGNMENT */}
          <div className="db-rise" style={css("animation-delay:.14s")}>
            <div style={css("color:var(--faint);font-weight:600;font-size:12.5px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:12px")}>Submit your assignment</div>
            <p style={css("margin:0 0 20px;font-size:15px;color:var(--muted)")}>You attended these workshops — drop your link to get assessed.</p>

            <div style={css("background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:clamp(24px,2.6vw,32px)")}>
              {!submitted && (
                <div>
                  <div style={css("display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px")}>
                    <div style={css("color:var(--faint);font-weight:600;font-size:11.5px;letter-spacing:0.14em;text-transform:uppercase")}>Assignment · Design handoff that sticks</div>
                    <span style={css("flex:none;font-size:12.5px;font-weight:500;color:var(--muted);border:1px solid var(--border);padding:5px 12px;border-radius:999px")}>Due Thu, Jul 16</span>
                  </div>
                  <p style={css("margin:0 0 26px;font-size:15px;line-height:1.6;color:var(--text);max-width:620px")}>Take one screen you've designed and produce a handoff spec: tokens, spacing, every interactive state, and edge cases. Submit the Figma link + a short note on what an engineer would still need to ask.</p>

                  <div style={css("margin-bottom:6px")}><span style={css("font-weight:600;font-size:14px;color:var(--text)")}>Your link</span> <span style={css("font-size:13px;color:var(--faint)")}>(required)</span></div>
                  <input type="url" value={link} onInput={(e) => setLink(e.target.value)} onChange={(e) => setLink(e.target.value)} placeholder="https://your-work.com or figma.com/file/…" style={css("width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);font-size:15px;font-family:inherit;padding:14px 15px;border-radius:12px;transition:border-color .2s,box-shadow .2s;margin:8px 0 22px")} />

                  <div style={css("margin-bottom:6px")}><span style={css("font-weight:600;font-size:14px;color:var(--text)")}>Note</span> <span style={css("font-size:13px;color:var(--faint)")}>(optional)</span></div>
                  <textarea rows="3" value={note} onInput={(e) => setNote(e.target.value)} onChange={(e) => setNote(e.target.value)} placeholder="A few lines on the choices you made and what you'd push further." style={css("width:100%;background:var(--surface2);border:1px solid var(--border);color:var(--text);font-size:15px;font-family:inherit;line-height:1.55;padding:14px 15px;border-radius:12px;resize:vertical;transition:border-color .2s,box-shadow .2s;margin:8px 0 24px")}></textarea>

                  {error ? (
                    <div style={css("margin-bottom:18px;background:rgba(245,60,20,0.10);border:1px solid rgba(245,60,20,0.35);color:#ff9d7a;font-size:13.5px;padding:11px 13px;border-radius:12px")}>{error}</div>
                  ) : null}
                  <div style={css("height:1px;background:var(--border);margin-bottom:22px")}></div>
                  <div style={css("display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap")}>
                    <span style={css("font-size:13.5px;color:var(--faint)")}>You can resubmit until the due date.</span>
                    <button type="button" onClick={onSubmit} className={submitClass} disabled={submitDisabled}>
                      Submit for assessment
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="18" y2="12" /><polyline points="12 6 18 12 12 18" /></svg>
                    </button>
                  </div>
                </div>
              )}
              {submitted && (
                <div style={css("display:flex;flex-direction:column;align-items:center;text-align:center;padding:14px 0")}>
                  <span style={css("width:56px;height:56px;border-radius:999px;background:rgba(62,207,142,0.16);border:1px solid rgba(62,207,142,0.4);display:flex;align-items:center;justify-content:center;margin-bottom:18px")}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                  <h3 style={css("margin:0 0 7px;font-weight:700;font-size:19px")}>Submitted for assessment</h3>
                  <p style={css("margin:0 0 20px;font-size:14.5px;line-height:1.55;color:var(--muted);max-width:340px")}>Your work is with the RPS Studio team — you'll get a written assessment back within a week.</p>
                  <button type="button" onClick={onReset} className="btn btn--secondary btn--md">Submit another link</button>
                </div>
              )}
            </div>
          </div>

          {/* ASSESSMENT STATUS */}
          <div className="db-rise" style={css("animation-delay:.2s")}>
            <div style={css("color:var(--faint);font-weight:600;font-size:12.5px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:16px")}>Assessment status</div>
            <div style={css("display:flex;flex-direction:column;gap:16px")}>
              {/* State 1: In review */}
              <div style={css("background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:clamp(22px,2.4vw,28px)")}>
                <div style={css("display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px")}>
                  <div>
                    <div style={css("color:var(--faint);font-weight:600;font-size:11.5px;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:8px")}>Submission</div>
                    <h3 style={css("margin:0 0 6px;font-weight:700;font-size:19px;letter-spacing:-0.015em")}>Ship client-ready sites with Claude</h3>
                    <div style={css("font-size:13.5px;color:var(--muted)")}>Submitted Jul 18 · <a href="#" style={css("color:var(--accent)")}>my-claude-site.vercel.app</a></div>
                  </div>
                  <span style={css("flex:none;font-size:12.5px;font-weight:700;color:#1c1405;background:linear-gradient(90deg,#f7d774,#f2a98f);padding:5px 13px;border-radius:999px")}>In review</span>
                </div>
                <div style={css("background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:15px 16px")}>
                  <p style={css("margin:0;font-size:14px;line-height:1.55;color:var(--muted)")}>Your work is with the RPS Studio team — assessments are done by hand, usually back within a week.</p>
                </div>
              </div>

              {/* State 2: Assessed */}
              <div style={css("background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:clamp(22px,2.4vw,28px)")}>
                <div style={css("display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:20px")}>
                  <div>
                    <div style={css("color:var(--faint);font-weight:600;font-size:11.5px;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:8px")}>Submission</div>
                    <h3 style={css("margin:0 0 6px;font-weight:700;font-size:19px;letter-spacing:-0.015em")}>Figma file hygiene for real teams</h3>
                    <div style={css("font-size:13.5px;color:var(--muted)")}>Submitted Jun 12 · <a href="#" style={css("color:var(--accent)")}>figma.com/file/example/file-hygiene-restructure</a></div>
                  </div>
                  <span style={css("flex:none;font-size:12.5px;font-weight:700;color:#1c0a03;background:linear-gradient(90deg,#FF6A38,#F5330A);padding:5px 13px;border-radius:999px")}>Assessed · 4 / 5</span>
                </div>
                <div style={css("height:1px;background:var(--border);margin-bottom:20px")}></div>
                <div style={css("color:var(--faint);font-weight:600;font-size:11.5px;letter-spacing:0.16em;text-transform:uppercase;margin-bottom:14px")}>Assessment</div>
                <div style={css("display:flex;align-items:center;gap:16px;margin-bottom:22px")}>
                  <div style={css("position:relative;width:64px;height:64px;flex:none;border-radius:999px;background:conic-gradient(#F5330A 0turn 0.8turn,var(--surface2) 0.8turn 1turn);display:flex;align-items:center;justify-content:center")}>
                    <div style={css("width:50px;height:50px;border-radius:999px;background:var(--surface);display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1")}>
                      <span style={css("font-weight:800;font-size:18px;color:var(--text)")}>4.0</span>
                      <span style={css("font-size:9px;color:var(--faint);letter-spacing:0.05em")}>/ 5</span>
                    </div>
                  </div>
                  <div>
                    <div style={css("font-weight:700;font-size:15px;color:var(--text);margin-bottom:2px")}>Strong pass</div>
                    <div style={css("font-size:13.5px;color:var(--muted)")}>Averaged across 4 criteria</div>
                  </div>
                </div>
                <div style={css("display:flex;flex-direction:column;gap:12px;margin-bottom:22px")}>
                  <div style={css("display:grid;grid-template-columns:repeat(2,1fr);gap:12px")}>
                    <Criterion label="Hierarchy" score={4} />
                    <Criterion label="Consistency" score={5} />
                    <Criterion label="States" score={3} />
                    <Criterion label="Handoff" score={4} />
                  </div>
                </div>
                <p style={css("margin:0 0 18px;font-size:14.5px;line-height:1.6;color:var(--muted)")}>Great restructure. Hierarchy + system are strong; some empty / error states would round it out. Handoff is clear.</p>
                <div style={css("display:flex;align-items:center;gap:11px")}>
                  <span style={css("width:34px;height:34px;border-radius:999px;overflow:hidden;flex:none;border:1px solid var(--border)")}>
                    <img src="/assets/vineet.png" alt="" style={css("width:100%;height:100%;object-fit:cover;display:block")} />
                  </span>
                  <span>
                    <span style={css("display:block;font-weight:600;font-size:14px;color:var(--text)")}>Vineet Chopdekar</span>
                    <span style={css("display:block;font-size:12.5px;color:var(--faint)")}>Principal Designer · reviewed Jun 15</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
