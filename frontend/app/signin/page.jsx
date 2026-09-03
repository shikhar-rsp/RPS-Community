'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteShell from '@/components/community/SiteShell';
import { createClient } from '@/lib/supabase/client';
import { siteUrl } from '@/lib/site-url';

/* Log in is a page of its own, not a modal. Every gated action leaves for here
   carrying where to come back to, and comes back to finish the job.

   The three ways in — Google, email + password, and a one-time code over
   WhatsApp or SMS — are the SAME Supabase calls this screen has always made.
   Only the surface around them is new. */

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  );
}

/* What sent them here, so the box can say why it's asking. */
function intentCopy(next) {
  if (/action=enroll/.test(next)) return 'Saving your seat. Two taps, you’re back here.';
  if (/#recording|[?&]res=/.test(next)) return 'It’s free — we just like knowing who’s watching.';
  return 'For seats, recordings, and files.';
}

const GOOGLE_SVG = (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C36.9 40.2 44 35 44 24c0-1.3-.1-2.6-.4-3.9z" />
  </svg>
);

const WHATSAPP_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-8.6 15.06L2 22l5.06-1.33A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3 .79.8-2.92-.2-.31A8.2 8.2 0 1 1 12 20.2z" />
  </svg>
);

function SignInInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  // Phone / OTP sign-in. view: 'main' | 'phone' | 'otp'. channel: 'whatsapp' | 'sms'.
  const [view, setView] = useState('main');
  const [phone, setPhone] = useState('+91');
  const [channel, setChannel] = useState('whatsapp');
  const [otp, setOtp] = useState('');

  const next = searchParams.get('next') || '/dashboard';

  // Keep only digits and a leading '+', then require E.164 (e.g. +919876543210).
  const normalizePhone = (p) => String(p || '').replace(/[^\d+]/g, '');
  const phoneValid = (p) => /^\+[1-9]\d{7,14}$/.test(normalizePhone(p));

  const goPhone = () => { setError(''); setNotice(''); setView('phone'); };
  const backToMain = () => { setError(''); setNotice(''); setView('main'); };

  const sendCode = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setNotice('');
    const ph = normalizePhone(phone);
    if (!phoneValid(ph)) {
      setError('Enter your number in international format, e.g. +919876543210.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: ph, options: { channel } });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setNotice(`Code sent via ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} to ${ph}.`);
    setOtp('');
    setView('otp');
  };

  const verifyCode = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setNotice('');
    const token = otp.trim();
    if (token.length < 4) {
      setError('Enter the code you received.');
      return;
    }
    setLoading(true);
    // For phone auth the verify type is always 'sms', even on the WhatsApp channel.
    const { error } = await supabase.auth.verifyOtp({ phone: normalizePhone(phone), token, type: 'sms' });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // New phone users have no role yet; the dashboard guard routes them to onboarding.
    router.push(next);
    router.refresh();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
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
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: siteUrl(`/auth/callback?next=${encodeURIComponent(next)}`),
      },
    });
    if (error) setError(error.message);
  };
  const onGoogle = () => onOAuth('google');

  const onForgot = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (!email) {
      setError('Enter your email above first, then click Forgot.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: siteUrl('/reset-password'),
    });
    if (error) setError(error.message);
    else setNotice('Password reset link sent — check your email.');
  };

  return (
    <SiteShell active="login">
      <div className="wrap auth-page">
        <div>
          <div className="authbox">
            {view === 'main' && (
              <>
                <h2>Log in to RPS Cohorts</h2>
                <p>{intentCopy(next)}</p>

                {error && (
                  <div className="banner" role="alert" style={{ textAlign: 'left' }}>
                    {error}
                  </div>
                )}
                {notice && (
                  <div className="banner info" role="status" style={{ textAlign: 'left' }}>
                    {notice}
                  </div>
                )}

                <button className="oauth" type="button" onClick={onGoogle}>
                  {GOOGLE_SVG}
                  Continue with Google
                </button>
                {/* <button className="oauth" type="button" onClick={goPhone}>
                  {WHATSAPP_SVG}
                  Continue with WhatsApp
                </button> */}

                <div className="or">
                  <span>or use email</span>
                </div>

                <form onSubmit={onSubmit} noValidate>
                  <div className="field">
                    <label htmlFor="si-email">Your email</label>
                    <input
                      id="si-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="si-pass">
                      Password
                      <a
                        href="#"
                        onClick={onForgot}
                        style={{ float: 'right', fontWeight: 600, fontSize: '.8rem' }}
                      >
                        Forgot?
                      </a>
                    </label>
                    <input
                      id="si-pass"
                      type="password"
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button className="btn full go" type="submit" disabled={loading}>
                    {loading ? 'Signing in…' : 'Log in'}
                  </button>
                </form>

              </>
            )}

            {view === 'phone' && (
              <>
                <h2>Log in with your phone</h2>
                <p>We&rsquo;ll send a one-time code to check it&rsquo;s you.</p>

                {error && (
                  <div className="banner" role="alert" style={{ textAlign: 'left' }}>
                    {error}
                  </div>
                )}

                <div className="channel-row">
                  <button
                    className="channel"
                    type="button"
                    aria-pressed={channel === 'whatsapp'}
                    onClick={() => setChannel('whatsapp')}
                  >
                    {WHATSAPP_SVG}
                    WhatsApp
                  </button>
                  <button
                    className="channel"
                    type="button"
                    aria-pressed={channel === 'sms'}
                    onClick={() => setChannel('sms')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    SMS
                  </button>
                </div>

                <form onSubmit={sendCode} noValidate>
                  <div className="field">
                    <label htmlFor="si-phone">Phone number</label>
                    <input
                      id="si-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <div className="hint">Include your country code, e.g. +91 for India.</div>
                  </div>
                  <button className="btn full go" type="submit" disabled={loading}>
                    {loading ? 'Sending…' : 'Send me a code'}
                  </button>
                </form>

                <button className="linkish" type="button" onClick={backToMain}>
                  ← Back to the other ways in
                </button>
              </>
            )}

            {view === 'otp' && (
              <>
                <div className="lockicon" aria-hidden="true">✉️</div>
                <h2>Check your {channel === 'whatsapp' ? 'WhatsApp' : 'messages'}</h2>
                <p>
                  Sent to <b>{normalizePhone(phone)}</b>.
                </p>

                {error && (
                  <div className="banner" role="alert" style={{ textAlign: 'left' }}>
                    {error}
                  </div>
                )}
                {notice && (
                  <div className="banner info" role="status" style={{ textAlign: 'left' }}>
                    {notice}
                  </div>
                )}

                <form onSubmit={verifyCode} noValidate>
                  <div className="field">
                    <label htmlFor="si-otp">The code</label>
                    <input
                      id="si-otp"
                      className="code-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="000000"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <button className="btn full go" type="submit" disabled={loading}>
                    {loading ? 'Checking…' : 'Confirm'}
                  </button>
                </form>

                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    marginTop: 6,
                  }}
                >
                  <button className="linkish" type="button" onClick={sendCode}>
                    Send it again
                  </button>
                  <button className="linkish" type="button" onClick={() => setView('phone')}>
                    Use a different number
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
