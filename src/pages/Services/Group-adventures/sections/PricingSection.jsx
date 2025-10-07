import React, { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";

const PricingSection = () => {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "dailystrolls" });
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
          <h1 className="heading_h1">Group Adventure Plans</h1>
          <p className="subheading">
            Social, safe, and fun adventures with other friendly pups — perfect
            for exercise, play, and new friendships.
          </p>
        </div>

        <ul className="grid_4-col gap-xsmall text-align_center w-list-unstyled">
          {/* === 2-Hour Group Adventure === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>2-Hour Adventure</h4>
                <div className="eyebrow">Group Walk</div>
                <p className="heading_h3">€22</p>
                <p>Extended group outing with play, sniffing, and exploration for active dogs.</p>
              </div>
              <div className="button-group is-align-center">
                <button
                  type="button"
                  className="button w-button"
                  data-cal-namespace="dailystrolls"
                  data-cal-link="jeroenandpaws/2h-group-adventure"
                >
                  Book 2-Hour Adventure
                </button>
              </div>
            </div>
          </li>

          {/* === Half Day Group Adventure === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Half-Day Adventure</h4>
                <div className="eyebrow">3–4 Hours</div>
                <p className="heading_h3">€35</p>
                <p>More time for social play, walks, and rest with new furry friends.</p>
              </div>
              <div className="button-group is-align-center">
                <button
                  type="button"
                  className="button w-button"
                  data-cal-namespace="dailystrolls"
                  data-cal-link="jeroenandpaws/half-day-group"
                >
                  Join Half-Day Adventure
                </button>
              </div>
            </div>
          </li>

          {/* === Full Day Group Adventure === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Full-Day Adventure</h4>
                <div className="eyebrow">6–8 Hours</div>
                <p className="heading_h3">€55</p>
                <p>All-day group fun: multiple walks, play sessions, and supervised downtime.</p>
              </div>
              <div className="button-group is-align-center">
                <button
                  type="button"
                  className="button w-button"
                  data-cal-namespace="dailystrolls"
                  data-cal-link="jeroenandpaws/full-day-group"
                >
                  Book Full-Day Adventure
                </button>
              </div>
            </div>
          </li>

          {/* === Custom Group Adventure === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Custom Adventure</h4>
                <div className="eyebrow">Tailored Group Time</div>
                <p className="heading_h3">Custom</p>
                <p>Want something special? We’ll create a custom group adventure for your pup’s needs.</p>
              </div>
              <div className="button-group is-align-center">
                <button
                  type="button"
                  className="button w-button"
                  data-cal-namespace="dailystrolls"
                  data-cal-link="jeroenandpaws/custom-adventure"
                >
                  Plan Custom Adventure
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>

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

export default PricingSection;
