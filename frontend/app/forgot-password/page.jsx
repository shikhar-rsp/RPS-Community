'use client';
import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import SiteShell from '@/components/community/SiteShell';
import { createClient } from '@/lib/supabase/client';
import { siteUrl } from '@/lib/site-url';
import { isValidEmail, suggestEmail } from '@/lib/email';
import { FieldError } from '@/components/community/AuthBits';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ForgotInner />
    </Suspense>
  );
}

const COOLDOWN_SECONDS = 60;

function ForgotInner() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const emailError = !email.trim()
    ? 'We need your email address.'
    : isValidEmail(email) ? null : 'That email doesn’t look right.';
  const shownError = touched ? emailError : null;
  const suggestion = suggestEmail(email);

  const send = async (e) => {
    if (e) e.preventDefault();
    setTouched(true);
    setError('');
    if (emailError) return;
    if (cooldown > 0) return;

    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: siteUrl('/reset-password') }
    );
    setLoading(false);

    // Deliberately NOT branching on `err` for the user-facing copy. Supabase
    // does not reveal whether an address exists, and neither do we — the same
    // confirmation shows either way, so this page can't be used to find out who
    // has an account. A genuine transport failure is the one thing worth
    // surfacing, since retrying is the right response to it.
    if (err && /network|fetch|timeout/i.test(err.message || '')) {
      setError('Something went wrong. Please try again.');
      return;
    }
    setSent(true);
    setCooldown(COOLDOWN_SECONDS);
  };

  return (
    <SiteShell active="login">
      <div className="wrap auth-page">
        <div>
          <div className="authbox">
            {!sent ? (
              <>
                <h2>Reset your password</h2>
                <p>Enter your email and we&rsquo;ll send you a reset link.</p>

                {error && <div className="banner" role="alert" style={{ textAlign: 'left' }}>{error}</div>}

                <form onSubmit={send} noValidate>
                  <div className="field">
                    <label htmlFor="fp-email">Your email</label>
                    <input id="fp-email" type="email" inputMode="email" autoComplete="email" autoFocus
                      value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      onBlur={() => setTouched(true)}
                      aria-invalid={shownError ? 'true' : undefined}
                      aria-describedby={shownError ? 'fp-email-err' : undefined}
                      placeholder="you@email.com" />
                    <FieldError id="fp-email-err" message={shownError} />
                    {!shownError && suggestion && (
                      <div className="hint">
                        Did you mean{' '}
                        <button type="button" className="linkish" onClick={() => setEmail(suggestion)}
                          style={{ padding: 0, minHeight: 0 }}>{suggestion}</button>?
                      </div>
                    )}
                  </div>
                  <button className="btn full go" type="submit" disabled={loading}>
                    {loading ? 'Sending…' : 'Send reset link'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="lockicon" aria-hidden="true">✉️</div>
                <h2>Check your inbox</h2>
                <p role="status">
                  If an account exists for that email, we&rsquo;ve sent a reset link. Check your inbox
                  and your spam folder.
                </p>

                {error && <div className="banner" role="alert" style={{ textAlign: 'left' }}>{error}</div>}

                <button className="btn full quiet" type="button" onClick={send}
                  disabled={loading || cooldown > 0}>
                  {cooldown > 0 ? `Resend in ${cooldown}s` : loading ? 'Sending…' : 'Resend the link'}
                </button>
                <small>The link works once and expires after an hour.</small>
              </>
            )}
          </div>

          <p className="micro" style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href={`/signin${email ? `?email=${encodeURIComponent(email)}` : ''}`}>← Back to log in</Link>
          </p>
        </div>
      </div>
    </SiteShell>
  );
}
