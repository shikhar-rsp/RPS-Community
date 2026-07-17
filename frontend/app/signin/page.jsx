"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { css } from "@/lib/css";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  );
}

function SignInInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const next = searchParams.get("next") || "/dashboard";

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  };

  const onOAuth = async (provider) => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) setError(error.message);
  };
  const onGoogle = () => onOAuth("google");
  const onLinkedIn = () => onOAuth("linkedin_oidc");

  const onForgot = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!email) {
      setError("Enter your email above first, then click Forgot.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setNotice("Password reset link sent — check your email.");
  };

  return (
    <div
      className="pg-signin si-grid"
      data-screen-label="Sign in"
      style={css(
        "--bg:#141312;--surface:#1d1c1b;--surface2:#242322;--border:rgba(255,255,255,0.09);--text:#ECEBE9;--muted:#9a9993;--faint:#6e6d6a;--accent:#F5330A;font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;display:grid;grid-template-columns:1.05fr 1fr"
      )}
    >
      {/* LEFT: brand / testimonial */}
      <div
        className="si-left"
        style={css(
          "position:relative;overflow:hidden;border-right:1px solid var(--border);background:linear-gradient(160deg,#1b1a18 0%,#141312 60%);padding:clamp(32px,4vw,56px);display:flex;flex-direction:column;justify-content:space-between;min-height:100vh"
        )}
      >
        <div
          aria-hidden="true"
          style={css(
            "position:absolute;top:-25%;left:-10%;width:70%;height:70%;background:radial-gradient(circle,rgba(245,60,20,0.22),transparent 65%);pointer-events:none"
          )}
        ></div>
        <div
          aria-hidden="true"
          style={css(
            "position:absolute;bottom:-20%;right:-8%;width:55%;height:55%;background:radial-gradient(circle,rgba(245,60,20,0.12),transparent 65%);pointer-events:none"
          )}
        ></div>

        <Link
          href="/"
          style={css(
            "position:relative;display:flex;align-items:center;gap:10px;color:var(--text)"
          )}
        >
          <img
            src="/assets/academy-logo-full.png"
            alt="Academy"
            style={css("height:44px;width:auto;object-fit:contain;display:block")}
          />
          <span style={css("font-weight:700;font-size:20px;letter-spacing:-0.02em")}>Academy</span>
        </Link>

        <div style={css("position:relative;max-width:460px")}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="var(--accent)"
            style={css("opacity:0.9;margin-bottom:22px")}
          >
            <path d="M9.5 6C6.5 6 4 8.5 4 11.5V18h6.5v-6.5H7.5C7.5 9.6 8.9 8.2 10.8 8.2L9.5 6zm9 0C15.5 6 13 8.5 13 11.5V18h6.5v-6.5h-3C16.5 9.6 17.9 8.2 19.8 8.2L18.5 6z" />
          </svg>
          <p
            style={css(
              "margin:0 0 28px;font-size:clamp(20px,2vw,27px);line-height:1.42;font-weight:500;letter-spacing:-0.015em;color:var(--text)"
            )}
          >
            The workshop assessments are the unlock. Three written reviews taught me more about my own craft than two years on the job.
          </p>
          <div style={css("display:flex;align-items:center;gap:14px")}>
            <span
              style={css(
                "width:46px;height:46px;border-radius:999px;overflow:hidden;flex:none;border:1px solid var(--border)"
              )}
            >
              <img
                src="/assets/maya.png"
                alt="Maya R."
                style={css("width:100%;height:100%;object-fit:cover;display:block")}
              />
            </span>
            <span>
              <span style={css("display:block;font-weight:700;font-size:15px;color:var(--text)")}>Maya R.</span>
              <span style={css("display:block;font-size:13.5px;color:var(--muted)")}>Senior Product Designer · Swiggy</span>
            </span>
          </div>
        </div>

        <div
          style={css(
            "position:relative;display:flex;gap:26px;color:var(--faint);font-size:13px"
          )}
        >
          <span>
            <strong style={css("color:var(--text);font-weight:700")}>4.9</strong> · 25k+ designers
          </span>
          <span>150+ countries</span>
        </div>
      </div>

      {/* RIGHT: sign-in form */}
      <div
        className="si-right"
        style={css(
          "display:flex;align-items:center;justify-content:center;padding:clamp(28px,4vw,56px);min-height:100vh"
        )}
      >
        <div style={css("width:100%;max-width:400px")}>
          <span
            style={css(
              "display:inline-flex;align-items:center;gap:8px;background:rgba(245,60,20,0.12);color:var(--accent);font-weight:600;font-size:11.5px;letter-spacing:0.08em;padding:5px 11px;border-radius:999px;margin-bottom:22px"
            )}
          >
            <span style={css("width:7px;height:7px;border-radius:999px;background:var(--accent)")}></span>LIVE WORKSHOP · JUL 15
          </span>
          <h1
            style={css(
              "margin:0 0 8px;font-weight:800;font-size:clamp(30px,3.4vw,38px);line-height:1.05;letter-spacing:-0.03em"
            )}
          >
            Welcome back
          </h1>
          <p style={css("margin:0 0 30px;font-size:16px;color:var(--muted)")}>Sign in to keep building.</p>

          <div style={css("display:flex;flex-direction:column;gap:11px;margin-bottom:22px")}>
            <button type="button" onClick={onGoogle} className="btn btn--secondary btn--lg btn--block">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-2 3.2-4.9 3.2-7.8z" />
                <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.7l-3.6-2.7c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23z" />
                <path fill="#FBBC05" d="M6 14.3a6.6 6.6 0 0 1 0-4.2V7.3H2.3a11 11 0 0 0 0 9.9L6 14.3z" />
                <path fill="#EA4335" d="M12 5.5c1.6 0 3 .5 4.1 1.6l3.1-3.1A11 11 0 0 0 2.3 7.3L6 10.1c.9-2.6 3.2-4.6 6-4.6z" />
              </svg>
              Continue with Google
            </button>
            <button type="button" onClick={onLinkedIn} className="btn btn--secondary btn--lg btn--block">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5V9h3v10zM6.5 7.7a1.8 1.8 0 1 1 0-3.5 1.8 1.8 0 0 1 0 3.5zM19 19h-3v-5c0-1.2-.5-2-1.6-2-.9 0-1.4.6-1.6 1.2-.1.2-.1.5-.1.8V19h-3V9h3v1.3c.4-.7 1.2-1.6 3-1.6 2.2 0 3.9 1.4 3.9 4.5V19z" />
              </svg>
              Continue with LinkedIn
            </button>
          </div>

          <div style={css("display:flex;align-items:center;gap:14px;margin-bottom:22px")}>
            <span style={css("flex:1;height:1px;background:var(--border)")}></span>
            <span style={css("color:var(--faint);font-size:12.5px;letter-spacing:0.06em")}>or use email</span>
            <span style={css("flex:1;height:1px;background:var(--border)")}></span>
          </div>

          <form onSubmit={onSubmit} style={css("display:flex;flex-direction:column;gap:16px")}>
            {error ? (
              <div style={css("background:rgba(245,60,20,0.10);border:1px solid rgba(245,60,20,0.35);color:#ff9d7a;font-size:13.5px;padding:11px 13px;border-radius:12px")}>
                {error}
              </div>
            ) : null}
            {notice ? (
              <div style={css("background:rgba(62,207,142,0.10);border:1px solid rgba(62,207,142,0.35);color:#7ce0b3;font-size:13.5px;padding:11px 13px;border-radius:12px")}>
                {notice}
              </div>
            ) : null}
            <label style={css("display:block")}>
              <span style={css("display:block;font-size:13px;font-weight:600;color:var(--muted);margin-bottom:8px")}>Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                style={css(
                  "width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);font-size:15px;font-family:inherit;padding:13px 14px;border-radius:12px"
                )}
              />
            </label>
            <label style={css("display:block")}>
              <span style={css("display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px")}>
                <span style={css("font-size:13px;font-weight:600;color:var(--muted)")}>Password</span>
                <a href="#" onClick={onForgot} style={css("font-size:12.5px;font-weight:500")}>Forgot?</a>
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={css(
                  "width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);font-size:15px;font-family:inherit;padding:13px 14px;border-radius:12px"
                )}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className={"btn btn--primary btn--lg btn--block" + (loading ? " btn--loading" : "")}
            >
              Sign in
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="18" y2="12" />
                <polyline points="12 6 18 12 12 18" />
              </svg>
            </button>
          </form>

          <p
            style={css(
              "margin:24px 0 0;text-align:center;font-size:14.5px;color:var(--muted)"
            )}
          >
            New here? <Link href="/onboarding" style={css("font-weight:600")}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
