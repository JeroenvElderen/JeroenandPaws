import { useState } from 'react';
import Head from 'next/head';
import { supabase } from '../../src/supabaseClient';

const PageContainer = ({ children }) => (
  <main
    style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px 48px',
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

const labelStyle = {
  display: 'block',
  fontWeight: 600,
  color: '#111827',
  marginBottom: '6px',
};

const fieldStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  fontSize: '1rem',
  outline: 'none',
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

const PasswordResetRequestPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const sendResetEmail = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Enter the email address for your account.');
      return;
    }

    setStatus('loading');

    const redirectUrl = `${window.location.origin}/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (resetError) {
      console.error('Reset email error', resetError);
      setError(resetError.message || 'Could not send reset email.');
      setStatus('idle');
      return;
    }

    setMessage('Check your inbox for a secure link to reset your password.');
    setStatus('idle');
  };

  return (
    <>
      <Head>
        <title>Reset password</title>
      </Head>
      <PageContainer>
        <Card>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ margin: 0, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>
              Account security
            </p>
            <h1 style={{ margin: '6px 0 0', color: '#111827' }}>Reset password request</h1>
          </div>

          <p style={helperTextStyle}>
            Enter the email linked to your account. We will email you a secure link that opens directly in this
            site so you can set a new password without leaving the browser.
          </p>

          {error && <div style={bannerStyle('#fef2f2', '#b91c1c')}>{error}</div>}
          {message && <div style={bannerStyle('#ecfdf3', '#15803d')}>{message}</div>}

          <form onSubmit={sendResetEmail} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            <div>
              <label style={labelStyle} htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                style={fieldStyle}
                required
              />
            </div>

            <button type="submit" style={buttonStyle} disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending link…' : 'Send reset link'}
            </button>
          </form>
        </Card>
      </PageContainer>
    </>
  );
};

export default PasswordResetRequestPage;