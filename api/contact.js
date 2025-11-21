const { getAppOnlyAccessToken } = require('./_lib/auth');
const { sendMail } = require('./_lib/graph');

const parseBody = async (req) => {
  if (req.body) return req.body;

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString('utf8');
  return body ? JSON.parse(body) : {};
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildDetailRow = (label, value) =>
  value
    ? `<p style="margin: 0 0 8px;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`
    : '';

const buildMessageBody = (payload) => {
  const { name, email, message } = payload;
  const details = [
    ['Phone', payload.phone],
    ['Service requested', payload.serviceType],
    ['Preferred timing', payload.careTiming],
    ['Pickup/visit location', payload.pickupLocation],
    ['Dog name', payload.dogName],
    ['Breed', payload.dogBreed],
    ['Age', payload.dogAge],
    ['Size/weight', payload.dogSize],
    ['Routine & preferences', payload.preferences],
    ['Medications or notes', payload.specialNotes],
  ];

  const detailBlock = details.map(([label, value]) => buildDetailRow(label, value)).join('');

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <p style="margin: 0 0 12px;">New contact form submission from <strong>${escapeHtml(
        name
      )}</strong>.</p>
      <p style="margin: 0 0 12px;">Reply to: <a href="mailto:${escapeHtml(email)}">${escapeHtml(
        email
      )}</a></p>
      ${detailBlock ? `<div style="margin: 0 0 12px 0;">${detailBlock}</div>` : ''}
      <p style="margin: 0 0 12px;"><strong>Message:</strong></p>
      <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `;
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
    const name = body.name?.trim();
    const email = body.email?.trim();
    const message = body.message?.trim();

    if (!name || !email || !message) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: 'Name, email, and message are required.' }));
      return;
    }

    const toEmail =
      process.env.CONTACT_NOTIFICATION_EMAIL ||
      process.env.NOTIFY_EMAIL ||
      process.env.JEROEN_AND_PAWS_EMAIL;

    if (!toEmail) {
      throw new Error('Missing contact notification email env var');
    }

    const calendarId = process.env.OUTLOOK_CALENDAR_ID;
    if (!calendarId) {
      throw new Error('Missing OUTLOOK_CALENDAR_ID env var');
    }

    const accessToken = await getAppOnlyAccessToken();
    const subject = body.serviceType
      ? `New ${body.serviceType} request from ${name || 'website visitor'}`
      : `New contact from ${name || 'website visitor'}`;
    const bodyContent = buildMessageBody(body);

    await sendMail({
      accessToken,
      fromCalendarId: calendarId,
      to: toEmail,
      subject,
      body: bodyContent,
      contentType: 'HTML',
    });

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Message sent' }));
  } catch (error) {
    console.error('Contact form error', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: 'Failed to send message' }));
  }
};