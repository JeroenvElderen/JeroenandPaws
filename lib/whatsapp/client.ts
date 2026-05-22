import { config } from '@/lib/config';

export async function sendWhatsAppPaymentLink(to: string, text: string): Promise<{ dryRun: boolean; to: string }> {
  if (config.dryRunExternal) {
    return { dryRun: true, to: config.dryRunEmailTo };
  }
  // TODO: Integrate WhatsApp Cloud API.
  return { dryRun: false, to };
}
