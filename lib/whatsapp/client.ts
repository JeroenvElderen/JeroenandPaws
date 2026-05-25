import { config } from '@/lib/config';

type SendResult = { dryRun: boolean; to: string; sent: boolean };

function normalizePhone(phone: string): string {
  const trimmed = phone.replace(/\s+/g, '');
  return trimmed.startsWith('+') ? trimmed : `+${trimmed}`;
}

export async function sendWhatsAppPaymentLink(to: string, text: string): Promise<SendResult> {
  if (config.dryRunExternal) {
    return { dryRun: true, to: config.dryRunEmailTo, sent: false };
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    throw new Error('Missing WhatsApp Cloud API credentials');
  }

  const response = await fetch(`https://graph.facebook.com/v23.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: normalizePhone(to),
      type: 'text',
      text: { body: text },
    }),
  });

  if (!response.ok) {
    throw new Error(`WhatsApp send failed (${response.status}): ${await response.text()}`);
  }

  return { dryRun: false, to, sent: true };
}
