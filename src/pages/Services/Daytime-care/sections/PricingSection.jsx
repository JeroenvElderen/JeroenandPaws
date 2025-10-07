import React, { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";

const PricingSection = () => {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi({ namespace: "daytimecare" });
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
          <h1 className="heading_h1">Daytime Care Plans for Happy Dogs</h1>
        </div>

        <ul className="grid_3-col gap-xsmall text-align_center w-list-unstyled">
          {/* === Half-Day Hangout === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Half-Day Hangout</h4>
                <div className="eyebrow">Up to 4 Hours</div>
                <p className="heading_h3">€20/day</p>
                <p>
                  Perfect for pups who just need a short stay — playtime,
                  potty breaks, and some snuggles before heading home.
                </p>
              </div>
              <div className="button-group is-align-center">
                <button
                  type="button"
                  className="button w-button"
                  data-cal-namespace="daytimecare"
                  data-cal-link="jeroenandpaws/half-day"
                  data-cal-config='{"layout":"month_view"}'
                >
                  Book Half-Day
                </button>
              </div>
            </div>
          </li>

          {/* === Full-Day of Fun === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Full-Day of Fun</h4>
                <div className="eyebrow">Up to 8 Hours</div>
                <p className="heading_h3">€30/day</p>
                <p>
                  A whole day of play, rest, and love — ideal for keeping your
                  dog happy and cared for while you’re at work or busy.
                </p>
              </div>
              <div className="button-group is-align-center">
                <button
                  type="button"
                  className="button w-button"
                  data-cal-namespace="daytimecare"
                  data-cal-link="jeroenandpaws/full-day"
                  data-cal-config='{"layout":"month_view"}'
                >
                  Book Full-Day
                </button>
              </div>
            </div>
          </li>

          {/* === Custom Care === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Custom Care</h4>
                <div className="eyebrow">Flexible Options</div>
                <p className="heading_h3">Tailored</p>
                <p>
                  Need special timing, a late pickup, or extra activities?
                  Let’s design a schedule that works best for your pup.
                </p>
              </div>
              <div className="button-group is-align-center">
                <button
                  type="button"
                  className="button w-button"
                  data-cal-namespace="daytimecare"
                  data-cal-link="jeroenandpaws/custom-daycare"
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

export default PricingSection;
