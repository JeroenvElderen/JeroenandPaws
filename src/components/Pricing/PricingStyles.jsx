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
          gap: 16px;
          padding: 20px 24px 24px;
        }
        .calendar-card,
        .times-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 18px;
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
          background: rgba(255, 255, 255,, 0.06);
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
        transition: background 0.2s ease,, transform 0.,2s ease;
        }
        .nav button:hover {
          background: rgba(255, 255,, 255, 0.12);
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
        .times-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 300px; /* adjust as needed */
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
        .actions-row {
          margin-top: 4px;
          display: flex;
          justify-content: flex-end;
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
          .booking-body {
            grid-template-columns: 1fr;
          }
          .times-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
);

export default PricingStyles;