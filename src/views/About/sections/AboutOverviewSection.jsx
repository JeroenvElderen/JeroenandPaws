import React from "react";

const AboutOverviewSection = () => {
  return (
    <section className="about-wrapper">

      {/* WHY WORK WITH ME */}
      <section className="why-section section">
        <div className="why-text">
          <h1 className="heading_h1">Why work with me</h1>
          <h4 style={{ marginTop: "2rem" }} className="why-heading-h4">Expert trainning backed by real experience</h4>
          <p>
            Choosing me means trusting someone who understands dog behaviour and has the 
            education, experience, and passion to support every dog as an individual. 
            With a certified background in Animal Care and over 7 years of hands-on 
            experience — from working with police dogs, sled dogs, and guide dogs to 
            training family companions — I use balanced, ethical methods tailored to 
            your dog’s unique needs.
          </p>
          <h4 className="why-heading-h4">A calm, positive, and structured approach</h4>
          <p>
            I take time to understand each dog’s personality, energy level, and learning 
            style, so training becomes enjoyable rather than overwhelming. Whether we’re 
            improving obedience, building social skills, strengthening manners, or simply 
            going for a walk, your dog is guided with patience, clarity, and consistency.
          </p>
          <h4 className="why-heading-h4">Clear communication and peace of mind</h4>
          <p>
            You’ll receive updates, photos, and honest feedback, so you always know how your 
            dog is doing. With me, your dog isn’t just being cared for - they’re learning, 
            growing, and thriving in a safe, positive environment you can rely on.
          </p>
          <a href="/contact" className="button-primary">
            Book an Appointment
          </a>
        </div>

        <div className="why-image">
          <img
            src="/images/a58085e9-4555-461c-9f59-6029e44d0a55.avif"
            alt="Dog care"
          />
        </div>
      </section>

    </section>
  );
};

export default AboutOverviewSection;
