"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { createClient } from "@/lib/supabase/client";

// Landing page for the Supabase password-reset email link. The email link
// establishes a temporary session; here the user sets a new password.
export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1200);
  };

  return (
    <div
      style={css(
        "--bg:#141312;--surface:#1d1c1b;--surface2:#242322;--border:rgba(255,255,255,0.09);--text:#ECEBE9;--muted:#9a9993;--faint:#6e6d6a;--accent:#F5330A;font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px"
      )}
    >
      <div style={css("width:100%;max-width:400px")}>
        <h1 style={css("margin:0 0 8px;font-weight:800;font-size:clamp(28px,3.4vw,34px);letter-spacing:-0.03em")}>Set a new password</h1>
        <p style={css("margin:0 0 28px;font-size:15.5px;color:var(--muted)")}>Choose a new password for your account.</p>

        {done ? (
          <div style={css("background:rgba(62,207,142,0.10);border:1px solid rgba(62,207,142,0.35);color:#7ce0b3;font-size:14px;padding:13px 15px;border-radius:12px")}>
            Password updated — taking you to your dashboard…
          </div>
        ) : (
          <form onSubmit={onSubmit} style={css("display:flex;flex-direction:column;gap:16px")}>
            {error ? (
              <div style={css("background:rgba(245,60,20,0.10);border:1px solid rgba(245,60,20,0.35);color:#ff9d7a;font-size:13.5px;padding:11px 13px;border-radius:12px")}>{error}</div>
            ) : null}
            <label style={css("display:block")}>
              <span style={css("display:block;font-size:13px;font-weight:600;color:var(--muted);margin-bottom:8px")}>New password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={css("width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);font-size:15px;font-family:inherit;padding:13px 14px;border-radius:12px")}
              />
            </label>
            <button type="submit" disabled={loading} className={"btn btn--primary btn--lg btn--block" + (loading ? " btn--loading" : "")}>
              Update password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
