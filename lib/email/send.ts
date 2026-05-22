import { config } from '@/lib/config';

async function sendWithResend(subject: string, text: string, to: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error('RESEND_API_KEY and EMAIL_FROM are required for live email sending');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend error: ${err}`);
  }
}

export async function sendInternalEmail(subject: string, text: string): Promise<{ deliveredTo: string; dryRun: boolean }> {
  const to = config.dryRunEmailTo;

  if (config.dryRunExternal) {
    console.warn('internal_email_preview', { to, subject, text });
    return { deliveredTo: to, dryRun: true };
  }

  await sendWithResend(subject, text, to);
  return { deliveredTo: to, dryRun: false };
}
