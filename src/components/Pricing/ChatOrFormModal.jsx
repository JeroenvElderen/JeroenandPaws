import Link from "next/link";
import React from "react";
import { getPreferredChatUrl } from "../../utils/chatLinks";

const ChatOrFormModal = ({ service, onClose }) => {
  const chatUrl = service.ctaOptions?.chatUrl || getPreferredChatUrl();
  const formUrl = service.ctaOptions?.formUrl || "/contact?service=custom-request";
  const heading = service.ctaOptions?.heading || "Tell us about your perfect plan";
  const description =
    service.ctaOptions?.description ||
    "Choose WhatsApp for a quick chat or use the request form so we can tailor care to your pup.";

  return (
    <div className="booking-overlay" role="dialog" aria-modal="true">
      <div className="cta-choice-modal">
        <button className="cta-choice-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <div className="cta-choice-content">
          <div>
            <p className="eyebrow">Custom request</p>
            <h3>{heading}</h3>
            <p className="cta-choice-description">{description}</p>
          </div>
          <div className="cta-choice-actions">
            <Link
              className="button w-button"
              href={chatUrl}
              onClick={onClose}
              target="_blank"
              rel="noreferrer"
            >
              Chat on WhatsApp
            </Link>
            <Link className="ghost-button" href={formUrl} onClick={onClose}>
              Use the request form
            </Link>
            <p className="cta-choice-footnote">
              Need a different channel? Let us know in your message — we’ll accommodate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatOrFormModal;