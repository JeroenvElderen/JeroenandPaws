# Jeroen & Paws Mobile (Expo React Native)

This folder is intentionally separate from the existing web app so you can distribute and release mobile builds independently.

## What is included

- Expo React Native skeleton for **iOS + Android**.
- Role-based navigation for `admin` and `client`.
- Invite code onboarding entry screen.
- Supabase schema starter with RLS policies.
- Secure backend function example for invite activation via Vercel.
- Dogs are modeled as a separate table linked to clients (`1 client -> many dogs`).

## Architecture rules implemented

1. **No public self-registration path for clients**.
2. Admin creates client + invite code in Supabase.
3. Client enters invite code in app.
4. Invite code is validated by server (Vercel function with service role key).
5. User profile gets linked to that `client_id`.
6. All client data access is scoped by `client_id` + RLS.
7. External integrations (Outlook, Revolut, WhatsApp, email) must stay on backend only.
8. Dogs are linked to `client_id`, so each client can have multiple dogs.

## Quick start

### 1) Install tools

- Node.js 20+: https://nodejs.org/
- Expo CLI docs: https://docs.expo.dev/get-started/installation/
- EAS CLI docs: https://docs.expo.dev/build/setup/
- Xcode (for iOS builds): https://developer.apple.com/xcode/
- Android Studio (for Android builds): https://developer.android.com/studio

### 2) Install dependencies

```bash
cd mobile-app
npm install
```

### 3) Configure environment values

Create `.env` in `mobile-app/`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
EXPO_PUBLIC_VERCEL_BACKEND_URL=https://YOUR_BACKEND.vercel.app
```

> Never put `SUPABASE_SERVICE_ROLE_KEY` or any API secret in the mobile app.

### 4) Run app locally

```bash
npm run start
npm run ios
npm run android
```

## Supabase setup

1. Create project: https://supabase.com/dashboard
2. Run SQL from `supabase/schema.sql` in SQL editor.
3. Enable Email auth provider (or provider you choose).
4. Keep service-role key server-side only.

Helpful docs:
- Auth: https://supabase.com/docs/guides/auth
- RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Edge Functions (optional): https://supabase.com/docs/guides/functions

## Invite code lifecycle

- **Generate**: admin UI/backend creates row in `invite_codes` with `pending`.
- **Activate**: mobile calls backend endpoint with code.
- **Consume**: backend marks code as `used`, links `profiles.client_id`.
- **Reset (optional)**: admin sets status back to `pending` and clears `used_*` fields.

## Vercel backend requirements

Deploy secure server endpoints (not client-side) on Vercel:

- Invite code activation
- Outlook API calls
- Revolut API calls
- WhatsApp API calls
- Email sends

Vercel links:
- Start: https://vercel.com/docs
- Environment variables: https://vercel.com/docs/environment-variables
- Functions: https://vercel.com/docs/functions

Required backend env vars:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OUTLOOK_CLIENT_ID` / `OUTLOOK_CLIENT_SECRET`
- `REVOLUT_API_KEY`
- `WHATSAPP_TOKEN`
- email provider keys (SendGrid/Resend/etc)

## App Store + Play Store publishing setup

### Apple App Store

1. Apple Developer Program enrollment: https://developer.apple.com/programs/
2. App Store Connect: https://appstoreconnect.apple.com/
3. Create app identifier + bundle ID (`com.jeroenandpaws.clientapp`).
4. Set privacy policy URL and support URL.
5. Generate production build with EAS and submit.

Expo submission docs:
- iOS submit: https://docs.expo.dev/submit/ios/

### Google Play Store

1. Google Play Console account: https://play.google.com/console/signup
2. Create app with package name (`com.jeroenandpaws.clientapp`).
3. Complete Data safety + App content forms.
4. Upload AAB production build from EAS.

Expo submission docs:
- Android submit: https://docs.expo.dev/submit/android/

## EAS Build/Submit flow

```bash
npm i -g eas-cli
eas login
eas init
eas build:configure
eas build --platform ios
eas build --platform android
eas submit --platform ios
eas submit --platform android
```

EAS docs:
- Build setup: https://docs.expo.dev/build/setup/
- Credentials: https://docs.expo.dev/app-signing/app-credentials/

## Next implementation steps

1. Connect each screen to real Supabase queries.
2. Add proper sign-in/sign-up flow after invite activation.
3. Add backend JWT verification on Vercel endpoints.
4. Add audit logs for invite code reset/usage.
5. Add push notifications and deep links.
