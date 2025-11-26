import React from "react";
import Link from "next/link";

const FaqContactSection = () => (
  <section className="section">
    <div className="container">
      <div className="w-layout-grid grid_3-col tablet-1-col gap-small">
        <h2
          id="w-node-ef1a1ac3-2775-0c24-b701-9034ee5207a3-ee5207a0"
          className="heading_huge margin-bottom_none w-node-_8aa97011-c8af-3148-cf29-a44abcba7af6-d19277d5"
        >
          Guidance and support for every dog owner
        </h2>
        <div
          id="w-node-ef1a1ac3-2775-0c24-b701-9034ee5207a5-ee5207a0"
          className="w-node-_8aa97011-c8af-3148-cf29-a44abcba7aff-d19277d5"
        >
          <p className="subheading">
            Have questions? We’re here to help — explore clear, friendly answers about training, walks, boarding, and everything in between.
          </p>
          <Link href="/contact" className="button w-button">
            Get in touch
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default FaqContactSection;
