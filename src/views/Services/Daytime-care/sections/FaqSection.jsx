import React, { useState } from "react";

const FaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What does a typical day of daycare look like?",
      answer:
        "Your dog enjoys a calm, structured day — no large groups, just personal attention. Activities may include play, gentle enrichment, outdoor breaks, and restful downtime, all tailored to your dog’s needs and comfort level.",
    },
    {
      question: "Is the daycare one-on-one?",
      answer:
        "Yes. I care for one dog at a time, or dogs from the same household. This ensures your dog receives full attention in a relaxed, stress-free environment — no crowded spaces or overwhelming group dynamics.",
    },
    {
      question: "Do you accept puppies or senior dogs?",
      answer:
        "Absolutely. Puppies receive extra breaks, supervised play, and support with new experiences. Senior dogs enjoy a slower pace, comfortable resting places, and patient care suited to their mobility and routine.",
    },
    {
      question: "Will I get updates during the day?",
      answer:
        "Yes. I send thoughtful updates — including short notes and photos — so you always know how your dog is doing and can relax while you're away.",
    },
    {
      question: "What should I bring for daycare?",
      answer:
        "Please bring your dog’s basics: a secure leash, any food or treats they need, and a comfort item such as a favourite toy or blanket. Everything else is handled here.",
    },
    {
      question: "How do you ensure my dog's safety?",
      answer:
      "I use secure, well-fitted equipment, supervise all activities, and maintain a calm environment. Safety guides every decision — from playtime to rest time.",
    },
    {
      question: "Is there outdoor time included?",
      answer:
        "Yes. Weather permitting, dogs enjoy outdoor breaks to sniff, explore, and stretch their legs, always under supervision",
    },
    {
      question: "Can you follow my dog's schedule or routines?",
      answer:
        "Of course. If your dog has specific feeding times, medication, or habits, I'll follow them to keep their day familiar and comfortable.",
    },
    {
      question: "What if my plans change?",
      answer: 
        "I understand that schedules shift. You can reschedule or cancel with notice — just let me know as soon as possible.",
    },
    {
      question: "Can my dog socialize with others?",
      answer:
        "Daytime care is one-on-one by default, but if you'd like controlled social time, we can discuss safe introductions based on temperament and compatibility.",
    },
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Daytime care — frequently asked questions</h2>
          <p className="subheading">
            Everything you need to know about my one-on-one daytime care — so you can feel confident knowing your dog is supported, safe, and understood.
          </p>
        </div>

        <div className="flex_vertical">
          {faqs.map((faq, index) => (
            <div className="accordion is-transparent" key={index}>
              <button
                className="accordion_toggle-transparent"
                onClick={() => toggleAccordion(index)}
              >
                <div className="accordion_icon">
                  {activeIndex === index ? "−" : "+"}
                </div>
                <div className="paragraph_large margin-bottom_none">
                  {faq.question}
                </div>
              </button>
              {activeIndex === index && (
                <div className="accordion_content">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
