'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteShell from '@/components/community/SiteShell';
import { createClient } from '@/lib/supabase/client';

// Landing page for the Supabase password-reset email link. The email link
// establishes a temporary session; here the user sets a new password.
export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
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
      router.push('/dashboard');
      router.refresh();
    }, 1200);
  };

  return (
    <SiteShell active="login">
      <div className="wrap auth-page">
        <div>
          <div className="authbox">
            {done ? (
              <>
                <div className="lockicon" aria-hidden="true">✓</div>
                <h2>Password changed</h2>
                <p>Taking you to your workshops…</p>
              </>
            ) : (
              <>
                <div className="lockicon" aria-hidden="true">🔒</div>
                <h2>Set a new password</h2>
                <p>Pick something you haven&rsquo;t used anywhere else.</p>

                {error && (
                  <div className="banner" role="alert" style={{ textAlign: 'left' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={onSubmit} noValidate>
                  <div className="field">
                    <label htmlFor="rp-pass">New password</label>
                    <input
                      id="rp-pass"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button className="btn full go" type="submit" disabled={loading}>
                    {loading ? 'Saving…' : 'Save password'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
