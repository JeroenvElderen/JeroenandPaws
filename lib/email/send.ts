import { config } from '@/lib/config';

export async function sendInternalEmail(subject: string, text: string): Promise<{ deliveredTo: string; dryRun: boolean }> {
  const to = config.dryRunEmailTo;
  // TODO: SMTP/Resend transport implementation.
  console.warn('internal_email_preview', { to, subject, text });
  return { deliveredTo: to, dryRun: config.dryRunExternal };
}
