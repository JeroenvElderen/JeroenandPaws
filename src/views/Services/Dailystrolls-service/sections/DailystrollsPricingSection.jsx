import React from "react";
import Link from "next/link";

const HomeCheckinsPricingSection = () => {

  return (
    <section className="section is-secondary">
      <div className="container">
        <div className="header is-align-center">
          <h1 className="heading_h1">Home Check-In Options</h1>
        </div>

        <ul className="grid_3-col gap-xsmall text-align_center w-list-unstyled">
          {/* === Standard Check-In === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Standard Check-In</h4>
                <div className="eyebrow">30-Min Visit</div>
                <p className="heading_h3">€15/visit</p>
                <p>Fresh water, feeding, potty break, playtime — everything your dog needs while you’re away.</p>
              </div>
              <div className="button-group is-align-center">
                <Link
                  className="button w-button"
                  href="/booking/daily-stroll-30"
                >
                  Book Check-In
                </Link>
              </div>
            </div>
          </li>

          {/* === Extended Check-In === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Extended Check-In</h4>
                <div className="eyebrow">60-Min Visit</div>
                <p className="heading_h3">€25/visit</p>
                <p>Extra time for play, longer potty breaks, or more companionship — perfect for pups who need more love.</p>
              </div>
              <div className="button-group is-align-center">
                <Link
                  className="button w-button"
                  href="/booking/daily-stroll-60"
                >
                  Book Extended Visit
                </Link>
              </div>
            </div>
          </li>

          {/* === Custom Care === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Custom Care</h4>
                <div className="eyebrow">Flexible Visit</div>
                <p className="heading_h3">Tailored</p>
                <p>Need special timing or extra help? Let’s create the perfect plan for your dog’s day.</p>
              </div>
              <div className="button-group is-align-center">
                <Link
                  className="button w-button"
                  href="/booking/daily-stroll-custom"
                >
                  Plan Together
                </Link>
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

export default HomeCheckinsPricingSection;
