const PricingBaseStyles = () => (
  <style jsx global>{`
    .card.on-secondary {
      transition:
        transform 0.25s ease,
        box-shadow 0.25s ease;
    }

    .card.on-secondary:hover {
      transform: translateY(-6px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
    }
    .availability-preview {
      margin-top: 12px;
      padding: 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      text-align: left;
    }
    .availability-preview .eyebrow {
      display: inline-flex;
      margin-bottom: 6px;
    }
    .availability-capacity {
      margin: 0 0 8px;
      font-weight: 600;
      font-size: 13px;
      color: #7c3aed;
    }
    .availability-capacity.is-full {
      color: rgba(242, 236, 255, 0.7);
    }
    .availability-slots {
      list-style: none;
      margin: 8px 0 0;
      padding: 0;
      display: grid;
      gap: 6px;
    }
    .availability-slot {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      font-size: 13px;
      color: #f2ecff;
    }
    .availability-slot time {
      font-variant-numeric: tabular-nums;
      color: rgba(242, 236, 255, 0.75);
    }
    .button.w-button {
      transition:
        background-color 0.25s ease,
        color 0.25s ease;
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
      max-height: calc(100dvh - 24px);
      height: auto;
      overflow: hidden;
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
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding-right: 4px;
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
      transition:
        background 0.2s ease,
        transform 0.2s ease,
        box-shadow 0.2s ease;
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

        /* Outlook-inspired booking editor theme */
        .booking-overlay {
          background: rgba(7, 8, 12, 0.82);
          backdrop-filter: blur(4px);
        }
        .booking-modal {
          background: #202124;
          border: 1px solid #373a40;
          border-radius: 8px;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.55);
          color: #e3e3e3;
        }
        .booking-hero {
          padding: 14px 18px;
          border-bottom: 1px solid #373a40;
          background: #111214;
        }
        .booking-hero .eyebrow {
          color: #b38cff;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 12px;
          font-weight: 700;
        }
        .booking-hero h3 {
          margin: 4px 0;
          font-size: 35px;
          line-height: 1.2;
          color: #d2d2d2;
          font-weight: 700;
        }
        .booking-body {
          padding: 14px;
          background: #202124;
        }
        .step-card,
        .calendar-card,
        .times-card {
          border-radius: 4px;
          border: 1px solid #3a3d42;
          background: #26282c;
        }
        .step-toolbar {
          border-bottom: 1px solid #3a3d42;
          padding-bottom: 8px;
        }
        .ghost-button {
          background: #2b2e34;
          color: #d9d9d9;
          border: 1px solid #4a4e55;
        }
        .ghost-button.active,
        .ghost-button:hover {
          background: #31353c;
          border-color: #8e63ff;
        }
        .button.w-button {
          background: #7e57c2;
          border: 1px solid #8e63ff;
          color: #ffffff;
          border-radius: 4px;
        }
        .button.w-button:hover {
          background: #8a63d7;
        }
        .booking-wayfinding {
          background: #191b1f;
          border: 1px solid #34373d;
        }
        .step-chip {
          border-radius: 8px;
          background: #2b2f35;
          border: 1px solid #454a52;
          color: #d4d4d4;
        }
        .step-chip.active {
          background: #7e57c2;
          color: #fff;
          box-shadow: none;
        }
        .summary-chip {
          background: #262a31;
          border: 1px solid #464a52;
        }
        .outlook-form-layout {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .outlook-summary-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .outlook-section-card {
          border: 1px solid #3f434b;
          background: #2a2d33;
          border-radius: 4px;
          padding: 12px;
        }
        .outlook-section-card h4 {
          margin: 0 0 8px;
          color: #b9bbbe;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .outlook-summary-grid .full-width,
        .outlook-form-layout .full-width {
          grid-column: 1 / -1;
        }
        .outlook-form-layout .input-group input,
        .outlook-form-layout .input-group textarea,
        .outlook-form-layout .input-group select {
          background: #1f2126;
          border: 1px solid #494e56;
          border-radius: 4px;
          color: #f3f3f3;
        }
        .summary-value {
          color: #f3f3f3;
        }
  `}</style>
);

export default PricingBaseStyles;
