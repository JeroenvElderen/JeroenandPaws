import React from "react";
import { Link } from "react-router-dom";

const PricingSection = () => {

  return (
    <section className="section is-secondary">
      <div className="container">
        <div className="header is-align-center">
          <h1 className="heading_h1">Home Check-In Options</h1>
        </div>

        <ul className="grid_3-col gap-xsmall text-align_center w-list-unstyled">
          {/* === Standard Check-In (30 min) === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Standard Check-In</h4>
                <div className="eyebrow">30-Min Visit</div>
                <p className="heading_h3">€15/visit</p>
                <p>
                  A quick but caring visit to check on your dog — fresh water,
                  feeding if needed, potty break, playtime, and a little love.
                  Includes an update and a sweet photo for peace of mind.
                </p>
              </div>
              <div className="button-group is-align-center">
                <Link className="button w-button" to="/booking/home-check-in-30">
                  Book Check-In
                </Link>
              </div>
            </div>
          </li>

          {/* === Extended Check-In (60 min) === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Extended Check-In</h4>
                <div className="eyebrow">60-Min Visit</div>
                <p className="heading_h3">€25/visit</p>
                <p>
                  More time for attention and play — ideal if your dog needs
                  extra exercise, a longer walk, or a bit more companionship
                  while you’re away.
                </p>
              </div>
              <div className="button-group is-align-center">
                <Link className="button w-button" to="/booking/home-check-in-60">
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
                <div className="eyebrow">Flexible Timing</div>
                <p className="heading_h3">Tailored</p>
                <p>
                  Need something special — multiple visits, medication, or
                  unique timing? We can create the perfect plan for your dog
                  and your schedule.
                </p>
              </div>
              <div className="button-group is-align-center">
                <Link className="button w-button" to="/booking/home-check-in-custom">
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

export default PricingSection;
