import { useState } from "react";

const ServicesFAQSection = ({ data = [] }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Your Dog’s Second Home</h2>
          <p className="subheading">
            Everything you need to know about our dog care, training, and daily adventures—answered for you below.
          </p>
        </div>

        <div className="flex_vertical">
          {data.map((faq, idx) => (
            <div
              key={faq.id}
              className={`accordion is-transparent w-dropdown ${
                openIndex === idx ? "w--open" : ""
              }`}
            >
              {/* Toggle button */}
              <div
                className="accordion_toggle-transparent w-dropdown-toggle"
                onClick={() => toggle(idx)}
                style={{ cursor: "pointer" }}
              >
                <div className="accordion_icon w-icon-dropdown-toggle"></div>
                <div className="paragraph_large margin-bottom_none">
                  {faq.question}
                </div>
              </div>

              {/* Answer */}
              <nav
                className="accordion_content w-dropdown-list"
                style={{
                  display: openIndex === idx ? "block" : "none",
                }}
              >
                <div className="padding_xsmall padding-horizontal_none">
                  <div className="rich-text w-richtext">
                    {/* allow HTML if needed */}
                    <p dangerouslySetInnerHTML={{ __html: faq.answer }} />
                  </div>
                </div>
              </nav>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesFAQSection;
