import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const FALLBACK_FAQS = [
  {
    id: "services",
    question: "What services do you offer for dogs?",
    answer:
      "We provide <strong>training, walking, boarding, and day care</strong> — all tailored to meet the unique needs of each dog, ensuring they get the best care possible.",
  },
  {
    id: "experience",
    question: "How experienced are you with dog care?",
    answer:
      "I have <strong>7+ years of experience</strong> and a certification in Animal Care, working with <strong>police, sled, and guide dogs</strong>.",
  },
  {
    id: "unique",
    question: "What makes your services unique?",
    answer:
      "I offer a <strong>compassionate, personalized approach</strong> — every dog is treated like family, ensuring they feel happy and secure.",
  },
  {
    id: "special-needs",
    question: "Can you accommodate special needs?",
    answer:
      "Absolutely — whether it's <strong>training</strong> or <strong>day care</strong>, I adapt my methods to fit each dog's individual needs and ensure a safe, loving environment.",
  },
];

const FAQSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    const loadFaqs = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from("faqs")
          .select("*")
          .order("display_order", { ascending: true });

        if (supabaseError) throw supabaseError;
        setFaqs(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Failed to load FAQs from Supabase:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFaqs();

    return () => abortController.abort();
  }, []);

  const faqsToRender = useMemo(() => {
    return faqs.length > 0 ? faqs : FALLBACK_FAQS;
  }, [faqs]);

  return (
    <section data-copilot="true" className="section">
      <div className="container is-small">
        <div className="header is-align-center">
          <h2>Welcome to your dog&apos;s second home</h2>
          <p className="subheading">
            Discover our personalized care and training services for your furry
            friend.
          </p>
          {error && (
            <p className="paragraph_small margin-bottom_none" role="status">
              We&apos;ll share new answers as soon as they&apos;re ready. Here
              are a few of our most common questions in the meantime.
            </p>
          )}
        </div>

        <div className="flex_vertical">
          {isLoading ? (
            <div className="accordion is-transparent w-dropdown">
              <div className="accordion_toggle-transparent w-dropdown-toggle">
                <div className="accordion_icon w-icon-dropdown-toggle" />
                <h3 className="paragraph_large margin-bottom_none">
                  Loading questions...
                </h3>
              </div>
              <div className="accordion_content w-dropdown-list">
                <div className="padding_xsmall padding-horizontal_none">
                  <div className="rich-text w-richtext">
                    <p>Please hang tight while we fetch the latest information.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            faqsToRender.map((faq, idx) => (
              <div
                key={faq.id ?? faq.question}
                className={`accordion is-transparent w-dropdown ${
                  openFaq === idx ? "w--open" : ""
                }`}
              >
                <div
                  className="accordion_toggle-transparent w-dropdown-toggle"
                  onClick={() =>
                    setOpenFaq(openFaq === idx ? null : idx)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div className="accordion_icon w-icon-dropdown-toggle" />
                  <h3 className="paragraph_large margin-bottom_none">
                    {faq.question}
                  </h3>
                </div>

                <div
                  className="accordion_content w-dropdown-list"
                  style={{
                    display: openFaq === idx ? "block" : "none",
                  }}
                >
                  <div className="padding_xsmall padding-horizontal_none">
                    <div
                      className="rich-text w-richtext"
                      dangerouslySetInnerHTML={{ __html: faq.answer || "" }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
