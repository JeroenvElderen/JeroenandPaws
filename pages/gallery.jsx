"use client";

import "react-photo-album/styles.css";
import React, { useMemo, useState } from "react";
import PhotoAlbum from "react-photo-album";
import InfiniteScroll from "react-infinite-scroll-component";
import Image from "next/image";

const SOURCE_PHOTOS = [
  {
    src: "/images/IMG_4278.jpg",
    width: 1600,
    height: 1067,
    title: "Golden Hour Forest Walk",
    location: "Wooded Trails",
    vibe: "Adventure",
  },
  {
    src: "/images/Bonnie.jpeg",
    width: 1400,
    height: 1750,
    title: "Bonnie enjoying the breeze",
    location: "City Terraces",
    vibe: "Portrait",
  },
  {
    src: "/images/Jeroen.jpg",
    width: 1500,
    height: 1700,
    title: "In stride together",
    location: "Urban Greens",
    vibe: "Lifestyle",
  },
  {
    src: "/images/31E259FF-C47C-4D99-AAC3-C9D0C3104F2B_1_201_a.jpeg",
    width: 1600,
    height: 1600,
    title: "Playtime pause",
    location: "Open Fields",
    vibe: "Joyful",
  },
  {
    src: "/images/2269ca18-ac55-435f-bc79-d145bb23389b.avif",
    width: 1600,
    height: 1067,
    title: "Ready for the next cue",
    location: "Training Grounds",
    vibe: "Training",
  },
  {
    src: "/images/7d9a4059-048c-4ce2-8876-b35ec4360f6c.avif",
    width: 1600,
    height: 1100,
    title: "Eyes on the horizon",
    location: "Coastal Dunes",
    vibe: "Cinematic",
  },
  {
    src: "/images/6112f29d-dcad-4748-87cd-799ae8f92763.avif",
    width: 1600,
    height: 1000,
    title: "Curious explorer",
    location: "Garden Corners",
    vibe: "Curiosity",
  },
  {
    src: "/images/2b4b2268-f18e-44ab-8f19-3bc2105dc1f8.avif",
    width: 1600,
    height: 1200,
    title: "Sun-warmed smiles",
    location: "Home Base",
    vibe: "Comfort",
  },
  {
    src: "/images/IMG_4278.jpg",
    width: 1600,
    height: 1067,
    title: "Summit lookout",
    location: "High Ridge",
    vibe: "Trail",
  },
  {
    src: "/images/7d9a4059-048c-4ce2-8876-b35ec4360f6c.avif",
    width: 1600,
    height: 1100,
    title: "River break",
    location: "Cedar Crossing",
    vibe: "Calm",
  },
  {
    src: "/images/Bonnie.jpeg",
    width: 1400,
    height: 1750,
    title: "Resting on the ridge",
    location: "Windy Pass",
    vibe: "Portrait",
  },
];

const PAGE_SIZE = 6;

export default function Gallery() {
  const initial = useMemo(() => SOURCE_PHOTOS.slice(0, PAGE_SIZE), []);
  const [photos, setPhotos] = useState(initial);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMore = async () => {
    await new Promise((resolve) => setTimeout(resolve, 450));

    const start = page * PAGE_SIZE;
    const batch = SOURCE_PHOTOS.slice(start, start + PAGE_SIZE);

    if (!batch.length) {
      setHasMore(false);
      return;
    }

    setPhotos((prev) => [...prev, ...batch]);
    setPage((p) => p + 1);
  };

  return (
    <main className="gallery">
      <header className="gallery__hero">
        <p className="gallery__eyebrow">Infinite Scroll · react-photo-album</p>
        <h1 className="gallery__title">Jeroen &amp; Paws</h1>
        <p className="gallery__lead">
          Scroll through a masonry layout that keeps fetching more adventures as
          you go.
        </p>
      </header>

      <section className="gallery__shell" aria-label="Infinite photo gallery">
        <InfiniteScroll
          dataLength={photos.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={
            <div className="gallery__status">Loading more adventures…</div>
          }
          endMessage={
            <div className="gallery__status">You reached the end ✨</div>
          }
        >
          <PhotoAlbum
            photos={photos}
            layout="masonry"
            targetRowHeight={310}
            spacing={12}
            renderPhoto={({
              photo,
              imageProps: { alt, sizes, ...imageProps },
              wrapperStyle,
            }) => (
              <figure style={wrapperStyle} className="gallery__card">
                <Image
                  alt={alt}
                  {...imageProps}
                  sizes="(max-width: 600px) 100vw, 50vw"
                  style={{ width: "100%", height: "auto", objectFit: "cover" }}
                />
                <figcaption className="gallery__meta">
                  <div>
                    <p className="gallery__meta-title">{photo.title}</p>
                    <p className="gallery__meta-location">{photo.location}</p>
                  </div>
                  <span className="gallery__meta-tag">{photo.vibe}</span>
                </figcaption>
              </figure>
            )}
          />
        </InfiniteScroll>
      </section>

      {/* STYLES */}
      <style jsx>{`
        .gallery {
          min-height: 100vh;
          background: #0d1221;
          color: #f8fbff;
          padding: 48px 16px 64px;
          display: grid;
          gap: 32px;
          justify-items: center;
        }

        .gallery__hero {
          max-width: 880px;
          text-align: center;
          display: grid;
          gap: 12px;
        }

        .gallery__eyebrow {
          margin: 0 auto;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          color: #b6c8ff;
          font-weight: 700;
          text-transform: uppercase;
        }

        .gallery__title {
          margin: 0;
          font-size: clamp(2.5rem, 4vw, 3.4rem);
          font-weight: 800;
        }

        .gallery__lead {
          margin: 0;
          color: #cfd9ff;
          line-height: 1.6;
        }

        .gallery__shell {
          width: 100%;
          max-width: 1180px;
          background: #0b0f1c;
          padding: 20px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .gallery__card {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
        }

        .gallery__meta {
          position: absolute;
          bottom: 0;
          inset-inline: 0;
          padding: 14px 16px;
          display: flex;
          justify-content: space-between;
          background: linear-gradient(
            180deg,
            rgba(6, 10, 21, 0) 0%,
            rgba(6, 10, 21, 0.72) 100%
          );
        }

        .gallery__meta-title {
          margin: 0;
          font-weight: 800;
        }

        .gallery__meta-location {
          margin: 4px 0 0;
          font-size: 0.94rem;
          opacity: 0.9;
        }

        .gallery__meta-tag {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.24);
          font-weight: 700;
        }

        .gallery__status {
          text-align: center;
          padding: 14px;
          font-weight: 700;
          color: #dce6ff;
        }
      `}</style>
    </main>
  );
}
