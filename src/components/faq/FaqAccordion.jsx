import React, { useCallback, useState } from "react";

const FaqAccordion = ({ faqs, alignCenter = false, className = "" }) => {
  const [openIndexes, setOpenIndexes] = useState([]);

  const toggleItem = useCallback((index) => {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    );
  }, []);

  const handleKeyDown = useCallback(
    (event, index) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleItem(index);
      }
    },
    [toggleItem]
  );

  const wrapperClasses = [
    "flex_vertical",
    alignCenter ? "is_align-center-flex" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses}>
      {faqs.map(({ question, answer }, index) => {
        const isOpen = openIndexes.includes(index);
        return (
          <div
            key={question}
            data-delay="0"
            data-hover="false"
            className={`accordion is-transparent w-dropdown${
              isOpen ? " w--open" : ""
            }`}
          >
            <div
              className={`accordion_toggle-transparent w-dropdown-toggle${
                isOpen ? " w--open" : ""
              }`}
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              onClick={() => toggleItem(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <div className="accordion_icon w-icon-dropdown-toggle"></div>
              <div
                className={`paragraph_large margin-bottom_none${
                  alignCenter ? " text-center" : ""
                }`}
              >
                {question}
              </div>
            </div>
            <nav
              className={`accordion_content w-dropdown-list${
                isOpen ? " w--open" : ""
              }`}
              aria-hidden={!isOpen}
            >
              <div className="padding_xsmall padding-horizontal_none">
                <div className="rich-text w-richtext">
                  <p>{answer}</p>
                </div>
              </div>
            </nav>
          </div>
        );
      })}
    </div>
  );
};

export default FaqAccordion;