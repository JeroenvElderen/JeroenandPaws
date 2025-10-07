import React, { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";

const PricingSection = () => {
  // Initialize Cal.com's popup UI once
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
          <h1 className="heading_h1">Walking Plans for Every Pup</h1>
        </div>

        <ul className="grid_4-col gap-xsmall text-align_center w-list-unstyled">
          {/* === Quick Sniff & Stroll === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Quick Sniff & Stroll</h4>
                <div className="eyebrow">30-Min Walks</div>
                <p className="heading_h3">€7/walk</p>
                <p>Perfect for potty breaks, puppy zoomies, or a little leg stretch between naps.</p>
              </div>
              <div className="button-group is-align-center">
                <button
                  type="button"
                  className="button w-button"
                  data-cal-namespace="dailystrolls"
                  data-cal-link="jeroenandpaws/quick-sniff-stroll"  // ← your Cal.com event slug
                  data-cal-config='{"layout":"month_view"}'
                >
                  Quick Sniff Now
                </button>
              </div>
            </div>
          </li>

          {/* === Daily Doggie Adventure === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Daily Doggie Adventure</h4>
                <div className="eyebrow">60-Min Walks</div>
                <p className="heading_h3">€12/walk</p>
                <p>An hour of tail wags, sniffing every tree, and coming home happily tired.</p>
              </div>
              <div className="button-group is-align-center">
                <button
                  type="button"
                  className="button w-button"
                  data-cal-namespace="dailystrolls"
                  data-cal-link="jeroenandpaws/daily-doggie-adventure"
                  data-cal-config='{"layout":"month_view"}'
                >
                  Walk This Way
                </button>
              </div>
            </div>
          </li>

          {/* === Mega Adventure Walk === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Mega Adventure Walk</h4>
                <div className="eyebrow">120-min walks</div>
                <p className="heading_h3">€22/walk</p>
                <p>Double the time, double the fun — great for big explorers or extra energy days.</p>
              </div>
              <div className="button-group is-align-center">
                <button
                  type="button"
                  className="button w-button"
                  data-cal-namespace="dailystrolls"
                  data-cal-link="jeroenandpaws/mega-adventure-walk"
                  data-cal-config='{"layout":"month_view"}'
                >
                  Big Adventure Awaits
                </button>
              </div>
            </div>
          </li>

          {/* === Your Walk, Your Way === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Your Walk, Your Way</h4>
                <div className="eyebrow">Custom walk</div>
                <p className="heading_h3">Tailored</p>
                <p>Need a special route or timing? Let’s make it paw-fect for your pup.</p>
              </div>
              <div className="button-group is-align-center">
                <button
                  type="button"
                  className="button w-button"
                  data-cal-namespace="dailystrolls"
                  data-cal-link="yourname/custom-walk"
                  data-cal-config='{"layout":"month_view"}'
                >
                  Let's Plan Together
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
