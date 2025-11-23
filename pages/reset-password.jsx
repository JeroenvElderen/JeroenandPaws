import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

const PageContainer = ({ children }) => (
  <main
    style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 20% 20%, rgba(94, 234, 212, 0.18), transparent 25%),\n        radial-gradient(circle at 80% 0%, rgba(129, 140, 248, 0.18), transparent 25%),\n        #f8fafc',
      padding: '32px 16px 48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </main>
);

const Card = ({ children }) => (
  <section
    style={{
      background: '#ffffff',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
      border: '1px solid #e5e7eb',
      width: '100%',
      maxWidth: '480px',
    }}
  >
    {children}
  </section>
);

const fieldStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  fontSize: '1rem',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  fontWeight: 600,
  color: '#111827',
  marginBottom: '6px',
};

const buttonStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: 'none',
  background: '#111827',
  color: 'white',
  fontWeight: 700,
  fontSize: '1rem',
  cursor: 'pointer',
};

const helperTextStyle = {
  color: '#6b7280',
  fontSize: '0.95rem',
  lineHeight: 1.6,
};

const bannerStyle = (background, color) => ({
  borderRadius: '12px',
  padding: '12px 14px',
  marginBottom: '16px',
  background,
  color,
  fontWeight: 600,
});

const ResetPasswordPage = () => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [sessionChecked, setSessionChecked] = useState(false);

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  useEffect(() => {
    const handleRecovery = async () => {
      if (!router.isReady) return;

      // Supabase sends either a `code` query param or hash tokens depending on the project setting.
      const urlHash = typeof window !== 'undefined' ? window.location.hash : '';
      const hashParams = new URLSearchParams(urlHash.replace(/^#/, ''));

      const code = router.query.code;
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (!code && !accessToken) {
        setSessionError('Use the reset link from your email to continue.');
        setSessionChecked(true);
        return;
      }

      setStatus('loading');
      setSessionError('');

      try {
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else if (accessToken && refreshToken) {
          const { error: sessionErrorResponse } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionErrorResponse) throw sessionErrorResponse;
        }

        setSessionReady(true);
      } catch (authError) {
        console.error('Failed to establish a recovery session', authError);
        setSessionError(
          authError?.message || 'Unable to validate your reset link. Try sending a new one.'
        );
      } finally {
        setStatus('idle');
        setSessionChecked(true);
      }
    };

    handleRecovery();
  }, [router.isReady, router.query]);

  const canSubmit = useMemo(
    () => sessionReady && password.length >= 8 && password === confirmPassword && status !== 'loading',
    [sessionReady, password, confirmPassword, status]
  );

  const onSubmit = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!sessionReady) {
      setError('Validate your reset link before setting a new password.');
      return;
    }

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setStatus('loading');

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      console.error('Password reset error', updateError);
      setError(updateError.message || 'Could not reset password.');
      setStatus('idle');
      return;
    }

    setSuccessMessage('Your password has been updated. You can now sign in with the new password.');
    setPassword('');
    setConfirmPassword('');
    setStatus('idle');
  };

  return (
    <>
      <Head>
        <title>Set a new password</title>
      </Head>
      <PageContainer>
        <Card>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ margin: 0, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>
              Account security
            </p>
            <h1 style={{ margin: '6px 0 0', color: '#111827' }}>Reset your password</h1>
          </div>

          <p style={helperTextStyle}>
            Enter a new password for your account. This page works with the secure link we emailed you—once validated, you can update your Supabase authentication password immediately.
          </p>

          <p style={{ ...helperTextStyle, marginTop: '-4px' }}>
            Need a new link? <a href="/password-reset-request">Request another password reset email</a>.
          </p>

          {sessionError && <div style={bannerStyle('#fef2f2', '#b91c1c')}>{sessionError}</div>}
          {error && <div style={bannerStyle('#fef2f2', '#b91c1c')}>{error}</div>}
          {successMessage && <div style={bannerStyle('#ecfdf3', '#15803d')}>{successMessage}</div>}

        {!sessionChecked && (
          <div style={helperTextStyle}>Validating your reset link…</div>
        )}

        {sessionChecked && (
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            <div>
              <label style={labelStyle} htmlFor="new-password">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter a new password"
                style={fieldStyle}
                minLength={8}
                required
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="confirm-password">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your new password"
                style={fieldStyle}
                minLength={8}
                required
              />
            </div>

            <p style={{ ...helperTextStyle, marginTop: '-4px' }}>
              Passwords must be at least 8 characters. Use the same email that requested the reset.
            </p>

            <button type="submit" style={buttonStyle} disabled={!canSubmit}>
              {status === 'loading' ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
        </Card>
      </PageContainer>
    </>
  );
};

export default ResetPasswordPage;