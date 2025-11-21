import React, { useEffect, useMemo, useState } from 'react';
import { getServiceLabel } from '../../../constants/serviceLabels';

const createDog = () => ({
  name: '',
  breed: '',
  age: '',
  size: '',
});

const createInitialState = (serviceLabel) => ({
  name: '',
  email: '',
  phone: '',
  serviceType: serviceLabel || 'Custom booking',
  dogCount: '1',
  dogs: [createDog(), createDog(), createDog(), createDog()],
  careTiming: '',
  pickupLocation: '',
  preferences: '',
  specialNotes: '',
  message: '',
});

const buildBookingMessage = (state, serviceLabel) => {
  const dogCount = Number(state.dogCount) || 1;
  const dogDetails = (state.dogs || [])
    .slice(0, dogCount)
    .map((dog, index) => {
      const parts = [
        dog?.name && `Name: ${dog.name}`,
        dog?.breed && `Breed: ${dog.breed}`,
        dog?.age && `Age: ${dog.age}`,
        dog?.size && `Size/weight: ${dog.size}`,
      ].filter(Boolean);

      return parts.length
        ? [`Dog ${index + 1}:`, ...parts.map((detail) => `  - ${detail}`)].join('\n')
        : '';
    })
    .filter(Boolean);

  const lines = [
    `Service: ${state.serviceType || serviceLabel || 'Custom booking'}`,
    state.dogCount && `Number of dogs: ${state.dogCount}`,
    ...dogDetails,
    state.careTiming && `Preferred timing: ${state.careTiming}`,
    state.pickupLocation && `Pickup/visit location: ${state.pickupLocation}`,
    state.preferences && `Routine & preferences: ${state.preferences}`,
    state.specialNotes && `Notes or medications: ${state.specialNotes}`,
    state.message && `Extra details: ${state.message}`,
  ].filter(Boolean);

  return lines.join('\n');
};

const CustomBookingFormSection = ({ serviceId }) => {
  const serviceLabel = useMemo(() => getServiceLabel(serviceId), [serviceId]);
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

  const handleDogChange = (index, field) => (event) => {
    const { value } = event.target;

    setFormState((current) => {
      const updatedDogs = [...(current.dogs || [])];
      updatedDogs[index] = { ...updatedDogs[index], [field]: value };

      return {
        ...current,
        dogs: updatedDogs,
      };
    });
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
  const visibleDogCount = Math.min(Number(formState.dogCount) || 1, 4);
  const visibleDogs = (formState.dogs || []).slice(0, visibleDogCount);

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

                  <p className="eyebrow">About your dog(s)</p>
                  <div className="input">
                    <label htmlFor="dogCount" className="input_label">
                      How many dogs?
                    </label>
                    <select
                      id="dogCount"
                      name="dogCount"
                      className="input_field margin-bottom_small w-select"
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

                  {visibleDogs.map((dog, index) => (
                    <div key={index} className="margin-bottom_small">
                      {index > 0 && <div className="divider margin-bottom_small" />}
                      <p className="eyebrow">Dog {index + 1}</p>
                      <div className="w-layout-grid grid_2-col gap-small">
                        <div className="input">
                          <label htmlFor={`dog-${index}-name`} className="input_label">
                            Name
                          </label>
                          <input
                            className="input_field margin-bottom_xsmall w-input"
                            maxLength="256"
                            name={`dog-${index}-name`}
                            id={`dog-${index}-name`}
                            placeholder="e.g., Luna"
                            type="text"
                            value={dog.name}
                            onChange={handleDogChange(index, 'name')}
                            required
                          />
                        </div>
                        <div className="input">
                          <label htmlFor={`dog-${index}-breed`} className="input_label">
                            Breed (or mix)
                          </label>
                          <input
                            className="input_field margin-bottom_xsmall w-input"
                            maxLength="256"
                            name={`dog-${index}-breed`}
                            id={`dog-${index}-breed`}
                            placeholder="e.g., Border Collie mix"
                            type="text"
                            value={dog.breed}
                            onChange={handleDogChange(index, 'breed')}
                            required
                          />
                        </div>
                      </div>
                      <div className="w-layout-grid grid_2-col gap-small">
                        <div className="input">
                          <label htmlFor={`dog-${index}-age`} className="input_label">
                            Age
                          </label>
                          <input
                            className="input_field margin-bottom_xsmall w-input"
                            maxLength="64"
                            name={`dog-${index}-age`}
                            id={`dog-${index}-age`}
                            placeholder="e.g., 2 years"
                            type="text"
                            value={dog.age}
                            onChange={handleDogChange(index, 'age')}
                            required
                          />
                        </div>
                        <div className="input">
                          <label htmlFor={`dog-${index}-size`} className="input_label">
                            Size/weight
                          </label>
                          <input
                            className="input_field margin-bottom_xsmall w-input"
                            maxLength="64"
                            name={`dog-${index}-size`}
                            id={`dog-${index}-size`}
                            placeholder="e.g., 12 kg"
                            type="text"
                            value={dog.size}
                            onChange={handleDogChange(index, 'size')}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}

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