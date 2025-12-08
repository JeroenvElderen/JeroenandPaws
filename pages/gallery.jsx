import React, { useMemo, useState } from 'react';

const galleryItems = [
  {
    src: '/images/IMG_4278.jpg',
    title: 'Golden Hour Forest Walk',
    location: 'Wooded Trails',
    vibe: 'Adventure',
  },
  {
    src: '/images/Bonnie.jpeg',
    title: 'Bonnie enjoying the breeze',
    location: 'City Terraces',
    vibe: 'Portrait',
  },
  {
    src: '/images/Jeroen.jpg',
    title: 'In stride together',
    location: 'Urban Greens',
    vibe: 'Lifestyle',
  },
  {
    src: '/images/31E259FF-C47C-4D99-AAC3-C9D0C3104F2B_1_201_a.jpeg',
    title: 'Playtime pause',
    location: 'Open Fields',
    vibe: 'Joyful',
  },
  {
    src: '/images/2269ca18-ac55-435f-bc79-d145bb23389b.avif',
    title: 'Ready for the next cue',
    location: 'Training Grounds',
    vibe: 'Training',
  },
  {
    src: '/images/7d9a4059-048c-4ce2-8876-b35ec4360f6c.avif',
    title: 'Eyes on the horizon',
    location: 'Coastal Dunes',
    vibe: 'Cinematic',
  },
  {
    src: '/images/6112f29d-dcad-4748-87cd-799ae8f92763.avif',
    title: 'Curious explorer',
    location: 'Garden Corners',
    vibe: 'Curiosity',
  },
  {
    src: '/images/2b4b2268-f18e-44ab-8f19-3bc2105dc1f8.avif',
    title: 'Sun-warmed smiles',
    location: 'Home Base',
    vibe: 'Comfort',
  },
];

const Gallery = () => {
  const [activeItem, setActiveItem] = useState(null);

  const bodyCopy = useMemo(
    () =>
      `Showcase your adventures with a gallery that feels premium, immersive, and on-brand. Every image opens in a luxe lightbox so you can linger on the details and share stories effortlessly.`,
    [],
  );

  return (
    <main className="gallery-page">
      <div className="gallery-hero">
        <h1 className="gallery-title">Jeroen &amp; Paws LightGallery</h1>
        <p className="gallery-lead">{bodyCopy}</p>
        <a
          className="hero-button"
          href="https://github.com/sachinchoolur/lightGallery"
          target="_blank"
          rel="noreferrer"
        >
          View lightGallery inspiration
        </a>
      </div>

      <div className="gallery-shell">
        <div className="gallery-container" aria-label="Photo gallery">
          {galleryItems.map((item) => (
            <button
              key={item.src}
              type="button"
              className="gallery-item"
              onClick={() => setActiveItem(item)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActiveItem(item);
                }
              }}
            >
              <img src={item.src} alt={item.title} loading="lazy" />
              <div className="gallery-item__meta">
                <p className="gallery-item__title">{item.title}</p>
                <p className="gallery-item__location">{item.location}</p>
                <span className="gallery-item__tag">{item.vibe}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeItem && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={activeItem.title}>
          <div className="lightbox__backdrop" onClick={() => setActiveItem(null)} />
          <div className="lightbox__content" role="document">
            <button className="lightbox__close" type="button" onClick={() => setActiveItem(null)}>
              ✕
            </button>
            <img src={activeItem.src} alt={activeItem.title} className="lightbox__image" />
            <div className="lightbox__meta">
              <h3>{activeItem.title}</h3>
              <p>{activeItem.location}</p>
              <span className="gallery-item__tag">{activeItem.vibe}</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .gallery-page {
          min-height: 100vh;
          padding: 40px 16px 64px;
          background: linear-gradient(180deg, #e8f0ff 0%, #ffffff 52%), #0e3481;
          color: #0e3481;
          display: grid;
          gap: 32px;
        }

        .gallery-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          max-width: 960px;
          margin: 0 auto;
        }

        .gallery-title {
          margin: 0;
          font-size: clamp(2.2rem, 4vw, 3rem);
          font-weight: 800;
          color: #0e3481;
        }

        .gallery-lead {
          margin: 0;
          max-width: 720px;
          line-height: 1.6;
          color: #1b3c8e;
        }

        .hero-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 999px;
          border: 1px solid #0e3481;
          color: #0e3481;
          background: rgba(14, 52, 129, 0.05);
          font-weight: 700;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 20px 50px rgba(14, 52, 129, 0.12);
        }

        .hero-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 26px 60px rgba(14, 52, 129, 0.16);
        }

        .gallery-shell {
          max-width: 1100px;
          width: 100%;
          margin: 0 auto;
          padding: 16px;
          background: rgba(255, 255, 255, 0.76);
          border-radius: 28px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(14, 52, 129, 0.08);
        }

        .gallery-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
          justify-items: center;
        }

        .gallery-item {
          position: relative;
          width: 100%;
          max-width: 220px;
          border: 1px solid rgba(14, 52, 129, 0.12);
          border-radius: 16px;
          overflow: hidden;
          background: #f4f6ff;
          padding: 6px;
          display: grid;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 16px 38px rgba(14, 52, 129, 0.12);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .gallery-item:focus-visible {
          outline: 2px solid #0e3481;
          outline-offset: 4px;
        }

        .gallery-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 50px rgba(14, 52, 129, 0.18);
        }

        .gallery-item img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 12px;
        }

        .gallery-item__meta {
          display: grid;
          gap: 4px;
          text-align: left;
        }

        .gallery-item__title {
          margin: 0;
          font-weight: 800;
          color: #0e3481;
        }

        .gallery-item__location {
          margin: 0;
          color: #3b4b7a;
          font-size: 0.95rem;
        }

        .gallery-item__tag {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(14, 52, 129, 0.1);
          color: #0e3481;
          font-weight: 700;
          border: 1px solid rgba(14, 52, 129, 0.14);
        }

        .lightbox {
          position: fixed;
          inset: 0;
          display: grid;
          place-items: center;
          z-index: 1000;
        }

        .lightbox__backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
        }

        .lightbox__content {
          position: relative;
          background: #ffffff;
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.28);
          max-width: min(960px, 90vw);
          width: 100%;
        }

        .lightbox__image {
          width: 100%;
          max-height: 70vh;
          object-fit: contain;
          border-radius: 16px;
        }

        .lightbox__meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 12px;
          color: #0e3481;
        }

        .lightbox__meta h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 800;
        }

        .lightbox__meta p {
          margin: 0;
          color: #3b4b7a;
        }

        .lightbox__close {
          position: absolute;
          top: 12px;
          right: 12px;
          border: none;
          background: rgba(14, 52, 129, 0.08);
          color: #0e3481;
          font-size: 1.1rem;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          cursor: pointer;
        }

        @media (max-width: 640px) {
          .gallery-shell {
            padding: 12px;
          }

          .gallery-item img {
            height: 150px;
          }
        }
      `}</style>
    </main>
  );
};

export default Gallery;