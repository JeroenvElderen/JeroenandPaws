# Jeroen & Paws Platform (Expo + Vercel + Supabase)

This repository now includes:
- **Mobile app**: Expo React Native in `mobile-app/`
- **Secure backend**: Next.js API routes in `pages/api/`
- **Database**: Supabase schema + RLS migration in `supabase/migrations/`

## Security model
- No 3rd-party API secrets are stored in the mobile app.
- Revolut, Microsoft Graph, WhatsApp, and email operations are backend-only.
- Invite-code access is required via `/api/auth/redeem-invite`.
- Supabase RLS policies enforce client data isolation and admin full-access.

## Dry-run/testing toggle (requested)
Use these backend environment variables:
- `DRY_RUN_EXTERNAL_CALLS=true|false`
- `DRY_RUN_EMAIL_TO=jeroen@jeroenandpaws.com`

When enabled, payment-link and WhatsApp service calls run in **dry-run mode** and are redirected to safe test output.

Mobile app public env mirrors:
- `EXPO_PUBLIC_API_DRY_RUN_EXTERNAL`
- `EXPO_PUBLIC_API_DRY_RUN_EMAIL_TO`

## Backend API routes scaffolded
- `/api/auth/redeem-invite`
- `/api/admin/clients`
- `/api/admin/dogs`
- `/api/admin/bookings`
- `/api/client/bookings`
- `/api/client/booking-requests`
- `/api/invoices/generate-weekly`
- `/api/invoices/send-internal`
- `/api/payments/create-links`
- `/api/payments/request-link`
- `/api/whatsapp/send-payment-link`
- `/api/whatsapp/webhook`
- `/api/revolut/merchant-webhook`
- `/api/revolut/import-transactions`
- `/api/expenses/upload-receipt`
- `/api/expenses/reconcile`
- `/api/dashboard/admin`

## Setup
1. Copy `.env.example` to `.env.local` and fill values.
2. Install deps:
   - root: `npm install`
   - mobile app: `cd mobile-app && npm install`
3. Run migration SQL in Supabase.
4. Run web backend: `npm run dev`
5. Run mobile app: `cd mobile-app && npm run start`

## Expo EAS
In `mobile-app/`:
- `eas build --platform ios`
- `eas build --platform android`
- `eas submit --platform ios`
- `eas submit --platform android`

Set `ios.bundleIdentifier` and `android.package` in `mobile-app/app.json` before store submission.
