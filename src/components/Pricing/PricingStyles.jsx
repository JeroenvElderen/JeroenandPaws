const PricingStyles = () => (
  <style jsx global>{`
        .card.on-secondary {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        
        .card.on-secondary:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
        }
        .button.w-button {
          transition: background-color 0.25s ease, color 0.25s ease;
        }
        .button.w-button:hover {
          background-color: #5a3ec8;
          color: #fff;
        }
        .booking-overlay {
          position: fixed;
          inset: 0;
          height: 100dvh;
          background: rgba(9, 5, 20, 0.5);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          overflow: hidden;
          -webkit-overflow-scrolling: touch;
          z-index: 1000;
        }
        .booking-modal {
          background: linear-gradient(135deg, #1a1132, #1f0f3a);
          border-radius: 16px;
          width: min(1280px, 100%);
          color: #f2ecff;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          position: relative;
          height: 100%;
          max-height: 100dvh;
          min-height: 560px;
          display: flex;
          flex-direction: column;
        }
        .service-chooser {
          width: min(980px, 100%);
          background: linear-gradient(135deg, #170f2c, #1c1235);
          border-radius: 16px;
          color: #f2ecff;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
          padding: 20px 24px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .service-chooser__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .service-chooser__body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .service-chooser__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 12px;
        }
        .service-chooser__card .card_body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .service-chooser__empty {
          text-align: center;
          padding: 28px 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
        }
        .booking-hero {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          padding: 24px 28px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .booking-hero h3 {
          margin: 6px 0 4px;
        }
        .trust-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
        }
        .trust-chip {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 999px;
          padding: 6px 10px;
          font-weight: 700;
          font-size: 12px;
        }
        .hero-actions {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .progress-track {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.06);
          margin: 0 0 8px;
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #7c5df2, #5fe4ff);
        }
        .booking-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 20px 24px 24px;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding-right: 8px;
        }
        .booking-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          align-items: start;
          height: 100%;
        }
        .booking-main {
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 0;
        }
        .booking-sidebar {
          display: none;
        }
        .booking-wayfinding {
          grid-column: 1 / -1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          border-radius: 12px;
          padding: 14px 16px;
        }
        .step-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .step-chip {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          color: #f2ecff;
          padding: 8px 12px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .step-chip:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }
        .wayfinding-summary {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .summary-chip {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 8px;
          padding: 8px 10px;
          font-weight: 700;
          color: #e9e5ff;
        }
        .calendar-card,
        .times-card {
          
          
          border-radius: 12px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 0;
        }
        .calendar-card {
          grid-row: auto;
        }
        .times-card {
          grid-row: auto;
        }

        .step-flow {
          overflow: hidden;
        }

        .stepper {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
        }

        .step-chip {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 12px;
          padding: 10px 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #dcd4f2;
        }

        .step-chip.complete {
          border-color: rgba(124, 93, 242, 0.5);
          background: rgba(124, 93, 242, 0.12);
        }

        .step-chip.active {
          background: linear-gradient(145deg, #6e4bd8, #7c5df2);
          color: #0c061a;
          box-shadow: 0 8px 18px rgba(124, 93, 242, 0.35);
        }

        .step-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 16px;
          min-height: 0;
          overflow-y: auto;
          scrollbar-width: thin;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .calendar-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 6px;
        }
        .multi-day-toggle {
          margin-top: 6px;
        }
        .multi-day-summary {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .multi-day-summary__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .schedule-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .schedule-list.inline {
          flex-direction: row;
          flex-wrap: wrap;
        }
        .schedule-list__item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 10px 12px;
        }
        .schedule-list__date {
          font-weight: 700;
          margin: 0;
        }
        .badge {
          background: rgba(124, 93, 242, 0.2);
          border: 1px solid rgba(124, 93, 242, 0.5);
          color: #f2ecff;
          border-radius: 999px;
          padding: 6px 10px;
          font-weight: 700;
        }
        .addon-card,
        .floating-summary-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .addon-card__header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }
        .addon-card__description {
          max-width: 180px;
          text-align: right;
        }
        .addon-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .addon-row {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 10px;
          align-items: start;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
        }
        .addon-row.selected {
          border-color: rgba(124, 93, 242, 0.4);
          background: rgba(124, 93, 242, 0.08);
        }
        .addon-row__title-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }
        .addon-row__price {
          font-weight: 700;
        }
        .floating-summary__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .floating-summary__section {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 10px;
        }
        .floating-summary__totals {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .recurrence-card {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .step-toolbar {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .actions-stack {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .ghost-button {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: #f2ecff;
          border-radius: 12px;
          padding: 10px 14px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .ghost-button:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }
        .ghost-button.tiny {
          padding: 6px 10px;
          font-size: 12px;
        }
        .selection-summary {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: flex-start;
        }
        .pill-button-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .pill-toggle {
          display: flex;
          gap: 8px;
          align-items: center;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          padding: 10px;
          border-radius: 12px;
        }
        .pill-toggle small {
          display: block;
        }
        .selection-summary h4 {
          margin: 6px 0 2px;
        }
        .summary-tags {
          display: flex;
          gap: 8px;
        }
        .subtle-pill {
          opacity: 0.8;
        }
        .calendar-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .toolbar-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .toggle-group {
          display: inline-flex;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 4px;
          gap: 6px;
        }
        .month-nav {
          display: inline-flex;
          gap: 6px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 4px;
        }
          /* Allow the right column to shrink */
.times-card {
  min-width: 260px;
}

/* Allow inner flex items to shrink */
.time-slot,
.times-list {
  min-width: 0;
}

/* Prevent input fields from forcing the width too wide */
.input-group input,
.input-group textarea {
  min-width: 0;
  width: 100%;
}
  .breed-search {
  width: 100%;
  margin-bottom: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.1);
  color: #f8f6ff;
  font-size: 14px;
}

.dog-photo-preview {
  margin-top: 8px;
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
  /* Make <select> look like your inputs */
.input-like-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.1);
  padding: 10px 12px;
  color: #f8f6ff;
  font-size: 14px;
  width: 100%;
  position: relative;
  cursor: pointer;
}

/* Light purple placeholder text style like your inputs */
.input-like-select option {
  color: #e7def9;
  background: rgba(26, 17, 50, 1);
}

.recurrence-group .recurrence-select {
  margin-top: 6px;
}
        .cta-choice-modal {
          background: linear-gradient(145deg, #1a1132 0%, #1f0f3a 100%);
          border-radius: 14px;
          width: min(540px, 100%);
          color: #f2ecff;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
          padding: 24px 24px 20px;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .cta-choice-content {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .cta-choice-close {
          position: absolute;
          top: 10px;
          right: 12px;
          border: none;
          background: transparent;
          color: #fff;
          font-size: 26px;
          cursor: pointer;
          line-height: 1;
        }
        .cta-choice-description {
          opacity: 0.82;
          margin: 6px 0 0;
        }
        .cta-choice-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 8px;
        }
        .cta-choice-actions .w-button {
          text-align: center;
        }
        .cta-choice-actions .ghost-button {
          text-align: center;
          width: 100%;
        }
        .cta-choice-footnote {
          font-size: 13px;
          opacity: 0.78;
          margin: 2px 0 0;
          text-align: center;
        }

/* Custom dropdown arrow (pure CSS, no icons) */
.input-like-select {
  background-image:
    linear-gradient(45deg, transparent 50%, #e7def9 50%),
    linear-gradient(135deg, #e7def9 50%, transparent 50%);
  background-position:
    calc(100% - 16px) calc(50% - 3px),
    calc(100% - 11px) calc(50% - 3px);
  background-size: 6px 6px, 6px 6px;
  background-repeat: no-repeat;
}

/* Extra hover/focus polish */
.input-like-select:hover {
  border-color: rgba(124, 93, 242, 0.4);
  background: rgba(124, 93, 242, 0.12);
}

.input-like-select:focus {
  outline: none;
  border-color: rgba(124, 93, 242, 0.6);
  background: rgba(124, 93, 242, 0.18);
}


        .nav-button {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(0, 0, 0, 0.15);
        color: #f2ecff;
        font-size: 18px;
        cursor: pointer;
        transition: background 0.2s ease, transform 0.,2s ease;
        }
        .nav button:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-1px);
        }
        .weekday-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
          font-size: 11px;
          color: #b9b3cc;
          margin-bottom: 6px;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }
        .day {
  height: 58px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.03);
  color: #e7def9;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 8px 10px;
}

/* Hover only on active days */
.day:hover:not(:disabled) {
  background: rgba(124, 93, 242, 0.18);
  border-color: rgba(124, 93, 242, 0.5);
}

/* --- Selected Day --- */
.day.selected {
  background: linear-gradient(145deg, #6e4bd8, #7c5df2);
  border-color: transparent;
  color: #0c061a;
  box-shadow: 0 6px 16px rgba(124, 93, 242, 0.4);
}

/* --- Past / Disabled Days --- */
.day:disabled {
  opacity: 0.25;
  border-style: dashed;
  cursor: not-allowed;
}

/* --- Days not in the current month --- */
.day.muted {
  color: #786c9c;
  opacity: 0.45;
}

/* --- Future days with NO slots (look normal) --- */
.day-no-slots {
  opacity: 1;
  cursor: pointer;
}

/* --- Future days WITH slots --- */
.day-has-slots {
  position: relative;
}

.day.scheduled {
  border-color: rgba(124, 93, 242, 0.6);
  background: rgba(124, 93, 242, 0.14);
  box-shadow: inset 0 0 0 1px rgba(124, 93, 242, 0.5);
}

.day-dot-wrapper {
  display: flex;
  gap: 4px;
  align-items: center;
}

/* Availability dot */
.day-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22d3ee; /* cyan glow */
  box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.25);
  margin-top: 2px;
}
.day-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #22c55e;
  color: #0c061a;
  font-size: 12px;
  font-weight: 800;
}
  
        .info-banner {
          margin-bottom: 10px;
          padding: 8px 12px;
          border-radius: 10px;
          background: rgba(14, 165, 233, 0.12);
          color: #cffafe;
          border: 1px solid rgba(14, 165, 233, 0.25);
          font-size: 13px;
        }
        .times-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 12px;
        }
        .times-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .times-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
          overflow-y: auto;
          padding-right: 6px;
        }
        .times-list::-webkit-scrollbar {
          width: 6px;
        }
        .times-list::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .times-list::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
        }
        .dot {
          width: 8px;
          height: 8px;
          background: #4ade80; /* green */
          border-radius: 50%;
          margin-right: 10px;
          display: inline-block;
          flex-shrink: 0;
          box-shadow: 0 0 0 4px rgba(74, 222, 128, 0.25); /* glow like screenshot */
        }
        .time-slot {
          width: 100%;
          border-radius: 14px;
          padding: 14px 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          color: #f2ecff;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          justifyt-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .time-slot:hover {
          background: rgba(124, 93, 242, 0.18);
          border-color: rgba(124, 93, 242, 0.4);
        }
        .time-slot.active {
          background: linear-gradient(145deg, #6e4bd8, #7c5df2);
          color: #0c061a;
          box-shadow: 0 6px 16px rgba(124, 93, 242, 0.4);
        }
        .slot-label {
          margin-left: 8px;
          font-size: 12px;
        }
        .pill {
          border: none;
          padding: 8px 12px;
          border-radius: 12px;
          background: transparent;
          color: #f2ecff;
          cursor: pointer;
          font-weight: 700;
          transition: background 0.2s ease;
        }
        .pill.active {
          background: #f1ddff;
          color: #2a1349;
        }
        .pill.ghost {
          background: rgba(255, 255, 255, 0.08);
          color: #dcd4f2;
          font-weight: 600;
        }
        .close-button {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          color: #f2ecff;
          font-size: 18px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .close-button:hover {
          background: rgba(255, 255, 255, 0.18);
        }
        .muted {
          color: #b9b3cc;
        }
        .muted.subtle {
          font-size: 13px;
          text-align: right;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin: 16px 0;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding-right: 6px;
          max-height: 420px;
        }
        .form-grid::-webkit-scrollbar {
          width: 6px;
        }
        .form-grid::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .form-grid::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 6px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #e7def9;
          font-weight: 600;
        }
        .input-group input,
        .input-group textarea {
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.1);
          padding: 10px 12px;
          color: #f8f6ff;
          font-size: 14px;
        }
        .input-group textarea {
          resize: vertical;
        }
        .input-group.full-width {
          grid-column: 1 / -1;
        }
          .email-group .email-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .email-group .email-row input {
          flex: 1;
        }
        .email-group .load-pets-button {
          white-space: nowrap;
        }
        .add-on-group {
          position: relative;
        }
        .add-on-group .label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .add-on-trigger {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          width: 100%;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.1);
          padding: 10px 12px;
          color: #f8f6ff;
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .add-on-trigger:hover {
          border-color: rgba(255, 255, 255, 0.24);
        }
        .add-on-trigger.open {
          border-color: rgba(144, 166, 255, 0.8);
          box-shadow: 0 12px 20px rgba(124, 148, 255, 0.16);
        }
        .add-on-trigger:focus-visible {
          outline: 2px solid rgba(144, 166, 255, 0.9);
          outline-offset: 2px;
        }
        .add-on-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          color: #e7def9;
        }
        .add-on-chip {
          padding: 8px 10px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-weight: 600;
          color: #f8f6ff;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .add-on-chip.placeholder {
          color: #c6b7e8;
          border-style: dashed;
          border-color: rgba(255, 255, 255, 0.18);
        }
        .add-on-menu {
          position: relative;
          margin-top: 10px;
          padding: 10px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: linear-gradient(145deg, rgba(20, 22, 55, 0.95), rgba(31, 15, 58, 0.9));
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.3);
          display: grid;
          gap: 8px;
          z-index: 3;
        }
        .add-on-option {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 12px;
          align-items: flex-start;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          cursor: pointer;
          transition: border-color 0.2s ease, transform 0.15s ease;
        }
        .add-on-option:hover {
          border-color: rgba(255, 255, 255, 0.26);
          transform: translateY(-1px);
        }
        .add-on-option.selected {
          border-color: rgba(144, 166, 255, 0.9);
          background: linear-gradient(135deg, rgba(144, 166, 255, 0.14), rgba(144, 166, 255, 0.04));
        }
        .add-on-option input {
          margin-top: 4px;
          accent-color: #8f7cf7;
          cursor: pointer;
        }
        .add-on-copy {
          display: flex;
          flex-direction: column;
          gap: 4px;
          color: #f2ecff;
        }
        .add-on-title {
          font-weight: 800;
        }
        .add-on-description {
          margin: 0;
          color: #c6b7e8;
          font-size: 13px;
          line-height: 1.5;
        }
        .add-on-check {
          color: #8cf6c5;
          font-weight: 800;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .add-on-option.selected .add-on-check {
          opacity: 1;
        }
        .add-on-trigger .chevron {
          margin-left: auto;
          font-size: 12px;
          color: #e7def9;
          display: inline-flex;
        }
        .price-summary-card {
          margin: 12px 0 4px;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: linear-gradient(160deg, rgba(34, 36, 76, 0.9), rgba(24, 22, 52, 0.92));
          color: #f2ecff;
          box-shadow: 0 16px 26px rgba(0, 0, 0, 0.32);
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .price-summary__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .price-summary__header h4 {
          margin: 2px 0 0;
        }

        .price-summary__meta {
          margin: 0;
          color: #c6b7e8;
          text-align: right;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .price-summary__list {
          margin: 10px 0 0;
          padding-left: 18px;
          display: grid;
          gap: 6px;
          color: #e7def9;
        }

        .price-summary__list li {
          margin: 0;
          line-height: 1.5;
        }

        .price-summary-card .muted.subtle,
        .price-summary-card .muted.small {
          color: #c6b7e8;
        }

        .price-summary-card .add-on-price {
          color: #c6b7e8;
        }
        .inline-price-summary {
          margin-top: 8px;
        }
        .pet-list-group {
          gap: 10px;
        }
        .pet-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 12px;
        }
        .pet-option {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 14px;
          align-items: center;
          padding: 14px;
          border-radius: 14px;
          position: relative;
          background: radial-gradient(
              120% 140% at 0% 0%,
              rgba(255, 255, 255, 0.08),
              rgba(255, 255, 255, 0.02)
            ),
              linear-gradient(145deg, rgba(34, 36, 76, 0.8), rgba(20, 22, 55, 0.8));
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          overflow: hidden;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.15s ease;
        }
        .pet-option::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(circle at 85% 20%, rgba(185, 196, 255, 0.14), transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .pet-option:hover {
          border-color: rgba(255, 255, 255, 0.24);
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.32);
          transform: translateY(-2px);
        }
        .pet-option:hover::after {
          opacity: 1;
        }
        .pet-option.selected {
          border-color: rgba(144, 166, 255, 0.8);
          box-shadow: 0 16px 36px rgba(124, 148, 255, 0.32);
          background: linear-gradient(135deg, rgba(144, 166, 255, 0.18), rgba(144, 166, 255, 0.06)),
            radial-gradient(120% 140% at 0% 0%, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)),
            linear-gradient(145deg, rgba(34, 36, 76, 0.8), rgba(20, 22, 55, 0.8));
        }
        .pet-option input {
          width: 18px;
          height: 18px;
          accent-color: #b9c4ff;
          align-self: flex-start;
          margin-top: 2px;
        }
        .pet-option__details {
          display: flex;
          flex-direction: column;
          gap: 2px;
          position: relative;
          z-index: 1;
        }
        .pet-option__identity {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 12px;
          align-items: center;
        }
        .pet-option__thumb {
          position: relative;
          width: 64px;
          height: 64px;
          border-radius: 16px;
          overflow: hidden;
        }
        .pet-option__avatar {
          width: 100%;
          height: 100%;
          border-radius: 16px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.04);
        }
        .pet-option__avatar.placeholder {
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, rgba(185, 196, 255, 0.18), rgba(249, 198, 212, 0.16));
        }
        .pet-option__initial {
          font-weight: 800;
          color: #0f1024;
          font-size: 22px;
          letter-spacing: 0.5px;
        }
        .pet-option__glow {
          position: absolute;
          inset: -4px;
          border-radius: 18px;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2), transparent 50%);
          filter: blur(8px);
          opacity: 0.7;
          pointer-events: none;
        }
        .pet-option__text {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pet-option__name {
          font-weight: 700;
          color: #f8f6ff;
          font-size: 16px;
        }
        .pet-option__meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }
        .pet-option__breed {
          color: #d8d2f8;
          font-size: 13px;
        }
        .pet-option__pill {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 999px;
          background: rgba(144, 166, 255, 0.18);
          color: #e5e7ff;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .pet-option__notes {
          margin: 0;
          color: #cdd3ff;
          font-size: 13px;
          line-height: 1.4;
          opacity: 0.9;
        }
        .dog-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          align-items: end;
          grid-column: 1 / -1;
        }
        .dog-row .searchable-select,
        .dog-row .input-group {
          width: 100%;
        }
        .searchable-select .select-shell {
          position: relative;
          z-index: 9999;
        }
        .searchable-select .select-input {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .searchable-select .select-input:focus-within {
          border-color: rgba(255, 255, 255, 0.35);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        .searchable-select .select-input input {
          width: 100%;
          background: transparent;
          border: none;
          color: #f7f7ff;
          font-size: 15px;
          padding: 10px 4px;
          outline: none;
        }
        
        @media (max-width: 900px) {
          .booking-overlay {
            padding: 12px;
            align-items: flex-start;
          }
          .booking-modal {
            height: auto;
            max-height: none;
            min-height: 0;
          }
          .booking-body {
            padding: 16px;
            gap: 12px;
          }
          .step-card {
            padding: 12px;
          }
          .booking-header {
            padding: 18px 18px 12px;
          }
          .times-actions {
            width: 100%;
            justify-content: flex-start;
          }
          .actions-stack {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 640px) {
          .booking-modal {
            width: 100%;
            border-radius: 12px;
            height: calc(100dvh - 24px);
            max-height: calc(100dvh - 24px);
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .booking-body {
            overflow-y: auto;
            flex: 1;
            min-height: 0;
            max-height: none;
            padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 12px);
          }
          booking-wayfinding {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          .step-chip-row {
            display: none;
          }
          .stepper {
            display: none;
          }
          .step-chip {
            padding: 10px;
            font-size: 14px;
          }
          .summary-chip {
            padding: 6px 8px;
            font-size: 12px;
          }
          .step-toolbar {
            flex-wrap: wrap;
            justify-content: flex-start;
          }
        }

        .searchable-select .select-input input::placeholder {
          color: #98a2ff;
          opacity: 0.65;
        }
        .searchable-select .chevron {
          color: #d8d2f8;
          font-size: 12px;
          pointer-events: none;
        }
        .searchable-select .clear-button {
          border: none;
          background: rgba(255, 255, 255, 0.08);
          color: #f2f1ff;
          border-radius: 8px;
          padding: 6px 8px;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .searchable-select .clear-button:hover {
          background: rgba(255, 255, 255, 0.14);
          transform: translateY(-1px);
        }
        .searchable-select .options-list {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          max-height: 240px;
          overflow: auto;
          padding: 6px;
          margin: 0;
          list-style: none;
          background: #0f1330;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
          z-index: 10000;
        }
        .searchable-select .option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          margin: 2px 0;
          border-radius: 10px;
          cursor: pointer;
          color: #e8ebff;
          transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
        }
        .searchable-select .option:hover,
        .searchable-select .option.highlight {
          background: rgba(255, 255, 255, 0.06);
          transform: translateY(-1px);
        }
        .searchable-select .option.selected {
          background: rgba(144, 166, 255, 0.12);
          border: 1px solid rgba(144, 166, 255, 0.28);
        }
        .searchable-select .option-label {
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        .searchable-select .option-check {
          color: #7dd3fc;
          font-weight: 700;
        }
        .searchable-select .no-results {
          padding: 10px;
          margin: 2px 0;
          color: #a2a5c7;
          text-align: center;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
        }

        .summary-readonly {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        }

        .summary-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .summary-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .summary-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 6px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .summary-item.stacked {
          flex-direction: column;
          align-items: flex-start;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-list.plain {
          gap: 6px;
        }

        .summary-label {
          color: #d2cef7;
          font-weight: 600;
          max-width: 100%;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .summary-card {
          word-break: break-word;
          overflow-wrap: anywhere;
          word-break: break-word;
          overflow-wrap: anywhere;
        }

        .summary-value {
          color: #f5f3ff;
          font-weight: 700;
        }
          @media (min-width: 1024px) {
          .searchable-select .options-list {
            max-height: none;
            overflow: visible;
          }
        }
        .dog-row__actions {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
        }
        .remove-dog-button {
          color: #f9c6d4;
          border-color: rgba(255, 255, 255, 0.28);
        }
        .actions-row {
          margin-top: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .error-banner,
        .success-banner {
          margin-top: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          font-weight: 600;
        }
        .error-banner {
          background: rgba(255, 99, 132, 0.15);
          color: #ff96a6;
          border: 1px solid rgba(255, 99, 132, 0.35);
        }
        .success-banner {
          background: rgba(52, 211, 153, 0.2);
          color: #c2f8e4;
          border: 1px solid rgba(52, 211, 153, 0.4);
        }


        @media (max-width: 900px) {
        .booking-modal {
            height: auto;
            max-height: none;
            min-height: 0;
          }
          .booking-body {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
            display: flex;
            flex-direction: column;
            gap: 14px;
            height: auto;
            min-width: 0;
          }
          .booking-wayfinding {
            flex-direction: column;
            align-items: stretch;
          }
          .wayfinding-summary {
            justify-content: flex-start;
          }
          .calendar-card {
            grid-row: auto;
          }
          .calendar-card,
          .times-card {
            width: 100%;
            max-height: 70vh;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          .times-list {
            max-height: 260px;
            overflow-y: auto;
          }
          .times-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .form-grid {
            grid-template-columns: 1fr;
            max-height: none;
            overflow: visible;
          }
        }

        @media (max-width: 640px) {
          .booking-overlay {
            padding: 12px;
            align-items: flex-start;
            justify-content: center;
          }
          .booking-modal {
            width: 100%;
            border-radius: 14px;
            height: calc(100dvh - 24px);
            max-height: calc(100dvh - 24px);
            min-height: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }
          .booking-header {
            padding: 18px 18px 12px;
            gap: 10px;
            flex-wrap: wrap;
          }
          .booking-body {
            padding: 14px 14px 18px;
            gap: 12px;
            flex: 1;
            min-height: 0;
            overflow-y: auto;
          }
          .calendar-card,
          .times-card {
            padding: 14px;
            gap: 10px;
            max-height: none;
            overflow: visible;
          }
          .calendar-toolbar {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          .weekday-row {
            font-size: 10px;
            gap: 4px;
          }
          .calendar-grid {
            gap: 4px;
          }
          .day {
            height: 48px;
            padding: 6px 8px;
            border-radius: 12px;
            font-size: 13px;
          }
          .times-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
          .times-list {
            max-height: 240px;
            overflow-y: auto;
          }
          .form-grid {
            gap: 10px;
            max-height: none;
          }
            .email-group .email-row {
            flex-direction: column;
            align-items: stretch;
          }
          .email-group .load-pets-button {
            width: 100%;
            justify-content: center;
          }
          .dog-row {
            grid-template-columns: 1fr;
          }
          .actions-row {
            position: sticky;
            bottom: 0;
            background: linear-gradient(180deg, transparent, rgba(31, 15, 58, 0.95));
            padding-top: 8px;
          }
          .button.w-button.primary { /* ensure full-width CTA on mobile if present */
            width: 100%;
            justify-content: center;
          }
        }
          .form-popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(9, 5, 20, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          z-index: 1200;
          backdrop-filter: blur(3px);
        }
        .form-popup {
          background: linear-gradient(145deg, #12092b, #1f0f3a);
          border-radius: 16px;
          width: min(780px, 100%);
          color: #f2ecff;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
        }
        .popup-header {
          display: flex;
          justify-content: space-between;
          padding: 18px 18px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          gap: 12px;
          align-items: flex-start;
        }
        .popup-body {
          padding: 16px 18px 20px;
          overflow-y: auto;
        }
        .popup-body .actions-row {
          position: static;
        }
        @media (max-width: 960px) {
          .booking-layout {
            grid-template-columns: 1fr;
          }
          .booking-sidebar {
            position: relative;
            top: auto;
          }
        }
        .mobile-summary-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 14px 20px;
  background: rgba(30, 20, 60, 0.62);
  backdrop-filter: blur(18px);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 999;
  border-top: 1px solid rgba(255,255,255,0.08);
}

@media (min-width: 1024px) {
  .mobile-summary-bar {
    display: none;
  }
}

        .desktop-summary {
  display: none;
}

@media (min-width: 1024px) {
  .desktop-summary {
    display: flex;
    flex-direction: column;
    text-align: right;
    opacity: 0.85;
    font-size: 0.9rem;
    line-height: 1.3rem;
    margin-left: auto;
    padding-left: 2rem;
  }

  .desktop-summary .price {
    font-weight: 600;
    font-size: 1rem;
    margin-top: 4px;
  }
}

.step-icon {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.08);
}

.times-list .time-slot {
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.times-list .time-slot:hover,
.times-list .time-slot:focus {
  border-color: rgba(124, 93, 242, 0.6);
  box-shadow: 0 8px 16px rgba(124, 93, 242, 0.25);
}

.calendar-grid .day {
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.calendar-grid .day:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 16px rgba(0, 0, 0, 0.2);
}

.recommendation-banner {
  border: 1px solid rgba(124, 93, 242, 0.4);
  background: rgba(124, 93, 242, 0.08);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px 12px;
}

.summary-price {
  text-align: right;
  font-weight: 700;
}

.summary-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 8px;
  margin-top: 8px;
}

.total-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.pet-chip-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.pet-chip {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 700;
  color: #e9e5ff;
}

.pet-chip.selected {
  background: rgba(124, 93, 242, 0.18);
  border-color: rgba(124, 93, 242, 0.6);
}

.add-on-carousel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.add-on-card {
  text-align: left;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 8px;
  align-items: start;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.add-on-card.selected {
  border-color: rgba(124, 93, 242, 0.7);
  box-shadow: 0 10px 18px rgba(124, 93, 242, 0.28);
  background: rgba(124, 93, 242, 0.12);
}

.add-on-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 0;
  grid-column: 1 / -1;
}

.add-on-description {
  grid-column: 1 / 2;
  margin: 4px 0 0;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.add-on-price-chip {
  background: rgba(124, 93, 242, 0.14);
  border-color: rgba(124, 93, 242, 0.6);
  color: #e9e5ff;
  font-weight: 800;
}

.add-on-running-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.card.on-secondary:hover {
  box-shadow: 0 16px 30px rgba(124, 93, 242, 0.25);
}
      `}</style>
);

export default PricingStyles;