import { ApiError } from '@/lib/api';

type OutlookEvent = {
  id: string;
  subject: string;
  start?: { dateTime?: string };
  categories?: string[];
  attendees?: Array<{ emailAddress?: { address?: string; name?: string } }>;
};

function mondayFridayWindow() {
  const now = new Date();
  const day = now.getUTCDay();
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - ((day + 6) % 7));
  monday.setUTCHours(0, 0, 0, 0);
  const friday = new Date(monday);
  friday.setUTCDate(monday.getUTCDate() + 4);
  friday.setUTCHours(23, 59, 59, 999);
  return { monday, friday };
}

async function getGraphAccessToken(): Promise<string> {
  const tenant = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const refreshToken = process.env.MICROSOFT_REFRESH_TOKEN;
  if (!tenant || !clientId || !clientSecret || !refreshToken) {
    throw new ApiError('Missing Microsoft Graph credentials', 500);
  }

  const resp = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: 'https://graph.microsoft.com/.default offline_access',
    }),
  });

  if (!resp.ok) throw new ApiError('Failed to refresh Microsoft token', 502);
  const data = await resp.json();
  return data.access_token as string;
}

export async function fetchWeeklyOutlookEvents(): Promise<{ window: { monday: string; friday: string }; events: OutlookEvent[] }> {
  const { monday, friday } = mondayFridayWindow();
  const token = await getGraphAccessToken();
  const params = new URLSearchParams({
    startDateTime: monday.toISOString(),
    endDateTime: friday.toISOString(),
    $select: 'id,subject,start,categories,attendees',
    $top: '500',
  });
  const resp = await fetch(`https://graph.microsoft.com/v1.0/me/calendarView?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new ApiError('Failed to fetch Outlook calendar events', 502);
  const data = await resp.json();
  return { window: { monday: monday.toISOString(), friday: friday.toISOString() }, events: (data.value ?? []) as OutlookEvent[] };
}

export function parseServiceFromEvent(event: OutlookEvent): { dogName: string; service: string; duration: string; category: string; emailHint: string | null } {
  const parts = (event.subject ?? '').split(' - ').map((p) => p.trim());
  const dogName = parts[0] || 'Unknown dog';
  const service = parts[1] || 'Dog walking';
  const durationFromTitle = parts[2] || '';
  const category = event.categories?.[0] ?? durationFromTitle;
  const duration = /boarding/i.test(service) ? 'Full day' : category || durationFromTitle || '30min';
  const emailHint = event.attendees?.[0]?.emailAddress?.address ?? null;
  return { dogName, service, duration, category: duration, emailHint };
}
