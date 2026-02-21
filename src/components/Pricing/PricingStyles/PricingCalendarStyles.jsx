const PricingCalendarStyles = () => (
  <style jsx global>{`
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
  background: linear-gradient(145deg, #6e4bd8, #7c5df2);
  border-color: transparent;
  color: #0c061a;
  box-shadow: 0 6px 16px rgba(124, 93, 242, 0.35);
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
  


.outlook-week-board {
  border: 1px solid rgba(124, 93, 242, 0.35);
  background: rgba(38, 24, 66, 0.55);
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 14px;
}
.outlook-week-board__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
}
.outlook-week-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}
.outlook-day-column {
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  background: rgba(0,0,0,0.16);
  padding: 8px;
}
.outlook-day-column.is-selected {
  border-color: rgba(124, 93, 242, 0.8);
  box-shadow: 0 0 0 1px rgba(124, 93, 242, 0.5) inset;
}
.outlook-day-head {
  width: 100%;
  border: 0;
  border-radius: 8px;
  background: rgba(124, 93, 242, 0.2);
  color: #f3eaff;
  padding: 6px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
}
.outlook-slot-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}
.outlook-slot {
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: #f2ecff;
  border-radius: 8px;
  padding: 6px;
  font-size: 12px;
}
.outlook-slot.active {
  background: linear-gradient(145deg, #6e4bd8, #7c5df2);
  color: #0c061a;
  border-color: transparent;
}
  `}</style>
);

export default PricingCalendarStyles;
