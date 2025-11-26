import React, { useState } from "react";

const DailystrollsFaqSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What types of dog walks do you offer?",
      answer:
        "We offer flexible walk durations — 30 minutes, 60 minutes, extended options, and fully custom plans. Whether your dog needs a quick outing or a longer adventure, we’ll match the walk to their energy and routine.",
    },
    {
      question: "Will my dog get one-on-one attention?",
      answer:
        "Yes. Walks are individual by default, giving your dog our full attention, a safe environment, and plenty of time to sniff, explore, and relax without distractions.",
    },
    {
      question: "Can you handle high-energy or shy dogs?",
      answer:
        "Absolutely. Every walk is adjusted to your dog’s personality — calmer routes for sensitive dogs, more active outings for confident explorers, and a tailored pace for everyone in between.",
    },
    {
      question: "What if it’s raining or the weather is bad?",
      answer:
        "We walk in most weather conditions, always prioritising safety. A little rain won’t stop us, but if conditions become unsafe, we’ll discuss alternatives with you.",
    },
    {
      question: "Can you walk senior dogs or those with special needs?",
      answer:
        "Yes. We adapt pace, distance, and routes to suit senior dogs or those with special requirements, and we can follow instructions such as medication timing or mobility-friendly paths.",
    },
    {
      question: "Do you pick up dogs from home?",
      answer:
      "Yes. We collect your dog directly from your home and return them safely after the walk — no extra coordination needed."
    },
    {
      question: "Will my dog walk with other dogs?",
      answer:
      "Walks are individual unless you request otherwise. If you'd like social walks, we can arrange safe pairing based on temperament and compatibility."
    },
    {
      question: "How do you ensure my dog is safe during walks?",
      answer:
      "We use secure leads, check equipment before every outing, and avoid unsafe routes. Your dog's safety guides every decision we make outdoors."
    },
    {
      question: "Do you send walk updates?",
      answer:
      "Yes. After each walk, you'll receive a quick update with highlights — such as distance, behaviour notes, and anything worth knowing from the outing."
    },
    {
      question: "Can I change or cancel a walk?",
      answer:
      "Of course. You can update or cancel walks with notice. Just reach out, and we'll adjust your schedule without hassle."
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Dog walking — frequently asked questions</h2>
          <p className="subheading">
            Everything you need to know about our walks — how we keep your dog happy, safe, and confidently exploring the world.
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

export default DailystrollsFaqSection;
