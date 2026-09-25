'use client';
import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteShell from '@/components/community/SiteShell';
import { useDcLogic } from '@/lib/dc';
import Logic from '@/lib/logic/onboarding';
import { createClient } from '@/lib/supabase/client';
import { siteUrl } from '@/lib/site-url';
import { markAuthPending } from '@/lib/community/authLanding';
import { clearClientState, markReturningVisitor } from '@/lib/community/session-state';
import { GoogleMark, OrDivider, FieldError } from '@/components/community/AuthBits';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OnboardingInner />
    </Suspense>
  );
}

function safeNext(raw) {
  const wanted = String(raw || '');
  if (!wanted.startsWith('/') || wanted.startsWith('//')) return '/dashboard';
  const path = wanted.split(/[?#]/)[0];
  if (!path || path === '/' || path === '/signin') return '/dashboard';
  return wanted;
}

function OnboardingInner() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();

  // 'complete' = already-authenticated user (e.g. Google) filling in their
  // profile. Default = full email/password signup wizard.
  const mode = searchParams.get('mode') === 'complete' ? 'complete' : 'signup';
  // The last step's button says "Go to my workshops", so that is where it has
  // to land. A `next` is only honoured when it is a real destination someone
  // was on their way to — a relative path that isn't the landing page, which is
  // simply where most people happen to be when the form catches them.
  const next = safeNext(searchParams.get('next'));
  const [initialName, setInitialName] = useState('');

  // In complete mode, pre-fill the name from the signed-in identity.
  useEffect(() => {
    if (mode !== 'complete') return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      const n = user?.user_metadata?.name || user?.user_metadata?.full_name || '';
      if (n) setInitialName(n);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  /* Where the answers land: the nullable columns from profile-fields.sql.
     `role`, `goals` and `tools` came from the old second step and are left
     alone — not written as nulls over anything an older account already has.

     `terms_accepted_at` is what marks the account as done signing up (see
     hasCompletedOnboarding in lib/supabase/middleware.js); `onboarded` in the
     auth metadata is the same fact, readable without a query. */
  const profileRow = (d) => ({
    name: d.name,
    mobile: d.mobile,
    organisation: d.organisation,
    terms_accepted_at: d.termsAcceptedAt,
  });
  const authMeta = (d) => ({ name: d.name, onboarded: true });

  const onSignup = async (d) => {
    const { data, error } = await supabase.auth.signUp({
      email: d.email,
      password: d.password,
      options: {
        data: authMeta(d),
        emailRedirectTo: siteUrl('/auth/callback'),
      },
    });

    if (error) {
      // The one failure worth rewriting: this email already has an account, so
      // the answer is the login box, not a different password.
      if (/already registered|already exists|already been registered/i.test(error.message || '')) {
        return { ok: false, duplicate: true };
      }
      return { ok: false, error: error.message };
    }

    // Supabase's enumeration-safe signal: an address that already exists comes
    // back as a "success" with no identities attached rather than as an error.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { ok: false, duplicate: true };
    }

    if (data.session) {
      // Email confirmation disabled: the session exists, so write the profile.
      const { data: rows } = await supabase
        .from('profiles')
        .upsert({ id: data.user.id, ...profileRow(d) }, { onConflict: 'id' })
        .select('id');
      if (!rows || rows.length === 0) {
        return { ok: false, error: 'Your account was created but the profile did not save. Please log in and try again.' };
      }
      markReturningVisitor();
      return { ok: true, needsConfirm: false };
    }

    // Confirmation is ON, so there is no session and RLS won't let us write the
    // profile yet. signUp parked the answers in user_metadata, and the
    // handle_new_user trigger copies them across.
    markReturningVisitor();
    return { ok: true, needsConfirm: true };
  };

  // Complete mode: already signed in — just save the answers.
  const onComplete = async (d) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: 'Your session expired. Please log in again.' };
    await supabase.auth.updateUser({ data: authMeta(d) });
    // upsert, not update: the profiles row is normally made by the
    // on_auth_user_created trigger, but if it is ever missing an UPDATE matches
    // zero rows and returns no error — reporting success while leaving the
    // profile unfinished, which the onboarding gate then bounces straight back
    // here forever.
    const { data: rows, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...profileRow(d) }, { onConflict: 'id' })
      .select('id');
    if (error) return { ok: false, error: error.message };
    if (!rows || rows.length === 0) {
      return { ok: false, error: 'We could not save your profile. Please log in again.' };
    }
    markReturningVisitor();
    return { ok: true, needsConfirm: false };
  };

  const onFinish = mode === 'complete' ? onComplete : onSignup;
  const goDashboard = () => { router.push(next); router.refresh(); };

  const onGoogle = async () => {
    // A new identity is about to own this browser — drop whatever the last one
    // left behind before the round trip.
    clearClientState();
    markAuthPending();
    markReturningVisitor();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: siteUrl(`/auth/callback?next=${encodeURIComponent(next)}`) },
    });
  };

  const v = useDcLogic(Logic, { onFinish, goDashboard, mode, initialName });
  const loginHref = `/signin?next=${encodeURIComponent(next)}`;

  return (
    <SiteShell active="login">
      <div className="wrap ob-wrap">
        {/* One step: the account, then straight on to where they were going. */}
        {v.isStep1 && (
          <div className="ob-card">
            <h1>{v.isComplete ? 'Finish your profile' : 'Create your RPS account'}</h1>
            <p>
              {v.isComplete
                ? 'A few details and you’re in.'
                : 'Join the community and register for workshops.'}
            </p>

            {!v.isComplete && (
              <>
                <button className="oauth" type="button" onClick={onGoogle}>
                  <GoogleMark />
                  Continue with Google
                </button>
                <OrDivider>or sign up with email</OrDivider>
              </>
            )}

            {v.duplicateEmail && (
              <div className="banner dup" role="alert">
                <span>An account with this email already exists.</span>
                <Link
                  className="btn sm"
                  href={`/signin?email=${encodeURIComponent(v.duplicateEmail)}&next=${encodeURIComponent(next)}`}
                >
                  Log in instead
                </Link>
              </div>
            )}
            {v.error && <div className="banner" role="alert" style={{ textAlign: 'left' }}>{v.error}</div>}

            <form noValidate onSubmit={(e) => { e.preventDefault(); v.onNext(); }}>
              <div className="field">
                <label htmlFor="ob-name">Full name</label>
                <input id="ob-name" type="text" autoComplete="name" value={v.name}
                  onChange={v.onName} onBlur={v.onBlur('name')}
                  aria-invalid={v.err('name') ? 'true' : undefined}
                  aria-describedby={v.err('name') ? 'ob-name-err' : undefined}
                  placeholder="What should we call you?" />
                <FieldError id="ob-name-err" message={v.err('name')} />
              </div>

              {!v.isComplete && (
                <div className="field">
                  <label htmlFor="ob-email">Email</label>
                  <input id="ob-email" type="email" inputMode="email" autoComplete="email" value={v.email}
                    onChange={v.onEmail} onBlur={v.onBlur('email')}
                    aria-invalid={v.err('email') ? 'true' : undefined}
                    aria-describedby={v.err('email') ? 'ob-email-err' : undefined}
                    placeholder="you@email.com" />
                  <FieldError id="ob-email-err" message={v.err('email')} />
                  {!v.err('email') && v.emailSuggestion && (
                    <div className="hint">
                      Did you mean{' '}
                      <button type="button" className="linkish" onClick={v.acceptEmailSuggestion}
                        style={{ padding: 0, minHeight: 0 }}>{v.emailSuggestion}</button>?
                    </div>
                  )}
                </div>
              )}

              <div className="field">
                <label htmlFor="ob-mobile">Mobile number</label>
                <input id="ob-mobile" type="tel" inputMode="tel" autoComplete="tel" value={v.mobile}
                  onChange={v.onMobile} onBlur={v.onBlur('mobile')}
                  aria-invalid={v.err('mobile') ? 'true' : undefined}
                  aria-describedby={v.err('mobile') ? 'ob-mobile-err' : 'ob-mobile-hint'}
                  placeholder="+91 98765 43210" />
                <FieldError id="ob-mobile-err" message={v.err('mobile')} />
                {!v.err('mobile') && (
                  <div className="hint" id="ob-mobile-hint">With your country code. Workshop reminders go here.</div>
                )}
              </div>

              {!v.isComplete && (
                <>
                  <div className="field">
                    <label htmlFor="ob-pass">Password</label>
                    <div className="pw-wrap">
                      <input id="ob-pass" type={v.showPassword ? 'text' : 'password'} autoComplete="new-password"
                        value={v.password} onChange={v.onPassword} onBlur={v.onBlur('password')}
                        aria-invalid={v.err('password') ? 'true' : undefined}
                        aria-describedby="ob-pass-rules"
                        placeholder="At least 8 characters" />
                      <button type="button" className="pw-toggle" onClick={v.toggleShowPassword}
                        aria-pressed={v.showPassword}
                        aria-label={v.showPassword ? 'Hide password' : 'Show password'}>
                        {v.showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {!!v.password && (
                      <div className="pw-meter" aria-hidden="true">
                        <i data-score={v.passwordScore} style={{ width: v.passwordScore * 25 + '%' }} />
                      </div>
                    )}
                    <div className="hint" id="ob-pass-rules">
                      {v.password ? (
                        <>
                          <b>{v.passwordStrength}</b>{' — '}
                          {v.passwordRules.map((r) => (
                            <span key={r.id} className={r.met ? 'pw-ok' : undefined}>
                              {r.met ? '✓' : '•'} {r.label}{' '}
                            </span>
                          ))}
                        </>
                      ) : (
                        'At least 8 characters, with a letter and a number.'
                      )}
                    </div>
                    <FieldError id="ob-pass-err" message={v.err('password')} />
                  </div>

                  <div className="field">
                    <label htmlFor="ob-confirm">Confirm password</label>
                    <input id="ob-confirm" type={v.showPassword ? 'text' : 'password'} autoComplete="new-password"
                      value={v.confirm} onChange={v.onConfirm} onBlur={v.onBlur('confirm')}
                      aria-invalid={v.err('confirm') ? 'true' : undefined}
                      aria-describedby={v.err('confirm') ? 'ob-confirm-err' : undefined}
                      placeholder="Type it again" />
                    <FieldError id="ob-confirm-err" message={v.err('confirm')} />
                  </div>
                </>
              )}

              <div className="field">
                <label htmlFor="ob-org">College or organisation</label>
                <input id="ob-org" type="text" autoComplete="organization" value={v.organisation}
                  onChange={v.onOrganisation} onBlur={v.onBlur('organisation')}
                  aria-invalid={v.err('organisation') ? 'true' : undefined}
                  aria-describedby={v.err('organisation') ? 'ob-org-err' : undefined}
                  placeholder="Where you study or work" />
                <FieldError id="ob-org-err" message={v.err('organisation')} />
              </div>

              <div className="field">
                <label className="check-row" htmlFor="ob-terms">
                  <input id="ob-terms" type="checkbox" checked={v.terms} onChange={v.onTerms}
                    onBlur={v.onBlur('terms')}
                    aria-invalid={v.err('terms') ? 'true' : undefined}
                    aria-describedby={v.err('terms') ? 'ob-terms-err' : undefined} />
                  <span>
                    I agree to the <Link href="/terms">Terms</Link> and{' '}
                    <Link href="/privacy">Privacy policy</Link>.
                  </span>
                </label>
                <FieldError id="ob-terms-err" message={v.err('terms')} />
              </div>

              <div className="ob-actions end">
                <button className="btn go" type="submit" disabled={v.continueDisabled}>
                  {v.submitting ? (v.isComplete ? 'Saving…' : 'Creating your account…') : v.submitLabel}
                </button>
              </div>
            </form>

            {!v.isComplete && (
              <p className="micro" style={{ textAlign: 'center', marginTop: 18 }}>
                Already have an account? <Link href={loginHref}>Log in</Link>
              </p>
            )}
          </div>
        )}

        {/* ------------------------------------------------------- done */}
        {v.isDone && (
          <div className="ob-card ob-done">
            <div className="tick" aria-hidden="true">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            {v.needsEmailConfirm ? (
              <>
                <h1>Check your email{v.nameSuffix}.</h1>
                <p>
                  We&rsquo;ve sent a confirmation link to <b>{v.email}</b>. Click it and you&rsquo;re in.
                  If it isn&rsquo;t there in a minute, check your spam folder.
                </p>
                <Link className="btn full go" href={`/signin?email=${encodeURIComponent(v.email)}`}>
                  Go to log in
                </Link>
              </>
            ) : (
              <>
                <h1>You&rsquo;re in{v.nameSuffix}.</h1>
                <p>{v.summary}</p>
                <button className="btn full go" type="button" onClick={v.goDashboard}>
                  Go to my workshops
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
