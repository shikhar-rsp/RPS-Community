'use client';
import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteShell from '@/components/community/SiteShell';
import { createClient } from '@/lib/supabase/client';
import { passwordError, passwordScore, STRENGTH_LABELS, PASSWORD_RULES } from '@/lib/password';
import { clearClientState } from '@/lib/community/session-state';
import { FieldError } from '@/components/community/AuthBits';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResetInner />
    </Suspense>
  );
}

/* Where the Supabase password-reset email lands.
   The link carries a single-use recovery token that Supabase turns into a
   short-lived session. `phase` tracks what we know about it:

     checking — still resolving the link
     ready    — the token was good; collect the new password
     invalid  — expired, already used, or tampered with
     done     — password changed
*/
function ResetInner() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [phase, setPhase] = useState('checking');
  // why a link failed: 'expired' | 'wrong-browser' | 'unknown'
  const [reason, setReason] = useState('expired');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState({});
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    let stop = () => {};

    (async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ''));

      // Supabase reports a genuinely dead link in the query or the hash.
      const urlError = url.searchParams.get('error_description') || url.searchParams.get('error')
        || hash.get('error_description') || hash.get('error');
      if (urlError) {
        if (alive) { setReason(/expired|invalid/i.test(urlError) ? 'expired' : 'unknown'); setPhase('invalid'); }
        return;
      }

      const hasSession = async () => {
        const { data } = await supabase.auth.getSession();
        return !!data.session;
      };

      // Catch the exchange the client may be doing on its own right now.
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        if (session && alive) setPhase('ready');
      });
      stop = () => sub?.subscription?.unsubscribe();

      // IMPORTANT: look for a session BEFORE trying to redeem the code.
      // createBrowserClient runs detectSessionInUrl by default and consumes the
      // ?code= itself. Redeeming a single-use code a second time fails, and
      // treating that failure as "expired" is what made good links look dead.
      for (let i = 0; i < 12; i++) {
        if (!alive) return;
        if (await hasSession()) { setPhase('ready'); return; }
        await new Promise((r) => setTimeout(r, 250));
      }

      // No session after 3s: the client either isn't handling it or failed.
      // Now it's safe to redeem the code ourselves.
      const code = url.searchParams.get('code');
      if (code) {
        const { error: err } = await supabase.auth.exchangeCodeForSession(code);
        if (!alive) return;
        if (!err) { setPhase('ready'); return; }
        // One last look — the client may have won the race while we waited.
        if (await hasSession()) { setPhase('ready'); return; }
        // A PKCE link can only be redeemed by the browser that asked for it:
        // the code_verifier lives here. Opened on another device or after
        // clearing site data, the code is fine but unusable — which is a
        // different problem from an expired link, and needs different advice.
        setReason(/verifier|challenge/i.test(err.message || '') ? 'wrong-browser' : 'expired');
        setPhase('invalid');
        return;
      }

      if (alive) { setReason('expired'); setPhase('invalid'); }
    })();

    return () => { alive = false; stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pwErr = passwordError(password);
  const confirmErr = !confirm ? 'Type the password again.' : confirm === password ? null : 'Those don’t match.';
  const showErr = (k, msg) => (touched[k] ? msg : null);
  const score = passwordScore(password);

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    setError('');
    if (pwErr || confirmErr) return;

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setLoading(false);
      setError(/expired|invalid|not found/i.test(err.message) ? '' : err.message);
      if (/expired|invalid|not found/i.test(err.message)) setPhase('invalid');
      return;
    }

    // Anyone else holding a session on this account is holding it on the old
    // password — a reset should end those, not just change the credential.
    try {
      await supabase.auth.signOut({ scope: 'others' });
    } catch {
      /* best effort; the password is already changed */
    }
    // The previous occupant's cached seats/flags must not follow the new one.
    clearClientState();

    setLoading(false);
    setPhase('done');
  };

  return (
    <SiteShell active="login">
      <div className="wrap auth-page">
        <div>
          <div className="authbox">
            {phase === 'checking' && (
              <>
                <h2>Checking your link…</h2>
                <p role="status">One moment.</p>
              </>
            )}

            {phase === 'invalid' && reason === 'wrong-browser' && (
              <>
                <div className="lockicon" aria-hidden="true">🧭</div>
                <h2>Open this link where you asked for it</h2>
                <p>
                  For your security the link can only be opened in the same browser that requested
                  it. It looks like this one was opened somewhere else — on another device, or after
                  the browser data was cleared.
                </p>
                <Link className="btn full go" href="/forgot-password">Ask for a new link here</Link>
                <small>Then open it in this browser.</small>
              </>
            )}

            {phase === 'invalid' && reason !== 'wrong-browser' && (
              <>
                <div className="lockicon" aria-hidden="true">⏳</div>
                <h2>This reset link has expired</h2>
                <p>
                  Reset links work once and last an hour. Ask for a fresh one and it&rsquo;ll be in
                  your inbox in a minute.
                </p>
                <Link className="btn full go" href="/forgot-password">Send me a new link</Link>
                <small><Link href="/signin">Back to log in</Link></small>
              </>
            )}

            {phase === 'ready' && (
              <>
                <div className="lockicon" aria-hidden="true">🔒</div>
                <h2>Set a new password</h2>
                <p>Pick something you haven&rsquo;t used anywhere else.</p>

                {error && <div className="banner" role="alert" style={{ textAlign: 'left' }}>{error}</div>}

                <form onSubmit={submit} noValidate>
                  <div className="field">
                    <label htmlFor="rp-pass">New password</label>
                    <div className="pw-wrap">
                      <input id="rp-pass" type={show ? 'text' : 'password'} autoComplete="new-password" autoFocus
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                        aria-invalid={showErr('password', pwErr) ? 'true' : undefined}
                        aria-describedby="rp-pass-rules"
                        placeholder="At least 8 characters" />
                      <button type="button" className="pw-toggle" onClick={() => setShow((s) => !s)}
                        aria-pressed={show} aria-label={show ? 'Hide password' : 'Show password'}>
                        {show ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {!!password && (
                      <div className="pw-meter" aria-hidden="true">
                        <i data-score={score} style={{ width: score * 25 + '%' }} />
                      </div>
                    )}
                    <div className="hint" id="rp-pass-rules">
                      {password ? (
                        <>
                          <b>{STRENGTH_LABELS[score]}</b>{' — '}
                          {PASSWORD_RULES.map((r) => (
                            <span key={r.id} className={r.test(password) ? 'pw-ok' : undefined}>
                              {r.test(password) ? '✓' : '•'} {r.label}{' '}
                            </span>
                          ))}
                        </>
                      ) : (
                        'At least 8 characters, with a letter and a number.'
                      )}
                    </div>
                    <FieldError id="rp-pass-err" message={showErr('password', pwErr)} />
                  </div>

                  <div className="field">
                    <label htmlFor="rp-confirm">Confirm password</label>
                    <input id="rp-confirm" type={show ? 'text' : 'password'} autoComplete="new-password"
                      value={confirm} onChange={(e) => setConfirm(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                      aria-invalid={showErr('confirm', confirmErr) ? 'true' : undefined}
                      aria-describedby={showErr('confirm', confirmErr) ? 'rp-confirm-err' : undefined}
                      placeholder="Type it again" />
                    <FieldError id="rp-confirm-err" message={showErr('confirm', confirmErr)} />
                  </div>

                  <button className="btn full go" type="submit" disabled={loading}>
                    {loading ? 'Saving…' : 'Save new password'}
                  </button>
                </form>
              </>
            )}

            {phase === 'done' && (
              <>
                <div className="lockicon" aria-hidden="true">✓</div>
                <h2>Password updated</h2>
                <p role="status">
                  You&rsquo;re signed in on this device. Anywhere else that was signed in has been
                  signed out.
                </p>
                <button className="btn full go" type="button"
                  onClick={() => { router.push('/dashboard'); router.refresh(); }}>
                  Go to my workshops
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
