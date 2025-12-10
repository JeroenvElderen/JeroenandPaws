"use client";

import React, { useEffect, useState, useRef } from "react";
import Masonry from "react-masonry-css";
import { supabase } from "../src/supabaseClient";

const BUCKET = "pet-gallery";

// Fetch Supabase images
async function buildPhoto(file) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(file.name);
  if (!data?.publicUrl) return null;

  return {
    img: data.publicUrl.replace("/object/", "/render/image/"),
    title: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
  };
}

export default function Gallery() {
  const [items, setItems] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.storage.from(BUCKET).list("");
      if (!data || error) return;

      const files = data.filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f.name));

      const photos = (await Promise.all(files.map(buildPhoto))).filter(Boolean);
      setItems(photos);
    }

    load();
  }, []);

  const breakpointColumns = {
    default: 3,
    1100: 3,
    800: 2,
    500: 1,
  };

  // Align first row heights
  useEffect(() => {
  if (!containerRef.current || items.length === 0) return;

    const columns = Object.values(breakpointColumns);
    const imgs = Array.from(containerRef.current.querySelectorAll("img"));
    if (imgs.length === 0) return;

    const handlers = new Map();
    let cancelled = false;

    async function alignAfterLoad() {
      await Promise.all(
        imgs.map(
          (img) =>
            img.complete && img.naturalHeight > 0
              ? Promise.resolve()
              : new Promise((resolve) => {
                  const onLoad = () => {
                    img.removeEventListener("load", onLoad);
                    handlers.delete(img);
                    resolve();
                  };

                  handlers.set(img, onLoad);
                  img.addEventListener("load", onLoad);
                })
        )
      );

      if (cancelled) return;

      // Detect number of columns rendered at current viewport
      const width = window.innerWidth;
      let colCount = columns[0];

      if (width <= 500) colCount = columns[columns.length - 1];
      else if (width <= 800) colCount = columns[columns.length - 2];
      else colCount = columns[0];

      // Select only first-row images
      const firstRow = imgs.slice(0, colCount);
      if (firstRow.length === 0) return;

      // Compute tallest container height after images finish loading
      const maxHeight = Math.max(
        ...firstRow.map((img) => img.parentElement.clientHeight)
      );

      if (!Number.isFinite(maxHeight) || maxHeight === 0) return;

      // Apply alignment to IMAGE CONTAINERS — not images
      firstRow.forEach((img) => {
        const wrapper = img.parentElement;
        wrapper.style.height = `${maxHeight}px`;
        wrapper.style.overflow = "hidden"; // ensures no visual gap
      });
    }

    alignAfterLoad();

    return () => {
      cancelled = true;
      handlers.forEach((handler, img) => img.removeEventListener("load", handler));
    };
  }, [items]);

  return (
    <main
      style={{
        background: "#0d1221",
        minHeight: "100vh",
        padding: "48px 16px 64px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
      }}
    >
      {/* HEADER */}
      <header style={{ textAlign: "center", maxWidth: "900px" }}>
        <h1
          style={{
            fontSize: "42px",
            margin: "0 0 12px",
            color: "#ffffff",
            fontWeight: 700,
            letterSpacing: "1px",
          }}
        >
          Welcome to Jeroen & Paws Gallery
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#b6c8ff",
            lineHeight: 1.6,
          }}
        >
          A curated collection of adventures, loyal clients, and furry friends.
          Enjoy browsing through our memories together.
        </p>
      </header>

      {/* GALLERY */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          maxWidth: "1280px",
          borderRadius: "20px",
          background: "#0b0f1c",
          padding: "16px",
        }}
      >
        <Masonry
          breakpointCols={breakpointColumns}
          className="masonry-grid"
          columnClassName="masonry-column"
        >
          {items.map((item, idx) => (
            <img
              key={item.img + idx}
              src={item.img}
              alt={item.title}
              loading="lazy"
              style={{
                width: "100%",
                display: "block",
                height: "auto",
                objectFit: "contain", // keep full image, no cropping
                borderRadius: "14px", // rounded corners
              }}
            />
          ))}
        </Masonry>
      </div>

      {/* Masonry CSS */}
      <style jsx global>{`
        .masonry-grid {
          display: flex;
          margin-left: -16px;
          width: auto;
        }
        .masonry-column {
          padding-left: 16px;
          background-clip: padding-box;
        }
        .masonry-column > img {
          margin-bottom: 16px;
        }
      `}</style>
    </main>
  );
}
