const PricingControlStyles = () => (
  <style jsx global>{`
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
        .selection-summary-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          justify-content: flex-end;
        }
        .selection-summary-actions .input-group {
          min-width: 180px;
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
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease,
            transform 0.2s ease;
        }
        .pill-toggle input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
          height: 0;
          width: 0;
        }
        .pill-toggle small {
          display: block;
        }
        .pill-toggle:hover {
          background: rgba(124, 93, 242, 0.18);
        }
        .pill-toggle.is-active {
          background: #7c5df2;
          border-color: #7c5df2;
          box-shadow: 0 12px 24px rgba(124, 93, 242, 0.35);
        }
        .pill-toggle.is-active strong,
        .pill-toggle.is-active small {
          color: #fff;
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
        .month-nav button {
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.08);
          color: #f4f1ff;
          padding: 6px 10px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .month-nav button:hover {
          background: rgba(255, 255, 255, 0.14);
          transform: translateY(-1px);
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
  `}</style>
);

export default PricingControlStyles;
