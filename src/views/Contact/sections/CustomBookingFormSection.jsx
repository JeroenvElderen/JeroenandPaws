import React from 'react';
import { getServiceLabel } from '../../../constants/serviceLabels';

const CustomBookingFormSection = ({ serviceId }) => {
  const serviceLabel = getServiceLabel(serviceId);

  return (
    <section id="custom-booking" className="section">
      <div className="container">
        <div className="w-layout-grid grid_2-col gap-large">
          <div className="card on-secondary">
            <div className="card_body">
              <p className="eyebrow">Booking update</p>
              <h2 className="heading_h2 margin-bottom_small">Booking form temporarily removed</h2>
              <p className="text-size_regular margin-bottom_small">
                We removed the current booking form while we rebuild a completely new booking
                experience.
              </p>
              <p className="text-size_regular margin-bottom_small">
                {serviceLabel ? `Service: ${serviceLabel}. ` : ''}
                For new requests, please contact us directly and we will help you personally.
              </p>
              <a href="mailto:info@jeroenandpaws.com" className="button w-inline-block">
                <div>Email us</div>
              </a>
            </div>
          </div>

          <div className="card on-primary">
            <div className="card_body">
              <p className="eyebrow">What&apos;s next</p>
              <h3 className="heading_h4 margin-bottom_small">New design in progress</h3>
              <p className="text-size_regular">
                A redesigned booking flow is currently being built. Thank you for your patience
                while we improve the experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomBookingFormSection;
