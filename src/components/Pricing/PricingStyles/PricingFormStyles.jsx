const PricingFormStyles = () => (
  <style jsx global>{`
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
          overflow: visible;
          padding-right: 6px;
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
          height: 44px;
        }
        .input-group textarea {
          resize: none;
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
          height: 44px;
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
          height: 100%;
        }
        
  `}</style>
);

export default PricingFormStyles;
