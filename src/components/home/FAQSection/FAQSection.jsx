import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

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

        const source = Array.isArray(data) && data.length > 0 ? data : FALLBACK_FAQS;

        setFaqs(source);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Failed to load FAQs from Supabase:", err);
        setError(err);
        setFaqs(FALLBACK_FAQS);
      } finally {
        setIsLoading(false);
      }
    };

    loadFaqs();

    return () => {
      abortController.abort();
    };
  }, []);

  const activeFaq = useMemo(() => {
    if (!openFaq && faqs.length > 0) {
      return faqs[0].id;
    }
    return openFaq;
  }, [faqs, openFaq]);

  if (isLoading && faqs.length === 0) {
    return <div className="section">Loading frequently asked questions...</div>;
  }

  if (error && faqs.length === 0) {
    return (
      <div className="section" style={{ color: "red" }}>
        Failed to load FAQs. Please try again later.
      </div>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className="header is-align-center heading-responsive_wrapper">
          <div className="eyebrow">Questions</div>
          <h2 className="heading_h2">Find the answers you need</h2>
          <p className="paragraph_large">
            Explore the details about our services, care routines, and what makes Jeroen &amp; Paws the best choice for your dog.
          </p>
        </div>
        <div className="w-layout-grid grid_2-col tablet-1-col gap-large">
          <div className="card on-neutral">
            <div className="card_body">
              <div className="w-layout-grid grid_1-col gap-small">
                {faqs.map((faq) => {
                  const isOpen = activeFaq === faq.id;
                  return (
                    <div key={faq.id} className={`faq_item ${isOpen ? "is-open" : ""}`}>
                      <button
                        type="button"
                        className="faq_button"
                        onClick={() => setOpenFaq((prev) => (prev === faq.id ? null : faq.id))}
                      >
                        <div className="heading_h5 margin-bottom_none">{faq.question}</div>
                        <div className="icon is-small on-neutral">
                          <svg width="100%" height="100%" viewBox="0 0 16 16">
                            <path
                              d="M8,1.333A6.667,6.667,0,1,0,14.667,8,6.675,6.675,0,0,0,8,1.333Zm0,12A5.333,5.333,0,1,1,13.333,8,5.339,5.339,0,0,1,8,13.333Z"
                              fill="currentColor"
                            ></path>
                            <path d="M10,7.333H8.667V6H7.333V7.333H6V8.667H7.333V10H8.667V8.667H10Z" fill="currentColor"></path>
                          </svg>
                        </div>
                      </button>
                      <div className="faq_content" style={{ display: isOpen ? "block" : "none" }}>
                        <p className="paragraph_small" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="card on-accent-primary text-color_inverse">
            <div className="card_body">
              <div className="w-layout-grid grid_1-col gap-small">
                <h3 className="heading_h3 margin-bottom_none">Need more information?</h3>
                <p className="paragraph_large text-color_inverse-secondary">
                  We're here to make sure your dog gets the best care possible. Reach out and we'll tailor a plan to your needs.
                </p>
                <div className="button-group">
                  <a href="#contact" className="button on-inverse w-button">
                    Contact us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
