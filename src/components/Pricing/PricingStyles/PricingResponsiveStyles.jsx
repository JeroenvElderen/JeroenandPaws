const PricingResponsiveStyles = () => (
  <style jsx global>{`
        @media (max-width: 900px) {
          .booking-overlay {
            padding: 12px;
            align-items: flex-start;
          }
          .service-chooser {
            height: 100%;
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
          max-height: calc(5 * 44px);
          overflow-y: auto;
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
          min-height: 44px;
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

        .summary-tag {
          align-self: flex-start;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(125, 211, 252, 0.15);
          color: #c5e9ff;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.01em;
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
        
        .summary-subvalue {
          margin-top: 2px;
        }

        .chip-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.04);
          cursor: pointer;
          font-weight: 600;
          color: #eef0ff;
          transition: border-color 0.2s ease, background 0.2s ease,
            transform 0.2s ease, box-shadow 0.2s ease;
        }

        .chip-option:hover {
          border-color: rgba(125, 211, 252, 0.5);
          background: rgba(125, 211, 252, 0.1);
          transform: translateY(-1px);
        }

        .chip-option input {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.4);
          display: grid;
          place-content: center;
          background: rgba(15, 19, 48, 0.8);
          transition: border-color 0.2s ease, background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .chip-option input::before {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transform: scale(0);
          transition: transform 0.2s ease;
          background: #7dd3fc;
        }

        .chip-option input:checked {
          border-color: #7dd3fc;
          box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.2);
        }

        .chip-option input:checked::before {
          transform: scale(1);
        }

        .chip-option:focus-within {
          border-color: rgba(144, 166, 255, 0.7);
          box-shadow: 0 0 0 2px rgba(144, 166, 255, 0.2);
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
        .form-success-state {
          grid-column: 1 / -1;
          margin-top: 6px;
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
);
  `}</style>
);

export default PricingResponsiveStyles;
