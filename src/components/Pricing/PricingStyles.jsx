const PricingStyles = () => (
  <style jsx global>{`

/* ─────────────────────────────────────────────
   🌈 DESIGN TOKENS — UNIVERSAL BRAND SYSTEM
────────────────────────────────────────────── */

:root {
  --brand-bg-1: #1a1132;
  --brand-bg-2: #1f0f3a;

  --brand-glass-1: rgba(255, 255, 255, 0.06);
  --brand-glass-2: rgba(255, 255, 255, 0.10);

  --brand-purple: #7c5df2;
  --brand-purple-dark: #6e4bd8;
  --brand-purple-light: #b9a8ff;

  --brand-green: #22c55e;
  --brand-cyan: #22d3ee;
  --brand-red: #ff6b81;

  --brand-text-light: #f2ecff;
  --brand-text-muted: #b9b3cc;
  --brand-text-subtle: #d0c9e8;

  --radius-card: 16px;
  --radius-input: 12px;

  --shadow-glow: 0 12px 30px rgba(124, 93, 242, 0.35);
}

/* ─────────────────────────────────────────────
   GLOBAL COMPONENTS (inputs, buttons, etc.)
────────────────────────────────────────────── */

.input-group input,
.input-group textarea {
  border-radius: var(--radius-input);
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(0,0,0,0.1);
  padding: 10px 12px;
  color: var(--brand-text-light);
  font-size: 14px;
}

.input-group input:focus,
.input-group textarea:focus {
  border-color: var(--brand-purple-light);
  box-shadow: 0 0 0 2px rgba(124,93,242,0.28);
  outline: none;
}

/* Buttons */

.button.w-button {
  border-radius: var(--radius-input);
  padding: 12px 18px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(145deg, var(--brand-purple-dark), var(--brand-purple));
  border: none;
  transition: 0.25s ease;
}

.button.w-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

.ghost-button {
  background: var(--brand-glass-1);
  border: 1px solid rgba(255,255,255,0.15);
  color: var(--brand-text-light);
  padding: 10px 14px;
  border-radius: var(--radius-input);
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s ease;
}

.ghost-button:hover {
  background: rgba(255,255,255,0.18);
  transform: translateY(-2px);
}

/* Tiny Ghost Button */
.ghost-button.tiny {
  padding: 5px 10px;
  font-size: 12px;
  opacity: 0.85;
}

/* Close Button */
.close-button {
  width: 38px;
  height: 38px;
  background: var(--brand-glass-1);
  border: 1px solid rgba(255,255,255,0.15);
  color: var(--brand-text-light);
  border-radius: 10px;
  font-size: 20px;
  cursor: pointer;
  transition: 0.25s ease;
}

.close-button:hover {
  background: rgba(255,255,255,0.20);
}


/* ─────────────────────────────────────────────
   BOOKING MODAL
────────────────────────────────────────────── */

.booking-overlay {
  position: fixed;
  inset: 0;
  background: rgba(9,5,20,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1000;
}

.booking-modal {
  background: linear-gradient(135deg, var(--brand-bg-1), var(--brand-bg-2));
  width: min(1150px, 100%);
  height: calc(100vh - 70px);
  border-radius: 22px;
  color: var(--brand-text-light);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.45);
}

.booking-header {
  padding: 26px 32px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

/* Two-column layout */
.premium-booking-layout {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  gap: 24px;
  padding: 24px;
  height: 100%;
  min-height: 0;
}


/* ─────────────────────────────────────────────
   CALENDAR – PREMIUM
────────────────────────────────────────────── */

.calendar-card {
  background: var(--brand-glass-1);
  padding: 20px;
  border-radius: var(--radius-card);
  border: 1px solid rgba(255,255,255,0.08);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Calendar Header */
.calendar-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.month-nav {
  display: flex;
  gap: 6px;
}

.nav-button {
  width: 34px;
  height: 34px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  color: var(--brand-text-light);
  font-size: 18px;
  cursor: pointer;
  transition: 0.2s;
}

.nav-button:hover {
  background: rgba(255,255,255,0.14);
}

/* Toggle group */
.toggle-group {
  background: rgba(255,255,255,0.06);
  padding: 4px;
  border-radius: 14px;
  display: flex;
  gap: 6px;
}

.pill {
  padding: 6px 12px;
  border-radius: 12px;
  border: none;
  background: none;
  color: var(--brand-text-light);
  cursor: pointer;
  font-weight: 700;
  transition: 0.2s;
}

.pill.active {
  background: var(--brand-purple-light);
  color: #1b1034;
}

/* Weekday names */
.weekday-row {
  display: grid;
  grid-template-columns: repeat(7,1fr);
  color: var(--brand-text-muted);
  font-size: 12px;
}

/* Calendar fade animation */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7,1fr);
  gap: 6px;
  animation: calendarFade 0.35s ease;
}

@keyframes calendarFade {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
}

/* DAY BUTTON */
.day {
  height: 58px;
  border-radius: 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  padding: 8px 10px;
  color: var(--brand-text-subtle);
  font-weight: 600;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  position: relative;
  transition: 0.25s ease;
  animation: fadeDay 0.4s ease both;
}

.day-dot-wrapper {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 12px;
}

.day .day-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
}

/* Individual fade */
@keyframes fadeDay {
  0% { opacity: 0; transform: scale(.96); }
  100% { opacity: 1; transform: scale(1); }
}

/* AVAILABLE DAY — GREEN GLOW */
.day.available .day-dot {
  width: 7px;
  height: 7px;
  background: var(--brand-green);
  border-radius: 50%;
  animation: pulse-dot 2s infinite ease-in-out;
  box-shadow: 0 0 0 4px rgba(34,197,94,0.25);
}

.day.limited .day-dot {
  background: #f59e0b;
  box-shadow: 0 0 0 4px rgba(245,158,11,0.18);
}

.day.unavailable .day-dot {
  background: #ef4444;
  box-shadow: 0 0 0 3px rgba(239,68,68,0.15);
}

@keyframes pulse-dot {
  0% { transform: scale(1); }
  50% { transform: scale(1.25); }
  100% { transform: scale(1); }
}

.day.available:hover {
  background: rgba(34,197,94,0.12);
  border-color: rgba(34,197,94,0.58);
}

.day.limited:hover {
  background: rgba(245,158,11,0.12);
  border-color: rgba(245,158,11,0.45);
}

.day.available::after {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: 14px;
  background: radial-gradient(circle, rgba(34,197,94,0.25), transparent 62%);
  opacity: 0;
  transition: 0.3s;
}

.day.available:hover::after {
  opacity: 1;
}

/* SELECTED DAY */
.day.selected {
  background: linear-gradient(145deg, var(--brand-purple-dark), var(--brand-purple));
  color: #0d061a;
  border-color: transparent;
  box-shadow: 0 0 14px rgba(124,93,242,0.55),
              0 0 22px rgba(124,93,242,0.28);
}

/* UNAVAILABLE DAY — GRAY */
.day.unavailable {
  opacity: 0.32;
  color: #6b6383 !important;
  cursor: default;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.04);
}

.day.unavailable:hover {
  background: rgba(255,255,255,0.03);
  border-color: rgba(255,255,255,0.04);
}

/* Past day */
.day:disabled {
  opacity: .25 !important;
  border-style: dashed !important;
  cursor: not-allowed !important;
}

/* ─────────────────────────────────────────────
   TIME SECTION
────────────────────────────────────────────── */

.times-card {
  display: flex;
  flex-direction: column;
  background: var(--brand-glass-1);
  border-radius: var(--radius-card);
  padding: 18px;
  border: 1px solid rgba(255,255,255,0.08);
  min-height: 0;
  height: 100%;
}

.times-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.times-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 6px;
  min-height: 0;
}

.time-slot {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  transition: 0.25s;
  margin-bottom: 10px;
}

.time-slot:hover {
  background: rgba(124,93,242,0.18);
  border-color: rgba(124,93,242,0.32);
}

.time-slot.active {
  background: linear-gradient(145deg, var(--brand-purple-dark), var(--brand-purple));
  color: #0b0718;
  box-shadow: var(--shadow-glow);
}

.time-arrow {
  opacity: 0;
  transition: .2s;
}

.time-slot:hover .time-arrow {
  opacity: 1;
}

/* Sticky footer */
.times-continue-footer {
  position: sticky;
  bottom: 0;
  padding-top: 12px;
}


/* ─────────────────────────────────────────────
   DRAWER SYSTEM (client/pets/summary)
────────────────────────────────────────────── */

.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(9,5,20,0.55);
  backdrop-filter: blur(4px);
  opacity: 0;
  pointer-events: none;
  transition: .3s;
  z-index: 1100;
}

.drawer-overlay.open {
  opacity: 1;
  pointer-events: auto;
}

.drawer {
  position: fixed;
  right: -480px;
  top: 0;
  width: 420px;
  height: 100vh;
  background: linear-gradient(135deg, var(--brand-bg-1), var(--brand-bg-2));
  border-left: 1px solid rgba(255,255,255,0.08);
  color: var(--brand-text-light);
  display: flex;
  flex-direction: column;
  transition: right .4s cubic-bezier(.16,1,.3,1);
  z-index: 1200;
}

.drawer.open {
  right: 0;
}

.drawer-header {
  padding: 24px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-body {
  padding: 24px;
  overflow-y: auto;
  display: grid;
  gap: 18px;
}

.drawer-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(255,255,255,0.08);
  background: rgba(31, 15, 58, 0.7);
}

/* PREMIUM HEADER */
.premium-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--brand-text-light);
}

/* Premium spacing */
.premium-body .input-group {
  margin-bottom: 16px;
}

/* Login button visual polish */
.login-button {
  padding: 8px 14px;
  border-radius: 12px;
  font-weight: 600;
}


/* ─────────────────────────────────────────────
   PET CARDS (Saved + new)
────────────────────────────────────────────── */

.pet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(180px,1fr));
  gap: 14px;
}

.pet-card {
  background: radial-gradient(120% 140% at 0% 0%, rgba(255,255,255,0.08), rgba(255,255,255,0.02)),
              linear-gradient(145deg, rgba(34,36,76,.8), rgba(20,22,55,.8));
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px;
  padding: 14px;
  cursor: pointer;
  transition: .25s;
  position: relative;
  overflow: hidden;
}

.pet-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255,255,255,0.25);
}

.pet-card.selected {
  border-color: var(--brand-purple-light);
  box-shadow: 0 0 24px rgba(124,93,242,0.35);
}

.pet-card-avatar {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}

.pet-card-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pet-avatar-placeholder {
  width: 70px;
  height: 70px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: linear-gradient(145deg, rgba(185,196,255,0.18), rgba(249,198,212,0.18));
  font-size: 22px;
  font-weight: 800;
  color: #0b0618;
}

.pet-card-check {
  position: absolute;
  bottom: -6px;
  right: -6px;
  background: var(--brand-green);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #0b0618;
  display: grid;
  place-items: center;
  color: #0b0618;
  font-weight: 900;
}

/* New dog edit card */
.dog-edit-card {
  background: var(--brand-glass-1);
  border: 1px solid rgba(255,255,255,0.12);
  padding: 18px;
  border-radius: 16px;
  display: grid;
  gap: 14px;
}


/* Breed dropdown */
.breed-dropdown {
  background: #0f1330;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  margin-top: 6px;
  max-height: 180px;
  overflow-y: auto;
  box-shadow: 0 14px 38px rgba(0,0,0,0.45);
}

.breed-option {
  padding: 10px 12px;
  cursor: pointer;
  transition: .2s;
}

.breed-option:hover {
  background: rgba(255,255,255,0.08);
}


/* ─────────────────────────────────────────────
   SUMMARY DRAWER (premium)
────────────────────────────────────────────── */

.summary-body {
  display: grid;
  gap: 28px;
}

.summary-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-block {
  background: var(--brand-glass-1);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  padding: 14px 16px;
}

.summary-pet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(180px,1fr));
  gap: 14px;
}

.summary-pet-card {
  background: var(--brand-glass-1);
  padding: 14px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.12);
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-pet-avatar {
  width: 64px;
  height: 64px;
  position: relative;
}

.summary-pet-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
}

.summary-pet-placeholder {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(185,196,255,0.18);
  color: #0c0518;
  font-size: 20px;
  font-weight: 800;
}

.summary-avatar-glow {
  position: absolute;
  inset: -6px;
  border-radius: 18px;
  background: radial-gradient(circle, rgba(124,93,242,0.35), transparent 62%);
  filter: blur(10px);
  pointer-events: none;
}

.summary-total-card {
  background: linear-gradient(145deg, rgba(124,93,242,0.28), rgba(34,36,76,0.75));
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.15);
  padding: 20px;
  text-align: center;
}

/* ─────────────────────────────────────────────
   MOBILE BEHAVIOR
────────────────────────────────────────────── */

@media (max-width: 820px) {
  .premium-booking-layout {
    grid-template-columns: 1fr;
    height: auto;
  }

  .booking-modal {
    height: auto;
    max-height: none;
  }

  .drawer {
    width: 100%;
    right: 0;
    left: 0;
    height: auto;
    bottom: -100vh;
    top: auto;
    min-height: 60vh;
    border-left: none;
    border-top: 1px solid rgba(255,255,255,0.12);
    border-radius: 20px 20px 0 0;
    transition: bottom .45s cubic-bezier(.16,1,.3,1);
  }

  .drawer.open {
    bottom: 0;
  }
}

/* CLIENT DRAWER PREMIUM SPACING */

.client-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.button.small.outline {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  padding: 8px 14px;
  border-radius: 10px;
  font-weight: 600;
}

.client-body .field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.client-body .field label {
  font-size: 14px;
  font-weight: 600;
  color: var(--brand-text-subtle);
}

.client-body input,
.client-body textarea {
  font-size: 15px;
  padding: 14px;
  border-radius: 14px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  transition: 0.25s;
}

.client-body input:focus,
.client-body textarea:focus {
  border-color: var(--brand-purple-light);
  box-shadow: 0 0 8px rgba(124,93,242,0.35);
}

      `}</style>
);

export default PricingStyles;
