import React, { useState } from 'react';

const initialState = {
  name: '',
  email: '',
  message: '',
};

const ContactFormSection = () => {
  const [formState, setFormState] = useState(initialState);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('submitting');
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message || 'Failed to send message');
      }

      setStatus('success');
      setFormState(initialState);
    } catch (submissionError) {
      setError(submissionError.message || 'Unable to send your message. Please try again.');
      setStatus('error');
    }
  };

  const showForm = status !== 'success';

  return (
    <section id="contact-form" className="section">
      <div className="container">
        <div className="w-layout-grid grid_2-col gap-large">
          <div className="w-form">
            {showForm && (
              <form
                onSubmit={handleSubmit}
                data-wf-element-id="b7669384-f90d-3abf-488f-b1efb7b2bf31"
                name="wf-form-Contact-Form"
                data-name="Contact Form"
                id="wf-form-contact-form"
                data-wf-page-id="68dd2ed176222062869f6535"
              >
                <div className="input">
                  <label htmlFor="name-3" className="input_label">
                    Your name
                  </label>
                  <input
                    className="input_field margin-bottom_xsmall w-input"
                    maxLength="256"
                    name="name"
                    data-name="Name"
                    placeholder="Your name"
                    type="text"
                    id="name-3"
                    value={formState.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input">
                  <label htmlFor="email-5" className="input_label">
                    Your email
                  </label>
                  <input
                    className="input_field margin-bottom_xsmall w-input"
                    maxLength="256"
                    name="email"
                    data-name="Email"
                    placeholder="email@hotmail.com"
                    type="email"
                    id="email-5"
                    value={formState.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input">
                  <label htmlFor="message-6" className="input_label">
                    How can I help?
                  </label>
                  <textarea
                    id="message-6"
                    name="message"
                    maxLength="5000"
                    data-name="Message"
                    placeholder="Type your message..."
                    className="input_field input_text-area margin-bottom_small w-input"
                    value={formState.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="button-group">
                  <input
                    type="submit"
                    data-wait="Please wait..."
                    className="button w-button"
                    value={status === 'submitting' ? 'Sending...' : 'Submit'}
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
              </form>
            )}
            {status === 'success' && (
              <div className="form_success-message w-form-done">
                <div>Thank you! I’ll be in touch soon.</div>
              </div>
            )}
          </div>
          <div
            id="w-node-_04da3743-9ce2-6e2d-ee03-df10a8aa6687-6c55b82b"
            className="w-node-b7669384-f90d-3abf-488f-b1efb7b2bf3f-869f6535"
          >
            <h2 className="heading_h2">Let’s talk about what your dog needs</h2>
            <p className="subheading">
              Considering training, walks, day care, or boarding? I’m here to help your dog feel understood, supported, and set up for success. Reach out and let’s explore the options that suit them best.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;