import React from 'react';
import ContactFormSection from './sections/ContactFormSection';
import CustomBookingFormSection from './sections/CustomBookingFormSection';

const Contact = ({ serviceId = '' }) => (
  <main>
    {serviceId ? (
      <CustomBookingFormSection serviceId={serviceId} />
    ) : (
      <ContactFormSection />
    )}
  </main>
);

export default Contact;