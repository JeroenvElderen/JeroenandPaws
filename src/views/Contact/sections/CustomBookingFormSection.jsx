import React, { useEffect, useMemo, useState } from 'react';

const SERVICE_LABELS = {
  'daily-stroll-custom': 'Custom check-in or walk',
  'overnight-stay-custom': 'Custom overnight or travel care',
  'home-check-in-custom': 'Custom home check-in',
  'daytime-care-custom': 'Custom daytime care',
};

const createInitialState = (serviceLabel) => ({
  name: '',
  email: '',
  phone: '',
  serviceType: serviceLabel || 'Custom booking',
  dogCount: '1',
  dogName: '',
  dogBreed: '',
  dogAge: '',
  dogSize: '',
  careTiming: '',
  pickupLocation: '',
  preferences: '',
  specialNotes: '',
  message: '',
});

const buildBookingMessage = (state, serviceLabel) => {
  const lines = [
    `Service: ${state.serviceType || serviceLabel || 'Custom booking'}`,
    state.dogCount && `Number of dogs: ${state.dogCount}`,
    state.careTiming && `Preferred timing: ${state.careTiming}`,
    state.pickupLocation && `Pickup/visit location: ${state.pickupLocation}`,
    state.dogName && `Dog name: ${state.dogName}`,
    state.dogBreed && `Breed: ${state.dogBreed}`,
    state.dogAge && `Age: ${state.dogAge}`,
    state.dogSize && `Size/weight: ${state.dogSize}`,
    state.preferences && `Routine & preferences: ${state.preferences}`,
    state.specialNotes && `Notes or medications: ${state.specialNotes}`,
    state.message && `Extra details: ${state.message}`,
  ].filter(Boolean);

  return lines.join('\n');
};

