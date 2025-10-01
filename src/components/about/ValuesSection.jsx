const ValuesSection = () => (
  <section className="section padding-vertical_xxlarge bg-accent-light">
    <div className="container">
      <div className="header max-width_large">
        <div className="eyebrow">Guiding principles</div>
        <h2 className="heading_h2">The values that shape every walk, stay, and training plan</h2>
        <p className="paragraph_large text-color_secondary">
          Dogs thrive when they feel understood. I focus on meeting their emotional needs first, then layering on structure,
          enrichment, and positive reinforcement so their confidence shines through.
        </p>
      </div>
      <div className="w-layout-grid grid_3-col tablet-1-col gap-large align-start">
        <div className="card is-contrast">
          <div className="card_body flex_vertical gap-small">
            <div className="icon is-large on-accent-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16 2 5 7v6c0 7.72 4.92 14.43 11 16 6.08-1.57 11-8.28 11-16V7Zm6.62 11c-.43 5.15-3.57 10.41-6.62 11.92-3.05-1.51-6.19-6.77-6.62-11.92V9l6.62-3 6.62 3Z" />
                <path d="M16 22a4 4 0 1 0-4-4 4 4 0 0 0 4 4" />
              </svg>
            </div>
            <h3 className="heading_h4">Safety without shortcuts</h3>
            <p className="paragraph_small text-color_secondary margin-bottom_none">
              From secure transport to emergency protocols, every outing is planned so you can relax and your dog can explore.
            </p>
          </div>
        </div>
        <div className="card is-contrast">
          <div className="card_body flex_vertical gap-small">
            <div className="icon is-large on-accent-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
                <path d="m16 4 1.73 1.86 2.42-.65.86 2.34 2.34.86-.65 2.42L24 12l-1.3 1.88.65 2.42-2.34.86-.86 2.34-2.42-.65L16 21l-1.73-1.13-2.42.65-.86-2.34-2.34-.86.65-2.42L8 12l1.3-1.88-.65-2.42 2.34-.86.86-2.34 2.42.65Z" />
                <path d="M14 18h4v10h-4z" />
              </svg>
            </div>
            <h3 className="heading_h4">Training through play</h3>
            <p className="paragraph_small text-color_secondary margin-bottom_none">
              Reward-based methods and enrichment games keep learning joyful while strengthening the bond you share at home.
            </p>
          </div>
        </div>
        <div className="card is-contrast">
          <div className="card_body flex_vertical gap-small">
            <div className="icon is-large on-accent-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
                <path d="M28 6h-6V4a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v4h28V8a2 2 0 0 0-2-2m-12 0h-4V4h4Z" />
                <path d="M2 24a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4V14H2Z" />
              </svg>
            </div>
            <h3 className="heading_h4">Radical transparency</h3>
            <p className="paragraph_small text-color_secondary margin-bottom_none">
              You receive notes, photos, and route tracking after every visit so you’re always part of the adventure.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ValuesSection;