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
    console.warn(
      'Missing password reset notification email env var; proceeding without notifying team'
    );
    return null;
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

const normalizeUrlBase = (value) => {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
  }

  return `https://${trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed}`;
};

const buildRedirectUrl = ({ origin, forwardedProto, forwardedHost }) => {
  const derivedForwardedBase = (() => {
    const proto = forwardedProto?.split(',')[0]?.trim();
    const host = forwardedHost?.split(',')[0]?.trim();

    if (!proto || !host) return null;

    return `${proto}://${host}`;
  })();

  const siteBase =
    normalizeUrlBase(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeUrlBase(process.env.SITE_URL) ||
    normalizeUrlBase(process.env.VERCEL_URL) ||
    normalizeUrlBase(origin) ||
    normalizeUrlBase(derivedForwardedBase) ||
    'http://localhost:3000';

  const normalizedBase = siteBase.endsWith('/') ? siteBase.slice(0, -1) : siteBase;
  return `${normalizedBase}/reset-password`;
};

const buildClientResetBody = (email, resetLink) => `
  <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
    <p style="margin: 0 0 12px;">Hi${email ? ` ${email}` : ''},</p>
    <p style="margin: 0 0 12px;">
      We received a request to reset your password. Click the secure button below to open a
      password reset form directly on our site.
    </p>
    <p style="margin: 0 0 16px;">
      <a
        href="${resetLink}"
        style="
          display: inline-block;
          padding: 12px 18px;
          background: #111827;
          color: #f8fafc;
          border-radius: 10px;
          font-weight: 700;
          text-decoration: none;
        "
      >Reset your password</a>
    </p>
    <p style="margin: 0 0 10px;">If the button does not work, copy and paste this link into your browser:</p>
    <p style="margin: 0; word-break: break-all;"><a href="${resetLink}" style="color: #111827;">${resetLink}</a></p>
    <p style="margin: 16px 0 0; color: #6b7280;">
      If you did not request this change, please ignore this message.
    </p>
  </div>
`;

const resolveFromEmail = () =>
  process.env.PASSWORD_RESET_FROM_EMAIL ||
  process.env.CONTACT_NOTIFICATION_EMAIL ||
  process.env.NOTIFY_EMAIL ||
  process.env.JEROEN_AND_PAWS_EMAIL;

const hasGraphEmailConfig = () =>
  Boolean(
    process.env.AZURE_CLIENT_ID &&
      process.env.AZURE_CLIENT_SECRET &&
      process.env.AZURE_TENANT_ID &&
      process.env.BACKEND_BASE_URL
  );

const sendClientResetEmail = async (email, req, accessToken) => {
  requireSupabase();

  const redirectTo = buildRedirectUrl({
    origin: req.headers.origin,
    forwardedProto: req.headers['x-forwarded-proto'],
    forwardedHost: req.headers['x-forwarded-host'] || req.headers.host,
  });
  if (!hasGraphEmailConfig()) {
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      throw error;
    }

    return null;
  }

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo },
  });

  if (error) {
    throw error;
  }

  const resetLink = data?.action_link || data?.properties?.action_link;

  if (!resetLink) {
    throw new Error('Supabase did not return a reset link.');
  }

  const token = accessToken || (await getAppOnlyAccessToken());
  const fromEmail = resolveFromEmail();

  await sendMail({
    accessToken: token,
    fromCalendarId: process.env.OUTLOOK_CALENDAR_ID,
    to: email,
    subject: 'Reset your Jeroen & Paws password',
    body: buildClientResetBody(email, resetLink),
    contentType: 'HTML',
    ...(fromEmail ? { from: fromEmail, replyTo: fromEmail } : {}),
  });

  return resetLink;
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

    const accessToken = hasGraphEmailConfig() ? await getAppOnlyAccessToken() : null;

    await sendClientResetEmail(email, req, accessToken);

    const toEmail = resolveRecipientEmail();

    if (toEmail && accessToken) {
      await sendMail({
        accessToken,
        fromCalendarId: process.env.OUTLOOK_CALENDAR_ID,
        to: toEmail,
        subject: `Password reset requested for ${email}`,
        body: buildBody({ email, context }),
        contentType: 'HTML',
        replyTo: email,
      });
    }

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