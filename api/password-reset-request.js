const { getAppOnlyAccessToken } = require('./_lib/auth');
const { sendMail } = require('./_lib/graph');
const { supabaseAdmin, requireSupabase } = require('./_lib/supabase');

const parseBody = async (req) => {
  if (req.body) return req.body;

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString('utf8');
  return body ? JSON.parse(body) : {};
};

const resolveRecipientEmail = () => {
  const email =
    process.env.PASSWORD_RESET_NOTIFICATION_EMAIL ||
    process.env.CONTACT_NOTIFICATION_EMAIL ||
    process.env.NOTIFY_EMAIL ||
    process.env.JEROEN_AND_PAWS_EMAIL;

  if (!email) {
    throw new Error('Missing password reset notification email env var');
  }

  return email;
};

const buildBody = ({ email, context }) => `
  <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
    <p style="margin: 0 0 12px;">A client requested help resetting their password.</p>
    <p style="margin: 0 0 8px;"><strong>Email:</strong> ${email}</p>
    ${context ? `<p style="margin: 0 0 8px;"><strong>Details:</strong> ${context}</p>` : ''}
  </div>
`;

const buildRedirectUrl = (origin) => {
  const siteBase =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || origin || 'http://localhost:3000';

  const normalizedBase = siteBase.endsWith('/') ? siteBase.slice(0, -1) : siteBase;
  return `${normalizedBase}/reset-password`;
};

const sendClientResetEmail = async (email, origin) => {
  requireSupabase();

  const redirectTo = buildRedirectUrl(origin);
  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    throw error;
  }
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end('Method Not Allowed');
    return;
  }

  try {
    const body = await parseBody(req);
    const email = body.email?.trim();
    const context = body.context?.trim();

    if (!email) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: 'Email is required to request a reset.' }));
      return;
    }

    await sendClientResetEmail(email, req.headers.origin);

    const toEmail = resolveRecipientEmail();
    const accessToken = await getAppOnlyAccessToken();

    await sendMail({
      accessToken,
      fromCalendarId: process.env.OUTLOOK_CALENDAR_ID,
      to: toEmail,
      subject: `Password reset requested for ${email}`,
      body: buildBody({ email, context }),
      contentType: 'HTML',
      replyTo: email,
    });

    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        message: 'Reset link sent. Please check your inbox for a secure link to update your password.',
      })
    );
  } catch (error) {
    console.error('Password reset request error', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: 'Unable to submit your request right now.' }));
  }
};