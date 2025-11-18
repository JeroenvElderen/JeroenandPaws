import React from "react";
import Link from "next/link";

const PricingSection = () => {

  return (
    <section className="section is-secondary">
      <div className="container">
        <div className="header is-align-center">
          <h1 className="heading_h1">Boarding Rates</h1>
        </div>

        <ul className="grid_4-col gap-xsmall text-align_center w-list-unstyled">
          {/* === Cozy Overnight Stay === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Cozy Overnight Stay</h4>
                <div className="eyebrow">Boarding — 24 hrs</div>
                <p className="heading_h3">€45/night</p>
                <p>
                  Safe and loving overnight care in my home — daily walks, playtime,
                  and cozy rest alongside my two friendly pups.
                </p>
              </div>
              <div className="button-group is-align-center">
                <Link className="button w-button" href="/booking/overnight-stay">
                  Book Boarding
                </Link>
              </div>
            </div>
          </li>

          {/* === Custom Stay Option === */}
          <li className="card on-secondary">
            <div className="card_body is-small">
              <div className="margin_bottom-auto">
                <h4>Your Dog’s Perfect Stay</h4>
                <div className="eyebrow">Custom duration</div>
                <p className="heading_h3">Tailored</p>
                <p>
                  Need extra nights or special care? We’ll create a plan that fits your
                  schedule and your dog’s needs.
                </p>
              </div>
              <div className="button-group is-align-center">
                <Link className="button w-button" href="/booking/overnight-boarding">
                  Plan Your Stay
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
