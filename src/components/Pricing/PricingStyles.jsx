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
          background: rgba(9, 5, 20, 0.5);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          z-index: 1000;
        }
        .booking-modal {
          background: linear-gradient(135deg, #1a1132, #1f0f3a);
          border-radius: 16px;
          width: min(1100px, 100%);
          color: #f2ecff;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          position: relative;
          height: calc(100vh - 64px);
          max-height: 880px;
          min-height: 560px;
          display: flex;
          flex-direction: column;
        }
        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 24px 28px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .booking-header h3 {
          margin: 6px 0 4px;
        }
        .booking-body {
          display: grid;
          grid-template-columns: 1.6fr 0.8fr;
          grid-template-rows: minmax(240px, 0.9fr) minmax(360px, 1.1fr);
          gap: 16px;
          padding: 20px 24px 24px;
          flex: 1;
          min-height: 0;
        }
        .calendar-card,
        .times-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 0;
        }
        .calendar-card {
          grid-row: 1 / span 2;
        }
        .times-card {
          grid-row: 1 / span 2;
        }
        .actions-stack {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }
        .ghost-button {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #f2ecff;
          border-radius: 12px;
          padding: 10px 14px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .ghost-button:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }
        .selection-summary {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: flex-start;
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
..input-like-select option {
          color: #e7def9;
          background: rgba(26, 17, 50, 1);
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

/* Availability dot */
.day-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22d3ee; /* cyan glow */
  box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.25);
  margin-top: 2px;
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
        .pet-list-group {
          gap: 10px;
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
            height: auto;
            max-height: none;
            min-height: 0;
            overflow: visible;
          }
          .booking-header {
            padding: 18px 18px 12px;
            gap: 10px;
            flex-wrap: wrap;
          }
          .booking-body {
            padding: 14px 14px 18px;
            gap: 12px;
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
      `}</style>
);

export default PricingStyles;