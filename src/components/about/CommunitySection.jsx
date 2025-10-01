const CommunitySection = () => (
  <section className="section padding-vertical_xxlarge">
    <div className="container">
      <div className="w-layout-grid grid_2-col tablet-1-col gap-xlarge align-start">
        <div className="flex_vertical gap-medium">
          <div className="eyebrow">Beyond the walk</div>
          <h2 className="heading_h2">A tight-knit community that lifts every tail</h2>
          <p className="paragraph_large text-color_secondary">
            I collaborate with local vets, groomers, and rescues to make sure each dog – and their human – has a reliable support
            system. Whether we’re hosting enrichment workshops or organizing pack hikes, there’s always room for one more friend.
          </p>
          <ul className="w-list-unstyled flex_vertical gap-small">
            <li className="chip is-outline">Monthly small-pack adventures</li>
            <li className="chip is-outline">Emergency care network on standby</li>
            <li className="chip is-outline">Photo journals delivered after every outing</li>
          </ul>
          <div className="card is-contrast">
            <div className="card_body flex_vertical gap-small">
              <p className="paragraph_small text-color_secondary margin-bottom_none">
                “We trust Jeroen completely. Our anxious rescue has blossomed thanks to his calm energy and thoughtful updates.”
              </p>
              <span className="eyebrow text-color_secondary">— Anouk &amp; Guusje</span>
            </div>
          </div>
          <div className="button-group">
            <a href="mailto:hello@jeroenandpaws.com" className="button w-button">
              Join an upcoming event
            </a>
            <a href="#" className="text-link">See the latest adventures</a>
          </div>
        </div>
        <div className="w-layout-grid grid_2-col gap-small">
          <div className="image-ratio_3x4 radius_medium overflow_hidden">
            <img
              src="images/9b7ac11e-53d5-4d93-9ff7-79cdbf01d1dd.avif"
              alt="Jeroen leading a pack of dogs along the dunes"
              className="image_cover"
              loading="lazy"
            />
          </div>
          <div className="image-ratio_square radius_medium overflow_hidden">
            <img
              src="images/3c8268d5-15f7-44d5-9d50-c9fb797642e6.avif"
              alt="Happy dog rolling in the grass"
              className="image_cover"
              loading="lazy"
            />
          </div>
          <div className="image-ratio_square radius_medium overflow_hidden">
            <img
              src="images/4fdf021f-d9d0-4f0d-93f5-0fa5a94d531c.avif"
              alt="Group of pet parents smiling at a community event"
              className="image_cover"
              loading="lazy"
            />
          </div>
          <div className="card is-contrast">
            <div className="card_body flex_vertical gap-small">
              <div className="eyebrow text-color_secondary">Let’s chat</div>
              <p className="paragraph_small text-color_secondary margin-bottom_none">
                Curious if your pup would be a good fit? Send me a note and I’ll recommend the right adventure for their temperam
                ent.
              </p>
              <a href="mailto:hello@jeroenandpaws.com" className="text-link">
                hello@jeroenandpaws.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CommunitySection;