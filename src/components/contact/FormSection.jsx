import { useState } from 'react';

const initialValues = {
  'name-3': '',
  'email-5': '',
  'message-6': '',
};

const ContactFormSection = () => {
  const [formValues, setFormValues] = useState(initialValues);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [invalidFields, setInvalidFields] = useState({});

  const isSubmitting = status === 'submitting';
  const showSuccess = status === 'success';
  const showError = status === 'error';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));

    if (status !== 'idle') {
      setStatus('idle');
    }
    if (invalidFields[name]) {
      setInvalidFields((prev) => ({ ...prev, [name]: false }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formValues['name-3'].trim()) {
      errors['name-3'] = true;
    }

    const email = formValues['email-5'].trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors['email-5'] = true;
    }

    if (!formValues['message-6'].trim()) {
      errors['message-6'] = true;
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validate();

    if (Object.keys(errors).length > 0) {
      setInvalidFields(errors);
      setStatus('error');
      return;
    }

    setInvalidFields({});
    setStatus('submitting');

    // Simulate async submission to mimic the original Webflow behaviour
    await new Promise((resolve) => setTimeout(resolve, 600));

    setFormValues({ ...initialValues });
    setStatus('success');
  };

  return (
    <section id="contact-form" className="section">
      <div className="container">
        <div className="w-layout-grid grid_2-col gap-large">
          <div className="w-form">
            <form
              method="get"
              data-wf-element-id="b7669384-f90d-3abf-488f-b1efb7b2bf31"
              name="wf-form-Contact-Form"
              data-name="Contact Form"
              id="wf-form-contact-form"
              data-wf-page-id="68dd2ed176222062869f6535"
              noValidate
              onSubmit={handleSubmit}
              style={{ display: showSuccess ? 'none' : 'block' }}
            >
              <div className="input">
                <label htmlFor="name-3" className="input_label">
                  Your name
                </label>
                <input
                  className="input_field margin-bottom_xsmall w-input"
                  maxLength="256"
                  name="name-3"
                  data-name="Name 3"
                  placeholder="Your name"
                  type="text"
                  id="name-3"
                  value={formValues['name-3']}
                  onChange={handleChange}
                  aria-required="true"
                  aria-invalid={invalidFields['name-3'] ? 'true' : 'false'}
                />
              </div>
              <div className="input">
                <label htmlFor="email-5" className="input_label">
                  Your email
                </label>
                <input
                  className="input_field margin-bottom_xsmall w-input"
                  maxLength="256"
                  name="email-5"
                  data-name="Email 5"
                  placeholder="email@website.com"
                  type="email"
                  id="email-5"
                  required
                  value={formValues['email-5']}
                  onChange={handleChange}
                  aria-required="true"
                  aria-invalid={invalidFields['email-5'] ? 'true' : 'false'}
                />
              </div>
              <div className="input">
                <label htmlFor="message-6" className="input_label">
                  How can I help?
                </label>
                <textarea
                  id="message-6"
                  name="message-6"
                  maxLength="5000"
                  data-name="Message 6"
                  placeholder="Type your message..."
                  className="input_field input_text-area margin-bottom_small w-input"
                  value={formValues['message-6']}
                  onChange={handleChange}
                  aria-required="true"
                  aria-invalid={invalidFields['message-6'] ? 'true' : 'false'}
                ></textarea>
              </div>
              <div className="button-group">
                <input
                  type="submit"
                  data-wait="Please wait..."
                  className="button w-button"
                  value={isSubmitting ? 'Please wait...' : 'Submit'}
                  disabled={isSubmitting}
                />
              </div>
            </form>
            <div
              className="form_success-message w-form-done"
              style={{ display: showSuccess ? 'block' : 'none' }}
              role="status"
            >
              <div>Thank you! I’ll be in touch soon.</div>
            </div>
            <div
              className="form_error-message w-form-fail"
              style={{ display: showError ? 'block' : 'none' }}
              role="alert"
            >
              <div className="form_error-message_content">
                <img
                  width=""
                  height=""
                  alt="image of pet grooming activities"
                  src="https://webflow-prod-assets.s3.amazonaws.com/image-generation-assets/35e19431-d2e7-4133-9460-3d46aa9c3749.avif"
                  loading="lazy"
                  data-aisg-image-id="35e19431-d2e7-4133-9460-3d46aa9c3749"
                  className="display_inline-block"
                />
                <div className="display_inline-block">Oops! Please check your details and try again.</div>
              </div>
            </div>
          </div>
          <div
            id="w-node-_04da3743-9ce2-6e2d-ee03-df10a8aa6687-6c55b82b"
            className="w-node-b7669384-f90d-3abf-488f-b1efb7b2bf3f-869f6535"
          >
            <h2 className="heading_h2">Let’s connect about your dog</h2>
            <p className="subheading">
              Curious about training, walks, or care? I’m here to answer your questions and help your dog thrive. Reach out and
              let’s chat about the best options for your pup.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactFormSection;