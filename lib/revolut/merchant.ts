import { config } from '@/lib/config';

export async function createHostedCheckout(invoiceId: string): Promise<{ orderId: string; checkoutUrl: string; dryRun: boolean }> {
  if (config.dryRunExternal) {
    return {
      orderId: `dry-${invoiceId}`,
      checkoutUrl: `https://example.com/dry-run/${invoiceId}`,
      dryRun: true,
    };
  }
  return { orderId: `todo-${invoiceId}`, checkoutUrl: 'https://revolut.example/checkout', dryRun: false };
}
