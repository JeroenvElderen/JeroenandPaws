import React, { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";

const SoloJourneyPricingSection = () => {
  // Initialize Cal.com's popup UI once
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "solojourney" });
      cal("ui", {
        theme: "light",
        styles: { branding: { brandColor: "#5a3ec8" } },
        layout: "month_view",
        hideEventTypeDetails: false,
      });
    })();
  }, []);

  return (
    <section className="section is-secondary">
      <div className="container">
        <div className="header is-align-center">
          <h1 className="heading_h1">Solo Journey Options</h1>
        </div>

        <ul className="grid_3-col gap-xsmall text-align_center w-list-unstyled">
          {/* === Half-Day Explorer === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Half-Day Explorer</h4>
                <div className="eyebrow">3-Hour Journey</div>
                <p className="heading_h3">€60/journey</p>
                <p>A private half-day adventure — long walks, sniffing trails, playtime, and plenty of breaks just for your pup.</p>
              </div>
              <div className="button-group is-align-center">
                <button
                  type="button"
                  className="button w-button"
                  data-cal-namespace="solojourney"
                  data-cal-link="jeroenandpaws/half-day-explorer"
                  data-cal-config='{"layout":"month_view"}'
                >
                  Book Half-Day
                </button>
              </div>
            </div>
          </li>

          {/* === Full-Day Adventure === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Full-Day Adventure</h4>
                <div className="eyebrow">6-Hour Journey</div>
                <p className="heading_h3">€110/journey</p>
                <p>A full day of exploring together — long walks, rest stops, and plenty of one-on-one attention for your dog’s perfect day out.</p>
              </div>
              <div className="button-group is-align-center">
                <button
                  type="button"
                  className="button w-button"
                  data-cal-namespace="solojourney"
                  data-cal-link="jeroenandpaws/full-day-adventure"
                  data-cal-config='{"layout":"month_view"}'
                >
                  Book Full-Day
                </button>
              </div>
            </div>
          </li>

          {/* === Custom Journey === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Custom Journey</h4>
                <div className="eyebrow">Flexible Hours</div>
                <p className="heading_h3">Tailored</p>
                <p>Have something special in mind? Let’s design the perfect solo day — custom timing, routes, and pace for your pup.</p>
              </div>
              <div className="button-group is-align-center">
                <button
                  type="button"
                  className="button w-button"
                  data-cal-namespace="solojourney"
                  data-cal-link="jeroenandpaws/custom-journey"
                  data-cal-config='{"layout":"month_view"}'
                >
                  Plan Together
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>

      {/* ✅ Hover effect styles */}
      <style jsx>{`
        .card.on-secondary {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .card.on-secondary:hover {
          transform: translateY(-6px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
        }
        .button.w-button {
          transition: background-color 0.25s ease, color 0.25s ease;
        }
        .button.w-button:hover {
          background-color: #5a3ec8;
          color: #fff;
        }
      `}</style>
    </section>
  );
};

export default SoloJourneyPricingSection;
