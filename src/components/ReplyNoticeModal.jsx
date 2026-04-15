import React from 'react';

const ReplyNoticeModal = ({ isOpen, onContinue, onCancel }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="form-popup-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reply-notice-title"
      aria-describedby="reply-notice-description"
    >
      <div className="backend-modal form-popup">
        <div className="popup-header">
          <h3 id="reply-notice-title" className="heading_h4 margin-bottom_none">
            One quick heads-up
          </h3>
        </div>
        <div className="popup-body">
          <p id="reply-notice-description" className="subheading margin-bottom_small">
            When I reply to your message, my response can sometimes land in your junk/spam
            folder. Please keep an eye on it.
          </p>
          <div className="button-group">
            <button type="button" className="button is-secondary w-button" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="button w-button" onClick={onContinue}>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyNoticeModal;