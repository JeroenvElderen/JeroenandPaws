import React from 'react';

const ConsentBanner = ({ onAccept, onDecline }) => (
  <div className="consent-banner" role="dialog" aria-live="polite">
    <div className="consent-banner__content">
      <div className="consent-banner__text">
        <strong>We use analytics cookies</strong>
        <p>
          We use Google Analytics to understand how visitors use the site. You
          can accept or decline analytics cookies.
        </p>
      </div>
      <div className="consent-banner__actions">
        <button
          type="button"
          className="consent-banner__button consent-banner__button--primary"
          onClick={onAccept}
        >
          Accept
        </button>
        <button
          type="button"
          className="consent-banner__button"
          onClick={onDecline}
        >
          Decline
        </button>
      </div>
    </div>
  </div>
);

export default ConsentBanner;