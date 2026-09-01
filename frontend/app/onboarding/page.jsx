'use client';
import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteShell from '@/components/community/SiteShell';
import { useDcLogic } from '@/lib/dc';
import Logic from '@/lib/logic/onboarding';
import { createClient } from '@/lib/supabase/client';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OnboardingInner />
    </Suspense>
  );
}

const ROLE_ICON = {
  student: (
    <>
      <path d="M22 10L12 5 2 10l10 5 10-5z" />
      <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
    </>
  ),
  switcher: (
    <>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </>
  ),
  junior: (
    <>
      <path d="M12 22V12" />
      <path d="M12 12C12 8 9 5 5 5c0 4 3 7 7 7z" />
      <path d="M12 10c0-3.3 2.7-6 6-6 0 3.3-2.7 6-6 6z" />
    </>
  ),
  senior: (
    <>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </>
  ),
  lead: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
};

function OnboardingInner() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();

  // 'complete' = already-authenticated user (e.g. Google) filling in their
  // profile. Default = full email/password signup wizard.
  const mode = searchParams.get('mode') === 'complete' ? 'complete' : 'signup';
  const next = searchParams.get('next') || '/dashboard';
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

  // Signup mode: create the Supabase account from the wizard's collected data.
  const onSignup = async ({ email, password, name, role, goals, tools }) => {
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
      const { data: rows } = await supabase
        .from('profiles')
        .upsert({ id: data.user.id, name, role, goals, tools }, { onConflict: 'id' })
        .select('id');
      if (!rows || rows.length === 0) {
        return { ok: false, error: 'Your account was created but the profile did not save. Please sign in and try again.' };
      }
      return { ok: true, needsConfirm: false };
    }
    return { ok: true, needsConfirm: true };
  };

  // Complete mode: the user is already signed in — just save their answers to
  // the profile (and keep user_metadata in sync).
  const onComplete = async ({ name, role, goals, tools }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: 'Your session expired. Please sign in again.' };
    await supabase.auth.updateUser({ data: { name, role, goals, tools } });
    // upsert, not update: the profiles row is normally made by the
    // on_auth_user_created trigger, but if it is ever missing an UPDATE matches
    // zero rows and returns no error — reporting success while leaving `role`
    // unset, which the onboarding gate then bounces straight back here forever.
    // Creating it needs the INSERT grant from supabase/profile-repair.sql.
    // .select() so a write that lands nowhere is still visible.
    const { data: rows, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, name, role, goals, tools }, { onConflict: 'id' })
      .select('id');
    if (error) return { ok: false, error: error.message };
    if (!rows || rows.length === 0) {
      return { ok: false, error: 'We could not save your profile. Please sign in again.' };
    }
    return { ok: true, needsConfirm: false };
  };

  const onFinish = mode === 'complete' ? onComplete : onSignup;

  const goDashboard = () => {
    router.push(next);
    router.refresh();
  };

  const v = useDcLogic(Logic, { onFinish, goDashboard, mode, initialName });

  return (
    <SiteShell active="login">
      <div className="wrap ob-wrap">
        <div className="ob-rail" aria-hidden="true">
          {[1, 2, 3, 4].map((n) => (
            <i key={n}>
              <b style={{ width: v.step >= n ? '100%' : '0%' }} />
            </i>
          ))}
        </div>

        {/* ------------------------------------------------------- step 1 */}
        {v.isStep1 && (
          <div className="ob-card">
            <span className="eyebrow bare">Step 1 of 3</span>
            <h1>Welcome</h1>
            <p>First, tell us where you are in your design journey.</p>

            <div className="field">
              <label htmlFor="ob-name">Your name</label>
              <input
                id="ob-name"
                type="text"
                autoComplete="name"
                placeholder="What should we call you?"
                value={v.name}
                onChange={v.onName}
              />
            </div>

            {!v.isComplete && (
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="ob-email">Email</label>
                  <input
                    id="ob-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@email.com"
                    value={v.email}
                    onChange={v.onEmail}
                  />
                </div>
                <div className="field">
                  <label htmlFor="ob-pass">Password</label>
                  <input
                    id="ob-pass"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={v.password}
                    onChange={v.onPassword}
                  />
                </div>
              </div>
            )}

            <span className="eyebrow bare">I am a…</span>
            <div className="ob-roles">
              {v.roles.map((r) => (
                <button
                  key={r.id}
                  className="ob-role"
                  type="button"
                  aria-pressed={v.role === r.id}
                  onClick={() => v.selectRole(r.id)}
                >
                  <span className="ico">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {ROLE_ICON[r.id]}
                    </svg>
                  </span>
                  <span>
                    <b>{r.title}</b>
                    <small>{r.desc}</small>
                  </span>
                </button>
              ))}
            </div>

            {v.error && (
              <div className="banner" role="alert" style={{ marginTop: 18 }}>
                {v.error}
              </div>
            )}

            <div className="ob-actions end">
              <button className="btn go" type="button" onClick={v.onNext} disabled={v.continueDisabled}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- step 2 */}
        {v.isStep2 && (
          <div className="ob-card">
            <span className="eyebrow bare">Step 2 of 3</span>
            <h1>What are you here for?</h1>
            <p>Pick all that apply — we&rsquo;ll personalise your home.</p>
            <div className="ob-chips">
              {v.goalsList.map((g) => (
                <button
                  key={g}
                  className="ob-chip"
                  type="button"
                  aria-pressed={v.goals.includes(g)}
                  onClick={() => v.toggleGoal(g)}
                >
                  {g}
                </button>
              ))}
            </div>
            <div className="ob-actions">
              <button className="btn quiet" type="button" onClick={v.onBack}>
                Back
              </button>
              <button className="btn go" type="button" onClick={v.onNext} disabled={v.continueDisabled}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- step 3 */}
        {v.isStep3 && (
          <div className="ob-card">
            <span className="eyebrow bare">Step 3 of 3</span>
            <h1>Which tools do you use?</h1>
            <p>We&rsquo;ll surface guides and posts for these first.</p>
            <div className="ob-chips">
              {v.toolsList.map((t) => (
                <button
                  key={t}
                  className="ob-chip"
                  type="button"
                  aria-pressed={v.tools.includes(t)}
                  onClick={() => v.toggleTool(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {v.error && (
              <div className="banner" role="alert" style={{ marginTop: 18 }}>
                {v.error}
              </div>
            )}
            <div className="ob-actions">
              <button className="btn quiet" type="button" onClick={v.onBack}>
                Back
              </button>
              <button className="btn go" type="button" onClick={v.onNext} disabled={v.continueDisabled}>
                {v.submitting ? 'Working…' : v.submitLabel}
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- step 4 */}
        {v.isStep4 && (
          <div className="ob-card ob-done">
            <div className="tick" aria-hidden="true">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            {v.needsEmailConfirm ? (
              <>
                <h1>Check your email{v.nameSuffix}.</h1>
                <p>
                  We sent a confirmation link. Click it to activate your account, then log in.
                </p>
                <Link className="btn full go" href="/signin">
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

        <p className="micro" style={{ textAlign: 'center', marginTop: 20 }}>
          Already have an account? <Link href="/signin">Log in</Link>
        </p>
      </div>
    </SiteShell>
  );
}
