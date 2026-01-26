# Jeroen & Paws Mobile App

This is the standalone iOS/Android app for Jeroen & Paws. It reuses the existing booking APIs from the web platform and ships as a React Native + Expo application.

## Features
- Quick access to booking via a secure in-app web flow
- Profile screen that loads client bookings by email
- Ready for push notifications and payment enhancements

## Configuration
Update the API base URL in `app.json`:

```json
"extra": {
  "apiBaseUrl": "https://jeroenandpaws.com"
}
```

## Getting started

```bash
cd mobile-app
npm install
npm run start
```

## Notes
- Booking and payments are handled through the existing web booking flow in the Book tab.
- Social logins and push notifications can be added later.

## Next enhancements
- Expo push notifications
- Native payment sheet (Stripe/Revolut)
- Client account creation inside the app