const CustomBookingFormSection = ({ serviceId }) => {
  const serviceLabel = useMemo(
    () => SERVICE_LABELS[serviceId] || 'Custom booking request',
    [serviceId]
  );
  const [formState, setFormState] = useState(() =>
    createInitialState(serviceLabel)
  );
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    setFormState((current) => ({
      ...current,
      serviceType: current.serviceType || serviceLabel,
    }));
  }, [serviceLabel]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('submitting');
    setError('');

    const composedMessage = buildBookingMessage(formState, serviceLabel);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formState, message: composedMessage }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message || 'Failed to send request');
      }

      setStatus('success');
      setFormState(createInitialState(serviceLabel));
    } catch (submissionError) {
      setError(
        submissionError.message ||
          'Unable to send your booking request. Please try again.'
      );
      setStatus('error');
    }
  };

  const showForm = status !== 'success';

  return (
    <section id="custom-booking" className="section">
      <div className="container">
        <div className="w-layout-grid grid_2-col gap-large">
          <div className="w-form">
            {showForm && (
              <form onSubmit={handleSubmit} className="card on-secondary">
                <div className="card_body">
                  <p className="eyebrow">Custom request form</p>
                  <h2 className="heading_h2 margin-bottom_small">
                    Tell us about your perfect plan
                  </h2>
                  <div className="w-layout-grid grid_2-col gap-small">
                    <div className="input">
                      <label htmlFor="name" className="input_label">
                        Your name
                      </label>
                      <input
                        className="input_field margin-bottom_xsmall w-input"
                        maxLength="256"
                        name="name"
                        id="name"
                        placeholder="Your name"
                        type="text"
                        value={formState.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="input">
                      <label htmlFor="email" className="input_label">
                        Your email
                      </label>
                      <input
                        className="input_field margin-bottom_xsmall w-input"
                        maxLength="256"
                        name="email"
                        id="email"
                        placeholder="email@website.com"
                        type="email"
                        value={formState.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="w-layout-grid grid_2-col gap-small">
                    <div className="input">
                      <label htmlFor="phone" className="input_label">
                        Phone (optional)
                      </label>
                      <input
                        className="input_field margin-bottom_xsmall w-input"
                        maxLength="32"
                        name="phone"
                        id="phone"
                        placeholder="WhatsApp or phone number"
                        type="tel"
                        value={formState.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="input">
                      <label htmlFor="serviceType" className="input_label">
                        Service type
                      </label>
                      <input
                        className="input_field margin-bottom_xsmall w-input"
                        maxLength="256"
                        name="serviceType"
                        id="serviceType"
                        placeholder="Custom booking"
                        type="text"
                        value={formState.serviceType}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="divider margin-bottom_small" />

                  <p className="eyebrow">About your dog</p>
                  <div className="w-layout-grid grid_2-col gap-small">
                    <div className="input">
                      <label htmlFor="dogCount" className="input_label">
                        How many dogs?
                      </label>
                      <select
                        id="dogCount"
                        name="dogCount"
                        className="input_field margin-bottom_xsmall w-select"
                        value={formState.dogCount}
                        onChange={handleChange}
                      >
                        {[1, 2, 3, 4].map((count) => (
                          <option key={count} value={count}>
                            {count}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="input">
                      <label htmlFor="dogName" className="input_label">
                        Dog name
                      </label>
                      <input
                        className="input_field margin-bottom_xsmall w-input"
                        maxLength="256"
                        name="dogName"
                        id="dogName"
                        placeholder="e.g., Luna"
                        type="text"
                        value={formState.dogName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="input">
                      <label htmlFor="dogBreed" className="input_label">
                        Breed (or mix)
                      </label>
                      <input
                        className="input_field margin-bottom_xsmall w-input"
                        maxLength="256"
                        name="dogBreed"
                        id="dogBreed"
                        placeholder="e.g., Border Collie mix"
                        type="text"
                        value={formState.dogBreed}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="w-layout-grid grid_2-col gap-small">
                    <div className="input">
                      <label htmlFor="dogAge" className="input_label">
                        Age
                      </label>
                      <input
                        className="input_field margin-bottom_xsmall w-input"
                        maxLength="64"
                        name="dogAge"
                        id="dogAge"
                        placeholder="e.g., 2 years"
                        type="text"
                        value={formState.dogAge}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="input">
                      <label htmlFor="dogSize" className="input_label">
                        Size/weight
                      </label>
                      <input
                        className="input_field margin-bottom_xsmall w-input"
                        maxLength="64"
                        name="dogSize"
                        id="dogSize"
                        placeholder="e.g., 12 kg"
                        type="text"
                        value={formState.dogSize}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="divider margin-bottom_small" />

                  <p className="eyebrow">Care details</p>
                  <div className="input">
                    <label htmlFor="careTiming" className="input_label">
                      Preferred dates or cadence
                    </label>
                    <input
                      className="input_field margin-bottom_xsmall w-input"
                      maxLength="256"
                      name="careTiming"
                      id="careTiming"
                      placeholder="e.g., weekdays at 11:00, or March 10–12"
                      type="text"
                      value={formState.careTiming}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input">
                    <label htmlFor="pickupLocation" className="input_label">
                      Pickup/visit location
                    </label>
                    <input
                      className="input_field margin-bottom_xsmall w-input"
                      maxLength="256"
                      name="pickupLocation"
                      id="pickupLocation"
                      placeholder="Address or neighborhood"
                      type="text"
                      value={formState.pickupLocation}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="input">
                    <label htmlFor="preferences" className="input_label">
                      Routine & preferences
                    </label>
                    <textarea
                      id="preferences"
                      name="preferences"
                      maxLength="2000"
                      className="input_field input_text-area margin-bottom_small w-input"
                      placeholder="Feeding times, leash style, favorite routes, play style"
                      value={formState.preferences}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="input">
                    <label htmlFor="specialNotes" className="input_label">
                      Medications or special notes
                    </label>
                    <textarea
                      id="specialNotes"
                      name="specialNotes"
                      maxLength="2000"
                      className="input_field input_text-area margin-bottom_small w-input"
                      placeholder="Allergies, reactivity, medical needs"
                      value={formState.specialNotes}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="input">
                    <label htmlFor="message" className="input_label">
                      Anything else to tailor your booking?
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      maxLength="5000"
                      data-name="Message"
                      placeholder="Share preferences, goals, or questions"
                      className="input_field input_text-area margin-bottom_small w-input"
                      value={formState.message}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="button-group">
                    <input
                      type="submit"
                      data-wait="Please wait..."
                      className="button w-button"
                      value={status === 'submitting' ? 'Sending...' : 'Submit request'}
                      disabled={status === 'submitting'}
                    />
                  </div>
                  {status === 'error' && (
                    <div className="form_error-message w-form-fail">
                      <div className="form_error-message_content">
                        <img
                          alt="Pet grooming illustration"
                          src="https://webflow-prod-assets.s3.amazonaws.com/image-generation-assets/35e19431-d2e7-4133-9460-3d46aa9c3749.avif"
                          loading="lazy"
                          className="display_inline-block"
                        />
                        <div className="display_inline-block">{error}</div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )}
            {status === 'success' && (
              <div className="form_success-message w-form-done">
                <div>
                  Thank you! I’ll review your custom booking and follow up shortly.
                </div>
              </div>
            )}
          </div>
          <div
            id="w-node-custom-booking-copy"
            className="w-node-b7669384-f90d-3abf-488f-b1efb7b2bf3f-869f6535"
          >
            <h2 className="heading_h2">Design the care your pup deserves</h2>
            <p className="subheading">
              Share when you need help, how your dog likes to spend their time, and any special instructions. I’ll confirm
              availability and send a personalized plan.
            </p>
            <div className="card on-secondary margin-top_small">
              <div className="card_body">
                <p className="eyebrow">What happens next</p>
                <ul className="w-list-unstyled">
                  <li className="margin-bottom_xsmall">I review your request and check the schedule.</li>
                  <li className="margin-bottom_xsmall">We align on details via WhatsApp or email.</li>
                  <li className="margin-bottom_xsmall">You receive a tailored plan with pricing.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomBookingFormSection;